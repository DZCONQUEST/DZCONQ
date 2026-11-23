def economic_priority(civ):
    civ["ai_economic_state"]="growth" if civ["resources"]["food"]>100 else "food_security"
