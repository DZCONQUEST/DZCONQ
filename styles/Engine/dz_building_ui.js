/**
 * Engine/dz_building_ui.js
 * Fenêtre de gestion interactive pour chaque bâtiment (Chapitre 10).
 */
(function () {
  "use strict";
  window.DZ = window.DZ || {};
  const DZ = window.DZ;

  DZ.openBuildingModal = function (building) {
    if (!building) return;
    DZ.state.selectedBuilding = building;
    const modal = document.getElementById("building-modal");
    const title = document.getElementById("bmodal-title");
    const body = document.getElementById("bmodal-body");
    if (!modal || !title || !body) return;

    const item = DZ.getBuildingCatalogItem ? DZ.getBuildingCatalogItem(building.type) : null;
    const cap = typeof DZ.getBuildingStorageCapacity === "function" ? DZ.getBuildingStorageCapacity(building) : 0;
    const used = typeof DZ.getTotalStoredInBuilding === "function" ? DZ.getTotalStoredInBuilding(building) : 0;
    const s = building.stored || { gold: 0, food: 0, wood: 0, iron: 0, stone: 0 };

    title.textContent = (building.icon || "🏛️") + " " + building.label + " — Niveau " + building.level;

    let html = "<div class='inspector-stats'>";
    html += "<div><strong>Propriétaire :</strong> " + (building.owner === "player" ? "Joueur (Vous)" : "Rival") + "</div>";
    html += "<div><strong>État de construction :</strong> " + Math.round((building.progress || 0) * 100) + "% | <strong>Intégrité :</strong> " + Math.round(building.hp) + "/" + building.maxHp + "</div>";
    if (item) html += "<div><strong>Fonction :</strong> " + item.functionDesc + "</div>";
    if (cap > 0) {
      html += "<div style='margin-top:6px;'><strong>Stockage :</strong> " + Math.round(used) + " / " + cap + " unités</div>";
      html += "<div>Or : " + Math.round(s.gold) + " | Nourriture : " + Math.round(s.food) + " | Bois : " + Math.round(s.wood) + " | Fer : " + Math.round(s.iron) + " | Pierre : " + Math.round(s.stone) + "</div>";
      if (building.type !== "storehouse") {
        html += "<div><strong>En attente de transport :</strong> " + Math.round(building.pendingTransport || 0) + " unités</div>";
      } else {
        html += "<div><strong>Quantités entrantes cumulées :</strong> " + Math.round(building.incomingTotal || 0) + " unités</div>";
      }
    }
    html += "</div>";

    html += "<div style='display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;'>";
    if (building.progress < 1) {
      html += "<button class='gold-btn accent' id='bmodal-finish-btn'>Achever le chantier</button>";
    }
    html += "<button class='gold-btn' id='bmodal-upgrade-btn'>Améliorer (Nv." + (building.level + 1) + ")</button>";
    html += "<button class='gold-btn' id='bmodal-repair-btn'>Réparer</button>";

    if (building.type === "barracks") {
      html += "<button class='gold-btn accent' id='bmodal-train-soldier'>Recruter Soldat (Att.10 / Vit.25)</button>";
      html += "<button class='gold-btn' id='bmodal-train-chariot'>Recruter Char (Att.25 / Vit.12)</button>";
    }
    if (building.type === "dar_el_jamaa") {
      html += "<button class='gold-btn accent' id='bmodal-open-village'>Ouvrir Gestion du Village</button>";
      html += "<button class='gold-btn' id='bmodal-open-research'>Table de Recherche</button>";
    }
    html += "</div>";

    body.innerHTML = html;
    modal.classList.remove("hidden");

    const finishBtn = document.getElementById("bmodal-finish-btn");
    if (finishBtn) {
      finishBtn.onclick = function () {
        DZ.onBuildingCompleted(building);
        DZ.openBuildingModal(building);
      };
    }
    const upgBtn = document.getElementById("bmodal-upgrade-btn");
    if (upgBtn) upgBtn.onclick = function () { DZ.upgradeBuilding(building); };

    const repBtn = document.getElementById("bmodal-repair-btn");
    if (repBtn) repBtn.onclick = function () { DZ.repairBuilding(building); };

    const trSoldier = document.getElementById("bmodal-train-soldier");
    if (trSoldier) {
      trSoldier.onclick = function () {
        if (typeof DZ.recruitUnit === "function") DZ.recruitUnit("soldier", building);
      };
    }
    const trChariot = document.getElementById("bmodal-train-chariot");
    if (trChariot) {
      trChariot.onclick = function () {
        if (typeof DZ.recruitUnit === "function") DZ.recruitUnit("chariot", building);
      };
    }
    const openVil = document.getElementById("bmodal-open-village");
    if (openVil) {
      openVil.onclick = function () {
        modal.classList.add("hidden");
        if (typeof DZ.openVillageModal === "function") DZ.openVillageModal();
      };
    }
    const openRes = document.getElementById("bmodal-open-research");
    if (openRes) {
      openRes.onclick = function () {
        modal.classList.add("hidden");
        if (typeof DZ.openResearchModal === "function") DZ.openResearchModal();
      };
    }
  };
})();
