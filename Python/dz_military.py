"""Calculs militaires indépendants du rendu 3D."""

def compute_army_speed(army_units):
    if not army_units:
        return 0
    return sum((unit.get("speed") or 0) for unit in army_units) / len(army_units)
