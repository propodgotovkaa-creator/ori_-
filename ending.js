const clamp=n=>Math.max(0,Math.min(1,n));
const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
export const ENDING_DURATION=15500;
export function endingFrame(ms,reduced=false,count=11){
 const t=Math.max(0,ms)/1000;
 const light=ease((t-4)/6);
 return {light,walk:ease((t-10)/2.5),farewell:ease((t-12.3)/.8),done:ms>=ENDING_DURATION,
 crystals:Array.from({length:count},(_,i)=>{
  const a=i*Math.PI*2/count+t*(reduced?.08:.34),f=ease((t-4-i*.36)/1.75),appear=ease((t-1-i*.09)/.7);
  const x=39+Math.cos(a)*19,y=49+Math.sin(a)*19;
  return {x:x+(73-x)*f,y:y+(67-y)*f,opacity:appear*(1-ease((f-.75)/.25)),scale:appear*(1-f*.7),angle:reduced?0:Math.sin(a)*13};
 }),fireflies:Array.from({length:9},(_,i)=>{const q=ease((t-8-i*.18)/2.6),a=t*(reduced?.12:.55)+i*2.4;return{x:73+q*(-22+Math.cos(a)*24),y:66+q*(-19+Math.sin(a*.83)*18),opacity:q*(.65+.25*Math.sin(t*1.7+i)),angle:Math.sin(a)*12};})};
}
export class Homecoming{
 constructor(root,{reduced=false,onComplete=()=>{}}={}){this.root=root;this.reduced=reduced;this.onComplete=onComplete;this.elapsed=0;this.completed=false;
 this.crystals=[...root.querySelectorAll('.home-crystal')];this.flies=[...root.querySelectorAll('.home-firefly')];}
 start(count=11){this.count=count;this.elapsed=0;this.completed=false;this.root.hidden=false;this.render();}
 tick(ms){if(document.hidden)return;this.elapsed+=Math.min(ms,50);this.render();}
 render(){const f=endingFrame(this.elapsed,this.reduced,this.count);this.root.style.setProperty('--home-light',f.light);this.root.style.setProperty('--home-arrive',Math.min(1,this.elapsed/1100));
 this.crystals.forEach((el,i)=>{const c=f.crystals[i];el.hidden=!c;if(!c)return;el.style.left=c.x+'%';el.style.top=c.y+'%';el.style.opacity=c.opacity;el.style.transform=`translate(-50%,-50%) scale(${c.scale}) rotate(${c.angle}deg)`;});
 this.flies.forEach((el,i)=>{const c=f.fireflies[i];el.style.left=c.x+'%';el.style.top=c.y+'%';el.style.opacity=c.opacity;el.style.transform=`translate(-50%,-50%) rotate(${c.angle}deg)`;});
 const hero=this.root.querySelector('.home-hero');hero.style.left=(31+f.walk*31)+'%';hero.style.opacity=1-f.farewell;hero.style.backgroundPositionX=(Math.floor(this.elapsed/120)%4)*100/3+'%';hero.classList.toggle('walking',f.walk>0&&f.walk<1);
 const wave=this.root.querySelector('.home-farewell');wave.style.opacity=f.farewell;wave.style.transform=`translate(-50%,-100%) rotate(${this.reduced?0:Math.sin(this.elapsed*.0025)*1.5}deg)`;
 if(f.done&&!this.completed){this.completed=true;this.onComplete();}
 }
}
