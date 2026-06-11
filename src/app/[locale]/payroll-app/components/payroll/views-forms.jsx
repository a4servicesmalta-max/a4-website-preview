// views-forms.jsx — Tax Forms (FS5/FS3/FS7), Reports, Settings, Dashboard.
"use client";
import React, { useState } from "react";
import { Icon } from "@/components/a4-landing/Primitives";
import { PayCalc } from "./calc";
import { PAY_MONTHS, PayBtn, PayCard, PayChip, PayEmpty, PayField, PayStat } from "./ui.jsx";

function TaxFormsView({ employees, runs }) {
  const C = PayCalc;
  const [form, setForm] = useState("FS5");
  const [year] = useState(2026);
  const sorted = [...runs].sort((a, b) => a.monthIdx - b.monthIdx);
  const fs5Totals = sorted.reduce((a, r) => ({
    gross: a.gross + r.totals.gross, tax: a.tax + r.totals.tax,
    ssc: a.ssc + r.totals.eeSSC + r.totals.erSSC, mat: a.mat + r.totals.maternity,
  }), { gross: 0, tax: 0, ssc: 0, mat: 0 });

  const fs3 = employees.map((e) => {
    const months = sorted.filter((r) => r.rows.some((x) => x.empId === e.id));
    const sum = (f) => months.reduce((s, r) => s + f(r.rows.find((x) => x.empId === e.id)), 0);
    return { emp: e, months: months.length, gross: sum((x) => x.gross), tax: sum((x) => x.tax), eeSSC: sum((x) => x.eeSSC) };
  }).filter((x) => x.months > 0);
  const fs3Tot = fs3.reduce((a, x) => ({ gross: a.gross + x.gross, tax: a.tax + x.tax, eeSSC: a.eeSSC + x.eeSSC }), { gross: 0, tax: 0, eeSSC: 0 });
  const reconciles = Math.abs(fs5Totals.gross - fs3Tot.gross) < 0.01 && Math.abs(fs5Totals.tax - fs3Tot.tax) < 0.01;

  const FORM_META = {
    FS5: { t: "FS5 — Monthly payer's advice", d: "Monthly remittance of FSS tax, SSC and maternity fund to the CFR. Payment is due by the end of the following month.", icon: "calendar-clock" },
    FS3: { t: "FS3 — Annual statement of earnings", d: "Per-employee annual statement of emoluments, FSS tax and SSC deducted. Issued to each employee and filed by 15 February.", icon: "users" },
    FS7: { t: "FS7 — Annual reconciliation", d: "Employer's annual reconciliation tying the twelve FS5s to the sum of all FS3s. Filed with the FS3s by 15 February.", icon: "scale" },
  };

  return (
    <div className="pay-fade" data-screen-label="Tax Forms">
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
        <PayField label="Form" style={{ width: 220 }}>
          <select className="pay-select" value={form} onChange={(e) => setForm(e.target.value)}>
            <option value="FS5">FS5 — monthly payer's advice</option>
            <option value="FS3">FS3 — annual statements</option>
            <option value="FS7">FS7 — annual reconciliation</option>
          </select>
        </PayField>
        <PayField label="Year" style={{ width: 120 }}>
          <select className="pay-select" value={year} onChange={() => {}}><option>2026</option></select>
        </PayField>
        <div style={{ flex: 1 }} />
        <PayBtn variant="primary" onClick={() => {}}><Icon name="download" size={15} color="#000" /> Generate / download {form}</PayBtn>
      </div>

      <PayCard title={FORM_META[form].t} icon={FORM_META[form].icon} pad={0}
        right={<span style={{ fontSize: 12.5, color: "var(--stone)" }}>{FORM_META[form].d}</span>}>
        {runs.length === 0 ? (
          <PayEmpty icon="file-text" title="No data to report yet" sub="Approve at least one payroll run — the forms build automatically from approved months." />
        ) : form === "FS5" ? (
          <table className="pay-table">
            <thead><tr><th>Month</th><th className="num">Gross emoluments</th><th className="num">Income tax (FSS)</th><th className="num">Social security (EE+ER)</th><th className="num">Maternity fund</th><th className="num">Total due</th><th>Due by</th></tr></thead>
            <tbody>
              {sorted.map((r) => {
                const ssc = r.totals.eeSSC + r.totals.erSSC;
                const due = r.totals.tax + ssc + r.totals.maternity;
                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{PAY_MONTHS[r.monthIdx]} {r.year}</td>
                    <td className="num">{C.fmtE(r.totals.gross)}</td>
                    <td className="num">{C.fmtE(r.totals.tax)}</td>
                    <td className="num">{C.fmtE(ssc)}</td>
                    <td className="num">{C.fmtE(r.totals.maternity)}</td>
                    <td className="num" style={{ fontWeight: 700, color: "var(--primary-bright)" }}>{C.fmtE(due)}</td>
                    <td><PayChip tone="warn">End of {PAY_MONTHS[(r.monthIdx + 1) % 12]}{r.monthIdx === 11 ? " 2027" : ""}</PayChip></td>
                  </tr>
                );
              })}
              <tr className="totals">
                <td>Year to date</td>
                <td className="num">{C.fmtE(fs5Totals.gross)}</td>
                <td className="num">{C.fmtE(fs5Totals.tax)}</td>
                <td className="num">{C.fmtE(fs5Totals.ssc)}</td>
                <td className="num">{C.fmtE(fs5Totals.mat)}</td>
                <td className="num" style={{ color: "var(--primary-bright)" }}>{C.fmtE(fs5Totals.tax + fs5Totals.ssc + fs5Totals.mat)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        ) : form === "FS3" ? (
          <table className="pay-table">
            <thead><tr><th>Employee</th><th className="num">Months</th><th className="num">Gross emoluments</th><th className="num">FSS tax deducted</th><th className="num">SSC deducted</th><th>Status</th></tr></thead>
            <tbody>
              {fs3.map(({ emp, months, gross, tax, eeSSC }) => (
                <tr key={emp.id}>
                  <td style={{ fontWeight: 600 }}>{emp.first} {emp.last}</td>
                  <td className="num">{months}</td>
                  <td className="num">{C.fmtE(gross)}</td>
                  <td className="num">{C.fmtE(tax)}</td>
                  <td className="num">{C.fmtE(eeSSC)}</td>
                  <td><PayChip tone="cobalt">Due 15 Feb 2027</PayChip></td>
                </tr>
              ))}
              <tr className="totals">
                <td>All employees</td><td className="num">—</td>
                <td className="num">{C.fmtE(fs3Tot.gross)}</td>
                <td className="num">{C.fmtE(fs3Tot.tax)}</td>
                <td className="num">{C.fmtE(fs3Tot.eeSSC)}</td><td></td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div style={{ padding: 22 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="pay-two">
              <div style={{ background: "var(--surface-deep)", border: "1px solid var(--hairline-dark)", borderRadius: "var(--r-md)", padding: "16px 18px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--stone)", marginBottom: 10 }}>Sum of FS5s ({sorted.length} month{sorted.length === 1 ? "" : "s"})</div>
                {[["Gross emoluments", fs5Totals.gross], ["FSS tax remitted", fs5Totals.tax], ["SSC remitted (EE+ER)", fs5Totals.ssc], ["Maternity fund", fs5Totals.mat]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13.5 }}><span style={{ color: "var(--stone)" }}>{k}</span><span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{C.fmtE(v)}</span></div>
                ))}
              </div>
              <div style={{ background: "var(--surface-deep)", border: "1px solid var(--hairline-dark)", borderRadius: "var(--r-md)", padding: "16px 18px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--stone)", marginBottom: 10 }}>Sum of FS3s ({fs3.length} employee{fs3.length === 1 ? "" : "s"})</div>
                {[["Gross emoluments", fs3Tot.gross], ["FSS tax deducted", fs3Tot.tax], ["Employee SSC", fs3Tot.eeSSC]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13.5 }}><span style={{ color: "var(--stone)" }}>{k}</span><span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{C.fmtE(v)}</span></div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, padding: "14px 18px", borderRadius: "var(--r-md)", background: reconciles ? "rgba(0,160,130,.12)" : "rgba(214,134,30,.12)", border: `1px solid ${reconciles ? "rgba(0,160,130,.4)" : "rgba(214,134,30,.4)"}` }}>
              <Icon name={reconciles ? "badge-check" : "alert-triangle"} size={19} color={reconciles ? "var(--accent-teal)" : "var(--accent-warning)"} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: reconciles ? "var(--accent-teal)" : "var(--accent-warning)" }}>{reconciles ? "FS7 reconciles" : "Differences found"}</div>
                <div style={{ fontSize: 12.5, color: "var(--on-dark-mute)", marginTop: 2 }}>{reconciles ? "Gross and FSS tax on the FS5s agree with the sum of the FS3 statements. Ready to file — due 15 February 2027." : "The FS5 remittances do not agree with the FS3 statements — review the months above."}</div>
              </div>
            </div>
          </div>
        )}
      </PayCard>
    </div>
  );
}

function ReportsView({ employees, runs }) {
  const C = PayCalc;
  const rows = employees.map((e) => ({ e, p: C.computePay(e) }));
  const tot = rows.reduce((a, { p }) => a + p.employerCost * 12, 0);
  return (
    <div className="pay-fade" data-screen-label="Reports">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 18 }} className="pay-three">
        <PayStat icon="users" label="Headcount" value={employees.length} sub={`${employees.filter((x) => x.type === "Full-time").length} full-time · ${employees.filter((x) => x.type !== "Full-time").length} part-time/casual`} />
        <PayStat icon="banknote" label="Annual payroll cost" value={C.fmtE0(tot)} sub="Gross + employer SSC + maternity fund" />
        <PayStat icon="history" label="Approved runs (2026)" value={runs.length} sub={runs.length ? "Latest: " + PAY_MONTHS[[...runs].sort((a, b) => b.monthIdx - a.monthIdx)[0].monthIdx] : "None yet"} />
      </div>
      <PayCard title="Annual employer cost by employee" icon="bar-chart-3" pad={0}>
        <table className="pay-table">
          <thead><tr><th>Employee</th><th className="num">Annual gross</th><th className="num">Income tax</th><th className="num">EE SSC</th><th className="num">ER SSC + maternity</th><th className="num">Annual employer cost</th></tr></thead>
          <tbody>
            {rows.map(({ e, p }) => (
              <tr key={e.id}>
                <td style={{ fontWeight: 600 }}>{e.first} {e.last}</td>
                <td className="num">{C.fmtE(p.annual)}</td>
                <td className="num" style={{ color: "var(--on-dark-mute)" }}>{C.fmtE(p.annualTax)}</td>
                <td className="num" style={{ color: "var(--on-dark-mute)" }}>{C.fmtE(p.eeSSC * 12)}</td>
                <td className="num" style={{ color: "var(--on-dark-mute)" }}>{C.fmtE((p.erSSC + p.maternity) * 12)}</td>
                <td className="num" style={{ fontWeight: 700, color: "var(--primary-bright)" }}>{C.fmtE(p.employerCost * 12)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </PayCard>
    </div>
  );
}

function SettingsView() {
  const kv = (k, v) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "11px 0", borderBottom: "1px solid var(--divider-soft)", fontSize: 14 }}>
      <span style={{ color: "var(--stone)" }}>{k}</span><span style={{ color: "#fff", fontWeight: 600 }}>{v}</span>
    </div>
  );
  return (
    <div className="pay-fade" data-screen-label="Settings" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      <PayCard title="Company" icon="building-2">
        {kv("Legal name", "Borg Marine Ltd")}
        {kv("Company number", "C 84120")}
        {kv("PE number", "PE 45821")}
        {kv("Tax registration", "MT 2204-5512")}
        {kv("Registered address", "12, Triq ix-Xatt, Gżira")}
      </PayCard>
      <PayCard title="Payroll defaults" icon="settings">
        {kv("Pay frequency", "Monthly, last working day")}
        {kv("Payment method", "SEPA credit transfer")}
        {kv("FS5 reminder", "5 days before month end")}
        {kv("Rates table", "Malta 2026 (FSS + SSC Class 1)")}
        {kv("Managed by", "A4 Services — payroll team")}
      </PayCard>
    </div>
  );
}

function DashboardView({ employees, runs, monthIdx, go }) {
  const C = PayCalc;
  const rows = employees.map((e) => C.computePay(e));
  const gross = rows.reduce((s, p) => s + p.gross, 0);
  const net = rows.reduce((s, p) => s + p.net, 0);
  const due = rows.reduce((s, p) => s + p.tax + p.eeSSC + p.erSSC + p.maternity, 0);
  const thisRun = runs.find((r) => r.monthIdx === monthIdx);
  return (
    <div className="pay-fade" data-screen-label="Dashboard">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 18 }} className="pay-four">
        <PayStat icon="users" label="People" value={employees.length} sub="Active employees" />
        <PayStat icon="banknote" label="Monthly gross" value={C.fmtE0(gross)} sub={"Net pay " + C.fmtE0(net)} />
        <PayStat icon="landmark" label="CFR remittance" value={C.fmtE0(due)} sub="FSS + SSC + maternity / month" accent="var(--accent-warning)" />
        <PayStat icon={thisRun ? "check-circle" : "play-circle"} label={PAY_MONTHS[monthIdx] + " run"} value={thisRun ? "Approved" : "Not run"} sub={thisRun ? "Payslips & FS5 generated" : "Ready to run"} accent={thisRun ? "var(--accent-teal)" : "var(--primary-bright)"} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }} className="pay-two">
        <PayCard title="Quick actions" icon="zap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["play-circle", "Run " + PAY_MONTHS[monthIdx] + " payroll", "Compute and approve the month", "run"],
              ["user-plus", "Add an employee", "5-step FS4 onboarding wizard", "people"],
              ["file-text", "Tax forms", "FS5 · FS3 · FS7", "forms"],
              ["bar-chart-3", "Reports", "Employer cost analysis", "reports"],
            ].map(([ic, t, s, page]) => (
              <button key={t} onClick={() => go(page)} style={{ display: "flex", alignItems: "center", gap: 13, background: "var(--surface-deep)", border: "1px solid var(--hairline-dark)", borderRadius: "var(--r-md)", padding: "14px 15px", cursor: "pointer", textAlign: "left", transition: "border-color .15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(73,79,223,.55)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--hairline-dark)")}>
                <span style={{ width: 38, height: 38, borderRadius: "var(--r-md)", background: "rgba(73,79,223,.16)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name={ic} size={18} color="var(--primary-bright)" /></span>
                <span><span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: "#fff", fontFamily: "var(--font-body)" }}>{t}</span><span style={{ display: "block", fontSize: 12, color: "var(--stone)", marginTop: 2 }}>{s}</span></span>
              </button>
            ))}
          </div>
        </PayCard>
        <PayCard title="Compliance calendar" icon="calendar-clock">
          {[
            ["FS5 — " + PAY_MONTHS[monthIdx], "End of " + PAY_MONTHS[(monthIdx + 1) % 12], thisRun ? "green" : "warn", thisRun ? "Generated" : "Awaiting run"],
            ["FS3 statements 2026", "15 Feb 2027", "neutral", "Builds from runs"],
            ["FS7 reconciliation 2026", "15 Feb 2027", "neutral", "Auto-reconciles"],
          ].map(([t, d, tone, st]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid var(--divider-soft)" }}>
              <Icon name="calendar" size={15} color="var(--stone)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#fff" }}>{t}</div>
                <div style={{ fontSize: 12, color: "var(--stone)" }}>Due {d}</div>
              </div>
              <PayChip tone={tone}>{st}</PayChip>
            </div>
          ))}
        </PayCard>
      </div>
    </div>
  );
}

export {  TaxFormsView, ReportsView, SettingsView, DashboardView  };
