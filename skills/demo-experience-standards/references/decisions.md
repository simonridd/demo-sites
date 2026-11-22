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

## 22 November 2026: customer task versus presenter explanation

**Decision:** Retain the connected-journey component in the kit bag, outside the customer-demo collection. The customer/assistant/knowledge/adviser explanation suits presentations and presenter-led demonstrations. A customer website should support its customer's task; the component may be reused there with genuinely relevant content.

**Reason:** Simon liked the component but identified that this particular explanation did not belong on a page meant to simulate a customer-facing website.

**Application:** The Co-op support page remains the customer experience. The explainer is reserved under `kits/connected-support/`, with neutral kit framing and an entry at `kits/`. The previous route redirects to the kit so existing links keep working. Customer discovery does not list it. Future customer process visuals still need appropriate content and truthful state; no blanket ban on process components is implied.

## 22 November 2026: proportionate technology trials

**Decision:** Keep Rive as a limited trial because of cost and move on to the next candidate. Retain its editable source and static preview in the kit bag; do not expand it into an account, asset-production or portfolio runtime dependency without a use case that justifies that work.

**Reason:** Simon said it was worth trialling but that we might not want to go too deep because of cost.

**Application:** Compare licence costs, runtime weight, local production work and ongoing maintenance when choosing technologies. Remotion is evaluated privately under its published evaluation allowance; customer/production use needs the relevant company licence. No subscription or paid service was purchased by these trials. Native CSS/SVG remains suitable for simple website feedback.

## 22 November 2026: deepen the original core stack

**Decision:** Return the implementation focus to selected 21st.dev patterns, native CSS motion, GSAP, Blender and Three.js. Build on the approved Co-op results and turn them into reusable authoring recipes across new websites, presentations and Voice Demo Builder.

**Reason:** Simon was pleased with the initial results and asked to work out the best implementation approaches for those technologies rather than continue expanding into additional animation products.

**Application:** Follow the maintained implementation playbook. Native task interactions and optimised Blender artwork are the first reuse candidates; GSAP supplies coordinated explanation when useful; Three.js needs a defined spatial/product interaction and a complete on-demand/fallback lifecycle. Rive remains reserved and the unfinished Remotion evaluation stays local. This guidance does not install new runtimes into every output.

## Prototype observations

- Custom Blender artwork: assess the first rendered grocery scene in Co-op before promoting it as a reusable asset-production example. A successful render alone is not proof that a page is clearer, faster or more effective.
- Curated 21st.dev components: the Co-op guided-help prototype now adapts Arc’s reviewed animated-tabs pattern to native HTML/CSS/JavaScript. Its source/licence review, keyboard contract and plain-link fallback are retained with the component. This validates a way to fit an interaction to the existing stack; no particular component or layout is a portfolio default. See [technology candidates](technology-options.md) for the proposed next experiments.

- GSAP journey prototype: the reserved connected-support kit uses a pinned, self-hosted timeline to coordinate connector traces and stage emphasis. Stage selection remains functional without GSAP; all authored stages remain readable without JavaScript. Reduced motion and interrupted transitions settle into the selected state. This is a website prototype and a reuse pattern for the presentation owner, not an installed presentation feature or evidence of a live handover.

- Customer-task motion prototype, 22 November: Co-op's native order-support drawer keeps the receipt and selected item in view while the customer chooses an issue and reads relevant guidance. Choices are retained within the page visit; the final screen explicitly separates preparation from submission. This is a reusable interaction approach under review, not a working refund/report service or an adopted visual template for every client.

## 22 November 2026: a fresh presentation needs a fresh art direction

**Decision:** When Simon asks to reimagine a presentation from a blank canvas, establish a new narrative, mood, typography, imagery and composition before choosing implementation components. Reuse the specialist’s navigation, source and privacy contracts while giving the new story its own visual language.

**Reason:** Simon felt the first five remakes still took too much inspiration from the previous solution. He commissioned a new Co-op presentation with full artistic licence and one use each of CSS/motion, 21st.dev, GSAP, Blender and Three.js.

**Scope:** The five-technology constraint belongs to this particular trial. Future decks should select the technologies that improve their story. No new default stack, paid tool, installed runtime or customer-service configuration follows from this request.

**Prototype:** Co-op’s nine-scene “Everyday, considered.” proposal uses an original Blender product still, a native CSS typographic reveal, a reviewed Dice UI/21st.dev comparison pattern, one GSAP handoff and one Three.js inspection. Its composition is a candidate for Simon to review; the lesson is to start with the story and art direction.

**Observed:** The attached Chrome cannot create WebGL. Three.js’s actual SVGRenderer supplies a working geometry-only fallback. Camera/view changes update the projected geometry, keyboard controls retain their keys, idle frames stop and leaving the scene disposes it. This does not establish GPU/WebGL, physical-phone, screen-reader or spoken-rehearsal acceptance.

## 22 November 2026: cover partnership and people in the story

**Decision:** Blend the client and actual IPI logo into presentation covers, with a visible pipe and balanced optical sizing. When people carry the story, introduce the customer before the friction and the colleague at the handoff, with original generated portraits that share the deck’s art direction. Return to their immediate needs rather than adding standalone biographies.

**Reason:** Simon liked the original Co-op direction and asked for these two improvements to the base template, starting with Co-op.

**Application:** Co-op’s opening and closing use the retained Co-op | IPI marks. Maya enters before the missing egg; Sam enters when the request reaches a colleague. Matching transparent editorial portraits sit within the existing cream/cyan typography and image system. Static introductions preserve the five bounded technology allocations. Names and context are also in the canonical audience explanation for reading, no-JS and print. Keep prompts, mode, authored-character status and asset provenance in private operator/source material; a generated face is not evidence of a real customer event or staff endorsement. The reusable decision is continuity of branding and people, not a requirement to reuse Maya, Sam or their portrait style in unrelated clients.

**Checks and rollout:** Owner source tests and browser review qualify the implementation separately from this guidance. The presentation owner stages candidate 3.2.0; a guidance merge or Git pull does not upgrade an installed runtime. Chrome hardware WebGL acceptance remains open for manual graphics-setting enablement and retest; the current genuine SVGRenderer fallback remains available.

## 22 November 2026: accepted standard and the agent’s frustrations

**Decision:** The approved Co-op cover, matching character imagery and visual storytelling approach is now the standard for new customer/demo presentations. Customer-service stories should give the human agent a role, goal and friction, then connect a later capability explanation to helping that person.

**Reason:** Simon said “Love it. So this needs to be our standard” and asked to add the agent’s frustrations and link Copilot to resolving them in later slides.

**Application:** Keep Sam as the customer service agent. After his introduction, show the searching, checking and writing around Maya’s contact. Link relevant knowledge to searching, a configured checklist to remembering checks, and a draft summary to writing. Keep Sam reviewing and deciding. Preserve coherent cream/cyan imagery and concise typography, with detail in private notes and canonical reading copy. Frustrations are authored examples, not actual customer research; capabilities require primary-source verification and customer configuration. No runtime readiness, integration, savings or resolved refund is implied by a presentation.

**Scope:** The visual/character narrative is the default for new customer/demo decks. Keep each client’s art direction distinct, select technology where it adds value, and retain the existing website/AVA/presentation owners. Do not put presenter architecture or agent frictions onto customer-facing task screens without a relevant customer purpose. Installed skill adoption requires the owner’s versioned staging and checksum process; record its actual outcome separately.
