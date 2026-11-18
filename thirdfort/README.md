# Thirdfort professional web demonstration

Start on the Thirdfort page. Allow analytics, choose **Conveyancing**, follow **Read source of funds guidance**, and open **How can we handle a gifted deposit alongside savings?** Choose **Ask about mixed deposits**, select the example question, then choose **Ask a professional adviser**. The comparison route selects **That answers my question**. The professional portal and integrations routes can start directly from the support section. The app-support link points people completing a check to the separate Thirdfort help centre.

Add `?presenter=1` to the page URL to see the consent state, chronological browser events, matched segments and outcomes below the footer. **Reset this visit** starts a new rehearsal. Events are kept in browser memory and cleared when analytics is declined or reset. For this rehearsal, only the consent choice is kept for the current tab. None of the example turns opens an actual conversation. The visitor can still open the rehearsal after declining analytics.

Provider setup uses a separate professional inbound flow and queue. A suitable first request is a fictional conveyancer asking how a mixed gift and savings deposit appears to the firm. The AI can explain the public product workflow with a source. A case-specific interpretation, access to a report or an account detail belongs with professional support or the authenticated portal. For a firm evaluating Thirdfort, keep implementation and integrations distinguishable from existing client support. The published phone deployments are the app-user channel.

| Predictive Engagement segment | Event name | Website condition |
| --- | --- | --- |
| Thirdfort Web - Conveyancing source of funds | `tf_context_offer_shown` | Conveyancing section viewed and mixed-deposit guide opened during the visit. The site shows one inline professional support offer. |
| Thirdfort Web - Professional portal help | `tf_portal_interest` | The visitor chose professional portal help. |
| Thirdfort Web - Firm onboarding and integrations | `tf_integrations_interest` | The visitor chose firm onboarding or integrations. |
| Thirdfort Web - App support signpost | `tf_app_support_selected` | The visitor chose the app support route. Exclude this group from professional proactive offers. |

All site events carry `surface=thirdfort_professional_web` and at most an allowlisted page or topic. See [journey.mjs](journey.mjs) for event names and [messenger.mjs](messenger.mjs) for the adapter. Native browser events are section views, guide expansion, the context offer, messaging opens and the app support signpost. Use provider flow milestones or interaction data for native topic selection, AI invocation and exit reason, customer-confirmed help, adviser transfer requested, actual queue answer, and final wrap-up. A messaging open or adviser request is a separate event from a queue answer.

The dedicated inbound flow and guided bot are published. **Thirdfort Professional Web**, Messenger configuration version 1, has Messaging and Digital User Tracking enabled, with attachment uploads and the built-in launcher off. The four Genesys segments match the exact web event names above and expire after one day. Their rules are saved; verify actual matches in Live Now after the site is connected.

For live enablement, use a hostname admitted by the provider owner, publish a restricted deployment, then set its independently verified public deployment ID and HTTPS origin in `messenger-settings.mjs`. For a fictional attended inquiry, open its Customer Journeys tab and verify the website context and interaction outcome. Check tracking decline, one unanswered enquiry and the app support signpost separately. The current bot is guided; include an AVA session trace after an AVA is connected and exercised. The checked-in site uses rehearsal mode.

Product references: [Thirdfort homepage](https://www.thirdfort.com/), [conveyancing](https://www.thirdfort.com/sectors/conveyancers/), and [Source of Funds client support](https://support.thirdfort.com/hc/en-gb/articles/12064493569309-What-is-the-Source-of-Funds-check). Platform references: [Digital User Tracking setup](https://help.genesys.cloud/articles/get-started-with-digital-user-tracking/) and [interaction journey data](https://help.genesys.cloud/articles/view-an-interactions-predictive-engagement-journey-data/).
