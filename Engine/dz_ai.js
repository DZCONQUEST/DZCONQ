/**
 * Engine/dz_ai.js
 * Activité autonome légère des établissements et patrouilles rivales sur le monde ouvert.
 */
(function () {
  "use strict";
  window.DZ = window.DZ || {};
  const DZ = window.DZ;

  DZ.updateAI = function (dt) {
    const interval = (DZ.SETTINGS && DZ.SETTINGS.aiTickInterval) || 4.5;
    DZ.state.aiTimer = (DZ.state.aiTimer || 0) + dt;
    if (DZ.state.aiTimer < interval) return;
    DZ.state.aiTimer = 0;

    const aiUnits = (DZ.state.units || []).filter(function (u) { return u.owner === "ai"; });
    for (let i = 0; i < aiUnits.length; i++) {
      const u = aiUnits[i];
      if (!u.targetPos) {
        const ang = Math.random() * Math.PI * 2;
        u.targetPos = {
          x: u.x + Math.cos(ang) * 16,
          z: u.z + Math.sin(ang) * 16
        };
      }
    }
  };
})();
