from .world import new_id, log
def create_civilization(world, player_name, name, kind="player", seed=0):
    cid=new_id(world,"civ")
    civ={"id":cid,"player_name":player_name,"name":name,"kind":kind,"resources":{"gold":1000,"food":1000,"wood":1000,"iron":1000},
      "population":2 if kind=="player" else 4,"workers":2 if kind=="player" else 3,"assigned_workers":0,
      "cities":[],"army_ids":[],"technologies":[],"era_index":0,"relations":{},"capital_id":None,
      "position":{"x":(seed*190)-190,"z":(seed%2)*150-75},"housing":2,"ai_profile":"balanced","ai_cooldown":0}
    world["civilizations"][cid]=civ
    log(world,f"{name} entre dans le monde.")
    return civ
