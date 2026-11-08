import test from 'node:test';import assert from 'node:assert/strict';
import {SETS,LABELS,wordArt} from '../vocabulary.js';import {newSession,validSession,collect,completeCard} from '../core.js';import {crystalPlan,recycleCrystals} from '../crystal-cycle.js';import {newTrail} from '../firefly.js';import {endingFrame,ENDING_DURATION} from '../ending.js';
test('all four positions have their exact word list, matching crystals and final count',()=>{
 for(const [position,set] of Object.entries(SETS))for(let seed=0;seed<20;seed++){
  const s=newSession(seed,position);assert.ok(validSession(s));assert.deepEqual([...s.deck].sort(),[...set.words].sort());
  const plan=crystalPlan({},s.deck.length);assert.equal(plan.length,set.words.length);assert.ok(plan.every(c=>c.id<s.deck.length));
  // Skip the whole initial landscape: every missed ID must return, with the same word.
  recycleCrystals(plan,[],8000,7500);assert.ok(plan.every(c=>c.x>8000));
  const reversed=[...plan].reverse();for(let i=0;i<reversed.length;i++){assert.ok(collect(s,reversed[i].id));assert.ok(validSession(JSON.parse(JSON.stringify(s))));assert.equal(completeCard(s),i===reversed.length-1);}
  assert.equal(collect(s,set.words.length),false);assert.ok(validSession(s));assert.equal(endingFrame(ENDING_DURATION,false,s.deck.length).crystals.length,set.words.length);
 }
});
test('selected syllables cycle through spider encounters and repeat consistently',()=>{
 for(const set of Object.values(SETS)){const seen=new Set();for(let id=0;id<6;id++){const t=newTrail(id,set.syllables);seen.add(t.syllable);assert.equal(t.syllable,set.syllables[id%set.syllables.length]);assert.deepEqual(t,newTrail(id,set.syllables));}assert.deepEqual([...seen],[...set.syllables]);}
 assert.deepEqual(SETS.cluster.syllables,['КЛУ','ПЛЫ','СЛА','ПЛО']);
});
test('old saves migrate as initial; cross-position and malformed saves are rejected',()=>{
 const initial=newSession(1);delete initial.position;assert.ok(validSession(initial));
 assert.equal(validSession({...initial,position:'middle'}),false);assert.equal(validSession({...initial,position:'unknown'}),false);assert.equal(validSession({...initial,position:'constructor'}),false);
 const end=newSession(2,'final');assert.equal(validSession({...end,collected:[10]}),false);
});
test('every picture has a label and isolated atlas cell',()=>{for(const [key,set] of Object.entries(SETS)){const art=set.words.map(wordArt);assert.equal(new Set(set.words).size,set.words.length);set.words.forEach(w=>assert.ok(LABELS[w]));if(key!=='initial'){assert.equal(new Set(art.map(a=>a.position)).size,set.words.length);assert.ok(art.every(a=>a.src===`assets/words/${key}-atlas.png`));}}});
