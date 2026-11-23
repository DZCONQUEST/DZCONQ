/**
 * Engine/dz_units.js
 * Représentation 3D détaillée des habitants et unités militaires.
 * Détection des collisions avec les bâtiments.
 */
(function () {
  "use strict";

  window.DZ = window.DZ || {};
  const DZ = window.DZ;
  const THREE = window.THREE;

  // =========================================================
  // COULEURS
  // =========================================================

  function pickRandomClothColor() {
    const pal = DZ.CLOTH_PALETTE || [
      "#2563eb", "#0d9488", "#d97706",
      "#dc2626", "#7c3aed", "#16a34a"
    ];

    return new THREE.Color(
      pal[Math.floor(Math.random() * pal.length)]
    );
  }

  // =========================================================
  // MARTEAU AU-DESSUS DU PERSONNAGE
  // =========================================================

  function createOverheadHammerMesh() {
    const hg = new THREE.Group();
    hg.name = "overhead_hammer";

    const handleMat = new THREE.MeshStandardMaterial({
      color: 0x8b5a2b,
      roughness: 0.75
    });

    const headMat = new THREE.MeshStandardMaterial({
      color: 0xffd966,
      emissive: 0xd97706,
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.8
    });

    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 1.25, 8),
      handleMat
    );

    handle.position.y = 0.45;
    handle.rotation.z = -0.25;

    const hammerHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.42, 0.42),
      headMat
    );

    hammerHead.position.set(0.14, 1.05, 0);
    hammerHead.rotation.z = -0.25;

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 0.72, 20),
      new THREE.MeshBasicMaterial({
        color: 0xffd966,
        side: THREE.DoubleSide
      })
    );

    halo.position.y = 0.65;

    hg.add(handle, hammerHead, halo);
    hg.position.set(0, 4.95, 0);
    hg.visible = false;

    return hg;
  }

  // =========================================================
  // CRÉATION DES PERSONNAGES
  // =========================================================

  function createHumanCharacterMesh(role, sex, owner, clothHex) {
    const root = new THREE.Group();

    const isFemale = sex === "F";
    const isSoldier = role === "soldier";
    const isChariot = role === "chariot";

    const skinColor = isFemale ? 0xf0c39d : 0xdca275;

    const skinMat = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.56
    });

    const clothColor = clothHex
      ? new THREE.Color(clothHex)
      : pickRandomClothColor();

    const clothMat = new THREE.MeshStandardMaterial({
      color: clothColor,
      roughness: 0.72
    });

    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x23272e,
      roughness: 0.8
    });

    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.28,
      metalness: 0.82
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.3,
      metalness: 0.78
    });

    // CHAR

    if (isChariot) {
      const hull = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 1.4, 4.6),
        clothMat
      );

      hull.position.y = 1.4;
      hull.castShadow = true;
      root.add(hull);

      [-1.85, 1.85].forEach(function (wx) {
        [-1.4, 1.4].forEach(function (wz) {
          const wheel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.95, 0.95, 0.35, 16),
            darkMat
          );

          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(wx, 0.95, wz);
          wheel.castShadow = true;

          root.add(wheel);
        });
      });

      const driver = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.55, 1.7, 12),
        skinMat
      );

      driver.position.set(0, 2.8, 0.4);
      driver.castShadow = true;
      root.add(driver);

      root.userData = {
        leftLeg: null,
        rightLeg: null,
        leftArm: null,
        rightArm: null,
        torso: hull,
        head: driver,
        hammer: null,
        clothHex: clothColor.getStyle()
      };

      return root;
    }

    // JAMBES

    const leftLeg = new THREE.Group();
    leftLeg.position.set(isFemale ? -0.28 : -0.32, 1.65, 0);

    const lLegMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.17, 1.55, 12),
      darkMat
    );

    lLegMesh.position.y = -0.78;
    lLegMesh.castShadow = true;
    leftLeg.add(lLegMesh);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(isFemale ? 0.28 : 0.32, 1.65, 0);

    const rLegMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.17, 1.55, 12),
      darkMat
    );

    rLegMesh.position.y = -0.78;
    rLegMesh.castShadow = true;
    rightLeg.add(rLegMesh);

    // CORPS

    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(
        isFemale ? 0.44 : 0.56,
        isFemale ? 0.56 : 0.52,
        1.55,
        16
      ),
      isSoldier ? metalMat : clothMat
    );

    torso.position.y = 2.42;
    torso.castShadow = true;

    const sash = new THREE.Mesh(
      new THREE.CylinderGeometry(0.58, 0.58, 0.22, 16),
      isSoldier ? goldMat : clothMat
    );

    sash.position.y = 1.75;

    // BRAS

    const leftArm = new THREE.Group();
    leftArm.position.set(isFemale ? -0.58 : -0.72, 3.05, 0);

    const lArmMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.12, 1.2, 10),
      isSoldier ? metalMat : skinMat
    );

    lArmMesh.position.y = -0.58;
    lArmMesh.castShadow = true;
    leftArm.add(lArmMesh);

    const rightArm = new THREE.Group();
    rightArm.position.set(isFemale ? 0.58 : 0.72, 3.05, 0);

    const rArmMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.12, 1.2, 10),
      isSoldier ? metalMat : skinMat
    );

    rArmMesh.position.y = -0.58;
    rArmMesh.castShadow = true;
    rightArm.add(rArmMesh);

    // ÉQUIPEMENT SOLDAT

    if (isSoldier) {
      const shield = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 0.85, 0.14, 18),
        clothMat
      );

      shield.rotation.z = Math.PI / 2;
      shield.position.set(0, -0.75, 0.35);
      shield.castShadow = true;
      leftArm.add(shield);

      const spear = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 3.8, 8),
        darkMat
      );

      spear.position.set(0, -0.2, 0.25);
      spear.castShadow = true;
      rightArm.add(spear);
    }

    // TÊTE

    const head = new THREE.Group();
    head.position.y = 3.68;

    const skull = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 16, 16),
      skinMat
    );

    skull.castShadow = true;
    head.add(skull);

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x1e1610,
      roughness: 0.75
    });

    if (isSoldier) {
      const helm = new THREE.Mesh(
        new THREE.SphereGeometry(
          0.46, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58
        ),
        metalMat
      );

      helm.position.y = 0.04;
      helm.castShadow = true;
      head.add(helm);

    } else if (isFemale) {
      const bun = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 12, 12),
        hairMat
      );

      bun.position.set(0, 0.14, -0.42);
      head.add(bun);

    } else {
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(
          0.44, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.52
        ),
        hairMat
      );

      cap.position.y = 0.05;
      head.add(cap);
    }

    const hammer = (!isSoldier && owner === "player")
      ? createOverheadHammerMesh()
      : null;

    const badge = new THREE.Mesh(
      new THREE.RingGeometry(0.75, 1.05, 24),
      new THREE.MeshBasicMaterial({
        color: owner === "player" ? 0x34d399 : 0xef4444,
        side: THREE.DoubleSide
      })
    );

    badge.rotation.x = -Math.PI / 2;
    badge.position.y = 0.05;

    root.add(
      leftLeg,
      rightLeg,
      torso,
      sash,
      leftArm,
      rightArm,
      head,
      badge
    );

    if (hammer) root.add(hammer);

    root.userData = {
      leftLeg: leftLeg,
      rightLeg: rightLeg,
      leftArm: leftArm,
      rightArm: rightArm,
      torso: torso,
      head: head,
      hammer: hammer,
      clothHex: clothColor.getStyle()
    };

    return root;
  }

  // =========================================================
  // CRÉATION D'UNE UNITÉ
  // =========================================================

  DZ.spawnUnit = function (
    owner,
    wilayaCode,
    role,
    sex,
    x,
    z,
    customName,
    clothHex
  ) {
    const group = DZ.ctx.unitsGroup;
    if (!group) return null;

    const y = DZ.getTerrainHeight(x, z);

    const mesh = createHumanCharacterMesh(
      role,
      sex,
      owner,
      clothHex
    );

    mesh.position.set(x, y, z);
    group.add(mesh);

    const statsCatalog = DZ.UNIT_STATS || {};

    const statKey = role === "civil"
      ? (sex === "F" ? "civil_woman" : "civil_man")
      : role;

    const st = statsCatalog[statKey] || {
      attack: 10,
      defense: 5,
      hp: 100,
      speed: 25,
      range: 1,
      namePrefix: "Unité"
    };

    const countSame = (DZ.state.units || []).filter(function (u) {
      return u.owner === owner && u.role === role;
    }).length;

    const unit = {
      id: "u_" + Math.random().toString(36).slice(2, 9),
      name: customName || (st.namePrefix + " #" + (countSame + 1)),
      owner: owner || "player",
      wilayaCode: wilayaCode || "16",
      role: role || "civil",
      sex: sex || "M",
      clothColor: mesh.userData.clothHex,
      x: x,
      z: z,
      hp: st.hp,
      maxHp: st.hp,
      attack: st.attack,
      defense: st.defense,
      speed: st.speed,
      range: st.range,
      walkPhase: Math.random() * Math.PI * 2,
      workPhase: 0,
      mission: "move",
      targetPos: null,
      targetNode: null,
      targetBuilding: null,
      patrolCenter: null,
      carryKind: null,
      carryAmount: 0,
      mesh: mesh
    };

    DZ.state.units.push(unit);

    return unit;
  };

  // =========================================================
  // RECRUTEMENT
  // =========================================================

  DZ.recruitUnit = function (unitType, barracksBuilding) {
    const st = (DZ.UNIT_STATS && DZ.UNIT_STATS[unitType]) || null;
    if (!st) return;

    const cost = st.cost || {};
    const res = DZ.state.resources;

    for (const k in cost) {
      if ((res[k] || 0) < cost[k]) {
        DZ.notify(
          "Ressources insuffisantes pour recruter " +
          st.namePrefix + "."
        );
        return;
      }
    }

    for (const k in cost) {
      res[k] -= cost[k];
    }

    const bx = barracksBuilding ? barracksBuilding.x + 5.5 : 0;
    const bz = barracksBuilding ? barracksBuilding.z + 4.5 : 0;

    const w = DZ.findNearestWilaya
      ? DZ.findNearestWilaya(bx, bz)
      : null;

    DZ.spawnUnit(
      "player",
      w ? w.code : "16",
      st.role,
      st.sex,
      bx,
      bz
    );

    DZ.notify(
      st.namePrefix +
      " recruté (Attaque " + st.attack +
      " • Vitesse " + st.speed + ")."
    );

    if (typeof DZ.renderHUD === "function") {
      DZ.renderHUD();
    }
  };

  // =========================================================
  // SÉLECTION DES UNITÉS
  // =========================================================

  DZ.findClickedUnit = function (event, terrainPoint) {
    const {
      renderer,
      camera,
      raycaster,
      pointerNDC,
      unitsGroup
    } = DZ.ctx;

    if (!renderer || !camera || !unitsGroup) return null;

    const rect = renderer.domElement.getBoundingClientRect();

    pointerNDC.x =
      ((event.clientX - rect.left) / rect.width) * 2 - 1;

    pointerNDC.y =
      -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointerNDC, camera);

    const playerUnits = (DZ.state.units || []).filter(function (u) {
      return u.owner === "player";
    });

    const playerMeshes = playerUnits
      .map(function (u) {
        return u.mesh;
      })
      .filter(Boolean);

    const hits = raycaster.intersectObjects(playerMeshes, true);

    if (hits && hits.length > 0) {
      let clickedHammer = false;
      let obj = hits[0].object;

      while (obj) {
        if (obj.name === "overhead_hammer") {
          clickedHammer = true;
        }

        if (obj.parent === unitsGroup) break;

        obj = obj.parent;
      }

      const matched = playerUnits.find(function (u) {
        return u.mesh === obj;
      });

      if (matched) {
        matched._clickedHammer = clickedHammer;
        return matched;
      }
    }

    if (terrainPoint) {
      let bestUnit = null;
      let bestDist = 3.2;

      for (let i = 0; i < playerUnits.length; i++) {
        const u = playerUnits[i];

        const d = Math.hypot(
          u.x - terrainPoint.x,
          u.z - terrainPoint.z
        );

        if (d <= bestDist) {
          bestDist = d;
          bestUnit = u;
        }
      }

      if (bestUnit) {
        bestUnit._clickedHammer = false;
        return bestUnit;
      }
    }

    return null;
  };

  // =========================================================
  // MARQUEUR DE DESTINATION
  // =========================================================

  DZ.setDestinationMarker = function (x, z) {
    const marker = DZ.state.targetMarker;
    if (!marker) return;

    marker.position.set(
      x,
      DZ.getTerrainHeight(x, z) + 1.4,
      z
    );

    marker.visible = true;
  };

  // =========================================================
  // MISSIONS
  // =========================================================

  DZ.assignMissionToUnit = function (unit, mission, pt) {
    if (!unit || !pt) return;

    unit.mission = mission || "move";

    if (
      (
        mission === "wood" ||
        mission === "food" ||
        mission === "iron" ||
        mission === "gold" ||
        mission === "stone"
      ) &&
      typeof DZ.findNearestResource === "function"
    ) {
      const node = DZ.findNearestResource(
        pt.x,
        pt.z,
        mission
      );

      if (node) {
        unit.targetNode = node;
        unit.targetBuilding = null;
        unit.targetPos = {
          x: node.x,
          z: node.z
        };

        DZ.setDestinationMarker(node.x, node.z);
        return;
      }
    }

    if (mission === "build") {
      const unfinished = (DZ.state.buildings || []).find(
        function (b) {
          return b.owner === "player" && b.progress < 1;
        }
      );

      if (unfinished) {
        unit.targetBuilding = unfinished;
        unit.targetNode = null;
        unit.targetPos = {
          x: unfinished.x,
          z: unfinished.z
        };

        DZ.setDestinationMarker(
          unfinished.x,
          unfinished.z
        );

        return;
      }
    }

    unit.targetNode = null;
    unit.targetBuilding = null;
    unit.targetPos = {
      x: pt.x,
      z: pt.z
    };

    DZ.setDestinationMarker(pt.x, pt.z);
  };

  // =========================================================
  // ANIMATION IMMOBILE
  // =========================================================

  function animateIdle(u, dt) {
    const ud = u.mesh && u.mesh.userData;
    if (!ud) return;

    u.walkPhase += dt * 2.2;

    const sway = Math.sin(u.walkPhase) * 0.04;

    if (ud.leftLeg) ud.leftLeg.rotation.x *= 0.8;
    if (ud.rightLeg) ud.rightLeg.rotation.x *= 0.8;

    if (ud.leftArm) {
      ud.leftArm.rotation.x *= 0.8;
      ud.leftArm.rotation.z = -0.05 + sway;
    }

    if (ud.rightArm) {
      ud.rightArm.rotation.x *= 0.8;
      ud.rightArm.rotation.z = 0.05 - sway;
    }
  }

  // =========================================================
  // ANIMATION DE TRAVAIL
  // =========================================================

  function animateWork(u, dt) {
    const ud = u.mesh && u.mesh.userData;
    if (!ud) return;

    u.workPhase += dt * 9.0;

    const sw = Math.sin(u.workPhase);

    if (ud.rightArm) {
      ud.rightArm.rotation.x = -0.95 + sw * 0.75;
    }

    if (ud.torso) {
      ud.torso.rotation.x = 0.1 + sw * 0.07;
    }
  }

  // =========================================================
  // DÉTECTION DES COLLISIONS AVEC LES BÂTIMENTS
  // =========================================================

  function getBuildingCollisionBox(building) {
    if (!building || !building.mesh) return null;

    const mesh = building.mesh;

    mesh.updateWorldMatrix(true, true);

    const box = new THREE.Box3().setFromObject(mesh);

    if (box.isEmpty()) return null;

    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    const worldScale = new THREE.Vector3();

    box.getCenter(center);
    box.getSize(size);
    mesh.getWorldScale(worldScale);

    // La construction fait progressivement grandir le mesh.
    // On reconstitue son emprise finale pour éviter
    // que les personnages traversent un bâtiment inachevé.

    const scaleX = Math.max(0.01, Math.abs(worldScale.x));
    const scaleZ = Math.max(0.01, Math.abs(worldScale.z));

    const halfX = (size.x / scaleX) / 2;
    const halfZ = (size.z / scaleZ) / 2;

    const finalBox = {
      minX: center.x - halfX,
      maxX: center.x + halfX,
      minZ: center.z - halfZ,
      maxZ: center.z + halfZ
    };

    return finalBox;
  }

  function getBuildingCollisionBoxes() {
    const buildings = DZ.state.buildings || [];
    const boxes = [];

    for (let i = 0; i < buildings.length; i++) {
      const building = buildings[i];

      const box = getBuildingCollisionBox(building);

      if (box) {
        boxes.push(box);
      }
    }

    return boxes;
  }

  function getInsideDepth(x, z, box) {
    if (
      x <= box.minX ||
      x >= box.maxX ||
      z <= box.minZ ||
      z >= box.maxZ
    ) {
      return -1;
    }

    return Math.min(
      x - box.minX,
      box.maxX - x,
      z - box.minZ,
      box.maxZ - z
    );
  }

  function isBlockedByBuilding(
    x,
    z,
    previousX,
    previousZ,
    boxes
  ) {
    const collisionBoxes = boxes || getBuildingCollisionBoxes();

    // Rayon de sécurité autour du personnage.
    const radius = 1.15;

    for (let i = 0; i < collisionBoxes.length; i++) {
      const box = collisionBoxes[i];

      const expanded = {
        minX: box.minX - radius,
        maxX: box.maxX + radius,
        minZ: box.minZ - radius,
        maxZ: box.maxZ + radius
      };

      const candidateDepth = getInsideDepth(
        x,
        z,
        expanded
      );

      if (candidateDepth >= 0) {
        // Si le personnage est déjà dans le bâtiment,
        // on autorise un mouvement qui le rapproche de la sortie.

        if (
          previousX !== undefined &&
          previousZ !== undefined
        ) {
          const previousDepth = getInsideDepth(
            previousX,
            previousZ,
            expanded
          );

          if (
            previousDepth >= 0 &&
            candidateDepth < previousDepth
          ) {
            continue;
          }
        }

        return true;
      }
    }

    return false;
  }

  // =========================================================
  // DÉPLACEMENT AVEC CONTOURNEMENT DES BÂTIMENTS
  // =========================================================

  function stepMoveUnit(u, tx, tz, dt) {
    const dx = tx - u.x;
    const dz = tz - u.z;

    const dist = Math.hypot(dx, dz);

    if (dist < 0.05) {
      animateIdle(u, dt);
      return;
    }

    const mods = typeof DZ.getTechModifiers === "function"
      ? DZ.getTechModifiers()
      : { speedMult: 1 };

    const effectiveSpeed =
      u.speed * (mods.speedMult || 1);

    const step = Math.min(
      dist,
      effectiveSpeed * dt
    );

    const nx = u.x + (dx / dist) * step;
    const nz = u.z + (dz / dist) * step;

    const boxes = getBuildingCollisionBoxes();

    let finalX = u.x;
    let finalZ = u.z;

    // 1. Essayer le déplacement direct.

    if (
      !isBlockedByBuilding(
        nx,
        nz,
        u.x,
        u.z,
        boxes
      )
    ) {
      finalX = nx;
      finalZ = nz;

    } else {
      // 2. Essayer le déplacement sur X uniquement.

      const canMoveX = !isBlockedByBuilding(
        nx,
        u.z,
        u.x,
        u.z,
        boxes
      );

      // 3. Essayer le déplacement sur Z uniquement.

      const canMoveZ = !isBlockedByBuilding(
        u.x,
        nz,
        u.x,
        u.z,
        boxes
      );

      if (canMoveX && canMoveZ) {
        // Choisir le déplacement qui rapproche le plus
        // le personnage de sa destination.

        const distX = Math.hypot(tx - nx, tz - u.z);
        const distZ = Math.hypot(tx - u.x, tz - nz);

        if (distX <= distZ) {
          finalX = nx;
        } else {
          finalZ = nz;
        }

      } else if (canMoveX) {
        finalX = nx;

      } else if (canMoveZ) {
        finalZ = nz;
      }
    }

    // Aucun déplacement possible.

    if (finalX === u.x && finalZ === u.z) {
      animateIdle(u, dt);
      return;
    }

    // Mise à jour de la wilaya.

    const w = DZ.findNearestWilaya
      ? DZ.findNearestWilaya(finalX, finalZ)
      : null;

    if (w) {
      u.wilayaCode = w.code;

      if (u.owner === "player") {
        DZ.state.unlockedWilayas.add(w.code);
      }
    }

    // Position du personnage.

    u.x = finalX;
    u.z = finalZ;

    u.mesh.position.set(
      u.x,
      DZ.getTerrainHeight(u.x, u.z),
      u.z
    );

    u.mesh.rotation.y = Math.atan2(
      finalX - (finalX - dx),
      finalZ - (finalZ - dz)
    );

    // Animation de marche.

    u.walkPhase += dt * 10.0;

    const s = Math.sin(u.walkPhase);
    const ud = u.mesh.userData;

    if (ud && ud.leftLeg) {
      ud.leftLeg.rotation.x = s * 0.55;
    }

    if (ud && ud.rightLeg) {
      ud.rightLeg.rotation.x = -s * 0.55;
    }

    if (ud && ud.leftArm) {
      ud.leftArm.rotation.x = -s * 0.4;
    }

    if (ud && ud.rightArm) {
      ud.rightArm.rotation.x = s * 0.4;
    }
  }

  // =========================================================
  // MISE À JOUR DES UNITÉS
  // =========================================================

  DZ.updateUnits = function (dt) {
    const units = DZ.state.units || [];

    for (let i = 0; i < units.length; i++) {
      const u = units[i];

      // MARTEAU AU-DESSUS DE LA TÊTE

      const ud = u.mesh && u.mesh.userData;

      if (ud && ud.hammer) {
        const isSelectedCivil =
          DZ.state.selectedUnit === u &&
          u.role === "civil";

        ud.hammer.visible = isSelectedCivil;

        if (isSelectedCivil) {
          ud.hammer.position.y =
            4.95 + Math.sin(DZ.state.gameTime * 5.0) * 0.14;

          ud.hammer.rotation.y += dt * 2.4;
        }
      }

      // CONSTRUCTION

      if (u.targetBuilding && u.role === "civil") {
        const b = u.targetBuilding;

        if (
          Math.hypot(
            b.x - u.x,
            b.z - u.z
          ) > 7.5
        ) {
          stepMoveUnit(u, b.x, b.z, dt);

        } else if (b.progress < 1) {
          animateWork(u, dt);

          b.progress = Math.min(
            1,
            b.progress + dt * 0.28
          );

          if (b.mesh) {
            b.mesh.scale.setScalar(
              0.35 + 0.65 * b.progress
            );
          }

          if (b.progress >= 1) {
            DZ.onBuildingCompleted(b, u);

            u.targetBuilding = null;
            u.targetPos = null;
          }

        } else {
          if (
            u.carryKind &&
            b.type === "storehouse" &&
            typeof DZ.storeInBuilding === "function"
          ) {
            DZ.storeInBuilding(
              b,
              u.carryKind,
              u.carryAmount
            );

            if (typeof DZ.depositResource === "function") {
              DZ.depositResource(
                u.owner,
                u.carryKind,
                u.carryAmount
              );
            }

            u.carryKind = null;
            u.carryAmount = 0;
          }

          u.targetBuilding = null;
          u.targetPos = null;

          animateIdle(u, dt);
        }

        continue;
      }

      // RÉCOLTE DES RESSOURCES

      if (u.targetNode && u.role === "civil") {
        const node = u.targetNode;

        if (!u.carryKind) {
          if (
            Math.hypot(
              node.x - u.x,
              node.z - u.z
            ) > 6.5
          ) {
            stepMoveUnit(u, node.x, node.z, dt);

          } else {
            if (
              typeof DZ.hasHarvestBuilding === "function" &&
              !DZ.hasHarvestBuilding(u.owner, node.kind)
            ) {
              u.targetNode = null;
              animateIdle(u, dt);
              continue;
            }

            animateWork(u, dt);

            const batch =
              (DZ.STORAGE_LIMITS &&
                DZ.STORAGE_LIMITS.carryBatchDefault) || 25;

            const taken = Math.min(
              batch,
              node.amount
            );

            if (taken > 0) {
              node.amount -= taken;
              u.carryKind = node.kind;
              u.carryAmount = taken;

            } else {
              u.targetNode = null;
              animateIdle(u, dt);
            }
          }

        } else {
          const drop = (DZ.state.buildings || []).find(
            function (b) {
              return (
                b.owner === u.owner &&
                b.progress >= 1 &&
                (
                  b.type === "storehouse" ||
                  [
                    "farm",
                    "lumber_camp",
                    "iron_mine",
                    "gold_mine",
                    "quarry"
                  ].indexOf(b.type) !== -1
                )
              );
            }
          );

          if (drop) {
            if (
              Math.hypot(
                drop.x - u.x,
                drop.z - u.z
              ) > 7.5
            ) {
              stepMoveUnit(u, drop.x, drop.z, dt);

            } else {
              if (typeof DZ.storeInBuilding === "function") {
                DZ.storeInBuilding(
                  drop,
                  u.carryKind,
                  u.carryAmount
                );
              }

              if (typeof DZ.depositResource === "function") {
                DZ.depositResource(
                  u.owner,
                  u.carryKind,
                  u.carryAmount
                );
              }

              u.carryKind = null;
              u.carryAmount = 0;
            }

          } else {
            if (typeof DZ.depositResource === "function") {
              DZ.depositResource(
                u.owner,
                u.carryKind,
                u.carryAmount
              );
            }

            u.carryKind = null;
            u.carryAmount = 0;
          }
        }

        continue;
      }

      // DÉPLACEMENT LIBRE

      if (u.targetPos) {
        if (
          Math.hypot(
            u.targetPos.x - u.x,
            u.targetPos.z - u.z
          ) > 1.8
        ) {
          stepMoveUnit(
            u,
            u.targetPos.x,
            u.targetPos.z,
            dt
          );

        } else {
          u.targetPos = null;
          animateIdle(u, dt);
        }

      } else {
        animateIdle(u, dt);
      }
    }

    // ANNEAU DE SÉLECTION

    if (
      DZ.state.selectedUnit &&
      DZ.state.selectionRing
    ) {
      const su = DZ.state.selectedUnit;

      DZ.state.selectionRing.visible = true;

      DZ.state.selectionRing.position.set(
        su.x,
        DZ.getTerrainHeight(su.x, su.z) + 0.35,
        su.z
      );

    } else if (DZ.state.selectionRing) {
      DZ.state.selectionRing.visible = false;
    }
  };

  // =========================================================
  // ÉTIQUETTE 3D TEMPORAIRE : NOM + BARRE HP
  // =========================================================

  let hpLabelUnit = null;
  let hpLabelSprite = null;
  let hpLabelTexture = null;
  let hpLabelCanvas = null;
  let hpLabelContext = null;
  let hpLabelStart = 0;

  function createHPLabel() {
    hpLabelCanvas = document.createElement("canvas");

    hpLabelCanvas.width = 512;
    hpLabelCanvas.height = 140;

    hpLabelContext = hpLabelCanvas.getContext("2d");

    hpLabelTexture = new THREE.CanvasTexture(
      hpLabelCanvas
    );

    const material = new THREE.SpriteMaterial({
      map: hpLabelTexture,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    hpLabelSprite = new THREE.Sprite(material);

    hpLabelSprite.scale.set(7, 1.9, 1);
    hpLabelSprite.position.set(0, 7.2, 0);
    hpLabelSprite.renderOrder = 999;
    hpLabelSprite.visible = false;
  }

  function drawHPLabel(unit) {
    const c = hpLabelContext;

    if (!c || !unit) return;

    c.clearRect(0, 0, 512, 140);

    c.fillStyle = "rgba(20,20,20,0.94)";
    c.beginPath();
    c.roundRect(5, 5, 502, 130, 16);
    c.fill();

    c.strokeStyle = "#d4af37";
    c.lineWidth = 4;
    c.stroke();

    c.fillStyle = "#ffffff";
    c.font = "bold 30px Arial";
    c.textAlign = "center";

    c.fillText(
      unit.name || "Personnage",
      256,
      42
    );

    const hp = Math.max(
      0,
      Number(unit.hp) || 0
    );

    const maxHp = Math.max(
      1,
      Number(unit.maxHp) || 100
    );

    const percent = Math.min(
      1,
      hp / maxHp
    );

    c.fillStyle = "#552222";
    c.fillRect(45, 62, 422, 27);

    c.fillStyle = percent > 0.6
      ? "#22c55e"
      : percent > 0.3
        ? "#eab308"
        : "#ef4444";

    c.fillRect(
      45,
      62,
      422 * percent,
      27
    );

    c.strokeStyle = "#ffffff";
    c.lineWidth = 2;
    c.strokeRect(45, 62, 422, 27);

    c.fillStyle = "#ffffff";
    c.font = "bold 21px Arial";

    c.fillText(
      hp + " / " + maxHp + " HP",
      256,
      119
    );

    hpLabelTexture.needsUpdate = true;
  }

  function updateHPLabel() {
    const selected =
      DZ.state && DZ.state.selectedUnit;

    if (!selected || !selected.mesh) {
      if (hpLabelSprite) {
        hpLabelSprite.visible = false;
      }

      hpLabelUnit = null;

      requestAnimationFrame(updateHPLabel);
      return;
    }

    if (selected !== hpLabelUnit) {
      if (!hpLabelSprite) {
        createHPLabel();
      }

      if (hpLabelSprite.parent) {
        hpLabelSprite.parent.remove(hpLabelSprite);
      }

      hpLabelUnit = selected;

      selected.mesh.add(hpLabelSprite);

      hpLabelSprite.position.set(0, 7.2, 0);
      hpLabelSprite.visible = true;

      hpLabelStart = performance.now();
    }

    if (hpLabelSprite && hpLabelUnit) {
      const elapsed =
        performance.now() - hpLabelStart;

      drawHPLabel(hpLabelUnit);

      if (elapsed >= 3000) {
        hpLabelSprite.visible = false;
        hpLabelUnit = null;
      }
    }

    requestAnimationFrame(updateHPLabel);
  }

  createHPLabel();
  requestAnimationFrame(updateHPLabel);

})();
