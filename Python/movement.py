import math
def army_speed(army):
    total=sum(army["units"].values())
    if not total:return 0
    from .units import UNIT_CATALOG
    return sum(UNIT_CATALOG[k]["speed"]*n for k,n in army["units"].items())/total
def move_army(world,army_id,x,z):
    army=world["armies"].get(army_id)
    if not army:return {"ok":False,"message":"Armée introuvable."}
    army["target"]={"x":float(x),"z":float(z)}
    return {"ok":True,"message":"Ordre de déplacement transmis."}
def update_armies(world,dt):
    for army in world["armies"].values():
        target=army.get("target")
        if not target:continue
        dx=target["x"]-army["x"];dz=target["z"]-army["z"];dist=math.hypot(dx,dz)
        step=army_speed(army)*dt*0.35
        if dist<=step:army["x"],army["z"],army["target"]=target["x"],target["z"],None
        elif dist:army["x"]+=dx/dist*step;army["z"]+=dz/dist*step
