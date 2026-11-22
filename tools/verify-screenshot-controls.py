#!/usr/bin/env python3
"""Validate user-supplied toggle / slider studies in touch-capable Chromium & WebKit.

This checks the real static gallery, not a separate implementation. No backend,
external account, credentials or actual application state are involved.
"""
from __future__ import annotations

import contextlib
import http.server
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def log_message(self, fmt, *args): pass

@contextlib.contextmanager
def serve():
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try: yield f"http://127.0.0.1:{server.server_port}/kits/shorts-lab/"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=3)

def check():
    from playwright.sync_api import sync_playwright
    total = 0
    with serve() as url, sync_playwright() as p:
        for engine in ("chromium", "webkit"):
            browser = getattr(p, engine).launch(headless=True)
            try:
                for reduced in ("no-preference", "reduce"):
                    context = browser.new_context(
                        viewport={"width":390,"height":844}, device_scale_factor=2,
                        is_mobile=True, has_touch=True, reduced_motion=reduced
                    )
                    page = context.new_page()
                    page.goto(url, wait_until="networkidle")
                    switch_card = page.locator('.card[data-id="69"]')
                    switch_card.scroll_into_view_if_needed()
                    widget = switch_card.locator('.squishy-toggle input')
                    status = switch_card.locator('.switch-status')
                    assert not widget.is_checked()
                    assert widget.get_attribute("aria-checked") == "false"
                    assert status.inner_text() == "Off"
                    widget.tap()
                    assert widget.is_checked()
                    assert widget.get_attribute("aria-checked") == "true"
                    assert status.inner_text() == "On"
                    widget.tap()
                    assert not widget.is_checked()
                    assert widget.get_attribute("aria-checked") == "false"
                    assert status.inner_text() == "Off"
                    widget.focus()
                    widget.press("Space")
                    assert widget.is_checked(), f"{engine}: native keyboard toggle lost"
                    widget.press("Space")
                    assert not widget.is_checked()
                    slider_card = page.locator('.card[data-id="68"]')
                    slider_card.scroll_into_view_if_needed()
                    slider = slider_card.locator('input[type="range"]')
                    label = slider_card.locator('output')
                    assert slider.input_value()=="50"
                    slider.focus()
                    slider.press("ArrowRight")
                    assert slider.input_value()=="51"
                    assert label.inner_text()=="51%"
                    slider.evaluate("""el => {el.value='77';el.dispatchEvent(new Event('input',{bubbles:true}));}""")
                    assert label.inner_text()=="77%"
                    visual=slider_card.locator(".material-range").evaluate(
                        "el=>getComputedStyle(el).getPropertyValue('--position').trim()")
                    assert visual=="77%", visual
                    if reduced=="reduce":
                        style=slider_card.locator(".material-range-thumb").evaluate(
                            "el=>getComputedStyle(el).transitionDuration")
                        assert all(float(t.replace("s","").strip())==0 for t in style.split(",")),style
                    # Both samples must retain accurate labels when stage motion is off.
                    context.close()
                    total+=1
                    print(f"PASS {engine} {reduced}: switch touch/keyboard + range keyboard/value")
            finally: browser.close()
    assert total==4
    print("PASS four mobile engine/preference combinations")

if __name__=="__main__":
    check()
