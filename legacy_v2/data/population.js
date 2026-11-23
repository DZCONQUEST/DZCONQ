/**
 * data/population.js
 * Règles démographiques initiales et croissance (Chapitres 4 & 5).
 */
(function () {
  "use strict";
  window.DZ = window.DZ || {};

  window.DZ.POPULATION_CONFIG = {
    initialResidents: [
      { role: "civil", sex: "M", label: "Homme" },
      { role: "civil", sex: "F", label: "Femme" }
    ],
    residentsPerCompletedHouse: 2
  };
})();
