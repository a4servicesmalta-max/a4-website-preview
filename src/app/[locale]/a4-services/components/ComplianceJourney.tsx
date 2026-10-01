"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Eyebrow } from "@/components/a4-landing/Primitives";
import { gradText } from "@/components/fx/primitives";
import { INDIGO, INK, PERI } from "@/lib/fx/engine";

/**
 * "From shoebox to signed" — the homepage scroll film, in the A4 design
 * language: a muted (light) surface, white 24px node cards on hairlines that
 * light up indigo as the camera arrives, a gradient dashed wire, and copy
 * panels set like the design's numbered eyebrow + H2.
 *
 * Same mechanic as the A4 Books landing film: a pinned viewport, a camera that
 * pans left-to-right through a connected flow world, holding on each node while
 * its copy panel fades in, then travelling on. A progress rail marks the stages.
 *
 * MECHANISM — deliberately NOT a hand-rolled rAF loop. This app already ships
 * GSAP + ScrollTrigger synced to a root Lenis (see common/SmoothScroll.tsx):
 *  - `scrub: true` (BOOLEAN, never a number). Lenis already smooths at lerp .1;
 *    a numeric scrub stacks a second lag stage and reads as rubber-banded.
 *  - The pin is CSS `position: sticky`, not ScrollTrigger `pin: true` — no
 *    pin-spacer, no DOM mutation on refresh, no CLS, same behaviour on iOS.
 *    The timeline is bound to the TRACK (the sticky range), so the intro
 *    scrolling past never eats into the first stage's dwell.
 *  - The camera moves each CLUSTER individually rather than one wide world
 *    element: a ~4300px-wide layer is past the GPU max texture size at dpr 2,
 *    so the compositor would refuse it and repaint it every frame.
 *
 * REDUCED MOTION — gated on the real media query inside gsap.matchMedia.
 * Do NOT use `useReduceMotion()`: it returns true for
 * `isMobile || prefersReduced || isSafariOrIOS`, which would freeze this on
 * every phone and every Safari.
 *
 * Layout CSS (sticky viewport, svh track, bottom sheet on narrow screens, the
 * reduced-motion list) lives in components/a4-landing/styles.css under
 * `.a4-jf`; the visual layer is scoped here under `.a4-jf--home`.
 */

/** World is ~4300 x 640 design units; `focus` is the world-x the camera centres. */
const STAGES = [
  {
    n: "01",
    focus: 250,
    kicker: "However it arrives",
    title: "Whatever you’ve got",
    body: "A carrier bag of receipts, a shared drive, three years of bank statements, or a half-finished set of books from the last accountant. We start from where you actually are.",
  },
  {
    n: "02",
    focus: 1150,
    kicker: "Every month",
    title: "Books that balance",
    body: "Bookkeeping kept current rather than reconstructed in a panic each spring, with management accounts you can actually read between the year-ends.",
  },
  {
    n: "03",
    focus: 2050,
    kicker: "Every deadline",
    title: "Filed on time",
    body: "VAT returns, payroll and FS3s, provisional tax. The Malta compliance calendar handled in the background, so nothing arrives as a surprise letter.",
  },
  {
    n: "04",
    focus: 2950,
    kicker: "At year end",
    title: "Statements prepared",
    body: "GAPSME financial statements built from the ledger you have been watching all year — not from a spreadsheet assembled the week before the deadline.",
  },
  {
    n: "05",
    focus: 3850,
    kicker: "And then",
    title: "Audited and signed",
    body: "Where a statutory audit is required, it is done in-house by the same firm that knows the file — opinion signed, accounts filed, year closed.",
  },
];

const BODY = "var(--a4x-body)";

// World art on a light surface: white sheets, zinc hairlines, indigo accents.
const EDGE = "#D4D4D8";
const SHEET = "#FFFFFF";
const PANEL = "#FAFAFA";
const MUTE = "#D4D4D8";
const DIM = "#A1A1AA";
const DARK = "#52525B";

/** How close (world units) the camera must be for a node to read as "arrived". */
const NODE_LIT = 240;

const Wire = ({ id }: { id: string }) => (
  <svg width="700" height="40" fill="none" style={{ marginTop: -20, display: "block" }}>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="700" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={INDIGO} />
        <stop offset="0.55" stopColor="#6468F3" />
        <stop offset="1" stopColor={PERI} />
      </linearGradient>
    </defs>
    <path d="M0 20 H 660" stroke={`url(#${id})`} strokeWidth="3" strokeDasharray="14 12" strokeLinecap="round" opacity="0.8" />
    <path d="M 690 20 l -22 -11 v 22 z" fill={PERI} />
  </svg>
);

function Node({ label, stage, children }: { label: string; stage: number; children: React.ReactNode }) {
  return (
    <div className="a4-jf__node" data-jf-node={stage} data-on={stage === 0 ? "true" : "false"}>
      <div className="a4-jf__nodeArt">{children}</div>
      <div className="a4-jf__nodeLabel">{label}</div>
    </div>
  );
}

const JOURNEY_CSS = `
  .a4-jf--home { background: #F4F4F5; color: ${INK}; font-family: var(--a4x-display); }
  .a4-jf--home .a4-jf__viewport {
    background:
      radial-gradient(760px 560px at 65% 50%, rgba(79,85,241,.13), rgba(79,85,241,0) 70%),
      radial-gradient(900px 700px at 18% 92%, rgba(161,161,170,.16), rgba(161,161,170,0) 70%),
      #F4F4F5;
  }
  .a4-jf--home .a4-jf__node {
    gap: 16px; border-radius: 24px; background: #FFFFFF; border: 1px solid #E4E4E7;
    box-shadow: 0 30px 80px rgba(9,9,11,.08);
    transition: border-color .45s, box-shadow .45s;
  }
  .a4-jf--home .a4-jf__node[data-on="true"] { border-color: rgba(79,85,241,.45); box-shadow: 0 24px 60px rgba(79,85,241,.16); }
  .a4-jf--home .a4-jf__nodeLabel {
    font-family: var(--a4x-display); font-size: 15px; font-weight: 600; letter-spacing: -0.01em;
    color: ${INK}; transition: color .45s;
  }
  .a4-jf--home .a4-jf__node[data-on="true"] .a4-jf__nodeLabel { color: ${INDIGO}; }
  .a4-jf--home .a4-jf__eyebrow {
    display: flex; align-items: baseline; gap: 12px;
    font-family: var(--a4x-display); font-size: 18px; font-weight: 600; letter-spacing: .02em; color: #52525B;
  }
  .a4-jf--home .a4-jf__n { font-family: inherit; font-size: inherit; font-weight: 600; color: ${INDIGO}; }
  .a4-jf--home .a4-jf__kicker {
    display: inline; margin: 0; font-family: inherit; font-size: inherit; font-weight: 600;
    letter-spacing: .02em; text-transform: none; color: #52525B;
  }
  .a4-jf--home .a4-jf__stageTitle {
    margin: 16px 0 0; font-family: var(--a4x-display); font-size: clamp(32px,3.6vw,52px); font-weight: 600;
    letter-spacing: -0.035em; line-height: 1.04; color: ${INK}; text-wrap: balance;
  }
  .a4-jf--home .a4-jf__body { margin: 16px 0 0; font-family: var(--a4x-body); font-size: 17px; line-height: 1.6; color: #52525B; }
  .a4-jf--home .a4-jf__rail span { background: #D4D4D8; }
  .a4-jf--home .a4-jf__rail span[data-on="true"] { background: ${INDIGO}; }
  @media (min-width: 1024px) {
    .a4-jf--home .a4-jf__scrim {
      width: min(60%, 860px);
      background: linear-gradient(90deg, #F4F4F5 0%, #F4F4F5 48%, rgba(244,244,245,.9) 66%, rgba(244,244,245,0) 100%);
    }
    .a4-jf--home .a4-jf__panel { left: max(clamp(20px,5vw,72px), calc((100% - 1280px) / 2 + 72px)); width: min(480px, 38vw); }
  }
  @media (max-width: 1023.98px) {
    .a4-jf--home .a4-jf__viewport {
      background: radial-gradient(620px 520px at 50% 28%, rgba(79,85,241,.14), rgba(79,85,241,0) 70%), #F4F4F5;
    }
    .a4-jf--home .a4-jf__panel {
      background: rgba(255,255,255,.96); border: 1px solid #E4E4E7; border-radius: 24px;
      padding: 22px 22px 24px; box-shadow: 0 30px 80px rgba(9,9,11,.14);
    }
    .a4-jf--home .a4-jf__eyebrow { font-size: 16px; }
    .a4-jf--home .a4-jf__stageTitle { margin-top: 10px; font-size: clamp(26px,6.6vw,34px); }
    .a4-jf--home .a4-jf__body { margin-top: 10px; font-size: 15px; line-height: 1.55; }
  }
`;

export function ComplianceJourney() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    const vp = viewport.current;
    if (!el || !tr || !vp) return;

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    const build = (narrow: boolean) => () => {
      const clusterEls = Array.from(el.querySelectorAll<HTMLElement>("[data-jf-cluster]"));
      const panelEls = Array.from(el.querySelectorAll<HTMLElement>("[data-jf-panel]"));
      const tickEls = Array.from(el.querySelectorAll<HTMLElement>("[data-jf-tick]"));
      const nodeEls = Array.from(el.querySelectorAll<HTMLElement>("[data-jf-node]"));
      if (!clusterEls.length) return;

      // Framing: how large the world is drawn, and where the focused node sits.
      // Divisors are the visible world size in design units — smaller = larger
      // artwork (owner 2026-08-27: the nodes read too small at /1500).
      const scale = narrow
        ? Math.min(vp.clientWidth / 660, vp.clientHeight / 1480)
        : Math.min(vp.clientWidth / 1180, vp.clientHeight / 780);
      const anchorX = narrow ? vp.clientWidth * 0.5 : vp.clientWidth * 0.65;
      const anchorY = narrow ? vp.clientHeight * 0.28 : vp.clientHeight * 0.5;

      // Place every cluster for a given camera-x. Each carries its own
      // transform, so no single layer approaches the texture limit. The node
      // the camera has arrived at lights up (border + label in indigo).
      const place = (camX: number) => {
        for (const c of clusterEls) {
          gsap.set(c, {
            x: anchorX + (Number(c.dataset.x) - camX) * scale,
            y: anchorY + (Number(c.dataset.y) - 320) * scale,
            scale,
            xPercent: -50,
            yPercent: -50,
          });
        }
        for (const node of nodeEls) {
          const focus = STAGES[Number(node.dataset.jfNode)]?.focus ?? 0;
          const on = Math.abs(camX - focus) < NODE_LIT ? "true" : "false";
          if (node.dataset.on !== on) node.dataset.on = on;
        }
      };

      const cam = { x: STAGES[0].focus };
      place(cam.x);
      gsap.set(panelEls, { opacity: 0, y: 18 });
      gsap.set(panelEls[0], { opacity: 1, y: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: tr,
          start: "top top",
          end: "bottom bottom",
          scrub: true, // Lenis already smooths — never a number here
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const i = Math.min(STAGES.length - 1, Math.floor(self.progress * STAGES.length));
            for (let n = 0; n < tickEls.length; n++) {
              const on = n === i ? "true" : "false";
              if (tickEls[n].dataset.on !== on) tickEls[n].dataset.on = on;
            }
          },
        },
      });

      // Hold on each node, then travel to the next — the A4 Books cadence.
      STAGES.forEach((s, i) => {
        if (i > 0) {
          tl.to(panelEls[i - 1], { opacity: 0, y: -18, duration: 0.3 });
          tl.to(
            cam,
            {
              x: s.focus,
              duration: 1,
              ease: "power2.inOut",
              onUpdate: () => place(cam.x),
            },
            "<"
          );
          tl.to(panelEls[i], { opacity: 1, y: 0, duration: 0.35 }, ">-0.25");
        }
        tl.to({}, { duration: 0.85 }); // dwell, so the copy can be read
      });

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        gsap.set([...clusterEls, ...panelEls], { clearProps: "all" });
      };
    };

    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", build(false));
    mm.add("(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)", build(true));

    // Webfonts land after first paint and move the trigger.
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});

    return () => mm.revert();
  }, []);

  return (
    <section id="journey" ref={root} className="a4-jf a4-jf--home" aria-labelledby="journey-title">
      <style>{JOURNEY_CSS}</style>
      {/* The intro's glow is anchored to its top edge and gone by its bottom,
          so it meets the pinned viewport (flat #F4F4F5 at its top) without a seam. */}
      <div
        style={{
          padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px) clamp(40px,5vw,72px)",
          background: "radial-gradient(1000px 620px at 24% 0%, rgba(79,85,241,.13), rgba(79,85,241,0) 70%), #F4F4F5",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div data-fx="rise">
            <Eyebrow>The year, end to end</Eyebrow>
          </div>
          <h2
            id="journey-title"
            data-fx="rise"
            data-d="100"
            style={{ margin: "16px 0 0", fontSize: "clamp(40px,5.6vw,92px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.02 }}
          >
            From shoebox to <span style={{ ...gradText, paddingBottom: ".06em" }}>signed.</span>
          </h2>
          <p
            data-fx="rise"
            data-d="200"
            style={{ margin: "20px 0 0", maxWidth: 640, fontFamily: BODY, fontSize: 18, lineHeight: 1.6, color: "#52525B", textWrap: "pretty" }}
          >
            Most firms hand back a set of accounts once a year and leave the other eleven months to you. This is what a year with A4 actually looks like
            &mdash; scroll through it.
          </p>
        </div>
      </div>

      <div className="a4-jf__track" ref={track}>
        <div className="a4-jf__viewport" ref={viewport}>
          {/* ---- the world (decorative; the copy panels carry the meaning) ---- */}
          <div className="a4-jf__world" aria-hidden="true">
            {[600, 1500, 2400, 3300].map((x) => (
              <div key={x} className="a4-jf__cluster" data-jf-cluster="" data-x={x} data-y="320">
                <Wire id={`a4-jf-wire-${x}`} />
              </div>
            ))}

            <div className="a4-jf__cluster" data-jf-cluster="" data-x="250" data-y="320">
              <Node label="Whatever arrives" stage={0}>
                <svg viewBox="0 0 200 120" fill="none" style={{ width: "100%", height: "100%" }}>
                  {[
                    { x: 8, y: 22, r: -11 },
                    { x: 62, y: 12, r: 6 },
                    { x: 116, y: 26, r: -4 },
                  ].map((s, i) => (
                    <g key={i} transform={`rotate(${s.r} ${s.x + 28} ${s.y + 34})`}>
                      <rect x={s.x} y={s.y} width="56" height="70" rx="6" fill={SHEET} stroke={EDGE} />
                      <rect x={s.x + 10} y={s.y + 13} width="30" height="5" rx="2.5" fill={DIM} />
                      <rect x={s.x + 10} y={s.y + 25} width="22" height="4" rx="2" fill={MUTE} />
                      <rect x={s.x + 10} y={s.y + 35} width="27" height="4" rx="2" fill={MUTE} />
                      {i === 1 ? <rect x={s.x + 10} y={s.y + 50} width="18" height="6" rx="3" fill={INDIGO} opacity="0.85" /> : null}
                    </g>
                  ))}
                </svg>
              </Node>
            </div>

            <div className="a4-jf__cluster" data-jf-cluster="" data-x="1150" data-y="320">
              <Node label="Your ledger" stage={1}>
                <svg viewBox="0 0 200 120" fill="none" style={{ width: "100%", height: "100%" }}>
                  <rect x="10" y="8" width="180" height="104" rx="8" fill={PANEL} stroke={EDGE} />
                  {[0, 1, 2, 3].map((i) => (
                    <g key={i}>
                      <rect x="24" y={26 + i * 21} width="64" height="6" rx="3" fill={DARK} opacity="0.55" />
                      <rect x="104" y={26 + i * 21} width="34" height="6" rx="3" fill={MUTE} />
                      <rect x="150" y={26 + i * 21} width="22" height="6" rx="3" fill={INDIGO} opacity="0.85" />
                    </g>
                  ))}
                </svg>
              </Node>
            </div>

            <div className="a4-jf__cluster" data-jf-cluster="" data-x="2050" data-y="320">
              <Node label="Filed" stage={2}>
                <svg viewBox="0 0 200 120" fill="none" style={{ width: "100%", height: "100%" }}>
                  {[0, 1, 2].map((i) => (
                    <g key={i}>
                      <rect x={10 + i * 64} y="16" width="52" height="88" rx="8" fill={SHEET} stroke={EDGE} />
                      <rect x={22 + i * 64} y="32" width="28" height="5" rx="2.5" fill={DIM} />
                      <circle cx={36 + i * 64} cy="70" r="13" fill="rgba(79,85,241,0.1)" stroke={INDIGO} strokeWidth="2.2" />
                      <path
                        d={`M${29 + i * 64} 70 l5 5 l9 -10`}
                        stroke={INDIGO}
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </g>
                  ))}
                </svg>
              </Node>
            </div>

            <div className="a4-jf__cluster" data-jf-cluster="" data-x="2950" data-y="320">
              <Node label="Financial statements" stage={3}>
                <svg viewBox="0 0 200 120" fill="none" style={{ width: "100%", height: "100%" }}>
                  <rect x="46" y="6" width="108" height="108" rx="8" fill={SHEET} stroke={EDGE} />
                  <rect x="62" y="24" width="56" height="7" rx="3.5" fill={DARK} opacity="0.7" />
                  <rect x="62" y="40" width="38" height="5" rx="2.5" fill={MUTE} />
                  {[0, 1, 2, 3].map((i) => (
                    <g key={i}>
                      <rect x="62" y={58 + i * 13} width="44" height="5" rx="2.5" fill={MUTE} />
                      <rect x="114" y={58 + i * 13} width="24" height="5" rx="2.5" fill={i === 3 ? INDIGO : MUTE} opacity={i === 3 ? 0.9 : 1} />
                    </g>
                  ))}
                </svg>
              </Node>
            </div>

            <div className="a4-jf__cluster" data-jf-cluster="" data-x="3850" data-y="320">
              <Node label="Signed &amp; filed" stage={4}>
                <svg viewBox="0 0 200 120" fill="none" style={{ width: "100%", height: "100%" }}>
                  <rect x="16" y="8" width="112" height="104" rx="8" fill={SHEET} stroke={EDGE} />
                  <rect x="32" y="26" width="56" height="6" rx="3" fill={DARK} opacity="0.6" />
                  <rect x="32" y="40" width="36" height="5" rx="2.5" fill={MUTE} />
                  <path d="M32 84 c 10 -13, 17 6, 26 -5 c 8 -9, 13 8, 22 -2" stroke={INDIGO} strokeWidth="2.6" strokeLinecap="round" fill="none" />
                  <rect x="32" y="96" width="48" height="4" rx="2" fill={MUTE} />
                  <circle cx="156" cy="86" r="24" fill="rgba(79,85,241,0.1)" stroke={INDIGO} />
                  <path d="M146 86 l7 7 l13 -14" stroke={INDIGO} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </Node>
            </div>
          </div>

          {/* Scrim: the camera keeps passing nodes and the dashed wire behind
              the copy column. Without this the headline sits on top of moving
              artwork and becomes unreadable. */}
          <div className="a4-jf__scrim" aria-hidden="true" />

          {/* ---- copy panels ---- */}
          {STAGES.map((s, i) => (
            <div key={s.n} className="a4-jf__panel" data-jf-panel={i}>
              <div className="a4-jf__eyebrow">
                <span className="a4-jf__n">{s.n}</span>
                <span className="a4-jf__kicker">{s.kicker}</span>
              </div>
              <h3 className="a4-jf__stageTitle">{s.title}</h3>
              <p className="a4-jf__body">{s.body}</p>
            </div>
          ))}

          {/* ---- progress rail ---- */}
          <div className="a4-jf__rail" aria-hidden="true">
            {STAGES.map((s, i) => (
              <span key={s.n} data-jf-tick={i} data-on={i === 0 ? "true" : "false"} />
            ))}
          </div>
        </div>
      </div>

      {/* Reduced motion / no-JS: the same five stages as a numbered list. */}
      <div className="a4-jf__static">
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px,5vw,72px)" }}>
          <ol style={{ gap: 0 }}>
            {STAGES.map((s, i) => (
              <li
                key={s.n}
                style={{
                  maxWidth: "none",
                  display: "grid",
                  gridTemplateColumns: "48px 1fr",
                  gap: 12,
                  padding: "28px 0",
                  borderTop: "1px solid #E4E4E7",
                  ...(i === STAGES.length - 1 ? { borderBottom: "1px solid #E4E4E7" } : null),
                }}
              >
                <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: INDIGO, paddingTop: 2 }}>{s.n}</span>
                <div>
                  <span style={{ fontFamily: BODY, fontSize: 12, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#71717A" }}>
                    {s.kicker}
                  </span>
                  <h3 style={{ margin: "8px 0 0", fontSize: 30, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.1, color: INK }}>{s.title}</h3>
                  <p style={{ margin: "10px 0 0", maxWidth: 640, fontFamily: BODY, fontSize: 16, lineHeight: 1.55, color: "#52525B" }}>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export default ComplianceJourney;
