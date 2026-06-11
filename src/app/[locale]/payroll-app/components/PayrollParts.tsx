"use client";

import dynamic from "next/dynamic";

export const PayrollApp = dynamic(
  () => import("./PayrollShell").then((m) => ({ default: m.PayrollApp })),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-screen grid place-items-center a4-font-body text-[var(--a4-on-dark-mute)]"
        style={{ background: "#000" }}
      >
        Loading payroll…
      </div>
    ),
  }
);
