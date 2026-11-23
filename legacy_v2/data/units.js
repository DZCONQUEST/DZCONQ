/**
 * DZ CONQUEST
 * Statistiques des unités civiles et militaires.
 */
(function () {
  "use strict";

  window.DZ = window.DZ || {};

  window.DZ.UNIT_STATS = {
    civil_man: {
      id: "civil_man",
      role: "civil",
      sex: "M",
      namePrefix: "Habitant",
      attack: 3,
      defense: 2,
      hp: 100,
      speed: 24,
      range: 1,
      cost: { food: 50, gold: 0, wood: 0, iron: 0 },
      trainTime: 4
    },

    civil_woman: {
      id: "civil_woman",
      role: "civil",
      sex: "F",
      namePrefix: "Habitante",
      attack: 3,
      defense: 2,
      hp: 100,
      speed: 24,
      range: 1,
      cost: { food: 50, gold: 0, wood: 0, iron: 0 },
      trainTime: 4
    },

    soldier: {
      id: "soldier",
      role: "soldier",
      sex: "M",
      namePrefix: "Soldat",
      attack: 10,
      defense: 7,
      hp: 120,
      speed: 25,
      range: 1.5,
      cost: { food: 60, gold: 30, wood: 0, iron: 20 },
      trainTime: 5
    },

    chariot: {
      id: "chariot",
      role: "chariot",
      sex: "M",
      namePrefix: "Char",
      attack: 25,
      defense: 14,
      hp: 210,
      speed: 12,
      range: 2,
      cost: { food: 90, gold: 70, wood: 80, iron: 40 },
      trainTime: 7
    }
  };

  window.DZ.CLOTH_PALETTE = [
    "#2563eb", "#0d9488", "#d97706", "#dc2626", "#7c3aed",
    "#16a34a", "#db2777", "#ea580c", "#0284c7", "#ca8a04"
  ];

})();
