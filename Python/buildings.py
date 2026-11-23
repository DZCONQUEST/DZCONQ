# ============================================================
# DZ CONQUEST V3.0
# BUILDINGS SYSTEM
# ============================================================


# ============================================================
# IDENTIFIANTS ET JOURNAL
# Fonctions locales pour éviter l'import circulaire
# ============================================================

def new_id(world, prefix):
    value = f"{prefix}_{world['next_id']}"
    world["next_id"] += 1
    return value


def log(world, message):
    world["events"].append({
        "time": world["time"],
        "message": message
    })

    world["events"] = world["events"][-80:]


# ============================================================
# CATALOGUE DES BÂTIMENTS
# ============================================================

CATALOG = {
    "house": {
        "name": "Maison",
        "cost": {"wood": 80},
        "duration": 8,
        "housing": 2,
        "workforce": 0
    },

    "farm": {
        "name": "Ferme",
        "cost": {"wood": 120},
        "duration": 12,
        "production": {"food": 5},
        "workforce": 1
    },

    "lumber": {
        "name": "Scierie",
        "cost": {"wood": 100},
        "duration": 10,
        "production": {"wood": 4},
        "workforce": 1
    },

    "mine": {
        "name": "Mine",
        "cost": {"wood": 140},
        "duration": 14,
        "production": {
            "iron": 2,
            "gold": 1
        },
        "workforce": 1
    },

    "palace": {
        "name": "Palais",
        "cost": {
            "gold": 1000,
            "food": 1000
        },
        "duration": 30,
        "workforce": 0
    }
}


# ============================================================
# LANCEMENT D'UNE CONSTRUCTION
# ============================================================

def start_building(world, cid, city_id, kind, x, z):

    civ = world["civilizations"].get(cid)
    city = world["cities"].get(city_id)

    if not civ or not city or city["owner_id"] != cid:
        return {
            "ok": False,
            "message": "Ville invalide."
        }

    spec = CATALOG.get(kind)

    if not spec:
        return {
            "ok": False,
            "message": "Bâtiment inconnu."
        }

    # Vérification du palais
    if kind == "palace":

        if not city["is_capital"] or any(
            world["buildings"][b]["type"] == "palace"
            for b in city["building_ids"]
            if b in world["buildings"]
        ):

            return {
                "ok": False,
                "message": "Le palais ne peut être construit que dans la capitale, une seule fois."
            }

    # Vérification des travailleurs
    if (
        civ["workers"] - civ["assigned_workers"]
        < spec.get("workforce", 0)
    ):

        return {
            "ok": False,
            "message": "Pas assez de travailleurs disponibles."
        }

    # Vérification des ressources
    for resource, cost in spec["cost"].items():

        if civ["resources"].get(resource, 0) < cost:

            return {
                "ok": False,
                "message": f"Ressources insuffisantes : {resource}."
            }

    # Déduction des ressources
    for resource, cost in spec["cost"].items():
        civ["resources"][resource] -= cost

    # Création du bâtiment
    building_id = new_id(world, "building")

    building = {
        "id": building_id,
        "type": kind,
        "name": spec["name"],
        "owner_id": cid,
        "city_id": city_id,
        "x": float(x),
        "z": float(z),
        "progress": 0,
        "duration": spec["duration"],
        "complete": False,
        "level": 1
    }

    world["buildings"][building_id] = building

    city["building_ids"].append(building_id)

    civ["assigned_workers"] += spec.get("workforce", 0)

    log(
        world,
        f"Construction lancée : {spec['name']}."
    )

    return {
        "ok": True,
        "building": building,
        "message": f"Construction de {spec['name']} lancée."
    }


# ============================================================
# MISE À JOUR DES CONSTRUCTIONS
# ============================================================

def update_construction(world, dt):

    for building in world["buildings"].values():

        if building["complete"]:
            continue

        building["progress"] = min(
            1,
            building["progress"] +
            dt / max(1, building["duration"])
        )

        if building["progress"] >= 1:

            building["complete"] = True

            civ = world["civilizations"][
                building["owner_id"]
            ]

            spec = CATALOG[building["type"]]

            if building["type"] == "house":

                housing = spec.get("housing", 0)

                civ["housing"] += housing

                city = world["cities"][
                    building["city_id"]
                ]

                city["housing"] += housing

            log(
                world,
                f"{building['name']} achevé."
            )


# ============================================================
# FIN DU BUILDINGS SYSTEM
# ============================================================
