import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createModuleState, viewRenewableType, viewClimateImpact, markAvonmouthOpened,
  canAdvance, advance, goBack, resetModuleState, nextDialogFocusIndex
} from '../assets/js/renewable-module.js';

test('new module starts on welcome and may advance from welcome', () => {
  const state = createModuleState();
  assert.equal(state.screen, 0);
  assert.equal(canAdvance(state), true);
  advance(state);
  assert.equal(state.screen, 1);
});

test('types screen requires all five renewable types', () => {
  const state = createModuleState();
  state.screen = 1;
  for (const id of ['solar','wind','hydro','biomass']) viewRenewableType(state, id);
  assert.equal(canAdvance(state), false);
  viewRenewableType(state, 'geothermal');
  assert.equal(canAdvance(state), true);
});

test('climate screen requires all four impact reveals', () => {
  const state = createModuleState();
  state.screen = 2;
  for (const index of [0,1,2]) viewClimateImpact(state, index);
  assert.equal(canAdvance(state), false);
  viewClimateImpact(state, 3);
  assert.equal(canAdvance(state), true);
});

test('UK screen requires Avonmouth case study to be opened once', () => {
  const state = createModuleState();
  state.screen = 3;
  assert.equal(canAdvance(state), false);
  markAvonmouthOpened(state);
  assert.equal(canAdvance(state), true);
});

test('back never goes before first screen and reset clears progress', () => {
  const state = createModuleState();
  goBack(state);
  assert.equal(state.screen, 0);
  state.screen = 2;
  viewRenewableType(state, 'solar');
  viewClimateImpact(state, 0);
  markAvonmouthOpened(state);
  resetModuleState(state);
  assert.equal(state.screen, 0);
  assert.deepEqual([...state.viewedTypes], []);
  assert.deepEqual([...state.viewedImpacts], []);
  assert.equal(state.avonmouthOpened, false);
});


test('dialog focus index wraps in both directions', () => {
  assert.equal(nextDialogFocusIndex(0, -1, 3), 2);
  assert.equal(nextDialogFocusIndex(2, 1, 3), 0);
  assert.equal(nextDialogFocusIndex(1, 1, 3), 2);
});


test('reset allows a clean second module run', () => {
  const state = createModuleState();
  state.screen = 5;
  state.result = { points: 9, total: 10, percentage: 90, passed: true };
  state.attempt = { sentinel: true };
  resetModuleState(state);
  assert.equal(state.screen, 0);
  assert.equal(state.result, null);
  assert.equal(state.attempt, null);
  assert.equal(state.viewedTypes.size, 0);
  assert.equal(state.viewedImpacts.size, 0);
});
