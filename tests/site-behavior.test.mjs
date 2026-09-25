import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveTheme,
  nextTheme,
  safeStoredTheme,
  safeStorage,
  scrollBehaviorForMotion
} from '../assets/js/site.js';

test('saved theme wins over OS preference', () => {
  assert.equal(resolveTheme({ savedTheme: 'light', prefersDark: true }), 'light');
  assert.equal(resolveTheme({ savedTheme: 'dark', prefersDark: false }), 'dark');
});

test('invalid or missing saved theme follows OS preference', () => {
  assert.equal(resolveTheme({ savedTheme: null, prefersDark: true }), 'dark');
  assert.equal(resolveTheme({ savedTheme: 'purple', prefersDark: false }), 'light');
});

test('theme toggle alternates light and dark', () => {
  assert.equal(nextTheme('light'), 'dark');
  assert.equal(nextTheme('dark'), 'light');
});

test('safe storage returns null when storage access throws', () => {
  const storage = { getItem() { throw new Error('blocked'); } };
  assert.equal(safeStoredTheme(storage), null);
});

test('reduced motion disables smooth scrolling', () => {
  assert.equal(scrollBehaviorForMotion(true), 'auto');
  assert.equal(scrollBehaviorForMotion(false), 'smooth');
});


test('storage object access is safe when the localStorage getter throws', () => {
  const hostileWindow = {};
  Object.defineProperty(hostileWindow, 'localStorage', { get() { throw new Error('blocked'); } });
  assert.equal(safeStorage(hostileWindow), null);
});
