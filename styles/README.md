# DZ CONQUEST — Version 2.0

Jeu de stratégie territorial 3D jouable dans un navigateur, construit sur Three.js et JavaScript. Le projet conserve la carte et le moteur 3D de la version fournie, puis ajoute une couche de systèmes stratégiques.

## Démarrage

- Hébergement statique compatible GitHub Pages.
- Ouvrir `index.html` depuis un serveur web statique (GitHub Pages recommandé).
- Aucune installation de logiciel n'est requise sur le PC.
- Three.js et ses contrôles sont chargés depuis un CDN : une connexion Internet est nécessaire.

## Contenu de la version 2.0

- Conservation de la carte algérienne, du terrain, des ressources, des unités, bâtiments et systèmes existants.
- Interface stratégique complémentaire avec dock inférieur et fenêtres redessinées.
- Marché : achat et vente de ressources avec prix distincts et transactions par lots de 100.
- Diplomatie : postures de paix, commerce, défense et mobilisation ; pacte de non-agression payant.
- Conseil du royaume : réglages de fiscalité, rations et priorité de travail.
- Commandement militaire : choix de formations (ligne, défensive, colonne, coin).
- Chroniques : journal local des événements et frise des âges définis dans `data/eras.js`.
- Paramètres stratégiques sauvegardés localement dans le navigateur et associés à la sauvegarde existante.
- Mise à jour visuelle : panneaux sombres, bordures dorées, transparence, dock responsive et fenêtres modales.

## Architecture

- `Engine/` : moteur du jeu et systèmes de stratégie.
- `data/` : données de la carte, ressources, bâtiments, unités, technologies et âges.
- `styles/` : styles de l'interface.
- `assets/` : relief de l'Algérie.
- `Engine/dz_expansion_v2.js` : nouveaux systèmes de stratégie de la version 2.0.
- `styles/dz_v2.css` : nouvelle couche graphique.

## Notes de périmètre

Cette version enrichit le jeu avec des mécaniques inspirées des jeux de stratégie historiques (gestion, commerce, diplomatie, commandement et progression par âges). Elle ne reproduit pas les contenus propriétaires, campagnes, civilisations, cartes, unités ou interfaces complètes d'Age of Empires, 0 A.D. ou Civilization. Les systèmes multijoueur, serveur persistant, diplomatie avec joueurs réels et IA stratégique avancée ne sont pas inclus dans cette édition navigateur.

## Version

`2.0.0` — 23 novembre 2026.
