/* Visual projection only. The native owner remains responsible for readiness and actions. */
const preparing = new Set(['queued', 'preparing', 'publishing', 'activating']);
const stopped = new Set(['blocked', 'released', 'superseded', 'retiring']);
const modes = Object.freeze({ preparing: 0, attention: 1, ready: 2 });
export function projectBuildStatus(receipt) {
  const state = receipt?.state;
  if (state === 'active' && typeof receipt.dialUrl === 'string' && /^tel:\+[1-9][0-9]{7,14}$/.test(receipt.dialUrl)) {
    return { state: 'ready', mode: modes.ready, label: 'Ready', title: 'Your demo is ready.', detail: 'The build service has returned its active state and a valid call link.' };
  }
  if (preparing.has(state)) {
    return { state: 'preparing', mode: modes.preparing, label: 'Preparing', title: 'Bringing your demo together.', detail: 'The build is in progress. Readiness comes from the build service.' };
  }
  const unavailable = ['released', 'superseded', 'retiring'].includes(state);
  return { state: 'attention', mode: modes.attention, label: 'Needs attention', title: unavailable ? 'This demo is no longer active.' : 'A little attention is needed.', detail: stopped.has(state) ? 'Check the build service for the next action before making a call.' : 'The latest status could not establish readiness. Check the build service.' };
}
export const previewReceipts = Object.freeze({
  preparing: Object.freeze({ state: 'preparing' }),
  attention: Object.freeze({ state: 'blocked' }),
  // A reserved fictional number; the prototype never renders a dial action.
  ready: Object.freeze({ state: 'active', dialUrl: 'tel:+441632960000' })
});
