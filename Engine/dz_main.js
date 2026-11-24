window.DZ = window.DZ || {};

DZ.state = {
    started: false,
    selectingStart: false,
    paused: false,
    selectedPoint: null,
    lastSnapshot: null,
    playerCity: null
};

// =============================================
// INITIALISATION
// =============================================

DZ.init = async function() {

    DZ.world.init();

    try {

        await DZ.bridge.init();

    } catch (e) {

        document.getElementById("loading-status").textContent =
            "Erreur Python : " + e.message;

        console.error(e);

        return;
    }

    DZ.controls.init();

    this.bindUI();
};

// =============================================
// INTERFACE
// =============================================

DZ.bindUI = function() {

    // Démarrer une partie
    document.getElementById("start-game").onclick = () => {

        try {

            DZ.bridge.newGame(
                document.getElementById("player-name").value,
                document.getElementById("civ-name").value,
                document.getElementById("ai-count").value
            );

            DZ.state.started = false;
            DZ.state.selectingStart = true;

            DZ.world.focus(0, 0);

            DZ.refresh();

            // Masquer l'écran d'accueil
            document.getElementById("start-overlay").style.display =
                "none";

            DZ.toast(
                "Choisissez votre emplacement de départ sur la carte."
            );

        } catch (error) {

            console.error(error);
            DZ.toast("Erreur : " + error.message);
        }
    };

    // Pause
    document.getElementById("pause").onclick = () => {

        DZ.state.paused = !DZ.state.paused;

        DZ.bridge.call(
            `world['paused']=${DZ.state.paused ? "True" : "False"}`
        );
    };

    // Sauvegarde
    document.getElementById("save").onclick = () => {

        localStorage.setItem(
            "dz_conquest_v3_save",
            DZ.bridge.save()
        );

        DZ.toast("Partie sauvegardée.");
    };

    // Chargement
    document.getElementById("load").onclick = () => {

        const raw = localStorage.getItem(
            "dz_conquest_v3_save"
        );

        if (raw) {

            DZ.bridge.load(raw);

            DZ.refresh();

            DZ.toast("Partie chargée.");
        }
    };

    // Recrutement
    document.getElementById("recruit").onclick = () => {

        const r = DZ.bridge.command(
            "recruit",
            {
                unit_type: "soldier",
                count: 1
            }
        );

        DZ.toast(r.message);
        DZ.refresh();
    };

    // Fonder une ville
    document.getElementById("found-city").onclick = () => {

        if (!DZ.state.started) {
            DZ.toast("Choisissez d'abord votre emplacement de départ.");
            return;
        }

        DZ.world.mode = "found_city";

        DZ.toast("Cliquez sur le terrain pour fonder une ville.");
    };

    // Bâtiments
    const defs = window.DZ_DATA.buildings;

    document.getElementById("buildings").innerHTML =
        Object.entries(defs)
            .map(([key, value]) =>
                `<button data-building="${key}">${value.name}</button>`
            )
            .join("");

    document.querySelectorAll("[data-building]").forEach(button => {

        button.onclick = () => {

            if (!DZ.state.started) {
                DZ.toast("Choisissez d'abord votre emplacement de départ.");
                return;
            }

            DZ.world.mode = "build";

            DZ.world.pendingBuilding = button.dataset.building;

            DZ.toast(
                "Cliquez sur le terrain pour placer : " +
                defs[button.dataset.building].name
            );
        };
    });
};

// =============================================
// CRÉATION DE LA CAPITALE
// =============================================

DZ.startAt = function(x, z) {

    if (!DZ.bridge.ready) return;

    const result = DZ.bridge.command(
        "found_city",
        {
            x: x,
            z: z,
            name: "Capitale"
        }
    );

    if (!result.ok) {

        DZ.toast(result.message);

        return;
    }

    DZ.state.started = true;
    DZ.state.selectingStart = false;

    DZ.state.playerCity = result.city.id;

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

    DZ.world.focus(x, z);

    DZ.refresh();

    DZ.toast(
        "Votre civilisation est fondée. Deux personnages vous représentent."
    );
};

// =============================================
// FONDER UNE VILLE SECONDAIRE
// =============================================

DZ.foundCityAt = function(x, z) {

    const result = DZ.bridge.command(
        "found_city",
        {
            x: x,
            z: z,
            name: "Nouvelle ville"
        }
    );

    DZ.toast(result.message);

    DZ.world.mode = "inspect";

    DZ.refresh();
};

// =============================================
// CONSTRUCTION
// =============================================

DZ.placeBuilding = function(x, z) {

    const snapshot = DZ.bridge.snapshot();

    const city = snapshot.cities.find(
        c => c.id === DZ.state.playerCity
    );

    if (!city) {

        DZ.toast("Aucune ville active.");

        return;
    }

    const kind = DZ.world.pendingBuilding;

    const result = DZ.bridge.command(
        "build",
        {
            city_id: city.id,
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

// =============================================
// RAFRAÎCHIR L'INTERFACE
// =============================================

DZ.refresh = function() {

    const snapshot = DZ.bridge.snapshot();

    DZ.state.lastSnapshot = snapshot;

    DZ.world.sync(snapshot);

    DZ.hud.render(snapshot);
};

// =============================================
// NOTIFICATIONS
// =============================================

DZ.toast = function(message) {

    const el = document.getElementById("inspector");

    el.textContent = message;
};

// =============================================
// BOUCLE DU JEU
// =============================================

DZ.loop = function() {

    if (
        DZ.state.started &&
        !DZ.state.paused
    ) {

        DZ.bridge.tick(1);

        DZ.refresh();
    }

    setTimeout(
        () => DZ.loop(),
        1000
    );
};

// =============================================
// LANCEMENT
// =============================================

window.addEventListener("load", async () => {

    await DZ.init();

    DZ.loop();
});
