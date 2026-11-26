(() => {
  const dialog = document.querySelector('#repair-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const form = document.querySelector('#repair-form');
  const heading = document.querySelector('#dialog-title');
  const stages = [...form.querySelectorAll('[data-step]')];
  const back = form.querySelector('.back');
  const next = form.querySelector('.next');
  const issueBox = document.querySelector('#issues');
  const issues = {
    'Boiler & heating': ['No heating or hot water', 'No heating', 'No hot water', 'Something else'],
    'Plumbing & drains': ['A water leak', 'A blocked drain', 'A plumbing problem', 'Something else'],
    'Another home repair': ['An electrical problem', 'An appliance problem', 'Another home problem']
  };
  let step = 0, trigger = null, renderedService = '', selectedIssue = '';
  const service = () => form.querySelector('[name=service]:checked').value;
  function renderIssues() {
    if (renderedService === service()) return;
    renderedService = service(); selectedIssue = issues[renderedService][0];
    issueBox.replaceChildren();
    const legend = document.createElement('legend'); legend.className = 'sr-only'; legend.textContent = 'What is the problem?'; issueBox.append(legend);
    issues[renderedService].forEach((value, i) => {
      const label = document.createElement('label'); label.className = 'choice';
      const input = document.createElement('input'); input.type = 'radio'; input.name = 'issue'; input.value = value; input.checked = i === 0;
      const text = document.createElement('span'); text.textContent = value;
      label.append(input, text); issueBox.append(label);
    });
    document.querySelector('#issue-intro').textContent = renderedService === 'Boiler & heating' ? 'What’s happening with your boiler or heating?' : 'Which best describes what you need help with?';
  }
  function show() {
    if (step >= 1) renderIssues();
    stages.forEach((node, i) => node.hidden = i !== step);
    heading.textContent = ['What needs a little help?', 'Tell us what’s happening.', 'Your next step is ready.'][step];
    document.querySelector('#step-label').textContent = `YOUR REPAIR · STEP ${step + 1} OF 3`;
    back.hidden = step === 0; next.hidden = step === 2;
    if (step === 2) {
      document.querySelector('#copy-status').textContent = '';
      selectedIssue = form.querySelector('[name=issue]:checked').value;
      document.querySelector('#summary-service').textContent = service();
      document.querySelector('#summary-issue').textContent = selectedIssue;
    }
    document.querySelector('.dialog-body').scrollTop = 0;
    heading.focus({ preventScroll: true });
  }
  document.querySelectorAll('[data-open-repair]').forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); trigger = link;
    if (link.dataset.service) [...form.querySelectorAll('[name=service]')].forEach(input => input.checked = input.value === link.dataset.service);
    dialog.showModal(); document.body.classList.add('modal-open'); show();
  }));
  form.addEventListener('submit', event => { event.preventDefault(); if (step < 2) { step++; show(); } });
  back.addEventListener('click', () => { if (step > 0) { step--; show(); } });
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); trigger?.focus(); });
  dialog.querySelector('.copy-button').addEventListener('click', async () => {
    const summary = `${service()}: ${selectedIssue}. I’d like help requesting a repair. Please check my cover and any excess before proceeding.`;
    try { await navigator.clipboard.writeText(summary); document.querySelector('#copy-status').textContent = 'Repair summary copied.'; }
    catch { document.querySelector('#copy-status').textContent = 'You can select and copy the repair details above.'; }
  });
  document.documentElement.classList.add('enhanced');
})();
