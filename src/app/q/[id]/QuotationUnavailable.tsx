import { A4DrawnLockup, DriftGlow, DARK_GRID } from "@/components/fx/primitives";
import { CONTACT_EMAIL, CONTACT_EMAIL_HREF } from "@/lib/contact";

const COPY = {
  invalid: {
    title: "This link has expired.",
    body: "Quotation links are personal and time-limited. Reply to the email we sent, or write to us, and we'll send you a fresh one.",
  },
  "not-found": {
    title: "We couldn't find that quotation.",
    body: "It may have been withdrawn or replaced with an updated one. Write to us and we'll send you the current version.",
  },
  unavailable: {
    title: "Your quotation will be right back.",
    body: "We couldn't load it just now. Please try again in a minute — or write to us and we'll send it over.",
  },
} as const;

/** Error states in the same dark, grid-lined language as the quotation page. */
export default function QuotationUnavailable({ reason }: { reason: keyof typeof COPY }) {
  const c = COPY[reason];
  return (
    <main
      data-hero=""
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        color: "#FFFFFF",
        background: DARK_GRID,
        fontFamily: "var(--a4x-display)",
      }}
    >
      <DriftGlow left="28%" top="-30%" />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 1280,
          margin: "0 auto",
          padding: "120px clamp(20px,5vw,72px)",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(28px,3.6vw,44px)",
        }}
      >
        <A4DrawnLockup id="qu" />
        <h1
          data-fx="rise"
          data-d="900"
          style={{ margin: 0, fontSize: "clamp(40px,6.4vw,104px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.04 }}
        >
          {c.title}
        </h1>
        <p
          data-fx="rise"
          data-d="1050"
          style={{ margin: 0, maxWidth: 720, fontSize: "clamp(18px,1.7vw,24px)", fontWeight: 500, lineHeight: 1.4, color: "#A1A1AA" }}
        >
          {c.body}
        </p>
        <div data-fx="rise" data-d="1200" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <a href={CONTACT_EMAIL_HREF} className="a4-btn a4-btn-light">
            Email {CONTACT_EMAIL}
          </a>
          <a href="https://a4.com.mt" className="a4-btn a4-btn-ghost">
            Go to a4.com.mt
          </a>
        </div>
      </div>
    </main>
  );
}
