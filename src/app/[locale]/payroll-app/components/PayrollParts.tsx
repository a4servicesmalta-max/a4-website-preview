"use client";

import dynamic from "next/dynamic";

export const PayrollApp = dynamic(
  () => import("./PayrollShell").then((m) => ({ default: m.PayrollApp })),
  {
    ssr: false,
    loading: () => (
      <div
        className="grid place-items-center"
        style={{ height: "calc(100dvh - 72px)", background: "#09090B", color: "#A1A1AA", fontFamily: "var(--a4x-display)", fontSize: 15, fontWeight: 500 }}
      >
        Loading payroll…
      </div>
    ),
  }
);
