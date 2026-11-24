// ========================================================
// DZ CONQUEST - CONTROLES DES PERSONNAGES
// ========================================================

window.DZ = window.DZ || {};

DZ.controls = {

    dragging: false,
    moved: false,
    dragButton: -1,

    startX: 0,
    startY: 0,

    lastX: 0,
    lastY: 0,

    threshold: 5,

    init() {

        const el = DZ.world.renderer.domElement;

        el.addEventListener("contextmenu", e => {
            e.preventDefault();
        });

        // --------------------------------------------
        // APPUI SOURIS
        // --------------------------------------------

        el.addEventListener("pointerdown", e => {

            if (e.button !== 0 && e.button !== 2) return;

            this.dragging = true;
            this.moved = false;
            this.dragButton = e.button;

            this.startX = e.clientX;
            this.startY = e.clientY;

            this.lastX = e.clientX;
            this.lastY = e.clientY;

            el.setPointerCapture(e.pointerId);

        });

        // --------------------------------------------
        // DÉPLACEMENT SOURIS
        // --------------------------------------------

        el.addEventListener("pointermove", e => {

            if (!this.dragging) return;

            const dx = e.clientX - this.lastX;
            const dy = e.clientY - this.lastY;

            const totalX = e.clientX - this.startX;
            const totalY = e.clientY - this.startY;

            if (
                Math.abs(totalX) > this.threshold ||
                Math.abs(totalY) > this.threshold
            ) {
                this.moved = true;
            }

            // Clic droit : caméra uniquement

            if (this.dragButton === 2 && this.moved) {

                DZ.world.pan(dx, dy);

            }

            this.lastX = e.clientX;
            this.lastY = e.clientY;

        });

        // --------------------------------------------
        // RELÂCHEMENT
        // --------------------------------------------

        el.addEventListener("pointerup", e => {

            if (!this.dragging) return;

            if (
                this.dragButton === 0 &&
                !this.moved
            ) {
                this.click(e);
            }

            this.dragging = false;
            this.dragButton = -1;

        });

        el.addEventListener("pointercancel", () => {

            this.dragging = false;
            this.dragButton = -1;

        });

        // --------------------------------------------
        // ZOOM
        // --------------------------------------------

        el.addEventListener("wheel", e => {

            e.preventDefault();

            DZ.world.zoom(e.deltaY);

        }, { passive: false });

    },

    // ====================================================
    // CLIC GAUCHE
    // ====================================================

    click(e) {

        const person = DZ.world.pickCharacter(e);

        // --------------------------------------------
        // 1. CHOISIR LE PERSONNAGE
        // --------------------------------------------

        if (person) {

            DZ.world.selectUnit(person);

            DZ.toast(
                "Personnage sélectionné : " +
                person.userData.label
            );

            return;
        }

        // --------------------------------------------
        // 2. CHOISIR LE TERRAIN
        // --------------------------------------------

        const hit = DZ.world.pickGround(e);

        if (!hit) return;

        const x = hit.point.x;
        const z = hit.point.z;

        // --------------------------------------------
        // 3. POSITION INITIALE
        // --------------------------------------------

        if (!DZ.state.started) {

            DZ.startAt(x, z);

            return;
        }

        // --------------------------------------------
        // 4. CONSTRUCTION
        // --------------------------------------------

        if (
            DZ.world.mode === "build" &&
            DZ.world.pendingBuilding
        ) {

            DZ.placeBuilding(x, z);

            return;
        }

        // --------------------------------------------
        // 5. DÉPLACER LE PERSONNAGE SÉLECTIONNÉ
        // --------------------------------------------

        if (DZ.world.selectedUnit) {

            DZ.world.moveUnitTo(
                DZ.world.selectedUnit,
                x,
                z
            );

            DZ.toast(
                "Déplacement ordonné."
            );

            return;
        }

        // --------------------------------------------
        // 6. SIMPLE SÉLECTION DU TERRAIN
        // --------------------------------------------

        DZ.state.selectedPoint = { x, z };

        document.getElementById("inspector").textContent =
            `Position : ${x.toFixed(1)}, ${z.toFixed(1)}`;

    }

};
