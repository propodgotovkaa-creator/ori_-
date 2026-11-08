import {SETS} from './vocabulary.js?v=r1';
export const WORDS = SETS.initial.words;
export const RULES = Object.freeze({width:1280,height:720,chunk:960,ground:600,speed:285,gravity:1100,jump:620,coyote:115,buffer:140,reach:104});
export function random(seed) { let a=seed>>>0; return () => {a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}; }
export function newSession(seed = Math.floor(Math.random()*0xffffffff),position='initial') {
  if(!Object.hasOwn(SETS,position))position='initial';
  const rng=random(seed),deck=[...SETS[position].words];for(let i=deck.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
  return {version:1,position,seed,deck,collected:[],pending:null,x:140,y:560,finished:false};
}
export function validSession(s) {
  const position=s?.position??'initial';const set=Object.hasOwn(SETS,position)?SETS[position]:null;
  return !!s && !!set && s.version===1 && Number.isInteger(s.seed) && Array.isArray(s.deck) && s.deck.length===set.words.length && new Set(s.deck).size===set.words.length && s.deck.every(w=>set.words.includes(w)) && Array.isArray(s.collected) && new Set(s.collected).size===s.collected.length && s.collected.every(n=>Number.isInteger(n)&&n>=0&&n<s.deck.length) && (s.pending===null || s.collected.includes(s.pending)) && Number.isFinite(s.x) && s.x>=0 && s.x<1e8 && Number.isFinite(s.y) && s.y>=0 && s.y<=720 && typeof s.finished==='boolean' && (!s.finished || s.collected.length===s.deck.length);
}
export function collect(s,id) {if(s.pending!==null||s.finished||!Number.isInteger(id)||id<0||id>=s.deck.length||s.collected.includes(id))return false;s.collected.push(id);s.pending=id;return true;}
export function completeCard(s) {s.pending=null;s.finished=s.collected.length===s.deck.length;return s.finished;}
export function chunkAt(index,seed) {
  const rng=random((seed+Math.imul(index+1,7193))>>>0),x=index*RULES.chunk;
  const kind=index===0?0:index%5;
  const surfaces=[];
  // Narrow gaps have safe, flat approaches; no crystal is placed over a gap.
  if(kind===3){surfaces.push({x,y:600,w:640,ground:true},{x:x+770,y:600,w:190,ground:true});}
  else surfaces.push({x,y:600,w:960,ground:true});
  let cx=x+380+Math.round(rng()*80),cy=550;
  if(kind===1){surfaces.push({x:x+280,y:515,w:250});cx=x+405;cy=465;}
  if(kind===2){surfaces.push({x:x+185,y:525,w:190},{x:x+410,y:450,w:250,branch:true});cx=x+535;cy=400;}
  if(kind===3){surfaces.push({x:x+290,y:505,w:220,branch:true});cx=x+400;cy=455;}
  if(kind===4){surfaces.push({x:x+280,y:490,w:300,branch:true},{x:x+640,y:535,w:180});cx=x+430;cy=440;}
  return {index,x,surfaces,crystal:index<11?{id:index,x:cx,y:cy}:null,trees:[{x:x+70+rng()*70,scale:0.75+rng()*0.3},{x:x+700+rng()*120,scale:0.8+rng()*0.4}]};
}
