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
  for (const id of ['home','about','what-i-do','experience','portfolio','testimonials','contact']) {
    assert.match(html, new RegExp(`id=["']tab-${id}["'][\\s\\S]*role=["']tab["']`, 'i'));
    assert.match(html, new RegExp(`id=["']panel-${id}["'][\\s\\S]*role=["']tabpanel["']`, 'i'));
  }
});

test('source HTML does not pre-hide primary tab panels', () => {
  const html = read('index.html');
  for (const id of ['home','about','what-i-do','experience','portfolio','testimonials','contact']) {
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
  assert.match(html, /href=["']assets\/css\/module\.css(?:\?v=[^"']+)?["']/i);
  assert.match(html, /src=["']assets\/js\/app\.js(?:\?v=[^"']+)?["']/i);
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
  for (const label of ['Home','About','What I Do','Experience','Portfolio','Testimonials','Contact']) {
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

test('README documents V3 release, deep links, session state and exact 80 percent scoring', () => {
  const readme = read('README.md');
  for (const phrase of [
    'Publish V3 from Developer PowerShell',
    '#what-i-do',
    '#portfolio',
    '8/10',
    '80%',
    'session-only',
    'no build step'
  ]) assert.match(readme, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
});

test('V3 Home uses the approved conversational positioning and CTA destinations', () => {
  const html = read('index.html');
  assert.match(html, /Hi, I(?:’|&rsquo;|')m Glynn/i);
  assert.match(html, /learning design, technology and creativity/i);
  assert.match(html, /make this engaging/i);
  assert.match(html, /href=["']#portfolio["'][^>]*>\s*See my work/i);
  assert.match(html, /href=["']#what-i-do["'][^>]*>\s*What I do/i);
  assert.doesNotMatch(html, /I design and deliver engaging digital learning solutions that transform complex information/i);
});

test('V3 About contains the four approved editorial blocks and anchor lines', () => {
  const html = read('index.html');
  for (const heading of ['How I got here','How I work','A slightly unusual portfolio','Away from the timeline']) {
    assert.match(html, new RegExp(heading, 'i'));
  }
  assert.match(html, /Talk to people, understand the problem, make something useful, and keep making it better\./i);
  assert.match(html, /not hidden behind a particularly clever portfolio password/i);
  assert.match(html, /Computing with Modern Languages/i);
  assert.match(html, /French and Spanish[^<]{0,80}intermediate/i);
});

test('V3 What I Do replaces Skills with four capability groups and project-day framing', () => {
  const html = read('index.html');
  assert.match(html, /id=["']tab-what-i-do["']/i);
  assert.match(html, /id=["']panel-what-i-do["']/i);
  assert.doesNotMatch(html, /id=["']tab-skills["']/i);
  assert.doesNotMatch(html, /id=["']panel-skills["']/i);
  for (const heading of ['Learning Design','eLearning Development','Creative Media','Technical & Development','On any given project']) {
    assert.match(html, new RegExp(heading.replace('&','(?:&amp;|&)'), 'i'));
  }
});

test('V3 What I Do retains the approved authoring creative and development detail', () => {
  const html = read('index.html');
  const what = html.match(/<section id=["']panel-what-i-do["'][\s\S]*?(?=<section id=["']panel-experience["'])/i)?.[0] ?? '';
  assert.match(what, /Adobe Captivate[\s\S]*Accessible authoring/i);
  assert.match(what, /eLB Lectora[\s\S]*Interactive eLearning/i);
  assert.match(what, /Articulate Storyline[\s\S]*Scenario-based learning/i);
  const creative = what.match(/<h3>Creative Media<\/h3>[\s\S]*?(?=<\/article>)/i)?.[0] ?? '';
  assert.ok(creative.indexOf('After Effects') >= 0);
  assert.ok(creative.indexOf('Adobe Audition') > creative.indexOf('After Effects'));
  assert.ok(creative.indexOf('DaVinci Resolve') > creative.indexOf('Adobe Audition'));
  assert.match(what, /VBS\s*\/\s*VBA Scripting/i);
  assert.match(what, /Visual Basic &amp; C Programming/i);
});

test('V3 Experience presents the approved career narrative and grouped GCHQ progression', () => {
  const html = read('index.html');
  const exp = html.match(/<section id=["']panel-experience["'][\s\S]*?(?=<section id=["']panel-portfolio["'])/i)?.[0] ?? '';
  assert.match(exp, /A career in learning, technology and creative development/i);
  assert.match(exp, /British Security Service \(MI5\)/i);
  assert.match(exp, /Learning Technology Specialist/i);
  assert.match(exp, /IT Policy Manager/i);
  assert.match(exp, /IT System Administrator/i);
  assert.match(exp, /Wildfowl &amp; Wetlands Trust/i);
  assert.match(exp, /quite a lot of IT lurking underneath the surface/i);
  assert.match(exp, /five minutes before a deadline/i);
  assert.equal((exp.match(/GCHQ · Cheltenham/gi) ?? []).length, 1);
});

test('V3 Portfolio uses the approved framing and retains every Renewable module hook', () => {
  const html = read('index.html');
  const portfolio = html.match(/<section id=["']panel-portfolio["'][\s\S]*?(?=<section id=["']panel-testimonials["'])/i)?.[0] ?? '';
  assert.match(portfolio, /The work, where I(?:’|')m able to show it/i);
  for (const heading of ['The challenge','The approach','The delivery','The outcome','Interactive storyboard reconstruction']) {
    assert.match(portfolio, new RegExp(heading, 'i'));
  }
  for (const id of ['launch-renewable-module','renewable-module','module-exit','module-back','module-next','open-avonmouth','avonmouth-dialog']) {
    assert.match(html, new RegExp(`id=["']${id}["']`, 'i'));
  }
});

test('V3 Testimonials keeps both full source testimonials with readable highlights', () => {
  const html = read('index.html');
  const testimonials = html.match(/<section id=["']panel-testimonials["'][\s\S]*?(?=<section id=["']panel-contact["'])/i)?.[0] ?? '';
  const testimonialText = testimonials.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  assert.match(testimonialText, /Better coming from someone else\./i);
  assert.match(testimonials, /approachability, listening skills, communications and ability to innovate/i);
  assert.match(testimonials, /adapt his work to suit the project[\s\S]*results are always excellent/i);
  assert.match(testimonials, /Having delivered many high-profile strategic events and activities/i);
  assert.match(testimonials, /Glynn is an approachable, kind and gentle colleague with extensive knowledge in his field/i);
});

test('V3 Contact is concise public-safe and welcoming', () => {
  const html = read('index.html');
  const contact = html.match(/<section id=["']panel-contact["'][\s\S]*?(?=<\/main>)/i)?.[0] ?? '';
  assert.match(contact, /Let(?:’|')s talk about your next[\s\S]*learning challenge/i);
  assert.match(contact, /Gloucestershire, UK/i);
  assert.match(contact, /Complicated subject matter welcome\./i);
  assert.match(contact, /mailto:glynn\.williams@me\.com/i);
  assert.match(contact, /linkedin\.com\/in\/glynn-williams-17139336a/i);
  assert.doesNotMatch(contact, /<form\b/i);
});


test('V3 primary panels stay in readable source order for no-JavaScript readers', () => {
  const html = read('index.html');
  const ids = ['home','about','what-i-do','experience','portfolio','testimonials','contact'];
  const positions = ids.map((id) => html.indexOf(`id="panel-${id}"`));
  assert.ok(positions.every((value) => value >= 0));
  for (let i = 1; i < positions.length; i += 1) assert.ok(positions[i] > positions[i - 1], `${ids[i]} should follow ${ids[i - 1]}`);
});
