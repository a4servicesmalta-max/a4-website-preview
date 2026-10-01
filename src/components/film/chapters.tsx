"use client";

import React from "react";
import { Film } from "./Film";
import type { SceneDef } from "./core";
import {
  COPY,
  PORTALS,
  SAINative,
  SChase,
  SClose,
  SEvidenced,
  SExplained,
  SFiled,
  SHeadline,
  SMachines,
  SNewWay,
  SNow,
  SOldWay,
  SOpen,
  SPortal,
  SPortalHead,
  SReconcile,
  SRekey,
  SRepeat,
  SReveal,
  SService,
  SSheets,
} from "./scenes";

/**
 * The teaser film, cut into short chapters (owner, 1 Oct: motion graphics must not run
 * long). Each chapter keeps only its strongest beats, cut a little tighter than the film,
 * and a film second is 0.3 of a screen of scroll (Film.tsx).
 */

const OLD_WAY: SceneDef[] = [
  { name: "Glow", dur: 0.2 },
  { name: "Typewriter", dur: 0.5 },
  { name: "Wipe", dur: 0.5 },
  { name: "Spreadsheets", dur: 0.6 },
  { name: "OldWay", dur: 1.8 },
  { name: "Chase", dur: 0.9 },
  { name: "Rekey", dur: 0.9 },
  { name: "Reconcile", dur: 0.9 },
  { name: "Repeat", dur: 0.9 },
  { name: "Now", dur: 0.6 },
  { name: "TimeFor", dur: 0.5 },
  { name: "NewWay", dur: 1.2 },
  { name: "Reveal", dur: 1.4 },
];

/** Act 1 and 2: the old way, the turn, and the A4 reveal. */
export function OldWayFilm() {
  return (
    <Film
      scenes={OLD_WAY}
      label="The old way, and a new way to work"
      transcript={
        <>
          <p>You&apos;ve been running on spreadsheets and endless email threads.</p>
          <p>Chase. Re-key. Reconcile. Repeat.</p>
          <p>Now it&apos;s time for a new way to work. A4 Services: {COPY.tagline}</p>
        </>
      }
    >
      <SOpen />
      <SSheets />
      <SOldWay />
      <SChase />
      <SRekey />
      <SReconcile />
      <SRepeat />
      <SNow />
      <SNewWay />
      <SReveal />
    </Film>
  );
}

const SERVICES: SceneDef[] = [
  { name: "Headline", dur: 1.3 },
  { name: "S1", dur: 0.85 },
  { name: "S2", dur: 0.85 },
  { name: "S3", dur: 0.85 },
  { name: "S4", dur: 0.85 },
  { name: "S5", dur: 0.85 },
  { name: "S6", dur: 0.85 },
];

/** Every service. One portal. Then every service, one beat each. */
export function ServicesFilm() {
  return (
    <Film
      scenes={SERVICES}
      label="Every service. One portal."
      transcript={
        <>
          <p>Every service. One portal.</p>
          <ol>
            {COPY.services.map((s) => (
              <li key={s.w}>
                {s.w}: {s.line}
              </li>
            ))}
          </ol>
        </>
      }
    >
      <SHeadline />
      {COPY.services.map((_, i) => (
        <SService key={i} i={i} />
      ))}
    </Film>
  );
}

const AI_NATIVE: SceneDef[] = [
  { name: "AINative", dur: 1.7 },
  { name: "Machines", dur: 1.8 },
];

/** AI-native audit; the machines do the volume, our people do the judgement. */
export function AiNativeFilm() {
  return (
    <Film
      scenes={AI_NATIVE}
      base="#09090B"
      label="AI-native audit"
      transcript={
        <>
          <p>
            AI-native audit. {COPY.aiNativeSub}
          </p>
          <p>The machines do the volume. Our people do the judgement.</p>
        </>
      }
    >
      <SAINative />
      <SMachines />
    </Film>
  );
}

/** Two of the film's four portal beats: 01 at a glance, 03 upload once. */
const PORTAL_BEATS = [0, 2];
const PORTAL: SceneDef[] = [{ name: "PortalHead", dur: 1.2 }, ...PORTAL_BEATS.map((i) => ({ name: "P" + (i + 1), dur: i === 2 ? 3.2 : 3 }))];

/** Your own portal: four beats inside the client portal (sample data, fictional companies). */
export function PortalFilm() {
  return (
    <Film
      scenes={PORTAL}
      base="#09090B"
      label="Your own portal. For every engagement."
      transcript={
        <>
          <p>Your own portal. For every engagement. Powered by Vacei.</p>
          <ol>
            {PORTAL_BEATS.map((i) => (
              <li key={PORTALS[i].n}>
                {PORTALS[i].title} {PORTALS[i].sub}: {PORTALS[i].caption}
              </li>
            ))}
          </ol>
          <p>Sample data, fictional companies.</p>
        </>
      }
    >
      <SPortalHead />
      {PORTAL_BEATS.map((i) => (
        <SPortal key={i} i={i} />
      ))}
    </Film>
  );
}

const PROOF: SceneDef[] = [
  { name: "Explained", dur: 0.9 },
  { name: "Evidenced", dur: 1.4 },
  { name: "Filed", dur: 1.4 },
];

/** Every entry explained, every figure evidenced, every return filed: ON TIME. */
export function ProofFilm() {
  return (
    <Film
      scenes={PROOF}
      lead={0.3}
      label="Every return filed on time"
      transcript={<p>Every entry explained. Every figure evidenced. Every return filed, on time.</p>}
    >
      <SExplained />
      <SEvidenced />
      <SFiled />
    </Film>
  );
}

const CLOSE: SceneDef[] = [
  { name: "Close", dur: 2 },
  { name: "LineToLogo", dur: 2 },
];

/** A licensed accounting & audit firm in Malta; the line portrait draws the A4 mark. */
export function CloseFilm() {
  return (
    <Film scenes={CLOSE} lead={0.15} label="A licensed accounting and audit firm in Malta" transcript={<p>A licensed accounting &amp; audit firm in Malta.</p>}>
      <SClose />
    </Film>
  );
}
