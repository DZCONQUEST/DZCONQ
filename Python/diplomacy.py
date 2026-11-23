def set_relation(world,a,b,status):
    if a not in world["civilizations"] or b not in world["civilizations"] or a==b:return {"ok":False,"message":"Relation invalide."}
    allowed={"neutral","friendly","allied","hostile","war"}
    if status not in allowed:return {"ok":False,"message":"Statut diplomatique invalide."}
    world["civilizations"][a]["relations"][b]=status;world["civilizations"][b]["relations"][a]=status
    return {"ok":True,"message":f"Relation mise à jour : {status}."}
