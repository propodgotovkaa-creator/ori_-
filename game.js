import {SETS,LABELS,wordArt} from './vocabulary.js?v=10';
import {Homecoming} from './ending.js?v=10';
import {crystalPlan,recycleCrystals,nextLayoutSeed} from './crystal-cycle.js?v=15';
import {FireflyTrial} from './firefly.js?v=10';
import {Spiders,touches} from './encounters.js?v=7';
import {WORDS,RULES as R,newSession,validSession,collect,completeCard,chunkAt} from './core.js?v=10';
import {PANELS,PANEL_STEP,PANEL_WIDTH,panelAt,groundAt,connector,crystalsFor} from './scenery.js';
const $=id=>document.getElementById(id);
const STORE='forest-keeper-soft-v2';
let saved=null;try{const s=JSON.parse(sessionStorage.getItem(STORE));if(validSession(s))saved=s;}catch{}
let session=saved||newSession(),scene,mode='loading',resumeMode='playing';
if(!saved){session.x=180;session.y=groundAt(session.x)-29;}
session.position??='initial';let selectedPosition=session.position;
const held=new Set();let facing=1;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function save(){try{sessionStorage.setItem(STORE,JSON.stringify(session));}catch{}}
function focusGame(){const canvas=document.querySelector('#game canvas');if(canvas){canvas.tabIndex=0;canvas.focus({preventScroll:true});}}
function clearInput(){held.clear();if(scene){scene.jumpAt=-Infinity;scene.player?.body.setAccelerationX(0);scene.player?.body.setVelocityX(0);}}
function ui(next){mode=next;clearInput();if(next==='playing')requestAnimationFrame(focusGame);for(const id of ['menu','card','paused','finish','caught'])$(id).hidden=id!==next;$('hud').hidden=['menu','loading','celebrating','finish'].includes(next);$('homecoming').hidden=!['celebrating','finish'].includes(next);$('touch').hidden=next!=='playing';$('hint').hidden=true;$('crystal-flight').hidden=!['revealing','card'].includes(next);$('crystal-flight').disabled=next!=='card';$('crystal-flight').classList.toggle('revealed',next==='card');if(scene){if(next==='playing'){scene.physics.resume();scene.tweens.resumeAll();}else{scene.physics.pause();if(next==='wrapping'||next==='caught'||next==='releasing')scene.tweens.resumeAll();else scene.tweens.pauseAll();}}}
function count(){$('count').textContent=`${session.collected.length} / ${session.deck.length}`;}
function showWord(id){const art=wordArt(id),el=$('word');el.style.backgroundImage=`url("${art.src}")`;el.style.backgroundSize=art.size;el.style.backgroundPosition=art.position;el.setAttribute('aria-label',LABELS[id]);}
function renderPositions(){for(const b of document.querySelectorAll('.position-choice'))b.setAttribute('aria-pressed',String(b.dataset.position===selectedPosition));const set=SETS[selectedPosition];$('set-note').textContent=`${set.words.length} картинок`;const continuing=selectedPosition===session.position&&!session.finished&&(session.collected.length||session.x>180);$('start').textContent=continuing?'Продолжить путешествие':'Начать путешествие';$('fresh').hidden=!continuing;}
for(const button of document.querySelectorAll('.position-choice'))button.onclick=()=>{selectedPosition=button.dataset.position;renderPositions();};
function openCard(){ui('card');showWord(session.deck[session.pending]);const ball=$('crystal-flight');ball.style.left='50%';ball.style.top='50%';ball.style.setProperty('--orb-size','36cqw');ball.style.opacity='1';ball.style.transform='translate(-50%,-50%)';ball.focus({preventScroll:true});}

function begin(fresh=false){if(fresh||session.finished||selectedPosition!==session.position){session=newSession(nextLayoutSeed(session.seed,SETS[selectedPosition].words.length),selectedPosition);session.x=180;session.y=groundAt(180)-29;save();scene.scene.restart();return;}const phase=scene.spiders?.active?.phase;ui(({wrap:'wrapping',cocoon:'caught',release:'releasing'})[phase]||'playing');if(session.pending!==null)openCard();}
function showMenu(){save();ui('menu');$('start').textContent=session.collected.length||session.x>180?'Продолжить путешествие':'Начать путешествие';$('fresh').hidden=!(session.collected.length||session.x>180);renderPositions();$('start').focus({preventScroll:true});}
$('start').onclick=()=>begin();$('fresh').onclick=()=>begin(true);
$('crystal-flight').onclick=()=>{if(mode!=='card')return;if(completeCard(session)){save();scene.celebrate();}else{save();ui('playing');}};
$('pause').onclick=()=>{if(['playing','wrapping','caught','releasing','revealing'].includes(mode)){resumeMode=mode;scene.recordPosition();ui('paused');$('resume').focus();}};
$('resume').onclick=()=>{ui(resumeMode);};
$('back-menu').onclick=()=>showMenu();$('again').onclick=()=>begin(true);$('finish-menu').onclick=()=>showMenu();
function action(key){if(mode!=='playing')return;if(key==='jump')scene.jumpAt=scene.time.now;}
const keys={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',KeyW:'jump',Space:'jump'};
function inputKey(e){return keys[e.code]||keys[e.key]||({a:'left',d:'right',w:'jump',' ':'jump'})[e.key?.toLowerCase()];}
window.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&['playing','wrapping','caught','releasing','revealing'].includes(mode)){$('pause').click();e.preventDefault();return;}
 if(e.key==='Escape'&&mode==='paused'){$('resume').click();e.preventDefault();return;}
 const k=inputKey(e);if(mode!=='playing'||!k)return;
 e.preventDefault();e.stopPropagation();held.add(k);if(!e.repeat)action(k);
 if(new URLSearchParams(location.search).has('test'))$('stage').dataset.lastKey=`${e.key}:${e.code}`;
},true);
window.addEventListener('keyup',e=>{const k=inputKey(e);if(k){held.delete(k);if(mode==='playing')e.preventDefault();}},true);
$('game').addEventListener('pointerdown',()=>{if(mode==='playing')focusGame();});
for(const b of document.querySelectorAll('[data-action]')){const k=b.dataset.action;b.addEventListener('pointerdown',e=>{if(mode!=='playing')return;e.preventDefault();b.setPointerCapture(e.pointerId);focusGame();held.add(k);action(k);});for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,()=>held.delete(k));}
function autoPause(){clearInput();if(['playing','wrapping','caught','releasing','revealing'].includes(mode)){$('pause').click();}}
window.addEventListener('blur',autoPause);document.addEventListener('visibilitychange',()=>{if(document.hidden)autoPause();});window.addEventListener('pagehide',()=>{scene?.recordPosition();save();});

class Forest extends Phaser.Scene {
 constructor(){super('Forest');}
 preload(){scene=this;this.failed=[];this.load.on('loaderror',file=>this.failed.push(file.key));
   this.load.image('spider','assets/spider/spider-v2.png');this.load.image('cocoon','assets/spider/cocoon.png');
   this.load.image('hero','assets/character/hero-v2.png');this.load.json('metrics','assets/metrics.json?v=10');
   PANELS.forEach((p,i)=>this.load.image(`panel${i}`,`assets/forest/soft/${p.file}.png`));
   this.load.image('root','assets/forest/soft/root.png');
   for(const [key,path] of Object.entries({tree:'forest/tree',ground:'platforms/ground',branch:'platforms/branch',crystal:'crystals/crystal-v3',flower:'effects/flower'}))this.load.image(key,`assets/${path}.png`);
   for(const key of ['middle','final','cluster'])this.load.image(key+'Atlas',`assets/words/${key}-atlas.png`);
   for(const w of WORDS)this.load.image(w,`assets/words/${w}.png`);
 }
 create(){scene=this;if(this.failed.length){$('load-status').textContent='Не удалось загрузить часть игры. Проверьте соединение и обновите страницу.';console.error('Missing assets',this.failed);return;}
   this.metrics=this.cache.json.get('metrics');
   for(const [key,b] of Object.entries(this.metrics.assets)){const t=this.textures.get(key);if(!t.has('trim'))t.add('trim',0,b.x,b.y,b.w,b.h);}
   const tex=this.textures.get('hero');this.metrics.hero.forEach((f,i)=>{if(!tex.has(String(i)))tex.add(String(i),0,f.x,f.y,f.w,f.h);});
   this.chunks=new Map();this.crystals=[];this.groundTime=-Infinity;this.jumpAt=-Infinity;this.landAt=-Infinity;this.stepAt=0;this.saveAt=0;this.trailAt=0;this.wasGrounded=false;this.nearId=null;
   this.player=this.add.zone(session.x,session.y,32,53);this.physics.add.existing(this.player);this.player.body.setGravityY(0).setMaxVelocity(R.speed,1000).setDragX(1500);
   this.hero=this.add.image(session.x,session.y,'hero','4').setDepth(5);this.setHero(4,0);
   this.crystalPlan=crystalPlan(session.crystalPositions,session.deck.length,session.seed);
   this.recycleCrystals();
   for(const c of this.crystalPlan)if(!session.collected.includes(c.id)){const art=this.add.image(c.x,c.y,'crystal','trim').setDisplaySize(44,72).setDepth(4);this.crystals.push({id:c.id,x:c.x,baseY:c.y,art});}
   this.ensureChunks(panelAt(session.x));
   this.spiders=new Spiders(this,Array.isArray(session.spidersCleared)?session.spidersCleared:[],()=>{this.player.body.setVelocity(0,0).setAcceleration(0,0);ui('wrapping');},id=>{this.trial.reset((session.spidersCleared||[]).length);ui('caught');$('trail-status').focus({preventScroll:true});},id=>{session.spidersCleared=[...new Set([...(session.spidersCleared||[]),id])];this.hero.setAlpha(1);this.lastX=this.player.x;this.lastBottom=this.player.body.bottom;this.recordPosition();ui('playing');});
   this.trial=new FireflyTrial($('caught'),{syllables:SETS[session.position].syllables,active:()=>mode==='caught',onStep:()=>{},onComplete:()=>{ui('releasing');this.spiders.release();this.burst(this.player.x,this.player.y,24);}});
   this.cameras.main.setBounds(0,0,100000000,720);this.cameras.main.startFollow(this.player,true,.075,.075, -190,0);this.cameras.main.setDeadzone(75,720);this.cameras.main.scrollX=Math.max(0,session.x-450);
   this.checkpoint={x:session.x,y:session.y};this.lastX=session.x;this.lastBottom=session.y+26.5;this.grounded=false;
   this.motes=[];for(let i=0;i<(reduced?12:35);i++){const d=this.add.circle(Math.random()*1280,80+Math.random()*500,1+Math.random()*1.5,0xfff4b8,.65).setScrollFactor(0).setDepth(6);this.motes.push({d,x:d.x,y:d.y,phase:Math.random()*7});}
   this.homecoming=new Homecoming($('homecoming'),{reduced,onComplete:()=>{ui('finish');$('again').focus({preventScroll:true});}});
   $('loading').hidden=true;count();
   if(this.game.registry.get('started')){ui('playing');if(session.pending!==null)openCard();}else{this.game.registry.set('started',true);showMenu();}
   if(new URLSearchParams(location.search).get('ending')==='1'&&new URLSearchParams(location.search).has('test')&&!this.game.registry.get('endingPreviewed')){this.game.registry.set('endingPreviewed',true);this.celebrate();}
   if(new URLSearchParams(location.search).has('test'))window.__forest={scene:this,get session(){return session;},get mode(){return mode;},start:begin,collect:id=>{const c=this.crystals.find(c=>c.id===id);if(c){this.player.setPosition(c.x,c.baseY+25);this.player.body.reset(c.x,c.baseY+25);this.interact();}},teleport:(x,y)=>{this.ensureChunks(panelAt(x));this.player.body.reset(x,y);}};
 }
 ensureChunks(center){
   for(let n=Math.max(0,center-1);n<=center+2;n++){
     if(this.chunks.has(n))continue;const owned=[],x=n*PANEL_STEP,key=`panel${n%5}`;
     const source=this.textures.get(key).getSourceImage(),ratio=source.width/PANEL_WIDTH;
     const art=this.add.image(x,0,key).setOrigin(0,0).setDisplaySize(PANEL_WIDTH,720).setDepth(-5);
     if(n>0){
       art.setCrop(Math.round(32*ratio),0,source.width-Math.round(32*ratio),source.height);
       // Only the 32-pixel join blends; the scenery itself stays opaque and crisp.
       for(let a=0;a<32;a+=4){const strip=this.add.image(x,0,key).setOrigin(0,0).setDisplaySize(PANEL_WIDTH,720).setDepth(-4).setCrop(Math.round(a*ratio),0,Math.ceil(4*ratio),source.height).setAlpha((a+2)/32);owned.push(strip);}
       const b=connector(n),dx=b.x2-b.x1,dy=b.y2-b.y1,len=Math.hypot(dx,dy);
       const root=this.add.image(b.x1,b.y1-8,'root','trim').setOrigin(0,.12).setDisplaySize(len+10,85).setRotation(Math.atan2(dy,dx)).setDepth(1);owned.push(root);
     }
     owned.push(art);
     this.chunks.set(n,owned);
   }
   for(const [n,owned] of this.chunks)if(n<center-1||n>center+2){owned.forEach(o=>o.destroy());this.chunks.delete(n);}
 }
 recycleCrystals(){const moved=recycleCrystals(this.crystalPlan,session.collected,this.player.x,this.cameras.main.scrollX);for(const c of moved){const entry=this.crystals.find(v=>v.id===c.id);if(entry){entry.x=c.x;entry.baseY=c.y;entry.art.setPosition(c.x,c.y);}}if(moved.length){session.crystalPositions=Object.fromEntries(this.crystalPlan.map(c=>[c.id,c.x]));save();}}
 recordPosition(){if(!this.player)return;session.x=this.checkpoint?.x??140;session.y=this.checkpoint?.y??560;save();}
 interact(id){if(mode!=='playing')return;const c=this.crystals.find(c=>(id===undefined||id===c.id)&&touches(this.player.body,c.x,c.art.y));if(!c||!collect(session,c.id))return;this.burst(c.x,c.baseY,20);c.art.destroy();this.crystals=this.crystals.filter(v=>v!==c);count();this.recordPosition();this.revealCard(c.x,c.baseY);}
 revealCard(x,y){showWord(session.deck[session.pending]);this.orb={x:(x-this.cameras.main.scrollX)/R.width*100,y:y/R.height*100,elapsed:0};ui('revealing');this.drawOrb(0);}
 drawOrb(ms){const o=this.orb;o.elapsed+=ms;const t=Math.min(1,Math.max(0,(o.elapsed-300)/850)),q=t*t*(3-2*t);const ball=$('crystal-flight');ball.style.left=(o.x+(50-o.x)*q)+'%';ball.style.top=(o.y+(50-o.y)*q-Math.sin(t*Math.PI)*12)+'%';ball.style.setProperty('--orb-size',(3+q*33)+'cqw');ball.style.opacity=String(Math.min(1,o.elapsed/160));ball.style.transform=`translate(-50%,-50%) scale(${.7+.3*Math.min(1,o.elapsed/300)})`;if(o.elapsed>=1350){this.orb=null;openCard();}}
 burst(x,y,n=8){if(reduced)n=Math.min(5,n);for(let i=0;i<n;i++){const d=this.add.circle(x,y,1+Math.random()*2,0xdffff5,.85).setDepth(8);this.tweens.add({targets:d,x:x+(Math.random()-.5)*110,y:y-15-Math.random()*75,alpha:0,scale:0,duration:650+Math.random()*450,onComplete:()=>d.destroy()});}}
 celebrate(){ui('celebrating');this.player.body.setVelocity(0,0).setAcceleration(0,0);this.homecoming.start(session.deck.length);}
 update(time,delta){if(!this.player)return;const dt=Math.min(delta,32)/1000;const cam=this.cameras.main.scrollX;
   if(mode==='celebrating'||mode==='finish'){this.homecoming.tick(dt*1000);return;}
   if(mode==='revealing'){this.drawOrb(dt*1000);return;}
   if(['wrapping','caught','releasing'].includes(mode)){this.spiders.update(dt,this.player.body);this.trial.tick(dt*1000);return;}
   if(mode!=='playing'&&mode!=='celebrating'){return;}
   for(const m of this.motes){m.d.x=(m.x-cam*.6+time*.006+100000)%1350-35;m.d.y=m.y+(reduced?0:Math.sin(time*.0005+m.phase)*24);m.d.alpha=.25+Math.sin(time*.001+m.phase)*.2;}
   const body=this.player.body;
   let floor=groundAt(body.center.x),grounded=false;
   const previousFloor=groundAt(this.lastX),wasGrounded=this.grounded;
   // Resolve the Arcade body against the actual painted contour, including gentle slopes.
   // A raised stone edge blocks walking until a jump puts the feet above its top.
   if(floor<previousFloor-16&&this.lastBottom>floor+14&&body.velocity.y>=0&&wasGrounded){
     body.reset(this.lastX,this.player.y);floor=previousFloor;
   }
   if(body.velocity.y>=0&&body.bottom>=floor-2&&(this.lastBottom<=floor+16||wasGrounded&&Math.abs(floor-previousFloor)<16)){
     const vx=body.velocity.x;body.reset(body.center.x,floor-body.height/2);body.setVelocity(vx,0);grounded=true;
   }
   if(grounded){this.groundTime=time;if(!wasGrounded){this.landAt=time;this.burst(this.player.x,floor,5);}this.checkpoint={x:this.player.x,y:this.player.y-2};}
   this.grounded=grounded;this.wasGrounded=grounded;
   const direction=(held.has('right')?1:0)-(held.has('left')?1:0);body.setAccelerationX(direction*1700);if(direction)facing=direction;
   if(time-this.jumpAt<R.buffer&&time-this.groundTime<R.coyote){body.setVelocityY(-R.jump);this.jumpAt=-Infinity;this.groundTime=-Infinity;this.wasGrounded=false;this.grounded=false;}
   if(this.player.x<35){body.reset(35,this.player.y);}
   if(this.player.y>840){body.reset(this.checkpoint.x,this.checkpoint.y-8);this.burst(this.player.x,this.player.y,12);this.cameras.main.scrollX=Math.max(0,this.player.x-450);}
   this.ensureChunks(panelAt(this.player.x));this.recycleCrystals();
   if(time-this.saveAt>1200){this.recordPosition();this.saveAt=time;}
   let frame=4;if(!grounded)frame=body.velocity.y<0?5:6;else if(time-this.landAt<95)frame=7;else if(Math.abs(body.velocity.x)>25)frame=Math.floor(time/(90+(R.speed-Math.abs(body.velocity.x))*.2))%4;
   if(new URLSearchParams(location.search).has('test')){$('stage').dataset.position=JSON.stringify({x:Math.round(this.player.x),y:Math.round(this.player.y),vx:Math.round(body.velocity.x),held:[...held],grounded});}
   this.setHero(frame,time);this.lastX=this.player.x;this.lastBottom=body.bottom;
   if(grounded&&Math.abs(body.velocity.x)>65&&time-this.stepAt>220){this.stepAt=time;}
   if(Math.abs(body.velocity.x)>60&&time-this.trailAt>100){this.burst(this.player.x-facing*20,this.player.y+15,1);this.trailAt=time;}
   let near=null;for(const c of this.crystals){const d=Phaser.Math.Distance.Between(this.player.x,this.player.y,c.x,c.baseY);c.art.y=c.baseY+(reduced?0:Math.sin(time*.002+c.id)*6);c.art.setScale((44/this.metrics.assets.crystal.w)*(d<R.reach?1.13:1)*(1+.035*Math.sin(time*.003)),72/this.metrics.assets.crystal.h);if(d<R.reach)near=c;}
   $('hint').hidden=true;
   this.interact();
   if(mode==='playing')this.spiders.update(dt,body);
 }
 setHero(frame,time){const f=this.metrics.hero[frame];this.hero.setFrame(String(frame));const scale=104/this.metrics.hero[4].w;this.hero.setScale(scale,scale*(frame===4?1+Math.sin(time*.003)*.014:1));this.hero.setFlipX(facing<0);this.hero.setOrigin(facing>0?.65:.35,1);this.hero.x=this.player.x;this.hero.y=this.player.body.bottom+3;}
}
const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:R.width,height:R.height,backgroundColor:'#84bdd1',transparent:false,resolution:Math.min(window.devicePixelRatio||1,2),render:{antialias:true,roundPixels:false},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},physics:{default:'arcade',arcade:{gravity:{y:R.gravity},debug:false}},audio:{noAudio:true},input:{activePointers:3},scene:[Forest]});
window.addEventListener('error',()=>{if(mode==='loading')$('load-status').textContent='Не удалось открыть лес. Обновите страницу или попробуйте другой браузер.';});
