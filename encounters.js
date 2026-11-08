import {groundAt} from './scenery.js';
export const SPIDER_POSITIONS=[680,1900,3130,4380,5540,5850];
export function touches(body,x,y,halfWidth=13,halfHeight=21){return body.right>=x-halfWidth&&body.left<=x+halfWidth&&body.bottom>=y-halfHeight&&body.top<=y+halfHeight;}
const clamp=n=>Math.max(0,Math.min(1,n));
const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
export class Spiders {
 constructor(scene,cleared,onCatch,onReady,onFree){this.scene=scene;this.onCatch=onCatch;this.onReady=onReady;this.onFree=onFree;this.clock=0;this.active=null;
  const t=scene.textures.get('spider'),s=t.getSourceImage();for(let i=0;i<4;i++)if(!t.has(String(i)))t.add(String(i),0,(i%2)*s.width/2,Math.floor(i/2)*s.height/2,s.width/2,s.height/2);
  this.web=scene.add.graphics().setDepth(6);this.silk=scene.add.graphics().setDepth(7);
  this.items=SPIDER_POSITIONS.map((x,id)=>({id,x,y:-100,phase:cleared.includes(id)?'gone':'waiting',t:0,frame:0,blend:1,previous:scene.add.image(x,-100,'spider','0').setDisplaySize(112,112).setDepth(8).setAlpha(0),art:scene.add.image(x,-100,'spider','0').setDisplaySize(112,112).setDepth(8)}));
  this.cocoon=scene.add.image(0,0,'cocoon').setDisplaySize(91,137).setDepth(7).setAlpha(0);
 }
 release(){if(this.active?.phase!=='cocoon')return;this.active.releaseX=this.active.art.x;this.active.releaseY=this.active.art.y;this.active.phase='release';this.active.t=0;}
 update(dt,body){this.clock+=dt;this.web.clear();this.silk.clear();
  for(const p of this.items){p.t+=dt;
   if(p.phase==='waiting'&&Math.abs(body.center.x-p.x)<230){p.phase='descend';p.t=0;}
   if(p.phase==='descend'){p.y=-70+(groundAt(p.x)+38)*ease(p.t/1.6);if(p.t>=1.6){p.phase='hang';p.t=0;}}
   if(p.phase==='hang')p.y=groundAt(p.x)-32+Math.sin(p.t*1.6)*4;
   let x=p.x+Math.sin(this.clock*1.3+p.id)*5;
   if(p.phase==='wrap'||p.phase==='cocoon'||p.phase==='release'){
    const h=this.scene.player;const cx=h.x,cy=h.body.bottom-36;
    if(p.phase==='wrap'){
     const progress=clamp(p.t/2.8),settle=ease(p.t/.65),weave=Math.sin(p.t*4.2)*(1-ease((progress-.8)/.2));
     x=p.catchX+(cx+12+weave*6-p.catchX)*settle;p.y=p.catchY+(cy-61+Math.cos(p.t*4.2)*3*(1-progress)-p.catchY)*settle;
     this.cocoon.setPosition(cx,cy-9).setAlpha(progress*.92);
     this.scene.hero.setAlpha(1-progress*.62);
     this.silk.lineStyle(1.3,0xf0ffff,.8);this.silk.beginPath();
     for(let j=0;j<progress*240;j++){const a=j*.23,wx=cx+Math.cos(a)*37,wy=cy+29-j*.27+Math.sin(a)*8;if(j===0)this.silk.moveTo(wx,wy);else this.silk.lineTo(wx,wy);}this.silk.strokePath();
     // The working strand leaves the front feet and joins the newest wrap.
     const a=progress*240*.23,tipX=cx+Math.cos(a)*37,tipY=cy+29-progress*240*.27+Math.sin(a)*8;
     this.silk.lineBetween(x-8,p.y+32,tipX,tipY);
     this.silk.lineBetween(x+10,p.y+30,cx+21,cy-28);
     this.cocoon.setRotation(weave*.014);
     if(progress===1){p.phase='cocoon';p.t=0;this.onReady(p.id);}
    }else if(p.phase==='cocoon'){const sway=Math.sin(p.t*1.4);x=cx+12+sway*2;p.y=cy-61+sway*2;this.cocoon.setRotation(sway*.025);this.silk.lineStyle(1.2,0xf0ffff,.8);this.silk.lineBetween(x-8,p.y+32,cx-10,cy-24);this.silk.lineBetween(x+10,p.y+30,cx+21,cy-28);}
    else {const q=ease(p.t/1.7);x=p.releaseX+(cx+12-p.releaseX)*q;p.y=p.releaseY-(p.releaseY+120)*q;this.silk.lineStyle(1.1,0xf0ffff,(1-q)*.7);this.silk.lineBetween(x,p.y+32,cx,cy-30);this.cocoon.setAlpha((1-q)*.92).setRotation(q*.24);this.cocoon.setDisplaySize(91+q*45,137+q*22);this.scene.hero.setAlpha(.38+q*.62);if(p.t>1.7){p.phase='gone';this.active=null;this.cocoon.setAlpha(0).setRotation(0).setDisplaySize(91,137);this.onFree(p.id);}}
   }
   const frame=p.phase==='wrap'?2:p.phase==='cocoon'?3:0;
   if(frame!==p.frame){p.previous.setFrame(String(p.frame));p.frame=frame;p.art.setFrame(String(frame));p.blend=0;}
   p.blend=Math.min(1,p.blend+dt/.22);
   const rotation=Math.sin(this.clock*1.3+p.id)*.035,height=112+Math.sin(this.clock*1.6)*.65;
   for(const sprite of [p.art,p.previous])sprite.setPosition(x,p.y).setRotation(rotation).setDisplaySize(112,height).setVisible(p.phase!=='gone'&&p.phase!=='waiting');
   p.art.setAlpha(p.blend);p.previous.setAlpha(1-p.blend);
   if(p.art.visible){this.web.lineStyle(1.2,0xf0ffff,.72);this.web.beginPath();this.web.moveTo(p.x,-10);this.web.lineTo(x,p.y-32);this.web.strokePath();}
   if(!this.active&&(p.phase==='descend'||p.phase==='hang')&&touches(body,x,p.y,26,30)){
    this.active=p;p.catchX=x;p.catchY=p.y;p.phase='wrap';p.t=0;this.onCatch();break;
   }
  }
 }
}
