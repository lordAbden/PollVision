# Diagrammes du Projet PollVision

Ce document contient les diagrammes de classe et d'activité pour le rapport de projet.

## 1. Diagramme de Classe

Le diagramme de classe suivant modélise les entités principales de l'application et leurs relations, basé sur l'implémentation MongoDB et Node.js.

```mermaid

```

---

## 2. Diagramme d'Activité

Le diagramme d'activité suivant illustre le flux principal d'un utilisateur, de l'authentification au vote ou à la création de sondage.

### Flux Utilisateur (Vote)

```mermaid
stateDiagram-v2
    [*] --> Connexion
    Connexion --> Authentification
    Authentification --> Dashboard : Succès
    Authentification --> Connexion : Échec

    Dashboard --> ListeSondages : Consulter
    ListeSondages --> VerifierVote : Sélectionner Sondage
    
    state VerifierVote <<choice>>
    VerifierVote --> VoirResultats : Déjà voté / Fermé
    VerifierVote --> Voter : Pas encore voté & Ouvert

    Voter --> EnregistrerVote
    EnregistrerVote --> Dashboard
    VoirResultats --> Dashboard
```

### Flux Création de Sondage (Admin/Propriétaire)

```mermaid
stateDiagram-v2
    [*] --> Dashboard
    Dashboard --> FormulaireCreation : Cliquer "Créer Sondage"
    FormulaireCreation --> ValidationDonnees : Soumettre
    
    state ValidationDonnees <<choice>>
    ValidationDonnees --> EnregistrerSondage : Valide
    ValidationDonnees --> FormulaireCreation : Invalide

    EnregistrerSondage --> NotificationSocket : Émettre pollListUpdated
    NotificationSocket --> Dashboard
```

---

## 3. Diagramme de Cas d'Utilisation (Bonus)

```mermaid
graph TD
    User((Utilisateur))
    Admin((Administrateur))

    User --> Login[S'authentifier]
    User --> Browse[Consulter les sondages]
    User --> Vote[Voter]
    User --> History[Consulter son historique]
    User --> Create[Créer un sondage]

    Admin --> Manage[Gérer tous les sondages]
    Admin --> Close[Fermer un sondage]
    Admin --> Delete[Supprimer un sondage]
    Admin --> ViewStats[Voir les détails des votes]

    Manage --- Admin
    Admin --|> User
```

---

## 4. Diagramme de Classe (PlantUML)

Copiez ce code dans [PlantText](https://www.planttext.com/) ou un éditeur PlantUML.

```plantuml
@startuml Diagramme_Classes_PollVision

skinparam classAttributeIconSize 0
skinparam packageStyle rectangle
skinparam roundcorner 5

class User {
    +ObjectId _id
    +String nomUtilisateur
    +String motDePasse
    +String email
    +String role
    +Date dateCreation
    +register()
    +login()
}

class Poll {
    +ObjectId _id
    +String question
    +Option[] options
    +String createdBy
    +ObjectId createdById
    +String status
    +Date dateCreation
    +Date closingDate
    +create()
    +close()
    +delete()
}

class Option {
    +String label
    +Integer votes
}

class Vote {
    +ObjectId _id
    +ObjectId userId
    +ObjectId sondageId
    +Integer optionIndex
    +Date date
}

User "1" -- "0..*" Poll : crée >
User "1" -- "0..*" Vote : effectue >
Poll "1" *-- "1..*" Option : contient >
Poll "1" -- "0..*" Vote : reçoit >

@enduml
```

---

## 5. Diagramme d'Activité (PlantUML)

```plantuml
@startuml Diagramme_Activite_Vote

skinparam activityShape roundBox
skinparam packageStyle rectangle

start
:S'authentifier;
if (Succès ?) then (Oui)
    :Accéder au Dashboard;
    :Consulter la liste des sondages;
    :Sélectionner un sondage;
    if (Sondage ouvert ?) then (Oui)
        if (Déjà voté ?) then (Non)
            :Sélectionner une option;
            :Soumettre le vote;
            :Confirmation du vote;
        else (Oui)
            :Afficher les résultats;
        endif
    else (Non)
        :Afficher les résultats (clos);
    endif
else (Non)
    :Afficher message d'erreur;
    stop
endif
:Retour au Dashboard;
stop

@enduml
```
