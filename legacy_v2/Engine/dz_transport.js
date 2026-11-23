/**
 * Engine/dz_transport.js
 * Transport des ressources assuré exclusivement par les travailleurs.
 *
 * Aucune production passive.
 * Aucun transfert automatique entre bâtiments.
 * Les travailleurs transportent eux-mêmes les ressources
 * jusqu'aux magasins.
 */
(function () {
  "use strict";

  window.DZ = window.DZ || {};
  const DZ = window.DZ;

  DZ.updateTransportLogistics = function () {
    // Le transport est désormais géré par dz_units.js.
    // Ce module ne produit et ne transfère aucune ressource.
  };

})();
