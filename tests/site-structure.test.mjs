import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const htmlFiles = ['index.html', '404.html'];
const gnuTag = '<meta http-equiv="X-Clacks-Overhead" content="GNU Terry Pratchett" />';
const requiredSections = ['home', 'about', 'what-i-do', 'experience', 'portfolio', 'testimonials', 'contact'];

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
  for (const id of requiredSections) {
    assert.match(html, new RegExp(`id=[\"']tab-${id}[\"']`));
    assert.match(html, new RegExp(`id=[\"']panel-${id}[\"']`));
  }
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
    'Digital Learning Designer',
    'Creative Developer',
    'Instructional Designer',
    'Analyst Developer Programme',
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
  assert.match(html, /aria-label="Portfolio sections"/);
  assert.match(html, /role="tablist"/);
  assert.match(html, /id="theme-toggle"/);
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
  assert.match(html, /id="tab-home"[^>]*role="tab"/s);
  assert.match(html, /id="theme-toggle"[^>]*aria-label=/s);
  assert.match(html, /type="module" src="assets\/js\/app\.js(?:\?v=[^"]+)?"/);
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

test('mobile navigation uses an always-visible horizontally scrollable tab strip', () => {
  const css = read('assets/css/styles.css');
  const html = read('index.html');
  assert.match(css, /\.app-tabs__track\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(html, /role="tablist"/);
  assert.doesNotMatch(html, /id="nav-toggle"/);
});

test('gold text uses a contrast-safe theme token', () => {
  const css = read('assets/css/styles.css');
  assert.match(css, /--gold-text:\s*#[0-9a-f]{6}/i);
  assert.match(css, /\[data-theme="dark"\][\s\S]*--gold-text:\s*#[0-9a-f]{6}/i);
});


test('hero name uses relaxed tracking consistently across breakpoints', () => {
  const css = read('assets/css/styles.css');
  assert.match(css, /\.hero h1\s*\{[^}]*letter-spacing:\s*-\.035em/s);
  const mobileBlocks = [...css.matchAll(/@media\s*\(max-width:[^)]+\)\s*\{([\s\S]*?)\n\}/g)].map((m) => m[1]);
  for (const block of mobileBlocks) {
    const heroRule = block.match(/\.hero h1\s*\{([^}]*)\}/s);
    if (heroRule) assert.doesNotMatch(heroRule[1], /letter-spacing:/);
  }
});

test('hero name uses explicit stacked lines with a safe gap and high-contrast last name', () => {
  const html = read('index.html');
  const css = read('assets/css/styles.css');
  assert.match(html, /<h1[^>]*>\s*<span class="hero-name__first">Glynn<\/span>\s*<span class="hero-name__last">Williams<\/span>\s*<\/h1>/s);
  assert.match(css, /\.hero h1\s*\{[^}]*display:\s*grid[^}]*row-gap:\s*\.12em/s);
  assert.match(css, /\.hero-name__last\s*\{[^}]*color:\s*var\(--primary-bright\)/s);
});

test('decorative hero rail is removed from layout so it cannot underlay copy', () => {
  const css = read('assets/css/styles.css');
  assert.match(css, /\.hero\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.25fr\)\s+minmax\(310px,\s*\.75fr\)\s+minmax\(250px,\s*\.52fr\)/s);
  assert.match(css, /\.hero-rail\s*\{[^}]*display:\s*none/s);
});

test('homepage assets use a versioned URL so CSS and JS updates bypass stale browser caches', () => {
  const html = read('index.html');
  assert.match(html, /href="assets\/css\/styles\.css\?v=20261015-3"/);
  assert.match(html, /href="assets\/css\/module\.css\?v=20261015-3"/);
  assert.match(html, /src="assets\/js\/app\.js\?v=20261015-3"/);
});

test('eLearning Development keeps the approved authoring order and descriptions', () => {
  const html = read('index.html');
  const cluster = html.match(/<article class="skill-cluster future-panel">[\s\S]*?<h3>eLearning Development<\/h3>[\s\S]*?<\/article>/)?.[0] ?? '';
  const expected = [
    ['Adobe Captivate', 'Accessible authoring'],
    ['eLB Lectora', 'Interactive eLearning'],
    ['Articulate Storyline', 'Scenario-based learning']
  ];
  let cursor = -1;
  for (const [tool, description] of expected) {
    const toolIndex = cluster.indexOf(tool);
    assert.ok(toolIndex > cursor, `${tool} should appear in the approved order`);
    assert.ok(cluster.includes(`<strong>${tool}</strong><span>${description}</span>`));
    cursor = toolIndex;
  }
});

test('Creative Media prioritises After Effects and Technical Development includes scripting and programming', () => {
  const html = read('index.html');
  const creative = html.match(/<article class="skill-cluster future-panel">[\s\S]*?<h3>Creative Media<\/h3>[\s\S]*?<\/article>/)?.[0] ?? '';
  const creativeOrder = ['After Effects', 'Photoshop', 'Premiere Pro', 'Illustrator', 'Adobe Audition', 'DaVinci Resolve'];
  let creativeCursor = -1;
  for (const tool of creativeOrder) {
    const index = creative.indexOf(tool);
    assert.ok(index > creativeCursor, `${tool} should appear in the approved Creative Media order`);
    creativeCursor = index;
  }
  assert.match(creative, /Adobe Audition<\/strong><span>Audio editing &amp; cleanup<\/span>/);

  const development = html.match(/<article class="skill-cluster future-panel">[\s\S]*?<h3>Technical &amp; Development<\/h3>[\s\S]*?<\/article>/)?.[0] ?? '';
  assert.match(development, /VBS \/ VBA Scripting<\/strong><span>Workflow automation<\/span>/);
  assert.match(development, /Visual Basic &amp; C Programming<\/strong><span>Application &amp; systems development<\/span>/);

  const css = read('assets/css/styles.css');
  assert.match(css, /\.what-i-do-section \.skills-dashboard\s*\{[^}]*grid-template-columns:\s*repeat\(2,/s);
});
