import { projectBuildStatus, previewReceipts } from './state-model.mjs';
import { createSignalPlayer } from './signal-player.mjs';

const card = document.querySelector('.preview-card');
const art = document.querySelector('.signal-art');
const canvas = document.getElementById('signal-canvas');
const controls = document.getElementById('state-controls');
const motion = document.getElementById('motion-toggle');
const rendererStatus = document.getElementById('renderer-status');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let selected = 'preparing';
let model = projectBuildStatus(previewReceipts[selected]);
let manifest = null;
let player = null;
let loading = false;
let failed = false;
let userPaused = false;
let suspended = false;
let disposed = false;
let onScreen = !('IntersectionObserver' in window);
const canAnimate = () => !reduced.matches && !userPaused && !document.hidden && onScreen && !suspended && !disposed;
function fitPreview() {
  const fits = card.offsetHeight < window.innerHeight * .45;
  card.classList.toggle('preview-fits', fits);
  card.parentElement.style.setProperty('--preview-clearance', fits ? `${card.offsetHeight + 28}px` : '0px');
}
const sizeObserver = 'ResizeObserver' in window ? new ResizeObserver(fitPreview) : null;
sizeObserver?.observe(card);
fitPreview();

function staticGraphic() {
  art.classList.remove('canvas-ready');
  canvas.hidden = true;
  try { player?.pause(); } catch { failed = true; }
}
function rendererLabel() {
  motion.disabled = !manifest?.ready || failed || reduced.matches;
  motion.setAttribute('aria-pressed', String(userPaused));
  motion.textContent = reduced.matches ? 'Reduced motion' : !manifest?.ready ? 'Animation not enabled' : userPaused ? 'Resume motion' : 'Pause motion';
  rendererStatus.textContent = failed ? 'Static preview · animation unavailable' : !manifest?.ready ? (manifest?.previewLabel || 'Static preview · animation not enabled') : reduced.matches ? 'Static preview · reduced motion' : userPaused ? 'Static preview · motion paused' : player && canAnimate() ? 'Rive animation · data driven' : loading ? 'Static preview · loading animation' : 'Static preview';
}
async function syncRenderer() {
  if (disposed) return;
  rendererLabel();
  if (!canAnimate() || !manifest?.ready || failed) { staticGraphic(); return; }
  if (!player && !loading) {
    loading = true;
    rendererLabel();
    try {
      const loaded = await createSignalPlayer(canvas, manifest);
      if (disposed) { loaded?.cleanup(); return; }
      player = loaded;
    } catch { failed = true; }
    finally { loading = false; }
  }
  // Read the latest state after loading; never replay a captured stale selection.
  if (player && canAnimate() && !failed) {
    try {
      player.resize();
      player.set(model.mode);
      canvas.hidden = false;
      art.classList.add('canvas-ready');
    } catch { failed = true; staticGraphic(); }
  } else staticGraphic();
  rendererLabel();
}
function select(value) {
  if (!Object.hasOwn(previewReceipts, value)) return;
  selected = value;
  model = projectBuildStatus(previewReceipts[value]);
  card.dataset.state = model.state;
  card.querySelector('.status-label').textContent = model.label.toUpperCase();
  card.querySelector('h2').textContent = model.title;
  card.querySelector('.status-detail').textContent = model.detail;
  card.querySelector('.component-number').textContent = `${Object.keys(previewReceipts).indexOf(value) + 1}`.padStart(2, '0') + ' / 03';
  syncRenderer();
}
controls.disabled = false;
controls.addEventListener('change', event => {
  if (event.target.name === 'preview-state' && event.target.checked) select(event.target.value);
});
motion.addEventListener('click', () => { userPaused = !userPaused; syncRenderer(); });
reduced.addEventListener('change', syncRenderer);
document.addEventListener('visibilitychange', syncRenderer);
window.addEventListener('resize', () => { fitPreview(); if (player && canAnimate()) player.resize(); });
window.addEventListener('pagehide', event => {
  suspended = true;
  staticGraphic();
  if (!event.persisted) { disposed = true; player?.cleanup(); observer?.disconnect(); sizeObserver?.disconnect(); }
});
window.addEventListener('pageshow', () => { suspended = false; syncRenderer(); });
const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  onScreen = entries.some(entry => entry.isIntersecting);
  syncRenderer();
}, { threshold: .1 }) : null;
observer?.observe(art);
try {
  const response = await fetch(new URL('./assets/export.json', import.meta.url), { credentials: 'omit' });
  if (!response.ok) throw new Error('Manifest unavailable');
  manifest = await response.json();
} catch { failed = true; }
syncRenderer();
