/* ============================================================
   DZ CONQUEST V3.0
   3D WORLD ENGINE
   THREE.JS
   ============================================================ */

window.DZ = window.DZ || {};

DZ.world = {

    // ========================================================
    // VARIABLES PRINCIPALES
    // ========================================================

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

    cameraDistance: 650,
    cameraHeight: 430,

    minZoom: 100,
    maxZoom: 1400,

    worldSize: 1800,

    initialized: false,

    // ========================================================
    // INITIALISATION
    // ========================================================

    init() {

        if (this.initialized) return;

        const container = document.getElementById(
            "scene-container"
        );

        if (!container) {
            throw new Error("Conteneur 3D introuvable.");
        }

        // ----------------------------------------------------
        // SCÈNE
        // ----------------------------------------------------

        this.scene = new THREE.Scene();

        this.scene.background = new THREE.Color(0x9bb9c2);

        this.scene.fog = new THREE.Fog(
            0x9bb9c2,
            1000,
            3000
        );

        // ----------------------------------------------------
        // CAMÉRA
        // ----------------------------------------------------

        this.camera = new THREE.PerspectiveCamera(
            48,
            container.clientWidth / container.clientHeight,
            0.1,
            6000
        );

        this.updateCamera();

        // ----------------------------------------------------
        // RENDERER
        // ----------------------------------------------------

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });

        this.renderer.setSize(
            container.clientWidth,
            container.clientHeight
        );

        this.renderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, 2)
        );

        this.renderer.shadowMap.enabled = true;

        this.renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;

        this.renderer.outputColorSpace =
            THREE.SRGBColorSpace;

        container.appendChild(this.renderer.domElement);

        // ----------------------------------------------------
        // ÉCLAIRAGE
        // ----------------------------------------------------

        const ambient = new THREE.HemisphereLight(
            0xeaf4ff,
            0x77634a,
            1.4
        );

        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(
            0xffedc4,
            2
        );

        sun.position.set(-350, 700, 350);

        sun.castShadow = true;

        sun.shadow.mapSize.set(2048, 2048);

        sun.shadow.camera.left = -1000;
        sun.shadow.camera.right = 1000;
        sun.shadow.camera.top = 1000;
        sun.shadow.camera.bottom = -1000;

        this.scene.add(sun);

        // ----------------------------------------------------
        // TERRAIN
        // ----------------------------------------------------

        this.createTerrain();

        // ----------------------------------------------------
        // EAU
        // ----------------------------------------------------

        this.createWater();

        // ----------------------------------------------------
        // DÉTAILS NATURELS
        // ----------------------------------------------------

        this.addTerrainDetails();

        // ----------------------------------------------------
        // FINALISATION
        // ----------------------------------------------------

        this.initialized = true;

        this.animate();

        window.addEventListener(
            "resize",
            () => this.resize()
        );

        console.log(
            "DZ CONQUEST : monde 3D opérationnel."
        );

    },


    // ========================================================
    // CRÉATION DU TERRAIN
    // ========================================================

    createTerrain() {

        const geometry = new THREE.PlaneGeometry(
            this.worldSize,
            this.worldSize,
            180,
            180
        );

        const positions = geometry.attributes.position;

        for (let i = 0; i < positions.count; i++) {

            const x = positions.getX(i);
            const z = positions.getY(i);

            const hills =
                Math.sin(x * 0.012) * 3 +
                Math.cos(z * 0.016) * 4 +
                Math.sin((x + z) * 0.006) * 8;

            const mountains =
                Math.max(
                    0,
                    Math.sin(x * 0.003 + z * 0.004)
                ) * 16;

            const height = hills + mountains;

            positions.setZ(i, height);

        }

        geometry.rotateX(-Math.PI / 2);

        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({

            color: 0x71865d,

            roughness: 1,

            metalness: 0

        });

        this.ground = new THREE.Mesh(
            geometry,
            material
        );

        this.ground.name = "ground";

        this.ground.receiveShadow = true;

        this.ground.userData.kind = "terrain";

        this.scene.add(this.ground);

    },


    // ========================================================
    // CRÉATION DE L'EAU
    // ========================================================

    createWater() {

        const geometry = new THREE.PlaneGeometry(
            5000,
            5000
        );

        const material = new THREE.MeshStandardMaterial({

            color: 0x3b8192,

            roughness: 0.4,

            metalness: 0.1

        });

        const water = new THREE.Mesh(
            geometry,
            material
        );

        water.rotation.x = -Math.PI / 2;

        water.position.y = -18;

        water.receiveShadow = true;

        water.name = "water";

        this.scene.add(water);

    },


    // ========================================================
    // CAMÉRA
    // ========================================================

    updateCamera() {

        if (!this.camera) return;

        this.camera.position.set(

            this.cameraTarget.x,

            this.cameraTarget.y + this.cameraHeight,

            this.cameraTarget.z + this.cameraDistance

        );

        this.camera.lookAt(this.cameraTarget);

    },


    // ========================================================
    // DÉPLACEMENT DE LA CAMÉRA
    // ========================================================

    pan(dx, dy) {

        if (!this.camera) return;

        const factor = this.cameraDistance / 650;

        const forward = new THREE.Vector3();

        this.camera.getWorldDirection(forward);

        forward.y = 0;

        forward.normalize();

        const right = new THREE.Vector3();

        right.crossVectors(
            forward,
            new THREE.Vector3(0, 1, 0)
        ).normalize();

        this.cameraTarget.addScaledVector(
            right,
            -dx * factor
        );

        this.cameraTarget.addScaledVector(
            forward,
            dy * factor
        );

        // Limites du monde

        const limit = this.worldSize / 2;

        this.cameraTarget.x = THREE.MathUtils.clamp(
            this.cameraTarget.x,
            -limit,
            limit
        );

        this.cameraTarget.z = THREE.MathUtils.clamp(
            this.cameraTarget.z,
            -limit,
            limit
        );

        this.updateCamera();

    },


    // ========================================================
    // ZOOM
    // ========================================================

    zoom(delta) {

        if (!this.camera) return;

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
            90,
            900
        );

        this.updateCamera();

    },


    // ========================================================
    // CENTRER LA CAMÉRA
    // ========================================================

    focus(x, z) {

        this.cameraTarget.set(
            Number(x) || 0,
            0,
            Number(z) || 0
        );

        this.updateCamera();

    },


    // ========================================================
    // DÉTAILS NATURELS
    // ========================================================

    addTerrainDetails() {

        // ----------------------------------------------------
        // ARBRES
        // ----------------------------------------------------

        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x59442c
        });

        const leafMaterial = new THREE.MeshStandardMaterial({
            color: 0x496b42
        });

        for (let i = 0; i < 160; i++) {

            const x = (Math.random() - 0.5) * 1700;

            const z = (Math.random() - 0.5) * 1700;

            const tree = new THREE.Group();

            const trunk = new THREE.Mesh(
                new THREE.CylinderGeometry(
                    1,
                    1.5,
                    8,
                    6
                ),
                trunkMaterial
            );

            trunk.position.y = 4;

            trunk.castShadow = true;

            const crown = new THREE.Mesh(
                new THREE.ConeGeometry(
                    5,
                    15,
                    7
                ),
                leafMaterial
            );

            crown.position.y = 14;

            crown.castShadow = true;

            tree.add(trunk, crown);

            tree.position.set(x, 0, z);

            tree.scale.setScalar(
                0.6 + Math.random() * 0.8
            );

            tree.userData.kind = "tree";

            this.scene.add(tree);

        }


        // ----------------------------------------------------
        // ROCHERS
        // ----------------------------------------------------

        const rockMaterial = new THREE.MeshStandardMaterial({

            color: 0x827d70,

            roughness: 1

        });

        for (let i = 0; i < 55; i++) {

            const x = (Math.random() - 0.5) * 1700;

            const z = (Math.random() - 0.5) * 1700;

            const rock = new THREE.Mesh(
                new THREE.DodecahedronGeometry(
                    5 + Math.random() * 12,
                    0
                ),
                rockMaterial
            );

            rock.position.set(x, 4, z);

            rock.scale.y = 0.5 + Math.random();

            rock.castShadow = true;

            rock.userData.kind = "rock";

            this.scene.add(rock);

        }

    },


    // ========================================================
// PERSONNAGES 3D DÉTAILLÉS
// ========================================================

addUnit(owner, x, z, label, isAI = false) {

    const id = "person_" + label;

    if (this.objects.has(id)) {
        const existing = this.objects.get(id);
        existing.position.set(x, 0, z);
        return existing;
    }

    const character = new THREE.Group();

    const female = /femme|woman|female/i.test(label);

    const skin = new THREE.MeshStandardMaterial({
        color: 0xc99070,
        roughness: 0.85
    });

    const hair = new THREE.MeshStandardMaterial({
        color: female ? 0x38251c : 0x30251e,
        roughness: 0.9
    });

    const clothes = new THREE.MeshStandardMaterial({
        color: isAI ? 0x873e38 : female ? 0x497c78 : 0x987044,
        roughness: 0.9
    });

    const secondaryClothes = new THREE.MeshStandardMaterial({
        color: female ? 0x304e54 : 0x59442f,
        roughness: 0.9
    });

    const boots = new THREE.MeshStandardMaterial({
        color: 0x39291e
    });

    const dark = new THREE.MeshStandardMaterial({
        color: 0x211c19
    });

    const white = new THREE.MeshStandardMaterial({
        color: 0xf2e8d9
    });

    // ----------------------------------------------------
    // OUTIL : AJOUTER UNE SPHÈRE
    // ----------------------------------------------------

    const sphere = (parent, material, x, y, z, sx, sy, sz) => {

        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(1, 16, 12),
            material
        );

        mesh.position.set(x, y, z);
        mesh.scale.set(sx, sy, sz);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        parent.add(mesh);

        return mesh;
    };

    // ----------------------------------------------------
    // OUTIL : AJOUTER UN CYLINDRE ENTRE DEUX POINTS
    // ----------------------------------------------------

    const limb = (parent, material, start, end, radius) => {

        const a = new THREE.Vector3(...start);
        const b = new THREE.Vector3(...end);

        const direction = new THREE.Vector3().subVectors(b, a);

        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(
                radius * 0.85,
                radius,
                direction.length(),
                10
            ),
            material
        );

        mesh.position.copy(a).add(b).multiplyScalar(0.5);

        mesh.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction.normalize()
        );

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        parent.add(mesh);

        return mesh;
    };

    // ----------------------------------------------------
    // JAMBES
    // ----------------------------------------------------

    if (female) {

        // Robe / vêtement inférieur

        const dress = new THREE.Mesh(
            new THREE.CylinderGeometry(2.5, 3.8, 8, 16),
            clothes
        );

        dress.position.y = 8;
        dress.castShadow = true;
        character.add(dress);

        // Bottes

        sphere(character, boots, -1.1, 1.2, 0.5, 0.85, 1.2, 1.2);
        sphere(character, boots, 1.1, 1.2, 0.5, 0.85, 1.2, 1.2);

    } else {

        // Pantalon

        limb(character, secondaryClothes,
            [-1.1, 8, 0], [-1.1, 2, 0], 1.05);

        limb(character, secondaryClothes,
            [1.1, 8, 0], [1.1, 2, 0], 1.05);

        // Bottes

        sphere(character, boots, -1.1, 1.1, 0.5, 0.9, 1.1, 1.4);
        sphere(character, boots, 1.1, 1.1, 0.5, 0.9, 1.1, 1.4);

    }

    // ----------------------------------------------------
    // BUSTE
    // ----------------------------------------------------

    const torso = new THREE.Mesh(
        new THREE.CapsuleGeometry(2.2, 5, 5, 12),
        clothes
    );

    torso.position.y = 12;
    torso.castShadow = true;

    character.add(torso);

    // Cou

    limb(
        character,
        skin,
        [0, 15, 0],
        [0, 17, 0],
        0.8
    );

    // Ceinture

    const belt = new THREE.Mesh(
        new THREE.TorusGeometry(2, 0.22, 6, 16),
        boots
    );

    belt.rotation.x = Math.PI / 2;
    belt.position.y = 9.5;

    character.add(belt);

    // ----------------------------------------------------
    // BRAS
    // ----------------------------------------------------

    for (const side of [-1, 1]) {

        const shoulder = [side * 2.1, 14, 0];

        const elbow = [side * 3.1, 10.5, 0.3];

        const wrist = [side * 3.3, 7.5, 0.5];

        limb(character, clothes, shoulder, elbow, 0.95);

        limb(character, skin, elbow, wrist, 0.65);

        // Mains

        sphere(
            character,
            skin,
            side * 3.3,
            7.1,
            0.5,
            0.75,
            0.8,
            0.65
        );

    }

    // ----------------------------------------------------
    // TÊTE
    // ----------------------------------------------------

    sphere(
        character,
        skin,
        0,
        19.5,
        0,
        2.1,
        2.5,
        1.8
    );

    // ----------------------------------------------------
    // OREILLES
    // ----------------------------------------------------

    sphere(character, skin, -2.05, 19.5, 0, 0.45, 0.7, 0.4);
    sphere(character, skin, 2.05, 19.5, 0, 0.45, 0.7, 0.4);

    // ----------------------------------------------------
    // YEUX
    // ----------------------------------------------------

    for (const side of [-1, 1]) {

        sphere(
            character,
            white,
            side * 0.8,
            20,
            1.55,
            0.42,
            0.35,
            0.2
        );

        sphere(
            character,
            dark,
            side * 0.8,
            20,
            1.72,
            0.18,
            0.23,
            0.12
        );

    }

    // ----------------------------------------------------
    // NEZ
    // ----------------------------------------------------

    sphere(
        character,
        skin,
        0,
        19.4,
        1.85,
        0.35,
        0.65,
        0.4
    );

    // ----------------------------------------------------
    // BOUCHE
    // ----------------------------------------------------

    limb(
        character,
        dark,
        [-0.35, 18.4, 1.72],
        [0.35, 18.4, 1.72],
        0.07
    );

    // ----------------------------------------------------
    // CHEVEUX
    // ----------------------------------------------------

    sphere(
        character,
        hair,
        0,
        21.5,
        -0.1,
        2.15,
        1.15,
        1.9
    );

    if (female) {

        // Cheveux longs

        sphere(
            character,
            hair,
            -1.7,
            18.8,
            -0.3,
            0.65,
            2.8,
            0.8
        );

        sphere(
            character,
            hair,
            1.7,
            18.8,
            -0.3,
            0.65,
            2.8,
            0.8
        );

    } else {

        // Barbe

        sphere(
            character,
            hair,
            0,
            18.2,
            1.1,
            1.25,
            0.75,
            0.7
        );

    }

    // ----------------------------------------------------
    // ÉPAULES
    // ----------------------------------------------------

    sphere(character, clothes, -2.1, 14, 0, 1.1, 1.1, 1.1);
    sphere(character, clothes, 2.1, 14, 0, 1.1, 1.1, 1.1);

    // ----------------------------------------------------
    // ACCESSOIRE : SAC DU CONSTRUCTEUR
    // ----------------------------------------------------

    if (!female && /homme|man|builder/i.test(label)) {

        const bag = new THREE.Mesh(
            new THREE.BoxGeometry(2.8, 4, 1.5),
            secondaryClothes
        );

        bag.position.set(0, 12, -1.8);

        bag.castShadow = true;

        character.add(bag);

    }

    // ----------------------------------------------------
    // IDENTITÉ DU PERSONNAGE
    // ----------------------------------------------------

    character.position.set(x, 0, z);

    character.userData = {

        kind: "person",

        label: label,

        owner: owner,

        gender: female ? "female" : "male"

    };

    this.scene.add(character);

    this.objects.set(id, character);

    return character;

},


    // ========================================================
    // VILLES
    // ========================================================

    addCity(city) {

        const id = city.id;

        if (this.objects.has(id)) {

            const existing = this.objects.get(id);

            existing.position.set(
                city.x,
                0,
                city.z
            );

            return existing;

        }

        const group = new THREE.Group();

        // Plateforme de ville

        const platform = new THREE.Mesh(
            new THREE.CylinderGeometry(
                13,
                15,
                1.5,
                24
            ),
            new THREE.MeshStandardMaterial({
                color: city.is_capital
                    ? 0xd8b34d
                    : 0x9a9a83
            })
        );

        platform.position.y = 0.8;

        group.add(platform);

        // Repère central

        const marker = new THREE.Mesh(
            new THREE.ConeGeometry(
                3,
                9,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: city.is_capital
                    ? 0xffd34d
                    : 0xe8e8d5
            })
        );

        marker.position.y = 6;

        group.add(marker);

        group.position.set(
            city.x,
            0,
            city.z
        );

        group.userData = {

            kind: "city",

            id: id,

            label: city.name

        };

        this.scene.add(group);

        this.objects.set(id, group);

        return group;

    },


    // ========================================================
    // BÂTIMENTS
    // ========================================================

    addBuilding(b) {

        if (this.objects.has(b.id)) {

            return this.objects.get(b.id);

        }

        const colors = {

            house: 0xc5a36c,

            farm: 0x75934c,

            lumber: 0x866044,

            mine: 0x777d82,

            palace: 0xd4b65f

        };

        const group = new THREE.Group();

        // ----------------------------------------------------
        // CORPS DU BÂTIMENT
        // ----------------------------------------------------

        const base = new THREE.Mesh(

            new THREE.BoxGeometry(
                18,
                9,
                15
            ),

            new THREE.MeshStandardMaterial({

                color: colors[b.type] || 0x9a8c70,

                roughness: 0.9,

                transparent: !b.complete,

                opacity: b.complete ? 1 : 0.65

            })

        );

        base.position.y = 4.5;

        base.castShadow = true;

        base.receiveShadow = true;

        group.add(base);


        // ----------------------------------------------------
        // TOIT
        // ----------------------------------------------------

        if (
            b.type === "house" ||
            b.type === "palace"
        ) {

            const roof = new THREE.Mesh(

                new THREE.ConeGeometry(
                    13,
                    9,
                    4
                ),

                new THREE.MeshStandardMaterial({
                    color: 0x77453a
                })

            );

            roof.position.y = 13;

            roof.rotation.y = Math.PI / 4;

            roof.castShadow = true;

            group.add(roof);

        }


        // ----------------------------------------------------
        // INDICATEUR DE CONSTRUCTION
        // ----------------------------------------------------

        if (!b.complete) {

            const progress = new THREE.Mesh(

                new THREE.BoxGeometry(
                    10,
                    1.5,
                    1
                ),

                new THREE.MeshBasicMaterial({
                    color: 0x36d16d
                })

            );

            progress.position.set(
                0,
                19,
                -9
            );

            group.add(progress);

        }


        // ----------------------------------------------------
        // POSITION EXACTE
        // ----------------------------------------------------

        group.position.set(
            Number(b.x),
            0,
            Number(b.z)
        );

        group.userData = {

            kind: "building",

            id: b.id,

            label: b.name,

            buildingType: b.type,

            complete: b.complete

        };

        this.scene.add(group);

        this.objects.set(b.id, group);

        return group;

    },


    // ========================================================
    // ARMÉES
    // ========================================================

    addArmy(army, playerId) {

        const id = army.id;

        const color = army.owner_id === playerId
            ? 0x315fc4
            : 0xb83c38;

        if (this.objects.has(id)) {

            const existing = this.objects.get(id);

            existing.position.set(
                army.x,
                4,
                army.z
            );

            return existing;

        }

        const mesh = new THREE.Mesh(

            new THREE.CylinderGeometry(
                4,
                5,
                7,
                8
            ),

            new THREE.MeshStandardMaterial({
                color: color
            })

        );

        mesh.position.set(
            army.x,
            4,
            army.z
        );

        mesh.castShadow = true;

        mesh.userData = {

            kind: "army",

            id: id,

            label: "Armée"

        };

        this.scene.add(mesh);

        this.objects.set(id, mesh);

        return mesh;

    },


    // ========================================================
    // SYNCHRONISATION AVEC PYTHON
    // ========================================================

    sync(snapshot) {

        if (!snapshot) return;

        // ----------------------------------------------------
        // VILLES
        // ----------------------------------------------------

        for (const city of snapshot.cities || []) {

            this.addCity(city);

        }


        // ----------------------------------------------------
        // BÂTIMENTS
        // ----------------------------------------------------

        for (const building of snapshot.buildings || []) {

            this.addBuilding(building);

        }


        // ----------------------------------------------------
        // ARMÉES
        // ----------------------------------------------------

        for (const army of snapshot.armies || []) {

            this.addArmy(
                army,
                snapshot.player_id
            );

        }

    },


    // ========================================================
    // SÉLECTION DU TERRAIN
    // ========================================================

    pick(event) {

        if (!this.renderer || !this.ground) {

            return null;

        }

        const rect = this.renderer.domElement.getBoundingClientRect();

        this.pointer.set(

            ((event.clientX - rect.left) / rect.width) * 2 - 1,

            -((event.clientY - rect.top) / rect.height) * 2 + 1

        );

        this.raycaster.setFromCamera(
            this.pointer,
            this.camera
        );

        // IMPORTANT :
        // On interroge uniquement le terrain.
        // Les arbres, rochers, villes et bâtiments
        // ne bloquent donc pas la sélection.

        const hits = this.raycaster.intersectObject(
            this.ground,
            false
        );

        if (hits.length === 0) {

            return null;

        }

        return hits[0];

    },


    // ========================================================
    // REDIMENSIONNEMENT
    // ========================================================

    resize() {

        if (!this.camera || !this.renderer) return;

        const container = document.getElementById(
            "scene-container"
        );

        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        if (width <= 0 || height <= 0) return;

        this.camera.aspect = width / height;

        this.camera.updateProjectionMatrix();

        this.renderer.setSize(
            width,
            height
        );

    },


    // ========================================================
    // ANIMATION
    // ========================================================

    animate() {

        requestAnimationFrame(
            () => this.animate()
        );

        if (!this.renderer || !this.scene || !this.camera) {
            return;
        }

        this.renderer.render(
            this.scene,
            this.camera
        );

    }

};


/* ============================================================
   FIN DU MOTEUR 3D
   ============================================================ */
