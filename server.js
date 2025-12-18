const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config(); // Load environment variables
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
})); // Enable CORS for REST API
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(express.json());

// CONFIG
const uri = "mongodb://127.0.0.1:27017"; // FORCE IPv4
const client = new MongoClient(uri);
const JWT_SECRET = "secret_scolaire_super_securise";

// Initialize Gemini AI for content moderation
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using Flash for speed

let db, utilisateursCollection, sondageCollection, votesCollection;

async function start() {
  try {
    await client.connect();
    console.log("✅ Connecté à MongoDB");
    db = client.db("ApplicationVote");
    utilisateursCollection = db.collection("utilisateurs");
    sondageCollection = db.collection("sondage");
    votesCollection = db.collection("votes");

    // Index unique pour empêcher double vote
    try {
      await votesCollection.createIndex({ userId: 1, sondageId: 1 }, { unique: true });
    } catch (e) {
      console.log("Note: Index de vote déjà présent ou conflit mineur.");
    }

    // Auto-Close Job (Every Minute)
    setInterval(async () => {
      try {
        const now = new Date();
        const result = await sondageCollection.updateMany(
          { status: "open", closingDate: { $ne: null, $lt: now } },
          { $set: { status: "closed" } }
        );

        if (result.modifiedCount > 0) {
          console.log(`⏰ ${result.modifiedCount} sondages fermés automatiquement.`);
          io.emit("pollListUpdated");
        }
      } catch (err) {
        console.error("Erreur Auto-Close:", err);
      }
    }, 60000); // 60 seconds

    // SEED DATA SI VIDE
    const nbSondages = await sondageCollection.countDocuments();
    if (nbSondages === 0) {
      console.log("Création des sondages par défaut...");
      await sondageCollection.insertMany([
        {
          question: "Quel est votre langage préféré ?",
          options: [
            { label: "JavaScript / Node.js", votes: 0 },
            { label: "Python", votes: 0 },
            { label: "Java", votes: 0 },
            { label: "C#", votes: 0 },
          ],
          dateCreation: new Date()
        },
        {
          question: "Pain au chocolat ou Chocolatine ?",
          options: [
            { label: "Pain au chocolat", votes: 0 },
            { label: "Chocolatine", votes: 0 },
          ],
          dateCreation: new Date()
        }
      ]);
    }

    server.listen(3000, () => {
      console.log("🚀 Serveur Socket.io lancé sur http://localhost:3000");
    });
  } catch (err) {
    console.error("Erreur de connexion Mongo:", err);
  }
}

start();

// MIDDLEWARES
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ error: "Token manquant" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Token invalide" });
    req.user = decoded;
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Accès refusé : Administrateur requis" });
  }
  next();
};

// ROUTES AUTH
app.post("/api/register", async (req, res) => {
  try {
    const { nomUtilisateur, motDePasse, email, fullName } = req.body;
    if (!nomUtilisateur || !motDePasse) {
      return res.status(400).json({ error: "Champs requis" });
    }

    const existingUser = await utilisateursCollection.findOne({ nomUtilisateur });
    if (existingUser) {
      return res.status(409).json({ error: "Utilisateur déjà existant" });
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    // AUTO-ADMIN: Si le nom est "admin", on lui donne le rôle admin
    const role = nomUtilisateur === "admin" ? "admin" : "utilisateur";

    const userDoc = {
      nomUtilisateur,
      motDePasse: hashedPassword,
      email: email || "",
      fullName: fullName || "",
      role,
      dateCreation: new Date(),
    };

    const result = await utilisateursCollection.insertOne(userDoc);
    res.status(201).json({
      message: "Utilisateur enregistré avec succès",
      userId: result.insertedId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { nomUtilisateur, motDePasse } = req.body;
    const user = await utilisateursCollection.findOne({ nomUtilisateur });

    if (!user) {
      return res.status(401).json({ error: "Utilisateur inconnu" });
    }

    const match = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!match) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        nomUtilisateur: user.nomUtilisateur,
        fullName: user.fullName || "", // Add fullName to token
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Connexion réussie",
      token,
      user: {
        userId: user._id, // Critical: Needed for frontend ownership checks
        nomUtilisateur: user.nomUtilisateur,
        fullName: user.fullName, // Send it back too just in case
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ROUTES SONDAGES (PUBLIQUES / UTILISATEUR)
app.get("/api/sondages", verifyToken, async (req, res) => {
  try {
    const sondages = await sondageCollection.find().toArray();

    // Récupérer les ID des sondages votés par l'user
    let votedSondageIds = [];
    if (req.user && req.user.userId) {
      try {
        const userVotes = await votesCollection.find({ userId: new ObjectId(req.user.userId) }).toArray();
        votedSondageIds = userVotes.map(v => v.sondageId.toString());
      } catch (e) {
        console.error("Error fetching user votes:", e);
      }
    }

    res.json({ sondages, votedSondageIds });
  } catch (error) {
    console.error("❌ ERREUR GET /api/sondages:", error);
    console.error("User Context:", req.user);
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
});

app.get("/api/sondages/:id/details", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const poll = await sondageCollection.findOne({ _id: new ObjectId(id) });
    if (!poll) return res.status(404).json({ error: "Sondage introuvable" });

    const votes = await votesCollection.find({ sondageId: new ObjectId(id) }).toArray();

    // Enrich votes with user details
    const votesWithUser = await Promise.all(votes.map(async (vote) => {
      const user = await utilisateursCollection.findOne({ _id: new ObjectId(vote.userId) });
      return {
        _id: vote._id,
        user: user ? (user.fullName || user.nomUtilisateur) : "Utilisateur Inconnu",
        optionLabel: poll.options[vote.optionIndex].label,
        date: vote.date
      };
    }));

    res.json({ poll, votes: votesWithUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/api/user/votes", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userVotes = await votesCollection.find({ userId: new ObjectId(userId) }).sort({ date: -1 }).toArray();

    // Enrich with poll details
    const history = await Promise.all(userVotes.map(async (vote) => {
      const poll = await sondageCollection.findOne({ _id: new ObjectId(vote.sondageId) });
      if (!poll) return null; // Poll might be deleted

      return {
        _id: vote._id,
        pollQuestion: poll.question,
        choiceLabel: poll.options[vote.optionIndex].label,
        date: vote.date,
        sondageId: poll._id,
        status: poll.status
      };
    }));

    // Filter out nulls (deleted polls)
    res.json({ history: history.filter(h => h !== null) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/api/vote", verifyToken, async (req, res) => {
  try {
    const { sondageId, optionIndex } = req.body;
    const userId = req.user.userId;

    const existingVote = await votesCollection.findOne({
      userId: new ObjectId(userId),
      sondageId: new ObjectId(sondageId)
    });

    if (existingVote) {
      return res.status(403).json({ error: "Vous avez déjà voté pour ce sondage" });
    }

    await votesCollection.insertOne({
      userId: new ObjectId(userId),
      sondageId: new ObjectId(sondageId),
      optionIndex,
      date: new Date()
    });

    const updateKey = `options.${optionIndex}.votes`;
    await sondageCollection.updateOne(
      { _id: new ObjectId(sondageId) },
      { $inc: { [updateKey]: 1 } }
    );

    // Emit real-time update
    // We need the new vote count, so simpler to just tell clients to refetch or send the increment
    // Let's send a generic "refreshPoll" event efficiently
    io.emit("pollUpdated", { sondageId });

    res.json({ message: "Vote pris en compte" });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(403).json({ error: "Déjà voté (doublon détecté)" });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ROUTES ADMIN (CREATE / DELETE)
app.post("/api/sondages", verifyToken, async (req, res) => {
  try {
    const { question, options, closingDate } = req.body;
    // Validation basique
    if (!question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: "Question et au moins 2 options requises" });
    }

    // AI Moderation with Gemini
    try {
      const optionsText = options.join(", ");
      const prompt = `Tu es un modérateur de sondages. Analyse la question et les options suivantes. 
Réponds uniquement par 'SAFE' si le contenu est acceptable, ou 'UNSAFE' s'il contient des insultes, de la haine, du contenu explicite ou inapproprié.
Question : ${question}
Options : ${optionsText}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim().toUpperCase();

      if (responseText.includes("UNSAFE")) {
        console.log(`🚫 Sondage rejeté par l'IA - Question: "${question}"`);
        return res.status(400).json({
          error: "Votre sondage a été rejeté par notre système de modération IA pour contenu inapproprié."
        });
      }

      console.log(`✅ Sondage approuvé par l'IA - Question: "${question}"`);
    } catch (aiError) {
      console.error("⚠️ Erreur Gemini AI:", aiError.message);
      // Fail-safe: Allow poll creation if AI service fails
      console.log("⚠️ Modération IA échouée, création du sondage autorisée (fail-safe)");
    }

    // Formatage des options
    const formattedOptions = options.map(label => ({ label, votes: 0 }));

    // Use Full Name if available, otherwise fallback to Username
    const creatorName = req.user.fullName ? req.user.fullName : req.user.nomUtilisateur;

    const newPoll = {
      question,
      options: formattedOptions,
      createdBy: creatorName,
      createdById: req.user.userId, // Link to creator
      status: "open", // Default status
      dateCreation: new Date(),
      closingDate: closingDate ? new Date(closingDate) : null
    };

    const result = await sondageCollection.insertOne(newPoll);

    io.emit("pollListUpdated"); // Notify all clients to refresh list

    res.status(201).json({ message: "Sondage créé", id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.patch("/api/sondages/:id/status", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "open" or "closed"

    if (!["open", "closed"].includes(status)) {
      return res.status(400).json({ error: "Statut invalide" });
    }

    const poll = await sondageCollection.findOne({ _id: new ObjectId(id) });
    if (!poll) return res.status(404).json({ error: "Sondage introuvable" });

    // Allow if Admin OR Owner
    const isOwner = poll.createdById && poll.createdById === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Action non autorisée" });
    }

    const updateFields = { status };
    if (status === "open") {
      updateFields.wasReopened = true;
    }

    await sondageCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    io.emit("pollUpdated", { sondageId: id });
    io.emit("pollListUpdated");

    res.json({ message: `Sondage ${status === 'open' ? 'ouvert' : 'fermé'}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.delete("/api/sondages/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const poll = await sondageCollection.findOne({ _id: new ObjectId(id) });
    if (!poll) return res.status(404).json({ error: "Sondage introuvable" });

    // Allow if Admin OR Owner
    const isOwner = poll.createdById && poll.createdById === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Action non autorisée" });
    }

    await sondageCollection.deleteOne({ _id: new ObjectId(id) });
    // Cleanup des votes orphelins
    await votesCollection.deleteMany({ sondageId: new ObjectId(id) });

    io.emit("pollListUpdated");

    res.json({ message: "Sondage supprimé" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
