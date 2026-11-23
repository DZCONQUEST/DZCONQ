# Modules Python de DZ CONQUEST

Répertoire réservé aux calculs métier purs qui seront exécutés dans le navigateur avec Pyodide depuis un CDN.

Aucun fichier Python n'est encore chargé par `index.html` dans cette version. C'est volontaire : les modules actuels partagent l'état synchrone `window.DZ`. La migration doit inclure un pont JavaScript/Python testé et un mécanisme de secours pour ne pas rendre le jeu dépendant d'une initialisation Python non terminée.

Candidats à évaluer en premier : calculs statistiques d'IA et simulations de règles isolées. Le combat temps réel, les déplacements et toute logique liée aux objets Three.js restent côté JavaScript.
