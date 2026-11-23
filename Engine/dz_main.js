```javascript
/* ============================================================
   DZ CONQUEST V3.0
   MAIN ENGINE
   ============================================================ */

window.DZ = window.DZ || {};

DZ.main = {

    started: false,
    paused: false,

    /* ========================================================
       INITIALISATION
       ======================================================== */

    async init() {

        console.log("DZ CONQUEST : démarrage...");

        try {

            // Vérifier le bridge Python

            if (!window.DZ || !window.DZ.bridge) {
                throw new Error(
                    "DZ.bridge introuvable. Vérifier dz_python_bridge.js."
                );
            }

            if (typeof window.DZ.bridge.init !== "function") {
                throw new Error(
                    "DZ.bridge.init n'est pas une fonction."
                );
            }

            // Initialiser Python

            await window.DZ.bridge.init();

            console.log("Python opérationnel.");

            // Préparer les événements

            this.bindEvents();

            return true;

        } catch (error) {

            console.error(
                "Erreur initialisation DZ CONQUEST :",
                error
            );

            const status = document.getElementById(
                "loading-status"
            );

            if (status) {
                status.textContent =
                    "Erreur Python : " + error.message;
            }

            return false;
        }
    },

    /* ========================================================
       ÉVÉNEMENTS
       ======================================================== */

    bindEvents() {

        const startButton = document.getElementById(
            "start-game"
        );

        if (startButton) {

            startButton.addEventListener(
                "click",
                () => this.startGame()
            );

        }

        const pauseButton = document.getElementById("pause");

        if (pauseButton) {

            pauseButton.addEventListener(
                "click",
                () => this.togglePause()
            );

        }

        const saveButton = document.getElementById("save");

        if (saveButton) {

            saveButton.addEventListener(
                "click",
                () => this.saveGame()
            );

        }

        const loadButton = document.getElementById("load");

        if (loadButton) {

            loadButton.addEventListener(
                "click",
                () => this.loadGame()
            );

        }

    },

    /* ========================================================
       NOUVELLE PARTIE
       ======================================================== */

    startGame() {

        if (!DZ.bridge.ready) {

            alert(
                "Le moteur Python n'est pas encore opérationnel."
            );

            return;
        }

        try {

            const playerName =
                document.getElementById("player-name").value;

            const civName =
                document.getElementById("civ-name").value;

            const aiCount =
                Number(
                    document.getElementById("ai-count").value
                );

            const world = DZ.bridge.newGame(
                playerName,
                civName,
                aiCount
            );

            DZ.bridge.world = world;

            this.started = true;

            const overlay = document.getElementById(
                "start-overlay"
            );

            if (overlay) {
                overlay.style.display = "none";
            }

            if (DZ.hud && typeof DZ.hud.update === "function") {
                DZ.hud.update(world);
            }

            console.log("Nouvelle partie créée.");

        } catch (error) {

            console.error("Erreur nouvelle partie :", error);

            alert("Erreur : " + error.message);

        }

    },

    /* ========================================================
       PAUSE
       ======================================================== */

    togglePause() {

        this.paused = !this.paused;

        const button = document.getElementById("pause");

        if (button) {
            button.textContent = this.paused ? "▶" : "Ⅱ";
        }

    },

    /* ========================================================
       SAUVEGARDE
       ======================================================== */

    saveGame() {

        try {

            if (!this.started) return;

            const save = DZ.bridge.save();

            localStorage.setItem(
                "DZ_CONQUEST_SAVE",
                save
            );

            alert("Partie sauvegardée.");

        } catch (error) {

            console.error(error);

        }

    },

    /* ========================================================
       CHARGEMENT
       ======================================================== */

    loadGame() {

        try {

            const save = localStorage.getItem(
                "DZ_CONQUEST_SAVE"
            );

            if (!save) {
                alert("Aucune sauvegarde disponible.");
                return;
            }

            const world = DZ.bridge.load(save);

            DZ.bridge.world = world;

            this.started = true;

            const overlay = document.getElementById(
                "start-overlay"
            );

            if (overlay) {
                overlay.style.display = "none";
            }

            if (DZ.hud && typeof DZ.hud.update === "function") {
                DZ.hud.update(world);
            }

        } catch (error) {

            console.error("Erreur chargement :", error);

            alert(error.message);

        }

    }

};


/* ============================================================
   DÉMARRAGE AUTOMATIQUE
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        DZ.main.init();

    }
);
```
