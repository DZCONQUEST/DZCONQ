/**
 * data/buildings.js
 * Catalogue des bâtiments et évolutions historiques par époque (Numidie -> Contemporain).
 */
(function () {
  "use strict";
  window.DZ = window.DZ || {};

  window.DZ.BUILDINGS_CATALOG = [
    {
      type: "house",
      label: "Maison",
      icon: "🏠",
      category: "Habitat",
      popBonus: 2,
      storageCap: 0,
      cost: { wood: 80, gold: 0, food: 0, iron: 0 },
      unlockReq: null,
      functionDesc: "Loge 2 habitants supplémentaires à chaque achèvement."
    },
    {
      type: "farm",
      label: "Ferme",
      icon: "🌾",
      category: "Agriculture",
      popBonus: 0,
      storageCap: 1500,
      cost: { wood: 100, gold: 0, food: 0, iron: 0 },
      unlockReq: null,
      functionDesc: "Produit de la nourriture (capacité 1 500 unités)."
    },
    {
      type: "lumber_camp",
      label: "Scierie",
      icon: "🪓",
      category: "Exploitation",
      popBonus: 0,
      storageCap: 1500,
      cost: { wood: 90, gold: 20, food: 0, iron: 0 },
      unlockReq: null,
      functionDesc: "Récolte et stocke le bois (capacité 1 500 unités)."
    },
    {
      type: "iron_mine",
      label: "Mine de fer",
      icon: "⛏️",
      category: "Exploitation",
      popBonus: 0,
      storageCap: 1500,
      cost: { wood: 120, gold: 40, food: 0, iron: 0 },
      unlockReq: null,
      functionDesc: "Extrait et stocke le fer (capacité 1 500 unités)."
    },
    {
      type: "gold_mine",
      label: "Mine d'or",
      icon: "🪙",
      category: "Exploitation",
      popBonus: 0,
      storageCap: 1500,
      cost: { wood: 140, gold: 50, food: 0, iron: 20 },
      unlockReq: null,
      functionDesc: "Extrait et stocke l'or (capacité 1 500 unités)."
    },
    {
      type: "quarry",
      label: "Carrière",
      icon: "🪨",
      category: "Exploitation",
      popBonus: 0,
      storageCap: 1500,
      cost: { wood: 110, gold: 30, food: 0, iron: 10 },
      unlockReq: null,
      functionDesc: "Extrait et stocke la pierre (capacité 1 500 unités)."
    },
    {
      type: "storehouse",
      label: "Magasin",
      icon: "🏬",
      category: "Stockage",
      popBonus: 0,
      storageCap: 10000,
      cost: { wood: 150, gold: 50, food: 0, iron: 20 },
      unlockReq: null,
      functionDesc: "Entrepôt central de 10 000 unités alimenté par les transporteurs."
    },
    {
      type: "barracks",
      label: "Caserne",
      icon: "⚔️",
      category: "Militaire",
      popBonus: 0,
      storageCap: 0,
      cost: { wood: 160, gold: 80, food: 0, iron: 40 },
      unlockReq: null,
      functionDesc: "Permet de recruter des Soldats et des Chars."
    },
    {
      type: "watchtower",
      label: "Poste de garde",
      icon: "🗼",
      category: "Militaire",
      popBonus: 0,
      storageCap: 0,
      cost: { wood: 100, gold: 40, food: 0, iron: 30 },
      unlockReq: null,
      functionDesc: "Surveille les alentours et renforce la défense locale."
    },
    {
      type: "dar_el_jamaa",
      label: "Dar El Jamaa",
      icon: "🏛️",
      category: "Administration",
      popBonus: 0,
      storageCap: 0,
      cost: { wood: 180, gold: 100, food: 60, iron: 40 },
      unlockReq: { houses: 3, barracks: 1, farms: 1 },
      functionDesc: "Conseil du village : gestion, priorités, recherches et passage d'époque."
    }
  ];

  window.DZ.BUILDING_ERA_STYLES = {
    house: [
      "Maison numide",
      "Maison vandale",
      "Maison romaine",
      "Maison byzantine",
      "Maison islamique",
      "Maison des corsaires",
      "Maison ottomane",
      "Maison industrielle",
      "Maison moderne",
      "Maison contemporaine"
    ],
    dar_el_jamaa: [
      "Dar El Jamaa numide",
      "Assemblée vandale",
      "Curia & Jamaa romaine",
      "Conseil byzantin",
      "Dar El Jamaa islamique",
      "Diwan des corsaires",
      "Dar El Jamaa ottoman",
      "Hôtel de ville industriel",
      "Centre civique moderne",
      "Pôle administratif contemporain"
    ]
  };
})();
