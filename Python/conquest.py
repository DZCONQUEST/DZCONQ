def transfer_control(world,territory_id,new_owner_id):
    t=world["territories"].get(territory_id)
    if not t or new_owner_id not in world["civilizations"]:return False
    t["owner_id"]=new_owner_id
    return True
