import {crystalsFor,groundAt,PANEL_STEP} from './scenery.js';
import {random} from './core.js?v=10';
export function crystalPlan(saved={},count=11,seed){
 const rng=seed===undefined?null:random(seed),placed=[];
 return Array.from({length:5},(_,i)=>crystalsFor(i)).flat().slice(0,count).map(c=>{
  let x=c.x;
  if(rng){const panel=Math.floor(c.x/PANEL_STEP),lo=c.id===0?260:Math.max(panel*PANEL_STEP+170,c.x-300),hi=c.id===0?850:Math.min(panel*PANEL_STEP+PANEL_STEP-170,c.x+300);
   const candidates=[];for(let v=lo;v<=hi;v+=10)if(Math.abs(groundAt(v-35)-groundAt(v+35))<28&&!placed.some(p=>Math.abs(p-v)<200))candidates.push(v);
   if(candidates.length)x=candidates[Math.floor(rng()*candidates.length)];
  }
  const restored=saved?.[c.id];if(Number.isFinite(restored)&&restored>=220&&restored<1e8)x=restored;
  placed.push(x);return {...c,x,y:groundAt(x)-(c.id%2?145:51)};
 });
}
export function recycleCrystals(plan,collected,playerX,cameraX){const moved=[];for(const c of plan){if(collected.includes(c.id)||c.x>=cameraX-90)continue;let x=Math.max(playerX+1050,cameraX+1400);for(let tries=0;tries<100;tries++,x+=110){const local=x%PANEL_STEP;const flat=Math.abs(groundAt(x-30)-groundAt(x+30))<30;if(local>160&&local<PANEL_STEP-180&&flat&&!plan.some(o=>o!==c&&!collected.includes(o.id)&&Math.abs(o.x-x)<200))break;}c.x=x;c.y=groundAt(x)-(c.id%2?145:51);moved.push(c);}return moved;}

export function nextLayoutSeed(previousSeed,count=11){
 const previous=crystalPlan({},count,previousSeed)[0].x;
 let seed=Math.floor(Math.random()*0xffffffff);
 for(let i=0;i<10000;i++,seed=(seed+1)>>>0)if(Math.abs(crystalPlan({},count,seed)[0].x-previous)>=200)return seed;
 return seed;
}
