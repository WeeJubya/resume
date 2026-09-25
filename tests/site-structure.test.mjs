import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const htmlFiles = ['index.html', '404.html'];
const gnuTag = '<meta http-equiv="X-Clacks-Overhead" content="GNU Terry Pratchett" />';
const requiredSections = ['home', 'about', 'experience', 'portfolio', 'skills', 'testimonials', 'contact'];

const read = (name) => readFileSync(resolve(root, name), 'utf8');

test('required static files exist', () => {
  for (const name of [...htmlFiles, '.nojekyll', 'robots.txt', 'sitemap.xml']) {
    assert.equal(existsSync(resolve(root, name)), true, `${name} should exist`);
  }
});

test('every HTML page contains the GNU Terry Pratchett meta tag', () => {
  for (const name of htmlFiles) assert.match(read(name), new RegExp(gnuTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('index exposes every required section anchor', () => {
  const html = read('index.html');
  for (const id of requiredSections) assert.match(html, new RegExp(`id=["']${id}["']`));
});

test('site metadata uses the Resume project URL', () => {
  const html = read('index.html');
  assert.match(html, /<link rel="canonical" href="https:\/\/weejubya\.github\.io\/Resume\/"\s*\/>/);
  assert.match(html, /property="og:url" content="https:\/\/weejubya\.github\.io\/Resume\/"/);
  assert.match(read('sitemap.xml'), /https:\/\/weejubya\.github\.io\/Resume\//);
  assert.match(read('robots.txt'), /Sitemap: https:\/\/weejubya\.github\.io\/Resume\/sitemap\.xml/);
});

test('public files contain no UK mobile number or referee section', () => {
  const corpus = [
    ...htmlFiles.map(read),
    read('robots.txt'),
    read('sitemap.xml')
  ].join('\n');
  assert.doesNotMatch(corpus, /(?:\+44\s?7\d{3}|07\d{3})[\s-]?\d{3}[\s-]?\d{3}/);
  assert.doesNotMatch(corpus, />\s*References\s*</i);
});

test('document asset URLs are project-site safe relative paths', () => {
  const html = read('index.html');
  const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
  const localRefs = refs.filter((ref) => !/^(?:https?:|mailto:|#)/.test(ref));
  for (const ref of localRefs) assert.equal(ref.startsWith('/'), false, `${ref} must not be root-absolute`);
});

test('index contains the approved public-facing portfolio content', () => {
  const html = read('index.html');
  for (const phrase of [
    'Glynn Williams',
    'eLearning Specialist',
    'Creative Developer',
    'Instructional Designer',
    'Analyst Development Programme',
    '100 cohorts',
    'Renewable Energy',
    'Articulate Storyline',
    'Adobe Captivate',
    'SCORM 1.2',
    'xAPI',
    'Saba',
    'Moodle',
    'British Security Service',
    'GCHQ',
    'Wildfowl &amp; Wetlands Trust',
    'glynn.williams@me.com',
    'Gloucestershire, UK'
  ]) assert.match(html, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
});

test('page includes baseline accessibility hooks', () => {
  const html = read('index.html');
  assert.match(html, /class="skip-link"/);
  assert.match(html, /<main\b/);
  assert.match(html, /aria-label="Primary navigation"/);
  assert.match(html, /id="theme-toggle"/);
  assert.match(html, /aria-expanded="false"/);
});

test('CSS defines both named themes and minimum target size', () => {
  const css = read('assets/css/styles.css');
  assert.match(css, /--command-burgundy:/);
  assert.match(css, /--science-blue:/);
  assert.match(css, /\[data-theme="dark"\]/);
  assert.match(css, /min-(?:width|height):\s*(?:var\(--target\)|44px)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});

test('interactive controls are wired with accessible state', () => {
  const html = read('index.html');
  assert.match(html, /id="nav-toggle"[^>]*aria-expanded="false"/s);
  assert.match(html, /id="theme-toggle"[^>]*aria-label=/s);
  assert.match(html, /type="module" src="assets\/js\/site\.js"/);
});

for (const asset of [
  'assets/img/profile-glynn.jpg',
  'assets/img/adp-project.jpg',
  'assets/img/renewable-project.jpg',
  'assets/img/social-preview.jpg'
]) {
  test(`${asset} exists`, () => assert.equal(existsSync(resolve(root, asset)), true));
}

test('meaningful images have explicit alt text and social preview is local', () => {
  const html = read('index.html');
  assert.match(html, /src="assets\/img\/profile-glynn\.jpg"[^>]*alt="Glynn Williams"/s);
  assert.match(html, /src="assets\/img\/adp-project\.jpg"[^>]*alt="[^"]+"/s);
  assert.match(html, /src="assets\/img\/renewable-project\.jpg"[^>]*alt="[^"]+"/s);
  assert.match(html, /property="og:image" content="https:\/\/weejubya\.github\.io\/Resume\/assets\/img\/social-preview\.jpg"/);
});

test('README documents the exact repository and PowerShell Pages deployment flow', () => {
  const readme = read('README.md');
  for (const phrase of [
    'github.com/WeeJubya/Resume',
    'Set-Location C:\\Dev\\Resume',
    'git branch -M main',
    'git remote add origin https://github.com/WeeJubya/Resume.git',
    'git push -u origin main',
    'Deploy from a branch',
    '/(root)',
    'https://weejubya.github.io/Resume/'
  ]) assert.match(readme, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('mobile navigation remains available without JavaScript and collapses only after JS initialization', () => {
  const css = read('assets/css/styles.css');
  assert.match(css, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.site-nav\s*\{[^}]*display:\s*grid/s);
  assert.match(css, /\.js-ready\s+\.site-nav:not\(\.is-open\)\s*\{[^}]*display:\s*none/s);
  assert.match(css, /\.js-ready\s+\.nav-toggle\s*\{[^}]*display:\s*block/s);
});

test('gold text uses a contrast-safe theme token', () => {
  const css = read('assets/css/styles.css');
  assert.match(css, /--gold-text:\s*#[0-9a-f]{6}/i);
  assert.match(css, /\[data-theme="dark"\][\s\S]*--gold-text:\s*#[0-9a-f]{6}/i);
});
