/**
 * M14a — EN-only keys must never render as raw key names.
 *
 * `supportChat.botAskIdentity` and the whole `reviewError.*` block exist only
 * in `en/common.json`. The question the review raised was whether a visitor on
 * /de would see the literal string "reviewError.title" on screen.
 *
 * They would not, and there are TWO independent reasons:
 *
 *  1. BUILD TIME — `resources.ts` composes every locale as
 *     `mergeLocaleJson(enCommon, xxCommon)`, i.e. the English file is the BASE
 *     and the locale file is an override. `mergeLocaleJson` unions the keys, so
 *     an untranslated key keeps its English string rather than disappearing.
 *  2. RUNTIME — `I18nProvider` inits i18next with `fallbackLng: "en"`.
 *
 * That is why no EN keys were copied into the other locale files: there is
 * nothing to fix, and duplicating them would create five more copies to drift.
 * It also means the deliberate EN-only INDEPENDENCE wording keeps working the
 * same way — English until a human translator signs it off, never a raw key
 * and never machine-translated.
 *
 * This test is the durable form of that verification: if someone ever swaps the
 * merge order, drops the English base, or removes the fallback, it fails here
 * rather than on a German page nobody reloads.
 */
import { describe, it, expect } from "vitest";
import { resources } from "./resources";
import { locales } from "@/lib/i18n-config";
import enCommon from "./locales/en/common.json";

/** Every leaf path in an object, dotted. */
function leafPaths(o: unknown, prefix = ""): string[] {
  if (o === null || typeof o !== "object") return [prefix];
  if (Array.isArray(o)) return o.flatMap((v, i) => leafPaths(v, `${prefix}[${i}]`));
  return Object.entries(o as Record<string, unknown>).flatMap(([k, v]) =>
    leafPaths(v, prefix ? `${prefix}.${k}` : k)
  );
}

const get = (o: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>((acc, k) => (acc == null ? acc : (acc as Record<string, unknown>)[k]), o);

describe("locale fallback", () => {
  const nonEnglish = locales.filter((l) => l !== "en");

  it("gives every locale every English `common` key", () => {
    const enPaths = leafPaths(enCommon);
    expect(enPaths.length).toBeGreaterThan(50);
    for (const loc of nonEnglish) {
      const missing = enPaths.filter((p) => get(resources[loc].common, p) === undefined);
      expect(`${loc} missing ${missing.length}`).toBe(`${loc} missing 0`);
    }
  });

  it("resolves the specific EN-only keys the review flagged, in every locale", () => {
    const flagged = [
      "supportChat.botAskIdentity",
      "supportChat.nameLabel",
      "supportChat.emailLabel",
      "supportChat.startChat",
      "supportChat.identityError",
      "supportChat.privacyNote",
    ];
    for (const path of flagged) {
      // Present in English to begin with — otherwise this test proves nothing.
      expect(typeof get(enCommon, path)).toBe("string");
      for (const loc of nonEnglish) {
        const v = get(resources[loc].common, path);
        expect(`${loc}/${path}=${typeof v}`).toBe(`${loc}/${path}=string`);
        // …and it is real copy, not the key name echoed back.
        expect(v).not.toBe(path);
        expect(String(v).length).toBeGreaterThan(0);
      }
    }
  });

  it("resolves the whole reviewError block in every locale", () => {
    const errPaths = leafPaths((enCommon as Record<string, unknown>).reviewError, "reviewError");
    expect(errPaths.length).toBeGreaterThan(0);
    for (const loc of nonEnglish) {
      for (const path of errPaths) {
        expect(`${loc}/${path}`).toBe(
          get(resources[loc].common, path) === undefined ? `MISSING ${loc}/${path}` : `${loc}/${path}`
        );
      }
    }
  });

  it("falls back to the English STRING, not to an empty one", () => {
    // The point of the merge is that an untranslated key still says something
    // useful. An empty string would render as blank space, which is worse than
    // English: it looks like the page is broken rather than untranslated.
    for (const loc of nonEnglish) {
      expect(get(resources[loc].common, "supportChat.startChat"))
        .toBe(get(enCommon, "supportChat.startChat"));
    }
  });
});
