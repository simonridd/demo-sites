/* Optional Rive renderer. Failure always leaves the semantic HTML and static SVG usable. */
let runtimeScript;
function loadScript(descriptor) {
  if (!runtimeScript) runtimeScript = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL(descriptor.url, import.meta.url).href;
    script.integrity = descriptor.integrity;
    script.crossOrigin = 'anonymous';
    const timeout = setTimeout(() => reject(new Error('Rive runtime timed out')), 12000);
    script.onload = () => { clearTimeout(timeout); resolve(window.rive); };
    script.onerror = () => { clearTimeout(timeout); reject(new Error('Rive runtime unavailable')); };
    document.head.appendChild(script);
  });
  return runtimeScript;
}
async function bytes(descriptor) {
  const response = await fetch(new URL(descriptor.url, import.meta.url), { integrity: descriptor.integrity, credentials: 'omit', signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error('Rive asset unavailable');
  return response.arrayBuffer();
}
export async function createSignalPlayer(canvas, manifest) {
  if (!manifest.ready) return null;
  const [runtime, wasm, asset] = await Promise.all([loadScript(manifest.runtime), bytes(manifest.wasm), bytes(manifest.asset)]);
  runtime.RuntimeLoader.setWasmFallbackUrl(null);
  runtime.RuntimeLoader.setWasmThreadsUrl(null);
  runtime.RuntimeLoader.setWasmBinary(wasm);
  let instance;
  let timeout;
  try {
    await new Promise((resolve, reject) => {
      timeout = setTimeout(() => reject(new Error('Rive file timed out')), 12000);
      instance = new runtime.Rive({
        buffer: asset, canvas, artboard: manifest.artboard, stateMachine: manifest.stateMachine,
        autoplay: false, autoBind: true, enableSettling: true, shouldDisableRiveListeners: true,
        onLoad: () => { clearTimeout(timeout); resolve(); },
        onLoadError: () => { clearTimeout(timeout); reject(new Error('Rive file unavailable')); }
      });
    });
  } catch (error) { instance?.cleanup(); throw error; }
  finally { clearTimeout(timeout); }
  const mode = instance.viewModelInstance?.number(manifest.property);
  if (!mode) { instance.cleanup(); throw new Error('Rive state binding unavailable'); }
  instance.resizeDrawingSurfaceToCanvas();
  return {
    set(value) { mode.value = value; instance.play(manifest.stateMachine); instance.startRendering(); },
    pause() { instance.pause(); instance.stopRendering(); },
    resize() { instance.resizeDrawingSurfaceToCanvas(); },
    cleanup() { instance.cleanup(); }
  };
}
