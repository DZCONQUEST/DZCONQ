/**
 * data/algeria_map.js
 * Références géographiques continues de l'Algérie (sans frontières physiques ni administratives).
 */
(function () {
  "use strict";
  window.DZ = window.DZ || {};

  window.DZ.MAP_BOUNDS = {
    minLon: -8.67,
    maxLon: 11.99,
    minLat: 18.96,
    maxLat: 37.09,
    worldWidth: 1160,
    worldDepth: 960
  };

  window.DZ.ALGERIA_COAST_POLY = [
    [-2.21, 35.15], [-1.72, 35.10], [-0.64, 35.70], [0.09, 35.93], [1.34, 36.47],
    [2.44, 36.60], [3.06, 36.76], [3.89, 36.88], [5.07, 36.75], [5.77, 36.82],
    [6.44, 36.90], [7.76, 36.90], [8.64, 36.88], [9.55, 36.50], [9.85, 33.80],
    [9.40, 30.20], [9.80, 26.50], [8.50, 24.30], [5.75, 23.30], [4.20, 20.10],
    [-1.40, 19.10], [-4.80, 21.40], [-8.67, 27.60], [-8.40, 31.80], [-5.20, 34.40],
    [-2.21, 35.15]
  ];

  window.DZ.WILAYAS = [
    { code: "16", name: "Alger", lon: 3.0588, lat: 36.7538, biome: "Littoral", popBase: 3200, gold: 90, food: 85, wood: 70, iron: 50 },
    { code: "31", name: "Oran", lon: -0.6337, lat: 35.6969, biome: "Littoral", popBase: 2600, gold: 85, food: 80, wood: 65, iron: 55 },
    { code: "25", name: "Constantine", lon: 6.6147, lat: 36.3650, biome: "Tell", popBase: 2200, gold: 80, food: 90, wood: 85, iron: 75 },
    { code: "23", name: "Annaba", lon: 7.7669, lat: 36.9000, biome: "Littoral", popBase: 1950, gold: 85, food: 85, wood: 95, iron: 95 },
    { code: "06", name: "Béjaïa", lon: 5.0556, lat: 36.7509, biome: "Kabylie", popBase: 1850, gold: 70, food: 85, wood: 100, iron: 70 },
    { code: "15", name: "Tizi Ouzou", lon: 4.0459, lat: 36.7118, biome: "Kabylie", popBase: 1800, gold: 65, food: 85, wood: 100, iron: 65 },
    { code: "19", name: "Sétif", lon: 5.4029, lat: 36.1911, biome: "Hauts Plateaux", popBase: 2300, gold: 75, food: 100, wood: 70, iron: 60 },
    { code: "09", name: "Blida", lon: 2.8277, lat: 36.4700, biome: "Tell", popBase: 1750, gold: 70, food: 95, wood: 85, iron: 55 },
    { code: "13", name: "Tlemcen", lon: -1.3150, lat: 34.8783, biome: "Tell", popBase: 1700, gold: 80, food: 85, wood: 80, iron: 70 },
    { code: "05", name: "Batna", lon: 6.1742, lat: 35.5559, biome: "Aurès", popBase: 1750, gold: 80, food: 80, wood: 85, iron: 80 },
    { code: "29", name: "Mascara", lon: 0.1403, lat: 35.3966, biome: "Tell", popBase: 1450, gold: 65, food: 90, wood: 75, iron: 50 },
    { code: "22", name: "Sidi Bel Abbès", lon: -0.6308, lat: 35.1975, biome: "Tell", popBase: 1400, gold: 65, food: 95, wood: 70, iron: 55 },
    { code: "27", name: "Mostaganem", lon: 0.0892, lat: 35.9311, biome: "Littoral", popBase: 1400, gold: 70, food: 90, wood: 65, iron: 50 },
    { code: "10", name: "Bouira", lon: 3.9014, lat: 36.3749, biome: "Kabylie", popBase: 1200, gold: 60, food: 85, wood: 90, iron: 60 },
    { code: "35", name: "Boumerdès", lon: 3.4772, lat: 36.7664, biome: "Littoral", popBase: 1350, gold: 65, food: 85, wood: 80, iron: 55 },
    { code: "42", name: "Tipaza", lon: 2.4475, lat: 36.5897, biome: "Littoral", popBase: 1200, gold: 70, food: 85, wood: 80, iron: 50 },
    { code: "02", name: "Chlef", lon: 1.3345, lat: 36.1652, biome: "Tell", popBase: 1450, gold: 65, food: 90, wood: 70, iron: 55 },
    { code: "44", name: "Aïn Defla", lon: 1.9667, lat: 36.2639, biome: "Tell", popBase: 1250, gold: 60, food: 95, wood: 75, iron: 60 },
    { code: "26", name: "Médéa", lon: 2.7539, lat: 36.2642, biome: "Atlas", popBase: 1300, gold: 60, food: 90, wood: 85, iron: 60 },
    { code: "34", name: "Bordj Bou Arréridj", lon: 4.7611, lat: 36.0732, biome: "Hauts Plateaux", popBase: 1250, gold: 70, food: 85, wood: 65, iron: 65 },
    { code: "18", name: "Jijel", lon: 5.7667, lat: 36.8200, biome: "Littoral", popBase: 1150, gold: 65, food: 80, wood: 100, iron: 75 },
    { code: "21", name: "Skikda", lon: 6.9000, lat: 36.8667, biome: "Littoral", popBase: 1350, gold: 75, food: 80, wood: 90, iron: 80 },
    { code: "24", name: "Guelma", lon: 7.4261, lat: 36.4621, biome: "Tell", popBase: 1000, gold: 70, food: 85, wood: 85, iron: 75 },
    { code: "36", name: "El Tarf", lon: 8.3138, lat: 36.7672, biome: "Littoral", popBase: 900, gold: 65, food: 85, wood: 95, iron: 65 },
    { code: "41", name: "Souk Ahras", lon: 7.9511, lat: 36.2864, biome: "Aurès", popBase: 950, gold: 70, food: 85, wood: 85, iron: 75 },
    { code: "43", name: "Mila", lon: 6.2644, lat: 36.4503, biome: "Tell", popBase: 1100, gold: 65, food: 90, wood: 75, iron: 65 },
    { code: "04", name: "Oum El Bouaghi", lon: 7.1135, lat: 35.8754, biome: "Hauts Plateaux", popBase: 1050, gold: 70, food: 85, wood: 70, iron: 65 },
    { code: "40", name: "Khenchela", lon: 7.1433, lat: 35.4358, biome: "Aurès", popBase: 950, gold: 70, food: 80, wood: 90, iron: 70 },
    { code: "12", name: "Tébessa", lon: 8.1242, lat: 35.4042, biome: "Aurès", popBase: 1100, gold: 80, food: 75, wood: 75, iron: 95 },
    { code: "14", name: "Tiaret", lon: 1.3170, lat: 35.3711, biome: "Hauts Plateaux", popBase: 1250, gold: 65, food: 95, wood: 70, iron: 55 },
    { code: "38", name: "Tissemsilt", lon: 1.8111, lat: 35.6072, biome: "Atlas", popBase: 750, gold: 60, food: 80, wood: 85, iron: 60 },
    { code: "20", name: "Saïda", lon: 0.1517, lat: 34.8303, biome: "Hauts Plateaux", popBase: 850, gold: 65, food: 80, wood: 75, iron: 55 },
    { code: "46", name: "Aïn Témouchent", lon: -1.1400, lat: 35.2975, biome: "Littoral", popBase: 850, gold: 70, food: 85, wood: 65, iron: 50 },
    { code: "28", name: "M'Sila", lon: 4.5419, lat: 35.7058, biome: "Hauts Plateaux", popBase: 1450, gold: 70, food: 80, wood: 60, iron: 60 },
    { code: "17", name: "Djelfa", lon: 3.2630, lat: 34.6728, biome: "Steppe", popBase: 1550, gold: 70, food: 75, wood: 55, iron: 55 },
    { code: "07", name: "Biskra", lon: 5.7248, lat: 34.8481, biome: "Sahara", popBase: 1250, gold: 75, food: 80, wood: 45, iron: 50 },
    { code: "39", name: "El Oued", lon: 6.8632, lat: 33.3683, biome: "Sahara", popBase: 1150, gold: 70, food: 70, wood: 35, iron: 40 },
    { code: "30", name: "Ouargla", lon: 5.3250, lat: 31.9500, biome: "Sahara", popBase: 1100, gold: 95, food: 60, wood: 30, iron: 55 },
    { code: "47", name: "Ghardaïa", lon: 3.6735, lat: 32.4909, biome: "M'Zab", popBase: 900, gold: 85, food: 65, wood: 35, iron: 50 },
    { code: "03", name: "Laghouat", lon: 2.8651, lat: 33.8000, biome: "Steppe", popBase: 850, gold: 75, food: 70, wood: 45, iron: 50 },
    { code: "45", name: "Naâma", lon: -0.3167, lat: 33.2667, biome: "Steppe", popBase: 650, gold: 70, food: 70, wood: 50, iron: 60 },
    { code: "08", name: "Béchar", lon: -2.2167, lat: 31.6167, biome: "Sahara", popBase: 750, gold: 85, food: 55, wood: 30, iron: 85 },
    { code: "33", name: "Illizi", lon: 8.4846, lat: 26.4833, biome: "Sahara", popBase: 450, gold: 85, food: 45, wood: 25, iron: 65 },
    { code: "11", name: "Tamanrasset", lon: 5.5228, lat: 22.7850, biome: "Hoggar", popBase: 650, gold: 100, food: 50, wood: 25, iron: 80 },
    { code: "01", name: "Adrar", lon: -0.2827, lat: 27.8743, biome: "Sahara", popBase: 750, gold: 90, food: 55, wood: 25, iron: 70 },
    { code: "37", name: "Tindouf", lon: -8.1478, lat: 27.6742, biome: "Sahara", popBase: 450, gold: 80, food: 45, wood: 20, iron: 100 },
    { code: "32", name: "El Bayadh", lon: 1.0193, lat: 33.6831, biome: "Steppe", popBase: 650, gold: 70, food: 75, wood: 55, iron: 60 },
    { code: "48", name: "Relizane", lon: 0.5558, lat: 35.7373, biome: "Tell", popBase: 1100, gold: 65, food: 90, wood: 70, iron: 50 },
    { code: "49", name: "Timimoun", lon: 0.2410, lat: 29.2639, biome: "Sahara", popBase: 550, gold: 85, food: 60, wood: 25, iron: 55 },
    { code: "50", name: "Bordj Badji Mokhtar", lon: 0.9464, lat: 21.3278, biome: "Sahara", popBase: 350, gold: 80, food: 40, wood: 20, iron: 60 },
    { code: "51", name: "Ouled Djellal", lon: 5.0642, lat: 34.4369, biome: "Sahara", popBase: 550, gold: 70, food: 75, wood: 40, iron: 45 },
    { code: "52", name: "Béni Abbès", lon: -2.1728, lat: 30.1336, biome: "Sahara", popBase: 450, gold: 85, food: 55, wood: 25, iron: 70 },
    { code: "53", name: "In Salah", lon: 2.4607, lat: 27.1935, biome: "Sahara", popBase: 500, gold: 85, food: 50, wood: 25, iron: 60 },
    { code: "54", name: "In Guezzam", lon: 5.7694, lat: 19.5722, biome: "Sahara", popBase: 350, gold: 80, food: 40, wood: 20, iron: 65 },
    { code: "55", name: "Touggourt", lon: 6.0578, lat: 33.1036, biome: "Sahara", popBase: 750, gold: 80, food: 70, wood: 35, iron: 45 },
    { code: "56", name: "Djanet", lon: 9.4846, lat: 24.5542, biome: "Tassili", popBase: 400, gold: 90, food: 45, wood: 25, iron: 70 },
    { code: "57", name: "El M'Ghair", lon: 5.9222, lat: 33.9519, biome: "Sahara", popBase: 500, gold: 75, food: 70, wood: 35, iron: 45 },
    { code: "58", name: "El Meniaa", lon: 2.8822, lat: 30.5792, biome: "Sahara", popBase: 450, gold: 80, food: 60, wood: 30, iron: 55 }
  ];

  window.DZ.lonLatToWorld = function (lon, lat) {
    const b = window.DZ.MAP_BOUNDS;
    const u = (lon - b.minLon) / (b.maxLon - b.minLon);
    const v = (lat - b.minLat) / (b.maxLat - b.minLat);
    return {
      x: (u - 0.5) * b.worldWidth,
      z: -(v - 0.5) * b.worldDepth
    };
  };

  window.DZ.worldToLonLat = function (x, z) {
    const b = window.DZ.MAP_BOUNDS;
    const u = x / b.worldWidth + 0.5;
    const v = -z / b.worldDepth + 0.5;
    return {
      lon: b.minLon + u * (b.maxLon - b.minLon),
      lat: b.minLat + v * (b.maxLat - b.minLat)
    };
  };

  window.DZ.findNearestWilaya = function (x, z) {
    let best = null;
    let bestD2 = Infinity;
    const list = window.DZ.WILAYAS || [];
    for (let i = 0; i < list.length; i++) {
      const w = list[i];
      const p = window.DZ.lonLatToWorld(w.lon, w.lat);
      const dx = p.x - x;
      const dz = p.z - z;
      const d2 = dx * dx + dz * dz;
      if (d2 < bestD2) {
        bestD2 = d2;
        best = w;
      }
    }
    return best;
  };
})();
