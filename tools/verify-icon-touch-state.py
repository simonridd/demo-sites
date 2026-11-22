#!/usr/bin/env python3
"""Regression: an unpressed icon must be completely empty, including after touch.

Run against the real Motion Atlas with mobile emulation in Chromium and WebKit.
This file is an acceptance check, not an implementation or an image substitute.
"""
from __future__ import annotations

import contextlib
import http.server
import re
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        pass


@contextlib.contextmanager
def local_page():
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}/kits/shorts-lab/"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=3)


def state(button):
    return button.evaluate(
        """btn => ({
             pressed: btn.getAttribute('aria-pressed'),
             fill: getComputedStyle(btn.querySelector('.icon-fill')).clipPath,
             label: btn.closest('.icon-choice').querySelector('.icon-caption').textContent
           })"""
    )


def assert_off(button, kind, browser, moment):
    result = state(button)
    assert result["pressed"] == "false", (browser, kind, moment, result)
    assert re.match(r"^inset\\(100%\\b", result["fill"]), (browser, kind, moment, result)
    assert result["label"].endswith("off"), (browser, kind, moment, result)


def assert_on(button, kind, browser):
    result = state(button)
    assert result["pressed"] == "true", (browser, kind, result)
    assert re.match(r"^inset\\(0(?:px|%)?\\b", result["fill"]), (browser, kind, result)
    assert result["label"].endswith("on"), (browser, kind, result)


def run():
    from playwright.sync_api import sync_playwright

    completed = []
    with local_page() as url, sync_playwright() as playwright:
        for engine in ("chromium", "webkit"):
            browser = getattr(playwright, engine).launch(headless=True)
            try:
                for reduced in ("no-preference", "reduce"):
                    context = browser.new_context(
                        viewport={"width": 390, "height": 844},
                        device_scale_factor=2,
                        is_mobile=True,
                        has_touch=True,
                        reduced_motion=reduced,
                    )
                    page = context.new_page()
                    page.goto(url, wait_until="networkidle")
                    card = page.locator('.card[data-id="71"]')
                    card.wait_for(state="visible")
                    card.scroll_into_view_if_needed()
                    for kind in ("heart", "star", "bookmark"):
                        button = card.locator(f'button.fill-icon[data-kind="{kind}"]')
                        assert_off(button, kind, engine, "initial")
                        button.tap()
                        page.wait_for_timeout(470 if reduced == "no-preference" else 50)
                        assert_on(button, kind, engine)
                        button.tap()
                        # OFF must not linger at partial fill during an outgoing transition.
                        assert_off(button, kind, engine, "immediate deselect")
                        page.wait_for_timeout(470)
                        assert_off(button, kind, engine, "settled after deselect")
                        button.hover()
                        assert_off(button, kind, engine, "hover after mobile tap")
                        # Confirm a rapid second cycle also resets reliably.
                        button.tap()
                        page.wait_for_timeout(470 if reduced == "no-preference" else 50)
                        assert_on(button, kind, engine)
                        button.tap()
                        assert_off(button, kind, engine, "rapid repeat")
                        print(f"PASS {engine} {reduced} {kind} tap/on/off/hover/repeat")
                    context.close()
                    completed.append((engine, reduced))
            finally:
                browser.close()
    assert len(completed) == 4
    print("PASS all 12 icon touch/reduced-motion scenarios on Chromium and WebKit")


if __name__ == "__main__":
    run()
