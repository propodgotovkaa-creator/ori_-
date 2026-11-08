export const SYLLABLES=['РА','РО','РУ','РЫ'];
export const TRAIL=[[10,72],[31,48.4],[27,25],[47.5,62.2],[50,29],[67.2,35.7],[67,75],[82.8,48.3]];
export const NEIGHBORS=[[1,2],[3,4],[3,4],[5,6],[5,6],[7],[7],[]];
export function newTrail(encounter=0,syllables=SYLLABLES){const variation=(encounter*5)%8;return {step:0,syllable:syllables[encounter%syllables.length],route:[0,variation&1?2:1,variation&2?4:3,variation&4?6:5,7],phase:'preview',preview:0,elapsed:0,moving:false,done:false,wrong:false,chosen:[0]};}
export function advanceTrail(s,index){if(s.phase!=='recall'||s.moving||s.done||!NEIGHBORS[s.chosen.at(-1)].includes(index))return false;s.chosen.push(index);s.step++;s.moving=true;return true;}
export function finishFlight(s){if(!s.moving)return false;s.moving=false;if(s.step===s.route.length-1){s.done=s.chosen.length===s.route.length&&s.chosen.every((n,i)=>n===s.route[i]);s.wrong=!s.done;s.phase=s.done?'done':'error';}return s.done;}
export function tickPreview(s,delta){if(s.phase!=='preview')return false;s.elapsed+=delta;const next=Math.floor(s.elapsed/1050);if(next>=s.route.length){s.phase='recall';s.preview=-1;return true;}if(next!==s.preview){s.preview=next;return true;}return false;}
const curve=(a,b)=>{const [x,y]=TRAIL[a],[u,v]=TRAIL[b];return `M${x},${y} Q${(x+u)/2},${(y+v)/2+3} ${u},${v}`;};
export class FireflyTrial {
 constructor(root,{active,onStep,onComplete,syllables=SYLLABLES}){this.root=root;this.syllables=syllables;this.active=active;this.onStep=onStep;this.onComplete=onComplete;this.state=newTrail();this.remaining=0;this.encounter=0;
  this.repeat=root.querySelector('#trail-repeat');this.repeat.onclick=()=>{if(active()&&!this.state.moving)this.reset(this.encounter);};
  this.nodes=root.querySelector('#trail-nodes');this.nodes.replaceChildren();
  TRAIL.forEach(([x,y],i)=>{const b=document.createElement('button');b.className='trail-node';b.style.left=x+'%';b.style.top=y+'%';b.onclick=()=>this.go(i);this.nodes.append(b);});
  const svg=root.querySelector('#memory-threads');svg.replaceChildren();this.edges=[];NEIGHBORS.forEach((ends,a)=>ends.forEach(b=>{const line=document.createElementNS('http://www.w3.org/2000/svg','path');line.setAttribute('d',curve(a,b));svg.append(line);this.edges.push({a,b,line});}));
  this.fly=root.querySelector('#firefly');this.status=root.querySelector('#trail-status');
 }
 reset(encounter=0){this.encounter=encounter;this.state=newTrail(encounter,this.syllables);this.remaining=0;this.render();this.place();}
 place(){const [x,y]=TRAIL[this.state.chosen.at(-1)];this.fly.style.left=x+'%';this.fly.style.top=y+'%';}
 go(index){if(!this.active())return;if(!advanceTrail(this.state,index)){this.render();return;}this.remaining=650;this.from=TRAIL[this.state.chosen[this.state.step-1]];this.to=TRAIL[index];this.onStep();this.render();}
 tick(delta){if(!this.active())return;const s=this.state;if(s.phase==='preview'){if(tickPreview(s,delta)){this.render();if(s.phase==='recall')this.status.focus({preventScroll:true});}return;}if(!s.moving)return;
  this.remaining=Math.max(0,this.remaining-delta);const t=1-this.remaining/650,q=t*t*(3-2*t);this.fly.style.left=(this.from[0]+(this.to[0]-this.from[0])*q)+'%';this.fly.style.top=(this.from[1]+(this.to[1]-this.from[1])*q-Math.sin(t*Math.PI)*3)+'%';
  if(this.remaining===0){const done=finishFlight(s);this.render();if(done)this.onComplete();else this.status.focus({preventScroll:true});}
 }
 render(){const s=this.state,isPreview=s.phase==='preview',visited=s.chosen,shown=isPreview?s.route.slice(0,s.preview+1):visited,current=s.chosen.at(-1);
  this.root.querySelector('#trial-syllable').textContent=s.syllable;this.repeat.disabled=s.moving||isPreview;this.repeat.textContent=s.phase==='error'?'Попробовать ещё раз':'Показать путь ещё раз';
  [...this.nodes.children].forEach((b,i)=>{b.disabled=s.phase!=='recall'||s.moving||s.done||!NEIGHBORS[current].includes(i);b.classList.toggle('visited',!isPreview&&visited.includes(i));b.classList.toggle('preview-glow',isPreview&&shown.includes(i));b.classList.toggle('choice',!b.disabled);b.textContent=i===7?'✧':'•';b.setAttribute('aria-label',`Огонёк ${i}: произнеси ${s.syllable}`);});
  for(const {a,b,line} of this.edges){const k=shown.indexOf(a);line.classList.toggle('lit',k>=0&&shown[k+1]===b);}
  this.status.textContent=isPreview?'Смотри, как загорается путь. Запомни его.':s.done?'Светлячок добрался!':s.moving?'Светлячок летит по ниточке…':s.wrong?'Попробуй ещё раз! Этот путь отличается от показанного.':`Повтори путь. На каждом шаге произноси «${s.syllable}» · ${s.step} / 4`;
 }
}
