const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup({ mobile = false, hash = '', missingPanel = false } = {}) {
  const changes = {};
  class Element {
    constructor(id) { this.id = id; this.attributes = {}; this.events = {}; this.tabIndex = 0; this.hidden = true; }
    setAttribute(name, value) { this.attributes[name] = value; }
    getAttribute(name) { return this.attributes[name]; }
    addEventListener(name, handler) { this.events[name] = handler; }
    focus() { document.activeElement = this; }
  }
  const tabs = ['delivery', 'collection', 'missing'].map(topic => {
    const tab = new Element('help-tab-' + topic);
    tab.dataset = { helpTopic: topic };
    tab.setAttribute('href', '#' + topic);
    tab.querySelector = () => ({ textContent: topic });
    return tab;
  });
  const panels = tabs.map(tab => new Element('help-panel-' + tab.dataset.helpTopic));
  const list = new Element('list');
  const guide = { querySelector: () => list, querySelectorAll: () => tabs, classList: { add(value) { guide.enhanced = value; } } };
  const preference = { matches: mobile, addEventListener: (_, callback) => { changes.mobile = callback; } };
  const document = { activeElement: null, querySelector: () => guide, getElementById: id => panels.find(panel => panel.id === id && !(missingPanel && id.endsWith('missing'))) };
  const window = { location: { hash }, matchMedia: () => preference, addEventListener: (name, callback) => { changes[name] = callback; } };
  vm.runInNewContext(fs.readFileSync('co-op/help-guide.js', 'utf8'), { document, window });
  function fire(index, type, options = {}) {
    const event = { prevented: false, preventDefault() { this.prevented = true; }, ...options };
    tabs[index].events[type](event);
    return event;
  }
  return { tabs, panels, list, guide, document, window, preference, changes, fire };
}

function selected(h, index) {
  assert.deepEqual(h.tabs.map(tab => tab.attributes['aria-selected']), h.tabs.map((_, i) => String(i === index)));
  assert.deepEqual(h.panels.map(panel => panel.hidden), h.panels.map((_, i) => i !== index));
  assert.deepEqual(h.tabs.map(tab => tab.tabIndex), h.tabs.map((_, i) => i === index ? 0 : -1));
}

test('help selection exposes one labelled panel and retains ordinary modified-link behavior', () => {
  const h = setup();
  selected(h, 0);
  assert.equal(h.panels[0].attributes['aria-labelledby'], h.tabs[0].id);
  assert.equal(h.tabs[0].attributes['aria-controls'], h.panels[0].id);
  assert.equal(h.fire(2, 'click', { ctrlKey: true }).prevented, false);
  selected(h, 0);
  assert.equal(h.fire(2, 'click').prevented, true);
  selected(h, 2);
  assert.equal(h.window.location.hash, '');
});

test('vertical keyboard navigation wraps and Home/End move focus with selection', () => {
  const h = setup();
  h.fire(0, 'keydown', { key: 'ArrowUp' });
  selected(h, 2);
  assert.equal(h.document.activeElement, h.tabs[2]);
  h.fire(2, 'keydown', { key: 'ArrowDown' });
  selected(h, 0);
  h.fire(0, 'keydown', { key: 'End' });
  selected(h, 2);
  h.fire(2, 'keydown', { key: 'Home' });
  selected(h, 0);
  assert.equal(h.fire(0, 'keydown', { key: 'ArrowRight' }).prevented, false);
});

test('mobile arrows follow horizontal orientation while vertical keys keep browser scrolling', () => {
  const h = setup({ mobile: true });
  assert.equal(h.list.attributes['aria-orientation'], 'horizontal');
  h.fire(0, 'keydown', { key: 'ArrowRight' });
  selected(h, 1);
  assert.equal(h.fire(1, 'keydown', { key: 'ArrowDown' }).prevented, false);
  assert.equal(h.fire(1, 'keydown', { key: 'ArrowRight', altKey: true }).prevented, false);
  h.preference.matches = false;
  h.changes.mobile();
  assert.equal(h.list.attributes['aria-orientation'], 'vertical');
  selected(h, 1);
});

test('existing guidance hashes select the matching topic; incomplete enhancement keeps plain links', () => {
  const h = setup({ hash: '#missing' });
  selected(h, 2);
  h.window.location.hash = '#collection';
  h.changes.hashchange();
  selected(h, 1);
  h.window.location.hash = '#unknown';
  h.changes.hashchange();
  selected(h, 1);
  const partial = setup({ missingPanel: true });
  assert.equal(partial.guide.enhanced, undefined);
  assert.equal(partial.tabs[0].attributes.role, undefined);
  assert.equal(partial.tabs[0].attributes.href, '#delivery');
});
