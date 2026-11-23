window.DZ=window.DZ||{};DZ.state={started:false,paused:false,selectedPoint:null,lastSnapshot:null,playerCity:null};
DZ.init=async function(){DZ.world.init();try{await DZ.bridge.init();}catch(e){document.getElementById("loading-status").textContent="Erreur Python : "+e.message;console.error(e);return;}DZ.controls.init();this.bindUI();};
DZ.bindUI=function(){
 document.getElementById("start-game").onclick=()=>{DZ.bridge.newGame(document.getElementById("player-name").value,document.getElementById("civ-name").value,document.getElementById("ai-count").value);document.getElementById("loading-status").textContent="Cliquez sur le terrain pour choisir votre point de départ.";};
 document.getElementById("pause").onclick=()=>{DZ.state.paused=!DZ.state.paused;DZ.bridge.call(`world['paused']=${DZ.state.paused?"True":"False"}`);};
 document.getElementById("save").onclick=()=>{localStorage.setItem("dz_conquest_v3_save",DZ.bridge.save());DZ.toast("Partie sauvegardée.");};
 document.getElementById("load").onclick=()=>{let raw=localStorage.getItem("dz_conquest_v3_save");if(raw){DZ.bridge.load(raw);DZ.refresh();DZ.toast("Partie chargée.");}};
 document.getElementById("recruit").onclick=()=>{let r=DZ.bridge.command("recruit",{unit_type:"soldier",count:1});DZ.toast(r.message);DZ.refresh();};
 document.getElementById("found-city").onclick=()=>{let p=DZ.selectedPoint||{x:150,z:100};let r=DZ.bridge.command("found_city",{x:p.x,z:p.z,name:"Nouvelle ville"});DZ.toast(r.message);DZ.refresh();};
 const defs=window.DZ_DATA.buildings;document.getElementById("buildings").innerHTML=Object.entries(defs).map(([k,v])=>`<button data-building="${k}">${v.name}</button>`).join("");
 document.querySelectorAll("[data-building]").forEach(b=>b.onclick=()=>{DZ.world.mode="build";DZ.world.pendingBuilding=b.dataset.building;DZ.toast("Cliquez sur le terrain pour placer : "+defs[b.dataset.building].name);});
};
DZ.startAt=function(x,z){
 if(!DZ.bridge.ready)return;let s=DZ.bridge.snapshot(),c=s.civilizations.find(c=>c.id===s.player_id);
 let r=DZ.bridge.command("found_city",{x,z,name:"Capitale"});if(!r.ok){DZ.toast(r.message);return;}
 DZ.state.started=true;DZ.state.playerCity=r.city.id;DZ.world.addUnit("player",x-5,z,"Homme");DZ.world.addUnit("player",x+5,z+4,"Femme");
 document.getElementById("start-overlay").style.display="none";DZ.refresh();DZ.toast("Votre civilisation est fondée. Deux personnages vous représentent.");
};
DZ.placeBuilding=function(x,z){
 const s=DZ.bridge.snapshot(),c=s.civilizations.find(c=>c.id===s.player_id);let city=s.cities.find(v=>v.id===DZ.state.playerCity);
 if(!city){DZ.toast("Aucune ville active.");return;}
 let kind=DZ.world.pendingBuilding;let r=DZ.bridge.command("build",{city_id:city.id,building_type:kind,x,z});DZ.toast(r.message);DZ.world.pendingBuilding=null;DZ.world.mode="inspect";DZ.refresh();
};
DZ.refresh=function(){let s=DZ.bridge.snapshot();DZ.state.lastSnapshot=s;DZ.world.sync(s);DZ.hud.render(s);};
DZ.toast=function(t){let el=document.getElementById("inspector");el.textContent=t;};
DZ.loop=function(){if(DZ.state.started&&!DZ.state.paused){DZ.bridge.tick(1);DZ.refresh();}setTimeout(()=>DZ.loop(),1000);};
window.addEventListener("load",async()=>{await DZ.init();DZ.loop();});
