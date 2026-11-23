/**
 * Engine/dz_conquest.js
 * Contrôle et présence territoriale sans frontières physiques ni administratives (Chapitres 2 & 13).
 */
(function () {
  "use strict";
  window.DZ = window.DZ || {};
  const DZ = window.DZ;

  DZ.getPresenceSummary = function () {
    const playerBldgs = (DZ.state.buildings || []).filter(function (b) { return b.owner === "player"; }).length;
    const playerUnits = (DZ.state.units || []).filter(function (u) { return u.owner === "player"; }).length;
    return {
      influenceScore: playerBldgs * 25 + playerUnits * 15,
      openWorld: true,
      borders: false
    };
  };
})();
