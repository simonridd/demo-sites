#!/usr/bin/env python3
"""Real mobile-browser acceptance for Gemini ambient, card shine, neon and ticket.

No external media, network requests or account access; serves the existing static kit
on localhost. Tests Chromium and WebKit, both regular and reduced-motion.
"""
import contextlib
import http.server
import threading
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args): pass

@contextlib.contextmanager
def local_site():
    server=http.server.ThreadingHTTPServer(("127.0.0.1",0), Handler)
    thread=threading.Thread(target=server.serve_forever,daemon=True)
    thread.start()
    try: yield f"http://127.0.0.1:{server.server_port}/kits/shorts-lab/"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=3)

def check():
    from playwright.sync_api import sync_playwright
    completed=0
    with local_site() as url, sync_playwright() as p:
        for engine in ("chromium","webkit"):
            browser=getattr(p,engine).launch(headless=True)
            try:
                for motion in ("no-preference","reduce"):
                    ctx=browser.new_context(
                        viewport={"width":390,"height":844},device_scale_factor=2,
                        is_mobile=True,has_touch=True,reduced_motion=motion,
                    )
                    page=ctx.new_page()
                    page.goto(url,wait_until="networkidle")
                    assert page.locator(".card").count()==80

                    # Real ambient card, originally mistaken for a one-shot effect.
                    scene=page.locator('.card[data-id="66"]')
                    scene.scroll_into_view_if_needed()
                    aura=scene.locator(".gemini-aura-one")
                    speed=lambda: aura.evaluate("el => getComputedStyle(el).animationDuration")
                    if motion=="no-preference":
                        assert speed().strip()=="9s",(engine,motion,speed())
                        active=scene.locator(".gemini-activity")
                        bounds=active.bounding_box()
                        assert bounds is not None
                        page.mouse.move(bounds["x"]+bounds["width"]/2,bounds["y"]+bounds["height"]/2)
                        page.mouse.down()
                        page.wait_for_timeout(80)
                        # CSS :active drives the 9s to 2s switch.
                        assert active.evaluate("el => el.matches(':active')"),(engine,"no active press")
                        assert speed().strip()=="2s",(engine,"fast",speed())
                        page.mouse.up()
                        page.wait_for_timeout(2150)
                        assert speed().strip()=="9s",(engine,"returned to idle",speed())
                        pause=scene.locator('[data-action="ambient-toggle"]')
                        pause.click()
                        assert scene.locator(".gemini-reveal").evaluate("el=>el.classList.contains('is-paused')")
                        assert aura.evaluate("el=>getComputedStyle(el).animationPlayState")=="paused"
                        pause.click()
                        assert not scene.locator(".gemini-reveal").evaluate("el=>el.classList.contains('is-paused')")
                    else:
                        assert aura.evaluate("el=>getComputedStyle(el).animationName")=="none"

                    # Premium card: actual tap retains an accessible button.
                    shine=page.locator('.card[data-id="50"]')
                    shine.scroll_into_view_if_needed()
                    shine.locator("button.shine-card-premium").tap()
                    assert shine.locator("button.shine-card-premium").count()==1

                    # Neon is an optional lighting switch; both states readable.
                    neon=page.locator('.card[data-id="78"]')
                    neon.scroll_into_view_if_needed()
                    sign=neon.locator(".neon-sign")
                    toggle=neon.locator('[data-action="neon-toggle"]')
                    assert sign.get_attribute("data-lit")=="false"
                    assert "AFTER" in neon.locator(".neon-sign-words").inner_text()
                    toggle.tap()
                    assert sign.get_attribute("data-lit")=="true"
                    assert toggle.get_attribute("aria-pressed")=="true"
                    toggle.tap()
                    assert sign.get_attribute("data-lit")=="false"

                    # Ticket is explicitly fictional and the tilt is reversible.
                    card=page.locator('.card[data-id="79"]')
                    card.scroll_into_view_if_needed()
                    ticket=card.locator(".holo-ticket")
                    tilt=card.locator('[data-action="ticket-tilt"]')
                    assert "NOT VALID FOR ENTRY" in card.inner_text()
                    assert ticket.get_attribute("data-tilted")=="false"
                    tilt.tap()
                    assert ticket.get_attribute("data-tilted")=="true"
                    assert tilt.get_attribute("aria-pressed")=="true"
                    tilt.tap()
                    assert ticket.get_attribute("data-tilted")=="false"
                    assert tilt.get_attribute("aria-pressed")=="false"
                    if motion=="reduce":
                        assert ticket.evaluate("el=>getComputedStyle(el).transform")=="none"

                    # Continuous icon corners adjust with a native slider.
                    shape=page.locator('.card[data-id="36"]')
                    shape.scroll_into_view_if_needed()
                    curve=shape.locator('[data-superellipse-range]')
                    out=shape.locator('[data-superellipse-value]')
                    tile=shape.locator('[data-superellipse-tile]')
                    assert curve.input_value()=="2"
                    assert out.inner_text()=="2.00"
                    curve.evaluate("""el => {
                      el.value='3.25';
                      el.dispatchEvent(new Event('input',{bubbles:true}));
                    }""")
                    assert out.inner_text()=="3.25"
                    assert tile.evaluate("el=>el.style.getPropertyValue('--icon-curvature')")=="3.25"
                    native=page.evaluate("CSS.supports('corner-shape','superellipse(2)')")
                    if not native:
                        shape_clip=tile.evaluate("el=>getComputedStyle(el).clipPath")
                        assert shape_clip.startswith('polygon('),(engine,shape_clip)

                    # Real public ImageKit face-crop transforms, not a CSS fake.
                    avatar=page.locator('.card[data-id="80"]')
                    avatar.scroll_into_view_if_needed()
                    result=avatar.locator('.face-crop-result')
                    assert 'fo-face' in result.get_attribute('src')
                    center=avatar.locator('[data-action="avatar-mode"][data-crop-mode="center"]')
                    center.tap()
                    assert center.get_attribute('aria-pressed')=="true"
                    assert 'fo-face' not in result.get_attribute('src')
                    circle=avatar.locator('[data-action="avatar-mode"][data-crop-mode="circle"]')
                    circle.tap()
                    assert circle.get_attribute('aria-pressed')=="true"
                    assert 'fo-face' in result.get_attribute('src')
                    assert 'r-max' in result.get_attribute('src')
                    input=avatar.locator('[data-avatar-url]')
                    input.fill('https://example.com/private.jpg')
                    avatar.locator('[data-action="avatar-load"]').tap()
                    assert "public HTTPS ImageKit" in avatar.locator('.avatar-load-status').inner_text()
                    input.fill('https://ik.imagekit.io/ikmedia/docs_images/examples/example_portrait_1.jpg')
                    avatar.locator('[data-action="avatar-load"]').tap()
                    assert "Previewing the selected public ImageKit image URL" in avatar.locator('.avatar-load-status').inner_text()

                    screenshot=page.locator("#screenshots-only")
                    screenshot.check()
                    assert page.locator(".card").count()==20
                    assert page.locator('.card[data-id="36"]').count()==1
                    assert page.locator('.card[data-id="50"]').count()==1
                    assert page.locator('.card[data-id="78"]').count()==1
                    assert page.locator('.card[data-id="79"]').count()==1
                    assert page.locator('.card[data-id="80"]').count()==1
                    screenshot.uncheck()
                    assert page.locator(".card").count()==80

                    print(f"PASS {engine} {motion}: 79 cards; 20 screenshot references; ambient, pause, shine, neon, ticket")
                    completed+=1
                    ctx.close()
            finally:browser.close()
    assert completed==4
    print("PASS all four mobile engine/motion combinations")

if __name__=="__main__":
    check()
