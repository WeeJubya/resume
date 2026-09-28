import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const read = (relative) => readFileSync(new URL(relative, ROOT), 'utf8');

function htmlFiles() {
  return readdirSync(new URL('../', import.meta.url), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => entry.name);
}

test('every HTML document carries the GNU Terry Pratchett clacks meta tag', () => {
  for (const file of htmlFiles()) {
    const html = read(file);
    assert.match(html, /<meta\s+http-equiv=["']X-Clacks-Overhead["']\s+content=["']GNU Terry Pratchett["']\s*\/?>/i, file);
  }
});

test('public HTML contains none of the excluded private-source markers', () => {
  const html = htmlFiles().map(read).join('\n');
  assert.doesNotMatch(html, /(?<!\d)(?:\+44\s?(?:\(0\)\s?)?|0)(?:\d[\s-]?){9,10}(?!\d)/);
  assert.doesNotMatch(html, /@hrs\.mod\.uk\b|references@/i);
  assert.doesNotMatch(html, />\s*References\s*</i);
});

test('local asset references do not start at domain root', () => {
  const html = read('index.html');
  const localAssetRefs = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
    .map((match) => match[1])
    .filter((value) => /^(?:\/)?assets\//.test(value));
  assert.ok(localAssetRefs.length > 0);
  for (const value of localAssetRefs) assert.equal(value.startsWith('/'), false, value);
});

test('index defines all seven accessible tabs and panels', () => {
  const html = read('index.html');
  for (const id of ['home','about','experience','portfolio','skills','testimonials','contact']) {
    assert.match(html, new RegExp(`id=["']tab-${id}["'][\\s\\S]*role=["']tab["']`, 'i'));
    assert.match(html, new RegExp(`id=["']panel-${id}["'][\\s\\S]*role=["']tabpanel["']`, 'i'));
  }
});

test('source HTML does not pre-hide primary tab panels', () => {
  const html = read('index.html');
  for (const id of ['home','about','experience','portfolio','skills','testimonials','contact']) {
    const openTag = html.match(new RegExp(`<section[^>]+id=["']panel-${id}["'][^>]*>`, 'i'))?.[0] ?? '';
    assert.doesNotMatch(openTag, /\shidden(?:\s|=|>)/i, id);
  }
});

test('Portfolio exposes ADP and Renewable Energy projects plus a launch control', () => {
  const html = read('index.html');
  assert.match(html, /Analyst Developer Programme/i);
  assert.match(html, /Renewable Energy/i);
  assert.match(html, /id=["']launch-renewable-module["']/i);
  assert.match(html, /Launch Interactive Case Study/i);
});

test('Renewable module shell and accessible Avonmouth dialog hooks exist', () => {
  const html = read('index.html');
  assert.match(html, /id=["']renewable-module["']/i);
  assert.match(html, /id=["']module-exit["']/i);
  assert.match(html, /id=["']module-back["']/i);
  assert.match(html, /id=["']module-next["']/i);
  assert.match(html, /id=["']avonmouth-dialog["'][\s\S]*role=["']dialog["']/i);
  assert.match(html, /aria-modal=["']true["']/i);
  assert.match(html, /id=["']open-avonmouth["']/i);
});

test('module stylesheet and script assets are relative', () => {
  const html = read('index.html');
  assert.match(html, /href=["']assets\/css\/module\.css["']/i);
  assert.match(html, /src=["']assets\/js\/app\.js["']/i);
  assert.doesNotMatch(html, /(?:href|src)=["']\/assets\//i);
});

test('V2 keeps reduced-motion rules and the no-JS module explanation', () => {
  const styles = read('assets/css/styles.css') + '\n' + read('assets/css/module.css');
  const html = read('index.html');
  assert.match(styles, /prefers-reduced-motion\s*:\s*reduce/i);
  assert.match(html, /JavaScript is required to launch the interactive learning demonstration/i);
});

test('theme toggle and both theme token families remain present', () => {
  const html = read('index.html');
  const styles = read('assets/css/styles.css');
  assert.match(html, /id=["']theme-toggle["']/i);
  assert.match(styles, /--command-burgundy/i);
  assert.match(styles, /--science-blue/i);
  assert.match(styles, /\[data-theme=["']dark["']\]/i);
});

test('every primary tab label remains present in source HTML for no-JS readers', () => {
  const html = read('index.html');
  for (const label of ['Home','About','Experience','Portfolio','Skills','Testimonials','Contact']) {
    assert.match(html, new RegExp(`>${label}<`, 'i'));
  }
});

test('module exposes theme control and exits back through the Portfolio tab', () => {
  const html = read('index.html');
  const app = read('assets/js/app.js');
  assert.match(html, /id=["']module-theme-toggle["']/i);
  assert.match(html, /data-theme-toggle/i);
  assert.match(app, /querySelectorAll\([^)]*data-theme-toggle/i);
  assert.match(app, /onExit\s*:\s*\(\)\s*=>\s*tabs\.activate\(["']portfolio["']/i);
});

test('README documents V2 release, deep links, session state and exact 80 percent scoring', () => {
  const readme = read('README.md');
  for (const phrase of [
    'Publish V2 from Developer PowerShell',
    'git show --no-patch v1.0',
    '#portfolio',
    '8/10',
    '80%',
    'session-only',
    'no build step'
  ]) assert.match(readme, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
});
