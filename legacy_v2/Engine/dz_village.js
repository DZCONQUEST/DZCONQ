/**
 * Engine/dz_village.js
 * Centre administratif Dar El Jamaa : informations du village, population, économie,
 * décisions (renommage, priorités) et évolution vers l'époque suivante (Chapitres 9 & 11).
 */
(function () {
  "use strict";
  window.DZ = window.DZ || {};
  const DZ = window.DZ;

  DZ.advanceEra = function () {
    const eras = DZ.ERAS || [];
    const cur = eras[DZ.state.eraIndex];
    if (!cur || !cur.nextCost) {
      DZ.notify("Vous avez atteint l'Âge contemporain (dernière époque disponible).");
      return;
    }
    const cost = cur.nextCost;
    const res = DZ.state.resources;
    if ((res.food || 0) < (cost.food || 0) || (res.wood || 0) < (cost.wood || 0) || (res.gold || 0) < (cost.gold || 0)) {
      DZ.notify("Ressources insuffisantes pour passer à l'époque suivante.");
      return;
    }
    res.food -= cost.food || 0;
    res.wood -= cost.wood || 0;
    res.gold -= cost.gold || 0;
    DZ.state.eraIndex += 1;

    // Mise à jour des noms historiques des bâtiments
    (DZ.state.buildings || []).forEach(function (b) {
      if (b.owner === "player" && typeof DZ.getBuildingStyledName === "function") {
        b.label = DZ.getBuildingStyledName(b.type, DZ.state.eraIndex);
      }
    });

    const nextEra = eras[DZ.state.eraIndex];
    DZ.notify("Nouvelle époque atteinte : " + nextEra.name + " !");
    if (typeof DZ.openVillageModal === "function") DZ.openVillageModal();
    if (typeof DZ.renderHUD === "function") DZ.renderHUD();
  };

  DZ.openVillageModal = function () {
    const modal = document.getElementById("village-modal");
    const body = document.getElementById("vmodal-body");
    if (!modal || !body) return;

    const pop = typeof DZ.getPopulationSummary === "function" ? DZ.getPopulationSummary() : { total: 0, men: 0, women: 0, availableWorkers: 0, busyWorkers: 0, housingCapacity: 2 };
    const eras = DZ.ERAS || [];
    const curEra = eras[DZ.state.eraIndex] || { name: "Âge de Numidie", nextCost: null };
    const res = DZ.state.resources || {};
    const rates = DZ.state.productionRates || {};

    let html = "<div class='inspector-stats'>";
    html += "<div><strong>Nom du village :</strong> <input id='vmodal-name-input' type='text' value=\"" + String(DZ.state.villageName || "").replace(/\"/g, "&quot;") + "\" style='background:#15110c;color:#fff;border:1px solid rgba(212,175,55,0.5);padding:3px 7px;border-radius:5px;'/> <button class='gold-btn' id='vmodal-save-name'>Renommer</button></div>";
    html += "<div style='margin-top:6px;'><strong>Époque :</strong> " + curEra.name + " | <strong>Bâtiments :</strong> " + (DZ.state.buildings || []).filter(function (b) { return b.owner === "player"; }).length + "</div>";
    html += "<div><strong>Population :</strong> " + pop.total + " (Hommes : " + pop.men + ", Femmes : " + pop.women + ") | <strong>Logements :</strong> " + pop.total + "/" + pop.housingCapacity + "</div>";
    html += "<div><strong>Travailleurs :</strong> " + pop.availableWorkers + " disponibles / " + pop.busyWorkers + " affectés</div>";
    html += "<div><strong>Stocks :</strong> Or " + Math.floor(res.gold || 0) + " | Nourriture " + Math.floor(res.food || 0) + " | Bois " + Math.floor(res.wood || 0) + " | Fer " + Math.floor(res.iron || 0) + "</div>";
    html += "<div><strong>Production /s :</strong> +" + (rates.food || 0).toFixed(1) + " Nourriture, +" + (rates.wood || 0).toFixed(1) + " Bois, +" + (rates.iron || 0).toFixed(1) + " Fer, +" + (rates.gold || 0).toFixed(1) + " Or</div>";
    html += "</div>";

    html += "<div style='display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;'>";
    html += "<button class='gold-btn' id='vmodal-cycle-prio'>Priorité : " + DZ.state.priorities.production + " (Changer)</button>";
    html += "<button class='gold-btn' id='vmodal-open-tech'>Ouvrir Table de Recherche</button>";
    if (curEra.nextCost) {
      html += "<button class='gold-btn accent' id='vmodal-advance-era'>Passer à l'époque suivante (" + curEra.nextCost.food + "🌾 " + curEra.nextCost.wood + "🌲 " + curEra.nextCost.gold + "🪙)</button>";
    }
    html += "</div>";

    body.innerHTML = html;
    modal.classList.remove("hidden");

    const saveNameBtn = document.getElementById("vmodal-save-name");
    if (saveNameBtn) {
      saveNameBtn.onclick = function () {
        const inp = document.getElementById("vmodal-name-input");
        if (inp && inp.value.trim()) {
          DZ.state.villageName = inp.value.trim();
          DZ.notify("Village renommé en « " + DZ.state.villageName + " ».");
          if (typeof DZ.renderHUD === "function") DZ.renderHUD();
        }
      };
    }

    const prioBtn = document.getElementById("vmodal-cycle-prio");
    if (prioBtn) {
      prioBtn.onclick = function () {
        const list = ["Équilibrée", "Agriculture & Population", "Bois & Construction", "Métallurgie & Armée"];
        const idx = list.indexOf(DZ.state.priorities.production);
        DZ.state.priorities.production = list[(idx + 1) % list.length];
        DZ.openVillageModal();
      };
    }

    const techBtn = document.getElementById("vmodal-open-tech");
    if (techBtn) {
      techBtn.onclick = function () {
        modal.classList.add("hidden");
        if (typeof DZ.openResearchModal === "function") DZ.openResearchModal();
      };
    }

    const eraBtn = document.getElementById("vmodal-advance-era");
    if (eraBtn) eraBtn.onclick = DZ.advanceEra;
  };
})();
