const bootstrap =
  "https://apps.mypurecloud.ie/genesys-bootstrap/genesys.min.js";
const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;

export function professionalMessenger(settings) {
  if (
    !settings ||
    !uuid.test(settings.deploymentId) ||
    location.origin !== settings.origin
  )
    return null;
  let started = false;
  let resolveMessenger;
  let resolveJourney;
  const messenger = new Promise((resolve) => {
    resolveMessenger = resolve;
  });
  const journey = new Promise((resolve) => {
    resolveJourney = resolve;
  });
  const command = (name, payload) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("The messaging service timed out.")),
        8000,
      );
      window.Genesys(
        "command",
        name,
        payload,
        (result) => {
          clearTimeout(timer);
          resolve(result);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        },
      );
    });
  function start() {
    if (started) return;
    started = true;
    window._genesysJs = "Genesys";
    window.Genesys = function (...args) {
      (window.Genesys.q ??= []).push(args);
    };
    window.Genesys.t = Date.now();
    window.Genesys.c = {
      environment: "prod-euw1",
      deploymentId: settings.deploymentId,
    };
    window.Genesys("subscribe", "Messenger.ready", () =>
      resolveMessenger(true),
    );
    window.Genesys("subscribe", "Journey.ready", () => resolveJourney(true));
    const script = document.createElement("script");
    script.src = bootstrap;
    script.async = true;
    script.onerror = () => {
      resolveMessenger(false);
      resolveJourney(false);
    };
    document.head.append(script);
    setTimeout(() => {
      resolveMessenger(false);
      resolveJourney(false);
    }, 10000);
  }
  return {
    start,
    async record(event) {
      if (!(await journey)) return;
      await command("Journey.record", { ...event, traitsMapper: [] });
    },
    async open(attributes) {
      if (!(await messenger))
        throw new Error("Professional messaging is unavailable.");
      await command("Database.set", {
        messaging: { customAttributes: attributes },
      });
      await command("Messenger.open", {});
    },
  };
}
