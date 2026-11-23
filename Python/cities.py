from .world import new_id, log
def found_city(world,cid,x,z,name=None):
    civ=world["civilizations"].get(cid)
    if not civ:return {"ok":False,"message":"Civilisation introuvable."}
    if len(civ["cities"])>=city_limit(civ):return {"ok":False,"message":"Limite de villes atteinte : améliorez le palais."}
    city_id=new_id(world,"city")
    city={"id":city_id,"name":name or ("Capitale" if not civ["capital_id"] else f"Ville {len(civ['cities'])+1}"),"owner_id":cid,
      "x":float(x),"z":float(z),"population":civ["population"] if not civ["cities"] else 0,"housing":2,"building_ids":[],"is_capital":not bool(civ["capital_id"])}
    world["cities"][city_id]=city;civ["cities"].append(city_id)
    if not civ["capital_id"]:civ["capital_id"]=city_id
    log(world,f"{civ['name']} fonde {city['name']}.")
    return {"ok":True,"city":city,"message":f"{city['name']} fondée."}
def city_limit(civ):
    palace_level=1
    return 1+max(0,palace_level-1)*2
