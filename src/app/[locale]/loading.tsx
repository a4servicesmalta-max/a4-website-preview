import { A4Mark } from "@/components/fx/primitives";

/**
 * Route loader in the A4 style: ink, the A4 mark, and a thin indigo line
 * running underneath. It fades in after a short beat so quick navigations
 * never flash it; the nav stays above it.
 */
export default function RootLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="a4-route-loader"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 55,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#09090B",
        pointerEvents: "none",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <A4Mark size={46} color="#FFFFFF" />
        <div style={{ position: "relative", width: 132, height: 2, borderRadius: 1, overflow: "hidden", background: "rgba(255,255,255,.1)" }}>
          <span
            className="a4-route-loader-bar"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: "45%",
              borderRadius: 1,
              background: "linear-gradient(90deg,#4F55F1 0%,#6468F3 55%,#8B8FF7 100%)",
            }}
          />
        </div>
        <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>Loading…</span>
      </div>
      <style>{`
        .a4-route-loader { animation: a4-loader-in .3s cubic-bezier(.16,1,.3,1) .12s both; }
        .a4-route-loader-bar { animation: a4-loader-run 1.15s cubic-bezier(.65,0,.35,1) infinite; }
        @keyframes a4-loader-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes a4-loader-run { 0% { transform: translateX(-110%); } 100% { transform: translateX(250%); } }
        @media (prefers-reduced-motion: reduce) {
          .a4-route-loader { animation: none; }
          .a4-route-loader-bar { animation: none; transform: translateX(60%); }
        }
      `}</style>
    </div>
  );
}
