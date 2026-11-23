from .world import create_world, tick_world, world_snapshot
from .players import create_civilization
from .cities import found_city
from .buildings import start_building
from .units import recruit_unit
from .armies import create_army
from .movement import move_army
from .combat import resolve_combat
from .diplomacy import set_relation
from .save_manager import serialize_world, restore_world
from .AI.ai_core import run_ai


# =====================================================
# NOUVELLE PARTIE
# =====================================================

def new_game(
    player_name="Joueur",
    civilization_name="Nouvelle civilisation",
    ai_count=2
):
    world = create_world()

    player = create_civilization(
        world,
        player_name,
        civilization_name,
        "player",
        0
    )

    world["player_id"] = player["id"]

    profiles = [
        "builder",
        "expansionist",
        "militarist",
        "balanced",
        "trader"
    ]

    ai_count = max(0, min(5, int(ai_count)))

    for i in range(ai_count):
        rival = create_civilization(
            world,
            f"Adversaire {i + 1}",
            f"Civilisation {i + 1}",
            "ai",
            i + 1
        )

        rival["ai_profile"] = profiles[i]

    return world


# =====================================================
# GESTION DES COMMANDES
# =====================================================

def command(world, action, payload=None):

    payload = payload or {}

    if not isinstance(payload, dict):
        return {
            "ok": False,
            "message": "Données de commande invalides."
        }

    try:

        # ---------------------------------------------
        # FONDER UNE VILLE
        # ---------------------------------------------

        if action == "found_city":

            return found_city(
                world,
                payload.get("civilization_id", world["player_id"]),
                payload.get("x", 0),
                payload.get("z", 0),
                payload.get("name")
            )

        # ---------------------------------------------
        # CONSTRUIRE UN BÂTIMENT
        # ---------------------------------------------

        if action == "build":

            return start_building(
                world,
                payload.get("civilization_id", world["player_id"]),
                payload.get("city_id"),
                payload.get("building_type"),
                payload.get("x", 0),
                payload.get("z", 0)
            )

        # ---------------------------------------------
        # RECRUTER DES UNITÉS
        # ---------------------------------------------

        if action == "recruit":

            return recruit_unit(
                world,
                payload.get("civilization_id", world["player_id"]),
                payload.get("unit_type", "soldier"),
                payload.get("count", 1)
            )

        # ---------------------------------------------
        # CRÉER UNE ARMÉE
        # ---------------------------------------------

        if action == "create_army":

            return create_army(
                world,
                payload.get("civilization_id", world["player_id"]),
                payload.get("unit_ids", []),
                payload.get("name")
            )

        # ---------------------------------------------
        # DÉPLACER UNE ARMÉE
        # ---------------------------------------------

        if action == "move_army":

            return move_army(
                world,
                payload.get("army_id"),
                payload.get("x", 0),
                payload.get("z", 0)
            )

        # ---------------------------------------------
        # COMBAT
        # ---------------------------------------------

        if action == "attack":

            return resolve_combat(
                world,
                payload.get("attacker_army_id"),
                payload.get("defender_army_id")
            )

        # ---------------------------------------------
        # DIPLOMATIE
        # ---------------------------------------------

        if action == "relation":

            return set_relation(
                world,
                payload.get("a"),
                payload.get("b"),
                payload.get("status", "neutral")
            )

        return {
            "ok": False,
            "message": f"Commande inconnue : {action}"
        }

    except Exception as error:

        return {
            "ok": False,
            "message": f"Erreur de commande : {str(error)}"
        }


# =====================================================
# MISE À JOUR DU MONDE
# =====================================================

def tick(world, seconds=1):

    tick_world(world, seconds)

    run_ai(world, seconds)

    return world_snapshot(world)


# =====================================================
# ÉTAT DU MONDE
# =====================================================

def snapshot(world):

    return world_snapshot(world)


# =====================================================
# SAUVEGARDE
# =====================================================

def save(world):

    return serialize_world(world)


# =====================================================
# CHARGEMENT
# =====================================================

def load(raw):

    return restore_world(raw)
