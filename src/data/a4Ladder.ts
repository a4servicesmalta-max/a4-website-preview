/**
 * THE single source of truth for the A4 service ladder shown on this site.
 *
 * It mirrors the A4 Books landing page (books.a4.com.mt) exactly — same names,
 * same prices, same stacking. If Books changes, change it HERE and nowhere
 * else; every surface on this site reads these values.
 *
 * The ladder stacks: each level adds its `add` to the level below it, so the
 * running total is what the client actually pays.
 *
 *   A4 Books   €39        software only, no accountant
 *   + Senior   +€60  =  €99   a qualified accountant on your books
 *   + Manager  +€99  = €198   oversight and management reporting
 *   + CFO      +€159 = €357   the full finance function
 *
 * The totals are the SOFTWARE_TIERS of quote pack `mt-2026-08-01`
 * (src/data/a4QuotePack.ts) — the same figures the Vacei calculator and the
 * portal backend serve. Change them there, not here.
 *
 * IMPORTANT: the base level is SOFTWARE ONLY. Every surface that shows the
 * base price must say so — the whole point of this file is that "€39" is never
 * shown as if it included an accountant.
 */

import { PRICING_VAT_NOTE, SOFTWARE_TIERS } from "./a4QuotePack";

export const LADDER_BASE_LABEL = "A4 Books";

export type LadderLevel = {
  id: string;
  name: string;
  /** Monthly amount this level ADDS to the one below (base = the price itself). */
  add: number;
  /** Running monthly total once this level is switched on. */
  total: number;
  /** Does this level include a human accountant? */
  human: boolean;
  tagline: string;
  detail: string;
};

export const A4_LADDER: LadderLevel[] = [
  {
    id: "books",
    name: "A4 Books",
    add: SOFTWARE_TIERS.book,
    total: SOFTWARE_TIERS.book,
    human: false,
    tagline: "The automated core — software only.",
    detail:
      "Upload documents, the AI posts the double entry, anything uncertain waits in your review queue. No accountant included at this level.",
  },
  {
    id: "senior",
    name: "Senior accountant",
    add: SOFTWARE_TIERS.senior - SOFTWARE_TIERS.book,
    total: SOFTWARE_TIERS.senior,
    human: true,
    tagline: "A qualified accountant on your books.",
    detail:
      "Everything in A4 Books, plus reconciliation review and sign-off, VAT return preparation, and complex entries handled by a Senior.",
  },
  {
    id: "manager",
    name: "Manager",
    add: SOFTWARE_TIERS.manager - SOFTWARE_TIERS.senior,
    total: SOFTWARE_TIERS.manager,
    human: true,
    tagline: "Oversight across the whole picture.",
    detail:
      "Everything in Senior, plus manager review and final sign-off, postings escalated beyond Senior, and monthly management reporting.",
  },
  {
    id: "cfo",
    name: "CFO",
    add: SOFTWARE_TIERS.cfo - SOFTWARE_TIERS.manager,
    total: SOFTWARE_TIERS.cfo,
    human: true,
    tagline: "The full finance function.",
    detail:
      "Everything in Manager, plus cash-flow forecasting, budgeting and scenario planning, board-ready reporting and monthly advisory.",
  },
];

export const LADDER_BASE = A4_LADDER[0];
/** The cheapest level that actually includes a human accountant. */
export const LADDER_FIRST_HUMAN = A4_LADDER[1];

/** One line every pricing surface can reuse, so the caveat is never dropped. */
export const LADDER_CAVEAT =
  `€${LADDER_BASE.add}/mo is the A4 Books software on its own. ` +
  `Accountants start at €${LADDER_FIRST_HUMAN.total}/mo. ${PRICING_VAT_NOTE}`;

export const euro = (n: number) => "€" + n.toLocaleString("en-MT");
