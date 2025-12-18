# Guide d'Implémentation Technique (PollVision)

Voici comment intégrer techniquement vos nouvelles fonctionnalités en utilisant votre infrastructure existante.

---

## 1. Feature : Dynamic Glows (Socket.io)

### 🟢 A. Vote Glow (Flash au vote reçu)

**Côté Serveur (`server.js`) :**
Votre code émet déjà l'événement nécessaire :
```javascript
io.emit("pollUpdated", { sondageId });
```

**Côté Client (`Dashboard.jsx` & `PollCard.jsx`) :**
1.  Dans **`PollCard.jsx`**, ajoutez un état `isGlowing`.
2.  Dans **`Dashboard.jsx`**, lorsque vous recevez `pollUpdated`, identifiez le composant concerné.

```javascript
// Exemple de logique dans Dashboard.jsx
socket.on("pollUpdated", ({ sondageId }) => {
    // Si l'ID correspond à une carte affichée, déclenchez l'effet
    setRecentVotedId(sondageId); 
    setTimeout(() => setRecentVotedId(null), 2000); // Stop après 2s
});
```

**CSS (`index.css`) :**
```css
.glow-vote {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.6); /* Vert émeraude */
    border-color: #10b981 !important;
    transition: all 0.3s ease;
}
```

---

### 🔴 B. Time Pressure Glow (10 minutes restantes)

**Côté Client (`PollCard.jsx`) :**
Calculez le temps restant directement dans le composant.

```javascript
const [isUrgent, setIsUrgent] = useState(false);

useEffect(() => {
    const checkUrgency = () => {
        const now = new Date();
        const diff = new Date(sondage.closingDate) - now;
        const tenMinutes = 10 * 60 * 1000;
        
        if (diff > 0 && diff < tenMinutes) {
            setIsUrgent(true);
        }
    };
    
    const interval = setInterval(checkUrgency, 30000); // Check toutes les 30s
    checkUrgency(); // Check initial
    return () => clearInterval(interval);
}, [sondage.closingDate]);
```

**CSS (`index.css`) :**
```css
@keyframes pulse-red {
    0% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.4); }
    50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.8); }
    100% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.4); }
}

.glow-urgent {
    animation: pulse-red 1.5s infinite;
    border-color: #ef4444 !important;
}
```

---

## 2. Feature : Modération par IA (Gemini API)

**Côté Serveur (`server.js`) :**

1.  **Installation** : `npm install @google/generative-ai`
2.  **Configuration** :
```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("VOTRE_CLÉ_API");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Dans la route POST /api/sondages :
app.post("/api/sondages", verifyToken, async (req, res) => {
    const { question, options } = req.body;
    
    // 1. Appel à l'IA
    const prompt = `Modération de contenu. Est-ce que ce sondage est inapproprié ? 
                   Question: ${question}. Options: ${options.join(', ')}. 
                   Réponds uniquement par SAFE ou UNSAFE.`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (text.includes("UNSAFE")) {
        return res.status(400).json({ error: "Contenu inapproprié détecté par l'IA." });
    }

    // 2. Si SAFE, procédez à l'insertion MongoDB habituelle...
});
```

---

### 💡 Pourquoi le faire ainsi ?
*   **Performance** : Le calcul du temps restant est fait par le client (pas de surcharge serveur).
*   **Réactivité** : On réutilise vos événements Socket.io déjà en place pour la lumière.
*   **Sécurité** : La modération se fait *avant* que la donnée ne touche la base de données.
