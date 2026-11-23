import time
from .economy import update_economy
from .population import update_population
from .buildings import update_construction
from .movement import update_armies
from .territories import update_territories

def create_world():
    return {"version":"3.0.0","time":0,"paused":False,"civilizations":{},"cities":{},"buildings":{},"armies":{},"territories":{},"events":[],"next_id":1,"player_id":None}

def new_id(world, prefix):
    value=f"{prefix}_{world['next_id']}"
    world["next_id"]+=1
    return value

def log(world, message):
    world["events"].append({"time":world["time"],"message":message})
    world["events"]=world["events"][-80:]

def tick_world(world, seconds=1):
    dt=max(0,min(float(seconds),10))
    if world.get("paused"): return
    world["time"]+=dt
    update_construction(world,dt)
    update_economy(world,dt)
    update_population(world,dt)
    update_armies(world,dt)
    update_territories(world)
    for civ in world["civilizations"].values():
        civ["resources"]["food"]=max(0,civ["resources"]["food"])
        for k,v in civ["resources"].items(): civ["resources"][k]=round(max(0,v),2)

def world_snapshot(world):
    return {"version":world["version"],"time":round(world["time"],1),"player_id":world["player_id"],
      "civilizations":list(world["civilizations"].values()),"cities":list(world["cities"].values()),
      "buildings":list(world["buildings"].values()),"armies":list(world["armies"].values()),
      "territories":list(world["territories"].values()),"events":world["events"][-15:]}
