const VALID_THEMES = new Set(['light', 'dark']);
const THEME_KEY = 'gw-theme';

export function resolveTheme({ savedTheme, prefersDark }) {
  return VALID_THEMES.has(savedTheme) ? savedTheme : (prefersDark ? 'dark' : 'light');
}

export function nextTheme(current) {
  return current === 'dark' ? 'light' : 'dark';
}

export function safeStorage(win) {
  try {
    return win?.localStorage ?? null;
  } catch {
    return null;
  }
}

export function safeStoredTheme(storage) {
  try {
    return storage?.getItem(THEME_KEY) ?? null;
  } catch {
    return null;
  }
}

export function scrollBehaviorForMotion(reduceMotion) {
  return reduceMotion ? 'auto' : 'smooth';
}

function safeStoreTheme(storage, theme) {
  try {
    storage?.setItem(THEME_KEY, theme);
  } catch {
    // Storage can be blocked by privacy settings; the current session still works.
  }
}

function themeColour(theme) {
  return theme === 'dark' ? '#03111d' : '#711936';
}

function applyTheme(doc, theme) {
  doc.documentElement.dataset.theme = theme;
  const toggle = doc.querySelector('#theme-toggle');
  if (toggle) {
    const destination = nextTheme(theme);
    toggle.setAttribute('aria-label', `Switch to ${destination} theme`);
    toggle.setAttribute('title', `Switch to ${destination} theme`);
  }

  const meta = doc.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', themeColour(theme));
}

function setNavOpen(nav, toggle, open) {
  nav?.classList.toggle('is-open', open);
  toggle?.setAttribute('aria-expanded', String(open));
}

function installActiveSectionObserver(doc, win) {
  if (!('IntersectionObserver' in win)) return;

  const links = [...doc.querySelectorAll('.site-nav a[href^="#"]')];
  const byId = new Map(links.map((link) => [link.getAttribute('href')?.slice(1), link]));
  const sections = [...doc.querySelectorAll('main section[id]')].filter((section) => byId.has(section.id));
  if (!sections.length) return;

  const observer = new win.IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;

    for (const link of links) link.removeAttribute('aria-current');
    byId.get(visible.target.id)?.setAttribute('aria-current', 'page');
  }, {
    rootMargin: '-18% 0px -62% 0px',
    threshold: [0.05, 0.25, 0.55]
  });

  for (const section of sections) observer.observe(section);
}

function installRevealObserver(doc, win, reduceMotion) {
  if (reduceMotion || !('IntersectionObserver' in win)) return;

  const items = [...doc.querySelectorAll('.future-panel, .focus-card, .timeline-card, .capability-stack article')];
  for (const item of items) item.classList.add('reveal-ready');

  const observer = new win.IntersectionObserver((entries, instance) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-revealed');
      instance.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  for (const item of items) observer.observe(item);
}

export function initSite(doc = document, win = window) {
  const colourMedia = win.matchMedia?.('(prefers-color-scheme: dark)');
  const motionMedia = win.matchMedia?.('(prefers-reduced-motion: reduce)');
  const storage = safeStorage(win);
  const stored = safeStoredTheme(storage);
  const initialTheme = resolveTheme({
    savedTheme: stored,
    prefersDark: Boolean(colourMedia?.matches)
  });
  applyTheme(doc, initialTheme);

  const themeToggle = doc.querySelector('#theme-toggle');
  themeToggle?.addEventListener('click', () => {
    const current = doc.documentElement.dataset.theme || initialTheme;
    const selected = nextTheme(current);
    applyTheme(doc, selected);
    safeStoreTheme(storage, selected);
  });

  if (!stored && colourMedia?.addEventListener) {
    colourMedia.addEventListener('change', (event) => {
      if (safeStoredTheme(storage)) return;
      applyTheme(doc, event.matches ? 'dark' : 'light');
    });
  }

  const nav = doc.querySelector('#primary-nav');
  const navToggle = doc.querySelector('#nav-toggle');
  navToggle?.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') !== 'true';
    setNavOpen(nav, navToggle, open);
  });

  const reduceMotion = Boolean(motionMedia?.matches);
  for (const anchor of doc.querySelectorAll('a[href^="#"]')) {
    anchor.addEventListener('click', (event) => {
      const id = anchor.getAttribute('href')?.slice(1);
      if (!id) return;
      const target = doc.getElementById(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: scrollBehaviorForMotion(reduceMotion), block: 'start' });
      if (win.history?.replaceState) win.history.replaceState(null, '', `#${id}`);
      setNavOpen(nav, navToggle, false);
    });
  }

  doc.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const wasOpen = Boolean(nav?.classList.contains('is-open'));
    setNavOpen(nav, navToggle, false);
    if (wasOpen) navToggle?.focus();
  });

  installActiveSectionObserver(doc, win);
  installRevealObserver(doc, win, reduceMotion);
  doc.documentElement.classList.add('js-ready');
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  initSite(document, window);
}
