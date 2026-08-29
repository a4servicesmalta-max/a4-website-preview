// Privacy-safe live-visitor presence: a random per-tab id, the page path, an
// off-site referrer and first-touch UTMs. No cookies, nothing personal.

export const PRESENCE_SID_KEY = "a4_presence_sid";
export const PRESENCE_UTM_KEY = "a4_presence_utm";
export const PRESENCE_INTERVAL_MS = 20_000;

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;
type UtmKey = (typeof UTM_KEYS)[number];
export type PresenceUtm = Partial<Record<UtmKey, string>>;

export type PresenceBody = {
  sid: string;
  page: string;
  referrer?: string;
  event?: "hb" | "leave";
} & PresenceUtm;

const SID_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";

export function isValidSid(s: unknown): s is string {
  return typeof s === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(s);
}

export function randomSid(): string {
  let buf: Uint8Array | null = null;
  try {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      buf = crypto.getRandomValues(new Uint8Array(32));
    }
  } catch {
    buf = null;
  }
  let out = "";
  for (let i = 0; i < 32; i++) {
    const n = buf ? buf[i] : Math.floor(Math.random() * 256);
    out += SID_CHARS.charAt(n % 64);
  }
  return out;
}

/** UTMs from a landing query string (`?utm_source=..`). Empty object if none. */
export function parseUtm(search: string): PresenceUtm {
  const out: PresenceUtm = {};
  try {
    const params = new URLSearchParams(search || "");
    for (const k of UTM_KEYS) {
      const v = (params.get(k) || "").trim();
      if (v) out[k] = v.slice(0, 160);
    }
  } catch {
    /* ignore */
  }
  return out;
}

/** document.referrer only when it points at another host, else undefined. */
export function externalReferrer(
  referrer: string,
  ownHost: string,
): string | undefined {
  if (!referrer) return undefined;
  try {
    const host = new URL(referrer).hostname;
    if (!host || host === ownHost) return undefined;
    return referrer.slice(0, 2048);
  } catch {
    return undefined;
  }
}

export function buildPresenceBody(
  sid: string,
  pathname: string,
  referrer: string,
  utm: PresenceUtm,
  host: string,
  event?: "hb" | "leave",
): PresenceBody {
  const body: PresenceBody = { sid, page: pathname || "/" };
  const ref = externalReferrer(referrer, host);
  if (ref) body.referrer = ref;
  for (const k of UTM_KEYS) if (utm[k]) body[k] = utm[k];
  if (event) body.event = event;
  return body;
}
