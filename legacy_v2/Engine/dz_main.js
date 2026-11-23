/** 
 * DZ CONQUEST
 * Gestion principale du jeu sur terrain carré vide.
 */

(function () {
  "use strict";

  window.DZ = window.DZ || {};

  const DZ = window.DZ;
  const THREE = window.THREE;

  const RESOURCE_PRODUCTION_BUILDINGS = new Set([
    "ferme",
    "scierie",
    "mine",
    "carriere"
  ]);

  DZ.CARRY_CAPACITY = DZ.CARRY_CAPACITY || 10;

  // =====================================================
  // CHOIX DE LA WILAYA DE DÉPART
  // =====================================================

  function populateStartWilayaChoices() {
    const grid = document.getElementById("start-wilaya-grid");
    if (!grid) return;

    const featured = ["16", "25", "31", "05", "06", "19", "13", "07", "47", "11"];

    const list = (DZ.WILAYAS || []).filter(function (w) {
      return featured.indexOf(w.code) !== -1;
    });

    grid.innerHTML = list.map(function (w) {
      return "<button class='wilaya-choice' data-code='" + w.code +
        "'><strong>" + w.name + "</strong></button>";
    }).join("");

    grid.querySelectorAll(".wilaya-choice").forEach(function (btn) {
      btn.onclick = function () {
        const code = btn.getAttribute("data-code");
        const w = (DZ.WILAYAS || []).find(function (item) {
          return item.code === code;
        });

        if (!w) return;

        const pos = DZ.lonLatToWorld(w.lon, w.lat);
        startAtLocation(pos.x, pos.z, w.code, w.name);
      };
    });
  }

  // =====================================================
  // INITIALISATION DU JOUEUR
  // =====================================================

  function startAtLocation(x, z, wilayaCode, placeLabel) {
    if (DZ.ctx.unitsGroup) DZ.ctx.unitsGroup.clear();
    if (DZ.ctx.buildingsGroup) DZ.ctx.buildingsGroup.clear();

    DZ.state.units = [];
    DZ.state.buildings = [];
    DZ.state.started = true;
    DZ.state.objectives.placedStart = true;

    DZ.state.unlockedWilayas.add(wilayaCode || "16");

    const safeY = DZ.getTerrainHeight(x, z);

    const man = DZ.spawnUnit(
      "player", wilayaCode || "16", "civil", "M",
      x - 2, z + 1, "Homme #1"
    );

    DZ.spawnUnit(
      "player", wilayaCode || "16", "civil", "F",
      x + 2, z - 1, "Femme #1"
    );

    const rival = (DZ.WILAYAS || []).find(function (item) {
      return item.code === "25";
    }) || { lon: 6.61, lat: 36.36, code: "25" };

    const rPos = DZ.lonLatToWorld(rival.lon, rival.lat);

    DZ.spawnUnit(
      "ai", rival.code, "soldier", "M",
      rPos.x, rPos.z, "Garde rival #1"
    );

    if (man) DZ.selectUnit(man);

    if (DZ.ctx.controls) {
      DZ.ctx.controls.target.set(x, safeY, z);
      DZ.ctx.camera.position.set(x, safeY + 75, z + 88);
      DZ.ctx.controls.update();
    }

    const modal = document.getElementById("start-modal");
    if (modal) modal.classList.add("hidden");

    DZ.notify(
      "Départ dans " + (placeLabel || "le monde ouvert") +
      " — 1 Homme et 1 Femme prêts."
    );

    if (typeof DZ.renderHUD === "function") DZ.renderHUD();
  }

  // =====================================================
  // DÉTECTION DU TERRAIN CARRÉ
  // =====================================================

  function raycastTerrain(event) {
    const {
      renderer,
      camera,
      raycaster,
      pointerNDC,
      terrainGroup
    } = DZ.ctx;

    if (!renderer || !camera || !terrainGroup) return null;

    const rect = renderer.domElement.getBoundingClientRect();

    pointerNDC.x =
      ((event.clientX - rect.left) / rect.width) * 2 - 1;

    pointerNDC.y =
      -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointerNDC, camera);

    const terrainMesh = terrainGroup.children.find(function (ch) {
      return ch.name === "simple_green_terrain";
    });

    const targets = terrainMesh
      ? [terrainMesh]
      : terrainGroup.children;

    const hits = raycaster.intersectObjects(targets, true);

    if (!hits || hits.length === 0) return null;

    return hits[0].point;
  }

  // =====================================================
  // DÉTECTION DES BÂTIMENTS
  // =====================================================

  function findClickedBuilding(event) {
    const {
      renderer,
      camera,
      raycaster,
      pointerNDC,
      buildingsGroup
    } = DZ.ctx;

    if (!renderer || !camera || !buildingsGroup) return null;

    const rect = renderer.domElement.getBoundingClientRect();

    pointerNDC.x =
      ((event.clientX - rect.left) / rect.width) * 2 - 1;

    pointerNDC.y =
      -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointerNDC, camera);

    const hits = raycaster.intersectObjects(
      buildingsGroup.children,
      true
    );

    if (!hits || hits.length === 0) return null;

    let obj = hits[0].object;

    while (obj.parent && obj.parent !== buildingsGroup) {
      obj = obj.parent;
    }

    return (DZ.state.buildings || []).find(function (b) {
      return b.mesh === obj;
    }) || null;
  }

  function openBuildingManagementWindow(building) {
    if (!building) return;

    if (typeof DZ.openBuildingModal === "function") {
      DZ.openBuildingModal(building, DZ.state.selectedUnit || null);
    }

    if (typeof DZ.renderBuildingWorkersModal === "function") {
      DZ.renderBuildingWorkersModal(building, DZ.state.selectedUnit || null);
    }

    if (typeof DZ.renderHUD === "function") {
      DZ.renderHUD();
    }
  }

  // =====================================================
  // INTERFACE ET COMMANDES
  // =====================================================

  function bindUIEvents() {
    const canvasEl = DZ.ctx.renderer &&
      DZ.ctx.renderer.domElement;

    if (canvasEl) {
      let pointerDownPos = { x: 0, y: 0 };

      canvasEl.addEventListener("pointerdown", function (e) {
        if (e.button !== 0) return;

        pointerDownPos = {
          x: e.clientX,
          y: e.clientY
        };
      });

      canvasEl.addEventListener("pointermove", function (e) {
        if (!DZ.state.buildModeType) return;

        const pt = raycastTerrain(e);

        if (pt && typeof DZ.updateBuildingPreview === "function") {
          DZ.updateBuildingPreview(pt);
        }
      });

      canvasEl.addEventListener("pointerup", function (e) {
        if (e.button !== 0) return;

        const moved = Math.hypot(
          e.clientX - pointerDownPos.x,
          e.clientY - pointerDownPos.y
        );

        if (moved > 6) return;

        // Priorité aux bâtiments : leur fenêtre doit s'ouvrir
        // même si un travailleur est sélectionné ou si le raycast
        // du terrain ne détecte aucun point sous le curseur.
        if (DZ.state.started && !DZ.state.buildModeType) {
          const clickedBldg = findClickedBuilding(e);
          if (clickedBldg) {
            openBuildingManagementWindow(clickedBldg);
            return;
          }
        }

        const pt = raycastTerrain(e);
        if (!pt) return;

        // Premier clic : emplacement de départ
        if (!DZ.state.started) {
          const w = DZ.findNearestWilaya
            ? DZ.findNearestWilaya(pt.x, pt.z)
            : { code: "16", name: "Monde ouvert" };

          startAtLocation(
            pt.x,
            pt.z,
            w.code,
            w.name
          );

          return;
        }

        // Placement d'un bâtiment
        if (DZ.state.buildModeType) {
          const btype = DZ.state.buildModeType;

          const builder =
            (DZ.state.selectedUnit &&
              DZ.state.selectedUnit.role === "civil")
              ? DZ.state.selectedUnit
              : ((DZ.state.units || []).find(function (u) {
                  return u.owner === "player" &&
                    u.role === "civil";
                }) || null);

          const placed = DZ.placeBuilding(
            btype,
            pt.x,
            pt.z,
            "player",
            false
          );

          if (placed) {
            if (RESOURCE_PRODUCTION_BUILDINGS.has(placed.type)) {
              placed.autoProduce = false;
              placed.assignedWorkers = placed.assignedWorkers || [];
            }

            DZ.state.buildModeType = null;

            if (DZ.state.previewMesh && DZ.ctx.scene) {
              DZ.ctx.scene.remove(DZ.state.previewMesh);
              DZ.state.previewMesh = null;
            }

            if (builder) {
              builder.mission = "build";
              builder.targetBuilding = placed;
              builder.targetNode = null;
              builder.targetPos = {
                x: placed.x,
                z: placed.z
              };

              DZ.state.selectedUnit = builder;

              if (typeof DZ.setDestinationMarker === "function") {
                DZ.setDestinationMarker(placed.x, placed.z);
              }

              DZ.notify(
                placed.label + " placé : " +
                builder.name + " va le construire."
              );
            }

            if (typeof DZ.renderHUD === "function") {
              DZ.renderHUD();
            }
          }
                    return;
        }

        // Sélection d'une unité
        const clickedUnit =
          typeof DZ.findClickedUnit === "function"
            ? DZ.findClickedUnit(e, pt)
            : null;

        if (clickedUnit) {
          const hitHammer = Boolean(clickedUnit._clickedHammer);
          clickedUnit._clickedHammer = false;

          DZ.selectUnit(clickedUnit);

          if (
            hitHammer &&
            clickedUnit.role === "civil" &&
            typeof DZ.showBuilderChoicePopover === "function"
          ) {
            DZ.showBuilderChoicePopover();
          }

          return;
        }

        const clickedRes =
          typeof DZ.findClickedResource === "function"
            ? DZ.findClickedResource(e, pt)
            : null;

        if (DZ.state.selectedUnit) {
          if (typeof DZ.issueTargetOrder === "function") {
            DZ.issueTargetOrder(pt, null, clickedRes);
          }

          if (typeof DZ.renderHUD === "function") {
            DZ.renderHUD();
          }
        }
      });
    }

    // Fermeture du menu de construction
    const closePopBtn = document.getElementById(
      "close-builder-popover"
    );

    if (closePopBtn) {
      closePopBtn.onclick = function () {
        if (typeof DZ.hideBuilderChoicePopover === "function") {
          DZ.hideBuilderChoicePopover();
        }
      };
    }

    // Mini-carte
    const minimap = document.getElementById("minimap-canvas");

    if (minimap) {
      minimap.addEventListener("click", function (e) {
        const rect = minimap.getBoundingClientRect();

        const u = (e.clientX - rect.left) / rect.width;
        const v = (e.clientY - rect.top) / rect.height;

        const bounds = DZ.MAP_BOUNDS || {
          worldWidth: 1160,
          worldDepth: 960
        };

        const size = Math.max(
          bounds.worldWidth,
          bounds.worldDepth
        );

        const wx = (u - 0.5) * size;
        const wz = (v - 0.5) * size;

        const wy = DZ.getTerrainHeight
          ? DZ.getTerrainHeight(wx, wz)
          : 0;

        if (DZ.ctx.controls) {
          DZ.ctx.controls.target.set(wx, wy, wz);
          DZ.ctx.camera.position.set(
            wx,
            wy + 110,
            wz + 125
          );

          DZ.ctx.controls.update();
        }
      });
    }

    // Sauvegarde
    const btnSave = document.getElementById("btn-save");

    if (btnSave) {
      btnSave.onclick = function () {
        if (typeof DZ.saveGame === "function") {
          DZ.saveGame();
        }
      };
    }

    // Chargement
    const btnLoad = document.getElementById("btn-load");

    if (btnLoad) {
      btnLoad.onclick = function () {
        if (typeof DZ.loadGame === "function") {
          DZ.loadGame();
        }
      };
    }

    // Village
    const btnVillage = document.getElementById(
      "btn-open-village"
    );

    if (btnVillage) {
      btnVillage.onclick = function () {
        if (
          !DZ.state.objectives.unlockedDarElJamaa &&
          !DZ.canUnlockDarElJamaa()
        ) {
          DZ.notify(
            "Dar El Jamaa se débloque après 3 Maisons, " +
            "1 Caserne et 1 Ferme achevées."
          );

          return;
        }

        if (typeof DZ.openVillageModal === "function") {
          DZ.openVillageModal();
        }
      };
    }

    // Recherche
    const btnResearch = document.getElementById(
      "btn-open-research"
    );

    if (btnResearch) {
      btnResearch.onclick = function () {
        if (typeof DZ.openResearchModal === "function") {
          DZ.openResearchModal();
        }
      };
    }

    // Pause
    const btnPause = document.getElementById("btn-pause");

    if (btnPause) {
      btnPause.onclick = function () {
        DZ.state.paused = !DZ.state.paused;

        btnPause.textContent = DZ.state.paused ? "▶" : "⏸";

        DZ.notify(
          DZ.state.paused
            ? "Jeu en pause."
            : "Reprise de la partie."
        );
      };
    }

    // Départ libre
    const startAnyBtn = document.getElementById(
      "start-any-spot-btn"
    );

    if (startAnyBtn) {
      startAnyBtn.onclick = function () {
        const modal = document.getElementById("start-modal");

        if (modal) modal.classList.add("hidden");

        DZ.notify(
          "Cliquez sur le terrain carré pour choisir votre emplacement."
        );
      };
    }

    // Charger une partie depuis l'écran de départ
    const startLoadBtn = document.getElementById(
      "start-load-btn"
    );

    if (startLoadBtn) {
      startLoadBtn.onclick = function () {
        if (typeof DZ.loadGame === "function") {
          DZ.loadGame();
        }
      };
    }

    // Annuler la construction
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && DZ.state.buildModeType) {
        DZ.state.buildModeType = null;

        if (DZ.state.previewMesh && DZ.ctx.scene) {
          DZ.ctx.scene.remove(DZ.state.previewMesh);
          DZ.state.previewMesh = null;
        }

        DZ.notify("Mode construction annulé.");

        if (typeof DZ.renderHUD === "function") {
          DZ.renderHUD();
        }
      }
    });

    // Fermeture des fenêtres
    document.querySelectorAll("[data-close-modal]").forEach(
      function (btn) {
        btn.onclick = function () {
          const targetId = btn.getAttribute("data-close-modal");
          const modal = document.getElementById(targetId);

          if (modal) modal.classList.add("hidden");
        };
      }
    );
  }

  // =====================================================
  // BOUCLE PRINCIPALE
  // =====================================================

  function startLoop() {
    let lastTime = performance.now();

    function tick(now) {
      requestAnimationFrame(tick);

      const dt = Math.min(
        0.08,
        Math.max(0.001, (now - lastTime) / 1000)
      );

      lastTime = now;

      if (!DZ.state.paused && DZ.state.started) {
        DZ.state.gameTime += dt;

        if (typeof DZ.updateEconomy === "function") {
          DZ.updateEconomy(dt);
        }

        if (typeof DZ.updateTransportLogistics === "function") {
          DZ.updateTransportLogistics(dt);
        }

        if (typeof DZ.updateResearch === "function") {
          DZ.updateResearch(dt);
        }

        if (typeof DZ.updateUnits === "function") {
          DZ.updateUnits(dt);
        }

        if (typeof DZ.updateCombat === "function") {
          DZ.updateCombat(dt);
        }

        if (typeof DZ.updateAI === "function") {
          DZ.updateAI(dt);
        }

        if (typeof DZ.renderHUD === "function") {
          DZ.renderHUD();
        }
      }

      if (DZ.ctx.controls) {
        DZ.ctx.controls.update();
      }

      if (DZ.ctx.renderer && DZ.ctx.scene && DZ.ctx.camera) {
        DZ.ctx.renderer.render(
          DZ.ctx.scene,
          DZ.ctx.camera
        );
      }
    }

    requestAnimationFrame(tick);
  }

  // =====================================================
  // DÉMARRAGE DU JEU
  // =====================================================

  window.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("scene-container");

    if (!container || !THREE) {
      const err = document.getElementById("fatal-error");

      if (err) err.classList.remove("hidden");

      return;
    }

    if (typeof DZ.initScene !== "function") {
      console.error("DZ CONQUEST : DZ.initScene introuvable.");
      return;
    }

    DZ.initScene(container);

    if (typeof DZ.buildTerrain === "function") {
      DZ.buildTerrain();
    }

    if (typeof DZ.populateNaturalResources === "function") {
      DZ.populateNaturalResources();
    }

    populateStartWilayaChoices();
    bindUIEvents();

    if (typeof DZ.renderHUD === "function") {
      DZ.renderHUD();
    }

    startLoop();
  });

})();
