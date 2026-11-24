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
// PERSONNAGES 3D - VERSION AMÉLIORÉE
// DZ CONQUEST
// ========================================================

addUnit(owner, x, z, label, isAI = false) {

    const id = "person_" + owner + "_" + label;

    // ----------------------------------------------------
    // PERSONNAGE DÉJÀ EXISTANT
    // ----------------------------------------------------

    if (this.objects.has(id)) {
        const existing = this.objects.get(id);
        existing.position.set(x, 0, z);
        return existing;
    }

    const character = new THREE.Group();

    const female = /femme|woman|female/i.test(label);
    const builder = /homme|man|builder/i.test(label);

    // ----------------------------------------------------
    // MATÉRIAUX
    // ----------------------------------------------------

    const material = (color, roughness = 0.8, metalness = 0) =>
        new THREE.MeshStandardMaterial({
            color,
            roughness,
            metalness
        });

    const skin = material(0xb98263, 0.82);
    const skinLight = material(0xd09a79, 0.8);
    const skinDark = material(0x87573f, 0.9);

    const hair = material(female ? 0x241710 : 0x29201b);
    const hairLight = material(0x493126);

    const clothes = material(
        isAI ? 0x873e38 : female ? 0x426e70 : 0x9a754d
    );

    const clothDark = material(
        female ? 0x293f43 : 0x394333
    );

    const clothLight = material(
        female ? 0x71918b : 0xb69a70
    );

    const trousers = material(
        female ? 0x343a3d : 0x45463b
    );

    const boots = material(0x30241c);
    const bootLight = material(0x59402c);

    const metal = material(0x777b78, 0.35, 0.7);
    const beltMaterial = material(0x39271c);

    const eyeWhite = material(0xf0e9df);
    const iris = material(0x68442d);
    const pupil = material(0x17120f);
    const mouthMaterial = material(0x693e37);

    // ----------------------------------------------------
    // OUTILS DE CONSTRUCTION
    // ----------------------------------------------------

    const addMesh = (geometry, mat, parent = character) => {

        const mesh = new THREE.Mesh(geometry, mat);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        parent.add(mesh);

        return mesh;
    };

    const sphere = (
        parent,
        mat,
        x, y, z,
        sx, sy, sz,
        widthSegments = 24,
        heightSegments = 16
    ) => {

        const mesh = addMesh(
            new THREE.SphereGeometry(
                1,
                widthSegments,
                heightSegments
            ),
            mat,
            parent
        );

        mesh.position.set(x, y, z);
        mesh.scale.set(sx, sy, sz);

        return mesh;
    };

    const box = (
        parent,
        mat,
        x, y, z,
        sx, sy, sz,
        bevel = 0
    ) => {

        const geometry = bevel > 0
            ? new THREE.BoxGeometry(sx, sy, sz)
            : new THREE.BoxGeometry(sx, sy, sz);

        const mesh = addMesh(geometry, mat, parent);

        mesh.position.set(x, y, z);

        return mesh;
    };

    // Cylindre orienté entre deux points

    const segment = (
        parent,
        mat,
        start,
        end,
        radiusStart,
        radiusEnd = radiusStart
    ) => {

        const a = new THREE.Vector3(...start);
        const b = new THREE.Vector3(...end);

        const direction = new THREE.Vector3()
            .subVectors(b, a);

        const length = direction.length();

        const mesh = addMesh(
            new THREE.CylinderGeometry(
                radiusEnd,
                radiusStart,
                length,
                16,
                2
            ),
            mat,
            parent
        );

        mesh.position.copy(a)
            .add(b)
            .multiplyScalar(0.5);

        mesh.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction.normalize()
        );

        return mesh;
    };

    // ----------------------------------------------------
    // CHAUSSURES
    // ----------------------------------------------------

    for (const side of [-1, 1]) {

        const foot = sphere(
            character,
            boots,
            side * 0.78,
            0.55,
            0.28,
            0.55,
            0.52,
            0.95
        );

        foot.rotation.x = -0.08;

        sphere(
            character,
            bootLight,
            side * 0.78,
            0.3,
            0.3,
            0.53,
            0.12,
            0.9
        );

        // Semelle

        box(
            character,
            boots,
            side * 0.78,
            0.19,
            0.32,
            1.0,
            0.16,
            1.65
        );

    }

    // ----------------------------------------------------
    // JAMBES
    // ----------------------------------------------------

    for (const side of [-1, 1]) {

        const hip = [side * 0.78, 8.6, 0];
        const knee = [side * 0.82, 4.8, 0.02];
        const ankle = [side * 0.78, 1.0, 0];

        segment(
            character,
            trousers,
            hip,
            knee,
            0.77,
            0.57
        );

        sphere(
            character,
            trousers,
            side * 0.82,
            4.8,
            0,
            0.59,
            0.65,
            0.59
        );

        segment(
            character,
            trousers,
            knee,
            ankle,
            0.56,
            0.36
        );

        // Genouillère / pli du pantalon

        sphere(
            character,
            clothDark,
            side * 0.82,
            4.9,
            0.49,
            0.38,
            0.28,
            0.12
        );

        // Ourlet

        sphere(
            character,
            clothDark,
            side * 0.78,
            1.0,
            0,
            0.39,
            0.2,
            0.4
        );

    }

    // ----------------------------------------------------
    // TUNIQUE OU VESTE
    // ----------------------------------------------------

    const torso = sphere(
        character,
        clothes,
        0,
        11.5,
        0,
        female ? 1.48 : 1.65,
        3.05,
        0.95
    );

    // Ventre et silhouette du vêtement

    sphere(
        character,
        clothes,
        0,
        9.5,
        0,
        1.45,
        1.15,
        0.95
    );

    // Veste intérieure

    box(
        character,
        clothDark,
        0,
        11.4,
        0.92,
        0.12,
        3.8,
        0.08
    );

    // Col

    const collar = addMesh(
        new THREE.CylinderGeometry(
            0.38,
            0.53,
            0.55,
            20
        ),
        clothLight
    );

    collar.position.set(0, 14.15, 0);

    // Coutures verticales

    for (const side of [-1, 1]) {

        segment(
            character,
            clothLight,
            [side * 1.15, 13.3, 0.65],
            [side * 1.15, 9.7, 0.75],
            0.035
        );

    }

    // Boutons

    for (let i = 0; i < 4; i++) {

        sphere(
            character,
            metal,
            0,
            13.1 - i * 0.8,
            0.99,
            0.08,
            0.08,
            0.045,
            12,
            8
        );

    }

    // Poches de la veste

    for (const side of [-1, 1]) {

        box(
            character,
            clothDark,
            side * 0.93,
            11.5,
            0.85,
            0.55,
            0.65,
            0.12
        );

        box(
            character,
            clothLight,
            side * 0.93,
            11.85,
            0.92,
            0.58,
            0.12,
            0.1
        );

    }

    // ----------------------------------------------------
    // TENUE FÉMININE : TUNIQUE LONGUE
    // ----------------------------------------------------

    if (female) {

        const tunic = addMesh(
            new THREE.CylinderGeometry(
                1.8,
                2.05,
                3.5,
                32,
                3
            ),
            clothes
        );

        tunic.position.set(0, 8.4, 0);

        // Bord inférieur de la tunique

        const hem = addMesh(
            new THREE.TorusGeometry(
                1.95,
                0.055,
                8,
                32
            ),
            clothLight
        );

        hem.rotation.x = Math.PI / 2;
        hem.position.y = 6.65;

        // Décoration discrète

        for (const side of [-1, 1]) {

            segment(
                character,
                clothLight,
                [side * 0.7, 9.9, 0.95],
                [side * 0.7, 7.0, 1.25],
                0.035
            );

        }

    }

    // ----------------------------------------------------
    // CEINTURE
    // ----------------------------------------------------

    const belt = addMesh(
        new THREE.TorusGeometry(
            1.45,
            0.13,
            10,
            40
        ),
        beltMaterial
    );

    belt.rotation.x = Math.PI / 2;
    belt.position.y = 9.15;

    box(
        character,
        metal,
        0,
        9.15,
        1.43,
        0.35,
        0.35,
        0.12
    );

    // ----------------------------------------------------
    // ÉPAULES ET BRAS
    // ----------------------------------------------------

    for (const side of [-1, 1]) {

        const shoulder = [side * 1.48, 13.3, 0];
        const elbow = [side * 2.05, 10.5, 0.1];
        const wrist = [side * 2.0, 8.0, 0.35];

        sphere(
            character,
            clothes,
            shoulder[0],
            shoulder[1],
            shoulder[2],
            0.76,
            0.8,
            0.8
        );

        segment(
            character,
            clothes,
            shoulder,
            elbow,
            0.67,
            0.49
        );

        sphere(
            character,
            clothes,
            elbow[0],
            elbow[1],
            elbow[2],
            0.49,
            0.5,
            0.49
        );

        segment(
            character,
            skin,
            elbow,
            wrist,
            0.43,
            0.29
        );

        // Poignet

        sphere(
            character,
            skinLight,
            wrist[0],
            wrist[1],
            wrist[2],
            0.3,
            0.35,
            0.3
        );

        // Main

        sphere(
            character,
            skin,
            side * 2.0,
            7.55,
            0.42,
            0.38,
            0.48,
            0.25
        );

        // Doigts

        for (let finger = 0; finger < 4; finger++) {

            const offset = (finger - 1.5) * 0.14;

            segment(
                character,
                skin,
                [
                    side * 2.0 + offset,
                    7.42,
                    0.52
                ],
                [
                    side * 2.0 + offset,
                    7.08,
                    0.56
                ],
                0.085,
                0.065
            );

        }

        // Pouce

        segment(
            character,
            skin,
            [
                side * 1.72,
                7.65,
                0.45
            ],
            [
                side * 1.61,
                7.38,
                0.58
            ],
            0.12,
            0.09
        );

        // Manchette

        const cuff = addMesh(
            new THREE.CylinderGeometry(
                0.3,
                0.33,
                0.22,
                16
            ),
            clothDark
        );

        cuff.position.set(
            side * 2.0,
            7.95,
            0.35
        );

    }

    // ----------------------------------------------------
    // COU
    // ----------------------------------------------------

    segment(
        character,
        skin,
        [0, 14.0, 0],
        [0, 15.4, 0],
        0.48,
        0.43
    );

    // ----------------------------------------------------
    // TÊTE
    // ----------------------------------------------------

    const head = sphere(
        character,
        skin,
        0,
        16.7,
        0,
        1.35,
        1.7,
        1.18,
        32,
        24
    );

    // Mâchoire

    sphere(
        character,
        skin,
        0,
        15.85,
        0.28,
        1.08,
        0.85,
        0.94
    );

    // Joues

    for (const side of [-1, 1]) {

        sphere(
            character,
            skinLight,
            side * 0.79,
            16.3,
            0.68,
            0.42,
            0.43,
            0.3
        );

    }

    // ----------------------------------------------------
    // OREILLES
    // ----------------------------------------------------

    for (const side of [-1, 1]) {

        sphere(
            character,
            skin,
            side * 1.3,
            16.7,
            0,
            0.28,
            0.52,
            0.32
        );

        sphere(
            character,
            skinDark,
            side * 1.43,
            16.7,
            0.13,
            0.11,
            0.25,
            0.12
        );

    }

    // ----------------------------------------------------
    // YEUX ET SOURCILS
    // ----------------------------------------------------

    for (const side of [-1, 1]) {

        // Contour des yeux

        sphere(
            character,
            skinDark,
            side * 0.53,
            17.0,
            0.99,
            0.43,
            0.29,
            0.14
        );

        // Blanc de l'œil

        sphere(
            character,
            eyeWhite,
            side * 0.53,
            17.02,
            1.09,
            0.36,
            0.21,
            0.12
        );

        // Iris

        sphere(
            character,
            iris,
            side * 0.53,
            17.02,
            1.2,
            0.16,
            0.17,
            0.06
        );

        // Pupille

        sphere(
            character,
            pupil,
            side * 0.53,
            17.02,
            1.25,
            0.075,
            0.11,
            0.035
        );

        // Reflet de l'œil

        sphere(
            character,
            eyeWhite,
            side * 0.49,
            17.09,
            1.29,
            0.035,
            0.035,
            0.02,
            8,
            8
        );

        // Sourcils

        segment(
            character,
            hair,
            [
                side * 0.87,
                17.48,
                1.02
            ],
            [
                side * 0.25,
                17.53,
                1.08
            ],
            0.095,
            0.07
        );

    }

    // ----------------------------------------------------
    // NEZ
    // ----------------------------------------------------

    sphere(
        character,
        skinLight,
        0,
        16.65,
        1.15,
        0.27,
        0.48,
        0.35
    );

    sphere(
        character,
        skin,
        0,
        16.38,
        1.22,
        0.36,
        0.23,
        0.3
    );

    for (const side of [-1, 1]) {

        sphere(
            character,
            skinDark,
            side * 0.19,
            16.34,
            1.43,
            0.07,
            0.055,
            0.035,
            10,
            8
        );

    }

    // ----------------------------------------------------
    // BOUCHE
    // ----------------------------------------------------

    sphere(
        character,
        mouthMaterial,
        0,
        15.95,
        1.15,
        0.29,
        0.09,
        0.08
    );

    // Lèvre inférieure

    sphere(
        character,
        skinLight,
        0,
        15.84,
        1.13,
        0.24,
        0.055,
        0.06
    );

    // ----------------------------------------------------
    // CHEVEUX
    // ----------------------------------------------------

    sphere(
        character,
        hair,
        0,
        17.95,
        -0.12,
        1.38,
        0.75,
        1.25,
        32,
        20
    );

    // Ligne frontale des cheveux

    sphere(
        character,
        hair,
        0,
        17.58,
        0.85,
        1.08,
        0.33,
        0.38
    );

    if (female) {

        // Cheveux longs sur les côtés

        for (const side of [-1, 1]) {

            sphere(
                character,
                hair,
                side * 1.05,
                16.2,
                -0.22,
                0.38,
                1.85,
                0.48
            );

            sphere(
                character,
                hairLight,
                side * 1.15,
                15.6,
                -0.1,
                0.13,
                1.1,
                0.12
            );

        }

        // Arrière des cheveux

        sphere(
            character,
            hair,
            0,
            16.1,
            -0.82,
            1.1,
            1.8,
            0.48
        );

    } else {

        // Barbe

        sphere(
            character,
            hair,
            0,
            15.65,
            0.84,
            0.95,
            0.62,
            0.42
        );

        // Moustache

        for (const side of [-1, 1]) {

            sphere(
                character,
                hairLight,
                side * 0.23,
                16.08,
                1.19,
                0.34,
                0.12,
                0.13
            );

        }

    }

    // ----------------------------------------------------
    // SAC À OUTILS DU CONSTRUCTEUR
    // ----------------------------------------------------

    if (!female && builder) {

        const backpack = box(
            character,
            clothDark,
            0,
            11.7,
            -1.0,
            1.9,
            2.9,
            0.85
        );

        backpack.rotation.x = -0.08;

        // Poche du sac

        box(
            character,
            clothLight,
            0,
            10.8,
            -1.48,
            1.15,
            0.9,
            0.12
        );

        // Bretelles

        for (const side of [-1, 1]) {

            segment(
                character,
                beltMaterial,
                [
                    side * 0.75,
                    13.2,
                    0.75
                ],
                [
                    side * 0.75,
                    10.4,
                    0.9
                ],
                0.12
            );

        }

        // Petit outil métallique

        const tool = addMesh(
            new THREE.CylinderGeometry(
                0.055,
                0.055,
                1.8,
                10
            ),
            metal
        );

        tool.position.set(0.9, 10.8, -1.55);
        tool.rotation.z = 0.3;

    }

    // ----------------------------------------------------
    // IDENTITÉ DU PERSONNAGE
    // ----------------------------------------------------

    character.position.set(x, 0, z);

    character.userData = {
        kind: "person",
        label: label,
        owner: owner,
        gender: female ? "female" : "male",
        isAI: isAI
    };

    // ----------------------------------------------------
    // AJOUT À LA SCÈNE
    // ----------------------------------------------------

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
