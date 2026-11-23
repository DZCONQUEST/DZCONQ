# DZ CONQUEST — Architecture technique

## Contraintes d'exécution
- Développement et versionnement : GitHub.
- Hébergement cible : GitHub Pages (site statique).
- Utilisation : navigateur uniquement, sans installation locale.
- Rendu 3D et interface : JavaScript + Three.js.

## Répartition retenue

### JavaScript (conservé dans cette version)
Tout ce qui dépend directement du navigateur, du DOM, de Three.js, des animations, des événements, du stockage local et de l'état temps réel du jeu reste en JavaScript.

### Python (migration différée)
Le dossier `Python/` est réservé aux calculs métier autonomes qui pourront être exécutés dans le navigateur via Pyodide, chargé depuis un CDN. Aucun serveur Python local ou logiciel à installer ne sera requis.

La migration Python n'est pas activée dans cette version : le moteur actuel utilise un état global synchrone (`window.DZ`) et plusieurs modules JavaScript s'appellent directement. Ajouter Pyodide sans adapter et tester ces échanges pourrait bloquer le démarrage ou casser des fonctionnalités. Les règles restent donc inchangées dans cette livraison.

## Modules volumineux identifiés
- `Engine/dz_units.js` : 1 429 lignes — représentation 3D, missions, déplacements, collisions et barres de vie. À découper après séparation des dépendances privées.
- `Engine/dz_main.js` : 680 lignes — démarrage, événements UI et boucle principale. À découper par responsabilité.
- `Engine/dz_core.js` : 325 lignes — initialisation de la scène et caméra.
- `Engine/dz_buildings.js` : 308 lignes — construction et logique associée.
- `Engine/dz_hud.js` : 282 lignes — interface et minim carte.

## Règles de modification
1. Ne pas migrer le rendu 3D, DOM ou caméra en Python.
2. Migrer uniquement des calculs indépendants de Three.js et du DOM.
3. Garder un mode de secours JavaScript pendant la migration.
4. Ne pas charger Pyodide tant qu'un module Python réellement utilisé n'est prêt.
5. Vérifier le démarrage, les sauvegardes, les unités, les constructions et la boucle de jeu après chaque étape.
6. Ne supprimer aucune règle ou fonctionnalité existante sans validation.

## État de cette livraison
Cette archive conserve les fichiers et le comportement du projet source. Elle ajoute cette documentation et prépare le répertoire Python ; elle ne prétend pas avoir migré des fonctionnalités qui ne sont pas encore raccordées au moteur.
