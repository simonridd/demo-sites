(() => {
  'use strict';
  const root = document.getElementById('journey');
  const tabs = [...document.querySelectorAll('[data-stage]')];
  const panels = tabs.map(tab => document.getElementById(`stage-${tab.dataset.stage}`));
  if (!root || tabs.length !== 4 || panels.some(panel => !panel)) return;
  const nav = document.querySelector('.stage-nav');
  const edges = [...document.querySelectorAll('[data-edge]')];
  const controls = document.getElementById('journey-controls');
  const previous = document.getElementById('previous-stage');
  const next = document.getElementById('next-stage');
  const position = document.getElementById('journey-position');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const engine = window.gsap;
  let active = 0;
  let timeline;

  function settle() {
    timeline?.kill();
    timeline = undefined;
    // Only these authored motion targets receive inline styles in this component.
    [...edges, ...panels].forEach(element => element.removeAttribute('style'));
  }

  function select(index, { focus = false, animate = true, updateHash = true } = {}) {
    if (index < 0 || index >= tabs.length) return;
    const from = active;
    settle();
    active = index;
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      tab.classList.toggle('is-active', i === index);
      panels[i].hidden = i !== index;
    });
    edges.forEach((edge, i) => edge.classList.toggle('is-traversed', i < index));
    previous.disabled = index === 0;
    next.disabled = index === tabs.length - 1;
    position.textContent = `Step ${index + 1} of ${tabs.length} · ${tabs[index].textContent.trim()}`;
    if (updateHash) {
      try { window.history.replaceState(window.history.state, '', `#${panels[index].id}`); } catch { /* Local files still retain useful navigation. */ }
    }
    if (focus) tabs[index].focus({ preventScroll: true });
    if (!animate || reduced.matches || !engine || from === index) return;
    timeline = engine.timeline({ defaults: { ease: 'power2.out' } });
    edges.filter((_, i) => i < index).forEach((edge, i) => {
      const length = edge.getTotalLength();
      timeline.fromTo(edge, { strokeDasharray: length, strokeDashoffset: length, opacity: .25 },
        { strokeDashoffset: 0, opacity: 1, duration: .38 }, i * .10);
    });
    timeline.fromTo(panels[index], { opacity: .25, y: 10 }, { opacity: 1, y: 0, duration: .42 }, .08);
  }

  nav.setAttribute('role', 'tablist');
  nav.setAttribute('aria-label', 'Choose a stage of the support journey');
  // The two-by-two mobile grid keeps row-major Left/Right navigation.
  nav.setAttribute('aria-orientation', 'horizontal');
  tabs.forEach((tab, i) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[i].id);
    panels[i].setAttribute('role', 'tabpanel');
    panels[i].setAttribute('aria-labelledby', tab.id);
    panels[i].tabIndex = 0;
    tab.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.button > 0) return;
      event.preventDefault(); select(i);
    });
    tab.addEventListener('keydown', event => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const index = event.key === 'ArrowRight' ? (i + 1) % tabs.length
        : event.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
        : event.key === ' ' ? i : -1;
      if (index === -1) return;
      event.preventDefault(); select(index, { focus: true });
    });
  });
  const advance = offset => {
    select(active + offset);
    // The step controls can be below the map on mobile; keep moved focus visible.
    tabs[active].focus();
  };
  previous.addEventListener('click', () => advance(-1));
  next.addEventListener('click', () => advance(1));
  reduced.addEventListener('change', settle);
  document.addEventListener('visibilitychange', () => { if (document.hidden) settle(); });
  const selectHash = () => {
    const index = panels.findIndex(panel => `#${panel.id}` === window.location.hash);
    select(index < 0 ? 0 : index, { animate: false, updateHash: false });
  };
  window.addEventListener('hashchange', selectHash);
  root.classList.add('journey-ready');
  controls.hidden = false;
  selectHash();
})();
