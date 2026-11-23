def expansion_target(world,civ):
    n=len(civ["cities"])
    return {"x":civ["position"]["x"]+180+n*40,"z":civ["position"]["z"]+120+n*30}
