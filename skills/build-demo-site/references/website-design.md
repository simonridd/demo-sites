# Website design decisions

Adopted on 20 November 2026 following Simon's request to digest [Charles Liu's ten UI tips](https://www.facebook.com/reel/1115590641265228/). The author's expanded caption supplied the ten techniques. The decisions below are our application of that advice, with technical qualifications checked against the references below. This is future authoring guidance; existing pages have not been visually audited or restyled by adopting it.

## Everyday checks

Use these during new page builds and when revising the affected component.

| Technique | Where to apply it | Decision |
| --- | --- | --- |
| Related corner radii | Images inside cards, inset panels and dialog contents | Give concentric shapes a shared geometry. Derive the inner radius from the outer radius less the actual inset, including any border; clamp at zero. A 24px outer radius with a 6px total inset gives 18px inside. Use visual judgement for unrelated shapes and uneven insets. |
| Translucent separators | Card outlines, dividers and layered navigation | Use theme-specific alpha colours for subtle decorative boundaries. Check the composite on each background. Give input boundaries and focus indicators enough contrast for their purpose; 12% black is an example, not a universal token. |
| Balanced icons | Navigation, buttons, search and compact actions | Match the apparent weight of icons and adjacent type. Keep one coherent icon family; judge stroke, size and alignment together rather than equating font-weight numbers with SVG stroke widths. |
| Appropriate viewport height | Mobile menus, full-screen panels and landing-page heroes | Use `dvh` for a shell that should follow the visible browser viewport. Consider `svh` for a hero that should stay stable as browser chrome changes. Prefer `min-height` for content sections so text can grow. Check safe areas and keyboard behaviour separately. |

## Use when the design calls for it

| Technique | Where and when | Decision |
| --- | --- | --- |
| OKLCH palettes | New theme tokens, neutral ramps and derived brand shades | Prefer OKLCH for authoring perceptually balanced ramps. Preserve approved brand colours. Equal lightness is a useful starting point, not proof of contrast or identical appearance; inspect gamut and the actual text/background pairs. |
| Explicit gradient interpolation | Hero artwork, decorative backgrounds and accent treatments | Compare `in oklch` with `in oklab` and choose the intended result. OKLCH can retain chroma but may travel through unwanted hues. Keep text readable across the whole gradient and supply a fallback where target browsers need one. |
| Lighter dark surfaces | Existing dark themes, presentation controls and dark site sections | Establish depth with modest lightness steps and useful borders. Keep shadows where helpful. Do this when a dark surface is being authored; the tip is not a reason to add a dark-mode feature to every site. |
| Faded strip edges | A justified horizontal logo, image or content strip | A mask may hint at overflow. Keep controls and focus rings outside the masked region, and leave labels readable. Adapt fades at the first/last item. Choose an ordinary grid when visibility and comparison matter more than horizontal browsing. |
| Blurred icon transitions | Occasional menu, theme or playback icon swaps | Optional finishing detail after the interaction works clearly. Keep it brief, preserve the accessible name/state and respect reduced-motion preferences. Omit blur if it reduces clarity or rendering performance. |
| Multiply blending | A white-backed product image on a suitable light background | Try only when the image remains visually accurate. Multiply affects the whole image, including white product details. Prefer an approved transparent asset when available; keep logos, interface captures and colour-critical images faithful. |

## Application order

1. During the brief, establish the client's brand, audience, primary task and whether a dark surface, product gallery or horizontal strip is actually useful.
2. During component work, check corner geometry, separators, icon balance and viewport sizing. Use OKLCH when creating or revising palette tokens.
3. During visual polish, consider gradients, masks, icon motion and image blending only where they improve that page.
4. During review, inspect desktop and mobile layout, zoomed text, keyboard focus, colour contrast and reduced motion. A real Safari/device check is distinct from a Chrome viewport preview.

For the demo collection, prioritise card geometry, separators and search/navigation icons on its next visual revision. For customer sites such as Co-op, Holcim and Thirdfort, preserve client identity and apply the checks to the components being changed. Reuse the same reasoning for authored presenter controls or dashboards when that work is requested. Avoid a portfolio-wide restyle without a separate brief.

## First application: Co-op support page

The Co-op visual revision applies restrained card/panel radii, alpha border tokens and consistent SVG icon strokes. Its order-support drawer uses a dynamic viewport height with a conventional fallback, a fixed header and a scrollable body. Supporting text is at least 14px at default settings, ordinary body/action text is 16px or larger, and mobile navigation remains available. A derived soft background uses OKLCH with an sRGB fallback while approved blue and pale brand colours stay intact.

Keep its grocery subject and flat brand surfaces. A carousel, dark theme, gradient, blend mode or blurred icon swap would add little to this support task. Reuse its rules in another page only when the component and brand call for them.

## Motion as an enhancement

The Co-op motion example adds a short grocery-bag entrance and a decorative delivery van. Its optional Blender-rendered grocery scene is a local WebP; the original SVG remains the no-JavaScript/load-failure fallback. Animations finish within three seconds, playing once automatically without replay or watch-again controls; there is no continuous loop, scroll hijacking or simulated live order status. Card feedback, dialog entry and section reveals support the existing task rather than introducing another customer journey.

Use CSS and SVG for a small static site before adding an animation framework. Content must be visible if scripts fail or IntersectionObserver is unavailable. Respect reduced motion on initial load and when the preference changes: cancel pending reveal animations, remove decorative playback and retain all support actions. Do not animate a focused section out of view. A new Blender asset or interactive 3D scene should justify its production and runtime cost; it is optional, not a default dependency.

For visual changes, inspect desktop, narrow mobile and enlarged text. Check natural playback, focus, FAQ links and order-dialog open/close, as well as the reduced-motion and no-JavaScript fallbacks. Local animation tests are separate from Messenger delivery evidence. The Co-op launcher remains governed by its existing independently approved binding.

## Technical references

- [CSS Color 4: interpolation](https://www.w3.org/TR/css-color-4/#interpolation): perceptual colour spaces and the tradeoffs between Oklab and OKLCH.
- [MDN: viewport length units](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length#relative_length_units_based_on_viewport): small, large and dynamic viewport behaviour.
- [W3C: multiply blending](https://www.w3.org/TR/compositing-1/#blendingmultiply): multiplication blends the entire source with its backdrop.
- [MDN: reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion): honour the user's preference for less nonessential motion.

## Blender asset production

The original Co-op recipe lives in `tools/artwork/co-op-groceries.py`, with pinned offline render dependencies and reproduction instructions in `tools/artwork/README.md`. Commit the optimised WebP and source recipe; keep intermediate renders, editable scene outputs and the Python environment out of the public site. A render is a design asset, not a live 3D capability. Verify loading, fallback, responsive composition and reduced motion before adopting it for another customer.

## Guided help and component references

Co-op's support links become a vertical desktop/horizontal mobile tab list with concise next-step panels. This is a native adaptation of an inspected 21st.dev interaction pattern, not a React dependency. Keep one selected tab and labelled panel, roving focus, orientation-appropriate arrows and Home/End. Modifier-click keeps ordinary link behavior. Existing FAQ hashes remain usable, open their answers and synchronize the selected topic. The receipt dialog serves existing and new actions without creating another order model.

Initialize only after the matching panels are present; otherwise retain the original links. Reduce panel transitions with the OS preference and render all panels in print. Keep the reference/source digest, dependency decision, licence notice and verification limits in `tools/components/co-op-help-guide.md`. Promote the interaction approach only after checking the actual customer task; neither a library's popularity nor a passing fixture proves usability improvement.

## Connected journey experiments

`kits/connected-support/` retains the first GSAP prototype: an authored four-stage customer/assistant/knowledge/adviser explanation. Navigation uses semantic tabs, keyboard controls and direct stage hashes; a single short timeline traces connectors and emphasizes the selected panel. Cancel old motion on rapid changes, reduced-motion updates or backgrounding, and settle into the selected content state. Keep the explanation usable when the motion library fails and all content readable without scripts or in print. Preserve modifier-click and query parameters when changing stage hashes.

Pin self-hosted dependencies with their provenance, licence notices and integrity checks. The GSAP core belongs only to this reserved kit, with operator/reuse notes in `kits/connected-support/README.md`. Existing presentation owners can adapt the narrative and motion pattern through their normal source/renderer workflow. Do not describe authored examples as observed native outcomes or treat a new website as an installed presentation/runtime upgrade.

The 22 November review keeps this architecture explanation out of customer-site discovery. The kit has neutral framing and its own index at `kits/`; `co-op-journey/` is a compatibility redirect only. Customer-facing reuse should explain the customer’s own process rather than contact-centre implementation. Do not let an attractive component determine the audience or content.

## Customer order-support drawer

Co-op's `order-support.js` enhances the existing inline receipt into a native modal drawer. The same authored item names and quantities supply receipt choices and later summaries. Item → issue → next step is a customer task: missing, damaged and wrong-item choices reveal distinct guidance. Keep choices when navigating back or reopening during the page visit, update later summaries when earlier choices change and reset the drawer scroll on reopen. Do not persist personal order details in browser storage by default.

Use semantic labelled radio groups, deliberate Continue actions and heading focus on each step. Native dialog behavior keeps background content inert and provides Escape; closing returns focus to the initiating link, while the contact action closes and focuses the existing contact section. Give the body its own vertical scroll, preserve the visible close action at narrow widths and enlarged text, and keep the page from scrolling behind it. Short CSS entrances follow the operating system motion preference without delaying state or close actions.

Start from plain `#order-details` links and a readable inline receipt, then move that same section into a dialog only after support and markup checks. Without scripts or dialog support, the receipt, all three advice sections and underlying FAQ/contact links remain useful. The Co-op fixture is fictional and local: guidance is not a report submission, refund decision, actual order lookup or native handover. Never make unavailable Messenger look ready because the local drawer reached its last step. Regression scenarios are in `co-op-order-support.test.cjs`; the implementation and observed verification limits are recorded in `tools/components/co-op-order-support.md`.

## State-driven status studies

The reserved `kits/build-status/` study explores preparing, needs-attention and ready graphics for Voice Demo Builder. Its semantic status text and distinct static SVG symbols are authoritative for the preview. An original script-free Rive source lives in `tools/artwork/build-status/`; `mode` drives the authored state machine, never a timer or animation event. Keep explicit prototype controls separate from real application status and do not add native build or call actions to a component preview.

Project real receipts through the existing owner's current status contract. The inspected front door uses `active` plus a valid dial URL for ready; in-progress states remain preparing, and blocked, retired, superseded or unknown responses cannot retain an old ready visual. The visual adapter returns no dial action and does not weaken the actual owner gates. Verify source/version again before integrating a separately deployed builder frontend.

Rive CLI 1.10.0 can compile, inspect and render the editable source locally, but exporting a playable `.riv` requires account sign-in. At the initial checkpoint no playable file was exported. Simon subsequently reserved the Rive trial because of cost. `assets/export.json` remains `ready: false`: the kit uses a clearly labelled static preview and loads no runtime. Do not extract internal compiler output to bypass export, hide a required watermark, or describe the pending renderer as a delivered Rive integration. Follow the kit README for the remaining runtime, visibility, reduced-motion, cost and owner-release acceptance.


## Hometree repair preparation

The Hometree page applies the shared clarity and task flow checks to an unbound repair-support journey. Its native dialog groups service choice, issue choice and a prepared summary. Keep selections on Back and reopen, update dependent choices when the service changes, retain heading/return focus and keep the portal destination beside the summary. The final state means details are ready to use in Hometree’s own portal; it must not claim a submitted repair or confirmed appointment. No Genesys SDK, backend submission or browser storage is needed. Plain links and the inline repair section retain a no-script path.

Its separate Copilot presentation is an audience-only native visual export at `hometree/copilot/`; the presentation owner retains canonical sources, source evidence and private notes. Use the mobile reading route for phone review. Original home/character vectors follow Hometree’s palette; user acceptance of this particular design remains separate from its software and layout checks. This is an example under review, not a new global layout or motion rule.
