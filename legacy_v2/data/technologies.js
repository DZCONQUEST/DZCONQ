/**
 * data/technologies.js
 * Table de recherche couvrant les périodes précédant l'Âge islamique :
 * Âge de Numidie, Âge des Vandales, Âge romain, Âge byzantin (Chapitre 11).
 */
(function () {
  "use strict";
  window.DZ = window.DZ || {};

  window.DZ.TECHNOLOGIES = [
    {
      id: "tech_irrigation_numide",
      name: "Irrigation des vallées numides",
      eraIndex: 0,
      eraName: "Âge de Numidie",
      category: "Agriculture",
      cost: { food: 120, wood: 80, gold: 40 },
      duration: 6,
      prereq: null,
      bonusText: "+20% production de nourriture",
      effects: { foodMult: 1.2 }
    },
    {
      id: "tech_charpenterie_atlas",
      name: "Charpenterie des cèdres et chênes",
      eraIndex: 0,
      eraName: "Âge de Numidie",
      category: "Exploitation",
      cost: { wood: 140, gold: 50 },
      duration: 6,
      prereq: null,
      bonusText: "+20% production de bois",
      effects: { woodMult: 1.2 }
    },
    {
      id: "tech_cavalerie_numide",
      name: "Équitation numide légère",
      eraIndex: 0,
      eraName: "Âge de Numidie",
      category: "Militaire",
      cost: { food: 100, gold: 90, iron: 40 },
      duration: 7,
      prereq: null,
      bonusText: "+3 attaque militaire",
      effects: { attackBonus: 3 }
    },
    {
      id: "tech_navigation_littorale",
      name: "Navigation côtière méditerranéenne",
      eraIndex: 1,
      eraName: "Âge des Vandales",
      category: "Navigation",
      cost: { wood: 180, gold: 110 },
      duration: 8,
      prereq: "tech_charpenterie_atlas",
      bonusText: "+15% rendement commercial & or",
      effects: { goldMult: 1.15 }
    },
    {
      id: "tech_metallurgie_vandale",
      name: "Forge et trempe des lames",
      eraIndex: 1,
      eraName: "Âge des Vandales",
      category: "Métallurgie",
      cost: { iron: 150, gold: 100, wood: 90 },
      duration: 8,
      prereq: "tech_cavalerie_numide",
      bonusText: "+25% extraction de fer et d'or",
      effects: { ironMult: 1.25, goldMult: 1.1 }
    },
    {
      id: "tech_aqueducs_romains",
      name: "Aqueducs, routes pavées et maçonnerie",
      eraIndex: 2,
      eraName: "Âge romain",
      category: "Construction",
      cost: { wood: 220, gold: 160, iron: 120 },
      duration: 9,
      prereq: "tech_irrigation_numide",
      bonusText: "+25% vitesse de déplacement & +2 500 capacité magasin",
      effects: { speedMult: 1.25, storehouseBonus: 2500 }
    },
    {
      id: "tech_legion_fortifications",
      name: "Fortifications et tactiques de cohorte",
      eraIndex: 2,
      eraName: "Âge romain",
      category: "Militaire",
      cost: { gold: 180, iron: 160, food: 140 },
      duration: 9,
      prereq: "tech_metallurgie_vandale",
      bonusText: "+5 défense militaire & +4 attaque",
      effects: { defenseBonus: 5, attackBonus: 4 }
    },
    {
      id: "tech_administration_byzantine",
      name: "Administration byzantine et citadelles",
      eraIndex: 3,
      eraName: "Âge byzantin",
      category: "Administration",
      cost: { gold: 240, wood: 200, iron: 160 },
      duration: 10,
      prereq: "tech_aqueducs_romains",
      bonusText: "+20% production globale & +5 000 capacité magasin",
      effects: { foodMult: 1.2, woodMult: 1.2, ironMult: 1.2, goldMult: 1.2, storehouseBonus: 5000 }
    }
  ];
})();
