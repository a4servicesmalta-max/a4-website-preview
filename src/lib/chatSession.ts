/**
 * Client-side plumbing for the LIVE website chat.
 *
 * The support widget used to be a scripted three-question form that fired one
 * `POST /api/support` and stopped. It now opens a real conversation against the
 * portal backend's public chat endpoints, so a staff member can answer in the
 * partner portal and the visitor sees the reply in the same bubble.
 *
 * Contract (portal-backend, public — no auth, rate limited):
 *   POST /public/chat/sessions                  -> 201 { sessionToken, expiresAt }
 *   POST /public/chat/sessions/:token/messages  -> 201 { messageId, sentAt }
 *   GET  /public/chat/sessions/:token/messages  -> 200 { messages[], serverTime }
 *
 * Three things this module is deliberately strict about:
 *   1. `company_website` is the backend's honeypot. It must ALWAYS be sent and
 *      must ALWAYS be empty — omitting it is as suspicious as filling it in.
 *   2. The session token is returned exactly ONCE. If we lose it the visitor
 *      loses their thread, so it is persisted immediately, keyed per-site.
 *   3. Nothing here throws. Every call resolves to a tagged result so the UI can
 *      fall back to `POST /api/support` (the old one-shot path) and still land
 *      the lead. A visitor enquiry is never allowed to evaporate.
 *
 * The pure helpers (storage validation, backoff, merge, provenance) are exported
 * separately from the fetch wrappers so they can be unit-tested without a DOM.
 */

import { QUOTE_API_BASE } from "@/lib/websiteQuotation";

/** Same portal backend the quote and lead forms already talk to. */
export const CHAT_API_BASE = QUOTE_API_BASE;

/**
 * Per-site key. a4.com.mt and vacei.com both hit the same backend but are
 * different origins with different threads — never let one resume the other's.
 */
export const CHAT_STORAGE_KEY = "a4.com.mt::support-chat::session";

/** Poll cadence while the modal is open and a session is live. */
export const POLL_BASE_MS = 5_000;
/** Ceiling for the error/429 backoff — we slow down, we never stop. */
export const POLL_MAX_MS = 60_000;

export type ChatServerRole = "visitor" | "staff";

export type ChatServerMessage = {
  id: string;
  role: ChatServerRole;
  content: string;
  sentAt: string;
  authorName?: string;
};

export type StoredChatSession = {
  token: string;
  /** ISO timestamp from the backend. */
  expiresAt: string;
};

export type ChatProvenance = {
  siteOrigin: string;
  formName: string;
  pageUrl?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
};

/** Every call resolves; nothing here rejects. `status` is null for a network failure. */
export type ChatResult<T> = { ok: true; data: T } | { ok: false; status: number | null; retryAfterSeconds?: number };

/* ------------------------------------------------------------------ *
 * Pure helpers
 * ------------------------------------------------------------------ */

/**
 * A stored session is usable only while the backend still considers it alive.
 * A malformed or expired blob is treated as "no session" so the visitor gets a
 * clean opening flow instead of a thread that silently 404s on every poll.
 */
export function isStoredSessionUsable(
  session: StoredChatSession | null | undefined,
  nowMs: number = Date.now()
): session is StoredChatSession {
  if (!session || typeof session.token !== "string" || !session.token.trim()) return false;
  if (typeof session.expiresAt !== "string" || !session.expiresAt) return false;
  const expiry = Date.parse(session.expiresAt);
  if (Number.isNaN(expiry)) return false;
  // Small margin: a session about to lapse mid-conversation is worse than a
  // fresh one, and clock skew between browser and server is real.
  return expiry - nowMs > 30_000;
}

export function readStoredSession(nowMs: number = Date.now()): StoredChatSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredChatSession;
    if (!isStoredSessionUsable(parsed, nowMs)) {
      window.localStorage.removeItem(CHAT_STORAGE_KEY);
      return null;
    }
    return { token: parsed.token, expiresAt: parsed.expiresAt };
  } catch {
    // Private-mode Safari throws on localStorage. Chat still works, it just
    // will not survive a reload — that must never be a hard failure.
    return null;
  }
}

export function writeStoredSession(session: StoredChatSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable — degrade to an in-memory session */
  }
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CHAT_STORAGE_KEY);
  } catch {
    /* nothing to do */
  }
}

type UtmKey = "utm_source" | "utm_medium" | "utm_campaign" | "utm_term" | "utm_content";

/**
 * Where did this conversation come from? Same shape vacei.com sends, so both
 * sites' leads answer that question identically in the partner portal.
 * Pure: takes the URL and referrer rather than reading `location` itself.
 */
export function buildProvenance(href: string, referrer: string = ""): ChatProvenance {
  let hostname = "a4.com.mt";
  let search = "";
  try {
    const url = new URL(href);
    hostname = url.hostname.replace(/^www\./, "") || hostname;
    search = url.search;
  } catch {
    /* non-absolute href (tests, SSR) — fall back to the canonical origin */
  }
  const params = new URLSearchParams(search);
  const utm = (key: UtmKey) => {
    const value = (params.get(key) || "").trim();
    return value ? value.slice(0, 160) : undefined;
  };
  const out: ChatProvenance = {
    siteOrigin: hostname,
    formName: "support-chat",
    pageUrl: href ? href.slice(0, 2048) : undefined,
    referrer: referrer ? referrer.slice(0, 2048) : undefined,
    utmSource: utm("utm_source"),
    utmMedium: utm("utm_medium"),
    utmCampaign: utm("utm_campaign"),
    utmTerm: utm("utm_term"),
    utmContent: utm("utm_content"),
  };
  (Object.keys(out) as (keyof ChatProvenance)[]).forEach((k) => {
    if (!out[k]) delete out[k];
  });
  return out;
}

/**
 * Exponential backoff on top of the 5s cadence. A 429 with a `Retry-After`
 * header is obeyed verbatim (capped); otherwise each consecutive failure
 * doubles the wait up to a minute. Polling never spins and never gives up.
 */
export function nextPollDelayMs(consecutiveFailures: number, retryAfterSeconds?: number): number {
  if (retryAfterSeconds && retryAfterSeconds > 0) {
    return Math.min(Math.round(retryAfterSeconds * 1000), POLL_MAX_MS);
  }
  if (consecutiveFailures <= 0) return POLL_BASE_MS;
  return Math.min(POLL_BASE_MS * 2 ** consecutiveFailures, POLL_MAX_MS);
}

/**
 * The GET endpoint is `since`-filtered, but `since` is a server timestamp and
 * boundary rows can repeat. Dedupe by id so a staff reply never renders twice.
 */
export function mergeServerMessages(
  existing: ChatServerMessage[],
  incoming: ChatServerMessage[]
): ChatServerMessage[] {
  if (!incoming.length) return existing;
  const seen = new Set(existing.map((m) => m.id));
  const fresh = incoming.filter((m) => m && m.id && !seen.has(m.id));
  return fresh.length ? [...existing, ...fresh] : existing;
}

/**
 * The `since` cursor for the next poll: the newest `sentAt` we have actually
 * seen, falling back to the server's own clock so browser skew cannot make us
 * ask for messages "since" a moment the server has not reached yet.
 */
export function nextSinceCursor(messages: ChatServerMessage[], serverTime: string, current: string): string {
  const candidates = messages
    .map((m) => Date.parse(m.sentAt))
    .filter((t) => !Number.isNaN(t));
  if (candidates.length) return new Date(Math.max(...candidates)).toISOString();
  const server = Date.parse(serverTime);
  return Number.isNaN(server) ? current : serverTime;
}

/** 404/410 = the session is gone for good; 401/403 = the token is not ours. */
export function isSessionGone(status: number | null): boolean {
  return status === 401 || status === 403 || status === 404 || status === 410;
}

/* ------------------------------------------------------------------ *
 * Network wrappers — none of these throw
 * ------------------------------------------------------------------ */

function retryAfterOf(res: Response): number | undefined {
  const header = res.headers?.get?.("retry-after");
  if (!header) return undefined;
  const seconds = Number(header);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
}

/**
 * The portal backend wraps every response as `{ success, data, message }`.
 * The callers here want the PAYLOAD, so unwrap that envelope when present —
 * and tolerate a flat body so a future backend change cannot break the widget.
 *
 * This unwrap is load-bearing: without it a 201 session-open "succeeds" with an
 * undefined token, which the caller treats as failure — silently demoting every
 * conversation to the legacy one-shot form.
 */
export function unwrapEnvelope<T>(body: unknown): T {
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    typeof (body as { success?: unknown }).success === "boolean"
  ) {
    return (body as { data: T }).data;
  }
  return body as T;
}

async function request<T>(url: string, init?: RequestInit): Promise<ChatResult<T>> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      return { ok: false, status: res.status, retryAfterSeconds: retryAfterOf(res) };
    }
    const data = unwrapEnvelope<T>(await res.json());
    return { ok: true, data };
  } catch {
    // Offline, CORS, DNS, or the endpoint does not exist yet: all the same to
    // the caller, which falls back to /api/support.
    return { ok: false, status: null };
  }
}

export type OpenChatSessionInput = {
  /** OPTIONAL since live-first chat: the thread opens on the first message and
   *  identity is offered conversationally afterwards, never as a gate. */
  name?: string;
  email?: string;
  /** The visitor's opening question — becomes the first message of the thread. */
  message?: string;
  provenance?: ChatProvenance;
};

export async function openChatSession(input: OpenChatSessionInput): Promise<ChatResult<StoredChatSession>> {
  const res = await request<{ sessionToken?: string; expiresAt?: string }>(
    `${CHAT_API_BASE}/public/chat/sessions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(input.name?.trim() ? { name: input.name.trim().slice(0, 200) } : {}),
        ...(input.email?.trim() ? { email: input.email.trim().slice(0, 320) } : {}),
        ...(input.message?.trim() ? { message: input.message.trim().slice(0, 4000) } : {}),
        ...(input.provenance ? { provenance: input.provenance } : {}),
        company_website: "", // honeypot — always present, always empty
      }),
    }
  );
  if (!res.ok) return res;
  const { sessionToken, expiresAt } = res.data || {};
  if (!sessionToken || !expiresAt) {
    // A 201 without a token is unusable; treat it as a failure so the caller
    // falls back rather than pretending it has a live thread.
    return { ok: false, status: 502 };
  }
  return { ok: true, data: { token: sessionToken, expiresAt } };
}

/**
 * Pull an email address (and whatever surrounds it as a name candidate) out of
 * a free-text chat reply. Pure and deliberately conservative: one plausible
 * email or nothing — never guess.
 */
export function extractIdentity(text: string): { email?: string; name?: string } {
  const emailMatch = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  const email = emailMatch?.[0]?.toLowerCase();
  const remainder = (emailMatch ? text.replace(emailMatch[0], " ") : text)
    .replace(/[,;:|()<>[\]"']/g, " ")
    .replace(/\b(my|name|is|email|e-mail|address|and|the|i'?m|it'?s|call|me)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  // A name candidate is short prose, not another question or a sentence.
  const words = remainder.split(" ").filter(Boolean);
  const name =
    remainder && words.length > 0 && words.length <= 4 && !/[?@/\\]|https?:/i.test(remainder)
      ? remainder.slice(0, 200)
      : undefined;
  if (!email && !name) return {};
  return { ...(email ? { email } : {}), ...(name ? { name } : {}) };
}

/**
 * PATCH the visitor's identity onto an open session. Fire-and-forget from the
 * widget's perspective: failure never interrupts the conversation.
 */
export async function patchChatIdentity(
  token: string,
  identity: { name?: string; email?: string }
): Promise<ChatResult<{ ok: boolean }>> {
  return request(`${CHAT_API_BASE}/public/chat/sessions/${encodeURIComponent(token)}/identity`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(identity.name ? { name: identity.name.slice(0, 200) } : {}),
      ...(identity.email ? { email: identity.email.slice(0, 320) } : {}),
      company_website: "",
    }),
  });
}

export async function postChatMessage(
  token: string,
  content: string
): Promise<ChatResult<{ messageId: string; sentAt: string }>> {
  return request(`${CHAT_API_BASE}/public/chat/sessions/${encodeURIComponent(token)}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: content.slice(0, 4000), company_website: "" }),
  });
}

export async function fetchChatMessages(
  token: string,
  since?: string
): Promise<ChatResult<{ messages: ChatServerMessage[]; serverTime: string }>> {
  const qs = since ? `?since=${encodeURIComponent(since)}` : "";
  const res = await request<{ messages?: ChatServerMessage[]; serverTime?: string }>(
    `${CHAT_API_BASE}/public/chat/sessions/${encodeURIComponent(token)}/messages${qs}`,
    { method: "GET", headers: { Accept: "application/json" } }
  );
  if (!res.ok) return res;
  return {
    ok: true,
    data: {
      messages: Array.isArray(res.data?.messages) ? res.data.messages : [],
      serverTime: res.data?.serverTime || new Date().toISOString(),
    },
  };
}
