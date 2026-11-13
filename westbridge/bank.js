const status = document.querySelector('#message-status');
for (const button of document.querySelectorAll('[data-message]')) {
  button.addEventListener('click', () => {
    if (typeof window.Genesys !== 'function') {
      status.textContent = 'Messaging is being connected. Please try again shortly.';
      document.querySelector('#help').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    button.disabled = true;
    status.textContent = 'Opening messaging…';
    let complete = false;
    let contextSent = false;
    const finish = (message) => {
      if (complete) return;
      complete = true;
      clearTimeout(timer);
      button.disabled = false;
      status.textContent = message;
    };
    const timer = setTimeout(() => finish('Messaging is unavailable. Please try again shortly.'), 12000);
    window.Genesys('subscribe', 'Database.ready', () => {
      if (complete || contextSent) return;
      contextSent = true;
      window.Genesys('command', 'Database.set', {
        messaging: { customAttributes: { 'westbridge.journeyHint': button.dataset.message || 'address' } },
      }, () => {
        if (complete) return;
        window.Genesys('command', 'Messenger.open', {}, () => finish(''), () => finish('Messaging is unavailable. Please try again shortly.'));
      }, () => finish('Messaging is unavailable. Please try again shortly.'));
    });
  });
}
