/* Native tabs inspired by Arc's MIT-licensed animated-tabs pattern on 21st.dev.
 * Source review and attribution: tools/components/co-op-help-guide.md.
 */
(() => {
  'use strict';
  const guide = document.querySelector('[data-help-guide]');
  if (!guide) return;
  const list = guide.querySelector('[data-help-tabs]');
  const tabs = [...guide.querySelectorAll('[data-help-topic]')];
  const panels = tabs.map(tab => document.getElementById(`help-panel-${tab.dataset.helpTopic}`));
  // A partial enhancement must leave the existing links usable.
  if (!list || !tabs.length || panels.some(panel => !panel)) return;
  const mobile = window.matchMedia('(max-width: 760px)');
  let selected = -1;

  function select(index, focus = false) {
    if (index < 0 || index >= tabs.length) return;
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    selected = index;
    if (focus) tabs[index].focus({ preventScroll: true });
  }

  function selectFromHash() {
    const index = tabs.findIndex(tab => tab.getAttribute('href') === window.location.hash);
    if (index !== -1) select(index);
  }

  list.setAttribute('role', 'tablist');
  list.setAttribute('aria-label', 'Choose what you need help with');
  function orient() {
    list.setAttribute('aria-orientation', mobile.matches ? 'horizontal' : 'vertical');
  }
  orient();
  mobile.addEventListener('change', orient);
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-label', tab.querySelector('h3').textContent);
    tab.setAttribute('aria-controls', panels[index].id);
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;
    tab.addEventListener('click', event => {
      // Keep ordinary link behavior for opening the underlying guidance in a new tab.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button > 0) return;
      event.preventDefault();
      select(index);
    });
    tab.addEventListener('keydown', event => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      let next;
      const forward = mobile.matches ? 'ArrowRight' : 'ArrowDown';
      const back = mobile.matches ? 'ArrowLeft' : 'ArrowUp';
      if (event.key === forward) next = (index + 1) % tabs.length;
      else if (event.key === back) next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else if (event.key === ' ') next = index;
      if (next === undefined) return;
      event.preventDefault();
      select(next, true);
    });
  });
  window.addEventListener('hashchange', selectFromHash);
  guide.classList.add('guide-ready');
  selectFromHash();
  if (selected === -1) select(0);
})();
