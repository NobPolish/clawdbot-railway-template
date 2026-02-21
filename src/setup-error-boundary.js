import { SetupRequestError } from "./setup-request-client.js";

function isSetupRequestError(err) {
  return err instanceof SetupRequestError || (err && err.name === "SetupRequestError");
}

export function getErrorPresentation(err, context = {}) {
  const sectionLabel = context.sectionLabel || "this section";
  const category = isSetupRequestError(err) ? err.category : "unknown";

  if (category === "auth") {
    return {
      severity: "warning",
      title: "Session expired",
      message: "Your session needs to be refreshed. Please sign in again to continue setup.",
      ctaLabel: "Sign in",
      ctaHref: "/auth/login",
      sectionRecoverable: false,
    };
  }

  if (category === "timeout") {
    return {
      severity: "warning",
      title: "Request timed out",
      message: `The request in ${sectionLabel} took too long. Please retry.`,
      ctaLabel: "Retry",
      sectionRecoverable: true,
    };
  }

  if (category === "validation") {
    return {
      severity: "info",
      title: "Please review your input",
      message: `One or more values in ${sectionLabel} are invalid. Check highlighted fields and try again.`,
      ctaLabel: "Review inputs",
      sectionRecoverable: true,
    };
  }

  if (category === "server") {
    return {
      severity: "error",
      title: "Server is temporarily unavailable",
      message: "Setup is running in degraded mode. Read-only actions are still available while the server recovers.",
      ctaLabel: "Retry",
      sectionRecoverable: true,
      safeMode: true,
    };
  }

  if (category === "network") {
    return {
      severity: "warning",
      title: "Connection issue",
      message: "We could not reach the server. Check your network connection and retry.",
      ctaLabel: "Retry",
      sectionRecoverable: true,
    };
  }

  return {
    severity: "error",
    title: "Something went wrong",
    message: `An unexpected error occurred in ${sectionLabel}. You can retry or reload the page.`,
    ctaLabel: "Reload",
    sectionRecoverable: true,
  };
}

function esc(str) {
  const d = document.createElement("div");
  d.textContent = String(str || "");
  return d.innerHTML;
}

export function createErrorBannerController(options = {}) {
  const root = options.root || document.body;
  let currentSectionBoundary = null;

  const banner = document.createElement("div");
  banner.id = "setupErrorBanner";
  banner.style.display = "none";
  banner.style.margin = "0 0 1rem 0";
  banner.style.padding = "0.9rem 1rem";
  banner.style.borderRadius = "10px";
  banner.style.border = "1px solid rgba(239,68,68,.45)";
  banner.style.background = "rgba(239,68,68,.1)";
  banner.style.color = "#fecaca";
  banner.style.fontSize = "0.95rem";

  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = "space-between";
  container.style.gap = "0.75rem";

  const textWrap = document.createElement("div");
  textWrap.style.display = "flex";
  textWrap.style.flexDirection = "column";
  textWrap.style.gap = "0.25rem";

  const title = document.createElement("strong");
  const message = document.createElement("span");
  textWrap.appendChild(title);
  textWrap.appendChild(message);

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.alignItems = "center";
  actions.style.gap = "0.5rem";

  const actionButton = document.createElement("button");
  actionButton.type = "button";
  actionButton.style.border = "1px solid rgba(255,255,255,.2)";
  actionButton.style.background = "rgba(255,255,255,.08)";
  actionButton.style.color = "#fff";
  actionButton.style.borderRadius = "8px";
  actionButton.style.padding = "0.4rem 0.7rem";
  actionButton.style.cursor = "pointer";

  const dismissButton = document.createElement("button");
  dismissButton.type = "button";
  dismissButton.textContent = "Dismiss";
  dismissButton.style.border = "none";
  dismissButton.style.background = "transparent";
  dismissButton.style.color = "#d4d4d8";
  dismissButton.style.textDecoration = "underline";
  dismissButton.style.cursor = "pointer";

  dismissButton.addEventListener("click", () => hideBanner());

  actions.appendChild(actionButton);
  actions.appendChild(dismissButton);
  container.appendChild(textWrap);
  container.appendChild(actions);
  banner.appendChild(container);

  root.prepend(banner);

  function applySeverity(severity) {
    if (severity === "warning") {
      banner.style.border = "1px solid rgba(251,191,36,.45)";
      banner.style.background = "rgba(251,191,36,.1)";
      banner.style.color = "#fde68a";
      return;
    }
    if (severity === "info") {
      banner.style.border = "1px solid rgba(59,130,246,.45)";
      banner.style.background = "rgba(59,130,246,.12)";
      banner.style.color = "#bfdbfe";
      return;
    }
    banner.style.border = "1px solid rgba(239,68,68,.45)";
    banner.style.background = "rgba(239,68,68,.1)";
    banner.style.color = "#fecaca";
  }

  function showBanner(presentation, handlers = {}) {
    applySeverity(presentation.severity);
    title.innerHTML = esc(presentation.title);
    message.innerHTML = esc(presentation.message);
    actionButton.textContent = presentation.ctaLabel || "Retry";
    actionButton.onclick = () => {
      if (presentation.ctaHref) {
        window.location.href = presentation.ctaHref;
        return;
      }
      if (typeof handlers.onAction === "function") handlers.onAction();
    };

    banner.style.display = "block";
  }

  function hideBanner() {
    banner.style.display = "none";
  }

  function setSafeMode(enabled) {
    document.body.classList.toggle("safe-mode", Boolean(enabled));
    document.querySelectorAll("[data-safe-mode-lock]").forEach((el) => {
      el.disabled = Boolean(enabled);
      if (enabled) {
        el.setAttribute("title", "Temporarily disabled while server recovers");
      } else {
        el.removeAttribute("title");
      }
    });
  }

  function markSectionBoundary(sectionEl, hasError) {
    if (currentSectionBoundary && currentSectionBoundary !== sectionEl) {
      currentSectionBoundary.style.outline = "";
      currentSectionBoundary.style.outlineOffset = "";
    }
    currentSectionBoundary = sectionEl || null;
    if (!sectionEl) return;

    if (hasError) {
      sectionEl.style.outline = "1px solid rgba(239,68,68,.55)";
      sectionEl.style.outlineOffset = "2px";
    } else {
      sectionEl.style.outline = "";
      sectionEl.style.outlineOffset = "";
    }
  }

  return {
    hideBanner,
    setSafeMode,
    markSectionBoundary,
    showForError(err, context = {}, handlers = {}) {
      const presentation = getErrorPresentation(err, context);
      showBanner(presentation, handlers);
      if (presentation.safeMode) setSafeMode(true);
      return presentation;
    },
  };
}
