(() => {
  'use strict';
  const config = window.aledsCarsMessenger;
  const localPreview = ['localhost', '127.0.0.1'].includes(location.hostname);
  const allowedHost = location.hostname === 'simonridd.github.io';
  const configured = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(config?.deploymentId || '');
  let loading;
  const status = document.getElementById('message-status');
  function show(message) {
    status.textContent = message;
    if (message) status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function loadMessenger() {
    if (loading) return loading;
    loading = new Promise((resolve, reject) => {
      window._genesysJs = 'Genesys';
      window.Genesys = window.Genesys || function () { (window.Genesys.q = window.Genesys.q || []).push(arguments); };
      window.Genesys.t = Date.now();
      window.Genesys.c = { environment: config.environment, deploymentId: config.deploymentId };
      const timer = setTimeout(() => reject(new Error('timeout')), 15000);
      window.Genesys('subscribe', 'Messenger.ready', () => { clearTimeout(timer); resolve(); });
      const script = document.createElement('script');
      script.src = 'https://apps.mypurecloud.ie/genesys-bootstrap/genesys.min.js';
      script.async = true;
      script.onerror = () => { clearTimeout(timer); reject(new Error('unavailable')); };
      document.head.appendChild(script);
    });
    return loading;
  }
  document.querySelectorAll('[data-message]').forEach(button => button.addEventListener('click', async () => {
    if (!configured || localPreview || !allowedHost) { show('Messaging is unavailable here. Please use our published website.'); return; }
    button.disabled = true;
    show('Opening messaging…');
    try {
      await loadMessenger();
      window.Genesys('command', 'Messenger.open', {}, () => show(''), error => {
        if ((typeof error === 'string' ? error : error?.message) === 'Messenger is already opened.') show('');
        else show('We couldn’t open messaging. Please refresh the page and try again.');
      });
    } catch { show('Messaging couldn’t load. Please refresh the page and try again.'); }
    finally { button.disabled = false; }
  }));
})();
