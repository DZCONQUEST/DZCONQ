from .buildings import CATALOG
def update_economy(world,dt):
    for civ in world["civilizations"].values():
        for key in civ["resources"]:civ["resources"][key]=civ["resources"].get(key,0)
        for b in world["buildings"].values():
            if b["owner_id"]!=civ["id"] or not b["complete"]:continue
            spec=CATALOG[b["type"]]
            for r,rate in spec.get("production",{}).items():civ["resources"][r]=civ["resources"].get(r,0)+rate*dt
        civ["resources"]["food"]-=civ["population"]*0.08*dt
