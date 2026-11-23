/**
 * Engine/dz_core.js
 * Initialisation Three.js, scène, éclairage et contrôles caméra.
 */
(function () {
  "use strict";

  window.DZ = window.DZ || {};

  const DZ = window.DZ;
  const THREE = window.THREE;

  DZ.ctx = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    terrainGroup: null,
    resourcesGroup: null,
    buildingsGroup: null,
    unitsGroup: null,
    effectsGroup: null,
    raycaster: new THREE.Raycaster(),
    pointerNDC: new THREE.Vector2(),
    sunLight: null
  };

  DZ.state = {
    started: false,
    paused: false,
    gameTime: 0,
    eraIndex: 0,
    villageName: (DZ.SETTINGS && DZ.SETTINGS.defaultVillageName) || "Cirta & Atlas",

    resources: Object.assign({}, DZ.INITIAL_RESOURCES || {
      gold: 1000,
      food: 1000,
      wood: 1000,
      iron: 1000,
      stone: 400
    }),

    productionRates: {
      gold: 0,
      food: 0,
      wood: 0,
      iron: 0,
      stone: 0
    },

    priorities: {
      build: "Habitat & Économie",
      production: "Équilibrée",
      transport: "Flux continu vers Magasins",
      development: "Technologies & Époques"
    },

    unlockedTechnologies: [],
    activeResearch: null,
    unlockedWilayas: new Set(),
    resourceNodes: [],
    buildings: [],
    units: [],
    selectedUnit: null,
    selectedBuilding: null,
    activeMission: "move",
    buildModeType: null,
    previewMesh: null,
    selectionRing: null,
    targetMarker: null,
    aiTimer: 0,
    diplomacyStatus: "Trêve tribale",
    conqueredOutposts: 0,

    objectives: {
      placedStart: false,
      builtHouse: false,
      builtProducerOrStore: false,
      unlockedDarElJamaa: false
    }
  };

  DZ.notify = function (msg) {
    const el = document.getElementById("status-toast");

    if (!el) return;

    el.textContent = msg;
    el.classList.remove("hidden");

    clearTimeout(DZ._toastTimeout);

    DZ._toastTimeout = setTimeout(function () {
      el.classList.add("hidden");
    }, 3400);
  };

  DZ.initScene = function (container) {
    if (!container) {
      console.error("DZ CONQUEST : conteneur 3D introuvable.");
      return;
    }

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x9ec5dc);

    const camera = new THREE.PerspectiveCamera(
      48,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.5,
      3500
    );

    camera.position.set(0, 195, 230);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });

    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Éclairage général
    const hemi = new THREE.HemisphereLight(
      0xeef7ff,
      0x7c6a4a,
      0.92
    );

    hemi.position.set(0, 260, 0);
    scene.add(hemi);

    // Lumière principale
    const sunLight = new THREE.DirectionalLight(
      0xfff4d6,
      1.35
    );

    sunLight.position.set(220, 320, 180);
    sunLight.castShadow = true;

    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;

    sunLight.shadow.camera.near = 20;
    sunLight.shadow.camera.far = 1100;

    const d = 420;

    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;

    sunLight.shadow.bias = -0.0005;

    scene.add(sunLight);

    // Lumière secondaire
    const fillLight = new THREE.DirectionalLight(
      0x93c5fd,
      0.35
    );

    fillLight.position.set(-180, 120, -160);
    scene.add(fillLight);

    // Contrôles caméra
    let controls = null;

    if (THREE.OrbitControls) {
      controls = new THREE.OrbitControls(
        camera,
        renderer.domElement
      );

      controls.enableDamping = true;
      controls.dampingFactor = 0.07;

      // Caméra sans rotation
      controls.enableRotate = false;

      // Déplacement et zoom
      controls.enablePan = true;
      controls.enableZoom = true;

      controls.minDistance =
        (DZ.SETTINGS && DZ.SETTINGS.cameraMinDist) || 16;

      controls.maxDistance =
        (DZ.SETTINGS && DZ.SETTINGS.cameraMaxDist) || 900;

      // Bouton gauche réservé à la sélection.
      // Bouton droit : déplacement de la caméra.
      // Molette : zoom.
   controls.mouseButtons = {
  LEFT: THREE.MOUSE.PAN,
  MIDDLE: THREE.MOUSE.DOLLY,
  RIGHT: THREE.MOUSE.PAN
};

      controls.target.set(0, 0, 0);
      controls.update();

      renderer.domElement.addEventListener(
        "contextmenu",
        function (event) {
          event.preventDefault();
        }
      );
    }

    // Groupes 3D
    const terrainGroup = new THREE.Group();
    const resourcesGroup = new THREE.Group();
    const buildingsGroup = new THREE.Group();
    const unitsGroup = new THREE.Group();
    const effectsGroup = new THREE.Group();

    scene.add(
      terrainGroup,
      resourcesGroup,
      buildingsGroup,
      unitsGroup,
      effectsGroup
    );

    // Anneau de sélection
    const ringGeo = new THREE.RingGeometry(
      1.5,
      2.1,
      32
    );

    ringGeo.rotateX(-Math.PI / 2);

    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffd966,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });

    const selectionRing = new THREE.Mesh(
      ringGeo,
      ringMat
    );

    selectionRing.visible = false;
    scene.add(selectionRing);

    // Marqueur de destination
    const markerGeo = new THREE.ConeGeometry(
      0.9,
      2.6,
      12
    );

    markerGeo.rotateX(Math.PI);

    const markerMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      roughness: 0.35
    });

    const targetMarker = new THREE.Mesh(
      markerGeo,
      markerMat
    );

    targetMarker.visible = false;
    scene.add(targetMarker);

    // Enregistrement du contexte
    DZ.ctx.scene = scene;
    DZ.ctx.camera = camera;
    DZ.ctx.renderer = renderer;
    DZ.ctx.controls = controls;

    DZ.ctx.terrainGroup = terrainGroup;
    DZ.ctx.resourcesGroup = resourcesGroup;
    DZ.ctx.buildingsGroup = buildingsGroup;
    DZ.ctx.unitsGroup = unitsGroup;
    DZ.ctx.effectsGroup = effectsGroup;

    DZ.ctx.sunLight = sunLight;

    DZ.state.selectionRing = selectionRing;
    DZ.state.targetMarker = targetMarker;

    // Redimensionnement
    window.addEventListener("resize", function () {
      camera.aspect =
        container.clientWidth /
        Math.max(1, container.clientHeight);

      camera.updateProjectionMatrix();

      renderer.setSize(
        container.clientWidth,
        container.clientHeight
      );
    });

    console.log("DZ CONQUEST : moteur 3D initialisé.");
  };

})();
