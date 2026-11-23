/**
 * Engine/dz_population.js
 * Gestion démographique : 2 habitants initiaux (Homme + Femme) et +2 par maison achevée (Chapitres 4 & 5).
 */
(function () {
  "use strict";
  window.DZ = window.DZ || {};
  const DZ = window.DZ;

  DZ.getPopulationSummary = function () {
    const units = DZ.state.units || [];
    const civils = units.filter(function (u) { return u.role === "civil"; });
    const men = civils.filter(function (u) { return u.sex === "M"; }).length;
    const women = civils.filter(function (u) { return u.sex === "F"; }).length;
    const soldiers = units.filter(function (u) { return u.role === "soldier" || u.role === "chariot"; }).length;

    const completedHouses = (DZ.state.buildings || []).filter(function (b) {
      return b.owner === "player" && b.type === "house" && b.progress >= 1;
    }).length;

    const perHouse = (DZ.POPULATION_CONFIG && DZ.POPULATION_CONFIG.residentsPerCompletedHouse) || 2;
    const capacity = 2 + completedHouses * perHouse;
    const total = units.length;
    const busyWorkers = civils.filter(function (u) {
      return Boolean(u.targetNode || u.targetBuilding || u.targetPos || u.carryKind);
    }).length;
    const availableWorkers = Math.max(0, civils.length - busyWorkers);

    return {
      total: total,
      civils: civils.length,
      men: men,
      women: women,
      soldiers: soldiers,
      busyWorkers: busyWorkers,
      availableWorkers: availableWorkers,
      housingCapacity: capacity,
      completedHouses: completedHouses
    };
  };

  DZ.onHouseCompletedGrowth = function (x, z, wilayaCode) {
    const perHouse = (DZ.POPULATION_CONFIG && DZ.POPULATION_CONFIG.residentsPerCompletedHouse) || 2;
    if (typeof DZ.spawnUnit === "function") {
      DZ.spawnUnit("player", wilayaCode || "16", "civil", "M", x + 2.2, z + 1.4);
      DZ.spawnUnit("player", wilayaCode || "16", "civil", "F", x - 2.2, z - 1.4);
      DZ.notify("Maison achevée : +" + perHouse + " habitants (1 Homme, 1 Femme) ont rejoint le village.");
    }
  };
})();
