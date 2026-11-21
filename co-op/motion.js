(() => {
  'use strict';
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scene = document.querySelector('.hero-visual');
  const replay = document.getElementById('replay-scene');
  const van = document.querySelector('.delivery-scene');
  let sceneTimer;
  let vanTimer;
  let observer;
  const running = new Set();
  const seen = new WeakSet();

  function stopScene() {
    window.clearTimeout(sceneTimer);
    scene.classList.remove('scene-playing');
    replay.disabled = false;
    replay.querySelector('span').textContent = 'Watch it again';
  }

  function playScene() {
    if (preference.matches || scene.classList.contains('scene-playing')) return;
    scene.classList.add('scene-playing');
    replay.disabled = true;
    replay.querySelector('span').textContent = 'Packing the good stuff';
    sceneTimer = window.setTimeout(stopScene, 2300);
  }

  function reveal(element) {
    if (seen.has(element)) return;
    seen.add(element);
    if (element === van) {
      van.classList.add('delivery-playing');
      vanTimer = window.setTimeout(() => van.classList.remove('delivery-playing'), 1800);
    } else if (typeof element.animate === 'function' && !element.contains(document.activeElement)) {
      const animation = element.animate([
        { opacity: 0, transform: 'translateY(18px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)' });
      running.add(animation);
      animation.finished.then(() => running.delete(animation), () => running.delete(animation));
    }
  }

  function syncPreference() {
    observer?.disconnect();
    if (preference.matches) {
      stopScene();
      window.clearTimeout(vanTimer);
      van.classList.remove('delivery-playing');
      running.forEach(animation => animation.cancel());
      running.clear();
      document.documentElement.classList.remove('motion-available');
      return;
    }
    document.documentElement.classList.add('motion-available');
    if (!('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    document.querySelectorAll('.section-heading, .card, .order-strip, .answers > div, .contact, .delivery-scene').forEach(element => {
      if (!seen.has(element)) observer.observe(element);
    });
  }

  replay.addEventListener('click', playScene);
  preference.addEventListener('change', syncPreference);
  document.addEventListener('focusin', () => {
    // Never animate keyboard focus out of view while a section is arriving.
    running.forEach(animation => animation.cancel());
    running.clear();
  });
  syncPreference();
  playScene();
})();
