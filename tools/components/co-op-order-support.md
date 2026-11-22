# Co-op customer order support

Added on 22 November 2026 after Simon approved the customer-focused order-support drawer. This is original native HTML/CSS/JavaScript, with no new library or runtime dependency. 21st.dev remains an optional reference; the existing stack provides the required modal, radio-group and state behavior.

The fictional receipt in `co-op/index.html` is the single source for the three item names and quantities. It remains inline with all three advice sections when scripts or native dialogs are unavailable. `order-support.js` relocates it into a native modal and reveals item selection, issue selection and tailored next-step guidance. Existing receipt launch points are real fallback links, including modified clicks and direct `#order-details` navigation.

Selections remain in memory only, including on Back and close/reopen; a page reload resets them. Earlier edits refresh later summaries and only one issue's guidance can appear. Closing uses native Escape and restores focus; the final contact link closes and focuses the existing contact section without invoking Messenger. No provider scripts, reports, refund decisions, storage writes or network requests are introduced. The current Messenger binding remains disabled.

CSS supplies bounded slide/step entrances only under `prefers-reduced-motion: no-preference`. There are no delayed state changes, exit timers or replay controls. The header remains visible while the body scrolls in a `dvh`-bounded drawer. Existing one-time grocery artwork is independent.

## Verification

- Controller regressions cover fallback support, unselected-state guards, all three issue routes, receipt/quantity consistency, earlier edits, reopen retention, modified links, direct hashes and contact focus.
- Chrome review covers desktop, 390px and 320px layouts, keyboard radio controls, native Escape/focus return, modal focus containment, enlarged text, and the contact return.
- Local source fixtures separately check no-script receipt access and a no-motion/enlarged-text composition. These do not establish a real device, Safari or operating system preference test.
- All static checks and deployed asset/source identity are verified through the normal site release workflow. A working local interaction is not evidence of live Genesys delivery.
