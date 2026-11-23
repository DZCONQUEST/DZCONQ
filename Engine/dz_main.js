window.DZ = window.DZ || {};

DZ.init = async function () {
    const status = document.getElementById("loading-status");

    try {
        if (!DZ.bridge || typeof DZ.bridge.init !== "function") {
            throw new Error("dz_python_bridge.js non chargé.");
        }

        status.textContent = "Initialisation de Pyodide…";

        await DZ.bridge.init();

        status.textContent = "Python opérationnel.";

        console.log("DZ CONQUEST : Python opérationnel.");

        if (DZ.world && typeof DZ.world.init === "function") {
            DZ.world.init();
        }

        if (DZ.controls && typeof DZ.controls.init === "function") {
            DZ.controls.init();
        }

        if (DZ.hud && typeof DZ.hud.init === "function") {
            DZ.hud.init();
        }

    } catch (error) {
        console.error("DZ INIT ERROR:", error);
        status.textContent = "Erreur Python : " + error.message;
    }
};

document.addEventListener("DOMContentLoaded", function () {
    DZ.init();
});
