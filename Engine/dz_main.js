// ============================================================
// DZ CONQUEST V3.0
// MAIN ENGINE
// ============================================================

window.DZ = window.DZ || {};

DZ.state = {
    started: false,
    paused: false,
    selectedPoint: null,
    lastSnapshot: null,
    playerCity: null
};


// ============================================================
// INITIALISATION
// ============================================================

DZ.init = async function () {

    const status = document.getElementById("loading-status");

    try {

        status.textContent = "Initialisation du monde 3D...";

        if (DZ.world && typeof DZ.world.init === "function") {
            DZ.world.init();
        }

        if (!DZ.bridge || typeof DZ.bridge.init !== "function") {
            throw new Error("Moteur Python introuvable.");
        }

        status.textContent = "Chargement de Python...";

        await DZ.bridge.init();

        if (DZ.controls && typeof DZ.controls.init === "function") {
            DZ.controls.init();
        }

        if (DZ.hud && typeof DZ.hud.init === "function") {
            DZ.hud.init();
        }

        DZ.bindUI();

        status.textContent = "Python opérationnel.";

        console.log("DZ CONQUEST V3.0 : initialisation terminée.");

    } catch (error) {

        console.error("DZ INIT ERROR:", error);

        status.textContent = "Erreur : " + error.message;
    }
};


// ============================================================
// INTERFACE UTILISATEUR
// ============================================================

DZ.bindUI = function () {

    // INITIALISER LE MONDE

    const startButton = document.getElementById("start-game");

    startButton.onclick = function () {

        try {

            if (!DZ.bridge.ready) {
                throw new Error("Python n'est pas encore prêt.");
            }

            const name = document.getElementById("player-name").value;
            const civ = document.getElementById("civ-name").value;
            const ai = Number(document.getElementById("ai-count").value);

            DZ.bridge.newGame(name, civ, ai);

            DZ.refresh();

            document.getElementById("start-overlay").style.display = "none";

            DZ.toast("Monde créé. Cliquez sur le terrain pour choisir votre capitale.");

        } catch (error) {

            console.error("NEW GAME ERROR:", error);

            document.getElementById("loading-status").textContent =
                "Erreur : " + error.message;
        }
    };


    // PAUSE

    document.getElementById("pause").onclick = function () {

        DZ.state.paused = !DZ.state.paused;

        DZ.bridge.call(
            `world['paused']=${DZ.state.paused ? "True" : "False"}`
        );
    };


    // SAUVEGARDE

    document.getElementById("save").onclick = function () {

        try {

            const save = DZ.bridge.save();

            localStorage.setItem("dz_conquest_v3_save", save);

            DZ.toast("Partie sauvegardée.");

        } catch (error) {

            DZ.toast("Erreur de sauvegarde : " + error.message);
        }
    };


    // CHARGEMENT

    document.getElementById("load").onclick = function () {

        const raw = localStorage.getItem("dz_conquest_v3_save");

        if (!raw) {
            DZ.toast("Aucune sauvegarde disponible.");
            return;
        }

        try {

            DZ.bridge.load(raw);

            DZ.state.started = true;

            document.getElementById("start-overlay").style.display = "none";

            DZ.refresh();

            DZ.toast("Partie chargée.");

        } catch (error) {

            DZ.toast("Erreur de chargement : " + error.message);
        }
    };


    // RECRUTEMENT

    document.getElementById("recruit").onclick = function () {

        const result = DZ.bridge.command(
            "recruit",
            {
                unit_type: "soldier",
                count: 1
            }
        );

        DZ.toast(result.message);

        DZ.refresh();
    };


    // FONDER UNE VILLE

    document.getElementById("found-city").onclick = function () {

        const point = DZ.selectedPoint || {
            x: 150,
            z: 100
        };

        const result = DZ.bridge.command(
            "found_city",
            {
                x: point.x,
                z: point.z,
                name: "Nouvelle ville"
            }
        );

        DZ.toast(result.message);

        DZ.refresh();
    };


    // CONSTRUCTIONS

    const definitions = window.DZ_DATA.buildings;

    document.getElementById("buildings").innerHTML =
        Object.entries(definitions).map(([key, value]) => {

            return `<button data-building="${key}">${value.name}</button>`;

        }).join("");


    document.querySelectorAll("[data-building]").forEach(button => {

        button.onclick = function () {

            DZ.world.mode = "build";

            DZ.world.pendingBuilding = button.dataset.building;

            DZ.toast(
                "Cliquez sur le terrain pour construire : " +
                definitions[button.dataset.building].name
            );
        };
    });

};


// ============================================================
// CHOIX DU POINT DE DÉPART
// ============================================================

DZ.startAt = function (x, z) {

    if (!DZ.bridge.ready || DZ.state.started) {
        return;
    }

    try {

        const result = DZ.bridge.command(
            "found_city",
            {
                x: x,
                z: z,
                name: "Capitale"
            }
        );

        if (!result.ok) {

            DZ.toast(result.message || "Impossible de créer la capitale.");

            return;
        }

        DZ.state.started = true;

        DZ.state.playerCity = result.city.id;

        // PERSONNAGES

        DZ.world.addUnit(
            "player",
            x - 5,
            z,
            "Homme"
        );

        DZ.world.addUnit(
            "player",
            x + 5,
            z + 4,
            "Femme"
        );

        DZ.refresh();

        DZ.toast("Votre civilisation est fondée !");

    } catch (error) {

        console.error("START POSITION ERROR:", error);

        DZ.toast("Erreur : " + error.message);
    }
};


// ============================================================
// CONSTRUCTION
// ============================================================

DZ.placeBuilding = function (x, z) {

    const cityId = DZ.state.playerCity;

    if (!cityId) {
        DZ.toast("Aucune capitale disponible.");
        return;
    }

    const kind = DZ.world.pendingBuilding;

    const result = DZ.bridge.command(
        "build",
        {
            city_id: cityId,
            building_type: kind,
            x: x,
            z: z
        }
    );

    DZ.toast(result.message);

    DZ.world.pendingBuilding = null;

    DZ.world.mode = "inspect";

    DZ.refresh();
};


// ============================================================
// ACTUALISATION
// ============================================================

DZ.refresh = function () {

    const snapshot = DZ.bridge.snapshot();

    DZ.state.lastSnapshot = snapshot;

    if (DZ.world && typeof DZ.world.sync === "function") {
        DZ.world.sync(snapshot);
    }

    if (DZ.hud && typeof DZ.hud.render === "function") {
        DZ.hud.render(snapshot);
    }

};


// ============================================================
// NOTIFICATIONS
// ============================================================

DZ.toast = function (message) {

    const inspector = document.getElementById("inspector");

    if (inspector) {
        inspector.textContent = message;
    }

};


// ============================================================
// BOUCLE DU JEU
// ============================================================

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

    setTimeout(DZ.loop, 1000);
};


// ============================================================
// DÉMARRAGE
// ============================================================

document.addEventListener("DOMContentLoaded", async function () {

    await DZ.init();

    DZ.loop();

});
