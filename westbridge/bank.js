const status = document.querySelector('#message-status');
const buttons = [...document.querySelectorAll('[data-message]')];
let subscribed = false;
let databaseReady = false;
let messengerReady = false;
let opened = false;
let pending;
let notice = '';

function finish(attempt, message = '', kind = '') {
  if (pending !== attempt) return;
  clearTimeout(attempt.timer);
  pending = undefined;
  for (const button of buttons) button.disabled = false;
  status.textContent = message;
  notice = kind;
}

function advance() {
  const attempt = pending;
  if (!attempt) return;
  if (attempt.phase === 'context' && databaseReady) {
    attempt.phase = 'setting';
    window.Genesys('command', 'Database.set', {
      messaging: { customAttributes: { 'westbridge.journeyHint': attempt.journey } },
    }, () => {
      if (pending !== attempt || attempt.phase !== 'setting') return;
      attempt.phase = 'ready';
      advance();
    }, () => {
      if (attempt.phase === 'setting') finish(attempt, 'Please try opening messaging again.', 'context');
    });
  } else if (attempt.phase === 'ready') {
    if (opened) { finish(attempt); return; }
    if (!messengerReady) return;
    attempt.phase = 'opening';
    window.Genesys('command', 'Messenger.open', {}, () => {
      if (pending !== attempt) return;
      opened = true;
      finish(attempt);
    }, error => {
      if (pending !== attempt) return;
      // The SDK rejects opening an already visible native Messenger window.
      if ((typeof error === 'string' ? error : error?.message) === 'Messenger is already opened.') {
        opened = true;
        finish(attempt);
      } else finish(attempt, 'Messaging is unavailable. Please try again shortly.', 'availability');
    });
  }
}

function subscribe() {
  if (subscribed || typeof window.Genesys !== 'function') return;
  subscribed = true;
  // Subscribe once so readiness received before a launcher click is retained.
  window.Genesys('subscribe', 'Database.ready', () => { databaseReady = true; advance(); });
  window.Genesys('subscribe', 'Messenger.ready', () => { messengerReady = true; advance(); });
  window.Genesys('subscribe', 'Messenger.opened', () => {
    opened = true;
    if (pending?.phase === 'opening' || pending?.phase === 'ready') finish(pending);
    else if (!pending && notice === 'availability') {
      status.textContent = '';
      notice = '';
    }
  });
  window.Genesys('subscribe', 'Messenger.closed', () => { opened = false; });
}

subscribe();
for (const button of buttons) {
  button.addEventListener('click', () => {
    if (pending) return;
    if (typeof window.Genesys !== 'function') {
      status.textContent = 'Messaging is being connected. Please try again shortly.';
      notice = 'availability';
      document.querySelector('#help').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    subscribe();
    for (const launcher of buttons) launcher.disabled = true;
    status.textContent = 'Opening messaging…';
    notice = '';
    const attempt = { journey: button.dataset.message || 'address', phase: 'context', timer: undefined };
    pending = attempt;
    attempt.timer = setTimeout(() => finish(attempt,
      attempt.phase === 'setting' ? 'Please try opening messaging again.' : 'Messaging is unavailable. Please try again shortly.',
      attempt.phase === 'setting' ? 'context' : 'availability'), 12000);
    advance();
  });
}
