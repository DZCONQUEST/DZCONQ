/**
 * Engine/dz_diplomacy.js
 * Relations diplomatiques et échanges entre civilisations.
 */
(function () {
  "use strict";
  window.DZ = window.DZ || {};
  const DZ = window.DZ;

  DZ.toggleDiplomacyStance = function () {
    DZ.state.diplomacyStatus = DZ.state.diplomacyStatus === "Trêve tribale" ? "Accord commercial" : "Trêve tribale";
    DZ.notify("Statut diplomatique : " + DZ.state.diplomacyStatus);
    if (typeof DZ.renderHUD === "function") DZ.renderHUD();
  };
})();
