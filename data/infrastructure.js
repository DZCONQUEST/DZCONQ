/**
 * data/infrastructure.js
 * Règles de placement, transport et déblocage administratif (Chapitres 7, 8, 9).
 */
(function () {
  "use strict";
  window.DZ = window.DZ || {};

  window.DZ.INFRASTRUCTURE_RULES = {
    maxSlopeHeightDiff: 14.5,
    minBuildingSpacing: 7.0,
    darElJamaaUnlock: {
      houses: 3,
      barracks: 1,
      farms: 1
    },
    transportBatch: 25
  };
})();
