def choose_action(world,civ):
    if not civ["cities"]:return "city"
    if civ["population"]>=4 and len(civ["cities"])<2 and civ["resources"]["food"]>300:return "city"
    if len(civ["army_ids"])==0 and civ["resources"]["gold"]>150:return "army"
    return "build"
