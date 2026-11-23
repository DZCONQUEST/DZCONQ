/**
 * DZ CONQUEST
 * Sélection et affectation des travailleurs.
 */
(function () {
  "use strict";

  window.DZ = window.DZ || {};
  const DZ = window.DZ;

  DZ.selectUnit = function (unit) {
    DZ.state.selectedUnit = unit || null;

    if (unit) {
      DZ.state.selectedBuilding = null;
      DZ.state.buildModeType = null;

      if (DZ.state.previewMesh && DZ.ctx.scene) {
        DZ.ctx.scene.remove(DZ.state.previewMesh);
        DZ.state.previewMesh = null;
      }

      DZ.notify(unit.name + " sélectionné.");
    } else if (typeof DZ.hideBuilderChoicePopover === "function") {
      DZ.hideBuilderChoicePopover();
    }

    if (typeof DZ.renderHUD === "function") {
      DZ.renderHUD();
    }
  };

  DZ.issueTargetOrder = function (pt, clickedBuilding, clickedResource) {
    const unit = DZ.state.selectedUnit;

    if (!unit) return false;

    if (unit.role !== "civil") {
      DZ.notify("Seuls les travailleurs peuvent effectuer cette tâche.");
      return false;
    }

    if (clickedBuilding) {

      if (clickedBuilding.progress < 1) {
        unit.mission = "build";
        unit.targetBuilding = clickedBuilding;
        unit.targetNode = null;
        unit.targetPos = {
          x: clickedBuilding.x,
          z: clickedBuilding.z
        };

        if (typeof DZ.setDestinationMarker === "function") {
          DZ.setDestinationMarker(clickedBuilding.x, clickedBuilding.z);
        }

        DZ.notify(unit.name + " va construire « " + clickedBuilding.label + " ».");
        return true;
      }

      if (clickedBuilding.type === "storehouse") {
        unit.mission = "transport";
        unit.targetBuilding = clickedBuilding;
        unit.targetNode = null;
        unit.targetPos = {
          x: clickedBuilding.x,
          z: clickedBuilding.z
        };

        if (typeof DZ.setDestinationMarker === "function") {
          DZ.setDestinationMarker(clickedBuilding.x, clickedBuilding.z);
        }

        DZ.notify(unit.name + " se dirige vers le dépôt.");
        return true;
      }

      const resourceTypes = {
        farm: "food",
        lumber_camp: "wood",
        iron_mine: "iron",
        gold_mine: "gold",
        quarry: "stone"
      };

      const resourceKind = resourceTypes[clickedBuilding.type];

      if (resourceKind && clickedBuilding.owner === unit.owner) {
        unit.mission = "work";
        unit.workBuilding = clickedBuilding;
        unit.targetBuilding = clickedBuilding;
        unit.targetNode = null;
        unit.carryKind = unit.carryKind || null;
        unit.carryAmount = unit.carryAmount || 0;

        unit.targetPos = {
          x: clickedBuilding.x,
          z: clickedBuilding.z
        };

        if (typeof DZ.setDestinationMarker === "function") {
          DZ.setDestinationMarker(clickedBuilding.x, clickedBuilding.z);
        }

        DZ.notify(unit.name + " est affecté à « " + clickedBuilding.label + " ».");
        return true;
      }

      unit.mission = "move";
      unit.targetBuilding = null;
      unit.workBuilding = null;
      unit.targetNode = null;
      unit.targetPos = {
        x: clickedBuilding.x,
        z: clickedBuilding.z
      };

      return true;
    }

    const node = clickedResource ||
      (typeof DZ.findNearestResource === "function"
        ? DZ.findNearestResource(pt.x, pt.z)
        : null);

    if (node && Math.hypot(node.x - pt.x, node.z - pt.z) <= 5.5) {
      unit.mission = node.kind;
      unit.targetNode = node;
      unit.targetBuilding = null;
      unit.workBuilding = null;
      unit.targetPos = {
        x: node.x,
        z: node.z
      };

      if (typeof DZ.setDestinationMarker === "function") {
        DZ.setDestinationMarker(node.x, node.z);
      }

      DZ.notify(unit.name + " affecté à la récolte.");
      return true;
    }

    unit.mission = "move";
    unit.targetNode = null;
    unit.targetBuilding = null;
    unit.workBuilding = null;
    unit.targetPos = {
      x: pt.x,
      z: pt.z
    };

    if (typeof DZ.setDestinationMarker === "function") {
      DZ.setDestinationMarker(pt.x, pt.z);
    }

    DZ.notify(unit.name + " se déplace.");

    return true;
  };

})();
