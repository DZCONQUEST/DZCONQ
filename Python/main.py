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

def new_game(player_name="Joueur", civilization_name="Nouvelle civilisation", ai_count=2):
    world = create_world()
    player = create_civilization(world, player_name, civilization_name, "player", 0)
    world["player_id"] = player["id"]
    for i in range(max(0, min(5, int(ai_count)))):
        rival = create_civilization(world, f"Adversaire {i+1}", f"Civilisation {i+1}", "ai", i+1)
        rival["ai_profile"] = ["builder","expansionist","militarist","balanced","trader"][i % 5]
    return world

def command(world, action, payload=None):
    payload = payload or {}
    if action == "found_city":
        return found_city(world, payload.get("civilization_id", world["player_id"]), payload.get("x",0), payload.get("z",0), payload.get("name"))
    if action == "build":
        return start_building(world, payload.get("civilization_id",world["player_id"]), payload.get("city_id"), payload.get("building_type"), payload.get("x",0), payload.get("z",0))
    if action == "recruit":
        return recruit_unit(world, payload.get("civilization_id",world["player_id"]), payload.get("unit_type","soldier"), payload.get("count",1))
    if action == "move_army":
        return move_army(world, payload.get("army_id"), payload.get("x",0), payload.get("z",0))
    if action == "attack":
        return resolve_combat(world, payload.get("attacker_army_id"), payload.get("defender_army_id"))
    if action == "relation":
        return set_relation(world, payload.get("a"), payload.get("b"), payload.get("status","neutral"))
    return {"ok":False,"message":"Commande inconnue."}

def tick(world, seconds=1):
    tick_world(world, seconds)
    run_ai(world, seconds)
    return world_snapshot(world)

def snapshot(world):
    return world_snapshot(world)

def save(world):
    return serialize_world(world)

def load(raw):
    return restore_world(raw)
