import test from 'node:test';
import assert from 'node:assert/strict';
import {PANELS,PANEL_STEP,groundAt,crystalsFor,connector} from '../scenery.js';

test('five painted locations contain exactly eleven unique supported crystals',()=>{
  assert.equal(PANELS.length,5);
  const crystals=PANELS.flatMap((_,i)=>crystalsFor(i));
  assert.deepEqual(crystals.map(c=>c.id),Array.from({length:11},(_,i)=>i));
  for(const c of crystals)assert.ok([51,145].includes(groundAt(c.x)-c.y));
  assert.deepEqual(crystalsFor(5),[]);
});
test('terrain joins are continuous at both ends of every root connector',()=>{
  for(let i=1;i<=10;i++){
    const b=connector(i);
    assert.ok(Math.abs(groundAt(b.x1-.01)-groundAt(b.x1+.01))<.1);
    assert.ok(Math.abs(groundAt(b.x2-.01)-groundAt(b.x2+.01))<.1);
    assert.ok(Math.abs(b.y2-b.y1)/(b.x2-b.x1)<1);
  }
});
test('painted terrain has no missing or offscreen support anywhere along the session',()=>{
  for(let x=0;x<5*PANEL_STEP;x+=2){const y=groundAt(x);assert.ok(Number.isFinite(y)&&y>250&&y<690);}
});
