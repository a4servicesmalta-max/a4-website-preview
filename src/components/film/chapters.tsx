"use client";

import React from "react";
import { Film } from "./Film";
import type { SceneDef } from "./core";
import {
  COPY,
  PORTALS,
  SAINative,
  SBlurThrough,
  SChase,
  SClose,
  SEvidenced,
  SExplained,
  SFiled,
  SFlash,
  SHeadline,
  SHome,
  SLine,
  SMachines,
  SMeet,
  SNewWay,
  SNow,
  SOldWay,
  SOpen,
  SPortal,
  SPortalHead,
  SReconcile,
  SRekey,
  SReminder,
  SRepeat,
  SReveal,
  SService,
  SSheets,
} from "./scenes";

/**
 * The teaser film, cut into chapters for the homepage. Each chapter is a scroll film
 * (Film.tsx) with the film's own cue lengths; the opening glow is shortened so the
 * first frame isn't empty for long.
 */

const OLD_WAY: SceneDef[] = [
  { name: "Glow", dur: 0.4 },
  { name: "Typewriter", dur: 0.5 },
  { name: "Wipe", dur: 0.5 },
  { name: "Spreadsheets", dur: 0.5 },
  { name: "Line", dur: 1 },
  { name: "OldWay", dur: 2 },
  { name: "Reminder", dur: 1.5 },
  { name: "Flash", dur: 0.5 },
  { name: "Chase", dur: 1 },
  { name: "Rekey", dur: 1 },
  { name: "Reconcile", dur: 1 },
  { name: "Repeat", dur: 1 },
  { name: "AndNow", dur: 0.5 },
  { name: "Now", dur: 0.5 },
  { name: "TimeFor", dur: 0.5 },
  { name: "NewWay", dur: 1.5 },
  { name: "Meet", dur: 1 },
  { name: "BlurThrough", dur: 0.5 },
  { name: "Reveal", dur: 1.5 },
];

/** Act 1 and 2: the old way, the turn, and the A4 reveal. */
export function OldWayFilm() {
  return (
    <Film
      scenes={OLD_WAY}
      label="The old way, and a new way to work"
      transcript={
        <>
          <p>You&apos;ve been running on spreadsheets and endless email threads. Send reminder, for the third time.</p>
          <p>Chase. Re-key. Reconcile. Repeat.</p>
          <p>And now, it&apos;s time for a new way to work. Meet A4 Services: {COPY.tagline}</p>
        </>
      }
    >
      <SOpen />
      <SSheets />
      <SLine />
      <SOldWay />
      <SReminder />
      <SFlash />
      <SChase />
      <SRekey />
      <SReconcile />
      <SRepeat />
      <SNow />
      <SNewWay />
      <SMeet />
      <SBlurThrough />
      <SReveal />
    </Film>
  );
}

const SERVICES: SceneDef[] = [
  { name: "PushIn", dur: 0.5 },
  { name: "Home", dur: 2.5 },
  { name: "Headline", dur: 1.5 },
  { name: "S1", dur: 1 },
  { name: "S2", dur: 1 },
  { name: "S3", dur: 1 },
  { name: "S4", dur: 1 },
  { name: "S5", dur: 1 },
  { name: "S6", dur: 1 },
];

/** Into the client portal, then every service, one beat each. */
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
      <SHome />
      <SHeadline />
      {COPY.services.map((_, i) => (
        <SService key={i} i={i} />
      ))}
    </Film>
  );
}

const AI_NATIVE: SceneDef[] = [
  { name: "AINative", dur: 2 },
  { name: "Machines", dur: 2 },
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

const PORTAL: SceneDef[] = [
  { name: "PortalHead", dur: 1.5 },
  { name: "P1", dur: 3 },
  { name: "P2", dur: 4 },
  { name: "P3", dur: 3.5 },
  { name: "P4", dur: 3 },
];

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
            {PORTALS.map((p) => (
              <li key={p.n}>
                {p.title} {p.sub}: {p.caption}
              </li>
            ))}
          </ol>
          <p>Sample data, fictional companies.</p>
        </>
      }
    >
      <SPortalHead />
      {PORTALS.map((_, i) => (
        <SPortal key={i} i={i} />
      ))}
    </Film>
  );
}

const PROOF: SceneDef[] = [
  { name: "Explained", dur: 1 },
  { name: "Evidenced", dur: 1.5 },
  { name: "Filed", dur: 1.5 },
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
