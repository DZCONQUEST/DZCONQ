# ============================================================
# DZ CONQUEST V3.0
# BUILDINGS SYSTEM
# ============================================================


# ============================================================
# IDENTIFIANTS ET JOURNAL
# Fonctions locales : aucune dépendance envers world.py
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

    if civ is None or city is None:
        return {
            "ok": False,
            "message": "Ville ou civilisation introuvable."
        }

    if city.get("owner_id") != cid:
        return {
            "ok": False,
            "message": "Cette ville ne vous appartient pas."
        }

    spec = CATALOG.get(kind)

    if spec is None:
        return {
            "ok": False,
            "message": "Bâtiment inconnu."
        }

    # --------------------------------------------------------
    # Vérification du palais
    # Le palais est autorisé uniquement dans la capitale.
    # Un seul palais par civilisation.
    # --------------------------------------------------------

    if kind == "palace":

        if not city.get("is_capital", False):
            return {
                "ok": False,
                "message": "Le palais doit être construit dans la capitale."
            }

        existing_palace = any(
            building.get("type") == "palace"
            and building.get("owner_id") == cid
            for building in world["buildings"].values()
        )

        if existing_palace:
            return {
                "ok": False,
                "message": "Votre civilisation possède déjà un palais."
            }

    # --------------------------------------------------------
    # Vérification des travailleurs
    # --------------------------------------------------------

    required_workers = spec.get("workforce", 0)

    available_workers = (
        civ.get("workers", 0)
        - civ.get("assigned_workers", 0)
    )

    if available_workers < required_workers:
        return {
            "ok": False,
            "message": "Pas assez de travailleurs disponibles."
        }

    # --------------------------------------------------------
    # Vérification des ressources
    # --------------------------------------------------------

    resources = civ.get("resources", {})

    for resource, cost in spec["cost"].items():

        if resources.get(resource, 0) < cost:
            return {
                "ok": False,
                "message": f"Ressources insuffisantes : {resource}."
            }

    # --------------------------------------------------------
    # Validation des coordonnées
    # --------------------------------------------------------

    try:
        x = float(x)
        z = float(z)
    except (TypeError, ValueError):
        return {
            "ok": False,
            "message": "Coordonnées de construction invalides."
        }

    # --------------------------------------------------------
    # Déduction des ressources
    # --------------------------------------------------------

    for resource, cost in spec["cost"].items():
        resources[resource] -= cost

    # --------------------------------------------------------
    # Création du bâtiment
    # --------------------------------------------------------

    building_id = new_id(world, "building")

    building = {
        "id": building_id,
        "type": kind,
        "name": spec["name"],
        "owner_id": cid,
        "city_id": city_id,
        "x": x,
        "z": z,
        "progress": 0.0,
        "duration": spec["duration"],
        "complete": False,
        "level": 1
    }

    world["buildings"][building_id] = building

    city.setdefault("building_ids", []).append(building_id)

    civ["assigned_workers"] = (
        civ.get("assigned_workers", 0) + required_workers
    )

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

    dt = max(0.0, float(dt))

    for building in list(world["buildings"].values()):

        if building.get("complete", False):
            continue

        duration = max(1, building.get("duration", 1))

        building["progress"] = min(
            1.0,
            building.get("progress", 0.0) + dt / duration
        )

        # ----------------------------------------------------
        # Construction terminée
        # ----------------------------------------------------

        if building["progress"] >= 1.0:

            building["progress"] = 1.0
            building["complete"] = True

            civ = world["civilizations"].get(
                building["owner_id"]
            )

            if civ is None:
                continue

            spec = CATALOG.get(building["type"], {})

            # ------------------------------------------------
            # Augmentation de la capacité de logement
            # ------------------------------------------------

            if building["type"] == "house":

                housing = spec.get("housing", 0)

                civ["housing"] = (
                    civ.get("housing", 0) + housing
                )

                city = world["cities"].get(
                    building["city_id"]
                )

                if city is not None:
                    city["housing"] = (
                        city.get("housing", 0) + housing
                    )

            log(
                world,
                f"{building['name']} achevé."
            )


# ============================================================
# FIN DU BUILDINGS SYSTEM
# ============================================================
