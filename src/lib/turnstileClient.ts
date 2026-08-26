/**
 * Cloudflare Turnstile — browser side.
 *
 * Deliberately IMPERATIVE rather than a `<TurnstileWidget />` each form has to
 * render. There are a dozen lead forms on this site, several of them
 * multi-step, and giving each one a visible widget plus a piece of token state
 * would be a dozen chances to break a working form. Instead every form gains
 * exactly one line at submit time:
 *
 *     const captchaToken = await getCaptchaToken("contact");
 *
 * The widget is invisible (`appearance: "interaction-only"`): the overwhelming
 * majority of visitors never see anything, and a challenge only surfaces when
 * Cloudflare actually wants one.
 *
 * THE TOKEN IS FETCHED AT SUBMIT, NEVER ON PAGE LOAD. Turnstile tokens expire
 * after 300 seconds and are single-use, so a token minted when the page opened
 * would already be dead by the time someone finished filling in a quote wizard.
 *
 * This never throws and never hangs a submit. Every failure path resolves
 * `null`, and the SERVER decides what a missing token means — the browser is
 * not where that call belongs.
 */

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/** Public by design — a Turnstile sitekey is meant to be readable in the page. */
export const TURNSTILE_SITE_KEY = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "").trim();

/** Give up rather than hold a visitor's submit hostage to a stalled challenge. */
const EXECUTE_TIMEOUT_MS = 20_000;

/** Unset sitekey = the whole layer is dark. Forms behave exactly as before. */
export function isCaptchaEnabled(): boolean {
  return TURNSTILE_SITE_KEY.length > 0;
}

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  execute: (widget: string | HTMLElement, options?: Record<string, unknown>) => void;
  reset: (widget?: string | HTMLElement) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi | null> | null = null;
let widgetId: string | null = null;
/** Resolver for the execute() currently in flight, if any. */
let pending: ((token: string | null) => void) | null = null;

function loadScript(): Promise<TurnstileApi | null> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<TurnstileApi | null>((resolve) => {
    if (typeof window === "undefined") return resolve(null);
    if (window.turnstile) return resolve(window.turnstile);

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    const script = existing ?? document.createElement("script");
    const onReady = () => resolve(window.turnstile ?? null);
    script.addEventListener("load", onReady);
    // A blocked or failed CDN must degrade to "no token", not to a broken form.
    script.addEventListener("error", () => resolve(null));
    if (!existing) {
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });
  return scriptPromise;
}

/**
 * The widget lives in one floating container reused by every form.
 * `pointer-events` is off on the wrapper so the invisible widget can never
 * swallow a click meant for the page underneath it; the inner box turns them
 * back on for the rare visible challenge.
 */
function ensureContainer(): HTMLElement {
  const existingId = "a4-turnstile-host";
  const found = document.getElementById(existingId);
  if (found) return found;

  const wrapper = document.createElement("div");
  wrapper.id = existingId;
  wrapper.style.cssText = [
    "position:fixed",
    "inset:0",
    "display:grid",
    "place-items:center",
    "z-index:2147483647",
    "pointer-events:none",
  ].join(";");

  const inner = document.createElement("div");
  inner.style.pointerEvents = "auto";
  wrapper.appendChild(inner);
  document.body.appendChild(wrapper);
  return inner;
}

/** Settle the in-flight execute exactly once. */
function settle(token: string | null): void {
  const resolve = pending;
  pending = null;
  if (resolve) resolve(token);
}

/**
 * Mint a fresh Turnstile token for one submission.
 *
 * @param action a short label for the form, surfaced in Cloudflare's analytics
 *               so a spike can be traced to the form it hit.
 * @returns the token, or `null` when Turnstile is unconfigured, blocked,
 *          errored or slow — never a rejected promise.
 */
export async function getCaptchaToken(action?: string): Promise<string | null> {
  if (!isCaptchaEnabled() || typeof window === "undefined") return null;

  const turnstile = await loadScript();
  if (!turnstile) return null;

  // One submit at a time: a token in flight is abandoned rather than racing.
  settle(null);

  return new Promise<string | null>((resolve) => {
    pending = resolve;
    // Belt and braces — resolve even if no callback ever fires.
    const timer = window.setTimeout(() => settle(null), EXECUTE_TIMEOUT_MS);
    const finish = (token: string | null) => {
      window.clearTimeout(timer);
      settle(token);
    };

    try {
      if (widgetId === null) {
        widgetId = turnstile.render(ensureContainer(), {
          sitekey: TURNSTILE_SITE_KEY,
          // Invisible until Cloudflare decides a human needs to do something.
          execution: "execute",
          appearance: "interaction-only",
          action: action ? action.slice(0, 32) : undefined,
          callback: (token: string) => finish(token),
          "error-callback": () => finish(null),
          "timeout-callback": () => finish(null),
          "expired-callback": () => finish(null),
        });
      } else {
        // Tokens are single-use: clear the spent one before asking for another.
        turnstile.reset(widgetId);
      }
      turnstile.execute(widgetId);
    } catch {
      finish(null);
    }
  });
}
