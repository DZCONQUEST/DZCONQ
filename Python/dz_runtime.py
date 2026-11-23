"""Point d'entrée JSON appelé par le pont JavaScript/Pyodide."""
import json
from dz_economy import get_tech_modifiers
from dz_military import compute_army_speed
from dz_world import get_population_summary, get_presence_summary

def dz_dispatch(module, action, payload_json):
    p = json.loads(payload_json or "{}")
    if module == "economy" and action == "get_tech_modifiers":
        result = get_tech_modifiers(p.get("state", {}), p.get("catalog", []))
    elif module == "military" and action == "compute_army_speed":
        result = compute_army_speed(p.get("units", []))
    elif module == "world" and action == "get_population_summary":
        result = get_population_summary(p.get("state", {}), p.get("populationConfig", {}))
    elif module == "world" and action == "get_presence_summary":
        result = get_presence_summary(p.get("state", {}))
    else:
        raise ValueError("Fonction Python inconnue: %s.%s" % (module, action))
    return json.dumps(result)
