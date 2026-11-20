(() => {
  'use strict';
  const button = document.getElementById('start-chat');
  const status = document.getElementById('chat-status');
  const config = window.CoOpMessenger;
  if (!config || config.enabled !== true || config.region !== 'eu-west-1' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(config.deploymentId || '')) return;
  let loading = false;
  let ready = false;
  let timer;
  button.disabled = false;
  status.textContent = 'Start a conversation with Co-op online shopping.';
  const unavailable = () => { clearTimeout(timer); loading = false; button.disabled = true; status.textContent = 'Messaging is currently unavailable. Please try again later.'; };
  button.addEventListener('click', () => {
    if (ready) {
      window.Genesys('command', 'Messenger.open', {}, () => {}, unavailable);
      return;
    }
    if (loading) return;
    loading = true; button.disabled = true; status.textContent = 'Opening your conversation…';
    // Same official regional bootstrap as the existing website, on deliberate start only.
    const genesys = function () { (genesys.q = genesys.q || []).push(arguments); };
    genesys.t = Date.now(); genesys.c = { environment: 'prod-euw1', deploymentId: config.deploymentId };
    window._genesysJs = 'Genesys'; window.Genesys = genesys;
    genesys('subscribe', 'Messenger.ready', () => {
      if (!loading) return;
      clearTimeout(timer); ready = true; loading = false; button.disabled = false;
      status.textContent = 'Your Co-op online shopping conversation is ready.';
      genesys('command', 'Messenger.open', {}, () => {}, unavailable);
    });
    genesys('subscribe', 'Messenger.error', unavailable);
    const script = document.createElement('script');
    script.src = 'https://apps.mypurecloud.ie/genesys-bootstrap/genesys.min.js'; script.async = true; script.onerror = unavailable;
    timer = setTimeout(unavailable, 20000);
    document.head.appendChild(script);
  });
})();
