const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup({ supported = true, hash = '' } = {}) {
  const byId = new Map();
  let document;
  class Element {
    constructor(id = '', dataset = {}) {
      this.id = id; this.dataset = dataset; this.events = {}; this.attributes = {};
      this.hidden = true; this.disabled = true; this.checked = false;
      this.classList = { values: new Set(), add(name) { this.values.add(name); }, remove(name) { this.values.delete(name); } };
      if (id) byId.set(id, this);
    }
    addEventListener(type, callback) { (this.events[type] ||= []).push(callback); }
    setAttribute(name, value) { this.attributes[name] = value; }
    removeAttribute(name) { delete this.attributes[name]; }
    focus() { document.activeElement = this; }
    querySelector(selector) { return this.one?.[selector]; }
    querySelectorAll(selector) { return this.many?.[selector] || []; }
    replaceWith(element) { this.replacedBy = element; }
    appendChild(element) { this.child = element; }
    showModal() { this.open = true; }
    close() { this.open = false; this.fire('close'); }
    scrollIntoView() { this.scrolled = true; }
    fire(type, options = {}) {
      const event = { prevented: false, preventDefault() { this.prevented = true; }, ...options };
      for (const callback of this.events[type] || []) callback(event);
      return event;
    }
  }
  const receipt = new Element('order-details');
  const items = [['oat', 'Oat drink, 1 litre', '1 carton'], ['bread', 'Wholemeal bread', '1 loaf'], ['bananas', 'Bananas', '1 bunch']].map(([value, itemName, itemQuantity]) => Object.assign(new Element('', { itemName, itemQuantity }), { value }));
  const issues = ['missing', 'damaged', 'wrong'].map(value => Object.assign(new Element(), { value }));
  const steps = ['item', 'issue', 'next'].map(name => { const el = new Element('', { supportStep: name }); el.one = { h3: new Element(name + '-heading') }; return el; });
  const progress = new Element();
  const labels = ['item', 'issue', 'next'].map(name => new Element('', { progress: name }));
  const guidance = issues.map(input => new Element('', { guidance: input.value }));
  const itemLabels = [new Element(), new Element()];
  const quantityLabels = [new Element(), new Element()];
  const backs = ['item', 'issue', 'item'].map(name => new Element('', { back: name }));
  receipt.one = { '.support-progress': progress, '.support-body': new Element(), '.support-hint': new Element() };
  receipt.many = { '[name="order-item"]': items, '[name="order-issue"]': issues, '[data-support-step]': steps, '[data-progress]': labels, '[data-selected-item]': itemLabels, '[data-selected-quantity]': quantityLabels, '[data-guidance]': guidance, '[data-back]': backs };
  for (const id of ['receipt-title', 'choose-issue', 'show-next-step', 'close-order', 'selected-issue', 'support-contact']) new Element(id);
  const openers = [new Element('open-order'), new Element('view-order')];
  const contact = new Element('contact');
  contact.one = { h2: new Element('contact-heading') };
  document = { activeElement: null, documentElement: new Element(), getElementById: id => byId.get(id), querySelectorAll: () => openers, createElement: () => new Element() };
  const window = { HTMLDialogElement: supported ? Element : undefined, location: { hash }, events: {}, addEventListener(type, handler) { this.events[type] = handler; } };
  vm.runInNewContext(fs.readFileSync('co-op/order-support.js', 'utf8'), { document, window });
  const select = (inputs, index) => { inputs.forEach((input, i) => { input.checked = i === index; }); inputs[index].fire('change'); };
  return { document, window, receipt, items, issues, steps, labels, guidance, itemLabels, quantityLabels, backs, byId, openers, select, get dialog() { return receipt.replacedBy; } };
}

function stage(h, name) {
  assert.deepEqual(h.steps.map(step => step.hidden), h.steps.map(step => step.dataset.supportStep !== name));
  assert.deepEqual(h.labels.map(label => label.attributes['aria-current']), h.labels.map(label => label.dataset.progress === name ? 'step' : undefined));
}

test('receipt keeps a plain fallback without dialog support; enhancement does not invent a selection', () => {
  const fallback = setup({ supported: false });
  assert.equal(fallback.dialog, undefined);
  assert.equal(fallback.items.every(item => item.hidden && item.disabled), true);
  const h = setup();
  stage(h, 'item');
  assert.equal(h.byId.get('choose-issue').disabled, true);
  h.byId.get('show-next-step').fire('click');
  stage(h, 'item');
  assert.equal(h.items.every(item => !item.hidden && !item.disabled), true);
  assert.equal(h.openers[0].fire('click', { ctrlKey: true }).prevented, false);
  assert.equal(h.dialog.open, undefined);
});

test('each issue shows only its guidance and carries the chosen receipt item and quantity', () => {
  for (let index = 0; index < 3; index++) {
    const h = setup();
    h.openers[0].fire('click');
    h.select(h.items, index);
    h.byId.get('choose-issue').fire('click');
    stage(h, 'issue');
    h.byId.get('show-next-step').fire('click');
    stage(h, 'issue');
    h.select(h.issues, index);
    h.byId.get('show-next-step').fire('click');
    stage(h, 'next');
    assert.deepEqual(h.guidance.map(panel => panel.hidden), [0, 1, 2].map(i => i !== index));
    assert.equal(h.itemLabels.every(label => label.textContent === h.items[index].dataset.itemName), true);
    assert.equal(h.quantityLabels.every(label => label.textContent === h.items[index].dataset.itemQuantity), true);
    assert.equal(h.document.activeElement.id, 'next-heading');
  }
});

test('editing an item updates the next step and closing/reopening preserves the current choices', () => {
  const h = setup();
  h.openers[1].fire('click');
  h.select(h.items, 0);
  h.byId.get('choose-issue').fire('click');
  h.select(h.issues, 0);
  h.byId.get('show-next-step').fire('click');
  h.backs[2].fire('click');
  h.select(h.items, 2);
  h.byId.get('choose-issue').fire('click');
  h.select(h.issues, 1);
  h.byId.get('show-next-step').fire('click');
  assert.equal(h.itemLabels[0].textContent, 'Bananas');
  assert.equal(h.byId.get('selected-issue').textContent, 'It’s damaged');
  h.byId.get('close-order').fire('click');
  assert.equal(h.document.activeElement, h.openers[1]);
  assert.equal(h.document.documentElement.classList.values.has('order-support-open'), false);
  h.openers[0].fire('click');
  stage(h, 'next');
  assert.equal(h.items[2].checked, true);
  assert.equal(h.issues[1].checked, true);
});

test('direct receipt links open the drawer and contact handoff closes it and focuses the existing contact section', () => {
  const h = setup({ hash: '#order-details' });
  assert.equal(h.dialog.open, true);
  assert.equal(h.document.documentElement.classList.values.has('order-support-open'), true);
  assert.equal(h.byId.get('support-contact').fire('click', { metaKey: true }).prevented, false);
  assert.equal(h.dialog.open, true);
  h.byId.get('support-contact').fire('click');
  assert.equal(h.dialog.open, false);
  assert.equal(h.document.activeElement.id, 'contact-heading');
  assert.equal(h.byId.get('contact').scrolled, true);
  assert.equal(h.document.documentElement.classList.values.has('order-support-open'), false);
});
