from .world import new_id, log
UNIT_CATALOG={"soldier":{"attack":10,"defense":5,"health":100,"speed":25,"cost":{"gold":100,"food":50}},"tank":{"attack":25,"defense":18,"health":240,"speed":12,"cost":{"gold":350,"iron":100}}}
def recruit_unit(world,cid,unit_type="soldier",count=1):
    civ=world["civilizations"].get(cid);spec=UNIT_CATALOG.get(unit_type);count=max(1,int(count))
    if not civ or not spec:return {"ok":False,"message":"Recrutement impossible."}
    for r,v in spec["cost"].items():
        if civ["resources"].get(r,0)<v*count:return {"ok":False,"message":f"Ressources insuffisantes : {r}."}
    for r,v in spec["cost"].items():civ["resources"][r]-=v*count
    army_id=new_id(world,"army")
    army={"id":army_id,"owner_id":cid,"x":civ["position"]["x"],"z":civ["position"]["z"],"units":{unit_type:count},"health":spec["health"]*count,"target":None,"attack":spec["attack"]*count,"defense":spec["defense"]*count}
    world["armies"][army_id]=army;civ["army_ids"].append(army_id)
    log(world,f"{count} {unit_type}(s) recruté(s).")
    return {"ok":True,"army":army,"message":"Unité(s) recrutée(s)."}
