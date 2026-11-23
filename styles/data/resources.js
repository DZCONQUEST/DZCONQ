/**
 * data/resources.js
 * Ressources naturelles et capacités de stockage (Chapitres 4 & 7).
 */
(function () {
  "use strict";
  window.DZ = window.DZ || {};

  window.DZ.INITIAL_RESOURCES = {
    gold: 1000,
    food: 1000,
    wood: 1000,
    iron: 1000,
    stone: 400
  };

  window.DZ.STORAGE_LIMITS = {
    productionDefault: 1500,
    storehouseDefault: 10000,
    carryBatchDefault: 25
  };

  window.DZ.RESOURCE_META = {
    gold: { id: "gold", label: "Or", icon: "🪙", color: "#f59e0b", nodeKind: "gold", buildingType: "gold_mine" },
    food: { id: "food", label: "Nourriture", icon: "🌾", color: "#84cc16", nodeKind: "food", buildingType: "farm" },
    wood: { id: "wood", label: "Bois", icon: "🌲", color: "#22c55e", nodeKind: "wood", buildingType: "lumber_camp" },
    iron: { id: "iron", label: "Fer", icon: "⛏️", color: "#94a3b8", nodeKind: "iron", buildingType: "iron_mine" },
    stone: { id: "stone", label: "Pierre", icon: "🪨", color: "#cbd5e1", nodeKind: "stone", buildingType: "quarry" }
  };
})();
