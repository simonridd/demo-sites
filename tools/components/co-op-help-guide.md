# Co-op guided help component

The native help panel is a new implementation informed by the animated-tabs
pattern published by Elia Kuratli (Arc) on 21st.dev. It preserves the existing
customer-support topics, order receipt and FAQ hashes. It does not query order
status or change messaging availability.

## Reference review, 21 November 2026

- Component listing: https://docs.21st.dev/@kuratlielia/components/tabs
- Reviewed source: https://raw.githubusercontent.com/kuratlielia/arc-library/main/public/r/tabs.json
- Reviewed registry SHA-256: `582d246a62cbe8431ae92fe04f5ce636c42e34e72e320767ee6bd97a071f1a03`
- Original dependencies: React, Radix Tabs, Motion, lucide-react and Arc motion tokens.
- Original licence: MIT, copyright 2026 Elia Kuratli. The notice is retained in
  [arc-tabs-LICENSE.txt](arc-tabs-LICENSE.txt).
- Accessibility reference: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/

The original React implementation is not bundled. Native links, ARIA state,
CSS and a small script provide the interaction in this buildless site. There is
no new runtime dependency, remote component execution or source-code fetch.

## Behavior to preserve

Selectors become tabs only after all panels are found. Plain links remain if
JavaScript is unavailable or initialization is incomplete. Existing FAQ hashes
open their answers and synchronize topic selection. Modifier-click retains
ordinary link navigation. One tab and one panel are active; arrow keys wrap,
Home/End work, and orientation follows the responsive layout. Horizontal tabs
leave Up/Down for browser scrolling. Selected panels are in the tab sequence.

Panel transitions stop under reduced motion. Print shows all three panels. The
shared receipt dialog returns focus to the action that opened it. No personal
details are collected or persisted by this component. Content reuses the existing
support guidance and makes no new delivery, collection or refund promise.

Regression coverage is in `co-op-help-guide.test.cjs`; inspect desktop and narrow
layouts and exercise the real receipt/FAQ links before publication. Source tests
do not prove screen-reader, Safari or live provider behavior. This is a reusable
interaction recipe, not a requirement that every demo use tabs.
