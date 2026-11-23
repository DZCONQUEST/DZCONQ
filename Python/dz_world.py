"""Calculs démographiques et de présence territoriale."""

def get_population_summary(state, population_config=None):
    units = state.get("units") or []
    buildings = state.get("buildings") or []
    civils = [u for u in units if u.get("role") == "civil"]
    men = sum(1 for u in civils if u.get("sex") == "M")
    women = sum(1 for u in civils if u.get("sex") == "F")
    soldiers = sum(1 for u in units if u.get("role") in ("soldier", "chariot"))
    completed_houses = sum(1 for b in buildings if b.get("owner") == "player" and b.get("type") == "house" and (b.get("progress") or 0) >= 1)
    per_house = (population_config or {}).get("residentsPerCompletedHouse") or 2
    capacity = 2 + completed_houses * per_house
    busy = sum(1 for u in civils if u.get("targetNode") or u.get("targetBuilding") or u.get("targetPos") or u.get("carryKind"))
    return {"total":len(units),"civils":len(civils),"men":men,"women":women,"soldiers":soldiers,
            "busyWorkers":busy,"availableWorkers":max(0,len(civils)-busy),"housingCapacity":capacity,
            "completedHouses":completed_houses}

def get_presence_summary(state):
    buildings = sum(1 for b in (state.get("buildings") or []) if b.get("owner") == "player")
    units = sum(1 for u in (state.get("units") or []) if u.get("owner") == "player")
    return {"influenceScore":buildings*25 + units*15,"openWorld":True,"borders":False}
