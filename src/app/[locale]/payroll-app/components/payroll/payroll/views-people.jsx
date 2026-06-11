// views-people.jsx — People table + Employee detail (tabs). Requires calc.js, ui.jsx.

function PeopleView({ employees, openEmployee, openWizard }) {
  const C = window.PayCalc;
  return (
    <div className="pay-fade" data-screen-label="People">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ fontSize: 13.5, color: "var(--stone)" }}>{employees.length} employee{employees.length === 1 ? "" : "s"} on the books</div>
        <PayBtn variant="cobalt" onClick={openWizard}><Icon name="user-plus" size={16} color="#fff" /> Add employee</PayBtn>
      </div>
      <PayCard pad={0}>
        <div className="pay-scroll" style={{ overflowX: "auto" }}>
          <table className="pay-table">
            <thead><tr><th>Name</th><th>Date of birth</th><th>Employment</th><th>Role</th><th>Tax status</th><th className="num">Salary</th><th className="num">SSC cat</th><th></th></tr></thead>
            <tbody>
              {employees.map((e) => {
                const p = C.computePay(e);
                return (
                  <tr key={e.id} className="pay-rowlink" onClick={() => openEmployee(e.id)}>
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <span style={{ width: 32, height: 32, borderRadius: "var(--r-full)", background: "rgba(73,79,223,.2)", display: "grid", placeItems: "center", fontSize: 11.5, fontWeight: 700, color: "var(--primary-bright)", flexShrink: 0 }}>{e.first[0]}{e.last[0]}</span>
                        <span style={{ fontWeight: 600 }}>{e.first} {e.last}</span>
                        {e.student && <PayChip tone="warn">Student</PayChip>}
                      </span>
                    </td>
                    <td style={{ color: "var(--on-dark-mute)" }}>{e.dob}</td>
                    <td style={{ color: "var(--on-dark-mute)" }}>{e.type}</td>
                    <td style={{ color: "var(--on-dark-mute)" }}>{e.role}</td>
                    <td><PayChip tone="cobalt">{p.taxLabel}</PayChip></td>
                    <td className="num" style={{ fontWeight: 600 }}>{C.fmtE0(p.annual)}<span style={{ color: "var(--stone)", fontWeight: 400 }}>/yr</span></td>
                    <td className="num"><PayChip>{p.sscCat}</PayChip></td>
                    <td className="num"><Icon name="chevron-right" size={16} color="var(--stone)" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PayCard>
    </div>
  );
}

const EMP_TABS = ["Personal", "Tax", "Salary", "Payslips", "Tax Forms"];

function EmployeeDetail({ emp, runs, back, openPayslip }) {
  const C = window.PayCalc;
  const [tab, setTab] = React.useState("Personal");
  const p = C.computePay(emp);
  const slips = runs.filter((r) => r.rows.some((x) => x.empId === emp.id));
  const kv = (k, v, cap) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "11px 0", borderBottom: "1px solid var(--divider-soft)", fontSize: 14 }}>
      <span style={{ color: "var(--stone)" }}>{k}</span><span style={{ color: "#fff", fontWeight: 600, textAlign: "right", textTransform: cap ? "capitalize" : "none" }}>{v}</span>
    </div>
  );
  return (
    <div className="pay-fade" data-screen-label="Employee detail">
      <button onClick={back} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "none", border: 0, cursor: "pointer", color: "var(--on-dark-mute)", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600, padding: 0, marginBottom: 18 }}><Icon name="arrow-left" size={15} color="currentColor" /> All people</button>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
        <span style={{ width: 52, height: 52, borderRadius: "var(--r-full)", background: "rgba(73,79,223,.2)", display: "grid", placeItems: "center", fontSize: 17, fontWeight: 700, color: "var(--primary-bright)" }}>{emp.first[0]}{emp.last[0]}</span>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 26, letterSpacing: "-.4px", color: "#fff", margin: 0 }}>{emp.first} {emp.last}</h2>
          <div style={{ fontSize: 13.5, color: "var(--stone)", marginTop: 3 }}>{emp.role} · {emp.type} · Net {C.fmtE(p.net)}/month</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {EMP_TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ height: 36, padding: "0 16px", borderRadius: "var(--r-full)", border: 0, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600, background: tab === t ? "#fff" : "var(--surface-elevated)", color: tab === t ? "#000" : "var(--on-dark-mute)", transition: "all .15s" }}>{t}</button>
        ))}
      </div>

      {tab === "Personal" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="pay-two">
          <PayCard title="Personal details" icon="user">
            {kv("Full name", `${emp.first} ${emp.last}`)}
            {kv("Date of birth", `${emp.dob} (age ${C.ageOn(emp.dob)})`)}
            {kv("Gender", emp.gender, true)}
            {kv("Marital status", emp.marital, true)}
            {kv("Children", emp.children > 0 ? `${emp.children} qualified` : "None")}
            {kv("Employment", emp.type)}
          </PayCard>
          <PayCard title="Bank details" icon="wallet">
            {kv("Account holder", emp.bank.accountName || `${emp.first} ${emp.last}`)}
            {kv("Bank", emp.bank.bankName || "—")}
            {kv("IBAN", emp.bank.iban || "—")}
            {kv("Payment method", "SEPA credit transfer")}
          </PayCard>
        </div>
      )}

      {tab === "Tax" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="pay-two">
          <PayCard title="FS4 tax profile" icon="landmark">
            {kv("Tax rate election", p.taxLabel)}
            {kv("Current band", `${Math.round(p.band.rate * 100)}% (subtract €${p.band.subtract.toLocaleString()})`)}
            {kv("Annual income tax", C.fmtE(p.annualTax))}
            {kv("Monthly FSS deduction", C.fmtE(p.tax))}
            {kv("Overtime 15% rate", emp.otOptOut ? "Opted out" : "Applies")}
            {kv("Sick benefit rate", emp.sickRate, true)}
          </PayCard>
          <PayCard title="Social security" icon="shield-check">
            {kv("SSC category", `Category ${p.sscCat}`)}
            {kv("Rule", p.sscDesc)}
            {kv("Weekly contribution", C.fmtE(p.sscWeekly))}
            {kv("Monthly (employee)", C.fmtE(p.eeSSC))}
            {kv("Monthly (employer)", C.fmtE(p.erSSC))}
            {kv("Maternity fund (employer)", C.fmtE(p.maternity) + "/month")}
          </PayCard>
        </div>
      )}

      {tab === "Salary" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="pay-two">
          <PayCard title="Contract" icon="file-text">
            {kv("Salary", `${C.fmtE(parseFloat(emp.salary.amount) || 0)} / ${emp.salary.freq}`)}
            {kv("Hours per week", emp.salary.hours)}
            {kv("Annual basic", C.fmtE(p.annual))}
            {kv("Basic weekly wage", C.fmtE(p.weekly))}
          </PayCard>
          <PayCard title="Monthly computation" icon="calculator">
            {kv("Gross", C.fmtE(p.gross))}
            {kv("Income tax (FSS)", "−" + C.fmtE(p.tax))}
            {kv("Employee SSC", "−" + C.fmtE(p.eeSSC))}
            {kv("Net pay", C.fmtE(p.net))}
            {kv("Total employer cost", C.fmtE(p.employerCost))}
          </PayCard>
        </div>
      )}

      {tab === "Payslips" && (
        <PayCard pad={0}>
          {slips.length === 0 ? (
            <PayEmpty icon="receipt-text" title="No payslips yet" sub="Approve a payroll run for a month that includes this employee and the payslip will appear here." />
          ) : (
            <table className="pay-table">
              <thead><tr><th>Period</th><th className="num">Gross</th><th className="num">Tax</th><th className="num">SSC</th><th className="num">Net</th><th></th></tr></thead>
              <tbody>
                {slips.map((r) => {
                  const row = r.rows.find((x) => x.empId === emp.id);
                  return (
                    <tr key={r.id} className="pay-rowlink" onClick={() => openPayslip(r.id, emp.id)}>
                      <td style={{ fontWeight: 600 }}>{PAY_MONTHS[r.monthIdx]} {r.year}</td>
                      <td className="num">{C.fmtE(row.gross)}</td>
                      <td className="num" style={{ color: "var(--on-dark-mute)" }}>−{C.fmtE(row.tax)}</td>
                      <td className="num" style={{ color: "var(--on-dark-mute)" }}>−{C.fmtE(row.eeSSC)}</td>
                      <td className="num" style={{ fontWeight: 700, color: "var(--accent-teal)" }}>{C.fmtE(row.net)}</td>
                      <td className="num"><PayChip tone="green">View payslip</PayChip></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </PayCard>
      )}

      {tab === "Tax Forms" && (
        <PayCard pad={0}>
          {slips.length === 0 ? (
            <PayEmpty icon="file-text" title="No forms yet" sub="The FS3 annual statement builds from this employee's approved payroll runs." />
          ) : (
            <table className="pay-table">
              <thead><tr><th>Form</th><th>Period</th><th className="num">Emoluments</th><th className="num">Tax deducted</th><th className="num">SSC</th><th></th></tr></thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>FS3 — Statement of earnings</td>
                  <td style={{ color: "var(--on-dark-mute)" }}>Year 2026 ({slips.length} month{slips.length === 1 ? "" : "s"})</td>
                  <td className="num">{C.fmtE(slips.reduce((s, r) => s + r.rows.find((x) => x.empId === emp.id).gross, 0))}</td>
                  <td className="num">{C.fmtE(slips.reduce((s, r) => s + r.rows.find((x) => x.empId === emp.id).tax, 0))}</td>
                  <td className="num">{C.fmtE(slips.reduce((s, r) => s + r.rows.find((x) => x.empId === emp.id).eeSSC, 0))}</td>
                  <td className="num"><PayChip tone="cobalt">Due 15 Feb 2027</PayChip></td>
                </tr>
              </tbody>
            </table>
          )}
        </PayCard>
      )}
    </div>
  );
}

Object.assign(window, { PeopleView, EmployeeDetail });
