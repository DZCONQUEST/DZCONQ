```javascript
/* ============================================================
   DZ CONQUEST V3.0
   PYTHON BRIDGE
   Liaison entre JavaScript, Three.js et Python / Pyodide
   ============================================================ */

window.DZ = window.DZ || {};

DZ.bridge = {

    pyodide: null,
    world: null,
    ready: false,
    initializing: false,

    /* ========================================================
       CONFIGURATION
       ======================================================== */

    PYTHON_ROOT: "/home/pyodide/Python",

    files: [
        "main.py",
        "world.py",
        "players.py",
        "cities.py",
        "buildings.py",
        "population.py",
        "economy.py",
        "resources.py",
        "workers.py",
        "territories.py",
        "infrastructure.py",
        "technologies.py",
        "eras.py",
        "units.py",
        "armies.py",
        "movement.py",
        "combat.py",
        "conquest.py",
        "diplomacy.py",
        "trade.py",
        "events.py",
        "save_manager.py",

        "AI/ai_core.py",
        "AI/ai_decision.py",
        "AI/ai_economy.py",
        "AI/ai_construction.py",
        "AI/ai_expansion.py",
        "AI/ai_military.py",
        "AI/ai_diplomacy.py",
        "AI/ai_exploration.py",
        "AI/ai_strategy.py",
        "AI/ai_difficulty.py"
    ],

    /* ========================================================
       INITIALISATION
       ======================================================== */

    async init() {

        if (this.ready) return true;

        if (this.initializing) {
            throw new Error("Initialisation déjà en cours.");
        }

        this.initializing = true;

        const status = document.getElementById("loading-status");

        const updateStatus = (message) => {
            if (status) status.textContent = message;
        };

        try {

            /* 1. Vérifier Pyodide */

            updateStatus("Chargement de Pyodide…");

            if (typeof loadPyodide !== "function") {
                throw new Error(
                    "Pyodide n'est pas chargé. Vérifie index.html."
                );
            }

            this.pyodide = await loadPyodide();

            /* 2. Préparer le système de fichiers */

            this.pyodide.FS.mkdirTree(
                this.PYTHON_ROOT + "/AI"
            );

            /* 3. Déterminer le chemin du dossier Python */

            const bridgeScript = document.querySelector(
                'script[src*="dz_python_bridge.js"]'
            );

            if (!bridgeScript) {
                throw new Error(
                    "Impossible de localiser dz_python_bridge.js."
                );
            }

            const baseURL = new URL(
                "../Python/",
                bridgeScript.src
            );

            /* 4. Télécharger les modules Python */

            for (const file of this.files) {

                updateStatus("Chargement Python : " + file);

                const url = new URL(file, baseURL);

                let response;

                try {

                    response = await fetch(url.href);

                } catch (error) {

                    throw new Error(
                        "Échec réseau pendant le chargement de " +
                        file + " : " + error.message
                    );

                }

                if (!response.ok) {

                    throw new Error(
                        "Fichier Python introuvable : " +
                        file +
                        " (HTTP " + response.status + ")"
                    );

                }

                const content = await response.text();

                const destination =
                    this.PYTHON_ROOT + "/" + file;

                const directory = destination.substring(
                    0,
                    destination.lastIndexOf("/")
                );

                this.pyodide.FS.mkdirTree(directory);

                this.pyodide.FS.writeFile(
                    destination,
                    content
                );

            }

            /* 5. Configurer Python */

            updateStatus("Configuration du moteur Python…");

            this.pyodide.runPython(`
import sys

if "/home/pyodide" not in sys.path:
    sys.path.insert(0, "/home/pyodide")

if "/home/pyodide/Python" not in sys.path:
    sys.path.insert(0, "/home/pyodide/Python")
`);

            /* 6. Importer le moteur principal */

            updateStatus("Initialisation du moteur DZ CONQUEST…");

            this.pyodide.runPython(`
import main as game
`);

            this.ready = true;

            updateStatus(
                "Python opérationnel · choisissez votre point de départ."
            );

            console.log(
                "DZ CONQUEST V3.0 : moteur Python opérationnel."
            );

            return true;

        } catch (error) {

            this.ready = false;

            console.error(
                "DZ CONQUEST - Erreur d'initialisation :",
                error
            );

            updateStatus(
                "Erreur Python : " + error.message
            );

            throw error;

        } finally {

            this.initializing = false;

        }

    },

    /* ========================================================
       EXECUTION PYTHON
       ======================================================== */

    call(code) {

        if (!this.ready || !this.pyodide) {

            throw new Error(
                "Le moteur Python n'est pas initialisé."
            );

        }

        return this.pyodide.runPython(code);

    },

    /* ========================================================
       NOUVELLE PARTIE
       ======================================================== */

    newGame(name, civ, ai) {

        this.call(`
world = game.new_game(
    ${JSON.stringify(name)},
    ${JSON.stringify(civ)},
    ${Number(ai)}
)
`);

        return this.snapshot();

    },

    /* ========================================================
       COMMANDES DU JOUEUR
       ======================================================== */

    command(action, payload = {}) {

        this.pyodide.globals.set(
            "_payload",
            payload
        );

        this.pyodide.globals.set(
            "_action",
            action
        );

        return this.call(`
import json

_result = game.command(
    world,
    _action,
    _payload
)

json.dumps(_result)
`);

    },

    /* ========================================================
       SIMULATION
       ======================================================== */

    tick(dt) {

        this.pyodide.globals.set(
            "_dt",
            Number(dt)
        );

        this.call(`
game.tick(world, _dt)
`);

        return this.snapshot();

    },

    /* ========================================================
       ÉTAT DU MONDE
       ======================================================== */

    snapshot() {

        return JSON.parse(
            this.call(`
import json

json.dumps(
    game.snapshot(world)
)
`)
        );

    },

    /* ========================================================
       SAUVEGARDE
       ======================================================== */

    save() {

        return this.call(`
game.save(world)
`);

    },

    /* ========================================================
       CHARGEMENT D'UNE PARTIE
       ======================================================== */

    load(raw) {

        this.pyodide.globals.set(
            "_raw_save",
            raw
        );

        this.call(`
world = game.load(_raw_save)
`);

        return this.snapshot();

    }

};

/* ============================================================
   FIN DU PYTHON BRIDGE
   ============================================================ */
```
