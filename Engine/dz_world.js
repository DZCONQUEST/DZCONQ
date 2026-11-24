window.DZ = window.DZ || {};

DZ.world = {

    scene: null,
    camera: null,
    renderer: null,
    ground: null,

    objects: new Map(),

    raycaster: new THREE.Raycaster(),
    pointer: new THREE.Vector2(),

    mode: "inspect",
    pendingBuilding: null,

    cameraTarget: new THREE.Vector3(0, 0, 0),

    cameraDistance: 520,
    cameraHeight: 340,

    minZoom: 100,
    maxZoom: 1100,

    // =========================================
    // INITIALISATION
    // =========================================

    init() {

        const container =
            document.getElementById("scene-container");

        this.scene = new THREE.Scene();

        this.scene.background =
            new THREE.Color(0x9bb9c2);

        this.scene.fog =
            new THREE.Fog(0x9bb9c2, 900, 2600);

        this.camera = new THREE.PerspectiveCamera(
            48,
            container.clientWidth / container.clientHeight,
            0.1,
            6000
        );

        this.camera.position.set(
            0,
            this.cameraHeight,
            this.cameraDistance
        );

        this.camera.lookAt(this.cameraTarget);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });

        this.renderer.setSize(
            container.clientWidth,
            container.clientHeight
        );

        this.renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        );

        this.renderer.shadowMap.enabled = true;

        this.renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;

        container.appendChild(this.renderer.domElement);

        // Éclairage
        this.scene.add(
            new THREE.HemisphereLight(
                0xeaf4ff,
                0x77634a,
                1.2
            )
        );

        const sun = new THREE.DirectionalLight(
            0xffedc4,
            2
        );

        sun.position.set(-300, 600, 250);

        sun.castShadow = true;

        sun.shadow.mapSize.set(2048, 2048);

        this.scene.add(sun);

        // =====================================
        // TERRAIN
        // =====================================

        const geo = new THREE.PlaneGeometry(
            1800,
            1800,
            150,
            150
        );

        const pos = geo.attributes.position;

        for (let i = 0; i < pos.count; i++) {

            const x = pos.getX(i);
            const y = pos.getY(i);

            const h =
                Math.sin(x * 0.012) * 3 +
                Math.cos(y * 0.016) * 4 +
                Math.sin((x + y) * 0.006) * 8;

            const ridge =
                Math.max(0, Math.sin(x * 0.003 + y * 0.004)) * 16;

            pos.setZ(i, h + ridge);
        }

        geo.rotateX(-Math.PI / 2);

        geo.computeVertexNormals();

        const mat = new THREE.MeshStandardMaterial({
            color: 0x71865d,
            roughness: 1
        });

        this.ground = new THREE.Mesh(geo, mat);

        this.ground.receiveShadow = true;
        this.ground.name = "ground";

        this.scene.add(this.ground);

        // Eau
        const water = new THREE.Mesh(
            new THREE.PlaneGeometry(5000, 5000),
            new THREE.MeshStandardMaterial({
                color: 0x3b8192,
                roughness: 0.4
            })
        );

        water.rotation.x = -Math.PI / 2;
        water.position.y = -18;

        this.scene.add(water);

        this.addTerrainDetails();

        this.animate();

        window.addEventListener(
            "resize",
            () => this.resize()
        );
    },

    // =========================================
    // CAMÉRA
    // =========================================

    updateCamera() {

        const direction = new THREE.Vector3(
            0,
            this.cameraHeight,
            this.cameraDistance
        );

        this.camera.position.copy(
            this.cameraTarget
        ).add(direction);

        this.camera.lookAt(this.cameraTarget);
    },

    pan(dx, dy) {

        const factor = this.cameraDistance / 650;

        const right = new THREE.Vector3();
        const forward = new THREE.Vector3();

        this.camera.updateMatrixWorld();

        this.camera.getWorldDirection(forward);

        right.crossVectors(
            forward,
            this.camera.up
        ).normalize();

        const movement = new THREE.Vector3();

        movement.addScaledVector(
            right,
            -dx * factor
        );

        movement.z += dy * factor;

        this.cameraTarget.add(movement);

        this.updateCamera();
    },

    zoom(delta) {

        const factor = delta > 0 ? 1.12 : 0.89;

        this.cameraDistance *= factor;
        this.cameraHeight *= factor;

        this.cameraDistance = THREE.MathUtils.clamp(
            this.cameraDistance,
            this.minZoom,
            this.maxZoom
        );

        this.cameraHeight = THREE.MathUtils.clamp(
            this.cameraHeight,
            70,
            750
        );

        this.updateCamera();
    },

    // Recentrer la caméra
    focus(x, z) {

        this.cameraTarget.set(x, 0, z);

        this.updateCamera();
    },

    // =========================================
    // DÉTAILS DU TERRAIN
    // =========================================

    addTerrainDetails() {

        for (let i = 0; i < 160; i++) {

            const x = (Math.random() - 0.5) * 1700;
            const z = (Math.random() - 0.5) * 1700;

            const g = new THREE.Group();

            const trunk = new THREE.Mesh(
                new THREE.CylinderGeometry(1, 1.5, 8, 6),
                new THREE.MeshStandardMaterial({
                    color: 0x59442c
                })
            );

            trunk.position.y = 4;

            const crown = new THREE.Mesh(
                new THREE.ConeGeometry(5, 15, 7),
                new THREE.MeshStandardMaterial({
                    color: 0x496b42
                })
            );

            crown.position.y = 14;

            g.add(trunk, crown);

            g.position.set(x, 0, z);

            g.scale.setScalar(
                0.6 + Math.random() * 0.8
            );

            this.scene.add(g);
        }

        for (let i = 0; i < 55; i++) {

            const x = (Math.random() - 0.5) * 1700;
            const z = (Math.random() - 0.5) * 1700;

            const rock = new THREE.Mesh(
                new THREE.DodecahedronGeometry(
                    5 + Math.random() * 12,
                    0
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x827d70,
                    roughness: 1
                })
            );

            rock.position.set(x, 4, z);
            rock.scale.y = 0.5 + Math.random();

            this.scene.add(rock);
        }
    },

    // =========================================
    // PERSONNAGES
    // =========================================

    addUnit(owner, x, z, label, isAI = false) {

        const group = new THREE.Group();

        const body = new THREE.Mesh(
            new THREE.CapsuleGeometry(2.4, 7, 4, 8),
            new THREE.MeshStandardMaterial({
                color: isAI ? 0x9b4540 : 0xdec28a
            })
        );

        body.position.y = 6;

        const head = new THREE.Mesh(
            new THREE.SphereGeometry(2.2, 12, 10),
            new THREE.MeshStandardMaterial({
                color: 0xd9b18d
            })
        );

        head.position.y = 12;

        group.add(body, head);

        group.position.set(x, 0, z);

        group.userData = {
            kind: "person",
            label,
            owner
        };

        this.scene.add(group);

        this.objects.set(label, group);

        return group;
    },

    // =========================================
    // BÂTIMENTS
    // =========================================

    addBuilding(b) {

        const colors = {
            house: 0xc5a36c,
            farm: 0x75934c,
            lumber: 0x866044,
            mine: 0x777d82,
            palace: 0xd4b65f
        };

        const group = new THREE.Group();

        const base = new THREE.Mesh(
            new THREE.BoxGeometry(18, 9, 15),
            new THREE.MeshStandardMaterial({
                color: colors[b.type] || 0x9a8c70
            })
        );

        base.position.y = 4.5;
        base.castShadow = true;

        group.add(base);

        if (b.type === "house" || b.type === "palace") {

            const roof = new THREE.Mesh(
                new THREE.ConeGeometry(13, 9, 4),
                new THREE.MeshStandardMaterial({
                    color: 0x77453a
                })
            );

            roof.position.y = 13;
            roof.rotation.y = Math.PI / 4;

            group.add(roof);
        }

        group.position.set(b.x, 0, b.z);

        group.userData = {
            kind: "building",
            id: b.id,
            label: b.name
        };

        this.scene.add(group);

        this.objects.set(b.id, group);
    },

    // =========================================
    // SYNCHRONISATION
    // =========================================

    sync(s) {

        for (const b of s.buildings) {

            if (
                b.complete &&
                !this.objects.has(b.id)
            ) {
                this.addBuilding(b);
            }
        }

        for (const a of s.armies) {

            if (!this.objects.has(a.id)) {

                const mesh = new THREE.Mesh(
                    new THREE.CylinderGeometry(4, 5, 7, 8),
                    new THREE.MeshStandardMaterial({
                        color:
                            a.owner_id === s.player_id
                                ? 0x315fc4
                                : 0xb83c38
                    })
                );

                mesh.position.set(a.x, 4, a.z);

                mesh.userData = {
                    kind: "army",
                    id: a.id,
                    label: "Armée"
                };

                this.scene.add(mesh);

                this.objects.set(a.id, mesh);

            } else {

                this.objects
                    .get(a.id)
                    .position.set(a.x, 4, a.z);
            }
        }
    },

    // =========================================
    // SÉLECTION DU TERRAIN
    // =========================================

    pick(ev) {

        const rect =
            this.renderer.domElement.getBoundingClientRect();

        this.pointer.set(
            ((ev.clientX - rect.left) / rect.width) * 2 - 1,
            -((ev.clientY - rect.top) / rect.height) * 2 + 1
        );

        this.raycaster.setFromCamera(
            this.pointer,
            this.camera
        );

        // Important : on sélectionne uniquement le terrain.
        const hits = this.raycaster.intersectObject(
            this.ground,
            false
        );

        return hits.length ? hits[0] : null;
    },

    // =========================================
    // REDIMENSIONNEMENT
    // =========================================

    resize() {

        const container =
            document.getElementById("scene-container");

        this.camera.aspect =
            container.clientWidth / container.clientHeight;

        this.camera.updateProjectionMatrix();

        this.renderer.setSize(
            container.clientWidth,
            container.clientHeight
        );
    },

    // =========================================
    // AFFICHAGE
    // =========================================

    animate() {

        requestAnimationFrame(
            () => this.animate()
        );

        this.renderer.render(
            this.scene,
            this.camera
        );
    }
};
