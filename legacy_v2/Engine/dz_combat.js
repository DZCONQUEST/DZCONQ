/**
 * Engine/dz_combat.js
 * Calcul de vitesse d'armée (moyenne des vitesses Soldat=25 / Char=12) et résolution d'escarmouches.
 */
(function () {
  "use strict";
  window.DZ = window.DZ || {};
  const DZ = window.DZ;

  DZ.computeArmySpeed = function (armyUnits) {
    if (!armyUnits || armyUnits.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < armyUnits.length; i++) {
      sum += armyUnits[i].speed || 0;
    }
    return sum / armyUnits.length;
  };

  DZ.updateCombat = function (dt) {
    const units = DZ.state.units || [];
    const mods = typeof DZ.getTechModifiers === "function" ? DZ.getTechModifiers() : { attackBonus: 0, defenseBonus: 0 };

    for (let i = 0; i < units.length; i++) {
      const a = units[i];
      if (a.role !== "soldier" && a.role !== "chariot") continue;
      for (let j = 0; j < units.length; j++) {
        const b = units[j];
        if (a.owner === b.owner) continue;
        if (Math.hypot(a.x - b.x, a.z - b.z) < 6.5) {
          const atk = (a.attack || 10) + (a.owner === "player" ? mods.attackBonus : 0);
          const def = (b.defense || 5) + (b.owner === "player" ? mods.defenseBonus : 0);
          const dmg = Math.max(2, (atk - def * 0.4) * dt * 2.2);
          b.hp -= dmg;
          if (b.hp <= 0 && b.mesh && DZ.ctx.unitsGroup) {
            DZ.ctx.unitsGroup.remove(b.mesh);
            units.splice(j, 1);
            if (j < i) i--;
            j--;
          }
        }
      }
    }
  };
})();
