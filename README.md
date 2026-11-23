# DZ CONQUEST V3.0

Base de développement V3.0 issue de l'archive V2.0 fournie. Le projet adopte une architecture hybride :
- **Python / Pyodide** : état du monde, économie, population, villes, bâtiments, armées, combats, diplomatie, commerce, conquête et IA.
- **JavaScript / Three.js** : rendu 3D, caméra, interactions et interface.

## Lancement
1. Décompresser le dossier.
2. Ouvrir le dossier avec un serveur HTTP statique (GitHub Pages fonctionne).
3. Ouvrir `index.html`. Une connexion Internet est requise pour charger Three.js et Pyodide depuis leurs CDN.
4. Cliquer sur **Nouvelle partie**, choisir un nom et cliquer sur un emplacement de terrain pour établir le camp initial.

Un navigateur moderne avec WebGL est recommandé. L'exécution Python se fait côté navigateur ; aucun serveur Python local n'est requis.

## État réel de cette livraison
Cette archive est une **base V3.0 jouable et extensible**, pas la réalisation exhaustive de chaque fonction décrite dans le cahier des charges. Sont opérationnels dans cette base : initialisation du monde, deux personnages visuels, ressources initiales, simulation économique simple, travailleurs, construction de maisons/fermes/scieries/mines/palais, population et capacité de logement, recrutement, déplacement d'armée, résolution de combat simplifiée, diplomatie de base, sauvegarde locale et adversaires IA autonomes (économie, construction, expansion et militaire élémentaires).

Les systèmes avancés (géographie algérienne haute fidélité, pathfinding complet, animation de personnages détaillée, arbre technologique exhaustif, marché dynamique complet, diplomatie conditionnelle avancée, événements systémiques, optimisation multi-worker et équilibrage final) restent à développer.

## Structure
- `Python/` : modules métier indépendants.
- `Engine/` : moteur Three.js et pont Python/JavaScript.
- `data/` : catalogues de données.
- `styles/` : interface.
- `assets/` : ressources graphiques reprises de V2.
- `legacy_v2/` : copie de référence des anciens fichiers V2, non chargée par V3.

## Principes V3
- Aucune wilaya ni division administrative n'est utilisée comme territoire de gameplay.
- Les positions de départ sont choisies librement sur les zones constructibles.
- Le contrôle territorial est dynamique et rattaché aux civilisations.
- Python est la source de vérité des règles et des calculs.
- Le joueur et l'IA utilisent les mêmes règles fondamentales.

Version `3.0.0` — 23 novembre 2026.
