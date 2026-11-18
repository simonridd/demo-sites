import { eventLabels, sections, summarise, webEvent } from "./journey.mjs";
import { professionalMessenger } from "./messenger.mjs";
import settings from "./messenger-settings.mjs";

const byId = (id) => document.getElementById(id);
const consentPanel = byId("consent");
const offer = byId("funds-offer");
const message = byId("message");
const conversation = byId("conversation");
const choices = byId("choices");
const messageNote = byId("message-note");
const native = professionalMessenger(settings);
const preferenceKey = "thirdfort-professional-analytics";
const topics = {
  mixed_deposit: {
    label: "Gifted deposit and savings",
    question:
      "Can we use Thirdfort for a deposit made up of a gift and the buyer’s savings?",
    answer:
      "The source of funds check can collect questionnaire answers and supporting evidence. Depending on the request, the purchaser or giftor can provide bank statements through Open Banking or manual upload. Your firm decides what evidence it needs.",
    link: [
      "Thirdfort client support · Source of Funds",
      "https://support.thirdfort.com/hc/en-gb/articles/12064493569309-What-is-the-Source-of-Funds-check",
    ],
  },
  portal: {
    label: "Professional portal or reports",
    question:
      "Where should our firm look for the results of a source of funds request?",
    answer:
      "The Source of Funds report brings together the results and any flags for your firm to review. For help with a particular report or with your access, use professional support in the signed-in portal.",
    link: [
      "Thirdfort client support",
      "https://support.thirdfort.com/hc/en-gb/articles/7765857376029-Thirdfort-Support",
    ],
  },
  integration: {
    label: "Onboarding and integrations",
    question:
      "Can our conveyancing firm connect Thirdfort to its case management system?",
    answer:
      "Thirdfort lists several integrations for conveyancers. A specialist can help confirm whether your system and workflow are supported.",
    link: [
      "Thirdfort integrations for conveyancers",
      "https://www.thirdfort.com/sectors/conveyancers/",
    ],
  },
};
let consent;
try {
  consent = sessionStorage.getItem(preferenceKey);
} catch {}
let events = [];
let dispatch = Promise.resolve();
let revision = 0;
let lastSection;
let offerShown = false;
const presenter = new URLSearchParams(location.search).get("presenter") === "1";
byId("inspector").hidden = !presenter;

function section() {
  const fragment = location.hash.slice(1);
  return Object.hasOwn(sections, fragment) ? sections[fragment] : "home";
}

function emit(name, data) {
  if (consent !== "allowed" || events.length >= 200) return;
  const event = webEvent(name, data);
  events.push(event);
  const acceptedRevision = revision;
  if (native) {
    dispatch = dispatch
      .then(async () => {
        if (acceptedRevision === revision && consent === "allowed")
          await native.record(event);
      })
      .catch(() => {});
  }
  updateReport();
}

function updateReport() {
  const report = summarise(events);
  offer.hidden = consent !== "allowed" || !report.contextualOffer;
  if (!offer.hidden && !offerShown) {
    offerShown = true;
    emit("tf_context_offer_shown", {
      page: "source_of_funds",
      topic: "mixed_deposit",
    });
    return;
  }
  if (!presenter) return;
  byId("tracking-state").textContent = native
    ? "Browser event preview. Verify provider receipt in Genesys Live Now."
    : "Browser rehearsal. Events and segment matches are shown for this visit.";
  byId("segments").textContent = report.segments.join(" · ") || "None";
  byId("outcomes").textContent = report.outcomes.join(" · ") || "None";
  byId("events").replaceChildren(
    ...events.map(({ eventName, customAttributes }) => {
      const row = document.createElement("li");
      row.textContent = [
        eventLabels[eventName],
        customAttributes.page,
        customAttributes.topic,
      ]
        .filter(Boolean)
        .join(" · ");
      return row;
    }),
  );
}

function viewSection() {
  if (consent !== "allowed") return;
  const currentSection = section();
  if (lastSection === currentSection) return;
  lastSection = currentSection;
  emit("tf_page_viewed", { page: currentSection });
}

function setConsent(value) {
  const old = consent;
  consent = value;
  try {
    if (value) sessionStorage.setItem(preferenceKey, value);
    else sessionStorage.removeItem(preferenceKey);
  } catch {}
  consentPanel.hidden = Boolean(value);
  if (value === "allowed") {
    native?.start();
    viewSection();
  } else {
    revision++;
    events = [];
    lastSection = undefined;
    offerShown = false;
    if (native && old === "allowed") location.reload();
  }
  updateReport();
}

function addMessage(speaker, copy, link) {
  const bubble = document.createElement("div");
  bubble.className = speaker === "You" ? "bubble customer" : "bubble";
  bubble.textContent = copy;
  bubble.setAttribute("aria-label", speaker + ": " + copy);
  if (link) {
    const anchor = document.createElement("a");
    [anchor.textContent, anchor.href] = link;
    anchor.rel = "noopener";
    bubble.append(anchor);
  }
  conversation.append(bubble);
  conversation.scrollTop = conversation.scrollHeight;
}

function showChoices(items) {
  choices.replaceChildren(
    ...items.map(([label, action], index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      if (index === 0) button.autofocus = true;
      button.addEventListener("click", action);
      return button;
    }),
  );
  if (message.open) choices.querySelector("button")?.focus();
}

function showResult(topic, result) {
  const confirmed = result === "confirmed";
  addMessage(
    "You",
    confirmed
      ? "That answers my question."
      : "I’d like to ask a professional adviser.",
  );
  emit(confirmed ? "tf_help_confirmed" : "tf_adviser_requested", { topic });
  addMessage(
    "Thirdfort",
    confirmed
      ? "Thanks. You can return to the guidance at any time."
      : "In the live journey, professional support would receive your enquiry topic and relevant website context.",
  );
  showChoices([["End rehearsal", () => message.close()]]);
}

function ask(topic) {
  emit("tf_topic_selected", { topic });
  const { question, answer, link } = topics[topic];
  addMessage("You", question);
  addMessage("Thirdfort", answer, link);
  emit("tf_answer_shown", { topic });
  showChoices([
    ["That answers my question", () => showResult(topic, "confirmed")],
    ["Ask a professional adviser", () => showResult(topic, "adviser")],
  ]);
}

function welcome(topic) {
  addMessage("Thirdfort", "Hello. How can we help your firm today?");
  const keys =
    topic === "general"
      ? Object.keys(topics)
      : [topic, ...Object.keys(topics).filter((key) => key !== topic)];
  showChoices([
    ...keys.map((key) => [topics[key].label, () => ask(key)]),
    [
      "I’m completing a check",
      () => {
        emit("tf_app_support_selected", { topic: "app_support" });
        addMessage(
          "Thirdfort",
          "The Thirdfort app support team can help with your check.",
          ["Open Thirdfort app support", "https://help.thirdfort.com/hc/en-gb"],
        );
        showChoices([["Close messaging", () => message.close()]]);
      },
    ],
  ]);
}

function openPreview(topic) {
  conversation.replaceChildren();
  messageNote.textContent =
    "Scripted preview. Use the example replies to rehearse the journey.";
  welcome(topic);
  message.showModal();
  emit("tf_message_opened", { page: section(), topic });
}

let opening = false;
async function openMessage(topic) {
  if (!native) {
    openPreview(topic);
    return;
  }
  if (opening) return;
  if (consent !== "allowed") {
    conversation.replaceChildren();
    addMessage(
      "Website",
      "Allow analytics to use the linked demonstration, or open Thirdfort’s professional support site.",
    );
    messageNote.textContent = "Use example questions for this demonstration.";
    showChoices([
      [
        "Allow analytics and open messaging",
        () => {
          message.close();
          setConsent("allowed");
          void openMessage(topic);
        },
      ],
      [
        "Visit Thirdfort client support",
        () => {
          location.href = "https://support.thirdfort.com/hc/en-gb";
        },
      ],
    ]);
    message.showModal();
    return;
  }
  opening = true;
  const report = summarise(events);
  try {
    await native.open({
      thirdfortSurface: "professional_web",
      thirdfortTopic: topic,
      thirdfortEntryPage: section(),
      thirdfortConveyancingContext: String(report.contextualOffer),
    });
    emit("tf_message_opened", { page: section(), topic });
  } catch {
    conversation.replaceChildren();
    addMessage(
      "Website",
      "Professional messaging is temporarily unavailable.",
      [
        "Visit Thirdfort client support",
        "https://support.thirdfort.com/hc/en-gb",
      ],
    );
    messageNote.textContent = "";
    showChoices([["Close messaging", () => message.close()]]);
    message.showModal();
  } finally {
    opening = false;
  }
}

document.querySelectorAll("button[data-message]").forEach((button) => {
  button.addEventListener(
    "click",
    () => void openMessage(button.dataset.message),
  );
});
document.querySelector("[data-app-support]").addEventListener("click", () => {
  emit("tf_app_support_selected", { topic: "app_support" });
});
document.querySelectorAll("details[data-guide]").forEach((guide) => {
  guide.addEventListener("toggle", () => {
    if (guide.open) emit("tf_funds_guide_opened", { page: "source_of_funds" });
  });
});
window.addEventListener("hashchange", viewSection);
byId("preferences").addEventListener("click", () => {
  consentPanel.hidden = false;
  byId("decline").focus();
});
byId("accept").addEventListener("click", () => setConsent("allowed"));
byId("decline").addEventListener("click", () => setConsent("declined"));
byId("reset").addEventListener("click", () => setConsent(undefined));
byId("close-message").addEventListener("click", () => message.close());
setConsent(
  consent === "allowed" || consent === "declined" ? consent : undefined,
);
