/* A native dialog enhances the same receipt that remains inline without scripts. */
(() => {
  'use strict';
  const receipt = document.getElementById('order-details');
  if (!receipt || typeof window.HTMLDialogElement !== 'function' ||
      typeof window.HTMLDialogElement.prototype.showModal !== 'function') return;
  const items = [...receipt.querySelectorAll('[name="order-item"]')];
  const issues = [...receipt.querySelectorAll('[name="order-issue"]')];
  const steps = [...receipt.querySelectorAll('[data-support-step]')];
  const progress = receipt.querySelector('.support-progress');
  const chooseIssue = document.getElementById('choose-issue');
  const showNext = document.getElementById('show-next-step');
  const close = document.getElementById('close-order');
  if (!items.length || !issues.length || steps.length !== 3 || !progress || !chooseIssue || !showNext || !close) return;

  const dialog = document.createElement('dialog');
  dialog.id = 'order-dialog';
  dialog.setAttribute('aria-labelledby', 'receipt-title');
  receipt.replaceWith(dialog);
  dialog.appendChild(receipt);
  receipt.classList.add('support-enhanced');
  let item = null;
  let issue = null;
  let opener = null;
  let returnFocus = true;
  const issueNames = { missing: 'It hasn’t arrived', damaged: 'It’s damaged', wrong: 'It’s the wrong item' };

  function selectStep(name, focus = true) {
    // A stale/invalid selection can never expose a misleading next step.
    if (name !== 'item' && !item) name = 'item';
    if (name === 'next' && !issue) name = 'issue';
    const target = steps.find(step => step.dataset.supportStep === name);
    steps.forEach(step => { step.hidden = step !== target; });
    receipt.querySelectorAll('[data-progress]').forEach(label => {
      if (label.dataset.progress === name) label.setAttribute('aria-current', 'step');
      else label.removeAttribute('aria-current');
    });
    receipt.querySelectorAll('[data-selected-item]').forEach(label => { label.textContent = item?.dataset.itemName || ''; });
    receipt.querySelectorAll('[data-selected-quantity]').forEach(label => { label.textContent = item?.dataset.itemQuantity || ''; });
    document.getElementById('selected-issue').textContent = issueNames[issue] || '';
    receipt.querySelectorAll('[data-guidance]').forEach(panel => { panel.hidden = name !== 'next' || panel.dataset.guidance !== issue; });
    receipt.querySelector('.support-body').scrollTop = 0;
    if (focus) target.querySelector('h3').focus();
  }

  items.forEach(input => {
    input.hidden = false;
    input.disabled = false;
    input.addEventListener('change', () => {
      if (!input.checked) return;
      item = input;
      chooseIssue.disabled = false;
    });
  });
  issues.forEach(input => input.addEventListener('change', () => {
    if (!input.checked || !Object.hasOwn(issueNames, input.value)) return;
    issue = input.value;
    showNext.disabled = false;
  }));
  chooseIssue.addEventListener('click', () => selectStep('issue'));
  showNext.addEventListener('click', () => selectStep('next'));
  receipt.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => selectStep(button.dataset.back)));
  function openReceipt(link) {
    opener = link;
    returnFocus = true;
    if (!dialog.open) dialog.showModal();
    document.documentElement.classList.add('order-support-open');
    receipt.querySelector('.support-body').scrollTop = 0;
    document.getElementById('receipt-title').focus({ preventScroll: true });
  }
  document.querySelectorAll('[data-open-order]').forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button > 0) return;
    event.preventDefault();
    openReceipt(link);
  }));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('order-support-open');
    if (returnFocus) opener?.focus({ preventScroll: true });
  });
  // Keep the native Escape behavior; no delayed closing animation or global key trap.
  document.getElementById('support-contact').addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button > 0) return;
    event.preventDefault();
    returnFocus = false;
    dialog.close();
    const contact = document.getElementById('contact');
    const heading = contact.querySelector('h2');
    heading.tabIndex = -1;
    contact.scrollIntoView({ behavior: 'auto', block: 'start' });
    heading.focus({ preventScroll: true });
  });
  function openLinkedReceipt() {
    if (window.location.hash !== '#order-details' || dialog.open) return;
    openReceipt(document.getElementById('open-order'));
  }
  document.getElementById('item-heading').textContent = 'Which item can we help with?';
  receipt.querySelector('.support-hint').textContent = 'Choose an item from your latest shop.';
  close.hidden = false;
  progress.hidden = false;
  chooseIssue.hidden = false;
  selectStep('item', false);
  window.addEventListener('hashchange', openLinkedReceipt);
  openLinkedReceipt();
})();
