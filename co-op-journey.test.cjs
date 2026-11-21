const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');

function setup({ engine = false, reduced = false, hash = '' } = {}) {
  const events = {};
  const all = [];
  const timelines = [];
  class Element {
    constructor(id) { this.id = id; this.attributes = {}; this.events = {}; this.hidden = false; this.disabled = false; this.textContent = ''; this.classes = new Set(); this.classList = { add: value => this.classes.add(value), toggle: (value, enabled) => enabled ? this.classes.add(value) : this.classes.delete(value) }; all.push(this); }
    setAttribute(key, value) { this.attributes[key] = value; }
    removeAttribute(key) { delete this.attributes[key]; }
    addEventListener(key, fn) { this.events[key] = fn; }
    focus() { document.activeElement = this; }
    getTotalLength() { return 250; }
  }
  const root = new Element('journey');
  const controls = new Element('journey-controls');
  const previous = new Element('previous-stage');
  const next = new Element('next-stage');
  const position = new Element('journey-position');
  const nav = new Element('nav');
  const tabs = ['customer', 'assistant', 'knowledge', 'adviser'].map(stage => { const e = new Element('tab-' + stage); e.dataset = { stage }; e.textContent = stage; return e; });
  const panels = tabs.map(tab => new Element('stage-' + tab.dataset.stage));
  const edges = [0, 1, 2].map(i => new Element('edge-' + i));
  const document = { hidden: false, getElementById: id => all.find(e => e.id === id), querySelector: () => nav, querySelectorAll: selector => selector === '[data-stage]' ? tabs : edges, addEventListener: (event, callback) => { events[event] = callback; } };
  const preference = { matches: reduced, addEventListener: (_, callback) => { events.preference = callback; } };
  const window = { location: { hash }, history: { state: null, replaceState(_a, _b, value) { window.location.hash = value; } }, matchMedia: () => preference, addEventListener: (event, callback) => { events[event] = callback; } };
  if (engine) window.gsap = { timeline() {
    const timeline = { killed: false, fromTo(element) { element.setAttribute('style', 'owned-animation'); return this; }, kill() { this.killed = true; } };
    timelines.push(timeline); return timeline;
  } };
  vm.runInNewContext(fs.readFileSync('co-op-journey/journey.js', 'utf8'), { document, window });
  const click = index => { let prevented = false; tabs[index].events.click({ preventDefault() { prevented = true; } }); return prevented; };
  return { root, tabs, panels, edges, next, previous, controls, document, window, events, preference, timelines, click };
}

test('the whole authored journey works without GSAP, with one selected panel and bounded navigation', () => {
  const h = setup();
  assert.equal(h.panels.filter(p => !p.hidden).length, 1);
  assert.equal(h.previous.disabled, true);
  h.next.events.click();
  assert.equal(h.panels[1].hidden, false);
  assert.equal(h.document.activeElement, h.tabs[1]);
  assert.equal(h.window.location.hash, '#stage-assistant');
  h.click(3);
  assert.equal(h.next.disabled, true);
  assert.equal(h.tabs[3].attributes['aria-controls'], h.panels[3].id);
  assert.equal(h.panels.filter(p => !p.hidden).length, 1);
});

test('rapid stage changes cancel old motion and reduced-motion changes settle the selected state', () => {
  const h = setup({ engine: true });
  h.click(2);
  const first = h.timelines[0];
  h.click(3);
  assert.equal(first.killed, true);
  assert.equal(h.panels[2].attributes.style, undefined);
  assert.equal(h.panels[3].hidden, false);
  h.preference.matches = true;
  h.events.preference();
  assert.equal(h.timelines[1].killed, true);
  assert.equal(h.panels[3].attributes.style, undefined);
  h.click(1);
  assert.equal(h.timelines.length, 2);
  assert.equal(h.panels[1].hidden, false);
});

test('deep links, horizontal keys and visibility changes preserve the selected explanation', () => {
  const h = setup({ hash: '#stage-knowledge', engine: true });
  assert.equal(h.panels[2].hidden, false);
  h.tabs[2].events.keydown({ key: 'End', preventDefault() {} });
  assert.equal(h.document.activeElement, h.tabs[3]);
  h.document.hidden = true;
  h.events.visibilitychange();
  assert.equal(h.timelines[0].killed, true);
  assert.equal(h.panels[3].hidden, false);
  h.window.location.hash = '#stage-customer';
  h.events.hashchange();
  assert.equal(h.panels[0].hidden, false);
  assert.equal(h.timelines.length, 1);
});

test('the pinned GSAP asset retains integrity and runs the sequencing API used by the journey', () => {
  const bytes = fs.readFileSync('assets/vendor/gsap/gsap.min.js');
  const source = JSON.parse(fs.readFileSync('assets/vendor/gsap/source.json', 'utf8'));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), source.files['gsap.min.js']);
  const sri = 'sha384-' + crypto.createHash('sha384').update(bytes).digest('base64');
  assert.ok(fs.readFileSync('co-op-journey/index.html', 'utf8').includes(sri));
  const { gsap } = require('./assets/vendor/gsap/gsap.min.js');
  assert.equal(gsap.version, source.version);
  const state = { progress: 0 };
  const timeline = gsap.timeline({ paused: true }).to(state, { progress: 1, duration: .5 });
  timeline.progress(1);
  assert.equal(state.progress, 1);
  timeline.kill(); gsap.ticker.sleep();
});
