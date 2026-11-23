/**
 * Engine/dz_research.js
 * Table de recherche couvrant Numidie, Vandales, Romain et Byzantin (avant l'Âge islamique).
 */
(function () {
  "use strict";
  window.DZ = window.DZ || {};
  const DZ = window.DZ;

  DZ.startTechnologyResearch = function (techId) {
    const tech = (DZ.TECHNOLOGIES || []).find(function (t) { return t.id === techId; });
    if (!tech) return;
    if ((DZ.state.unlockedTechnologies || []).indexOf(tech.id) !== -1) {
      DZ.notify("Technologie déjà découverte : " + tech.name);
      return;
    }
    if (DZ.state.activeResearch) {
      DZ.notify("Une recherche est déjà en cours.");
      return;
    }
    if (tech.prereq && (DZ.state.unlockedTechnologies || []).indexOf(tech.prereq) === -1) {
      DZ.notify("Prérequis technologique manquant.");
      return;
    }

    const cost = tech.cost || {};
    const res = DZ.state.resources;
    for (const k in cost) {
      if ((res[k] || 0) < cost[k]) {
        DZ.notify("Ressources insuffisantes pour lancer " + tech.name + ".");
        return;
      }
    }
    for (const k in cost) {
      res[k] -= cost[k];
    }

    DZ.state.activeResearch = {
      id: tech.id,
      elapsed: 0,
      duration: tech.duration || 6
    };
    DZ.notify("Recherche lancée : " + tech.name + ".");
    if (typeof DZ.openResearchModal === "function") DZ.openResearchModal();
  };

  DZ.updateResearch = function (dt) {
    const act = DZ.state.activeResearch;
    if (!act) return;
    act.elapsed += dt;
    if (act.elapsed >= act.duration) {
      const tech = (DZ.TECHNOLOGIES || []).find(function (t) { return t.id === act.id; });
      if (tech && (DZ.state.unlockedTechnologies || []).indexOf(tech.id) === -1) {
        DZ.state.unlockedTechnologies.push(tech.id);
        DZ.notify("Technologie découverte : " + tech.name + " (" + tech.bonusText + ") !");
      }
      DZ.state.activeResearch = null;
      if (typeof DZ.renderHUD === "function") DZ.renderHUD();
    }
  };

  DZ.openResearchModal = function () {
    const modal = document.getElementById("research-modal");
    const body = document.getElementById("rmodal-body");
    if (!modal || !body) return;

    const list = DZ.TECHNOLOGIES || [];
    const unlocked = DZ.state.unlockedTechnologies || [];
    const active = DZ.state.activeResearch;

    let html = "";
    if (active) {
      const curTech = list.find(function (t) { return t.id === active.id; });
      const pct = Math.min(100, Math.round((active.elapsed / active.duration) * 100));
      html += "<div class='tech-row'><div><strong>En cours :</strong> " + (curTech ? curTech.name : active.id) + " (" + pct + "%)</div></div>";
    }

    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      const isDone = unlocked.indexOf(t.id) !== -1;
      const prereqMet = !t.prereq || unlocked.indexOf(t.prereq) !== -1;
      const costStr = Object.keys(t.cost || {}).map(function (k) { return t.cost[k] + " " + k; }).join(", ");

      html += "<div class='tech-row'>";
      html += "<div><strong>" + t.name + "</strong> <span style='color:#d4af37;'>[" + t.eraName + " • " + t.category + "]</span><br/>";
      html += "<span>" + t.bonusText + " • Coût : " + costStr + " • Durée : " + t.duration + "s</span>";
      if (!prereqMet) html += "<br/><span style='color:#fca5a5;'>Prérequis non débloqué</span>";
      html += "</div>";

      if (isDone) {
        html += "<button class='gold-btn accent' disabled>Découverte</button>";
      } else {
        html += "<button class='gold-btn' data-tech='" + t.id + "' " + (!prereqMet || Boolean(active) ? "disabled" : "") + ">Rechercher</button>";
      }
      html += "</div>";
    }

    body.innerHTML = html;
    modal.classList.remove("hidden");

    body.querySelectorAll("button[data-tech]").forEach(function (btn) {
      btn.onclick = function () {
        DZ.startTechnologyResearch(btn.getAttribute("data-tech"));
      };
    });
  };
})();
