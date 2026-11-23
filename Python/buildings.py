from .world import new_id, log
CATALOG={
 "house":{"name":"Maison","cost":{"wood":80},"duration":8,"housing":2,"workforce":0},
 "farm":{"name":"Ferme","cost":{"wood":120},"duration":12,"production":{"food":5},"workforce":1},
 "lumber":{"name":"Scierie","cost":{"wood":100},"duration":10,"production":{"wood":4},"workforce":1},
 "mine":{"name":"Mine","cost":{"wood":140},"duration":14,"production":{"iron":2,"gold":1},"workforce":1},
 "palace":{"name":"Palais","cost":{"gold":1000,"food":1000},"duration":30,"workforce":0}}
def start_building(world,cid,city_id,kind,x,z):
    civ=world["civilizations"].get(cid);city=world["cities"].get(city_id)
    if not civ or not city or city["owner_id"]!=cid:return {"ok":False,"message":"Ville invalide."}
    spec=CATALOG.get(kind)
    if not spec:return {"ok":False,"message":"Bâtiment inconnu."}
    if kind=="palace" and (not city["is_capital"] or any(world["buildings"][b]["type"]=="palace" for b in city["building_ids"] if b in world["buildings"])):
        return {"ok":False,"message":"Le palais ne peut être construit que dans la capitale, une seule fois."}
    if civ["workers"]-civ["assigned_workers"]<spec.get("workforce",0):return {"ok":False,"message":"Pas assez de travailleurs disponibles."}
    for r,cost in spec["cost"].items():
        if civ["resources"].get(r,0)<cost:return {"ok":False,"message":f"Ressources insuffisantes : {r}."}
    for r,cost in spec["cost"].items():civ["resources"][r]-=cost
    bid=new_id(world,"building")
    b={"id":bid,"type":kind,"name":spec["name"],"owner_id":cid,"city_id":city_id,"x":float(x),"z":float(z),"progress":0,"duration":spec["duration"],"complete":False,"level":1}
    world["buildings"][bid]=b;city["building_ids"].append(bid);civ["assigned_workers"]+=spec.get("workforce",0)
    log(world,f"Construction lancée : {spec['name']}.")
    return {"ok":True,"building":b,"message":f"Construction de {spec['name']} lancée."}
def update_construction(world,dt):
    for b in world["buildings"].values():
        if b["complete"]:continue
        b["progress"]=min(1,b["progress"]+dt/max(1,b["duration"]))
        if b["progress"]>=1:
            b["complete"]=True
            civ=world["civilizations"][b["owner_id"]]
            spec=CATALOG[b["type"]]
            if b["type"]=="house":civ["housing"]+=spec.get("housing",0)
            if b["type"]=="house":
                city=world["cities"][b["city_id"]];city["housing"]+=spec.get("housing",0)
            log(world,f"{b['name']} achevé.")
