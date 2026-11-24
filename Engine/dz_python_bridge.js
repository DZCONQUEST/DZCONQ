/* ============================================================
   DZ CONQUEST V3.0
   PYTHON BRIDGE
   Liaison JavaScript / Three.js / Python / Pyodide
   ============================================================ */

window.DZ = window.DZ || {};

DZ.bridge = {

    pyodide: null,
    world: null,
    ready: false,
    initializing: false,
    game: null,

    PYTHON_ROOT: "/home/pyodide/Python",

    VERSION: "3.0.1",

    /* ========================================================
       MODULES PYTHON
       ======================================================== */

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

        if (this.ready) {
            return true;
        }

        if (this.initializing) {
            throw new Error(
                "Initialisation du moteur déjà en cours."
            );
        }

        this.initializing = true;

        const status = document.getElementById(
            "loading-status"
        );

        const updateStatus = (message) => {

            if (status) {
                status.textContent = message;
            }

        };

        try {

            // 1. Vérifier Pyodide

            updateStatus("Chargement de Pyodide...");

            if (typeof loadPyodide !== "function") {

                throw new Error(
                    "Pyodide introuvable. Vérifiez index.html."
                );

            }

            // 2. Charger Pyodide

            this.pyodide = await loadPyodide();

            // 3. Préparer les dossiers

            updateStatus(
                "Préparation du système Python..."
            );

            this.pyodide.FS.mkdirTree(
                this.PYTHON_ROOT + "/AI"
            );

            // 4. Localiser le bridge

            const bridgeScript = document.querySelector(
                'script[src*="dz_python_bridge.js"]'
            );

            if (!bridgeScript || !bridgeScript.src) {

                throw new Error(
                    "Impossible de localiser dz_python_bridge.js."
                );

            }

            // 5. Localiser le dossier Python sur GitHub Pages

            const baseURL = new URL(
                "../Python/",
                bridgeScript.src
            );

            // 6. Télécharger les modules Python

            for (const file of this.files) {

                updateStatus(
                    "Chargement Python : " + file
                );

                const url = new URL(file, baseURL);

                url.searchParams.set(
                    "v",
                    this.VERSION
                );

                const response = await fetch(
                    url.href,
                    {
                        method: "GET",
                        cache: "no-store"
                    }
                );

                if (!response.ok) {

                    throw new Error(
                        "Impossible de charger " +
                        file +
                        " (HTTP " +
                        response.status +
                        ")."
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

            // 7. Créer les packages Python

            updateStatus(
                "Configuration des packages Python..."
            );

            this.pyodide.FS.writeFile(
                this.PYTHON_ROOT + "/__init__.py",
                ""
            );

            this.pyodide.FS.writeFile(
                this.PYTHON_ROOT + "/AI/__init__.py",
                ""
            );

            // 8. Configurer le chemin Python

            this.pyodide.runPython(`
import sys

if "/home/pyodide" not in sys.path:
    sys.path.insert(0, "/home/pyodide")

`);

            // 9. Importer le moteur principal

            updateStatus(
                "Importation du moteur DZ CONQUEST..."
            );

            this.pyodide.runPython(`
import Python.main as game
`);

            this.game = this.pyodide.globals.get(
                "game"
            );

            // 10. Vérifier le moteur

            this.pyodide.runPython(`
assert callable(game.new_game)
assert callable(game.command)
assert callable(game.tick)
assert callable(game.snapshot)
assert callable(game.save)
assert callable(game.load)
`);

            this.ready = true;

            updateStatus(
                "Moteur Python opérationnel."
            );

            console.log(
                "DZ CONQUEST V3.0 : moteur Python opérationnel."
            );

            return true;

        } catch (error) {

            this.ready = false;
            this.game = null;
            this.world = null;

            console.error(
                "DZ CONQUEST - Erreur Python :",
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
       VÉRIFICATION DU MOTEUR
       ======================================================== */

    checkReady() {

        if (!this.ready || !this.pyodide) {

            throw new Error(
                "Le moteur Python n'est pas opérationnel."
            );

        }

    },


    /* ========================================================
       EXÉCUTION PYTHON
       ======================================================== */

    call(code) {

        this.checkReady();

        return this.pyodide.runPython(code);

    },


    /* ========================================================
       NOUVELLE PARTIE
       ======================================================== */

    newGame(
        name = "Joueur",
        civ = "Nouvelle civilisation",
        ai = 2
    ) {

        this.checkReady();

        // Vérification des paramètres

        const playerName = String(name || "Joueur");

        const civilizationName = String(
            civ || "Nouvelle civilisation"
        );

        const aiCount = Math.max(
            0,
            Math.min(5, Math.floor(Number(ai) || 0))
        );

        // Transmission vers Python

        this.pyodide.globals.set(
            "_player_name",
            playerName
        );

        this.pyodide.globals.set(
            "_civ_name",
            civilizationName
        );

        this.pyodide.globals.set(
            "_ai_count",
            aiCount
        );

        // Création du monde

        this.call(`
world = game.new_game(
    _player_name,
    _civ_name,
    _ai_count
)
`);

        this.world = true;

        console.log(
            "DZ CONQUEST : nouvelle partie créée."
        );

        return this.snapshot();

    },


    /* ========================================================
       COMMANDES DU JOUEUR
       ======================================================== */

    command(action, payload = {}) {

        this.checkReady();

        if (!this.world) {

            throw new Error(
                "Aucune partie n'a encore été créée."
            );

        }

        if (
            payload === null ||
            typeof payload !== "object" ||
            Array.isArray(payload)
        ) {

            throw new Error(
                "Les données de la commande doivent être un objet."
            );

        }

        // Convertir les données JavaScript en JSON

        let payloadJSON;

        try {

            payloadJSON = JSON.stringify(payload);

        } catch (error) {

            throw new Error(
                "Impossible de convertir les données de la commande : " +
                error.message
            );

        }

        if (payloadJSON === undefined) {

            payloadJSON = "{}";

        }

        // Envoyer les paramètres à Python

        this.pyodide.globals.set(
            "_action",
            String(action)
        );

        this.pyodide.globals.set(
            "_payload_json",
            payloadJSON
        );

        // Python reconstruit un véritable dictionnaire

        const result = this.call(`
import json

_payload = json.loads(_payload_json)

_result = game.command(
    world,
    _action,
    _payload
)

json.dumps(
    _result,
    ensure_ascii=False
)
`);

        return JSON.parse(result);

    },


    /* ========================================================
       SIMULATION
       ======================================================== */

    tick(dt = 1) {

        this.checkReady();

        if (!this.world) {
            return null;
        }

        const delta = Math.max(
            0,
            Number(dt) || 0
        );

        this.pyodide.globals.set(
            "_dt",
            delta
        );

        const result = this.call(`
import json

_result = game.tick(
    world,
    _dt
)

json.dumps(
    _result,
    ensure_ascii=False
)
`);

        return JSON.parse(result);

    },


    /* ========================================================
       ÉTAT DU MONDE
       ======================================================== */

    snapshot() {

        this.checkReady();

        if (!this.world) {
            return null;
        }

        const result = this.call(`
import json

_result = game.snapshot(world)

json.dumps(
    _result,
    ensure_ascii=False
)
`);

        return JSON.parse(result);

    },


    /* ========================================================
       SAUVEGARDE
       ======================================================== */

    save() {

        this.checkReady();

        if (!this.world) {

            throw new Error(
                "Aucune partie à sauvegarder."
            );

        }

        const result = this.call(`
game.save(world)
`);

        return result;

    },


    /* ========================================================
       CHARGEMENT D'UNE PARTIE
       ======================================================== */

    load(raw) {

        this.checkReady();

        if (!raw) {

            throw new Error(
                "Fichier de sauvegarde vide."
            );

        }

        this.pyodide.globals.set(
            "_raw_save",
            String(raw)
        );

        this.call(`
world = game.load(_raw_save)
`);

        this.world = true;

        console.log(
            "DZ CONQUEST : sauvegarde chargée."
        );

        return this.snapshot();

    },


    /* ========================================================
       PAUSE / REPRISE
       ======================================================== */

    setPaused(value) {

        this.checkReady();

        if (!this.world) {
            return false;
        }

        this.pyodide.globals.set(
            "_paused",
            Boolean(value)
        );

        this.call(`
world["paused"] = bool(_paused)
`);

        return true;

    },


    /* ========================================================
       FERMETURE DU MOTEUR
       ======================================================== */

    destroy() {

        this.ready = false;
        this.initializing = false;

        this.game = null;
        this.world = null;

        this.pyodide = null;

        console.log(
            "DZ CONQUEST : moteur Python arrêté."
        );

    }

};


/* ============================================================
   FIN DU PYTHON BRIDGE
   ============================================================ */
