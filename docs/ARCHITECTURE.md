# Architecture V3.0
Le package `Python` est chargé dans Pyodide puis importé comme `Python.main`. Les appels de commandes passent par `game.command`; l'état Python est la source de vérité. Les modules `Engine` ne contiennent que la présentation et les interactions. Les catalogues `data` sont des données de présentation/référence ; les règles exécutées sont centralisées dans les modules Python.
