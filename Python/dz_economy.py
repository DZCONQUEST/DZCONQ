"""Règles économiques pures de DZ CONQUEST (sans accès au DOM ou à Three.js)."""

def get_tech_modifiers(state, catalog):
    mods = {"foodMult":1,"woodMult":1,"ironMult":1,"goldMult":1,"stoneMult":1,
            "speedMult":1,"attackBonus":0,"defenseBonus":0,"storehouseBonus":0}
    unlocked = state.get("unlockedTechnologies") or []
    for tech in catalog or []:
        if tech.get("id") not in unlocked or not tech.get("effects"):
            continue
        for key, value in tech["effects"].items():
            if key not in mods or not value:
                continue
            if key.endswith("Mult"):
                mods[key] *= value
            else:
                mods[key] += value
    return mods
