/**
 * Engine/dz_buildings.js
 * Construction libre, vérification de pente/collision/terrain, évolution architecturale par époque
 * et déblocage de Dar El Jamaa (Chapitres 3, 8, 9).
 */
(function () {
  "use strict";
  window.DZ = window.DZ || {};
  const DZ = window.DZ;
  const THREE = window.THREE;

  DZ.getBuildingCatalogItem = function (type) {
    return (DZ.BUILDINGS_CATALOG || []).find(function (b) { return b.type === type; }) || null;
  };

  DZ.getBuildingStyledName = function (type, eraIndex) {
    const styles = DZ.BUILDING_ERA_STYLES && DZ.BUILDING_ERA_STYLES[type];
    const idx = Math.max(0, Math.min(9, eraIndex || 0));
    if (styles && styles[idx]) return styles[idx];
    const item = DZ.getBuildingCatalogItem(type);
    return item ? item.label : type;
  };

  DZ.canUnlockDarElJamaa = function () {
    const req = (DZ.INFRASTRUCTURE_RULES && DZ.INFRASTRUCTURE_RULES.darElJamaaUnlock) || { houses: 3, barracks: 1, farms: 1 };
    const bldgs = DZ.state.buildings || [];
    const houses = bldgs.filter(function (b) { return b.owner === "player" && b.type === "house" && b.progress >= 1; }).length;
    const barracks = bldgs.filter(function (b) { return b.owner === "player" && b.type === "barracks" && b.progress >= 1; }).length;
    const farms = bldgs.filter(function (b) { return b.owner === "player" && b.type === "farm" && b.progress >= 1; }).length;
    return houses >= req.houses && barracks >= req.barracks && farms >= req.farms;
  };

  DZ.isBuildingUnlocked = function (type) {
    if (type === "dar_el_jamaa") return DZ.canUnlockDarElJamaa();
    return true;
  };

  function createBuilding3DMesh(type, eraIndex, owner) {
    const g = new THREE.Group();
    const isAI = owner !== "player";
    const era = eraIndex || 0;

    const wallColor = era >= 7 ? 0xd6d3cd : era >= 2 ? 0xe6d5b8 : isAI ? 0x9c5a3c : 0xc89d6c;
    const roofColor = era >= 7 ? 0x374151 : era >= 4 ? 0x15803d : isAI ? 0x7f1d1d : 0x8b4513;

    const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.78 });
    const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.65 });
    const accentMat = new THREE.MeshStandardMaterial({ color: isAI ? 0xef4444 : 0xd4af37, roughness: 0.45, metalness: 0.4 });

    if (type === "house") {
      const base = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.2, 5.2), wallMat);
      base.position.y = 1.6;
      base.castShadow = true;
      base.receiveShadow = true;

      const roof = new THREE.Mesh(new THREE.ConeGeometry(4.3, 2.5, 4), roofMat);
      roof.position.y = 4.45;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      g.add(base, roof);
    } else if (type === "storehouse") {
      const hall = new THREE.Mesh(new THREE.BoxGeometry(8.6, 4.2, 6.8), wallMat);
      hall.position.y = 2.1;
      hall.castShadow = true;
      hall.receiveShadow = true;

      const roof = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.7, 7.4), roofMat);
      roof.position.y = 4.55;
      roof.castShadow = true;
      g.add(hall, roof);
    } else if (type === "barracks") {
      const hall = new THREE.Mesh(new THREE.BoxGeometry(8.2, 3.8, 6.4), wallMat);
      hall.position.y = 1.9;
      hall.castShadow = true;

      const banner = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.2, 0.15), accentMat);
      banner.position.set(0, 4.8, 3.25);
      g.add(hall, banner);
    } else if (type === "dar_el_jamaa") {
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(10.5, 1.0, 8.8), wallMat);
      plinth.position.y = 0.5;
      plinth.castShadow = true;

      const mainHall = new THREE.Mesh(new THREE.BoxGeometry(8.6, 4.4, 7.0), wallMat);
      mainHall.position.y = 3.2;
      mainHall.castShadow = true;

      const dome = new THREE.Mesh(new THREE.SphereGeometry(3.1, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2), accentMat);
      dome.position.y = 5.4;
      dome.castShadow = true;
      g.add(plinth, mainHall, dome);
    } else if (type === "farm") {
      const plot = new THREE.Mesh(
        new THREE.BoxGeometry(8.4, 0.35, 8.4),
        new THREE.MeshStandardMaterial({ color: 0x78552b, roughness: 0.9 })
      );
      plot.position.y = 0.18;
      plot.receiveShadow = true;
      g.add(plot);

      for (let r = -2; r <= 2; r += 2) {
        const crop = new THREE.Mesh(
          new THREE.BoxGeometry(6.8, 0.85, 0.75),
          new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.75 })
        );
        crop.position.set(0, 0.65, r);
        crop.castShadow = true;
        g.add(crop);
      }
    } else {
      const body = new THREE.Mesh(new THREE.BoxGeometry(6.4, 3.6, 6.4), wallMat);
      body.position.y = 1.8;
      body.castShadow = true;

      const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.2, 2.4, 12), roofMat);
      cap.position.y = 4.8;
      cap.castShadow = true;
      g.add(body, cap);
    }

    return g;
  }

  DZ.validateBuildingPlacement = function (type, x, z) {
    const seaLevel = (DZ.TERRAIN_CONFIG && DZ.TERRAIN_CONFIG.seaLevel) || -1.8;
    const hCenter = DZ.getTerrainHeight(x, z);
    if (hCenter < seaLevel + 0.5) {
      return { ok: false, reason: "Placement impossible en mer ou sous le niveau de l'eau." };
    }

    const rules = DZ.INFRASTRUCTURE_RULES || { maxSlopeHeightDiff: 14.5, minBuildingSpacing: 7.0 };
    const pts = [
      DZ.getTerrainHeight(x + 2.2, z),
      DZ.getTerrainHeight(x - 2.2, z),
      DZ.getTerrainHeight(x, z + 2.2),
      DZ.getTerrainHeight(x, z - 2.2)
    ];
    const maxDiff = Math.max.apply(null, pts) - Math.min.apply(null, pts);
    if (maxDiff > rules.maxSlopeHeightDiff) {
      return { ok: false, reason: "Pente trop abrupte pour construire ici." };
    }

    const bldgs = DZ.state.buildings || [];
    for (let i = 0; i < bldgs.length; i++) {
      const b = bldgs[i];
      if (Math.hypot(b.x - x, b.z - z) < rules.minBuildingSpacing) {
        return { ok: false, reason: "Espace insuffisant : trop proche d'un autre bâtiment." };
      }
    }

    const item = DZ.getBuildingCatalogItem(type);
    if (!item) return { ok: false, reason: "Bâtiment inconnu." };
    if (!DZ.isBuildingUnlocked(type)) {
      return { ok: false, reason: "Prérequis non remplis pour débloquer " + item.label + "." };
    }

    const cost = item.cost || {};
    const res = DZ.state.resources || {};
    if ((res.wood || 0) < (cost.wood || 0) || (res.gold || 0) < (cost.gold || 0) || (res.food || 0) < (cost.food || 0) || (res.iron || 0) < (cost.iron || 0)) {
      return { ok: false, reason: "Ressources insuffisantes pour construire " + item.label + "." };
    }

    return { ok: true, y: hCenter };
  };

  DZ.placeBuilding = function (type, x, z, owner, instantComplete) {
    const bOwner = owner || "player";
    const check = DZ.validateBuildingPlacement(type, x, z);
    if (!check.ok && bOwner === "player") {
      DZ.notify(check.reason);
      return null;
    }

    const item = DZ.getBuildingCatalogItem(type);
    if (!item) return null;

    if (bOwner === "player") {
      const c = item.cost || {};
      DZ.state.resources.wood = (DZ.state.resources.wood || 0) - (c.wood || 0);
      DZ.state.resources.gold = (DZ.state.resources.gold || 0) - (c.gold || 0);
      DZ.state.resources.food = (DZ.state.resources.food || 0) - (c.food || 0);
      DZ.state.resources.iron = (DZ.state.resources.iron || 0) - (c.iron || 0);
    }

    const y = check.y !== undefined ? check.y : DZ.getTerrainHeight(x, z);
    const mesh = createBuilding3DMesh(type, DZ.state.eraIndex, bOwner);
    mesh.position.set(x, y, z);
    const initialProg = instantComplete ? 1 : 0.35;
    mesh.scale.setScalar(initialProg);
    DZ.ctx.buildingsGroup.add(mesh);

    const w = DZ.findNearestWilaya ? DZ.findNearestWilaya(x, z) : null;
    const building = {
      id: "b_" + Math.random().toString(36).slice(2, 9),
      type: type,
      label: DZ.getBuildingStyledName(type, DZ.state.eraIndex),
      icon: item.icon,
      owner: bOwner,
      wilayaCode: w ? w.code : "16",
      x: x,
      z: z,
      level: 1,
      hp: 400,
      maxHp: 400,
      progress: initialProg,
      stored: { gold: 0, food: 0, wood: 0, iron: 0, stone: 0 },
      pendingTransport: 0,
      transportDestination: null,
      incomingTotal: 0,
      mesh: mesh
    };

    DZ.state.buildings.push(building);

    if (bOwner === "player") {
      if (type === "house") DZ.state.objectives.builtHouse = true;
      if (["farm", "lumber_camp", "iron_mine", "gold_mine", "quarry", "storehouse"].indexOf(type) !== -1) {
        DZ.state.objectives.builtProducerOrStore = true;
      }
      if (building.progress >= 1) {
        DZ.onBuildingCompleted(building, null);
      } else {
        DZ.notify(building.label + " en construction — affectez un habitant pour l'achever.");
      }
      if (typeof DZ.renderHUD === "function") DZ.renderHUD();
    }

    return building;
  };

  DZ.onBuildingCompleted = function (building) {
    if (!building || building._completedHandled) return;
    building._completedHandled = true;
    building.progress = 1;
    if (building.mesh) building.mesh.scale.setScalar(1);

    if (building.owner === "player") {
      if (building.type === "house" && typeof DZ.onHouseCompletedGrowth === "function") {
        DZ.onHouseCompletedGrowth(building.x, building.z, building.wilayaCode);
      }
      if (!DZ.state.objectives.unlockedDarElJamaa && DZ.canUnlockDarElJamaa()) {
        DZ.state.objectives.unlockedDarElJamaa = true;
        DZ.notify("Dar El Jamaa est désormais débloqué dans la barre de construction !");
      }
      if (typeof DZ.renderHUD === "function") DZ.renderHUD();
    }
  };

  DZ.upgradeBuilding = function (building) {
    if (!building) return;
    const costWood = 90 * building.level;
    const costGold = 60 * building.level;
    if ((DZ.state.resources.wood || 0) < costWood || (DZ.state.resources.gold || 0) < costGold) {
      DZ.notify("Ressources insuffisantes pour améliorer " + building.label + ".");
      return;
    }
    DZ.state.resources.wood -= costWood;
    DZ.state.resources.gold -= costGold;
    building.level += 1;
    building.maxHp += 150;
    building.hp = building.maxHp;
    if (building.mesh) {
      building.mesh.scale.multiplyScalar(1.08);
    }
    DZ.notify(building.label + " amélioré au niveau " + building.level + ".");
    if (typeof DZ.openBuildingModal === "function") DZ.openBuildingModal(building);
    if (typeof DZ.renderHUD === "function") DZ.renderHUD();
  };

  DZ.repairBuilding = function (building) {
    if (!building) return;
    building.hp = building.maxHp;
    DZ.notify(building.label + " réparé à 100%.");
    if (typeof DZ.openBuildingModal === "function") DZ.openBuildingModal(building);
  };

  DZ.updateBuildingPreview = function (pt) {
    const type = DZ.state.buildModeType;
    if (!type || !pt) {
      if (DZ.state.previewMesh && DZ.ctx.scene) {
        DZ.ctx.scene.remove(DZ.state.previewMesh);
        DZ.state.previewMesh = null;
      }
      return;
    }
    if (!DZ.state.previewMesh) {
      const m = createBuilding3DMesh(type, DZ.state.eraIndex, "player");
      m.traverse(function (ch) {
        if (ch.isMesh) {
          ch.material = ch.material.clone();
          ch.material.transparent = true;
          ch.material.opacity = 0.52;
        }
      });
      DZ.state.previewMesh = m;
      DZ.ctx.scene.add(m);
    }
    const check = DZ.validateBuildingPlacement(type, pt.x, pt.z);
    DZ.state.previewMesh.position.set(pt.x, DZ.getTerrainHeight(pt.x, pt.z), pt.z);
    DZ.state.previewMesh.visible = true;
    const tint = check.ok ? 0x34d399 : 0xef4444;
    DZ.state.previewMesh.traverse(function (ch) {
      if (ch.isMesh && ch.material && ch.material.color) {
        ch.material.color.setHex(tint);
      }
    });
  };
})();
