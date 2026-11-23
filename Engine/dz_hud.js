window.DZ=window.DZ||{};DZ.hud={};
DZ.hud.render=function(s){
 const civ=s.civilizations.find(c=>c.id===s.player_id);if(!civ)return;
 for(const [key,id] of [["gold","gold"],["food","food"],["wood","wood"],["iron","iron"]])document.getElementById(id).textContent=Math.floor(civ.resources[key]||0);
 document.getElementById("population").textContent=`Population : ${civ.population} / ${civ.housing}`;
 document.getElementById("civilization").innerHTML=`<b>${civ.name}</b><br>${civ.cities.length} ville(s)<br>${civ.workers-civ.assigned_workers} travailleur(s) disponible(s)<br>${civ.army_ids.length} armée(s)`;
 document.getElementById("opponents").innerHTML=s.civilizations.filter(c=>c.kind==="ai").map(c=>`<div class="opponent"><b>${c.name}</b><br>${c.population} habitants · ${c.cities.length} ville(s)</div>`).join("");
 document.getElementById("log").innerHTML=s.events.slice().reverse().map(e=>`<div class="log-entry">${e.message}</div>`).join("");
};
