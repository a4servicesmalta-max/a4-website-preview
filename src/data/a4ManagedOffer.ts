/**
 * THE single source of truth for the managed bookkeeping offer as it is
 * DESCRIBED on this site. The numbers live in src/data/a4QuotePack.ts; this
 * file is the words that go with them.
 *
 * It replaces src/data/a4Ladder.ts (deleted 2026-08-13). That file described a
 * four-rung ladder whose bottom rung — "A4 Books €39/mo, software only, no
 * accountant" — WAS the software-only SME tier the owner has removed. There is
 * no ladder any more and nothing on this site may reintroduce one: A4 keeps the
 * books, at a flat monthly price set only by whether you are self-employed or a
 * company.
 *
 * Copy conventions every surface reading this file must follow:
 *   - "€24/mo self-employed · €49/mo company" — both prices, never one alone
 *   - never "from €24" as if a bigger company pays an unknown amount; there
 *     are exactly two prices and both are published
 *   - "All fees exclude VAT" wherever a total is shown  → PRICING_VAT_NOTE
 */

import {
  BOOKKEEPING_MANAGED_MONTHLY,
  MANAGED_ENTITY_OPTIONS,
  PRICING_VAT_NOTE,
  type ManagedEntity,
} from "./a4QuotePack";

export const MANAGED_OFFER_NAME = "Managed bookkeeping";

export type ManagedOfferTier = {
  id: ManagedEntity;
  name: string;
  /** Monthly price — flat, and the same price a backdated month costs. */
  price: number;
  tagline: string;
  detail: string;
};

export const A4_MANAGED_OFFER: ManagedOfferTier[] = [
  {
    id: "sole",
    name: "Self-employed",
    price: BOOKKEEPING_MANAGED_MONTHLY.sole,
    tagline: "Sole traders and freelancers.",
    detail:
      "Send us the paperwork and we keep the books: documents coded, bank reconciled, and a set of figures you can rely on each month. A qualified accountant is on the file — there is no software-only option.",
  },
  {
    id: "company",
    name: "Company",
    price: BOOKKEEPING_MANAGED_MONTHLY.company,
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

/** One line every pricing surface can reuse, so neither price is ever dropped. */
export const MANAGED_CAVEAT =
  `€${MANAGED_SOLE.price}/mo if you are self-employed, €${MANAGED_COMPANY.price}/mo for a company. ` +
  `We keep the books — there is no software-only plan. ${PRICING_VAT_NOTE}`;

/**
 * What a backdated month costs: the same as a current one. Said in words
 * because "uncapped" reads as a trap unless the rule is stated plainly.
 */
export const MANAGED_CATCHUP_NOTE =
  "Months we have to go back and do cost the same as a month going forward — no catch-up premium, and no cap.";

export const euro = (n: number) => "€" + n.toLocaleString("en-MT");
