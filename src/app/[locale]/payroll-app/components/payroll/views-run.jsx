// views-run.jsx — Run Payroll, Payroll History, Payslip modal. Requires calc.js, ui.jsx.
"use client";
import React from "react";
import { Icon, Logo } from "@/components/a4-landing/Primitives";
import { PayCalc } from "./calc";
import { PAY_MONTHS, PayBtn, PayCard, PayChip, PayEmpty, PayField } from "./ui.jsx";

function RunPayrollView({ employees, runs, monthIdx, setMonthIdx, approve }) {
  const C = PayCalc;
  const existing = runs.find((r) => r.monthIdx === monthIdx);
  const rows = employees.map((e) => ({ emp: e, p: C.computePay(e) }));
  const tot = rows.reduce((a, { p }) => ({
    gross: a.gross + p.gross, tax: a.tax + p.tax, eeSSC: a.eeSSC + p.eeSSC,
    erSSC: a.erSSC + p.erSSC, maternity: a.maternity + p.maternity, net: a.net + p.net, cost: a.cost + p.employerCost,
  }), { gross: 0, tax: 0, eeSSC: 0, erSSC: 0, maternity: 0, net: 0, cost: 0 });

  return (
    <div className="pay-fade" data-screen-label="Run Payroll" >
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
        <PayField label="Payroll period" style={{ width: 200 }}>
          <select className="pay-select" value={monthIdx} onChange={(e) => setMonthIdx(+e.target.value)}>
            {PAY_MONTHS.map((m, i) => <option key={m} value={i}>{m} 2026</option>)}
          </select>
        </PayField>
        <div style={{ flex: 1 }} />
        {existing ? (
          <PayChip tone="green"><Icon name="check-circle" size={13} color="var(--accent-teal)" /> Approved {existing.approvedAt} — payslips & FS5 generated</PayChip>
        ) : (
          <PayBtn variant="cobalt" onClick={() => approve(monthIdx, rows, tot)}><Icon name="check-circle" size={16} color="#fff" /> Approve & generate payslips + FS5</PayBtn>
        )}
      </div>

      <PayCard pad={0}>
        <div className="pay-scroll" style={{ overflowX: "auto" }}>
          <table className="pay-table">
            <thead><tr>
              <th>Employee</th><th className="num">Gross</th><th className="num">Income tax (FSS)</th>
              <th className="num">Employee SSC</th><th className="num">Employer SSC</th><th className="num">Maternity</th>
              <th className="num">Net pay</th><th className="num">Employer cost</th>
            </tr></thead>
            <tbody>
              {rows.map(({ emp, p }) => (
                <tr key={emp.id}>
                  <td>
                    <span style={{ fontWeight: 600 }}>{emp.first} {emp.last}</span>
                    <span style={{ display: "block", fontSize: 11.5, color: "var(--stone)", marginTop: 1 }}>{p.taxLabel} · SSC {p.sscCat}</span>
                  </td>
                  <td className="num">{C.fmtE(p.gross)}</td>
                  <td className="num" style={{ color: "var(--on-dark-mute)" }}>−{C.fmtE(p.tax)}</td>
                  <td className="num" style={{ color: "var(--on-dark-mute)" }}>−{C.fmtE(p.eeSSC)}</td>
                  <td className="num" style={{ color: "var(--on-dark-mute)" }}>{C.fmtE(p.erSSC)}</td>
                  <td className="num" style={{ color: "var(--on-dark-mute)" }}>{C.fmtE(p.maternity)}</td>
                  <td className="num" style={{ fontWeight: 700, color: "var(--accent-teal)" }}>{C.fmtE(p.net)}</td>
                  <td className="num" style={{ fontWeight: 600 }}>{C.fmtE(p.employerCost)}</td>
                </tr>
              ))}
              <tr className="totals">
                <td>Totals — {employees.length} employees</td>
                <td className="num">{C.fmtE(tot.gross)}</td>
                <td className="num">−{C.fmtE(tot.tax)}</td>
                <td className="num">−{C.fmtE(tot.eeSSC)}</td>
                <td className="num">{C.fmtE(tot.erSSC)}</td>
                <td className="num">{C.fmtE(tot.maternity)}</td>
                <td className="num" style={{ color: "var(--accent-teal)" }}>{C.fmtE(tot.net)}</td>
                <td className="num" style={{ color: "var(--primary-bright)" }}>{C.fmtE(tot.cost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </PayCard>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 12.5, color: "var(--stone)" }}>
        <Icon name="info" size={14} color="var(--stone)" />
        Income tax and SSC are computed live from the 2026 FSS bands and SSC Class 1 tables. Approving locks this month and produces each payslip plus the month's FS5.
      </div>
    </div>
  );
}

function HistoryView({ runs, openRun }) {
  const C = PayCalc;
  return (
    <div className="pay-fade" data-screen-label="Payroll History">
      <PayCard pad={0}>
        {runs.length === 0 ? (
          <PayEmpty icon="history" title="No payroll runs yet" sub="Run and approve a month under Run Payroll — approved runs land here with their payslips and FS5." />
        ) : (
          <table className="pay-table">
            <thead><tr><th>Period</th><th>Status</th><th className="num">Employees</th><th className="num">Gross</th><th className="num">Deductions</th><th className="num">Net paid</th><th className="num">Employer cost</th><th></th></tr></thead>
            <tbody>
              {[...runs].sort((a, b) => b.monthIdx - a.monthIdx).map((r) => (
                <tr key={r.id} className="pay-rowlink" onClick={() => openRun(r.id)}>
                  <td style={{ fontWeight: 600 }}>{PAY_MONTHS[r.monthIdx]} {r.year}</td>
                  <td><PayChip tone="green"><Icon name="check" size={12} color="var(--accent-teal)" stroke={3} /> Approved</PayChip></td>
                  <td className="num">{r.rows.length}</td>
                  <td className="num">{C.fmtE(r.totals.gross)}</td>
                  <td className="num" style={{ color: "var(--on-dark-mute)" }}>−{C.fmtE(r.totals.tax + r.totals.eeSSC)}</td>
                  <td className="num" style={{ fontWeight: 700, color: "var(--accent-teal)" }}>{C.fmtE(r.totals.net)}</td>
                  <td className="num">{C.fmtE(r.totals.cost)}</td>
                  <td className="num"><Icon name="chevron-right" size={16} color="var(--stone)" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </PayCard>
    </div>
  );
}

function RunDetail({ run, employees, back, openPayslip }) {
  const C = PayCalc;
  return (
    <div className="pay-fade" data-screen-label="Run detail">
      <button onClick={back} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "none", border: 0, cursor: "pointer", color: "var(--on-dark-mute)", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600, padding: 0, marginBottom: 18 }}><Icon name="arrow-left" size={15} color="currentColor" /> Payroll history</button>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 24, letterSpacing: "-.4px", color: "#fff", margin: 0 }}>{PAY_MONTHS[run.monthIdx]} {run.year} — approved run</h2>
        <PayChip tone="green"><Icon name="check-circle" size={13} color="var(--accent-teal)" /> FS5 generated · payment due by end of {PAY_MONTHS[(run.monthIdx + 1) % 12]}</PayChip>
      </div>
      <PayCard pad={0}>
        <table className="pay-table">
          <thead><tr><th>Employee</th><th className="num">Gross</th><th className="num">Tax</th><th className="num">EE SSC</th><th className="num">Net</th><th></th></tr></thead>
          <tbody>
            {run.rows.map((row) => (
              <tr key={row.empId} className="pay-rowlink" onClick={() => openPayslip(run.id, row.empId)}>
                <td style={{ fontWeight: 600 }}>{row.name}</td>
                <td className="num">{C.fmtE(row.gross)}</td>
                <td className="num" style={{ color: "var(--on-dark-mute)" }}>−{C.fmtE(row.tax)}</td>
                <td className="num" style={{ color: "var(--on-dark-mute)" }}>−{C.fmtE(row.eeSSC)}</td>
                <td className="num" style={{ fontWeight: 700, color: "var(--accent-teal)" }}>{C.fmtE(row.net)}</td>
                <td className="num"><PayChip tone="cobalt">Payslip</PayChip></td>
              </tr>
            ))}
          </tbody>
        </table>
      </PayCard>
    </div>
  );
}

function PayslipModal({ run, row, employees, onClose }) {
  const C = PayCalc;
  const emp = employees.find((e) => e.id === row.empId);
  const line = (k, v, strong, neg) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "9px 0", fontSize: 13.5, borderBottom: "1px solid var(--divider-soft)" }}>
      <span style={{ color: strong ? "#fff" : "var(--stone)", fontWeight: strong ? 700 : 400 }}>{k}</span>
      <span style={{ fontWeight: strong ? 700 : 600, fontVariantNumeric: "tabular-nums", color: strong ? "var(--accent-teal)" : neg ? "var(--on-dark-mute)" : "#fff" }}>{neg ? "−" : ""}{C.fmtE(v)}</span>
    </div>
  );
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,.72)", display: "grid", placeItems: "center", padding: 20 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pay-fade pay-scroll" style={{ width: "min(560px,100%)", maxHeight: "92vh", overflowY: "auto", background: "var(--surface-elevated)", border: "1px solid var(--hairline-dark)", borderRadius: "var(--r-xl)", padding: "26px 28px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <Logo height={18} />
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 18, color: "#fff", letterSpacing: "-.2px" }}>Payslip</div>
              <div style={{ fontSize: 12, color: "var(--stone)" }}>Borg Marine Ltd · {PAY_MONTHS[run.monthIdx]} {run.year}</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: 0, cursor: "pointer", padding: 6 }}><Icon name="x" size={19} color="var(--stone)" /></button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "14px 0 4px", fontSize: 13 }}>
          <div><div style={{ color: "var(--stone)", fontSize: 11.5 }}>Employee</div><div style={{ fontWeight: 700, color: "#fff", marginTop: 2 }}>{row.name}</div></div>
          <div><div style={{ color: "var(--stone)", fontSize: 11.5 }}>Tax status</div><div style={{ fontWeight: 600, color: "#fff", marginTop: 2 }}>{row.taxLabel}</div></div>
          <div><div style={{ color: "var(--stone)", fontSize: 11.5 }}>SSC category</div><div style={{ fontWeight: 600, color: "#fff", marginTop: 2 }}>{row.sscCat}</div></div>
          <div style={{ textAlign: "right" }}><div style={{ color: "var(--stone)", fontSize: 11.5 }}>Paid to</div><div style={{ fontWeight: 600, color: "#fff", marginTop: 2 }}>{emp && emp.bank.iban ? "····" + emp.bank.iban.replace(/\s/g, "").slice(-4) : "—"}</div></div>
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--stone)", margin: "16px 0 4px" }}>Earnings</div>
        {line("Basic salary", row.gross)}
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--stone)", margin: "16px 0 4px" }}>Deductions</div>
        {line("Income tax (FSS)", row.tax, false, true)}
        {line("Social security — Class 1, Cat " + row.sscCat, row.eeSSC, false, true)}
        {line("Net pay", row.net, true)}
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--stone)", margin: "16px 0 4px" }}>Employer contributions (not deducted)</div>
        {line("Employer SSC — Class 1", row.erSSC)}
        {line("Maternity fund", row.maternity)}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <PayBtn variant="ghost" size="sm" onClick={onClose}>Close</PayBtn>
          <PayBtn variant="primary" size="sm" onClick={() => {}}><Icon name="download" size={14} color="#000" /> Download PDF</PayBtn>
        </div>
      </div>
    </div>
  );
}

export {  RunPayrollView, HistoryView, RunDetail, PayslipModal  };
