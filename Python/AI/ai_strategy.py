def strategic_goal(civ):
    civ["strategic_goal"]="develop_economy" if civ["population"]<10 else "expand_influence"
