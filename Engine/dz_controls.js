/* ============================================================
   DZ CONQUEST V3.0
   CONTROLS ENGINE
   ============================================================ */

window.DZ = window.DZ || {};

DZ.controls = {

    dragging: false,
    moved: false,

    startX: 0,
    startY: 0,

    lastX: 0,
    lastY: 0,

    threshold: 5,

    pointerDown: false,

    /* ========================================================
       INITIALISATION
       ======================================================== */

    init() {

        const el = DZ.world.renderer.domElement;

        // Désactiver le menu contextuel
        el.addEventListener("contextmenu", e => {
            e.preventDefault();
        });


        // =========================================
        // APPUI SOURIS
        // =========================================

        el.addEventListener("pointerdown", e => {

            if (e.button !== 0 && e.button !== 2) {
                return;
            }

            this.dragging = true;
            this.moved = false;
            this.pointerDown = true;

            this.startX = e.clientX;
            this.startY = e.clientY;

            this.lastX = e.clientX;
            this.lastY = e.clientY;

            el.setPointerCapture(e.pointerId);

        });


        // =========================================
        // DÉPLACEMENT SOURIS
        // =========================================

        el.addEventListener("pointermove", e => {

            // Prévisualisation de l'emplacement
            if (!this.dragging) {

                this.preview(e);

                return;
            }

            const dx = e.clientX - this.lastX;
            const dy = e.clientY - this.lastY;

            const totalX = e.clientX - this.startX;
            const totalY = e.clientY - this.startY;


            // Détection d'un déplacement réel
            if (
                Math.abs(totalX) > this.threshold ||
                Math.abs(totalY) > this.threshold
            ) {

                this.moved = true;

            }


            // Déplacement caméra
            if (this.moved) {

                DZ.world.pan(dx, dy);

            }


            this.lastX = e.clientX;
            this.lastY = e.clientY;

        });


        // =========================================
        // RELÂCHEMENT SOURIS
        // =========================================

        el.addEventListener("pointerup", e => {

            if (!this.dragging) {
                return;
            }

            // Clic gauche sans déplacement
            if (
                e.button === 0 &&
                !this.moved
            ) {

                this.click(e);

            }

            this.dragging = false;
            this.pointerDown = false;

        });


        // =========================================
        // ANNULATION
        // =========================================

        el.addEventListener("pointercancel", () => {

            this.dragging = false;
            this.pointerDown = false;

        });


        // =========================================
        // ZOOM
        // =========================================

        el.addEventListener("wheel", e => {

            e.preventDefault();

            DZ.world.zoom(e.deltaY);

        }, {
            passive: false
        });


        console.log(
            "DZ CONQUEST : contrôles opérationnels."
        );

    },


    /* ========================================================
       PRÉVISUALISATION DU TERRAIN
       ======================================================== */

    preview(e) {

        if (!DZ.world || !DZ.world.pick) {
            return;
        }

        const hit = DZ.world.pick(e);

        if (!hit) {
            return;
        }

        const x = hit.point.x;
        const z = hit.point.z;

        // Afficher les coordonnées pendant la sélection
        const inspector = document.getElementById("inspector");

        if (!inspector) {
            return;
        }

        if (
            !DZ.state.started &&
            DZ.state.selectingStart
        ) {

            inspector.textContent =
                `Emplacement de départ : X ${x.toFixed(1)} | Z ${z.toFixed(1)}`;

            return;
        }

        if (
            DZ.world.mode === "build" &&
            DZ.world.pendingBuilding
        ) {

            inspector.textContent =
                `Construction : ${DZ.world.pendingBuilding} | X ${x.toFixed(1)} | Z ${z.toFixed(1)}`;

            return;
        }

        if (DZ.world.mode === "found_city") {

            inspector.textContent =
                `Nouvelle ville : X ${x.toFixed(1)} | Z ${z.toFixed(1)}`;

        }

    },


    /* ========================================================
       GESTION DES CLICS
       ======================================================== */

    click(e) {

        // Obtenir le point exact sur le terrain
        const hit = DZ.world.pick(e);

        if (!hit) {

            DZ.toast(
                "Veuillez cliquer sur le terrain."
            );

            return;
        }

        const x = hit.point.x;
        const z = hit.point.z;


        // =========================================
        // 1. CHOIX DE LA CAPITALE
        // =========================================

        if (!DZ.state.started) {

            if (DZ.state.selectingStart) {

                DZ.startAt(x, z);

            }

            return;
        }


        // =========================================
        // 2. CONSTRUCTION
        // =========================================

        if (
            DZ.world.mode === "build" &&
            DZ.world.pendingBuilding
        ) {

            DZ.placeBuilding(x, z);

            return;
        }


        // =========================================
        // 3. FONDATION D'UNE VILLE
        // =========================================

        if (DZ.world.mode === "found_city") {

            DZ.foundCityAt(x, z);

            return;
        }


        // =========================================
        // 4. SÉLECTION NORMALE
        // =========================================

        DZ.state.selectedPoint = {
            x: x,
            z: z
        };

        const inspector = document.getElementById("inspector");

        if (inspector) {

            inspector.textContent =
                `Position sélectionnée : X ${x.toFixed(1)} | Z ${z.toFixed(1)}`;

        }

    }

};


/* ============================================================
   FIN DU CONTRÔLEUR
   ============================================================ */
