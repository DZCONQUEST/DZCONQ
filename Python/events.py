EVENT_TYPES=("drought","good_harvest","epidemic","fire","discovery","revolt")
def apply_event(world,event_type,cid):
    civ=world["civilizations"].get(cid)
    if not civ:return False
    if event_type=="drought":civ["resources"]["food"]*=0.7
    elif event_type=="good_harvest":civ["resources"]["food"]+=250
    elif event_type=="epidemic":civ["population"]=max(1,civ["population"]-1)
    return True
