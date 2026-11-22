#!/usr/bin/env python3
"""Browser acceptance for study 060 Android/Liquid, 061 split popover and 065 squeeze.

Static, fictional controls only. No external services or actual business actions.
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
def server():
    srv = http.server.ThreadingHTTPServer(("127.0.0.1",0), Handler)
    t = threading.Thread(target=srv.serve_forever, daemon=True)
    t.start()
    try: yield f"http://127.0.0.1:{srv.server_port}/kits/shorts-lab/"
    finally:
        srv.shutdown()
        srv.server_close()
        t.join(timeout=3)

def qualify():
    from playwright.sync_api import sync_playwright
    checks=0
    with server() as url, sync_playwright() as playwright:
        for engine in ("chromium","webkit"):
            browser=getattr(playwright,engine).launch(headless=True)
            try:
                for reduced in ("no-preference","reduce"):
                    ctx=browser.new_context(
                        viewport={"width":390,"height":844},
                        device_scale_factor=2,has_touch=True,is_mobile=True,
                        reduced_motion=reduced
                    )
                    page=ctx.new_page()
                    page.goto(url,wait_until="networkidle")

                    # Native visual state: same content, different optical finish.
                    blur=page.locator('.card[data-id="60"]')
                    blur.scroll_into_view_if_needed()
                    panel=blur.locator('.blur-comparison-study')
                    assert panel.get_attribute("data-material")=="android"
                    liquid=blur.locator('[data-action="blur-mode"][data-mode="liquid"]')
                    android=blur.locator('[data-action="blur-mode"][data-mode="android"]')
                    liquid.tap()
                    assert panel.get_attribute("data-material")=="liquid"
                    assert liquid.get_attribute("aria-pressed")=="true"
                    assert android.get_attribute("aria-pressed")=="false"
                    android.tap()
                    assert panel.get_attribute("data-material")=="android"
                    assert android.get_attribute("aria-pressed")=="true"

                    # Separate action is unaffected by alternative menu access.
                    split=page.locator('.card[data-id="61"]')
                    split.scroll_into_view_if_needed()
                    trigger=split.locator('[data-action="split-menu"]')
                    primary=split.locator('[data-action="split-primary"]')
                    menu=split.locator('.split-menu-items')
                    assert trigger.get_attribute("aria-expanded")=="false"
                    primary.tap()
                    assert 'Present' in split.locator('[data-feedback]').inner_text()
                    trigger.tap()
                    assert trigger.get_attribute("aria-expanded")=="true"
                    assert menu.is_visible()
                    menu.locator('[role="menuitem"]').first.focus()
                    page.keyboard.press("Escape")
                    assert trigger.get_attribute("aria-expanded")=="false"
                    trigger.tap()
                    assert trigger.get_attribute("aria-expanded")=="true"
                    menu.locator('[role="menuitem"]').nth(1).tap()
                    assert trigger.get_attribute("aria-expanded")=="false"
                    assert 'Preview slides' in split.locator('[data-feedback]').inner_text()

                    # Prototype only plays via intentional local replay.
                    squeeze=page.locator('.card[data-id="65"]')
                    squeeze.scroll_into_view_if_needed()
                    preview=squeeze.locator('.preview')
                    trigger=squeeze.locator('.pixel-squeeze-study [data-action="replay"]')
                    trigger.tap()
                    if reduced=="reduce":
                        name=preview.locator('.pixel-squeeze-label').evaluate(
                            "el=>getComputedStyle(el).animationName")
                        assert name=="none", (engine,reduced,name)
                    else:
                        assert 'is-playing' in preview.get_attribute("class")
                    ctx.close()
                    checks+=1
                    print(f"PASS {engine} / {reduced}: two blur modes, split keyboard/touch, squeeze motion")
            finally: browser.close()
    assert checks==4
    print("PASS all four cross-engine and reduced-motion browser combinations")

if __name__=="__main__":
    qualify()
