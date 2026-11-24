window.DZ = window.DZ || {};

DZ.controls = {
    dragging: false,
    moved: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    dragButton: -1,
    threshold: 5,

    init() {
        const el = DZ.world.renderer.domElement;

        el.addEventListener("contextmenu", e => e.preventDefault());

        el.addEventListener("pointerdown", e => {
            this.dragging = true;
            this.moved = false;

            this.startX = e.clientX;
            this.startY = e.clientY;

            this.lastX = e.clientX;
            this.lastY = e.clientY;

            this.dragButton = e.button;

            el.setPointerCapture(e.pointerId);
        });

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

            if (this.moved) {
                DZ.world.pan(dx, dy);
            }

            this.lastX = e.clientX;
            this.lastY = e.clientY;
        });

        el.addEventListener("pointerup", e => {
            if (!this.dragging) return;

            if (
                e.button === 0 &&
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

        el.addEventListener("wheel", e => {
            e.preventDefault();

            DZ.world.zoom(e.deltaY);

        }, { passive: false });
    },

    click(e) {

        // Sélection uniquement sur le terrain
        const hit = DZ.world.pick(e);

        if (!hit) return;

        const x = hit.point.x;
        const z = hit.point.z;

        // Choix du point de départ
        if (!DZ.state.started) {

            if (DZ.state.selectingStart) {
                DZ.startAt(x, z);
            }

            return;
        }

        // Construction
        if (
            DZ.world.mode === "build" &&
            DZ.world.pendingBuilding
        ) {
            DZ.placeBuilding(x, z);
            return;
        }

        // Sélection normale
        DZ.selectedPoint = { x, z };

        document.getElementById("inspector").textContent =
            `Position : ${x.toFixed(0)}, ${z.toFixed(0)}`;
    }
};
