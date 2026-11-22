# Guide de l'administrateur — Site Kalamu

Ce guide explique comment mettre à jour le site **sans toucher au code**.

## Se connecter

1. Ouvrez **https://kalamu-association.netlify.app/admin**
2. Cliquez sur **« Se connecter avec Netlify Identity »**, puis entrez votre e-mail et votre mot de passe.
3. Mot de passe oublié ? Cliquez sur « Mot de passe oublié » dans la même fenêtre.

> Les visiteurs ne voient jamais cet espace. Seules les personnes invitées peuvent s'y connecter.

## Ce que vous pouvez modifier

| Rubrique | Ce qu'elle contient |
|---|---|
| **Événements** | Une carte par événement : titre, date(s), lieu, description, affiche |
| **Bibliothèque** | Une carte par livre : titre, auteur, catégorie, couverture, résumé |
| **Membres** | Une carte par membre du bureau : nom, rôle, photo |
| **Paramètres** | Coordonnées et réseaux sociaux, photo de groupe du bureau |

## Ajouter un événement

1. Cliquez sur **Événements** dans le menu de gauche.
2. Cliquez sur le bouton orange **« + Événement »**.
3. Remplissez le titre, la date (et la date de fin si l'événement dure plusieurs jours), le lieu et la description.
4. Pour l'affiche : **« Choisir une image »** → **« Téléverser »** → choisissez l'image sur votre téléphone ou ordinateur.
5. Cliquez sur **« Publier »** (en haut), puis **« Publier maintenant »**.

Le site est mis à jour en **1 à 2 minutes**.

**Pas besoin de déplacer les anciens événements** : dès que la date est passée, l'événement passe tout seul dans « Événements passés » sur le site.

## Modifier ou supprimer

- **Modifier** : cliquez sur la carte, changez ce qu'il faut, puis **Publier** → **Publier maintenant**.
- **Supprimer** : ouvrez la carte, puis cliquez sur **« Supprimer l'entrée »** en haut.

## Ajouter ou modifier un livre

1. **Bibliothèque** → bouton orange **« + Livre »** (ou cliquez sur un livre existant).
2. Choisissez la **catégorie** : Publications Kalamu, Classiques, Contemporains ou Jeunesse.
3. Cases à cocher utiles :
   - **Afficher sur la page d'accueil** : les 4 premiers livres cochés apparaissent sur l'accueil.
   - **Afficher dans le grand carrousel** : le livre défile en grand en haut de la page Bibliothèque.
   - **Livre à paraître** : affiche « À paraître » à la place de l'auteur.
4. **Ordre d'affichage** : plus le nombre est petit, plus le livre apparaît tôt (10, 20, 30…).
5. **Publier** → **Publier maintenant**.

## Newsletter et messages reçus

Le formulaire « Écrivez-nous » et l'inscription à la newsletter de la page Contact fonctionnent une fois le site publié sur Netlify (pas en local).

1. Connectez-vous à **Netlify** (app.netlify.com) et ouvrez le site Kalamu.
2. Menu **Forms** : deux formulaires apparaissent, **contact** (messages) et **newsletter** (adresses e-mail des inscrits).
3. Cliquez sur un formulaire pour lire les envois ; le bouton **Export CSV** télécharge la liste des inscrits.
4. Pour être prévenu par e-mail à chaque nouvelle inscription ou message : **Forms › Form notifications › Add notification › Email notification**.

Pour envoyer une newsletter, importez le fichier CSV dans un outil d'envoi (Brevo, Mailchimp…) et n'envoyez qu'aux personnes qui se sont inscrites.

## Astuces

- **Trier / Grouper / Filtrer** (en haut à droite des cartes) : par exemple, grouper les livres par catégorie ou n'afficher que ceux de la page d'accueil.
- **Affichage en liste** : les deux petits boutons à droite permettent de passer des cartes à une liste simple.

## En cas d'erreur

Chaque publication est enregistrée. Si quelque chose ne va pas, prévenez la personne qui gère le site technique : elle peut revenir à la version précédente en quelques clics.

## Conseils pour les images

- Formats : **JPG** ou **PNG**.
- Taille conseillée : moins de **500 Ko** par image, pour que le site reste rapide sur mobile.
