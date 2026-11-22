#!/usr/bin/env python3
"""Exercise screenshot-backed Motion Atlas studies on simulated mobile browsers.

Real gallery DOM, locally served. No login, network API, or customer actions.
"""
from __future__ import annotations

import contextlib
import http.server
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCREENSHOT_IDS = (52, 57, 60, 61, 65, 66, 67, 68, 69, 71, 72, 73, 74, 76, 77)


class QuietServer(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, format, *args):
        pass


@contextlib.contextmanager
def app():
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), QuietServer)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}/kits/shorts-lab/"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=3)


def card(page, number):
    result = page.locator(f'.card[data-id="{number}"]')
    assert result.count() == 1, f"Card {number} not unique"
    result.scroll_into_view_if_needed()
    return result


def inspect(page, reduced_motion, engine):
    total = page.locator("article.card").count()
    assert total == 77, (engine, total)
    evidence = page.locator("#screenshots-only")
    evidence.check()
    cards = page.locator("article.card")
    ids = tuple(int(value) for value in cards.evaluate_all(
        "items => items.map(el => el.dataset.id)"
    ))
    assert ids == SCREENSHOT_IDS, (engine, ids)

    glow = card(page, 77)
    stage = glow.locator(".image-glow-stage")
    images = stage.locator("img")
    assert images.count() == 2
    assert images.nth(0).get_attribute("src") == images.nth(1).get_attribute("src")
    btn = glow.locator('[data-action="image-glow"]')
    assert btn.get_attribute("aria-pressed") == "true"
    btn.tap()
    assert stage.get_attribute("data-glow") == "false"
    assert btn.get_attribute("aria-pressed") == "false"
    btn.tap()
    assert stage.get_attribute("data-glow") == "true"
    assert btn.get_attribute("aria-pressed") == "true"

    chips = card(page, 76)
    chip = chips.locator('[data-chip="travel"]')
    chip.tap()
    assert chip.get_attribute("aria-pressed") == "true"
    visible = chips.locator("[data-sample]:visible").count()
    assert visible == 1, (engine, visible)
    assert "1 result" in chips.locator(".chips-caption").inner_text()
    chip.focus()
    chip.press("ArrowRight")
    assert chips.locator('[data-chip="support"]').get_attribute("aria-pressed") == "true"
    assert chips.locator('[data-sample="support"]').is_visible()

    grain = card(page, 57)
    state = grain.locator(".with-grain")
    assert state.get_attribute("data-grain") == "true"
    grain.locator('[data-action="grain"]').tap()
    assert state.get_attribute("data-grain") == "false"
    grain.locator('[data-action="grain"]').tap()
    assert state.get_attribute("data-grain") == "true"

    button = card(page, 52).locator(".premium-action")
    button.tap()
    assert button.get_attribute("aria-pressed") == "true"
    button.tap()
    assert button.get_attribute("aria-pressed") == "false"

    split = card(page, 61)
    split.locator('[data-action="split-menu"]').tap()
    assert split.locator('[data-action="split-menu"]').get_attribute("aria-expanded") == "true"
    split.locator('[data-action="split-choice"]').first.tap()
    assert split.locator('[data-action="split-menu"]').get_attribute("aria-expanded") == "false"

    page.locator("#reset").click()
    assert page.locator("article.card").count() == 77

    status = card(page, 67)
    status.locator('[data-action="replay"]').first.click()
    bar = status.locator(".thinking-light")
    effect_name = bar.evaluate("e=>getComputedStyle(e).animationName")
    if reduced_motion == "reduce":
        assert effect_name == "none", (engine, effect_name)

    print(f"PASS {engine} {reduced_motion}: 77 studies; 15 screenshot-backed; glow, chips, grain, premium button, split menu, reduced motion")


def main():
    from playwright.sync_api import sync_playwright

    with app() as url, sync_playwright() as engines:
        for name in ("chromium", "webkit"):
            browser = getattr(engines, name).launch(headless=True)
            try:
                for reduced in ("no-preference", "reduce"):
                    context = browser.new_context(
                        viewport={"width": 390, "height": 844},
                        device_scale_factor=2,
                        is_mobile=True, has_touch=True,
                        reduced_motion=reduced,
                    )
                    page = context.new_page()
                    page.goto(url, wait_until="networkidle")
                    inspect(page, reduced, name)
                    context.close()
            finally:
                browser.close()


if __name__ == "__main__":
    main()
