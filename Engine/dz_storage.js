/**
 * Engine/dz_storage.js
 * Gestion des capacités de stockage : 1 500 unités par infrastructure de production
 * et 10 000 unités par Magasin (Chapitre 7).
 */
(function () {
  "use strict";
  window.DZ = window.DZ || {};
  const DZ = window.DZ;

  DZ.getBuildingStorageCapacity = function (building) {
    if (!building) return 0;
    const limits = DZ.STORAGE_LIMITS || { productionDefault: 1500, storehouseDefault: 10000 };
    const mods = typeof DZ.getTechModifiers === "function" ? DZ.getTechModifiers() : { storehouseBonus: 0 };
    if (building.type === "storehouse") {
      return limits.storehouseDefault + (mods.storehouseBonus || 0) + (building.level - 1) * 2000;
    }
    if (["farm", "lumber_camp", "iron_mine", "gold_mine", "quarry"].indexOf(building.type) !== -1) {
      return limits.productionDefault + (building.level - 1) * 500;
    }
    return 0;
  };

  DZ.getTotalStoredInBuilding = function (building) {
    if (!building || !building.stored) return 0;
    const s = building.stored;
    return (s.gold || 0) + (s.food || 0) + (s.wood || 0) + (s.iron || 0) + (s.stone || 0);
  };

  DZ.storeInBuilding = function (building, kind, amount) {
    if (!building || !kind || amount <= 0) return 0;
    const cap = DZ.getBuildingStorageCapacity(building);
    if (cap <= 0) return 0;
    const used = DZ.getTotalStoredInBuilding(building);
    const available = Math.max(0, cap - used);
    const deposited = Math.min(available, amount);
    building.stored = building.stored || { gold: 0, food: 0, wood: 0, iron: 0, stone: 0 };
    building.stored[kind] = (building.stored[kind] || 0) + deposited;
    return deposited;
  };

  DZ.withdrawFromBuilding = function (building, kind, amount) {
    if (!building || !building.stored || !kind || amount <= 0) return 0;
    const current = building.stored[kind] || 0;
    const taken = Math.min(current, amount);
    building.stored[kind] = current - taken;
    return taken;
  };
})();
