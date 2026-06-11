// wizard.jsx — Add Employee: 5-step wizard with live FSS band + SSC category helper.
"use client";
import React, { useState, useMemo } from "react";
import { Icon } from "@/components/a4-landing/Primitives";
import { PayCalc } from "./calc";
import { PayBtn, PayCard, PayField, PaySeg, PayToggle } from "./ui.jsx";

const { useState: useWizState, useMemo: useWizMemo } = React;

const WIZ_STEPS = ["Personal", "Tax (FS4)", "Salary", "Bank details", "Review"];

const WIZ_BLANK = {
  first: "", last: "", dob: "", gender: "female", marital: "single", hasKids: false, children: 0,
  taxCat: "single", sscStatus: "standard", student: false, otOptOut: false, sickRate: "full",
  type: "Full-time", role: "",
  salary: { amount: "", freq: "annual", hours: 40 },
  bank: { accountName: "", bankName: "", iban: "" },
};

function WizProgress({ step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28 }}>
      {WIZ_STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 30, height: 30, borderRadius: "var(--r-full)", display: "grid", placeItems: "center", flexShrink: 0, fontSize: 12.5, fontWeight: 700, background: i < step ? "var(--primary)" : i === step ? "#fff" : "var(--surface-deep)", color: i < step ? "#fff" : i === step ? "#000" : "var(--stone)", border: i > step ? "1px solid var(--hairline-dark)" : "none", transition: "all .2s" }}>
              {i < step ? <Icon name="check" size={14} color="#fff" stroke={3} /> : i + 1}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: i === step ? "#fff" : i < step ? "var(--on-dark-mute)" : "var(--stone)", whiteSpace: "nowrap" }} className={i === step ? "" : "wiz-lbl"}>{s}</span>
          </div>
          {i < WIZ_STEPS.length - 1 && <span style={{ flex: 1, height: 1, background: i < step ? "var(--primary)" : "var(--hairline-dark)", margin: "0 12px", transition: "background .2s" }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

// Live helper: which tax band + SSC category these inputs produce
function WizHelper({ d }) {
  const C = PayCalc;
  const annual = C.annualBasic(d.salary);
  const key = C.taxKey(d.taxCat, d.hasKids ? d.children : 0);
  const hasSalary = annual > 0;
  const band = hasSalary ? C.taxBandInfo(annual, key) : null;
  const weekly = annual / 52;
  const ssc = d.dob ? C.sscWeekly({ ...d, children: d.hasKids ? d.children : 0 }, hasSalary ? weekly : 300) : null;
  const age = d.dob ? C.ageOn(d.dob) : null;
  return (
    <div style={{ background: "rgba(73,79,223,.08)", border: "1px solid rgba(73,79,223,.35)", borderRadius: "var(--r-md)", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--primary-bright)" }}>
        <Icon name="sparkles" size={14} color="var(--primary-bright)" /> Live assessment
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Icon name="landmark" size={16} color="var(--on-dark-mute)" style={{ marginTop: 1, flexShrink: 0 }} />
        <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--on-dark)" }}>
          <strong>{C.TAX_LABELS[key]}</strong>
          {hasSalary ? (
            <> — at {C.fmtE0(annual)}/yr this falls in the <strong>{Math.round(band.rate * 100)}% band</strong>{band.subtract > 0 ? ` (subtract €${band.subtract.toLocaleString()})` : " (no tax due)"}.</>
          ) : (
            <> — exact band confirmed once salary is entered.</>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Icon name="shield-check" size={16} color="var(--on-dark-mute)" style={{ marginTop: 1, flexShrink: 0 }} />
        <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--on-dark)" }}>
          {ssc ? (
            <><strong>SSC Class 1 — Category {ssc.cat}</strong> · {ssc.desc}{!hasSalary && " (assumed €300/wk until salary entered)"}. {age !== null && <span style={{ color: "var(--on-dark-mute)" }}>Age {age}.</span>}</>
          ) : (
            <>Enter date of birth to determine the SSC category (A–F).</>
          )}
        </div>
      </div>
    </div>
  );
}

function WizardModal({ onClose, onSave }) {
  const C = PayCalc;
  const [step, setStep] = useWizState(0);
  const [d, setD] = useWizState(WIZ_BLANK);
  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));
  const setS = (k, v) => setD((p) => ({ ...p, salary: { ...p.salary, [k]: v } }));
  const setB = (k, v) => setD((p) => ({ ...p, bank: { ...p.bank, [k]: v } }));

  const valid = [
    d.first.trim() && d.last.trim() && d.dob,
    true,
    parseFloat(d.salary.amount) > 0,
    d.bank.iban.trim().length >= 8,
    true,
  ][step];

  const preview = useWizMemo(() => {
    if (!(parseFloat(d.salary.amount) > 0) || !d.dob) return null;
    return C.computePay({ ...d, children: d.hasKids ? d.children : 0 });
  }, [d]);

  const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };

  const save = () => {
    onSave({ ...d, children: d.hasKids ? d.children : 0, id: "emp-" + Date.now() });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,.72)", display: "grid", placeItems: "center", padding: 20 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pay-fade pay-scroll" style={{ width: "min(760px, 100%)", maxHeight: "92vh", overflowY: "auto", background: "var(--surface-elevated)", border: "1px solid var(--hairline-dark)", borderRadius: "var(--r-xl)", padding: "28px 32px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 24, letterSpacing: "-.4px", color: "#fff", margin: 0 }}>Add employee</h2>
            <div style={{ fontSize: 13, color: "var(--stone)", marginTop: 4 }}>Step {step + 1} of 5 — {WIZ_STEPS[step]}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: 0, cursor: "pointer", padding: 6 }}><Icon name="x" size={20} color="var(--stone)" /></button>
        </div>
        <WizProgress step={step} />

        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={grid2}>
              <PayField label="First name"><input className="pay-input" value={d.first} onChange={(e) => set("first", e.target.value)} placeholder="e.g. Claire" /></PayField>
              <PayField label="Last name"><input className="pay-input" value={d.last} onChange={(e) => set("last", e.target.value)} placeholder="e.g. Attard" /></PayField>
            </div>
            <div style={grid2}>
              <PayField label="Date of birth"><input type="date" className="pay-input" value={d.dob} onChange={(e) => set("dob", e.target.value)} /></PayField>
              <PayField label="Gender"><PaySeg value={d.gender} onChange={(v) => set("gender", v)} options={[{ value: "female", label: "Female" }, { value: "male", label: "Male" }, { value: "other", label: "Other" }]} /></PayField>
            </div>
            <div style={grid2}>
              <PayField label="Marital status"><PaySeg value={d.marital} onChange={(v) => { set("marital", v); if (v === "married" && d.taxCat === "single") set("taxCat", "married"); }} options={[{ value: "single", label: "Single" }, { value: "married", label: "Married" }]} /></PayField>
              <PayField label="Role / job title"><input className="pay-input" value={d.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. Accounts Clerk" /></PayField>
            </div>
            <div style={grid2}>
              <PayToggle on={d.hasKids} onChange={(v) => set("hasKids", v)} label="Has children" sub="Qualified children affect the tax bands" />
              {d.hasKids ? (
                <PayField label="Qualified children"><input type="number" min="0" max="8" className="pay-input" value={d.children} onChange={(e) => set("children", Math.max(0, +e.target.value || 0))} /></PayField>
              ) : <div />}
            </div>
            <PayField label="Employment type"><PaySeg value={d.type} onChange={(v) => set("type", v)} options={[{ value: "Full-time", label: "Full-time" }, { value: "Part-time", label: "Part-time" }, { value: "Casual", label: "Casual" }]} /></PayField>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={grid2}>
              <PayField label="Tax rate election (FS4)" hint="Married rates require a joint computation election">
                <select className="pay-select" value={d.taxCat} onChange={(e) => set("taxCat", e.target.value)}>
                  <option value="single">Single rates</option>
                  <option value="married">Married rates</option>
                  <option value="parent">Parent rates</option>
                </select>
              </PayField>
              <PayField label="Qualified children (for tax bands)">
                <input type="number" min="0" max="8" className="pay-input" value={d.hasKids ? d.children : 0} disabled={!d.hasKids} onChange={(e) => set("children", Math.max(0, +e.target.value || 0))} style={{ opacity: d.hasKids ? 1 : .5 }} />
              </PayField>
            </div>
            <PayField label="Social Security status">
              <select className="pay-select" value={d.sscStatus} onChange={(e) => set("sscStatus", e.target.value)}>
                <option value="standard">Standard Class 1 employee</option>
                <option value="exempt-pensioner">Pensioner in employment</option>
                <option value="second-employment">Second / part-time employment</option>
              </select>
            </PayField>
            <div style={grid2}>
              <PayToggle on={d.student} onChange={(v) => set("student", v)} label="Student worker" sub="10% SSC capped (Category E / F)" />
              <PayToggle on={d.otOptOut} onChange={(v) => set("otOptOut", v)} label="Opt out of 15% overtime tax" sub="Overtime taxed at main rates instead" />
            </div>
            <PayField label="Sick benefit rate">
              <PaySeg value={d.sickRate} onChange={(v) => set("sickRate", v)} options={[{ value: "full", label: "Full rate" }, { value: "half", label: "Half rate" }, { value: "none", label: "Not entitled" }]} />
            </PayField>
            <WizHelper d={d} />
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={grid2}>
              <PayField label="Salary amount (€)"><input type="number" min="0" className="pay-input" value={d.salary.amount} onChange={(e) => setS("amount", e.target.value)} placeholder="e.g. 28000" /></PayField>
              <PayField label="Frequency">
                <select className="pay-select" value={d.salary.freq} onChange={(e) => setS("freq", e.target.value)}>
                  <option value="annual">Annual</option><option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option><option value="hourly">Hourly</option>
                </select>
              </PayField>
            </div>
            <div style={grid2}>
              <PayField label="Hours per week" hint="Used to annualise hourly rates"><input type="number" min="1" max="60" className="pay-input" value={d.salary.hours} onChange={(e) => setS("hours", e.target.value)} /></PayField>
              <div />
            </div>
            {preview ? (
              <div style={{ background: "var(--surface-deep)", border: "1px solid var(--hairline-dark)", borderRadius: "var(--r-md)", padding: "16px 18px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--stone)", marginBottom: 12 }}>Live monthly preview</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                  {[["Gross", preview.gross], ["Income tax", -preview.tax], ["SSC (Cat " + preview.sscCat + ")", -preview.eeSSC], ["Net pay", preview.net]].map(([k, v], i) => (
                    <div key={k}>
                      <div style={{ fontSize: 11.5, color: "var(--stone)", marginBottom: 3, whiteSpace: "nowrap" }}>{k}</div>
                      <div style={{ fontSize: 16.5, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: i === 3 ? "var(--accent-teal)" : v < 0 ? "var(--on-dark-mute)" : "#fff" }}>{v < 0 ? "−" + PayCalc.fmtE(-v) : PayCalc.fmtE(v)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : <WizHelper d={d} />}
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <PayField label="Account holder name"><input className="pay-input" value={d.bank.accountName} onChange={(e) => setB("accountName", e.target.value)} placeholder={`${d.first || "Employee"} ${d.last || ""}`.trim()} /></PayField>
            <div style={grid2}>
              <PayField label="Bank"><input className="pay-input" value={d.bank.bankName} onChange={(e) => setB("bankName", e.target.value)} placeholder="e.g. Bank of Valletta" /></PayField>
              <PayField label="IBAN" hint="SEPA credit transfer on pay day"><input className="pay-input" value={d.bank.iban} onChange={(e) => setB("iban", e.target.value.toUpperCase())} placeholder="MT84 VALL 2201 3000 0000 4002 5486 301" /></PayField>
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <PayCard pad={16} style={{ background: "var(--surface-deep)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--stone)", marginBottom: 10 }}>Employee</div>
                {[["Name", `${d.first} ${d.last}`], ["Date of birth", d.dob], ["Status", d.marital + (d.hasKids ? ` · ${d.children} child${d.children === 1 ? "" : "ren"}` : "")], ["Type", d.type + (d.role ? " · " + d.role : "")], ["Bank", d.bank.bankName || "—"], ["IBAN", d.bank.iban ? "····" + d.bank.iban.replace(/\s/g, "").slice(-4) : "—"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "5px 0", fontSize: 13.5 }}>
                    <span style={{ color: "var(--stone)" }}>{k}</span><span style={{ color: "#fff", fontWeight: 600, textAlign: "right", textTransform: k === "Status" ? "capitalize" : "none" }}>{v}</span>
                  </div>
                ))}
              </PayCard>
              <PayCard pad={16} style={{ background: "var(--surface-deep)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--stone)", marginBottom: 10 }}>Monthly payroll (computed)</div>
                {preview && [["Gross", preview.gross], ["Income tax — " + preview.taxLabel, -preview.tax], ["Employee SSC — Cat " + preview.sscCat, -preview.eeSSC], ["Net pay", preview.net], ["Employer SSC", preview.erSSC], ["Maternity fund", preview.maternity], ["Total employer cost", preview.employerCost]].map(([k, v], i) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "5px 0", fontSize: 13.5, borderTop: i === 3 || i === 6 ? "1px solid var(--divider-soft)" : "none" }}>
                    <span style={{ color: "var(--stone)" }}>{k}</span>
                    <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color: i === 3 ? "var(--accent-teal)" : i === 6 ? "var(--primary-bright)" : "#fff" }}>{v < 0 ? "−" + PayCalc.fmtE(-v) : PayCalc.fmtE(v)}</span>
                  </div>
                ))}
                {!preview && <div style={{ fontSize: 13, color: "var(--stone)" }}>Complete the salary step to see the computation.</div>}
              </PayCard>
            </div>
            <WizHelper d={d} />
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 26, paddingTop: 18, borderTop: "1px solid var(--divider-soft)" }}>
          <PayBtn variant="ghost" onClick={() => (step === 0 ? onClose() : setStep(step - 1))}>{step === 0 ? "Cancel" : <><Icon name="arrow-left" size={15} color="#fff" /> Back</>}</PayBtn>
          {step < 4 ? (
            <PayBtn variant="primary" disabled={!valid} onClick={() => setStep(step + 1)}>Continue <Icon name="arrow-right" size={15} color={valid ? "#000" : "var(--stone)"} /></PayBtn>
          ) : (
            <PayBtn variant="cobalt" onClick={save}><Icon name="user-check" size={16} color="#fff" /> Confirm & add employee</PayBtn>
          )}
        </div>
      </div>
    </div>
  );
}

export {  WizardModal, WIZ_STEPS  };
