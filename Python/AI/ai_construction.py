def build_priority(civ):
    if civ["resources"]["food"]<500:return "farm"
    if civ["resources"]["wood"]<250:return "lumber"
    return "house"
