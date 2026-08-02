// @ts-nocheck
"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container, Eyebrow } from "@/components/a4-landing/Primitives";

/**
 * "From shoebox to signed" — the homepage scroll film.
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
 *  - The camera moves each CLUSTER individually rather than one wide world
 *    element: a ~4300px-wide layer is past the GPU max texture size at dpr 2,
 *    so the compositor would refuse it and repaint it every frame.
 *
 * REDUCED MOTION — gated on the real media query inside gsap.matchMedia.
 * Do NOT use `useReduceMotion()`: it returns true for
 * `isMobile || prefersReduced || isSafariOrIOS`, which would freeze this on
 * every phone and every Safari.
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

const EDGE = "rgba(255,255,255,0.13)";
const MUTE = "rgba(255,255,255,0.34)";
const INK = "rgba(255,255,255,0.72)";
const IND = "#7b80ff";
const FILL = "#0d0d11";

const Wire = () => (
  <svg width="700" height="40" fill="none" style={{ marginTop: -20 }}>
    <path
      d="M0 20 H 660"
      stroke={IND}
      strokeWidth="3"
      strokeDasharray="14 12"
      strokeLinecap="round"
      opacity="0.7"
    />
    <path d="M 690 20 l -22 -11 v 22 z" fill={IND} opacity="0.7" />
  </svg>
);

function Node({ label, children }) {
  return (
    <div className="a4-jf__node">
      <div className="a4-jf__nodeArt">{children}</div>
      <div className="a4-jf__nodeLabel">{label}</div>
    </div>
  );
}

export function ComplianceJourney() {
  const root = useRef(null);
  const viewport = useRef(null);
  const clusters = useRef([]);
  const panels = useRef([]);
  const ticks = useRef([]);

  useEffect(() => {
    const el = root.current;
    const vp = viewport.current;
    if (!el || !vp) return;

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    const build = (narrow) => () => {
      const clusterEls = clusters.current.filter(Boolean);
      const panelEls = panels.current.filter(Boolean);
      const tickEls = ticks.current.filter(Boolean);
      if (!clusterEls.length) return;

      // Framing: how large the world is drawn, and where the focused node sits.
      const scale = narrow
        ? Math.min(vp.clientWidth / 760, vp.clientHeight / 1700)
        : Math.min(vp.clientWidth / 1500, vp.clientHeight / 950);
      const anchorX = narrow ? vp.clientWidth * 0.5 : vp.clientWidth * 0.63;
      const anchorY = narrow ? vp.clientHeight * 0.28 : vp.clientHeight * 0.5;

      // Place every cluster for a given camera-x. Each carries its own
      // transform, so no single layer approaches the texture limit.
      const place = (camX) => {
        for (const c of clusterEls) {
          gsap.set(c, {
            x: anchorX + (Number(c.dataset.x) - camX) * scale,
            y: anchorY + (Number(c.dataset.y) - 320) * scale,
            scale,
            xPercent: -50,
            yPercent: -50,
          });
        }
      };

      const cam = { x: STAGES[0].focus };
      place(cam.x);
      gsap.set(panelEls, { opacity: 0, y: 18 });
      gsap.set(panelEls[0], { opacity: 1, y: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: true, // Lenis already smooths — never a number here
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const i = Math.min(
              STAGES.length - 1,
              Math.floor(self.progress * STAGES.length)
            );
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

  const setCluster = (i) => (node) => {
    clusters.current[i] = node;
  };

  return (
    <section id="journey" ref={root} className="a4-jf" aria-labelledby="journey-title">
      <div className="a4-jf__intro">
        <Container>
          <Eyebrow dark>The year, end to end</Eyebrow>
          <h2 id="journey-title" className="a4-jf__title">
            From shoebox to signed.
          </h2>
          <p className="a4-jf__lede">
            Most firms hand back a set of accounts once a year and leave the other
            eleven months to you. This is what a year with A4 actually looks like
            &mdash; scroll through it.
          </p>
        </Container>
      </div>

      <div className="a4-jf__track">
        <div className="a4-jf__viewport" ref={viewport}>
          {/* ---- the world (decorative; the copy panels carry the meaning) ---- */}
          <div className="a4-jf__world" aria-hidden="true">
            {[600, 1500, 2400, 3300].map((x, i) => (
              <div
                key={x}
                className="a4-jf__cluster"
                data-x={x}
                data-y="320"
                ref={setCluster(i)}
              >
                <Wire />
              </div>
            ))}

            <div className="a4-jf__cluster" data-x="250" data-y="320" ref={setCluster(4)}>
              <Node label="Whatever arrives">
                <svg viewBox="0 0 200 120" fill="none" style={{ width: "100%", height: "100%" }}>
                  {[
                    { x: 8, y: 22, r: -11 },
                    { x: 62, y: 12, r: 6 },
                    { x: 116, y: 26, r: -4 },
                  ].map((s, i) => (
                    <g key={i} transform={`rotate(${s.r} ${s.x + 28} ${s.y + 34})`}>
                      <rect x={s.x} y={s.y} width="56" height="70" rx="6" fill={FILL} stroke={EDGE} />
                      <rect x={s.x + 10} y={s.y + 13} width="30" height="5" rx="2.5" fill={MUTE} />
                      <rect x={s.x + 10} y={s.y + 25} width="22" height="4" rx="2" fill={MUTE} opacity="0.6" />
                      <rect x={s.x + 10} y={s.y + 35} width="27" height="4" rx="2" fill={MUTE} opacity="0.6" />
                    </g>
                  ))}
                </svg>
              </Node>
            </div>

            <div className="a4-jf__cluster" data-x="1150" data-y="320" ref={setCluster(5)}>
              <Node label="Your ledger">
                <svg viewBox="0 0 200 120" fill="none" style={{ width: "100%", height: "100%" }}>
                  <rect x="10" y="8" width="180" height="104" rx="8" fill={FILL} stroke={EDGE} />
                  {[0, 1, 2, 3].map((i) => (
                    <g key={i}>
                      <rect x="24" y={26 + i * 21} width="64" height="6" rx="3" fill={INK} opacity="0.5" />
                      <rect x="104" y={26 + i * 21} width="34" height="6" rx="3" fill={MUTE} />
                      <rect x="150" y={26 + i * 21} width="22" height="6" rx="3" fill={IND} opacity="0.8" />
                    </g>
                  ))}
                </svg>
              </Node>
            </div>

            <div className="a4-jf__cluster" data-x="2050" data-y="320" ref={setCluster(6)}>
              <Node label="Filed">
                <svg viewBox="0 0 200 120" fill="none" style={{ width: "100%", height: "100%" }}>
                  {[0, 1, 2].map((i) => (
                    <g key={i}>
                      <rect x={10 + i * 64} y="16" width="52" height="88" rx="8" fill={FILL} stroke={EDGE} />
                      <rect x={22 + i * 64} y="32" width="28" height="5" rx="2.5" fill={MUTE} />
                      <circle cx={36 + i * 64} cy="70" r="13" fill="none" stroke={IND} strokeWidth="2.2" />
                      <path d={`M${29 + i * 64} 70 l5 5 l9 -10`} stroke={IND} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </g>
                  ))}
                </svg>
              </Node>
            </div>

            <div className="a4-jf__cluster" data-x="2950" data-y="320" ref={setCluster(7)}>
              <Node label="Financial statements">
                <svg viewBox="0 0 200 120" fill="none" style={{ width: "100%", height: "100%" }}>
                  <rect x="46" y="6" width="108" height="108" rx="8" fill={FILL} stroke={EDGE} />
                  <rect x="62" y="24" width="56" height="7" rx="3.5" fill={INK} opacity="0.68" />
                  <rect x="62" y="40" width="38" height="5" rx="2.5" fill={MUTE} />
                  {[0, 1, 2, 3].map((i) => (
                    <g key={i}>
                      <rect x="62" y={58 + i * 13} width="44" height="5" rx="2.5" fill={MUTE} opacity="0.55" />
                      <rect x="114" y={58 + i * 13} width="24" height="5" rx="2.5" fill={i === 3 ? IND : MUTE} opacity={i === 3 ? 0.9 : 0.55} />
                    </g>
                  ))}
                </svg>
              </Node>
            </div>

            <div className="a4-jf__cluster" data-x="3850" data-y="320" ref={setCluster(8)}>
              <Node label="Signed &amp; filed">
                <svg viewBox="0 0 200 120" fill="none" style={{ width: "100%", height: "100%" }}>
                  <rect x="16" y="8" width="112" height="104" rx="8" fill={FILL} stroke={EDGE} />
                  <rect x="32" y="26" width="56" height="6" rx="3" fill={INK} opacity="0.6" />
                  <rect x="32" y="40" width="36" height="5" rx="2.5" fill={MUTE} />
                  <path d="M32 84 c 10 -13, 17 6, 26 -5 c 8 -9, 13 8, 22 -2" stroke={IND} strokeWidth="2.6" strokeLinecap="round" fill="none" />
                  <rect x="32" y="96" width="48" height="4" rx="2" fill={MUTE} opacity="0.5" />
                  <circle cx="156" cy="86" r="24" fill="rgba(123,128,255,0.12)" stroke={IND} />
                  <path d="M146 86 l7 7 l13 -14" stroke={IND} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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
            <div
              key={s.n}
              className="a4-jf__panel"
              ref={(node) => {
                panels.current[i] = node;
              }}
            >
              <span className="a4-jf__n">{s.n}</span>
              <span className="a4-jf__kicker">{s.kicker}</span>
              <h3 className="a4-jf__stageTitle">{s.title}</h3>
              <p className="a4-jf__body">{s.body}</p>
            </div>
          ))}

          {/* ---- progress rail ---- */}
          <div className="a4-jf__rail" aria-hidden="true">
            {STAGES.map((s, i) => (
              <span
                key={s.n}
                data-on={i === 0 ? "true" : "false"}
                ref={(node) => {
                  ticks.current[i] = node;
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Reduced motion / no-JS: the same five stages as a plain list. */}
      <div className="a4-jf__static">
        <Container>
          <ol>
            {STAGES.map((s) => (
              <li key={s.n}>
                <span className="a4-jf__kicker">{s.kicker}</span>
                <h3 className="a4-jf__stageTitle">{s.title}</h3>
                <p className="a4-jf__body">{s.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </div>
    </section>
  );
}

export default ComplianceJourney;
