window.DZ=window.DZ||{};DZ.bridge={pyodide:null,world:null,ready:false};
DZ.bridge.init=async function(){
 const status=document.getElementById("loading-status");
 status.textContent="Chargement de Pyodide…";
 this.pyodide=await loadPyodide();
 const files=["__init__.py","main.py","world.py","players.py","cities.py","buildings.py","population.py","economy.py","resources.py","workers.py","territories.py","infrastructure.py","technologies.py","eras.py","units.py","armies.py","movement.py","combat.py","conquest.py","diplomacy.py","trade.py","events.py","save_manager.py","AI/__init__.py","AI/ai_core.py","AI/ai_decision.py","AI/ai_economy.py","AI/ai_construction.py","AI/ai_expansion.py","AI/ai_military.py","AI/ai_diplomacy.py","AI/ai_exploration.py","AI/ai_strategy.py","AI/ai_difficulty.py"];
 this.pyodide.FS.mkdirTree("/home/pyodide/Python/AI");
 for(const f of files){const r=await fetch("Python/"+f);if(!r.ok)throw new Error("Fichier Python manquant : "+f);this.pyodide.FS.writeFile("/home/pyodide/Python/"+f,await r.text());}
 this.pyodide.runPython("import sys; sys.path.insert(0, '/home/pyodide'); import Python.main as game");
 this.ready=true;status.textContent="Python opérationnel · choisissez votre point de départ.";
};
DZ.bridge.call=function(code){return this.pyodide.runPython(code)};
DZ.bridge.newGame=function(name,civ,ai){this.call(`world = game.new_game(${JSON.stringify(name)}, ${JSON.stringify(civ)}, ${Number(ai)})`);return this.snapshot()};
DZ.bridge.command=function(action,payload){this.pyodide.globals.set("_payload",payload);this.pyodide.globals.set("_action",action);return this.call("import json; _result=game.command(world,_action,_payload); json.dumps(_result)")};
DZ.bridge.tick=function(dt){this.pyodide.globals.set("_dt",dt);this.call("game.tick(world,_dt)");return this.snapshot()};
DZ.bridge.snapshot=function(){return JSON.parse(this.call("import json; json.dumps(game.snapshot(world))"))};
DZ.bridge.save=function(){return this.call("game.save(world)")};
DZ.bridge.load=function(raw){this.pyodide.globals.set("_raw_save",raw);this.call("world=game.load(_raw_save)");return this.snapshot()};
