# A4 design language

The house style of a4.com.mt since October 2026, ported 1:1 from the "A4 Quotation"
landing design. Every page uses it. This file is the reference for anyone restyling or
building a page.

Reference implementation: `src/app/q/[id]/QuotationLanding.tsx` (the quotation page is
the design itself, on real data). Read it before building anything.

## Palette

| Token | Value | Use |
|---|---|---|
| ink | `#09090B` | dark sections, primary text on light, ink buttons |
| indigo | `#4F55F1` | accent on light: numbers, toggles, bullets, links, focus |
| indigo-2 | `#6468F3` | middle of the gradient |
| periwinkle | `#8B8FF7` | accent on dark: numbers, highlighted words, caret |
| gradient | `linear-gradient(90deg,#4F55F1 0%,#6468F3 55%,#8B8FF7 100%)` | the one emphasised word or line (`.a4-grad-text`, `gradText`) |
| zinc | `#FAFAFA #F4F4F5 #E4E4E7 #D4D4D8 #A1A1AA #71717A #52525B #3F3F46 #27272A #18181B` | surfaces, hairlines, secondary text |

No teal, no green, no lime, no other accent colour. Status that used to be green reads in
indigo. Never introduce new colours.

The existing tokens in `components/a4-landing/styles.css` (`--a4-ink`, `--a4-primary`,
`--a4-mute`, `--a4-hairline-light`, …) were re-pointed at this palette — prefer them over
hard-coded hex in components that already use them.

## Type

- **Outfit** (`var(--a4x-display)` / `var(--a4-font-display)`) for headings, numbers,
  buttons, chips, nav, labels and short lines up to ~19px+ (card lines, leads).
- **Inter** (`var(--a4x-body)` / `var(--a4-font-body)`) for descriptive paragraphs,
  list items, small print, kickers.
- Display headings: weight 500 with `letter-spacing:-0.035em`, the emphasised line 600.
  H2 under an eyebrow: 600, `-0.04em`, line-height ~1.03.
- Sizes (from the design): hero `clamp(46px,8.2vw,136px)`; section display
  `clamp(42px,6.4vw,112px)`; big statement `clamp(56px,13.5vw,250px)`; H2
  `clamp(32px,3.6vw,52px)` to `clamp(40px,5.6vw,92px)`; lead `clamp(19px,1.9vw,28px)`;
  card word `clamp(42px,4vw,60px)`; body 15–17px Inter, line-height 1.55.
- Kicker (small caps label): Inter 12px, 600, `letter-spacing:.1em`, uppercase, `#71717A`.

## Surfaces (sections alternate)

| Class / constant | Look | Text |
|---|---|---|
| `.a4-dark` / `DARK_GRID` | ink with a 64px white-4.5% grid | white, secondary `#A1A1AA` |
| `.a4-light` / `LIGHT_GLOW` | white with indigo + grey radial glows | ink, secondary `#52525B` |
| `.a4-muted` / `MUTED_GLOW` | `#F4F4F5` with stronger glows | ink |
| `.a4-dark-card` / `DARK_CARD` | ink card with 32px grid + indigo corner glow | white |

Section padding: `clamp(100px,13vw,180px) clamp(20px,5vw,72px)`; content max-width 1280
(`Container` from Primitives gives exactly this). Dark sections usually carry a
`<DriftGlow/>` and sometimes the skewed `<Slab/>` or `<SweepSlab/>`.

Cards: white, `border:1px solid #E4E4E7`, radius 24 (28 for documents), padding 28; on
hover/selected `border-color: rgba(79,85,241,.45)` + `box-shadow: 0 24px 60px
rgba(79,85,241,.12)`. Dark card variant alternates in grids (`i % 2`). Big document panels:
radius 28, `box-shadow: 0 50px 120px rgba(9,9,11,.12)`.

Bullets: the skewed indigo square (`<span className="a4-bullet"/>`). Lists of terms /
FAQs: numbered rows (`01`, `02` in indigo), `border-top:1px solid #E4E4E7`.

## Controls

Pills only — never square buttons, never hover lifts.

- `Button` from `@/components/a4-landing/Primitives`: `primary` (white, on dark), `dark`
  (ink, on light), `outline-dark` (glass, on dark), `outline-light` (white + hairline, on
  light), `soft`, `cobalt` (indigo + glow, use sparingly). Sizes lg 58 / md 48 / sm 40.
- Plain HTML: `className="a4-btn a4-btn-light|a4-btn-ghost|a4-btn-ink|a4-btn-outline|a4-btn-indigo"`.
- Chips: `.a4-chip a4-chip-dark|a4-chip-light`.
- Segmented switch: `Pill` (active = ink/white fill).
- Toggles: the design's 48×28 switch (track indigo when on, white knob, `.35s` expo).
- Inputs on dark: `.a4-input-dark` (56px, radius 14, focus border indigo). On light: white,
  `1px solid #E4E4E7`, radius 14, 52–56px high, focus border indigo.
- Checkbox: 24px, radius 7, indigo fill with white check when on.

## Motion — data attributes, bound by `FxRuntime`

Put the attribute on any element (server or client component). Never hand-roll
IntersectionObserver reveals or framer-motion entrance animations — use these:

| Attribute | Effect |
|---|---|
| `data-fx="rise"` (+ `data-d` ms, `data-dy` px) | lift 50px + blur 12 + fade, 700ms expo-out |
| `data-fx="big"` | huge lift with scale 1.15 → 1, for statement words |
| `data-fx="words"` with `[data-w]` children | phrases rise in sequence (`data-stagger`) |
| `data-fx="type"` with `[data-l]` letters + `[data-caret]` | typewriter + hopping caret — use `<TypeText segments=…/>` |
| `scatter` · `cascade` · `stack` · `zoom` · `tighten` | per-letter word effects — use `<LetterWord fx=…/>` |
| `data-fx="draw"`, `bar`, `slab`, `glitch` | the lockup draw, divider, hero slab, closing glitch |
| `data-drift` | the slow floating glow (`<DriftGlow/>`) |
| `data-loop` | scroll-cue line |
| `data-hero` on the first section | its effects fire on load instead of on scroll |
| `data-hero-exit` / `data-hero-par` | hero content lifts/blurs out; slab parallax |
| `data-sweep` (`<SweepSlab/>`) | slab sweeps across its section with scroll |
| `data-tl` + `data-tl-fill` + `data-tl-dot` | timeline line fills and dots pop with scroll |
| `data-stage` + `data-cam` | 3D screenshot stage (`<PortalShowcase/>`) |

Helpers: `TypeText`, `Words`, `LetterWord`, `Eyebrow`, `DriftGlow`, `Slab`, `SweepSlab`,
`A4Mark`, `A4DrawnLockup`, `GlitchLockup`, `gradText` in `@/components/fx/primitives`;
`Reveal` (= rise), `SectionHead`, `Eyebrow`, `Button`, `Container` in
`@/components/a4-landing/Primitives`. `replayFx(el)` from `FxRuntime` replays an effect.

Stagger inside a group with `data-d` (0, 80, 160 … for cards; 100 between eyebrow, title,
sub). Reduced motion is handled centrally — do not add your own checks for entrances.

## Section patterns (from the design)

1. **Hero** — dark grid, drift glow, skewed slab on the right (parallax), eyebrow in
   periwinkle, typewriter headline, gradient second line, lead in `#A1A1AA`, chips, white +
   glass pills, optional scroll cue. `PageHero` does this for inner pages.
2. **Statement** — centred huge typewriter line + `words` line with one gradient word
   ("Every service. / One portal.").
3. **Eyebrow + H2 + sub, then content** — "01 Build your quote / Choose what you need."
4. **Card grid** — 3 columns `repeat(auto-fill,minmax(min(100%,340px),1fr))`, gap 16,
   alternating light/dark cards, big letter-effect word per card.
5. **Document** — white 28-radius panel with header (mark + kicker + number), meta grid of
   kickers, rows separated by hairlines, a `#FAFAFA` totals footer.
6. **Big statement on dark** — "AI-native / accounting." with `big`, sweep slab, then
   two `words` lines with gradient endings.
7. **Timeline** — numbered steps with the filling line (`data-tl`).
8. **Portal tour** — `ServicePortalBand` / `PortalShowcase`.
9. **Numbered terms / FAQ list** — left: eyebrow + big two-line heading (second line
   gradient); right: numbered rows with hairlines.
10. **Dark CTA** — "Accept your / quotation." style heading left, card or pills right.
11. **Closing glitch lockup** — in the footer already; do not repeat on pages.

## Rules

- Copy stays as it is. Restyle, don't rewrite (fix only obvious breakage).
- Keep every behaviour: forms, calculators, pricing logic, independence rules, analytics
  calls, links, i18n `t()` keys, ids used as anchors (`#pricing`, `#services`, …).
- Accessibility: real buttons/links, labels on inputs, `aria-*` on toggles, visible focus
  (indigo ring), text contrast ≥ 4.5:1 (`#A1A1AA` on ink is fine; on white use `#52525B`+).
- Responsive: works from 360px; no horizontal scroll; grids collapse to one column.
- No new dependencies. No framer-motion for new entrance animations.
- Copy rules (owner): never claim one firm delivers every service; corporate/CSP work is
  delivered with licensed CSP partners; keep AI outcomes-only ("the machines do the
  volume"), never internals.
