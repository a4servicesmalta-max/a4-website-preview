/**
 * THE single source of truth for the managed bookkeeping offer as it is
 * DESCRIBED on this site. The numbers live in src/data/a4QuotePack.ts; this
 * file is the words that go with them.
 *
 * It replaces src/data/a4Ladder.ts (deleted 2026-08-13). That file described a
 * four-rung ladder whose bottom rung — "A4 Books €39/mo, software only, no
 * accountant" — WAS the software-only SME tier the owner has removed. There is
 * no ladder any more and nothing on this site may reintroduce one: A4 keeps the
 * books, at a monthly price set by whether you are self-employed or a company
 * and by what the business spends each month (nine bands).
 *
 * Copy conventions every surface reading this file must follow:
 *   - "from €24/mo self-employed · from €49/mo company" — both prices, never
 *     one alone, and ALWAYS with "from"
 *   - the "from" is mandatory as of pack mt-2026-08-14-volume. These are the
 *     ENTRY expenses band, the cheapest of nine; the old rule said the
 *     opposite ("never 'from €24' — there are exactly two prices") because
 *     bookkeeping used to be flat. It is not flat any more, and dropping the
 *     "from" understates what most clients will actually pay.
 *   - never "flat", and never "the price does not move with your volume" —
 *     it moves with monthly expenses (though never with transaction volume,
 *     which is a different question and prices different services)
 *   - "All fees exclude VAT" wherever a total is shown  → PRICING_VAT_NOTE
 */

import {
  BOOKKEEPING_COMPANY,
  BOOKKEEPING_FROM,
  MANAGED_ENTITY_OPTIONS,
  PRICING_VAT_NOTE,
  type ManagedEntity,
} from "./a4QuotePack";

export const MANAGED_OFFER_NAME = "Managed bookkeeping";

export type ManagedOfferTier = {
  id: ManagedEntity;
  name: string;
  /**
   * ENTRY-BAND monthly price — a "from", not a flat rate. Under pack
   * mt-2026-08-14-volume the real price is set by monthly expenses across nine
   * bands; this is the cheapest of them, so every surface showing it must say
   * "from". A backdated month costs whatever the client's own band costs.
   */
  price: number;
  tagline: string;
  detail: string;
};

export const A4_MANAGED_OFFER: ManagedOfferTier[] = [
  {
    id: "sole",
    name: "Self-employed",
    price: BOOKKEEPING_FROM,
    tagline: "Sole traders and freelancers.",
    detail:
      "Send us the paperwork and we keep the books: documents coded, bank reconciled, and a set of figures you can rely on each month. A qualified accountant is on the file — there is no software-only option.",
  },
  {
    id: "company",
    name: "Company",
    price: BOOKKEEPING_COMPANY,
    tagline: "Malta limited companies.",
    detail:
      "Everything above, kept to the standard a Malta company's statutory filings need: coded and reconciled monthly, ready for the VAT return, the annual accounts and the tax return without a year-end scramble.",
  },
];

export const MANAGED_SOLE = A4_MANAGED_OFFER[0];
export const MANAGED_COMPANY = A4_MANAGED_OFFER[1];

/** The entity question, as every calculator must ask it. */
export const MANAGED_ENTITY_QUESTION = "Are these a company's books, or your own?";
export { MANAGED_ENTITY_OPTIONS };

/**
 * One line every pricing surface can reuse, so neither price is ever dropped.
 * Both figures are "from" prices — the entry expenses band. Saying "flat" here
 * would be false under mt-2026-08-14-volume.
 */
export const MANAGED_CAVEAT =
  `From €${MANAGED_SOLE.price}/mo if you are self-employed, from €${MANAGED_COMPANY.price}/mo for a company, ` +
  `set by what you spend each month. We keep the books — there is no software-only plan. ${PRICING_VAT_NOTE}`;

/**
 * What a backdated month costs: the same as a current one. Said in words
 * because "uncapped" reads as a trap unless the rule is stated plainly.
 */
export const MANAGED_CATCHUP_NOTE =
  "Months we have to go back and do cost the same as a month going forward — no catch-up premium, and no cap.";

export const euro = (n: number) => "€" + n.toLocaleString("en-MT");
