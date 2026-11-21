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

The Co-op visual revision applies restrained card/panel radii, alpha border tokens and consistent SVG icon strokes. Its order dialog derives the inset help panel's radius from the outer radius, padding and border, and uses a dynamic viewport height limit with a conventional fallback. Supporting text is at least 14px at default settings, ordinary body/action text is 16px or larger, and mobile navigation remains available. A derived soft background uses OKLCH with an sRGB fallback while approved blue and pale brand colours stay intact.

Keep its grocery illustration and flat surfaces. A carousel, dark theme, gradient, blend mode or blurred icon swap would add little to this support task. Reuse its rules in another page only when the component and brand call for them.

## Motion as an enhancement

The Co-op motion example adds a short grocery-bag assembly and a decorative delivery van using the existing SVG style. Animations finish within three seconds, with a deliberate replay control for the hero; there is no continuous loop, scroll hijacking or simulated live order status. Card feedback, dialog entry and section reveals support the existing task rather than introducing another customer journey.

Use CSS and SVG for a small static site before adding an animation framework. Content must be visible if scripts fail or IntersectionObserver is unavailable. Respect reduced motion on initial load and when the preference changes: cancel pending reveal animations, remove decorative playback and retain all support actions. Do not animate a focused section out of view. A new Blender asset or interactive 3D scene should justify its production and runtime cost; it is optional, not a default dependency.

For visual changes, inspect desktop, narrow mobile and enlarged text. Check replay, focus, FAQ links and order-dialog open/close, as well as the reduced-motion and no-JavaScript fallbacks. Local animation tests are separate from Messenger delivery evidence. The Co-op launcher remains governed by its existing independently approved binding.

## Technical references

- [CSS Color 4: interpolation](https://www.w3.org/TR/css-color-4/#interpolation): perceptual colour spaces and the tradeoffs between Oklab and OKLCH.
- [MDN: viewport length units](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length#relative_length_units_based_on_viewport): small, large and dynamic viewport behaviour.
- [W3C: multiply blending](https://www.w3.org/TR/compositing-1/#blendingmultiply): multiplication blends the entire source with its backdrop.
- [MDN: reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion): honour the user's preference for less nonessential motion.
