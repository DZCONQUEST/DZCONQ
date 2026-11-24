window.DZ = window.DZ || {};

DZ.controls = {
    dragging: false,
    moved: false,
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

        el.addEventListener("pointerdown", e => {
            if (e.button !== 0 && e.button !== 2) return;

            this.dragging = true;
            this.moved = false;

            this.startX = e.clientX;
            this.startY = e.clientY;

            this.lastX = e.clientX;
            this.lastY = e.clientY;

            el.setPointerCapture(e.pointerId);
        });

        el.addEventListener("pointermove", e => {
            if (!this.dragging) return;

            const dx = e.clientX - this.lastX;
            const dy = e.clientY - this.lastY;

            if (
                Math.abs(e.clientX - this.startX) > this.threshold ||
                Math.abs(e.clientY - this.startY) > this.threshold
            ) {
                this.moved = true;
            }

            if (this.moved) {
                DZ.world.pan(dx, dy);
            }

            this.lastX = e.clientX;
            this.lastY = e.clientY;
        });

        el.addEventListener("pointerup", e => {
            if (!this.dragging) return;

            if (e.button === 0 && !this.moved) {
                this.click(e);
            }

            this.dragging = false;
        });

        el.addEventListener("pointercancel", () => {
            this.dragging = false;
        });

        el.addEventListener("wheel", e => {
            e.preventDefault();
            DZ.world.zoom(e.deltaY);
        }, { passive: false });
    },

    click(e) {

        const hit = DZ.world.pick(e);

        if (!hit) {
            DZ.toast("Impossible de sélectionner cet emplacement.");
            return;
        }

        const x = hit.point.x;
        const z = hit.point.z;

        // 1. Choix de l'emplacement initial
        if (!DZ.state.started) {

            if (DZ.state.selectingStart) {
                DZ.startAt(x, z);
            }

            return;
        }

        // 2. Construction d'un bâtiment
        if (
            DZ.world.mode === "build" &&
            DZ.world.pendingBuilding
        ) {

            DZ.placeBuilding(x, z);

            return;
        }

        // 3. Fondation d'une ville secondaire
        if (DZ.world.mode === "found_city") {

            DZ.foundCityAt(x, z);

            return;
        }

        // 4. Sélection normale
        DZ.state.selectedPoint = { x, z };

        document.getElementById("inspector").textContent =
            `Emplacement sélectionné : X ${x.toFixed(1)} | Z ${z.toFixed(1)}`;
    }
};
