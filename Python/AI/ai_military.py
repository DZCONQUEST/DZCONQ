def military_action(world,civ):
    civ["military_posture"]="defensive" if len(civ["army_ids"])<2 else "balanced"
