/**
 * DZ CONQUEST
 * Terrain carré, plat et vide.
 */
(function () {
  "use strict";

  window.DZ = window.DZ || {};

  const DZ = window.DZ;
  const THREE = window.THREE;

  DZ.getTerrainHeight = function () {
    return 0;
  };

  DZ.buildTerrain = function () {
    if (!DZ.ctx || !DZ.ctx.terrainGroup) {
      console.error("DZ CONQUEST : terrainGroup introuvable.");
      return;
    }

    const group = DZ.ctx.terrainGroup;

    while (group.children.length > 0) {
      const object = group.children[0];
      group.remove(object);

      if (object.geometry) object.geometry.dispose();

      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    }

    const config = DZ.TERRAIN_CONFIG || {};
    const bounds = DZ.MAP_BOUNDS || {
      worldWidth: 1160,
      worldDepth: 960
    };

    const size = config.worldSize ||
      Math.max(bounds.worldWidth, bounds.worldDepth);

    const geometry = new THREE.PlaneGeometry(size, size, 1, 1);
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.MeshStandardMaterial({
      color: config.color || 0x4f8b3b,
      roughness: 1,
      metalness: 0
    });

    const terrain = new THREE.Mesh(geometry, material);

    terrain.name = "simple_green_terrain";
    terrain.position.set(0, 0, 0);
    terrain.receiveShadow = true;
    terrain.castShadow = false;

    group.add(terrain);

    console.log("DZ CONQUEST : terrain carré vide construit.");
  };
})();
