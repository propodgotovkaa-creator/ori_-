import test from 'node:test';import assert from 'node:assert/strict';import {endingFrame,ENDING_DURATION} from '../ending.js';
test('homecoming returns all eleven lights before showing the ending',()=>{
 const start=endingFrame(0);assert.equal(start.light,0);assert.equal(start.done,false);assert.equal(start.crystals.length,11);assert.ok(start.crystals.every(c=>c.opacity===0));
 const middle=endingFrame(6500);assert.ok(middle.light>0&&middle.light<1);assert.ok(middle.crystals.some(c=>c.opacity>0));assert.equal(middle.walk,0);
 const end=endingFrame(ENDING_DURATION);assert.equal(end.light,1);assert.equal(end.walk,1);assert.equal(end.farewell,1);assert.equal(end.done,true);assert.ok(end.crystals.every(c=>c.opacity===0));assert.ok(end.fireflies.every(c=>c.opacity>0));
});
test('homecoming handles reduced motion and produces finite positions',()=>{for(const reduced of [false,true])for(let t=0;t<40000;t+=137){const f=endingFrame(t,reduced);for(const c of [...f.crystals,...f.fireflies]){assert.ok(Number.isFinite(c.x)&&Number.isFinite(c.y));assert.ok(c.opacity>=0&&c.opacity<=1);}}});
