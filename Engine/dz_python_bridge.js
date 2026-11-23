window.DZ = window.DZ || {};

DZ.bridge = {
    pyodide: null,
    world: null,
    ready: false,

    async init() {
        const status = document.getElementById("loading-status");

        try {
            status.textContent = "Chargement de Pyodide…";

            this.pyodide = await loadPyodide();

            const files = [
                "__init__.py",
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
                "AI/__init__.py",
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
            ];

            this.pyodide.FS.mkdirTree("/home/pyodide/Python/AI");

            const baseURL = new URL("../Python/", document.querySelector(
                'script[src*="dz_python_bridge.js"]'
            ).src);

            for (const file of files) {
                const url = new URL(file, baseURL);

                status.textContent = "Chargement : " + file;

                let response;

                try {
                    response = await fetch(url.href);
                } catch (error) {
                    throw new Error(
                        "Impossible de charger : " + file +
                        ". Vérifie le chemin et le mode d'ouverture."
                    );
                }

                if (!response.ok) {
                    throw new Error(
                        "Fichier Python introuvable : " +
                        file + " (HTTP " + response.status + ")"
                    );
                }

                const content = await response.text();

                const destination = "/home/pyodide/Python/" + file;

                const directory = destination.substring(
                    0,
                    destination.lastIndexOf("/")
                );

                this.pyodide.FS.mkdirTree(directory);

                this.pyodide.FS.writeFile(destination, content);
            }

            this.pyodide.runPython(`
import sys
sys.path.insert(0, "/home/pyodide")
import Python.main as game
            `);

            this.ready = true;

            status.textContent =
                "Python opérationnel · choisissez votre point de départ.";

        } catch (error) {
            console.error("DZ CONQUEST initialization error:", error);

            status.textContent = "Erreur Python : " + error.message;

            throw error;
        }
    },

    call(code) {
        if (!this.ready) {
            throw new Error("Le moteur Python n'est pas initialisé.");
        }

        return this.pyodide.runPython(code);
    },

    newGame(name, civ, ai) {
        this.call(
            `world = game.new_game(
                ${JSON.stringify(name)},
                ${JSON.stringify(civ)},
                ${Number(ai)}
            )`
        );

        return this.snapshot();
    },

    command(action, payload) {
        this.pyodide.globals.set("_payload", payload);
        this.pyodide.globals.set("_action", action);

        return this.call(
            "import json; _result=game.command(world,_action,_payload); json.dumps(_result)"
        );
    },

    tick(dt) {
        this.pyodide.globals.set("_dt", dt);

        this.call("game.tick(world,_dt)");

        return this.snapshot();
    },

    snapshot() {
        return JSON.parse(
            this.call("import json; json.dumps(game.snapshot(world))")
        );
    },

    save() {
        return this.call("game.save(world)");
    },

    load(raw) {
        this.pyodide.globals.set("_raw_save", raw);

        this.call("world=game.load(_raw_save)");

        return this.snapshot();
    }
};
