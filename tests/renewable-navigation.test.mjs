import test from 'node:test';
import assert from 'node:assert/strict';
import { createRenewableModuleController } from '../assets/js/renewable-module.js';

function fixture() {
  const handlers = {};
  function el(id) {
    return { id, hidden: false, disabled: false, textContent: '', style: {},
      addEventListener: (type,callback) => { handlers[`${id}:${type}`] = callback; } };
  }
  const stage = {
    ...el('module-stage'), scrollTop: 300, innerHTML: '', focus: () => {},
    querySelectorAll: () => [], querySelector: () => null
  };
  const controls = new Map([
    ['#module-stage',stage],
    ...['module-back','module-next','module-exit','module-section-label','module-progress-text','module-progress-fill'].map(id => [`#${id}`,el(id)])
  ]);
  const doc = { body: { children: [], dataset: {} }, querySelector: () => null };
  const root = { hidden: true, ownerDocument: doc, querySelector: sel => controls.get(sel) ?? null };
  const controller = createRenewableModuleController({ root, launchButton: el('launch'), onExit: () => {} });
  return { controller, handlers, controls, stage };
}

test('knowledge check has Submit instead of Next, and results also hide Next', () => {
  const {controller,controls} = fixture();
  controller.getState().screen = 4;
  controller.render();
  assert.equal(controls.get('#module-next').hidden, true);
  assert.equal(controls.get('#module-back').hidden, false);
  controller.getState().screen = 5;
  controller.render();
  assert.equal(controls.get('#module-next').hidden, true);
});

test('Next and Back reset the module scroll panel to the top', () => {
  const {controller,handlers,stage} = fixture();
  controller.launch();
  stage.scrollTop = 450;
  handlers['module-next:click']();
  assert.equal(controller.getState().screen,1);
  assert.equal(stage.scrollTop,0);
  stage.scrollTop = 600;
  handlers['module-back:click']();
  assert.equal(controller.getState().screen,0);
  assert.equal(stage.scrollTop,0);
});
