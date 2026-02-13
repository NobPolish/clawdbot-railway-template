const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_RETRY_DELAY_MS = 300;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeAbortError(message) {
  if (typeof DOMException !== "undefined") {
    return new DOMException(message, "AbortError");
  }
  const err = new Error(message);
  err.name = "AbortError";
  return err;
}

export class SetupRequestError extends Error {
  constructor(message, details) {
    super(message);
    this.name = "SetupRequestError";
    this.category = details.category || "unknown";
    this.status = details.status || null;
    this.retriable = Boolean(details.retriable);
    this.url = details.url || "";
    this.attempt = details.attempt || 1;
    this.cause = details.cause;
    this.body = details.body;
  }
}

export function classifyStatus(status) {
  if (status === 401 || status === 403) return "auth";
  if (status === 400 || status === 409 || status === 422) return "validation";
  if (status >= 500) return "server";
  return "unknown";
}

function isNetworkError(err) {
  return err && err.name === "TypeError";
}

function isAbortError(err) {
  return err && err.name === "AbortError";
}

function mergeSignals(timeoutSignal, externalSignal) {
  if (!externalSignal) return timeoutSignal;
  if (externalSignal.aborted) {
    throw makeAbortError("Request canceled");
  }
  const merged = new AbortController();
  const onTimeoutAbort = () => merged.abort(timeoutSignal.reason || makeAbortError("Request timeout"));
  const onExternalAbort = () => merged.abort(externalSignal.reason || makeAbortError("Request canceled"));

  timeoutSignal.addEventListener("abort", onTimeoutAbort, { once: true });
  externalSignal.addEventListener("abort", onExternalAbort, { once: true });

  return merged.signal;
}

function isMethodRetryable(method, retryUnsafe) {
  if (retryUnsafe) return true;
  const m = String(method || "GET").toUpperCase();
  return m === "GET" || m === "HEAD";
}

function parseBody(res, parseAs) {
  if (parseAs === "text") return res.text();
  if (parseAs === "raw") return Promise.resolve(res);
  return res.json();
}

export function createSetupRequestClient(options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const defaultTimeoutMs = Number(options.defaultTimeoutMs || DEFAULT_TIMEOUT_MS);
  const onAuthRequired = options.onAuthRequired;

  async function request(url, opts = {}) {
    const method = String(opts.method || "GET").toUpperCase();
    const maxRetries = Number(opts.maxRetries ?? 1);
    const retryDelayMs = Number(opts.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS);
    const retryUnsafe = Boolean(opts.retryUnsafe);
    const timeoutMs = Number(opts.timeoutMs ?? defaultTimeoutMs);
    const parseAs = opts.parseAs || "json";
    const credentials = opts.credentials || "same-origin";

    let attempt = 0;
    while (attempt <= maxRetries) {
      attempt += 1;
      const timeoutController = new AbortController();
      const timer = setTimeout(() => timeoutController.abort(makeAbortError("Request timeout")), timeoutMs);

      try {
        const signal = mergeSignals(timeoutController.signal, opts.signal);
        const res = await fetchImpl(url, {
          ...opts,
          method,
          credentials,
          signal,
        });
        clearTimeout(timer);

        if (res.status === 401 || res.status === 403) {
          if (typeof onAuthRequired === "function") onAuthRequired(res.status);
        }

        if (!res.ok) {
          const body = await res.text();
          const category = classifyStatus(res.status);
          const retriable = (res.status === 429 || res.status === 502 || res.status === 503 || res.status === 504) && isMethodRetryable(method, retryUnsafe);

          if (retriable && attempt <= maxRetries) {
            await sleep(retryDelayMs * attempt);
            continue;
          }

          throw new SetupRequestError(`HTTP ${res.status}: ${body || res.statusText}`, {
            category,
            status: res.status,
            retriable,
            url,
            attempt,
            body,
          });
        }

        return parseBody(res, parseAs);
      } catch (err) {
        clearTimeout(timer);

        if (err instanceof SetupRequestError) {
          throw err;
        }

        const timeout = isAbortError(err) && String(err.message || "").toLowerCase().includes("timeout");
        const canceled = isAbortError(err) && !timeout;
        const category = timeout ? "timeout" : canceled ? "canceled" : isNetworkError(err) ? "network" : "unknown";
        const retriable = (category === "timeout" || category === "network") && isMethodRetryable(method, retryUnsafe);

        if (retriable && attempt <= maxRetries) {
          await sleep(retryDelayMs * attempt);
          continue;
        }

        throw new SetupRequestError(`${category === "timeout" ? "Request timed out" : "Request failed"}: ${String(err.message || err)}`, {
          category,
          status: null,
          retriable,
          url,
          attempt,
          cause: err,
        });
      }
    }

    throw new SetupRequestError("Request failed after retries", { category: "unknown", url, attempt: maxRetries + 1 });
  }

  function requestJson(url, opts = {}) {
    return request(url, { ...opts, parseAs: "json" });
  }

  function requestText(url, opts = {}) {
    return request(url, { ...opts, parseAs: "text" });
  }

  return {
    request,
    requestJson,
    requestText,
  };
}
