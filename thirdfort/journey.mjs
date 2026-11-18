export const sections = Object.freeze({
  "": "home",
  main: "home",
  solutions: "solutions",
  conveyancing: "conveyancing",
  resources: "resources",
  "source-of-funds": "source_of_funds",
  identity: "identity",
  support: "support",
});

const topics = new Set([
  "general",
  "mixed_deposit",
  "portal",
  "integration",
  "app_support",
]);
const fields = {
  tf_page_viewed: ["page"],
  tf_funds_guide_opened: ["page"],
  tf_context_offer_shown: ["page", "topic"],
  tf_message_opened: ["page", "topic"],
  tf_topic_selected: ["topic"],
  tf_answer_shown: ["topic"],
  tf_help_confirmed: ["topic"],
  tf_adviser_requested: ["topic"],
  tf_app_support_selected: ["topic"],
};

export const eventLabels = Object.freeze({
  tf_page_viewed: "Page viewed",
  tf_funds_guide_opened: "Opened mixed-deposit guidance",
  tf_context_offer_shown: "Saw the professional support offer",
  tf_message_opened: "Opened web messaging",
  tf_topic_selected: "Selected a topic",
  tf_answer_shown: "Received scripted guidance",
  tf_help_confirmed: "Confirmed guidance was useful",
  tf_adviser_requested: "Requested professional adviser",
  tf_app_support_selected: "Selected app support",
});

export function webEvent(name, data = {}) {
  if (!Object.hasOwn(fields, name)) throw new Error("Unknown journey event");
  const attributes = { surface: "thirdfort_professional_web" };
  for (const field of fields[name]) {
    const value = data[field];
    if (field === "topic" && !topics.has(value))
      throw new Error("Unknown professional enquiry topic");
    if (field === "page" && !Object.values(sections).includes(value))
      throw new Error("Unknown website section");
    attributes[field] = value;
  }
  return { eventName: name, customAttributes: attributes };
}

export function summarise(events) {
  const has = (name, predicate = () => true) =>
    events.some(
      ({ eventName, customAttributes }) =>
        eventName === name && predicate(customAttributes),
    );
  const segments = [];
  const outcomes = [];
  const contextualOffer =
    has("tf_page_viewed", (data) => data.page === "conveyancing") &&
    has("tf_funds_guide_opened");
  if (contextualOffer) segments.push("Conveyancing · source of funds");
  if (
    has("tf_message_opened", (data) => data.topic === "portal") ||
    has("tf_topic_selected", (data) => data.topic === "portal")
  ) {
    segments.push("Professional portal help");
  }
  if (
    has("tf_message_opened", (data) => data.topic === "integration") ||
    has("tf_topic_selected", (data) => data.topic === "integration")
  ) {
    segments.push("Firm onboarding and integrations");
  }
  if (has("tf_app_support_selected")) segments.push("App support signpost");
  if (has("tf_message_opened")) outcomes.push("Web messaging opened");
  if (has("tf_help_confirmed")) outcomes.push("Guidance confirmed helpful");
  if (has("tf_adviser_requested"))
    outcomes.push("Professional adviser requested");
  return { segments, outcomes, contextualOffer };
}
