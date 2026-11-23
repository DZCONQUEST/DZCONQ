from .ai_decision import choose_action
from .ai_economy import economic_priority
from .ai_construction import build_priority
from .ai_expansion import expansion_target
from .ai_military import military_action
from .ai_diplomacy import diplomatic_review
from .ai_exploration import explore
from .ai_strategy import strategic_goal
from .ai_difficulty import decision_interval
def run_ai(world,dt):
    from ..cities import found_city
    from ..buildings import start_building
    from ..units import recruit_unit
    for civ in list(world["civilizations"].values()):
        if civ["kind"]!="ai":continue
        civ["ai_cooldown"]=civ.get("ai_cooldown",0)+dt
        if civ["ai_cooldown"]<decision_interval(civ):continue
        civ["ai_cooldown"]=0
        action=choose_action(world,civ)
        if action=="city":
            p=expansion_target(world,civ);found_city(world,civ["id"],p["x"],p["z"])
        elif action=="build":
            if not civ["cities"]:
                p=civ["position"];found_city(world,civ["id"],p["x"],p["z"])
            else:
                city=world["cities"][civ["cities"][0]]
                kind=build_priority(civ)
                start_building(world,civ["id"],city["id"],kind,city["x"]+15,city["z"]+12)
        elif action=="army":
            recruit_unit(world,civ["id"],"soldier",1)
        economic_priority(civ);military_action(world,civ);diplomatic_review(world,civ);explore(world,civ);strategic_goal(civ)
