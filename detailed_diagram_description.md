# Informations Détaillées pour la Création de Diagrammes (Spécification Technique)

Utilisez les descriptions ci-dessous pour demander à Gemini (ou tout autre LLM) de générer vos diagrammes.

---

## 1. Description pour le Diagramme de Classe

**Contexte :** Application de vote web "PollVision" utilisant Node.js (Express), MongoDB et Socket.io.

**Classes et Attributs :**

1.  **Classe `User` (Utilisateur) :**
    *   `_id` : Identifiant unique (ObjectId).
    *   `nomUtilisateur` : Nom utilisé pour la connexion (String).
    *   `motDePasse` : Hash du mot de passe (String).
    *   `email` : Adresse email (String).
    *   `fullName` : Nom complet (String).
    *   `role` : Rôle de l'utilisateur ("admin" ou "utilisateur").
    *   `dateCreation` : Date d'inscription (Date).
    *   *Méthodes* : `register()`, `login()`.

2.  **Classe `Poll` (Sondage) :**
    *   `_id` : Identifiant unique (ObjectId).
    *   `question` : Intitulé de la question (String).
    *   `options` : Liste d'objets `Option` (Array).
    *   `createdBy` : Nom du créateur (String).
    *   `createdById` : ID du créateur pour les droits (ObjectId).
    *   `status` : État actuel ("open" ou "closed").
    *   `dateCreation` : Date de création (Date).
    *   `closingDate` : Date de fermeture automatique (Date, optionnelle).
    *   *Méthodes* : `create()`, `close()`, `delete()`, `reopen()`.

3.  **Classe `Option` (Option de vote) :**
    *   `label` : Libellé de l'option (String).
    *   `votes` : Compteur de votes (Integer).

4.  **Classe `Vote` (Lien de vote) :**
    *   `_id` : Identifiant unique (ObjectId).
    *   `userId` : Référence à l'utilisateur qui a voté (ObjectId).
    *   `sondageId` : Référence au sondage (ObjectId).
    *   `optionIndex` : Index de l'option choisie (Integer).
    *   `date` : Date du vote (Date).

**Relations :**
*   Un **User** peut créer **plusieurs Polls** (1 à 0..*).
*   Un **User** peut effectuer **plusieurs Votes** (1 à 0..*), mais un seul par sondage (contrainte d'index unique).
*   Un **Poll** contient **plusieurs Options** (composition 1 à 1..*).
*   Un **Poll** reçoit **plusieurs Votes** (1 à 0..*).

---

## 2. Description pour le Diagramme d'Activité

**Processus : Cycle de vie du Vote d'un Utilisateur**

1.  **Démarrage** : L'utilisateur arrive sur l'application.
2.  **Action** : S'authentifier (Login).
3.  **Décision** : L'authentification a-t-elle réussi ?
    *   *Si Non* : Afficher une erreur et revenir au Login ou s'arrêter.
    *   *Si Oui* : Accéder au Dashboard.
4.  **Action** : Consulter la liste des sondages disponibles.
5.  **Action** : Sélectionner un sondage spécifique.
6.  **Décision** : Le sondage est-il ouvert ?
    *   *Si Non* : Afficher uniquement les résultats (lecture seule).
    *   *Si Oui* : Passer à l'étape suivante.
7.  **Décision** : L'utilisateur a-t-il déjà voté pour ce sondage ?
    *   *Si Oui* : Afficher les résultats actuels.
    *   *Si Non* : Afficher le formulaire de vote.
8.  **Action** : Sélectionner une option de vote.
9.  **Action** : Soumettre le vote.
10. **Système** : Enregistrer le vote en base de données et incrémenter le compteur de l'option.
11. **Système** : Notifier les autres utilisateurs en temps réel (via Socket.io).
12. **Fin** : Afficher la confirmation et revenir au Dashboard.
