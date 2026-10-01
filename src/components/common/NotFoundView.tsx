import Link from "next/link";
import { A4Mark, DARK_GRID, DriftGlow, LetterWord, Slab, TypeText, gradText } from "@/components/fx/primitives";
import { gcol } from "@/lib/fx/engine";

const POPULAR = [
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/insights", label: "Insights" },
  { href: "/contact", label: "Contact" },
];

/**
 * 404 in the A4 design language: the hero's dark grid, glow and slab, a scattered gradient
 * "404", a typed headline and the ways back. `bare` adds the A4 lockup for the root
 * not-found, which renders outside the site layout (no nav).
 */
export function NotFoundView({ bare = false }: { bare?: boolean }) {
  return (
    <section
      data-hero=""
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        color: "#FFFFFF",
        background: DARK_GRID,
      }}
    >
      <DriftGlow left="30%" top="-34%" strength={0.3} />
      <div data-hero-par="" aria-hidden="true" style={{ position: "absolute", right: "-18vw", top: "14vh", width: "46vw", height: "90vh", pointerEvents: "none" }}>
        <div data-fx="slab" data-d="80" style={{ position: "absolute", inset: 0 }}>
          <Slab opacity={0.5} />
        </div>
      </div>
      {bare ? (
        <header style={{ position: "relative", zIndex: 3, width: "100%", maxWidth: 1280, margin: "0 auto", padding: "28px clamp(20px,5vw,72px) 0" }}>
          <Link
            href="/"
            aria-label="A4 Services — home"
            style={{ display: "inline-flex", alignItems: "center", gap: 12, color: "#FFFFFF", textDecoration: "none", fontSize: 18, fontWeight: 600 }}
          >
            <A4Mark size={28} />
            <span>A4 Services</span>
          </Link>
        </header>
      ) : null}
      <div
        data-hero-exit=""
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          width: "100%",
          maxWidth: 1280,
          margin: "0 auto",
          padding: `${bare ? "clamp(48px,7vw,80px)" : "clamp(112px,12vw,140px)"} clamp(20px,5vw,72px) clamp(56px,6vw,80px)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "clamp(18px,2.2vw,28px)",
        }}
      >
        <div data-fx="rise" data-d="100" style={{ display: "flex", alignItems: "baseline", gap: 12, fontSize: "clamp(16px,1.5vw,22px)", fontWeight: 600, letterSpacing: ".02em", color: "#8B8FF7" }}>
          <span aria-hidden="true" style={{ display: "inline-block", width: 10, height: 10, borderRadius: 1, background: "#8B8FF7", transform: "skewX(-30deg)", alignSelf: "center" }} />
          Error 404 · Page not found
        </div>
        <LetterWord
          text="404"
          fx="scatter"
          d={160}
          colors={[gcol(0), gcol(0.5), gcol(1)]}
          style={{ fontSize: "clamp(96px,16vw,220px)", fontWeight: 600, letterSpacing: "-0.06em", lineHeight: 0.86 }}
        />
        <h1 style={{ margin: 0, maxWidth: 1000, fontSize: "clamp(36px,4.6vw,72px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.03, textWrap: "balance" }}>
          <TypeText segments={[{ t: "We can’t find that page.", c: "#FFFFFF" }]} per={34} d={700} />
          <div data-fx="rise" data-d="1580" data-dy="60" style={{ fontWeight: 600, paddingBottom: ".08em", marginBottom: "-.08em", ...gradText }}>
            Let’s get you back.
          </div>
        </h1>
        <p data-fx="rise" data-d="1760" style={{ margin: 0, maxWidth: 640, fontSize: "clamp(18px,1.7vw,24px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.45, color: "#A1A1AA", textWrap: "pretty" }}>
          The link may be out of date, or the page may have moved. Everything else is one click away.
        </p>
        <div data-fx="rise" data-d="1900" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link href="/" className="a4-btn a4-btn-light" style={{ textDecoration: "none" }}>
            Back to home
          </Link>
          <Link href="/quote" className="a4-btn a4-btn-ghost" style={{ textDecoration: "none" }}>
            Get a quote
          </Link>
        </div>
        <nav aria-label="Popular pages" data-fx="rise" data-d="2040" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {POPULAR.map((l) => (
            <Link key={l.href} href={l.href} className="a4-chip a4-chip-dark" style={{ textDecoration: "none" }}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
