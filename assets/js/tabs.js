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
  const panels = new Map(
    [...root.querySelectorAll('[role="tabpanel"][data-panel]')]
      .map((panel) => [panel.dataset.panel, panel])
  );

  const activate = (id, { push = true, focus = false } = {}) => {
    const activeId = TAB_IDS.includes(id) ? id : 'home';
    let selectedTab = null;
    for (const tab of tabs) {
      const selected = tab.dataset.tab === activeId;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected) selectedTab = tab;
      if (selected && focus) tab.focus();
    }
    for (const [panelId, panel] of panels) panel.hidden = panelId !== activeId;
    if (selectedTab?.scrollIntoView) {
      try { selectedTab.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch { /* non-essential */ }
    }
    if (push && win.location.hash !== `#${activeId}`) {
      win.history.pushState({ tab: activeId }, '', `#${activeId}`);
    }
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
