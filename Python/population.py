def update_population(world,dt):
    for civ in world["civilizations"].values():
        cap=max(2,civ.get("housing",2))
        civ["workers"]=max(civ["workers"],civ["population"])
        if civ["population"]<cap and civ["resources"]["food"]>20:
            civ["growth_clock"]=civ.get("growth_clock",0)+dt
            if civ["growth_clock"]>=90:
                civ["population"]+=1;civ["workers"]+=1;civ["growth_clock"]=0
