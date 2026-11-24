/* ============================================================
   DZ CONQUEST V3.0
   MAIN ENGINE
   ============================================================ */

window.DZ = window.DZ || {};


/* ============================================================
   ÉTAT DU JEU
   ============================================================ */

DZ.state = {

    started: false,

    selectingStart: false,

    paused: false,

    selectedPoint: null,

    lastSnapshot: null,

    playerCity: null

};


/* ============================================================
   INITIALISATION
   ============================================================ */

DZ.init = async function () {

    const status = document.getElementById("loading-status");

    try {

        // Initialisation du monde 3D

        if (!DZ.world || typeof DZ.world.init !== "function") {
            throw new Error("Moteur 3D introuvable.");
        }

        status.textContent = "Initialisation du monde 3D...";

        DZ.world.init();


        // Vérification du moteur Python

        if (!DZ.bridge || typeof DZ.bridge.init !== "function") {
            throw new Error("Moteur Python introuvable.");
        }

        status.textContent = "Chargement du moteur Python...";

        await DZ.bridge.init();


        // Initialisation des contrôles

        if (DZ.controls && typeof DZ.controls.init === "function") {
            DZ.controls.init();
        }


        // Initialisation de l'interface

        DZ.bindUI();


        status.textContent = "DZ CONQUEST opérationnel.";

        DZ.toast("Bienvenue dans DZ CONQUEST V3.0.");

        console.log("DZ CONQUEST V3.0 : initialisation terminée.");

        return true;

    } catch (error) {

        console.error("DZ INIT ERROR:", error);

        if (status) {
            status.textContent = "Erreur : " + error.message;
        }

        return false;
    }

};


/* ============================================================
   INTERFACE UTILISATEUR
   ============================================================ */

DZ.bindUI = function () {

    // =========================================
    // INITIALISER LE MONDE
    // =========================================

    const startButton = document.getElementById("start-game");

    startButton.onclick = function () {

        try {

            if (!DZ.bridge.ready) {
                throw new Error("Le moteur Python n'est pas prêt.");
            }

            const name = document.getElementById("player-name").value;

            const civ = document.getElementById("civ-name").value;

            const ai = Number(document.getElementById("ai-count").value);


            // Créer une nouvelle partie

            DZ.bridge.newGame(name, civ, ai);


            // Réinitialiser l'état du joueur

            DZ.state.started = false;

            DZ.state.selectingStart = true;

            DZ.state.paused = false;

            DZ.state.playerCity = null;

            DZ.state.selectedPoint = null;


            // Réinitialiser le mode de sélection

            DZ.world.mode = "inspect";

            DZ.world.pendingBuilding = null;


            // Actualiser l'interface

            DZ.refresh();


            // Centrer la caméra

            if (typeof DZ.world.focus === "function") {
                DZ.world.focus(0, 0);
            }


            // Masquer l'écran de démarrage

            document.getElementById("start-overlay").style.display = "none";


            DZ.toast(
                "Choisissez votre emplacement de départ sur le terrain."
            );

        } catch (error) {

            console.error("NEW GAME ERROR:", error);

            DZ.toast("Erreur : " + error.message);
        }

    };


    // =========================================
    // PAUSE
    // =========================================

    document.getElementById("pause").onclick = function () {

        DZ.state.paused = !DZ.state.paused;

        try {

            DZ.bridge.call(
                `world["paused"] = ${DZ.state.paused ? "True" : "False"}`
            );

            this.textContent = DZ.state.paused ? "▶" : "Ⅱ";

            DZ.toast(
                DZ.state.paused
                    ? "Partie en pause."
                    : "Partie reprise."
            );

        } catch (error) {

            console.error("PAUSE ERROR:", error);

        }

    };


    // =========================================
    // SAUVEGARDE
    // =========================================

    document.getElementById("save").onclick = function () {

        try {

            if (!DZ.state.started) {
                DZ.toast("Aucune partie à sauvegarder.");
                return;
            }

            const save = DZ.bridge.save();

            localStorage.setItem(
                "dz_conquest_v3_save",
                save
            );

            DZ.toast("Partie sauvegardée.");

        } catch (error) {

            console.error("SAVE ERROR:", error);

            DZ.toast("Erreur de sauvegarde : " + error.message);
        }

    };


    // =========================================
    // CHARGEMENT
    // =========================================

    document.getElementById("load").onclick = function () {

        const raw = localStorage.getItem("dz_conquest_v3_save");

        if (!raw) {

            DZ.toast("Aucune sauvegarde disponible.");

            return;
        }

        try {

            const snapshot = DZ.bridge.load(raw);

            DZ.state.lastSnapshot = snapshot;

            DZ.state.started = true;

            DZ.state.selectingStart = false;

            DZ.state.paused = false;

            const civ = snapshot.civilizations.find(
                c => c.id === snapshot.player_id
            );

            DZ.state.playerCity = civ
                ? civ.capital_id
                : null;


            document.getElementById("start-overlay").style.display = "none";

            DZ.refresh();

            DZ.toast("Partie chargée avec succès.");

        } catch (error) {

            console.error("LOAD ERROR:", error);

            DZ.toast("Erreur de chargement : " + error.message);
        }

    };


    // =========================================
    // RECRUTEMENT
    // =========================================

    document.getElementById("recruit").onclick = function () {

        if (!DZ.state.started) {

            DZ.toast("Commencez d'abord une partie.");

            return;
        }

        try {

            const result = DZ.bridge.command(
                "recruit",
                {
                    unit_type: "soldier",
                    count: 1
                }
            );

            DZ.toast(result.message);

            DZ.refresh();

        } catch (error) {

            console.error("RECRUIT ERROR:", error);

            DZ.toast("Erreur de recrutement : " + error.message);
        }

    };


    // =========================================
    // FONDER UNE VILLE SECONDAIRE
    // =========================================

    document.getElementById("found-city").onclick = function () {

        if (!DZ.state.started) {

            DZ.toast("Choisissez d'abord votre capitale.");

            return;
        }

        DZ.world.mode = "found_city";

        DZ.world.pendingBuilding = null;

        DZ.toast(
            "Cliquez sur le terrain pour choisir l'emplacement de votre ville."
        );

    };


    // =========================================
    // BÂTIMENTS
    // =========================================

    const definitions = window.DZ_DATA.buildings;

    const buildingContainer = document.getElementById("buildings");

    buildingContainer.innerHTML = Object.entries(definitions)
        .map(([key, value]) => {

            return `
                <button
                    type="button"
                    data-building="${key}"
                >
                    ${value.name}
                </button>
            `;

        })
        .join("");


    // Gestion des boutons de construction

    document.querySelectorAll("[data-building]").forEach(button => {

        button.onclick = function () {

            if (!DZ.state.started) {

                DZ.toast("Commencez d'abord une partie.");

                return;
            }

            const kind = button.dataset.building;

            DZ.world.mode = "build";

            DZ.world.pendingBuilding = kind;


            DZ.toast(
                "Mode construction : cliquez sur le terrain pour placer " +
                definitions[kind].name + "."
            );

        };

    });

};


/* ============================================================
   CHOIX DE L'EMPLACEMENT DE DÉPART
   ============================================================ */

DZ.startAt = function (x, z) {

    if (!DZ.bridge.ready || DZ.state.started) {
        return;
    }

    try {

        const result = DZ.bridge.command(
            "found_city",
            {
                x: Number(x),
                z: Number(z),
                name: "Capitale"
            }
        );


        if (!result || !result.ok) {

            DZ.toast(
                result?.message || "Impossible de fonder la capitale."
            );

            return;
        }


        // Enregistrer la capitale

        DZ.state.started = true;

        DZ.state.selectingStart = false;

        DZ.state.playerCity = result.city.id;

        DZ.state.selectedPoint = {
            x: Number(x),
            z: Number(z)
        };


        // Créer les deux personnages

        DZ.world.addUnit(
            "player",
            Number(x) - 5,
            Number(z),
            "Homme"
        );

        DZ.world.addUnit(
            "player",
            Number(x) + 5,
            Number(z) + 4,
            "Femme"
        );


        // Recentrer la caméra

        if (typeof DZ.world.focus === "function") {
            DZ.world.focus(x, z);
        }


        // Actualiser le monde

        DZ.refresh();


        DZ.toast(
            "Votre capitale est fondée ! Votre civilisation commence ici."
        );

        console.log("CAPITALE CRÉÉE :", result.city);

    } catch (error) {

        console.error("START POSITION ERROR:", error);

        DZ.toast("Erreur : " + error.message);
    }

};


/* ============================================================
   FONDER UNE VILLE SECONDAIRE
   ============================================================ */

DZ.foundCityAt = function (x, z) {

    if (!DZ.state.started) {
        return;
    }

    try {

        const result = DZ.bridge.command(
            "found_city",
            {
                x: Number(x),
                z: Number(z),
                name: "Nouvelle ville"
            }
        );


        if (!result || !result.ok) {

            DZ.toast(
                result?.message || "Impossible de fonder cette ville."
            );

            return;
        }


        DZ.state.selectedPoint = {
            x: Number(x),
            z: Number(z)
        };

        DZ.world.mode = "inspect";

        DZ.refresh();

        DZ.toast(result.message);

    } catch (error) {

        console.error("FOUND CITY ERROR:", error);

        DZ.toast("Erreur : " + error.message);
    }

};


/* ============================================================
   PLACEMENT MANUEL DES BÂTIMENTS
   ============================================================ */

DZ.placeBuilding = function (x, z) {

    try {

        // Vérifier le moteur

        if (!DZ.bridge.ready) {

            DZ.toast("Le moteur Python n'est pas disponible.");

            return;
        }


        // Vérifier la partie

        if (!DZ.state.started) {

            DZ.toast("Commencez d'abord une partie.");

            return;
        }


        // Vérifier le bâtiment choisi

        const kind = DZ.world.pendingBuilding;

        if (!kind) {

            DZ.toast("Aucun bâtiment sélectionné.");

            return;
        }


        // Vérifier la capitale

        const cityId = DZ.state.playerCity;

        if (!cityId) {

            DZ.toast("Aucune capitale disponible.");

            return;
        }


        // Vérifier les coordonnées

        if (!Number.isFinite(Number(x)) || !Number.isFinite(Number(z))) {

            DZ.toast("Emplacement invalide.");

            return;
        }


        // Envoyer les coordonnées exactes à Python

        const result = DZ.bridge.command(
            "build",
            {
                city_id: cityId,
                building_type: kind,
                x: Number(x),
                z: Number(z)
            }
        );


        // Vérifier le résultat

        if (!result || !result.ok) {

            DZ.toast(
                result?.message || "Construction impossible."
            );

            return;
        }


        // Mémoriser l'emplacement choisi

        DZ.state.selectedPoint = {
            x: Number(x),
            z: Number(z)
        };


        // Réinitialiser le mode construction

        DZ.world.pendingBuilding = null;

        DZ.world.mode = "inspect";


        // Actualiser l'interface

        DZ.refresh();


        DZ.toast(
            result.message +
            " | X : " + Number(x).toFixed(1) +
            " | Z : " + Number(z).toFixed(1)
        );


        console.log("BÂTIMENT PLACÉ :", {
            type: kind,
            city: cityId,
            x: Number(x),
            z: Number(z)
        });

    } catch (error) {

        console.error("BUILDING ERROR:", error);

        DZ.toast(
            "Erreur de construction : " + error.message
        );

    }

};


/* ============================================================
   ACTUALISATION DU MONDE
   ============================================================ */

DZ.refresh = function () {

    if (!DZ.bridge.ready || !DZ.bridge.world) {
        return;
    }

    try {

        const snapshot = DZ.bridge.snapshot();

        if (!snapshot) {
            return;
        }

        DZ.state.lastSnapshot = snapshot;


        // Synchroniser les objets 3D

        if (DZ.world && typeof DZ.world.sync === "function") {

            DZ.world.sync(snapshot);

        }


        // Actualiser l'interface

        if (DZ.hud && typeof DZ.hud.render === "function") {

            DZ.hud.render(snapshot);

        }

    } catch (error) {

        console.error("REFRESH ERROR:", error);

    }

};


/* ============================================================
   NOTIFICATIONS
   ============================================================ */

DZ.toast = function (message) {

    const inspector = document.getElementById("inspector");

    if (inspector) {

        inspector.textContent = message;

    }

};


/* ============================================================
   BOUCLE PRINCIPALE
   ============================================================ */

DZ.loop = function () {

    try {

        if (
            DZ.state.started &&
            !DZ.state.paused &&
            DZ.bridge.ready
        ) {

            DZ.bridge.tick(1);

            DZ.refresh();

        }

    } catch (error) {

        console.error("GAME LOOP ERROR:", error);

    }

    setTimeout(
        () => DZ.loop(),
        1000
    );

};


/* ============================================================
   DÉMARRAGE AUTOMATIQUE
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const initialized = await DZ.init();

        if (initialized) {

            DZ.loop();

        }

    }
);
