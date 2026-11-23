/**
 * data/eras.js
 * Les 10 époques historiques algériennes (Chapitre 3 — aucun âge futur).
 */
(function () {
  "use strict";
  window.DZ = window.DZ || {};

  window.DZ.ERAS = [
    { index: 0, name: "Âge de Numidie", identity: "Civilisation numide", nextCost: { food: 180, wood: 180, gold: 120 } },
    { index: 1, name: "Âge des Vandales", identity: "Période vandale en Afrique du Nord", nextCost: { food: 240, wood: 220, gold: 160 } },
    { index: 2, name: "Âge romain", identity: "Présence et civilisation romaines", nextCost: { food: 300, wood: 260, gold: 220 } },
    { index: 3, name: "Âge byzantin", identity: "Période byzantine", nextCost: { food: 360, wood: 300, gold: 260 } },
    { index: 4, name: "Âge islamique", identity: "Civilisations musulmanes en Algérie", nextCost: { food: 420, wood: 350, gold: 320 } },
    { index: 5, name: "Âge des pirates", identity: "Corsaires et Régence d'Alger", nextCost: { food: 480, wood: 400, gold: 380 } },
    { index: 6, name: "Âge ottoman", identity: "Organisation politique et militaire ottomane", nextCost: { food: 550, wood: 450, gold: 440 } },
    { index: 7, name: "Âge industriel", identity: "Industrialisation et mécanisation", nextCost: { food: 650, wood: 520, gold: 520 } },
    { index: 8, name: "Âge moderne", identity: "Développement technologique moderne", nextCost: { food: 750, wood: 600, gold: 600 } },
    { index: 9, name: "Âge contemporain", identity: "Technologies et infrastructures contemporaines", nextCost: null }
  ];
})();
