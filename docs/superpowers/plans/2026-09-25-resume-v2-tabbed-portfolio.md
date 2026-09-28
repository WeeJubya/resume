# Resume V2 Tabbed Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the V1 long-scroll portfolio with a seven-tab application-style interface and add a source-grounded, near-full-screen Renewable Energy learning-module demonstration with an 80% pass mark.

**Architecture:** Keep deployment dependency-free and static for GitHub Pages. Split stateful behaviour into small ES modules: `tabs.js` owns hash/tab state, `renewable-module.js` owns module progression and modal wiring, `quiz.js` owns question selection/matching/scoring, and `app.js` owns site boot/theme integration. HTML remains readable without JavaScript; JavaScript progressively applies tab hiding and interactive module behaviour.

**Tech Stack:** HTML5, CSS custom properties, vanilla ES modules, Web Storage when available, Node.js built-in `node:test` + `assert/strict`, Git/GitHub Pages. No npm runtime dependencies and no build step.

**Spec:** `docs/superpowers/specs/2026-09-25-resume-v2-tabbed-portfolio-design.md`

## Global Constraints

- Repository: `github.com/WeeJubya/Resume`; GitHub Pages project path is `/Resume/`.
- Deployment remains a dependency-free static site; no backend, database, framework, bundler, or runtime package dependency.
- Preserve V1 visual identity: command-burgundy light mode, science-blue dark mode, gold used sparingly, rounded future-console geometry.
- Preserve the current public-safe privacy boundary: no private mobile number, referee details, restricted samples, or wholesale source documents.
- Preserve theme preference using local storage, but handle storage access throwing or being unavailable.
- Renewable Energy instructional copy comes from the supplied eLearning Portfolio storyboard. Do not silently modernise, fact-check, expand, or replace it with outside content.
- The ten quiz questions must be derived only from facts taught in that storyboard.
- Knowledge-check score is out of 10: five selected questions worth one point each + five matching pairs worth one point each. Passing is `>= 8/10` (80%).
- Learning-module progress is session-only and resets on refresh/exit/restart.
- Every HTML document retains `<meta http-equiv="X-Clacks-Overhead" content="GNU Terry Pratchett" />`.
- All local asset URLs remain relative and GitHub Pages-safe.
- Core résumé/portfolio content remains readable with JavaScript disabled.
- Target WCAG 2.2 AA behaviour where practical, including keyboard tabs, modal focus handling, reduced motion, touch-equivalent matching, and non-colour-only states.
- Before publishing V2, preserve the current V1 commit with tag `v1.0`; recommend tag `v2.0` only after user acceptance.
- User-facing Git commands in README use Developer PowerShell and begin from `C:\Dev\Resume`.

## File Structure

The implementation will use these responsibilities:

```text
index.html                         # semantic tab panels, portfolio hub, module shell, no-JS content
404.html                           # existing not-found page + required metadata
assets/css/styles.css              # site shell, tabs, theme, responsive rules
assets/css/module.css              # Renewable Energy module, dialog, quiz, matching, result states
assets/js/app.js                   # boot, theme persistence, integration orchestration
assets/js/tabs.js                  # hash/tab state + keyboard navigation
assets/js/renewable-content.js     # supplied storyboard copy + source-grounded data constants
assets/js/renewable-module.js      # learning-module state machine + modal/module DOM controller
assets/js/quiz.js                  # 10-question bank, 5-question attempts, matching, scoring/review
assets/img/...                     # existing public-safe optimised images only
tests/static.test.mjs              # HTML/meta/privacy/path/no-JS regression checks
tests/tabs.test.mjs                # tab/hash/keyboard pure-state tests
tests/module.test.mjs              # module progression/completion/scoring integration state tests
tests/quiz.test.mjs                # question bank/selection/scoring/retry/review tests
README.md                          # V2 architecture + Developer PowerShell deployment/tagging workflow
.nojekyll
robots.txt
sitemap.xml
docs/superpowers/specs/...
docs/superpowers/plans/...
```

## Review Focus

1. **No-JavaScript content visibility:** all seven résumé panels remain readable because source HTML does not pre-hide tab panels; JavaScript applies `hidden` only after boot. Task 2 adds a static regression test for this.
2. **Hash/history churn:** unknown hashes, repeated selection and `popstate`/`hashchange` must never leave all panels hidden. Task 2 tests hash normalisation and idempotent activation.
3. **Modal focus escape:** repeated open/close, Escape, backdrop close and module exit must restore focus to a valid control. Task 5 adds controller/state tests plus static accessibility assertions.
4. **Quiz edge states:** unanswered questions and incomplete matching must block submission rather than silently scoring blanks. Task 6 tests validation before score calculation.
5. **Touch/keyboard matching:** the select-and-place path is the canonical completion mechanism; drag-and-drop is enhancement only. Task 6 tests matching entirely without pointer events.

---

### Task 1: Preserve V1 and establish the dependency-free test harness

**Files:**
- Create: `tests/static.test.mjs`
- Modify: `README.md`
- Preserve in Git: current V1 commit tagged `v1.0` before V2 publication

**Interfaces:**
- Consumes: current V1 repository state.
- Produces: a built-in Node test command (`node --test tests/*.test.mjs`) and a documented V1 tag procedure that every later task can use as the regression gate.

- [ ] **Step 1: Verify the repository is clean before any V2 edit**

Run in Developer PowerShell:

```powershell
Set-Location C:\Dev\Resume
git status --short
git log -1 --oneline
```

Expected: no uncommitted V1 files. If `git status --short` is non-empty, stop and commit/stash intentionally before tagging.

- [ ] **Step 2: Preserve the exact V1 commit locally with an annotated tag**

```powershell
Set-Location C:\Dev\Resume
git tag -a v1.0 -m "Resume portfolio V1"
git tag --list v1.0
```

Expected: output contains exactly `v1.0`. Do not move an existing `v1.0` tag; if it already exists, verify it points at the current V1 commit with `git show --no-patch v1.0`.

- [ ] **Step 3: Write the first failing static regression test**

Create `tests/static.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

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
```

- [ ] **Step 4: Run the test and establish the baseline**

```powershell
Set-Location C:\Dev\Resume
node --test tests\static.test.mjs
```

Expected: the existing clacks/privacy/path checks PASS. If Node is absent, install a current LTS Node release before implementation; do not introduce npm packages.

- [ ] **Step 5: Add the V1 tag and test command to README**

Add this exact release-preservation block:

```markdown
## Preserve V1 before publishing V2

From Developer PowerShell:

```powershell
Set-Location C:\Dev\Resume
git status --short
git tag -a v1.0 -m "Resume portfolio V1"
git push origin v1.0
```

Only run the tag command while `HEAD` is the accepted V1 commit. If `v1.0` already exists, verify it instead of recreating it.

## Run the tests

```powershell
Set-Location C:\Dev\Resume
node --test tests\*.test.mjs
```
```

- [ ] **Step 6: Run the full current test suite**

```powershell
Set-Location C:\Dev\Resume
node --test tests\*.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 7: Commit the harness/docs change**

```powershell
Set-Location C:\Dev\Resume
git add tests\static.test.mjs README.md
git commit -m "test: establish V2 regression harness"
```

---

### Task 2: Convert the long-scroll site into accessible hash-driven tabs

**Files:**
- Create: `assets/js/tabs.js`
- Create: `tests/tabs.test.mjs`
- Modify: `index.html`
- Modify: `assets/css/styles.css`
- Modify: `assets/js/app.js` (create it if V1 currently uses another bootstrap file; update `index.html` to reference `app.js` only)
- Modify: `tests/static.test.mjs`

**Interfaces:**
- Consumes: seven panel IDs: `home`, `about`, `experience`, `portfolio`, `skills`, `testimonials`, `contact`.
- Produces: `TAB_IDS`, `normaliseTabId(hash)`, `nextFocusedIndex(index,key,count)`, `createTabsController(root, win)`, and a boot contract used by `app.js`.

- [ ] **Step 1: Write failing unit tests for hash and keyboard behaviour**

Create `tests/tabs.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { TAB_IDS, normaliseTabId, nextFocusedIndex } from '../assets/js/tabs.js';

test('tab order is the approved seven-tab order', () => {
  assert.deepEqual(TAB_IDS, ['home', 'about', 'experience', 'portfolio', 'skills', 'testimonials', 'contact']);
});

test('missing or unknown hash resolves to home', () => {
  assert.equal(normaliseTabId(''), 'home');
  assert.equal(normaliseTabId('#'), 'home');
  assert.equal(normaliseTabId('#nonsense'), 'home');
});

test('valid hash resolves to its tab id case-insensitively', () => {
  assert.equal(normaliseTabId('#portfolio'), 'portfolio');
  assert.equal(normaliseTabId('#SKILLS'), 'skills');
});

test('arrow, Home and End keys move focus with wraparound', () => {
  assert.equal(nextFocusedIndex(0, 'ArrowLeft', 7), 6);
  assert.equal(nextFocusedIndex(6, 'ArrowRight', 7), 0);
  assert.equal(nextFocusedIndex(3, 'Home', 7), 0);
  assert.equal(nextFocusedIndex(3, 'End', 7), 6);
  assert.equal(nextFocusedIndex(2, 'x', 7), 2);
});
```

- [ ] **Step 2: Run the tab tests and verify RED**

```powershell
Set-Location C:\Dev\Resume
node --test tests\tabs.test.mjs
```

Expected: FAIL because `assets/js/tabs.js` does not exist yet.

- [ ] **Step 3: Implement the pure tab helpers and DOM controller**

Create `assets/js/tabs.js`:

```js
export const TAB_IDS = Object.freeze([
  'home', 'about', 'experience', 'portfolio', 'skills', 'testimonials', 'contact'
]);

export function normaliseTabId(hash = '') {
  const candidate = String(hash).replace(/^#/, '').trim().toLowerCase();
  return TAB_IDS.includes(candidate) ? candidate : 'home';
}

export function nextFocusedIndex(index, key, count) {
  if (key === 'ArrowRight') return (index + 1) % count;
  if (key === 'ArrowLeft') return (index - 1 + count) % count;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  return index;
}

export function createTabsController(root = document, win = window) {
  const tabs = [...root.querySelectorAll('[role="tab"][data-tab]')];
  const panels = new Map([...root.querySelectorAll('[role="tabpanel"][data-panel]')]
    .map((panel) => [panel.dataset.panel, panel]));

  const activate = (id, { push = true, focus = false } = {}) => {
    const activeId = TAB_IDS.includes(id) ? id : 'home';
    for (const tab of tabs) {
      const selected = tab.dataset.tab === activeId;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    }
    for (const [panelId, panel] of panels) panel.hidden = panelId !== activeId;
    if (push && win.location.hash !== `#${activeId}`) win.history.pushState({ tab: activeId }, '', `#${activeId}`);
    return activeId;
  };

  for (const [index, tab] of tabs.entries()) {
    tab.addEventListener('click', () => activate(tab.dataset.tab));
    tab.addEventListener('keydown', (event) => {
      const targetIndex = nextFocusedIndex(index, event.key, tabs.length);
      if (targetIndex !== index) {
        event.preventDefault();
        tabs[targetIndex].focus();
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate(tab.dataset.tab);
      }
    });
  }

  const syncFromLocation = () => activate(normaliseTabId(win.location.hash), { push: false });
  win.addEventListener('popstate', syncFromLocation);
  win.addEventListener('hashchange', syncFromLocation);
  const initial = syncFromLocation();

  return { activate, syncFromLocation, tabs, panels, initial };
}
```

- [ ] **Step 4: Run the tab tests and verify GREEN**

```powershell
Set-Location C:\Dev\Resume
node --test tests\tabs.test.mjs
```

Expected: 4 tests PASS.

- [ ] **Step 5: Rebuild `index.html` navigation/panel semantics without pre-hiding content**

Replace the V1 anchor navigation with this structural pattern (retain existing content inside the matching panels):

```html
<nav class="app-tabs" aria-label="Portfolio sections">
  <div class="app-tabs__track" role="tablist" aria-label="Portfolio sections">
    <button id="tab-home" role="tab" data-tab="home" aria-controls="panel-home" aria-selected="true" tabindex="0">Home</button>
    <button id="tab-about" role="tab" data-tab="about" aria-controls="panel-about" aria-selected="false" tabindex="-1">About</button>
    <button id="tab-experience" role="tab" data-tab="experience" aria-controls="panel-experience" aria-selected="false" tabindex="-1">Experience</button>
    <button id="tab-portfolio" role="tab" data-tab="portfolio" aria-controls="panel-portfolio" aria-selected="false" tabindex="-1">Portfolio</button>
    <button id="tab-skills" role="tab" data-tab="skills" aria-controls="panel-skills" aria-selected="false" tabindex="-1">Skills</button>
    <button id="tab-testimonials" role="tab" data-tab="testimonials" aria-controls="panel-testimonials" aria-selected="false" tabindex="-1">Testimonials</button>
    <button id="tab-contact" role="tab" data-tab="contact" aria-controls="panel-contact" aria-selected="false" tabindex="-1">Contact</button>
  </div>
</nav>

<main id="main-content" class="app-panels">
  <section id="panel-home" class="tab-panel" role="tabpanel" aria-labelledby="tab-home" data-panel="home">...</section>
  <section id="panel-about" class="tab-panel" role="tabpanel" aria-labelledby="tab-about" data-panel="about">...</section>
  <section id="panel-experience" class="tab-panel" role="tabpanel" aria-labelledby="tab-experience" data-panel="experience">...</section>
  <section id="panel-portfolio" class="tab-panel" role="tabpanel" aria-labelledby="tab-portfolio" data-panel="portfolio">...</section>
  <section id="panel-skills" class="tab-panel" role="tabpanel" aria-labelledby="tab-skills" data-panel="skills">...</section>
  <section id="panel-testimonials" class="tab-panel" role="tabpanel" aria-labelledby="tab-testimonials" data-panel="testimonials">...</section>
  <section id="panel-contact" class="tab-panel" role="tabpanel" aria-labelledby="tab-contact" data-panel="contact">...</section>
</main>
```

Critical rule: do **not** add `hidden` to inactive panels in source HTML. That attribute is applied by JavaScript only after boot, preserving no-JS readability.

- [ ] **Step 6: Add static tests for all seven tabs and no-JS visibility**

Append to `tests/static.test.mjs`:

```js
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
```

- [ ] **Step 7: Add the tab-strip CSS and retire hamburger-only mobile navigation**

In `assets/css/styles.css`, implement:

```css
.app-tabs { min-width: 0; overflow: hidden; }
.app-tabs__track {
  display: flex;
  gap: .35rem;
  overflow-x: auto;
  scrollbar-width: thin;
  overscroll-behavior-inline: contain;
  padding: .25rem;
}
.app-tabs [role="tab"] {
  min-height: 44px;
  flex: 0 0 auto;
  border: 1px solid transparent;
  border-radius: 13px;
  padding: .65rem .9rem;
  background: transparent;
  color: var(--text-muted);
  font: inherit;
  font-size: .75rem;
  font-weight: 800;
  letter-spacing: .05em;
  text-transform: uppercase;
  cursor: pointer;
}
.app-tabs [role="tab"][aria-selected="true"] {
  color: var(--text);
  border-color: var(--line-strong);
  background: color-mix(in srgb, var(--primary) 13%, transparent);
  box-shadow: inset 0 -3px var(--gold);
}
.tab-panel[hidden] { display: none !important; }
.tab-panel { animation: panel-redraw .18s ease both; }
@keyframes panel-redraw { from { opacity: .55; transform: translateY(3px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .tab-panel { animation: none; } }
```

Remove mobile CSS that requires opening a hamburger to reach primary sections. On small screens the `.app-tabs__track` remains visible and scrollable.

- [ ] **Step 8: Create/update `assets/js/app.js` to boot tabs and safe theme persistence**

Use:

```js
import { createTabsController } from './tabs.js';

const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* preference is non-essential */ } }
};

function applyTheme(theme) {
  const value = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = value;
  const button = document.querySelector('#theme-toggle');
  if (button) button.setAttribute('aria-label', `Switch to ${value === 'dark' ? 'light' : 'dark'} theme`);
  return value;
}

function boot() {
  createTabsController(document, window);
  let theme = applyTheme(storage.get('resume-theme') || document.documentElement.dataset.theme);
  document.querySelector('#theme-toggle')?.addEventListener('click', () => {
    theme = applyTheme(theme === 'dark' ? 'light' : 'dark');
    storage.set('resume-theme', theme);
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
```

Ensure `index.html` references only relative `assets/js/app.js` as a module.

- [ ] **Step 9: Run all tests**

```powershell
Set-Location C:\Dev\Resume
node --test tests\*.test.mjs
```

Expected: all static + tab tests PASS.

- [ ] **Step 10: Commit the tabbed shell**

```powershell
Set-Location C:\Dev\Resume
git add index.html assets\css\styles.css assets\js\app.js assets\js\tabs.js tests\static.test.mjs tests\tabs.test.mjs
git commit -m "feat: replace scrolling layout with accessible tabs"
```

---

### Task 3: Build the Portfolio workspace and source-grounded Renewable content data

**Files:**
- Create: `assets/js/renewable-content.js`
- Modify: `index.html`
- Modify: `assets/css/styles.css`
- Modify: `tests/static.test.mjs`

**Interfaces:**
- Consumes: approved source-derived Renewable Energy text from the supplied portfolio storyboard and existing ADP content.
- Produces: `RENEWABLE_TYPES`, `CLIMATE_IMPACTS`, `UK_CONTENT`, `AVONMOUTH_CASE_STUDY`, `LEARNING_OBJECTIVES`; DOM hooks `#launch-renewable-module` and `#renewable-module` for Task 5.

- [ ] **Step 1: Write a failing static Portfolio-content test**

Append to `tests/static.test.mjs`:

```js
test('Portfolio exposes ADP and Renewable Energy projects plus a launch control', () => {
  const html = read('index.html');
  assert.match(html, /Analyst Developer Programme/i);
  assert.match(html, /Renewable Energy/i);
  assert.match(html, /id=["']launch-renewable-module["']/i);
  assert.match(html, /Launch Interactive Case Study/i);
});
```

- [ ] **Step 2: Run static test and verify RED**

```powershell
Set-Location C:\Dev\Resume
node --test tests\static.test.mjs
```

Expected: FAIL on the missing V2 launch control/project-hub structure.

- [ ] **Step 3: Create the authoritative content constants**

Create `assets/js/renewable-content.js` with these source-grounded values:

```js
export const LEARNING_OBJECTIVES = Object.freeze([
  'Identify the main types of renewable energy',
  'Describe how renewable energy benefits the world climate',
  'Recognise renewable initiatives in the UK'
]);

export const RENEWABLE_TYPES = Object.freeze([
  {
    id: 'solar',
    name: 'Solar Energy',
    description: "Solar energy is the radiant energy from the sun that can be converted into usable forms of energy, primarily electricity and heat. It's a renewable and sustainable energy source, meaning it's naturally replenished and won't run out, making it a key part of the transition to cleaner energy."
  },
  {
    id: 'wind',
    name: 'Wind Energy',
    description: 'Wind energy is a renewable energy source where wind turbines convert the kinetic energy of wind into electricity. This is achieved by using wind to turn the blades of a turbine, which then rotates a generator to produce power, which makes wind energy a clean and sustainable way to generate electricity.'
  },
  {
    id: 'hydro',
    name: 'Hydropower',
    description: 'Hydropower is a renewable energy source that generates electricity by harnessing the power of moving water. It utilizes the kinetic energy of water, often from rivers or reservoirs, to spin turbines connected to generators, producing electricity. This process is a sustainable way to produce power as it relies on the continuous water cycle.'
  },
  {
    id: 'biomass',
    name: 'Biomass Energy',
    description: "Biomass energy is the energy derived from burning organic matter, like wood, crops, and animal waste, to produce heat or electricity. It's a renewable energy source because the organic materials can be replenished naturally."
  },
  {
    id: 'geothermal',
    name: 'Geothermal Energy',
    description: "Geothermal energy is heat derived from the Earth's interior. It's a renewable energy source that uses the Earth's natural heat, often from hot water or steam reservoirs, to generate electricity or for direct heating applications."
  }
]);

export const CLIMATE_IMPACTS = Object.freeze([
  'Renewable energy sources emit little-to-no greenhouse gases.',
  'Replacing fossil fuels with renewables can slow global warming and reduce air pollution.',
  'Unlike fossil fuels, renewables don’t deplete natural resources, ensuring long-term sustainability.',
  'Greater use of renewables reduces dependence on volatile global energy markets, improving energy security.'
]);

export const CLIMATE_FACTOID = 'According to the IEA, renewables could cut global energy-related CO₂ emissions by 70% by 2050.';

export const UK_CONTENT = Object.freeze([
  'The UK now generates over 40% of electricity from renewable sources.',
  'Offshore wind farms and solar projects are reducing carbon emissions and improving air quality.',
  'The UK’s commitment to net zero by 2050 relies heavily on expanding renewable infrastructure.',
  'Local projects create green jobs, revitalise rural areas, and support sustainable communities.'
]);

export const AVONMOUTH_CASE_STUDY = Object.freeze({
  title: 'Avonmouth Wind Farm',
  paragraphs: [
    'Four wind turbines just a hop, skip and a jump from Bristol.',
    'This 8.2MW wind farm is located in the grounds of Wessex Water’s wastewater treatment plant adjacent to one of Europe’s largest dock areas with uninterrupted winds and great transport links.',
    'Since the site became operational in 2013, the site has generated over 150,000MWH of energy, which is more than 45,000 UK homes.',
    'Avonmouth is managed by Thrive Renewables, and is one of 20 operational, and 12 under-construction, renewable energy projects running in the UK.'
  ]
});
```

Do not alter the instructional claims while implementing V2; this is a portfolio reproduction of the supplied storyboard.

- [ ] **Step 4: Rebuild the Portfolio panel as a two-project workspace**

Inside `#panel-portfolio`, use a project-card layout with:

```html
<div class="portfolio-workspace">
  <article class="project-card future-panel" aria-labelledby="adp-title">
    <p class="eyebrow">Case Study · Programme Design</p>
    <h2 id="adp-title">Analyst Developer Programme</h2>
    <p>Consistent, structured training for new analysts, combining internal subject expertise with an external training provider.</p>
    <div class="project-detail-grid">
      <!-- retain V1 purpose, audience, tools, process, impact and reflection content -->
    </div>
  </article>

  <article class="project-card project-card--interactive future-panel" aria-labelledby="renewable-title">
    <p class="eyebrow">Interactive Sample · Instructional Design</p>
    <h2 id="renewable-title">Renewable Energy</h2>
    <p>A working reconstruction of the storyboard sample: explore content, open the Avonmouth case study, then complete the knowledge check.</p>
    <button class="control-button control-button--primary" id="launch-renewable-module" type="button">Launch Interactive Case Study</button>
    <noscript><p class="noscript-note">JavaScript is required to launch the interactive learning demonstration. The surrounding portfolio content remains available.</p></noscript>
  </article>
</div>
```

Retain the complete ADP case-study substance from V1 rather than reducing it to the three-line card summary.

- [ ] **Step 5: Add Portfolio workspace styling**

Add responsive `.portfolio-workspace`, `.project-card`, `.project-detail-grid`, and `.control-button` rules to `styles.css`: two columns on wide screens, one column below 800px, minimum 44px control height, same theme tokens as V1.

- [ ] **Step 6: Run static tests**

```powershell
Set-Location C:\Dev\Resume
node --test tests\static.test.mjs
```

Expected: Portfolio-content test now PASS.

- [ ] **Step 7: Commit the Portfolio/data foundation**

```powershell
Set-Location C:\Dev\Resume
git add index.html assets\css\styles.css assets\js\renewable-content.js tests\static.test.mjs
git commit -m "feat: build V2 portfolio project workspace"
```

---

### Task 4: Implement the Renewable learning-module state machine and progression gates

**Files:**
- Create: `assets/js/renewable-module.js`
- Create: `tests/module.test.mjs`
- Modify: `assets/js/app.js`

**Interfaces:**
- Consumes: renewable type IDs from `renewable-content.js` and six screen indexes `0..5`.
- Produces: `createModuleState()`, `viewRenewableType(state,id)`, `viewClimateImpact(state,index)`, `markAvonmouthOpened(state)`, `canAdvance(state)`, `advance(state)`, `goBack(state)`, `resetModuleState(state)`.

- [ ] **Step 1: Write failing progression/state tests**

Create `tests/module.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createModuleState, viewRenewableType, viewClimateImpact, markAvonmouthOpened,
  canAdvance, advance, goBack, resetModuleState
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
```

- [ ] **Step 2: Run and verify RED**

```powershell
Set-Location C:\Dev\Resume
node --test tests\module.test.mjs
```

Expected: FAIL because `renewable-module.js` does not exist.

- [ ] **Step 3: Implement minimal state-machine functions**

Create `assets/js/renewable-module.js` with:

```js
const TYPE_IDS = new Set(['solar','wind','hydro','biomass','geothermal']);
const LAST_SCREEN = 5;

export function createModuleState() {
  return {
    screen: 0,
    viewedTypes: new Set(),
    viewedImpacts: new Set(),
    avonmouthOpened: false,
    attempt: null,
    result: null
  };
}

export function viewRenewableType(state, id) {
  if (TYPE_IDS.has(id)) state.viewedTypes.add(id);
  return state;
}

export function viewClimateImpact(state, index) {
  if (Number.isInteger(index) && index >= 0 && index < 4) state.viewedImpacts.add(index);
  return state;
}

export function markAvonmouthOpened(state) { state.avonmouthOpened = true; return state; }

export function canAdvance(state) {
  if (state.screen === 1) return state.viewedTypes.size === 5;
  if (state.screen === 2) return state.viewedImpacts.size === 4;
  if (state.screen === 3) return state.avonmouthOpened;
  if (state.screen === 4) return Boolean(state.result);
  return state.screen < LAST_SCREEN;
}

export function advance(state) {
  if (canAdvance(state)) state.screen = Math.min(LAST_SCREEN, state.screen + 1);
  return state;
}

export function goBack(state) { state.screen = Math.max(0, state.screen - 1); return state; }

export function resetModuleState(state) {
  Object.assign(state, createModuleState());
  return state;
}
```

- [ ] **Step 4: Run state tests and verify GREEN**

```powershell
Set-Location C:\Dev\Resume
node --test tests\module.test.mjs
```

Expected: 5 tests PASS.

- [ ] **Step 5: Export a DOM controller skeleton for integration**

Extend `renewable-module.js` with a `createRenewableModuleController({ root, launchButton, onExit })` function that:

- creates one `state = createModuleState()` per launch,
- sets `root.hidden = false` on launch,
- stores `document.activeElement` before launch,
- sets `document.body.dataset.moduleOpen = 'true'`,
- renders the active screen,
- disables Back at screen `0`,
- disables Next when `canAdvance(state)` is false,
- on Exit resets state, hides module, removes `data-module-open`, calls `onExit?.()`, and focuses the launch button.

Do not build quiz internals yet; screen 4 can render a temporary empty container whose final implementation arrives in Task 6.

- [ ] **Step 6: Wire controller creation from `app.js` only when hooks exist**

Add:

```js
import { createRenewableModuleController } from './renewable-module.js';

// inside boot()
const launchButton = document.querySelector('#launch-renewable-module');
const moduleRoot = document.querySelector('#renewable-module');
if (launchButton && moduleRoot) {
  createRenewableModuleController({ root: moduleRoot, launchButton });
}
```

- [ ] **Step 7: Run full suite**

```powershell
Set-Location C:\Dev\Resume
node --test tests\*.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 8: Commit state-machine foundation**

```powershell
Set-Location C:\Dev\Resume
git add assets\js\renewable-module.js assets\js\app.js tests\module.test.mjs
git commit -m "feat: add Renewable module progression state"
```

---

### Task 5: Build the full-screen module UI, five type interactions, climate reveals, and accessible Avonmouth modal

**Files:**
- Create: `assets/css/module.css`
- Modify: `index.html`
- Modify: `assets/js/renewable-module.js`
- Modify: `tests/static.test.mjs`
- Modify: `tests/module.test.mjs`

**Interfaces:**
- Consumes: Task 3 content constants and Task 4 state-machine functions.
- Produces: complete module DOM UI; `#avonmouth-dialog`, `#open-avonmouth`, `.renewable-type-control`, `.climate-reveal`, module Back/Next/Exit controls.

- [ ] **Step 1: Write failing static accessibility/UI tests**

Append to `tests/static.test.mjs`:

```js
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
  assert.doesNotMatch(html, /(?:src|href)=["']\/assets\//i);
});
```

- [ ] **Step 2: Run static tests and verify RED**

```powershell
Set-Location C:\Dev\Resume
node --test tests\static.test.mjs
```

Expected: FAIL because the module/dialog shell does not exist.

- [ ] **Step 3: Add the near-full-screen module shell to `index.html`**

Place it after the seven primary panels so no-JS résumé content remains independent:

```html
<section class="learning-module" id="renewable-module" aria-label="Renewable Energy interactive case study" hidden>
  <header class="learning-module__header">
    <div>
      <p class="eyebrow">Interactive Sample · Renewable Energy</p>
      <p id="module-section-label" class="module-section-label">01 · Welcome</p>
    </div>
    <button id="module-exit" class="control-button" type="button">Exit to Portfolio</button>
  </header>

  <div id="module-stage" class="learning-module__stage" tabindex="-1"></div>

  <footer class="learning-module__nav" aria-label="Module navigation">
    <button id="module-back" class="control-button" type="button">Back</button>
    <div class="module-progress" aria-label="Module progress"><span id="module-progress-text">1 of 6</span><span class="module-progress__bar"><span id="module-progress-fill"></span></span></div>
    <button id="module-next" class="control-button control-button--primary" type="button">Next</button>
  </footer>
</section>

<div class="dialog-backdrop" id="avonmouth-backdrop" hidden>
  <section id="avonmouth-dialog" class="case-dialog" role="dialog" aria-modal="true" aria-labelledby="avonmouth-title" tabindex="-1">
    <p class="eyebrow">Case Study</p>
    <h2 id="avonmouth-title">Avonmouth Wind Farm</h2>
    <div id="avonmouth-copy"></div>
    <button id="close-avonmouth" class="control-button control-button--primary" type="button">Close</button>
  </section>
</div>
```

Also include `<link rel="stylesheet" href="assets/css/module.css">` in `<head>`.

- [ ] **Step 4: Implement `module.css` responsive full-screen presentation**

Required behaviour:

```css
.learning-module {
  position: fixed;
  inset: 10px;
  z-index: 400;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  background: var(--page-bg);
  color: var(--text);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-xl);
  box-shadow: 0 35px 110px rgba(0,0,0,.32);
  overflow: hidden;
}
.learning-module[hidden], .dialog-backdrop[hidden] { display: none !important; }
.learning-module__header, .learning-module__nav { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 1.25rem; background: var(--panel-strong); }
.learning-module__stage { overflow-y: auto; padding: clamp(1.25rem, 4vw, 4rem); }
.module-progress { min-width: min(36vw, 420px); display: grid; gap: .35rem; text-align: center; }
.module-progress__bar { height: 5px; overflow: hidden; border-radius: 99px; background: var(--line); }
.module-progress__bar > span { display: block; height: 100%; width: 16.666%; background: linear-gradient(90deg, var(--primary), var(--gold)); transition: width .2s ease; }
.renewable-type-grid { display: grid; grid-template-columns: repeat(5, minmax(0,1fr)); gap: .75rem; }
.renewable-type-control, .climate-reveal { min-height: 44px; }
.dialog-backdrop { position: fixed; inset: 0; z-index: 500; display: grid; place-items: center; padding: 1rem; background: rgba(0,0,0,.62); }
.case-dialog { width: min(720px, 100%); max-height: min(84vh, 800px); overflow-y: auto; padding: clamp(1.25rem, 4vw, 2.5rem); border-radius: var(--radius-xl); background: var(--panel-strong); border: 1px solid var(--line-strong); }
@media (max-width: 760px) {
  .learning-module { inset: 0; border-radius: 0; }
  .learning-module__header { align-items: flex-start; }
  .learning-module__nav { position: sticky; bottom: 0; }
  .renewable-type-grid { grid-template-columns: 1fr; }
  .module-progress { min-width: 0; flex: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .module-progress__bar > span { transition: none; }
}
```

- [ ] **Step 5: Implement screen renderers in `renewable-module.js`**

Import the content constants and add screen renderers with these exact behaviours:

- Screen 0 renders intro + all three `LEARNING_OBJECTIVES`.
- Screen 1 renders all five `RENEWABLE_TYPES` as buttons and one detail panel. Clicking a type calls `viewRenewableType`, adds a viewed marker, updates the detail text, and enables Next only when all five have been viewed.
- Screen 2 renders the four `CLIMATE_IMPACTS` as reveal buttons/cards and the distinct `CLIMATE_FACTOID`; opening all four enables Next.
- Screen 3 renders every string in `UK_CONTENT` plus `<button id="open-avonmouth">View Case Study</button>`; opening the case study calls `markAvonmouthOpened`.
- Screen 4 reserves `<div id="knowledge-check"></div>` for Task 6.
- Screen 5 reserves `<div id="module-results" aria-live="polite"></div>` for Task 7.

After each interaction call one `syncControls()` that updates Back/Next disabled state, progress label, progress fill and current screen label.

- [ ] **Step 6: Implement dialog focus management and add a pure helper test**

Append to `tests/module.test.mjs`:

```js
import { nextDialogFocusIndex } from '../assets/js/renewable-module.js';

test('dialog focus index wraps in both directions', () => {
  assert.equal(nextDialogFocusIndex(0, -1, 3), 2);
  assert.equal(nextDialogFocusIndex(2, 1, 3), 0);
  assert.equal(nextDialogFocusIndex(1, 1, 3), 2);
});
```

Implement:

```js
export function nextDialogFocusIndex(index, delta, count) {
  return (index + delta + count) % count;
}
```

Dialog controller requirements:

- on open, populate all `AVONMOUTH_CASE_STUDY.paragraphs`, show backdrop, save opener, focus dialog/first focusable;
- handle `Escape` to close;
- on `Tab`, cycle focus among focusable controls using `nextDialogFocusIndex`;
- close on explicit Close button and backdrop click when `event.target === backdrop`;
- restore focus to `#open-avonmouth`;
- while open, set the module stage inert (`stage.inert = true`) and remove inert on close.

- [ ] **Step 7: Run static + module tests**

```powershell
Set-Location C:\Dev\Resume
node --test tests\static.test.mjs tests\module.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 8: Run the full suite**

```powershell
Set-Location C:\Dev\Resume
node --test tests\*.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 9: Commit the interactive content screens/modal**

```powershell
Set-Location C:\Dev\Resume
git add index.html assets\css\module.css assets\js\renewable-module.js tests\static.test.mjs tests\module.test.mjs
git commit -m "feat: build Renewable interactive content module"
```

---

### Task 6: Implement the ten-question bank, five-question attempts, accessible matching, validation and deterministic scoring

**Files:**
- Create: `assets/js/quiz.js`
- Create: `tests/quiz.test.mjs`
- Modify: `assets/js/renewable-module.js`
- Modify: `assets/css/module.css`

**Interfaces:**
- Consumes: the exact source-grounded facts in `renewable-content.js`.
- Produces: `QUESTION_BANK`, `MATCHING_PAIRS`, `createAttempt(random)`, `answerQuestion(attempt,id,value)`, `placeMatch(attempt,typeId,descriptionId)`, `validateAttempt(attempt)`, `scoreAttempt(attempt)`, `createReview(attempt)`.

- [ ] **Step 1: Write the failing quiz tests**

Create `tests/quiz.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  QUESTION_BANK, MATCHING_PAIRS, createAttempt, answerQuestion, placeMatch,
  validateAttempt, scoreAttempt, createReview
} from '../assets/js/quiz.js';

test('question bank contains exactly ten source-grounded questions with unique ids', () => {
  assert.equal(QUESTION_BANK.length, 10);
  assert.equal(new Set(QUESTION_BANK.map((q) => q.id)).size, 10);
  assert.ok(QUESTION_BANK.every((q) => q.prompt && q.correctAnswer !== undefined));
});

test('attempt selects exactly five unique questions', () => {
  const attempt = createAttempt(() => 0.314159);
  assert.equal(attempt.questions.length, 5);
  assert.equal(new Set(attempt.questions.map((q) => q.id)).size, 5);
});

test('submission validation blocks unanswered questions and incomplete matching', () => {
  const attempt = createAttempt(() => 0.2);
  assert.deepEqual(validateAttempt(attempt), { valid: false, unansweredQuestions: 5, unmatchedPairs: 5 });
});

test('eight of ten points passes at exactly 80 percent', () => {
  const attempt = createAttempt(() => 0.1);
  for (const q of attempt.questions) answerQuestion(attempt, q.id, q.correctAnswer);
  const pairs = MATCHING_PAIRS.slice(0, 3);
  for (const pair of pairs) placeMatch(attempt, pair.typeId, pair.descriptionId);
  const [wrongA, wrongB] = MATCHING_PAIRS.slice(3);
  placeMatch(attempt, wrongA.typeId, wrongB.descriptionId);
  placeMatch(attempt, wrongB.typeId, wrongA.descriptionId);
  const result = scoreAttempt(attempt);
  assert.deepEqual(result, { points: 8, total: 10, percentage: 80, passed: true });
});

test('seven of ten points fails', () => {
  const attempt = createAttempt(() => 0.1);
  for (const q of attempt.questions.slice(0, 4)) answerQuestion(attempt, q.id, q.correctAnswer);
  answerQuestion(attempt, attempt.questions[4].id, '__wrong__');
  for (const pair of MATCHING_PAIRS.slice(0, 3)) placeMatch(attempt, pair.typeId, pair.descriptionId);
  const [wrongA, wrongB] = MATCHING_PAIRS.slice(3);
  placeMatch(attempt, wrongA.typeId, wrongB.descriptionId);
  placeMatch(attempt, wrongB.typeId, wrongA.descriptionId);
  const result = scoreAttempt(attempt);
  assert.equal(result.points, 7);
  assert.equal(result.percentage, 70);
  assert.equal(result.passed, false);
});

test('review reports learner choice and correct answer for every asked question and pair', () => {
  const attempt = createAttempt(() => 0.3);
  for (const q of attempt.questions) answerQuestion(attempt, q.id, q.correctAnswer);
  for (const pair of MATCHING_PAIRS) placeMatch(attempt, pair.typeId, pair.descriptionId);
  const review = createReview(attempt);
  assert.equal(review.questions.length, 5);
  assert.equal(review.matches.length, 5);
  assert.ok(review.questions.every((item) => item.correct === true));
  assert.ok(review.matches.every((item) => item.correct === true));
});
```

- [ ] **Step 2: Run and verify RED**

```powershell
Set-Location C:\Dev\Resume
node --test tests\quiz.test.mjs
```

Expected: FAIL because `quiz.js` does not exist.

- [ ] **Step 3: Implement the exact ten-question bank**

Create `assets/js/quiz.js` with this bank:

```js
export const QUESTION_BANK = Object.freeze([
  { id: 'q1', type: 'mcq', prompt: 'Which renewable source converts radiant energy from the sun into usable energy?', options: ['Solar Energy','Wind Energy','Hydropower','Geothermal Energy'], correctAnswer: 'Solar Energy' },
  { id: 'q2', type: 'tf', prompt: 'Wind turbines convert the kinetic energy of wind into electricity.', options: ['True','False'], correctAnswer: 'True' },
  { id: 'q3', type: 'mcq', prompt: 'Which renewable source relies on moving water and the continuous water cycle?', options: ['Biomass Energy','Hydropower','Solar Energy','Geothermal Energy'], correctAnswer: 'Hydropower' },
  { id: 'q4', type: 'mcq', prompt: "Which source uses the Earth's natural heat?", options: ['Wind Energy','Geothermal Energy','Biomass Energy','Hydropower'], correctAnswer: 'Geothermal Energy' },
  { id: 'q5', type: 'mcq', prompt: 'Which source can use organic matter such as wood, crops and animal waste?', options: ['Solar Energy','Biomass Energy','Wind Energy','Hydropower'], correctAnswer: 'Biomass Energy' },
  { id: 'q6', type: 'tf', prompt: 'Renewable energy sources emit little-to-no greenhouse gases.', options: ['True','False'], correctAnswer: 'True' },
  { id: 'q7', type: 'tf', prompt: 'Replacing fossil fuels with renewables can slow global warming and reduce air pollution.', options: ['True','False'], correctAnswer: 'True' },
  { id: 'q8', type: 'mcq', prompt: 'Greater use of renewables can reduce dependence on what kind of energy markets?', options: ['Volatile global energy markets','Only local solar markets','Agricultural markets','Telecommunications markets'], correctAnswer: 'Volatile global energy markets' },
  { id: 'q9', type: 'mcq', prompt: 'According to the storyboard, approximately how much UK electricity is generated from renewable sources?', options: ['Over 40%','Under 5%','Exactly 10%','Over 90%'], correctAnswer: 'Over 40%' },
  { id: 'q10', type: 'tf', prompt: 'The Avonmouth Wind Farm case study says the site became operational in 2013.', options: ['True','False'], correctAnswer: 'True' }
]);
```

- [ ] **Step 4: Implement five canonical matching pairs**

Use stable IDs rather than comparing long strings:

```js
export const MATCHING_PAIRS = Object.freeze([
  { typeId: 'solar', typeLabel: 'Solar Energy', descriptionId: 'sun', description: 'Radiant energy from the sun converted into electricity or heat.' },
  { typeId: 'wind', typeLabel: 'Wind Energy', descriptionId: 'air', description: 'Moving air turns turbine blades connected to a generator.' },
  { typeId: 'hydro', typeLabel: 'Hydropower', descriptionId: 'water', description: 'Moving water spins turbines and relies on the continuous water cycle.' },
  { typeId: 'biomass', typeLabel: 'Biomass Energy', descriptionId: 'organic', description: 'Organic matter such as wood, crops and animal waste is used for heat or electricity.' },
  { typeId: 'geothermal', typeLabel: 'Geothermal Energy', descriptionId: 'earth', description: "The Earth's natural heat is used for electricity or direct heating." }
]);
```

- [ ] **Step 5: Implement deterministic attempt, validation, scoring and review APIs**

Implementation contract:

```js
function shuffled(items, random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createAttempt(random = Math.random) {
  return {
    questions: shuffled(QUESTION_BANK, random).slice(0, 5),
    answers: new Map(),
    matches: new Map()
  };
}

export function answerQuestion(attempt, id, value) { attempt.answers.set(id, value); return attempt; }
export function placeMatch(attempt, typeId, descriptionId) { attempt.matches.set(typeId, descriptionId); return attempt; }

export function validateAttempt(attempt) {
  return {
    valid: attempt.answers.size === 5 && attempt.matches.size === 5,
    unansweredQuestions: 5 - attempt.answers.size,
    unmatchedPairs: 5 - attempt.matches.size
  };
}

export function scoreAttempt(attempt) {
  let points = 0;
  for (const q of attempt.questions) if (attempt.answers.get(q.id) === q.correctAnswer) points += 1;
  for (const pair of MATCHING_PAIRS) if (attempt.matches.get(pair.typeId) === pair.descriptionId) points += 1;
  const percentage = points * 10;
  return { points, total: 10, percentage, passed: percentage >= 80 };
}

export function createReview(attempt) {
  return {
    questions: attempt.questions.map((q) => ({
      id: q.id, prompt: q.prompt, learnerAnswer: attempt.answers.get(q.id), correctAnswer: q.correctAnswer,
      correct: attempt.answers.get(q.id) === q.correctAnswer
    })),
    matches: MATCHING_PAIRS.map((pair) => ({
      typeLabel: pair.typeLabel,
      learnerDescriptionId: attempt.matches.get(pair.typeId),
      correctDescriptionId: pair.descriptionId,
      correct: attempt.matches.get(pair.typeId) === pair.descriptionId
    }))
  };
}
```

- [ ] **Step 6: Run quiz tests and verify GREEN**

```powershell
Set-Location C:\Dev\Resume
node --test tests\quiz.test.mjs
```

Expected: all 6 quiz tests PASS.

- [ ] **Step 7: Render the knowledge check with a pointer-independent select-and-place path**

In `renewable-module.js`, when entering screen 4:

1. create a fresh attempt if `state.attempt` is null;
2. render five `<fieldset>` question blocks, with radio inputs named by question ID;
3. render a matching row for each renewable type with a `<select>` containing all five descriptions and an empty `Choose description…` option;
4. `change` events call `answerQuestion` / `placeMatch`;
5. render `Submit Knowledge Check` and `#quiz-validation` (`aria-live="polite"`);
6. on submit call `validateAttempt`; when invalid announce `Complete all five questions and all five matches before submitting.` and do not score;
7. when valid, set `state.result = scoreAttempt(state.attempt)`, persist `state.review = createReview(state.attempt)`, then `advance(state)` to screen 5.

Optional desktop drag/drop may synchronise the same `<select>` values, but the `<select>` route is canonical and complete on its own.

- [ ] **Step 8: Style quiz/matching controls in `module.css`**

Use `.quiz-question`, `.matching-grid`, `.matching-row`, `.quiz-validation`; all inputs/selects minimum 44px practical height, strong focus style, mobile stack at <=760px. Do not encode correct/incorrect using colour alone; pair status colour with text/icon labels.

- [ ] **Step 9: Run full suite**

```powershell
Set-Location C:\Dev\Resume
node --test tests\*.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 10: Commit quiz/scoring**

```powershell
Set-Location C:\Dev\Resume
git add assets\js\quiz.js assets\js\renewable-module.js assets\css\module.css tests\quiz.test.mjs
git commit -m "feat: add Renewable knowledge check and scoring"
```

---

### Task 7: Implement Pass/Fail, answer review, retry/restart, and focus-safe module exit

**Files:**
- Modify: `assets/js/renewable-module.js`
- Modify: `assets/css/module.css`
- Modify: `tests/module.test.mjs`
- Modify: `tests/quiz.test.mjs`

**Interfaces:**
- Consumes: `scoreAttempt`, `createReview`, `createAttempt` from Task 6.
- Produces: result rendering, `Review Answers`, `Try Again`, `Restart Module`, and `Exit to Portfolio` flows.

- [ ] **Step 1: Write failing result/retry tests**

Append to `tests/quiz.test.mjs`:

```js
import { retryAttempt } from '../assets/js/quiz.js';

test('retry returns a fresh valid five-question attempt with no learner state', () => {
  const first = createAttempt(() => 0.1);
  answerQuestion(first, first.questions[0].id, first.questions[0].correctAnswer);
  placeMatch(first, 'solar', 'sun');
  const retry = retryAttempt(() => 0.8);
  assert.equal(retry.questions.length, 5);
  assert.equal(retry.answers.size, 0);
  assert.equal(retry.matches.size, 0);
});
```

Implement minimally in `quiz.js`:

```js
export function retryAttempt(random = Math.random) { return createAttempt(random); }
```

- [ ] **Step 2: Run quiz test RED then GREEN**

First run before implementation and confirm FAIL on missing export, then implement `retryAttempt`, then rerun:

```powershell
Set-Location C:\Dev\Resume
node --test tests\quiz.test.mjs
```

Expected after implementation: all quiz tests PASS.

- [ ] **Step 3: Render the result screen exactly from scored state**

Screen 5 must show:

For pass (`percentage >= 80`):

```text
Pass
<percentage>%
Great work! You now have a clear understanding of the types of renewable energy, and how they benefit both our planet, and the UK.
```

Controls: `Review Answers`, `Restart Module`, `Exit to Portfolio`.

For fail (`percentage < 80`):

```text
Not quite there yet
<percentage>%
Review the responses below or try another five-question attempt.
```

Controls: `Review Answers`, `Try Again`, `Exit to Portfolio`.

Result heading/status must be in an `aria-live="polite"` container.

- [ ] **Step 4: Implement answer review without changing score**

`Review Answers` renders:

- each of the five asked prompts;
- `Your answer: ...`;
- `Correct answer: ...`;
- text label `Correct` or `Incorrect`;
- all five matching rows with learner match and correct match.

Include `Back to Result` to restore the result summary. Review mode is a view of `state.review`; it must not mutate the attempt.

- [ ] **Step 5: Implement Try Again and Restart Module distinctly**

- `Try Again`: set `state.attempt = retryAttempt()`, clear `state.result`/`state.review`, set `state.screen = 4`, render a new five-question run; prior content-screen completion remains within the current launch session.
- `Restart Module`: replace the complete module state with `createModuleState()`, set screen 0, render Welcome.
- `Exit to Portfolio`: always clears the module state, hides module, restores Portfolio tab if needed, and returns focus to `#launch-renewable-module`.

- [ ] **Step 6: Add state-level regression test for repeated launch/reset**

Append to `tests/module.test.mjs`:

```js
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
```

- [ ] **Step 7: Run module + quiz tests**

```powershell
Set-Location C:\Dev\Resume
node --test tests\module.test.mjs tests\quiz.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 8: Run full suite**

```powershell
Set-Location C:\Dev\Resume
node --test tests\*.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 9: Commit result/retry flows**

```powershell
Set-Location C:\Dev\Resume
git add assets\js\quiz.js assets\js\renewable-module.js assets\css\module.css tests\quiz.test.mjs tests\module.test.mjs
git commit -m "feat: add Renewable results review and retry flows"
```

---

### Task 8: Responsive/accessibility hardening, metadata/privacy regression, README V2 release workflow

**Files:**
- Modify: `assets/css/styles.css`
- Modify: `assets/css/module.css`
- Modify: `index.html`
- Modify: `404.html` only if metadata drift is found
- Modify: `README.md`
- Modify: `tests/static.test.mjs`

**Interfaces:**
- Consumes: completed V2 UI/interaction contracts from Tasks 2–7.
- Produces: release-candidate static site and final PowerShell deployment instructions.

- [ ] **Step 1: Add failing static tests for reduced motion, touch targets, module no-JS message and theme hooks**

Append to `tests/static.test.mjs`:

```js
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
  for (const label of ['Home','About','Experience','Portfolio','Skills','Testimonials','Contact']) assert.match(html, new RegExp(`>${label}<`, 'i'));
});
```

- [ ] **Step 2: Run static tests and confirm RED only for missing hardening**

```powershell
Set-Location C:\Dev\Resume
node --test tests\static.test.mjs
```

Expected: any missing reduced-motion/no-JS/theme contracts FAIL before the final CSS/HTML hardening.

- [ ] **Step 3: Complete responsive and accessibility CSS**

Verify/implement all of these rules:

- 44px minimum practical height for tabs, module controls, select fields and dialog controls.
- tab strip uses horizontal scrolling at mobile widths and never requires hamburger disclosure.
- module fills viewport at mobile widths and keeps footer controls reachable.
- dialog max-height stays within viewport and scrolls internally.
- focus-visible uses a high-contrast outline in both themes.
- correct/incorrect states include text labels/icons in addition to colour.
- `prefers-reduced-motion: reduce` disables tab/module transitions.
- no horizontal page overflow at 320px.
- portrait/landscape resize uses fluid grid/media queries rather than JS dimensions.

- [ ] **Step 4: Verify semantic/focus relationships in source HTML**

Manually inspect and ensure:

- each `role="tab"` has a unique `aria-controls` matching one panel ID;
- each `role="tabpanel"` has `aria-labelledby` matching one tab ID;
- dialog has `role="dialog"`, `aria-modal="true"`, and a real labelled title;
- quiz result/validation containers use `aria-live="polite"`;
- images retain meaningful alt text or empty alt for decoration;
- all buttons have explicit `type="button"` except intentional form-submit controls.

- [ ] **Step 5: Update README with V2 PowerShell test/publish flow**

Add this exact workflow, adapting only commit message wording if needed:

```markdown
## Publish V2 from Developer PowerShell

```powershell
Set-Location C:\Dev\Resume

# Verify V1 is preserved before replacing the published root site.
git show --no-patch v1.0

# Verify V2 before commit/push.
node --test tests\*.test.mjs
git status

git add .
git commit -m "Release Resume portfolio V2"
git push origin main
```

After GitHub Pages has updated and V2 has been accepted, the release may be tagged:

```powershell
Set-Location C:\Dev\Resume
git tag -a v2.0 -m "Resume portfolio V2"
git push origin v2.0
```

The site is published from the repository root at `https://weejubya.github.io/Resume/`.
```

Also document deep links (`#portfolio`, etc.), the 80% scoring model, session-only module state, and the fact that no external build step exists.

- [ ] **Step 6: Run privacy/path/metadata scan via the full static suite**

```powershell
Set-Location C:\Dev\Resume
node --test tests\static.test.mjs
```

Expected: every static test PASS, including GNU Terry Pratchett tag on every HTML document and zero forbidden markers.

- [ ] **Step 7: Run the complete V2 automated suite**

```powershell
Set-Location C:\Dev\Resume
node --test tests\*.test.mjs
```

Expected: 0 failures.

- [ ] **Step 8: Run a local GitHub-Pages-equivalent smoke server**

```powershell
Set-Location C:\Dev\Resume
py -m http.server 8000
```

In a browser open `http://localhost:8000/` and manually verify this acceptance route:

1. Home loads with the existing burgundy/science-blue theme behaviour.
2. Open each of the seven tabs; confirm URL hashes update and Back/Forward restores tab state.
3. Resize to a narrow mobile viewport; confirm the tab strip scrolls horizontally and remains touchable.
4. Launch Renewable Energy; complete all five type controls and all four climate reveals.
5. Open/close Avonmouth with Close and Escape; reopen it once.
6. Complete five quiz questions and all five matching selects; verify 80% passes and 70% fails by intentionally changing answers on a second run.
7. Open Review Answers, then Try Again/Restart.
8. Exit to Portfolio and confirm focus returns to the launch control.
9. Toggle light/dark theme inside and outside the module.
10. Disable/reload JavaScript in browser dev tools and verify the seven résumé panels remain readable plus the interactive-module explanation appears.

Stop the server with `Ctrl+C`.

- [ ] **Step 9: Commit release-candidate hardening/docs**

```powershell
Set-Location C:\Dev\Resume
git add index.html 404.html assets\css\styles.css assets\css\module.css README.md tests\static.test.mjs
git commit -m "docs: harden and document Resume V2 release"
```

---

## Plan Self-Review

### Spec coverage

- Seven-tab application shell: Task 2.
- Hash/deep-link/keyboard behaviour: Task 2.
- Existing V1 content redistribution/no-JS readability: Tasks 2–3 and Task 8.
- Portfolio project hub + full ADP substance: Task 3.
- Full-screen Renewable module: Tasks 4–5.
- Five renewable type interactions + gate: Tasks 4–5.
- Four climate reveals + gate: Tasks 4–5.
- Avonmouth modal content/focus/escape/backdrop: Task 5.
- Ten source-grounded questions, exactly five per attempt: Task 6.
- Matching with pointer-independent select-and-place: Task 6.
- Deterministic 10-point scoring + exact 80% pass: Task 6.
- Pass/fail/review/retry/restart: Task 7.
- Responsive/mobile/reduced motion/theme/accessibility: Task 8.
- GNU Terry Pratchett tag/privacy/GitHub Pages-safe paths: Tasks 1 and 8.
- V1 tag + V2 tag guidance + `C:\Dev\Resume` PowerShell workflow: Tasks 1 and 8.

No approved V2 requirement is left without an implementation task.

### Placeholder scan

The plan contains no `TBD`, `TODO`, “implement later”, “similar to”, or unnamed error-handling placeholders. Task 5's temporary knowledge-check/result containers are intentionally specified intermediate interfaces and are explicitly completed by Tasks 6–7.

### Type/interface consistency

- `TAB_IDS`/`normaliseTabId`/`nextFocusedIndex` are defined and consumed only through `tabs.js`/`app.js`.
- Renewable module state owns `screen`, viewed sets, Avonmouth flag, attempt/result/review; quiz code owns attempt question/answer/matching structures.
- Scoring contract is fixed at 10 total points and exactly `percentage >= 80` for pass.
- `#launch-renewable-module`, `#renewable-module`, module controls and dialog IDs are defined once and consumed by later controller tasks.

### Review Focus coverage

- No-JS visibility: static test in Task 2 + smoke route in Task 8.
- Hash/history churn: pure hash/idempotent controller logic in Task 2 + browser smoke route in Task 8.
- Modal focus escape: focus helper/state rules in Task 5 + browser Escape/reopen route in Task 8.
- Quiz incomplete submissions: explicit validation test in Task 6.
- Touch/keyboard matching: select-and-place is canonical in Task 6 and is tested without pointer events.
