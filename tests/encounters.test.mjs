import test from 'node:test';
import assert from 'node:assert/strict';
import {touches,SPIDER_POSITIONS} from '../encounters.js';
import {crystalsFor,groundAt} from '../scenery.js';
test('ground crystals touch walking body; aerial crystals require jumping',()=>{
 for(let i=0;i<5;i++)for(const c of crystalsFor(i)){
  const floor=groundAt(c.x),body={left:c.x-16,right:c.x+16,top:floor-53,bottom:floor};
  assert.equal(touches(body,c.x,c.y),c.id%2===0);
  if(c.id%2===1)assert.ok(touches({...body,top:body.top-110,bottom:body.bottom-110},c.x,c.y));
  assert.equal(touches({...body,left:c.x+60,right:c.x+92},c.x,c.y),false);
 }
});
test('spider contact includes a falling spider and rejects a near miss',()=>{
 const b={left:100,right:132,top:400,bottom:453};
 assert.ok(touches(b,116,375,26,30));
 assert.ok(touches(b,155,420,26,30));
 assert.equal(touches(b,190,420,26,30),false);
 assert.equal(new Set(SPIDER_POSITIONS).size,6);
});

