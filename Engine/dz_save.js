/**
 * Engine/dz_save.js
 * Sauvegarde et restauration complètes de l'état du monde dans localStorage (Chapitres 15 & 16).
 */
(function () {
  "use strict";
  window.DZ = window.DZ || {};
  const DZ = window.DZ;

  DZ.saveGame = function () {
    try {
      const key = (DZ.SETTINGS && DZ.SETTINGS.saveKey) || "dz_conquest_v13_save";
      const payload = {
        started: DZ.state.started,
        gameTime: DZ.state.gameTime,
        eraIndex: DZ.state.eraIndex,
        villageName: DZ.state.villageName,
        resources: DZ.state.resources,
        priorities: DZ.state.priorities,
        unlockedTechnologies: DZ.state.unlockedTechnologies,
        activeResearch: DZ.state.activeResearch,
        objectives: DZ.state.objectives,
        buildings: (DZ.state.buildings || []).map(function (b) {
          return {
            id: b.id,
            type: b.type,
            label: b.label,
            icon: b.icon,
            owner: b.owner,
            wilayaCode: b.wilayaCode,
            x: b.x,
            z: b.z,
            level: b.level,
            hp: b.hp,
            maxHp: b.maxHp,
            progress: b.progress,
            stored: b.stored,
            pendingTransport: b.pendingTransport,
            incomingTotal: b.incomingTotal
          };
        }),
        units: (DZ.state.units || []).map(function (u) {
          return {
            id: u.id,
            name: u.name,
            owner: u.owner,
            wilayaCode: u.wilayaCode,
            role: u.role,
            sex: u.sex,
            clothColor: u.clothColor,
            x: u.x,
            z: u.z,
            hp: u.hp,
            maxHp: u.maxHp,
            mission: u.mission
          };
        })
      };
      localStorage.setItem(key, JSON.stringify(payload));
      DZ.notify("Partie sauvegardée avec succès.");
    } catch (e) {
      DZ.notify("Erreur lors de la sauvegarde.");
    }
  };

  DZ.loadGame = function () {
    try {
      const key = (DZ.SETTINGS && DZ.SETTINGS.saveKey) || "dz_conquest_v13_save";
      const raw = localStorage.getItem(key);
      if (!raw) {
        DZ.notify("Aucune sauvegarde trouvée.");
        return false;
      }
      const data = JSON.parse(raw);
      if (DZ.ctx.buildingsGroup) DZ.ctx.buildingsGroup.clear();
      if (DZ.ctx.unitsGroup) DZ.ctx.unitsGroup.clear();
      DZ.state.buildings = [];
      DZ.state.units = [];

      DZ.state.started = true;
      DZ.state.gameTime = data.gameTime || 0;
      DZ.state.eraIndex = data.eraIndex || 0;
      DZ.state.villageName = data.villageName || "Cirta & Atlas";
      DZ.state.resources = Object.assign({}, DZ.INITIAL_RESOURCES || {}, data.resources || {});
      DZ.state.priorities = Object.assign({}, DZ.state.priorities || {}, data.priorities || {});
      DZ.state.unlockedTechnologies = data.unlockedTechnologies || [];
      DZ.state.activeResearch = data.activeResearch || null;
      DZ.state.objectives = Object.assign({}, DZ.state.objectives || {}, data.objectives || {});

      (data.buildings || []).forEach(function (b) {
        const created = DZ.placeBuilding(b.type, b.x, b.z, b.owner, b.progress >= 1);
        if (created) {
          created.level = b.level || 1;
          created.hp = b.hp || created.maxHp;
          created.progress = b.progress !== undefined ? b.progress : 1;
          created.stored = b.stored || created.stored;
          created.pendingTransport = b.pendingTransport || 0;
          created.incomingTotal = b.incomingTotal || 0;
          if (created.mesh) created.mesh.scale.setScalar(0.35 + 0.65 * created.progress);
        }
      });

      (data.units || []).forEach(function (u) {
        DZ.spawnUnit(u.owner, u.wilayaCode, u.role, u.sex, u.x, u.z, u.name, u.clothColor);
      });

      const modal = document.getElementById("start-modal");
      if (modal) modal.classList.add("hidden");
      DZ.notify("Sauvegarde chargée.");
      if (typeof DZ.renderHUD === "function") DZ.renderHUD();
      return true;
    } catch (e) {
      DZ.notify("Impossible de charger la sauvegarde.");
      return false;
    }
  };
})();
