(() => {
  'use strict';
  const dialog = document.getElementById('order-dialog');
  const open = () => dialog.showModal();
  document.getElementById('open-order').addEventListener('click', open);
  document.getElementById('view-order').addEventListener('click', open);
  document.getElementById('close-order').addEventListener('click', () => dialog.close());
  document.getElementById('receipt-missing').addEventListener('click', () => {
    dialog.close();
    const target = document.getElementById('missing');
    target.open = true;
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    target.querySelector('summary').focus({ preventScroll: true });
  });
  document.querySelectorAll('.card').forEach(link => link.addEventListener('click', () => {
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (target instanceof HTMLDetailsElement) target.open = true;
  }));
})();
