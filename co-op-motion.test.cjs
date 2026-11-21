const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function harness({ reduced = false, observerSupported = true } = {}) {
  const timers = new Map();
  const events = {};
  const classes = () => {
    const values = new Set();
    return { add: value => values.add(value), remove: value => values.delete(value), contains: value => values.has(value) };
  };
  const scene = { classList: classes() };
  const van = { classList: classes() };
  const animation = { finished: new Promise(() => {}), cancelled: false, cancel() { this.cancelled = true; } };
  const card = { contains: () => false, animate: () => { card.animated = true; return animation; } };
  const preference = { matches: reduced, addEventListener: (_, handler) => { events.preference = handler; } };
  const root = { classList: classes() };
  const document = {
    activeElement: null, documentElement: root,
    querySelector: selector => selector === '.hero-visual' ? scene : van,
    querySelectorAll: () => [card, van],
    addEventListener: (event, handler) => { events[event] = handler; }
  };
  let intersection;
  class Observer {
    constructor(handler) { intersection = handler; }
    observe() {} unobserve() {} disconnect() {}
  }
  const window = {
    matchMedia: () => preference,
    setTimeout: handler => { const id = {}; timers.set(id, handler); return id; },
    clearTimeout: id => timers.delete(id)
  };
  if (observerSupported) window.IntersectionObserver = Observer;
  vm.runInNewContext(fs.readFileSync('co-op/motion.js', 'utf8'), { window, document, IntersectionObserver: Observer, WeakSet, Set });
  return { timers, events, scene, van, card, animation, preference, root,
    intersect: (...targets) => intersection(targets.map(target => ({ target, isIntersecting: true }))) };
}

test('reduced motion on first load leaves content and controls still, without scheduling decorative playback', () => {
  const h = harness({ reduced: true });
  assert.equal(h.timers.size, 0);
  assert.equal(h.scene.classList.contains('scene-playing'), false);
  assert.equal(h.root.classList.contains('motion-available'), false);
});

test('changing motion preference cancels in-flight reveals and decorative playback', () => {
  const h = harness();
  h.intersect(h.card, h.van);
  assert.equal(h.card.animated, true);
  assert.equal(h.van.classList.contains('delivery-playing'), true);
  h.preference.matches = true;
  h.events.preference();
  assert.equal(h.animation.cancelled, true);
  assert.equal(h.timers.size, 0);
  assert.equal(h.scene.classList.contains('scene-playing'), false);
  assert.equal(h.van.classList.contains('delivery-playing'), false);
});

test('the illustration plays once naturally and finishes without a replay control', () => {
  const h = harness();
  assert.equal(h.scene.classList.contains('scene-playing'), true);
  assert.equal(h.timers.size, 1);
  [...h.timers.values()][0]();
  assert.equal(h.scene.classList.contains('scene-playing'), false);
  assert.equal(h.timers.size, 0);
  assert.equal(h.events.click, undefined);
  assert.doesNotMatch(fs.readFileSync('co-op/index.html', 'utf8'), /replay-scene|Watch it again/i);
});

test('keyboard focus cancels section movement; missing IntersectionObserver does not break the page', () => {
  const h = harness();
  h.intersect(h.card);
  h.events.focusin();
  assert.equal(h.animation.cancelled, true);
  const fallback = harness({ observerSupported: false });
  assert.equal(fallback.card.animated, undefined);
  assert.equal(fallback.root.classList.contains('motion-available'), true);
});
