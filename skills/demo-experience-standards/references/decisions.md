# Accepted experience decisions

## 21 November 2026: natural decorative motion

**Decision:** Do not add replay or watch-again controls to decorative motion on new demo websites, presentations or Voice Demo Builder interfaces. Let short entrances play naturally and finish in a stable composition.

**Reason:** Simon approved the first Co-op motion pass, then asked to remove its replay control. The decorative illustration should not add a second task to the customer journey.

**Scope:** Decorative motion only. Recorded demo players, guided explanation, slide navigation and real task controls retain their purpose. Explicit future requests can select another treatment.

**Example:** Co-op's grocery illustration and delivery van play once. Support links and the order dialog remain ordinary task controls. The removed replay control also releases the space it occupied on mobile.

**Evidence:** Co-op regression tests cover natural completion, initial and changed reduced-motion preference, keyboard-focus cancellation and absent IntersectionObserver. Desktop and narrow Chrome layouts were reviewed. These checks do not establish actual Safari/device coverage or live Messenger delivery.

## 21 November 2026: reusable lessons across output types

**Decision:** Carry accepted experience decisions into new demo websites, presentations and the unattended voice workflow. Store the decisions in maintained authoring guidance rather than relying on a previous conversation.

**Reason:** Simon explicitly requested that lessons learned during Co-op improve future production across all three surfaces.

**Application:** Websites keep responsive customer tasks; presentations guide an explanation with complete static/print output; Voice Demo Builder keeps real progress and verified readiness authoritative. Branding and native resource ownership stay with each existing specialist.

**Naming:** Use “Voice Demo Builder” as a working user-facing name. A permanent product rename, public domain change, API migration or native resource rename has not been implemented by this guidance.

## 21 November 2026: 21st.dev is an optional reference

**Decision:** Look at 21st.dev when a component or improvement would help, without requiring Simon to select an exact component. If no suitable, reviewable example is available, continue with a fitting native/custom approach. Simon may browse manually later; that is not a delivery prerequisite.

**Reason:** Simon explicitly asked to keep exploring these tools and offered 21st.dev as a useful source rather than a compulsory dependency.

**Scope:** New demo-site, presentation and Voice Demo Builder interface authoring. Review source, dependencies and licence before reusing third-party code. Preserve each existing runtime owner.

## Prototype observations

- Custom Blender artwork: assess the first rendered grocery scene in Co-op before promoting it as a reusable asset-production example. A successful render alone is not proof that a page is clearer, faster or more effective.
- Curated 21st.dev components: the Co-op guided-help prototype now adapts Arc’s reviewed animated-tabs pattern to native HTML/CSS/JavaScript. Its source/licence review, keyboard contract and plain-link fallback are retained with the component. This validates a way to fit an interaction to the existing stack; no particular component or layout is a portfolio default. See [technology candidates](technology-options.md) for the proposed next experiments.

- GSAP journey prototype: the separate Co-op connected-support route uses a pinned, self-hosted timeline to coordinate connector traces and stage emphasis. Stage selection remains functional without GSAP; all authored stages remain readable without JavaScript. Reduced motion and interrupted transitions settle into the selected state. This is a website prototype and a reuse pattern for the presentation owner, not an installed presentation feature or evidence of a live handover.
