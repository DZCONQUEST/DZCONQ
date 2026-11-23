/**
 * Engine/dz_hud.js
 * Interface HUD : ressources, population (Homme/Femme), époque, objectifs,
 * minicarte avec routes et relief, fenêtre de choix de construction et grille des bâtiments.
 */
(function () {
  "use strict";
  window.DZ = window.DZ || {};
  const DZ = window.DZ;

  DZ.showBuilderChoicePopover = function () {
    const popEl = document.getElementById("builder-choice-popover");
    const listEl = document.getElementById("builder-popover-list");
    const subEl = document.getElementById("builder-popover-sub");
    if (!popEl || !listEl) return;

    const unit = DZ.state.selectedUnit;
    if (subEl) {
      subEl.textContent = unit
        ? ("Constructeur actif : " + unit.name + " — sélectionnez un bâtiment pour afficher l'aperçu transparent sur la carte.")
        : "Sélectionnez un bâtiment pour afficher l'aperçu transparent sur la carte.";
    }

    const catalog = DZ.BUILDINGS_CATALOG || [];
    const res = DZ.state.resources || {};

    listEl.innerHTML = catalog.map(function (item) {
      const unlocked = typeof DZ.isBuildingUnlocked === "function" ? DZ.isBuildingUnlocked(item.type) : true;
      const cost = item.cost || {};
      const canAfford =
        (res.wood || 0) >= (cost.wood || 0) &&
        (res.gold || 0) >= (cost.gold || 0) &&
        (res.food || 0) >= (cost.food || 0) &&
        (res.iron || 0) >= (cost.iron || 0);
      const disabled = !unlocked || !canAfford;
      const costParts = [];
      if (cost.wood) costParts.push(cost.wood + "🌲");
      if (cost.gold) costParts.push(cost.gold + "🪙");
      if (cost.food) costParts.push(cost.food + "🌾");
      if (cost.iron) costParts.push(cost.iron + "⛏️");

      return "<button type='button' class='popover-build-btn' data-btype='" + item.type + "' " + (disabled ? "disabled" : "") + ">" +
        "<span><strong>" + item.icon + " " + item.label + "</strong></span>" +
        "<span class='popover-build-cost'>" + (costParts.length ? costParts.join(" ") : "Gratuit") + (!unlocked ? " • Verrouillé" : (!canAfford ? " • Manque ress." : "")) + "</span>" +
        "</button>";
    }).join("");

    popEl.classList.remove("hidden");

    listEl.querySelectorAll(".popover-build-btn").forEach(function (btn) {
      btn.onclick = function () {
        const btype = btn.getAttribute("data-btype");
        DZ.beginBuildingGhostPlacement(btype);
      };
    });
  };

  DZ.hideBuilderChoicePopover = function () {
    const popEl = document.getElementById("builder-choice-popover");
    if (popEl) popEl.classList.add("hidden");
  };

  DZ.beginBuildingGhostPlacement = function (btype) {
    if (!btype) return;
    if (typeof DZ.isBuildingUnlocked === "function" && !DZ.isBuildingUnlocked(btype)) {
      DZ.notify("Débloquez Dar El Jamaa en achevant 3 Maisons, 1 Caserne et 1 Ferme.");
      return;
    }
    const item = DZ.getBuildingCatalogItem ? DZ.getBuildingCatalogItem(btype) : null;
    const cost = (item && item.cost) || {};
    const res = DZ.state.resources || {};
    if ((res.wood || 0) < (cost.wood || 0) || (res.gold || 0) < (cost.gold || 0) || (res.food || 0) < (cost.food || 0) || (res.iron || 0) < (cost.iron || 0)) {
      DZ.notify("Ressources insuffisantes pour " + (item ? item.label : btype) + ".");
      return;
    }

    // Garder l'habitant sélectionné comme constructeur actif (ou en choisir un disponible)
    if (!DZ.state.selectedUnit) {
      const civil = (DZ.state.units || []).find(function (u) { return u.owner === "player" && u.role === "civil"; });
      if (civil) DZ.state.selectedUnit = civil;
    }

    DZ.state.buildModeType = btype;
    DZ.hideBuilderChoicePopover();

    // Créer immédiatement un aperçu transparent autour de l'unité ou du centre de la caméra
    let initPt = null;
    if (DZ.state.selectedUnit) {
      initPt = { x: DZ.state.selectedUnit.x + 7, z: DZ.state.selectedUnit.z + 5 };
    } else if (DZ.ctx.controls && DZ.ctx.controls.target) {
      initPt = { x: DZ.ctx.controls.target.x, z: DZ.ctx.controls.target.z };
    }
    if (initPt && typeof DZ.updateBuildingPreview === "function") {
      DZ.updateBuildingPreview(initPt);
    }

    DZ.notify("Aperçu transparent de « " + (item ? item.label : btype) + " » actif : choisissez l'emplacement et cliquez sur la carte.");
    DZ.renderHUD();
  };

  DZ.renderMinimap = function () {
    const canvas = document.getElementById("minimap-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const bounds = DZ.MAP_BOUNDS || { worldWidth: 1160, worldDepth: 960 };
    const stepX = 8;
    const stepY = 8;

    for (let py = 0; py < h; py += stepY) {
      for (let px = 0; px < w; px += stepX) {
        const wx = ((px + stepX * 0.5) / w - 0.5) * bounds.worldWidth;
        const wz = ((py + stepY * 0.5) / h - 0.5) * bounds.worldDepth;
        const elev = DZ.getTerrainHeight ? DZ.getTerrainHeight(wx, wz) : 0;
        const ll = DZ.worldToLonLat ? DZ.worldToLonLat(wx, wz) : { lat: 30 };

        if (elev < ((DZ.TERRAIN_CONFIG && DZ.TERRAIN_CONFIG.seaLevel) || -1.8) + 0.1) {
          ctx.fillStyle = "#165b82";
        } else if (elev > 44) {
          ctx.fillStyle = "#7a746c";
        } else if (ll.lat < 33.5) {
          ctx.fillStyle = "#d4a85a";
        } else if (elev > 14.5) {
          ctx.fillStyle = "#9e8655";
        } else {
          ctx.fillStyle = "#457b3c";
        }
        ctx.fillRect(px, py, stepX, stepY);
      }
    }

    // Tracé soigné des routes sur la minicarte
    const routes = (DZ.TERRAIN_CONFIG && DZ.TERRAIN_CONFIG.roadRoutes) || [];
    ctx.save();
    ctx.strokeStyle = "#f6d365";
    ctx.lineWidth = 1.6;
    routes.forEach(function (route) {
      const pts = route.points || [];
      if (pts.length < 2) return;
      ctx.beginPath();
      pts.forEach(function (ll, idx) {
        const wp = DZ.lonLatToWorld ? DZ.lonLatToWorld(ll[0], ll[1]) : { x: 0, z: 0 };
        const mx = (wp.x / bounds.worldWidth + 0.5) * w;
        const mz = (wp.z / bounds.worldDepth + 0.5) * h;
        if (idx === 0) ctx.moveTo(mx, mz);
        else ctx.lineTo(mx, mz);
      });
      ctx.stroke();
    });
    ctx.restore();

    (DZ.state.buildings || []).forEach(function (b) {
      const mx = (b.x / bounds.worldWidth + 0.5) * w;
      const mz = (b.z / bounds.worldDepth + 0.5) * h;
      ctx.fillStyle = b.owner === "player" ? "#ffd966" : "#f87171";
      ctx.fillRect(mx - 2.5, mz - 2.5, 5, 5);
    });

    (DZ.state.units || []).forEach(function (u) {
      const mx = (u.x / bounds.worldWidth + 0.5) * w;
      const mz = (u.z / bounds.worldDepth + 0.5) * h;
      ctx.fillStyle = u.owner === "player" ? "#34d399" : "#ef4444";
      ctx.beginPath();
      ctx.arc(mx, mz, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  DZ.renderHUD = function () {
    const res = DZ.state.resources || {};
    const rates = DZ.state.productionRates || {};
    const setText = function (id, txt) {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setText("res-gold", Math.floor(res.gold || 0));
    setText("res-food", Math.floor(res.food || 0));
    setText("res-wood", Math.floor(res.wood || 0));
    setText("res-iron", Math.floor(res.iron || 0));
    setText("res-stone", Math.floor(res.stone || 0));

    setText("rate-gold", "+" + (rates.gold || 0).toFixed(1) + "/s");
    setText("rate-food", "+" + (rates.food || 0).toFixed(1) + "/s");
    setText("rate-wood", "+" + (rates.wood || 0).toFixed(1) + "/s");
    setText("rate-iron", "+" + (rates.iron || 0).toFixed(1) + "/s");
    setText("rate-stone", "+" + (rates.stone || 0).toFixed(1) + "/s");

    const pop = typeof DZ.getPopulationSummary === "function" ? DZ.getPopulationSummary() : { total: 0, housingCapacity: 2 };
    setText("pop-current", pop.total);
    setText("pop-max", pop.housingCapacity);

    const eras = DZ.ERAS || [];
    const curEra = eras[DZ.state.eraIndex] || { name: "Âge de Numidie" };
    setText("era-label", curEra.name);

    const obj = DZ.state.objectives || {};
    const items = [
      { done: Boolean(obj.placedStart), text: "Choisir son emplacement initial" },
      { done: Boolean(obj.builtHouse), text: "Construire une Maison (+2 habitants)" },
      { done: Boolean(obj.builtProducerOrStore), text: "Bâtir Ferme, Scierie, Mine ou Magasin" },
      { done: Boolean(obj.unlockedDarElJamaa), text: "Débloquer Dar El Jamaa (3 Maisons, 1 Caserne, 1 Ferme)" }
    ];
    const ul = document.getElementById("objectives-list");
    if (ul) {
      ul.innerHTML = items.map(function (it) {
        return "<li class='" + (it.done ? "done" : "") + "'>" + (it.done ? "✔ " : "• ") + it.text + "</li>";
      }).join("");
    }

    setText("active-unit-badge", DZ.state.selectedUnit ? ("Sélection : " + DZ.state.selectedUnit.name) : "Aucun habitant sélectionné");

    const buildGrid = document.getElementById("build-grid");
    if (buildGrid) {
      const catalog = DZ.BUILDINGS_CATALOG || [];
      buildGrid.innerHTML = catalog.map(function (item) {
        const unlocked = typeof DZ.isBuildingUnlocked === "function" ? DZ.isBuildingUnlocked(item.type) : true;
        const isActive = DZ.state.buildModeType === item.type;
        return "<button class='build-card " + (!unlocked ? "locked" : "") + " " + (isActive ? "active" : "") + "' data-btype='" + item.type + "' title='" + item.label + " : " + item.functionDesc + "'>" +
          "<span class='b-ico'>" + item.icon + "</span>" +
          "<span class='b-name'>" + item.label + "</span>" +
          "</button>";
      }).join("");

      buildGrid.querySelectorAll(".build-card").forEach(function (btn) {
        btn.onclick = function () {
          const btype = btn.getAttribute("data-btype");
          if (DZ.state.buildModeType === btype) {
            DZ.state.buildModeType = null;
            if (DZ.state.previewMesh && DZ.ctx.scene) {
              DZ.ctx.scene.remove(DZ.state.previewMesh);
              DZ.state.previewMesh = null;
            }
            DZ.renderHUD();
            return;
          }
          DZ.beginBuildingGhostPlacement(btype);
        };
      });
    }

    const insp = document.getElementById("inspector-panel");
    if (insp) {
      if (DZ.state.selectedUnit) {
        const su = DZ.state.selectedUnit;
        insp.classList.remove("hidden");
        setText("inspector-title", su.name);
        document.getElementById("inspector-thumb").textContent = su.role === "soldier" ? "⚔️" : (su.sex === "F" ? "👩" : "👨");
        document.getElementById("inspector-stats").innerHTML =
          "Rôle : " + (su.role === "civil" ? (su.sex === "F" ? "Femme" : "Homme") : su.role) +
          "<br/>Mission : " + (su.mission || "repos") +
          "<br/>Vitesse : " + su.speed + " • Attaque : " + su.attack;
        document.getElementById("inspector-actions").innerHTML =
          (su.role === "civil" ? "<button class='gold-btn accent' id='insp-open-hammer-menu'>🔨 Choisir construction</button>" : "");
        const hammerBtn = document.getElementById("insp-open-hammer-menu");
        if (hammerBtn) {
          hammerBtn.onclick = function () {
            DZ.showBuilderChoicePopover();
          };
        }
      } else if (DZ.state.selectedBuilding) {
        const sb = DZ.state.selectedBuilding;
        insp.classList.remove("hidden");
        setText("inspector-title", sb.label);
        document.getElementById("inspector-thumb").textContent = sb.icon || "🏛️";
        document.getElementById("inspector-stats").innerHTML =
          "Niveau : " + sb.level + " • État : " + Math.round((sb.progress || 0) * 100) + "%";
        document.getElementById("inspector-actions").innerHTML =
          "<button class='gold-btn' id='insp-open-modal'>Gérer le bâtiment</button>";
        const openBtn = document.getElementById("insp-open-modal");
        if (openBtn) openBtn.onclick = function () { DZ.openBuildingModal(sb); };
      } else {
        insp.classList.add("hidden");
      }
    }

    DZ.renderMinimap();
  };
})();
