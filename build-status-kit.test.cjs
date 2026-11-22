const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');
const model = import('./kits/build-status/state-model.mjs');

test('only the existing active-plus-dial contract can project a ready graphic', async () => {
  const { projectBuildStatus } = await model;
  assert.equal(projectBuildStatus({ state: 'active', dialUrl: 'tel:+441632960000' }).state, 'ready');
  for (const receipt of [undefined, {}, { progress: 100 }, { state: 'active' }, { state: 'active', dialUrl: 'https://example.com' }, { state: 'active', dialUrl: 'tel:123' }, { state: 'active', dialUrl: 'tel:+441632960000\n' }, { state: 'ready', dialUrl: 'tel:+441632960000' }, { state: 'activating', progress: 100, dialUrl: 'tel:+441632960000' }]) {
    assert.notEqual(projectBuildStatus(receipt).state, 'ready');
  }
});

test('native in-progress and retired states retain their distinct readiness meanings', async () => {
  const { projectBuildStatus } = await model;
  for (const state of ['queued', 'preparing', 'publishing', 'activating']) {
    const projected = projectBuildStatus({ state, stage: 'active', progress: 100 });
    assert.equal(projected.state, 'preparing');
    assert.equal(projected.mode, 0);
  }
  for (const state of ['blocked', 'released', 'superseded', 'retiring', 'unknown']) {
    const projected = projectBuildStatus({ state, dialUrl: 'tel:+441632960000' });
    assert.equal(projected.state, 'attention');
    assert.equal(projected.mode, 1);
    assert.equal('dialUrl' in projected, false);
  }
});

test('a previously ready visual is revoked by the next blocked, stale or unverified response', async () => {
  const { projectBuildStatus } = await model;
  const snapshots = [
    { state: 'active', dialUrl: 'tel:+441632960000' },
    { state: 'superseded', dialUrl: 'tel:+441632960000' },
    undefined,
    { state: 'active' },
    { state: 'preparing' }
  ];
  assert.deepEqual(snapshots.map(value => projectBuildStatus(value).state), ['ready', 'attention', 'attention', 'attention', 'preparing']);
});

test('the pending-export renderer leaves the static component available without loading a runtime', async () => {
  const { createSignalPlayer } = await import('./kits/build-status/signal-player.mjs');
  assert.equal(await createSignalPlayer(null, { ready: false }), null);
});

test('build-status kit and editable source stay outside customer discovery and retain project-prefix routes', () => {
  const catalogue = JSON.parse(fs.readFileSync('demos.json')).demos;
  assert.equal(catalogue.some(demo => demo.slug.includes('build-status')), false);
  const base = new URL('https://example.github.io/demo-sites/kits/build-status/');
  const html = fs.readFileSync('kits/build-status/index.html', 'utf8');
  for (const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const url = new URL(match[1], base);
    if (url.origin !== base.origin) continue;
    assert.ok(url.pathname.startsWith('/demo-sites/'));
    let file = url.pathname.slice('/demo-sites/'.length);
    if (file.endsWith('/')) file += 'index.html';
    assert.ok(fs.existsSync(file), file);
  }
  const manifest = JSON.parse(fs.readFileSync('kits/build-status/assets/export.json'));
  const source = fs.readFileSync('tools/artwork/build-status/scene.rml', 'utf8');
  assert.equal(source.includes('name="mode"'), true);
  assert.equal(source.includes('name="BuildStatus"'), true);
  assert.equal(/Scripted|ScriptAsset|OpenUrlEvent/.test(source), false);
  if (manifest.ready) {
    for (const descriptor of [manifest.runtime, manifest.wasm, manifest.asset]) {
      assert.match(descriptor.integrity, /^sha384-[A-Za-z0-9+/]+=*$/);
      const file = new URL(descriptor.url, new URL('kits/build-status/signal-player.mjs', pathToFileURL(process.cwd() + '/')));
      assert.ok(fs.existsSync(file));
    }
  }
});

test('the optional player binds the current view-model API, disables CDN fallback and exposes only rendering controls', async () => {
  const saved = { window: global.window, document: global.document, fetch: global.fetch };
  const calls = [];
  const mode = { value: 0 };
  const runtime = {
    RuntimeLoader: {
      setWasmFallbackUrl(value) { calls.push(['fallback', value]); },
      setWasmThreadsUrl(value) { calls.push(['threads', value]); },
      setWasmBinary(value) { assert.ok(value instanceof ArrayBuffer); }
    },
    Rive: class {
      constructor(options) {
        assert.equal(options.autoBind, true);
        assert.equal(options.autoplay, false);
        assert.equal(options.shouldDisableRiveListeners, true);
        this.viewModelInstance = { number(name) { assert.equal(name, 'mode'); return mode; } };
        queueMicrotask(options.onLoad);
      }
      resizeDrawingSurfaceToCanvas() { calls.push(['resize']); }
      play(name) { calls.push(['play', name]); }
      startRendering() { calls.push(['start']); }
      pause() { calls.push(['pause']); }
      stopRendering() { calls.push(['stop']); }
      cleanup() { calls.push(['cleanup']); }
    }
  };
  global.window = { rive: runtime };
  global.document = { createElement: () => ({}), head: { appendChild(script) { assert.match(script.integrity, /^sha384-/); queueMicrotask(() => script.onload()); } } };
  global.fetch = async (url, options) => { assert.equal(options.credentials, 'omit'); assert.match(options.integrity, /^sha384-/); return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) }; };
  try {
    const { createSignalPlayer } = await import('./kits/build-status/signal-player.mjs?player-contract');
    const descriptor = { url: './fixture', integrity: 'sha384-fixture' };
    const player = await createSignalPlayer({}, { ready: true, runtime: descriptor, wasm: descriptor, asset: descriptor, artboard: 'BuildSignal', stateMachine: 'BuildStatus', property: 'mode' });
    player.set(2);
    assert.equal(mode.value, 2);
    player.pause();
    player.cleanup();
    assert.deepEqual(calls.filter(call => ['fallback', 'threads'].includes(call[0])), [['fallback', null], ['threads', null]]);
    assert.deepEqual(calls.slice(-5), [['play', 'BuildStatus'], ['start'], ['pause'], ['stop'], ['cleanup']]);
    assert.deepEqual(Object.keys(player).sort(), ['cleanup', 'pause', 'resize', 'set']);
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete global[key]; else global[key] = value;
    }
  }
});
