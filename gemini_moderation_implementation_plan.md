# Plan d'Implémentation : Modération par IA (Gemini)

Ce document détaille les étapes techniques pour intégrer la modération automatique des sondages via l'API Google Gemini.

## 📋 Prérequis
1. **Clé API Gemini** : Obtenez une clé API sur [Google AI Studio](https://aistudio.google.com/).
2. **Dépendance** : Installer le SDK Google AI pour Node.js.

## 🛠️ Étapes d'Implémentation

### 1. Installation du SDK
Exécuter la commande suivante à la racine du projet :
```bash
npm install @google/generative-ai
```

### 2. Configuration du Serveur (`server.js`)
Importer le SDK et initialiser le modèle Gemini Pro.

```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Utilisation de Flash pour la rapidité
```

### 3. Logique de Modération dans la Route POST `/api/sondages`
Insérer l'appel à l'IA juste après la validation basique des données.

**Prompt suggéré :**
> "Tu es un modérateur de sondages. Analyse la question et les options suivantes. 
> Réponds uniquement par 'SAFE' si le contenu est acceptable, ou 'UNSAFE' s'il contient des insultes, de la haine, du contenu explicite ou inapproprié.
> Question : [QUESTION]
> Options : [OPTIONS]"

**Code à intégrer :**
```javascript
// Avant l'insertion en DB
try {
    const prompt = `Modération de sondage. Réponds par SAFE ou UNSAFE. 
                   Question: ${question}. Options: ${options.items.join(", ")}`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim().toUpperCase();

    if (responseText.includes("UNSAFE")) {
        return res.status(400).json({ 
            error: "Votre sondage a été rejeté par notre système de modération IA pour contenu inapproprié." 
        });
    }
} catch (aiError) {
    console.error("Erreur Gemini:", aiError);
    // Optionnel : Laisser passer si l'IA échoue (Fail-safe)
}
```

## 🧪 Plan de Test
1. **Test Positif** : Créer un sondage sur les "Langages de programmation". Succès attendu.
2. **Test Négatif** : Créer un sondage contenant des insultes ou du contenu haineux. Échec attendu avec le message d'erreur personnalisé.
3. **Test Format** : Vérifier que les options sont correctement transmises à l'IA.

## ⚠️ Considérations de Sécurité
- Ne jamais coder la clé API en dur. Utiliser un fichier `.env`.
- Gérer les quotas d'API pour éviter les interruptions de service.
