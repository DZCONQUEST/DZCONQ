window.DZ=window.DZ||{};DZ.controls={drag:false,lastX:0,lastY:0};
DZ.controls.init=function(){
 const el=DZ.world.renderer.domElement;
 el.addEventListener("contextmenu",e=>e.preventDefault());
 el.addEventListener("pointerdown",e=>{this.drag=true;this.lastX=e.clientX;this.lastY=e.clientY;});
 el.addEventListener("pointerup",e=>{if(e.button===0&&Math.abs(e.clientX-this.lastX)<4&&Math.abs(e.clientY-this.lastY)<4)this.click(e);this.drag=false;});
 el.addEventListener("pointermove",e=>{if(!this.drag)return;let dx=e.clientX-this.lastX,dy=e.clientY-this.lastY;this.lastX=e.clientX;this.lastY=e.clientY;if(e.buttons&2||e.buttons&1){DZ.world.camera.position.x-=dx*.7;DZ.world.camera.position.z-=dy*.7;}});
 el.addEventListener("wheel",e=>{DZ.world.camera.position.multiplyScalar(e.deltaY>0?1.08:.92);e.preventDefault();},{passive:false});
};
DZ.controls.click=function(e){
 const hit=DZ.world.pick(e);if(!hit)return;const obj=hit.object;let root=obj;while(root.parent&&root.parent!==DZ.world.scene)root=root.parent;
 if(DZ.state.started===false){const p=hit.point;DZ.startAt(p.x,p.z);return;}
 if(DZ.world.mode==="build"&&DZ.world.pendingBuilding){DZ.placeBuilding(hit.point.x,hit.point.z);return;}
 if(root.userData&&root.userData.kind){document.getElementById("inspector").textContent=(root.userData.label||root.userData.kind)+" · "+root.userData.kind;return;}
 if(hit.point){DZ.selectedPoint={x:hit.point.x,z:hit.point.z};document.getElementById("inspector").textContent=`Position : ${hit.point.x.toFixed(0)}, ${hit.point.z.toFixed(0)}`;}
};
