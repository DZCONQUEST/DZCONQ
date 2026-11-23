from .world import log
def resolve_combat(world,attacker_army_id,defender_army_id):
    a=world["armies"].get(attacker_army_id);d=world["armies"].get(defender_army_id)
    if not a or not d or a["owner_id"]==d["owner_id"]:return {"ok":False,"message":"Combat invalide."}
    ap=a["attack"];dp=d["attack"];a["health"]-=max(5,dp-a["defense"]*.25);d["health"]-=max(5,ap-d["defense"]*.25)
    winner=a if a["health"]>d["health"] else d
    if a["health"]<=0:world["armies"].pop(a["id"],None)
    if d["health"]<=0:world["armies"].pop(d["id"],None)
    log(world,"Combat résolu : "+("victoire de l'attaquant." if winner is a else "victoire du défenseur."))
    return {"ok":True,"message":"Combat résolu."}
