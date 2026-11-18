const { test } = require("node:test");
const assert = require("node:assert/strict");
const journey = import("./thirdfort/journey.mjs");

test("professional journey requires both browsing signals and reports help and handoff distinctly", async () => {
  const { webEvent, summarise } = await journey;
  const visits = [
    webEvent("tf_page_viewed", { page: "home" }),
    webEvent("tf_page_viewed", { page: "conveyancing" }),
    webEvent("tf_funds_guide_opened", { page: "source_of_funds" }),
  ];
  assert.equal(summarise(visits.slice(0, 2)).contextualOffer, false);
  assert.equal(summarise([visits[2]]).contextualOffer, false);
  assert.equal(summarise(visits).contextualOffer, true);
  assert.deepEqual(summarise(visits).segments, []);
  const escalated = summarise([
    ...visits,
    webEvent("tf_context_offer_shown", {
      page: "source_of_funds",
      topic: "mixed_deposit",
    }),
    webEvent("tf_message_opened", {
      page: "source_of_funds",
      topic: "mixed_deposit",
    }),
    webEvent("tf_adviser_requested", { topic: "mixed_deposit" }),
  ]);
  assert.deepEqual(escalated.segments, ["Conveyancing · source of funds"]);
  assert.deepEqual(escalated.outcomes, [
    "Web messaging opened",
    "Professional adviser requested",
  ]);
});

test("website events accept only named pages and topics, and never include raw enquiry details", async () => {
  const { webEvent, summarise, topicInterestEvent } = await journey;
  const portal = webEvent("tf_message_opened", {
    page: "support",
    topic: "portal",
    chat: "private enquiry",
    name: "person",
  });
  assert.deepEqual(portal.customAttributes, {
    surface: "thirdfort_professional_web",
    page: "support",
    topic: "portal",
  });
  assert.deepEqual(summarise([portal]).segments, []);
  const portalInterest = webEvent(topicInterestEvent("portal"), {
    chat: "private enquiry",
  });
  const integrationInterest = webEvent(topicInterestEvent("integration"));
  assert.deepEqual(portalInterest.customAttributes, {
    surface: "thirdfort_professional_web",
  });
  assert.deepEqual(summarise([portalInterest, integrationInterest]).segments, [
    "Professional portal help",
    "Firm onboarding and integrations",
  ]);
  assert.throws(
    () => webEvent("tf_topic_selected", { topic: "arbitrary input" }),
    /Unknown professional enquiry topic/,
  );
  assert.throws(
    () => webEvent("tf_page_viewed", { page: "https://external.invalid" }),
    /Unknown website section/,
  );
  assert.throws(() => webEvent("unlisted", {}), /Unknown journey event/);
  assert.deepEqual(
    summarise([webEvent("tf_app_support_selected", { topic: "app_support" })])
      .segments,
    ["App support signpost"],
  );
});
