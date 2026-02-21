export const DRAFT_SCHEMA_VERSION = 1;
export const DRAFT_STORAGE_KEY = "openclaw.setup.draft.v1";
export const DRAFT_TTL_MS = 1000 * 60 * 60 * 24;

export const DRAFT_FIELDS = [
  "flow",
  "authChoice",
  "authSecret",
  "model",
  "telegramToken",
  "discordToken",
  "slackBotToken",
  "slackAppToken",
  "configText",
];

export function pickDraftState(source, fields = DRAFT_FIELDS) {
  const state = {};
  fields.forEach((key) => {
    state[key] = String(source && source[key] != null ? source[key] : "");
  });
  return state;
}

export function createDraft(state, now = Date.now()) {
  return {
    schemaVersion: DRAFT_SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    state: pickDraftState(state),
  };
}

export function saveDraft(storage, draft, key = DRAFT_STORAGE_KEY) {
  if (!storage) return false;
  storage.setItem(key, JSON.stringify(draft));
  return true;
}

export function clearDraft(storage, key = DRAFT_STORAGE_KEY) {
  if (!storage) return;
  storage.removeItem(key);
}

export function loadDraft(storage, options = {}) {
  const key = options.key || DRAFT_STORAGE_KEY;
  const now = options.now == null ? Date.now() : Number(options.now);
  const ttlMs = options.ttlMs == null ? DRAFT_TTL_MS : Number(options.ttlMs);

  if (!storage) return { draft: null, reason: "missing" };
  const raw = storage.getItem(key);
  if (!raw) return { draft: null, reason: "missing" };

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { draft: null, reason: "invalid" };
  }

  if (!parsed || parsed.schemaVersion !== DRAFT_SCHEMA_VERSION || !parsed.state) {
    return { draft: null, reason: "schema_mismatch" };
  }

  const updatedAt = Number(parsed.updatedAt || parsed.createdAt || 0);
  if (!updatedAt || now - updatedAt > ttlMs) {
    return { draft: null, reason: "stale" };
  }

  return { draft: parsed, reason: "ok" };
}

export function mergeDraftState(currentState, draftState, options = {}) {
  const allowConflict = Boolean(options.allowConflict);
  const current = pickDraftState(currentState);
  const draft = pickDraftState(draftState);
  const merged = { ...current };
  const conflicts = [];

  Object.keys(draft).forEach((key) => {
    const hasCurrent = Boolean(current[key] && current[key].trim());
    const differs = current[key] !== draft[key];

    if (!allowConflict && hasCurrent && differs) {
      conflicts.push(key);
      return;
    }
    merged[key] = draft[key];
  });

  return {
    state: merged,
    conflicts,
    applied: conflicts.length === 0,
  };
}
