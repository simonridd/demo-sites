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

## 22 November 2026: ordinary language, a resolution and a credible workplace

**Decision:** Customer presentations should tell a human story on their own. Remove generic AI-like explanations, give the customer a specific resolution and make the agent’s image believable for employer and workplace. Keep customer imagery natural rather than staging a sentimental happy ending.

**Reason:** Simon flagged the access/checks footer on Co-op’s spatial scene, noted that Maya never got a resolution, and said Sam did not look like a Co-op colleague in a contact centre/customer experience hub. Maya’s image was already suitable.

**Application:** Maya’s PNG stays unchanged. An identity-preserving edit places Sam at a branded Co-op workstation with a headset and shirt logo. The story now shows his order check, refund for the carton and Maya’s confirmation before he reviews the notes. The summary and ending carry the same outcome. Spatial controls refer to the order, Maya and Sam; generic governance text moves to private notes. Refund eligibility, authority and generated-workplace status are private assumptions, not observed outcomes or universal policy. No amount or settlement time is invented.

**Future check:** Read the audience route without notes. Can the viewer say what happened, who helped and how the request ended? Does each sentence explain this person’s situation, or drift into abstract AI/product prose? Does character imagery establish a credible role? Preserve genuinely material qualifications when needed for a real audience decision, and keep actual privacy/provider/readiness owners intact.

## 22 November 2026: features help the agent help the customer

**Decision:** Give Copilot an explicit feature-to-person explanation, then bring the story together with sourced performance figures. Map a selected feature to Sam's work and Maya's benefit; later scenes show the feature in use. Keep human review and decisions visible.

**Reason:** Simon asked for one or more slides explaining how Copilot helps Sam assist Maya and a slide with performance improvements.

**Application:** Co-op adds a static knowledge/checklist/summary-and-wrap-up map after Sam's frustrations and a two-case results slide after his notes. Eir reports up to 60 seconds saved per voice call; Probe CX reports 25–30% less after-call work for an automotive finance client with Copilot summaries and coaching. Names, qualifiers, units, contributing coaching and primary links stay visible. Exact sources and excluded wider-platform measures remain private. These are published cases, not Co-op measurements, forecasts, additive savings or guarantees.

**Scope and checks:** This is a reusable narrative and evidence practice, not a requirement for a feature table or metrics on every deck. Preserve the client's art direction, native runtime and private source contracts. Stage and mobile reading checks qualify the two new static scenes; no extra motion dependency or Genesys configuration is introduced. Presentation-authoring owns versioned release/adoption receipts.

## 22 November 2026: quick emphasis on headline figures

**Decision:** A brief count-up can emphasise selected presentation figures when requested. Simon asked for the 60-second figure to rise quickly from zero after approving the clearer Copilot section.

**Application:** Co-op's two performance figures count once in 850 ms on first stage entry, retaining the range, units, “up to”, named customer scope and coaching context. Final-width reservation prevents shifting type. Final accessible text stays stable; reading, print, no-JavaScript and reduced-motion views stay still. Exit, overview, page hiding, printing and motion-preference changes settle immediately. No replay or new library is introduced.

**Scope:** This refines the default of still evidence. It does not require every number to animate, imply live measurement, change any result or add a new technology dependency. The original five Co-op trials stay intact; this later requested native enhancement is recorded separately.

## 22 November 2026: short themed demonstration and a focused pilot

**Decision:** A short demonstration can complement full-length recordings when it serves the story and fits the presentation theme. Simon authorised the Copilot sequence, tighter middle and concrete pilot proposal, and invited a shorter example that does not compete visually with the deck.

**Application:** Co-op uses native presenter fragments for guidance/checks and reviewed summary/code, with Maya's refund between. The existing late-delivery recording was inspected but its different story and retained capture/acceptance limitations did not fit this sequence. It is unchanged and unselected. The authored illustrated walkthrough uses the deck's cream/cyan typography, no separate player or automatic progression. The full-length capture/assembly owner remains unchanged.

**Story and checks:** Fourteen main scenes preserve the character arc; Three.js remains in optional exploration with native return to the same notes step. The pilot selects missing-item calls, a team and a baseline for after-call work, summary corrections and repeat contact, with resolution quality. No dates, team size, measured gains or configured customer codes are invented. Retain chosen partnership marks across custom scenes, with light/dark contrast and narrow-header checks. Native arrows/Space, reverse steps, optional return, reading, print and reduced-motion/static paths retain their contracts.


## 22 November 2026: story, full demonstration, outcomes and next decision

**Decision:** Simon asked to apply the explicit demo-switch principle to Holcim after the Co-op work. Put people, friction and capability explanation before the full demonstrations. Return to the demonstrated next step, sourced results and a practical pilot. Retain client | IPI throughout.

**Application:** Holcim introduces Jamie and Emily, maps Copilot help to their work, then gives the presenter five retained playback choices. Back returns to the choices; Continue returns to the selected example's outcome. Existing player bytes, media, audio and controls remain unchanged. The AVA example recaps requirements for adviser follow-up; it does not show correction handling or an actual transfer. Keep exact selection/source evidence private. The original overview and combined offline edition stay available for comparison. A hosted-player dependency does not become an offline media package when the slides are downloaded.

**Button trial:** Simon supplied an inset-shadow/gradient/one-pixel press example and asked whether to incorporate it. The restrained Holcim-coloured treatment is limited to demo launch actions, with keyboard focus, flat disabled treatment and reduced-motion handling. Ordinary navigation stays quiet. It remains a selective trial pending his feedback, not a mandatory global button redesign.

**Checks:** Verify actual launch destinations and retained query/hash, native playback, close/unload, return focus, keyboard ownership, selected outcome copy and mobile reading. Keep tests, deployment, installed adoption and any unperformed physical-device or spoken rehearsal separate. The presentation owner owns the portable host; recording and assembly owners retain the players.
