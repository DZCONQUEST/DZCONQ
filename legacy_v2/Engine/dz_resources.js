/**
 * Engine/dz_resources.js
 * Génération, détection au clic et gestion des nœuds naturels de ressources (forêt/bois, nourriture, fer, or, pierre).
 */
(function () {
  "use strict";
  window.DZ = window.DZ || {};
  const DZ = window.DZ;
  const THREE = window.THREE;

  function makeTreeMesh(scale) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.42, 2.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.85 })
    );
    trunk.position.y = 1.3;
    trunk.castShadow = true;

    const crown1 = new THREE.Mesh(
      new THREE.ConeGeometry(1.75, 3.4, 9),
      new THREE.MeshStandardMaterial({ color: 0x245929, roughness: 0.78 })
    );
    crown1.position.y = 3.5;
    crown1.castShadow = true;

    const crown2 = new THREE.Mesh(
      new THREE.ConeGeometry(1.3, 2.7, 9),
      new THREE.MeshStandardMaterial({ color: 0x2e6f34, roughness: 0.75 })
    );
    crown2.position.y = 5.1;
    crown2.castShadow = true;

    g.add(trunk, crown1, crown2);
    g.scale.setScalar(scale || 1);
    return g;
  }

  function makeRockDepositMesh(colorHex, scale) {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.72, metalness: 0.15 });
    const m1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.45, 0), mat);
    m1.scale.set(1.2, 0.85, 1.0);
    m1.position.y = 0.85;
    m1.castShadow = true;

    const m2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.95, 0), mat);
    m2.position.set(1.05, 0.55, 0.45);
    m2.castShadow = true;

    g.add(m1, m2);
    g.scale.setScalar(scale || 1);
    return g;
  }

  function makeFoodPatchMesh(scale) {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x84a928, roughness: 0.8 });
    for (let i = 0; i < 5; i++) {
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.35, 7), mat);
      const ang = (i / 5) * Math.PI * 2;
      tuft.position.set(Math.cos(ang) * 0.9, 0.65, Math.sin(ang) * 0.9);
      tuft.castShadow = true;
      g.add(tuft);
    }
    g.scale.setScalar(scale || 1);
    return g;
  }

  DZ.spawnResourceNode = function (kind, x, z, amount) {
    const group = DZ.ctx.resourcesGroup;
    if (!group) return null;
    const y = DZ.getTerrainHeight(x, z);
    if (y < ((DZ.TERRAIN_CONFIG && DZ.TERRAIN_CONFIG.seaLevel) || -1.8) + 0.4) return null;

    let mesh = null;
    const sc = 0.85 + Math.random() * 0.45;
    if (kind === "wood") mesh = makeTreeMesh(sc);
    else if (kind === "iron") mesh = makeRockDepositMesh(0x525866, sc);
    else if (kind === "gold") mesh = makeRockDepositMesh(0xd4a017, sc);
    else if (kind === "stone") mesh = makeRockDepositMesh(0x9ca3af, sc);
    else mesh = makeFoodPatchMesh(sc);

    mesh.position.set(x, y, z);
    mesh.rotation.y = Math.random() * Math.PI * 2;
    group.add(mesh);

    const node = {
      id: "res_" + Math.random().toString(36).slice(2, 9),
      kind: kind,
      x: x,
      z: z,
      amount: amount || 800,
      mesh: mesh
    };
    DZ.state.resourceNodes.push(node);
    return node;
  };

  DZ.populateNaturalResources = function () {
    const group = DZ.ctx.resourcesGroup;
    if (group) group.clear();
    DZ.state.resourceNodes = [];

    const wilayas = DZ.WILAYAS || [];
    for (let i = 0; i < wilayas.length; i++) {
      const w = wilayas[i];
      const center = DZ.lonLatToWorld ? DZ.lonLatToWorld(w.lon, w.lat) : { x: 0, z: 0 };
      const kinds = ["wood", "food", "iron", "gold", "stone"];
      for (let k = 0; k < kinds.length; k++) {
        const kind = kinds[k];
        const count = kind === "wood" && w.wood > 75 ? 5 : 2;
        for (let c = 0; c < count; c++) {
          const ang = (k * 1.25 + c * 0.8 + i * 0.37) % (Math.PI * 2);
          const rad = 8 + ((i * 7 + c * 11) % 24);
          DZ.spawnResourceNode(kind, center.x + Math.cos(ang) * rad, center.z + Math.sin(ang) * rad, 1200);
        }
      }
    }
  };

  DZ.findClickedResource = function (event, terrainPoint) {
    const { renderer, camera, raycaster, pointerNDC, resourcesGroup } = DZ.ctx;
    const nodes = DZ.state.resourceNodes || [];
    if (!nodes.length) return null;

    if (renderer && camera && resourcesGroup) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNDC, camera);
      const meshes = nodes.map(function (n) { return n.mesh; }).filter(Boolean);
      const hits = raycaster.intersectObjects(meshes, true);
      if (hits && hits.length > 0) {
        let obj = hits[0].object;
        while (obj.parent && obj.parent !== resourcesGroup) {
          obj = obj.parent;
        }
        const matched = nodes.find(function (n) { return n.mesh === obj && n.amount > 0; });
        if (matched) return matched;
      }
    }

    if (terrainPoint) {
      let best = null;
      let bestDist = 4.2;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.amount <= 0) continue;
        const d = Math.hypot(n.x - terrainPoint.x, n.z - terrainPoint.z);
        if (d <= bestDist) {
          bestDist = d;
          best = n;
        }
      }
      if (best) return best;
    }

    return null;
  };

  DZ.findNearestResource = function (x, z, kind) {
    let best = null;
    let bestD2 = Infinity;
    const nodes = DZ.state.resourceNodes || [];
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (kind && n.kind !== kind) continue;
      if (n.amount <= 0) continue;
      const dx = n.x - x;
      const dz = n.z - z;
      const d2 = dx * dx + dz * dz;
      if (d2 < bestD2) {
        bestD2 = d2;
        best = n;
      }
    }
    return best;
  };
})();
