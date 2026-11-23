def assign_workers(civ,count):
    count=max(0,int(count))
    if count>civ["workers"]-civ["assigned_workers"]:return False
    civ["assigned_workers"]+=count
    return True
