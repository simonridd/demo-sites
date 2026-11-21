(() => {
  'use strict';
  const dialog = document.getElementById('order-dialog');
  const open = () => dialog.showModal();
  document.querySelectorAll('[data-open-order]').forEach(button => button.addEventListener('click', open));
  document.getElementById('close-order').addEventListener('click', () => dialog.close());
  document.getElementById('receipt-missing').addEventListener('click', () => {
    dialog.close();
    const target = document.getElementById('missing');
    target.open = true;
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    target.querySelector('summary').focus({ preventScroll: true });
  });
  document.querySelectorAll('.card').forEach(link => link.addEventListener('click', () => {
    if (link.getAttribute('role') === 'tab') return;
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (target instanceof HTMLDetailsElement) target.open = true;
  }));
  const revealLinkedAnswer = () => {
    const target = document.getElementById(window.location.hash.slice(1));
    if (target instanceof HTMLDetailsElement) target.open = true;
  };
  window.addEventListener('hashchange', revealLinkedAnswer);
  revealLinkedAnswer();
})();
