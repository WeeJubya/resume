import test from 'node:test';
import assert from 'node:assert/strict';
import { TAB_IDS, normaliseTabId, nextFocusedIndex } from '../assets/js/tabs.js';

test('tab order is the approved seven-tab order', () => {
  assert.deepEqual(TAB_IDS, ['home', 'about', 'what-i-do', 'experience', 'portfolio', 'testimonials', 'contact']);
});

test('missing or unknown hash resolves to home', () => {
  assert.equal(normaliseTabId(''), 'home');
  assert.equal(normaliseTabId('#'), 'home');
  assert.equal(normaliseTabId('#nonsense'), 'home');
});

test('valid hash resolves to its tab id case-insensitively', () => {
  assert.equal(normaliseTabId('#portfolio'), 'portfolio');
  assert.equal(normaliseTabId('#WHAT-I-DO'), 'what-i-do');
  assert.equal(normaliseTabId('#skills'), 'home');
});

test('arrow, Home and End keys move focus with wraparound', () => {
  assert.equal(nextFocusedIndex(0, 'ArrowLeft', 7), 6);
  assert.equal(nextFocusedIndex(6, 'ArrowRight', 7), 0);
  assert.equal(nextFocusedIndex(3, 'Home', 7), 0);
  assert.equal(nextFocusedIndex(3, 'End', 7), 6);
  assert.equal(nextFocusedIndex(2, 'x', 7), 2);
});
