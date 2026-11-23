def create_army(world,cid,units):
    from .units import recruit_unit
    result=None
    for kind,count in units.items():
        for _ in range(count):result=recruit_unit(world,cid,kind,1)
    return result
