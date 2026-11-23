def decision_interval(civ):
    return {"easy":8.0,"normal":5.0,"hard":3.0,"expert":2.0}.get(civ.get("difficulty","normal"),5.0)
