(() => {
  'use strict';
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
