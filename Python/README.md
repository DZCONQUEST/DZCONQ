# Couche Python de DZ CONQUEST

Ces modules contiennent les premiers calculs métier migrés depuis JavaScript. Ils sont exécutés dans le navigateur avec Pyodide, chargé depuis un CDN : aucune installation locale, aucun serveur Python et aucun logiciel à installer.

- `dz_economy.py` : modificateurs technologiques économiques.
- `dz_military.py` : vitesse moyenne d'une armée.
- `dz_world.py` : résumé de population et score de présence territoriale.
- `dz_runtime.py` : point d'entrée JSON utilisé par le pont JavaScript.

Le rendu Three.js, les animations, les interactions DOM et les fonctions qui manipulent des objets `Mesh` restent en JavaScript. Si Pyodide n'est pas encore prêt ou si le CDN est inaccessible, les fonctions JavaScript d'origine continuent de servir de repli.
