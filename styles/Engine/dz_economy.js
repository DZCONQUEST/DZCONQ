/**
 * DZ CONQUEST
 * Économie et dépôts de ressources.
 * La production est désormais assurée par les travailleurs.
 */
(function () {
  "use strict";

  window.DZ = window.DZ || {};
  const DZ = window.DZ;

  DZ.getTechModifiers = function () {
    const mods = {
      foodMult: 1,
      woodMult: 1,
      ironMult: 1,
      goldMult: 1,
      stoneMult: 1,
      speedMult: 1,
      attackBonus: 0,
      defenseBonus: 0,
      storehouseBonus: 0
    };

    const unlocked = DZ.state.unlockedTechnologies || [];
    const catalog = DZ.TECHNOLOGIES || [];

    for (let i = 0; i < catalog.length; i++) {
      const tech = catalog[i];

      if (unlocked.indexOf(tech.id) === -1 || !tech.effects) continue;

      const e = tech.effects;

      if (e.foodMult) mods.foodMult *= e.foodMult;
      if (e.woodMult) mods.woodMult *= e.woodMult;
      if (e.ironMult) mods.ironMult *= e.ironMult;
      if (e.goldMult) mods.goldMult *= e.goldMult;
      if (e.stoneMult) mods.stoneMult *= e.stoneMult;
      if (e.speedMult) mods.speedMult *= e.speedMult;
      if (e.attackBonus) mods.attackBonus += e.attackBonus;
      if (e.defenseBonus) mods.defenseBonus += e.defenseBonus;
      if (e.storehouseBonus) mods.storehouseBonus += e.storehouseBonus;
    }

    return mods;
  };

  DZ.hasHarvestBuilding = function (owner, kind) {
    const reqMap = {
      food: "farm",
      wood: "lumber_camp",
      iron: "iron_mine",
      gold: "gold_mine",
      stone: "quarry"
    };

    const neededType = reqMap[kind];

    if (!neededType) return true;

    return (DZ.state.buildings || []).some(function (b) {
      return b.owner === owner &&
        b.type === neededType &&
        b.progress >= 1;
    });
  };

  DZ.depositResource = function (owner, kind, amount) {
    if (!kind || !amount || amount <= 0) return 0;

    const mods = DZ.getTechModifiers();
    const multKey = kind + "Mult";
    const mult = mods[multKey] || 1;
    const finalAmt = Math.round(amount * mult);

    if (owner === "player") {
      DZ.state.resources[kind] =
        (DZ.state.resources[kind] || 0) + finalAmt;
    }

    return finalAmt;
  };

  DZ.updateEconomy = function () {
    DZ.state.productionRates = {
      gold: 0,
      food: 0,
      wood: 0,
      iron: 0,
      stone: 0
    };
  };

})();
