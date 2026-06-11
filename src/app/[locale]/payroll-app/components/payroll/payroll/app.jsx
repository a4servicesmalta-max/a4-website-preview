// app.jsx — Malta Payroll prototype root: state, routing, persistence.
const { useState: useAppState, useEffect: useAppEffect } = React;

const PAY_SEED = [
  { id: "emp-1", first: "Maria", last: "Borg", dob: "1985-04-12", gender: "female", marital: "married", children: 2, taxCat: "married", sscStatus: "standard", student: false, otOptOut: false, sickRate: "full", type: "Full-time", role: "Finance Manager", salary: { amount: "42000", freq: "annual", hours: 40 }, bank: { accountName: "Maria Borg", bankName: "Bank of Valletta", iban: "MT84 VALL 2201 3000 0000 4002 5486 301" } },
  { id: "emp-2", first: "Luca", last: "Vella", dob: "1996-09-03", gender: "male", marital: "single", children: 0, taxCat: "single", sscStatus: "standard", student: false, otOptOut: false, sickRate: "full", type: "Full-time", role: "Accountant", salary: { amount: "28000", freq: "annual", hours: 40 }, bank: { accountName: "Luca Vella", bankName: "APS Bank", iban: "MT22 APSB 7704 5000 0000 1102 9933 105" } },
  { id: "emp-3", first: "Sarah", last: "Camilleri", dob: "1990-01-27", gender: "female", marital: "single", children: 1, taxCat: "parent", sscStatus: "standard", student: false, otOptOut: false, sickRate: "full", type: "Part-time", role: "Payroll Officer", salary: { amount: "16", freq: "hourly", hours: 25 }, bank: { accountName: "Sarah Camilleri", bankName: "HSBC Malta", iban: "MT55 MMEB 4402 9000 0000 7710 2244 880" } },
  { id: "emp-4", first: "Jake", last: "Farrugia", dob: "2009-06-15", gender: "male", marital: "single", children: 0, taxCat: "single", sscStatus: "standard", student: true, otOptOut: false, sickRate: "full", type: "Casual", role: "Office Assistant", salary: { amount: "6.50", freq: "hourly", hours: 15 }, bank: { accountName: "Jake Farrugia", bankName: "Bank of Valletta", iban: "MT31 VALL 2201 3000 0000 8804 1177 662" } },
  { id: "emp-5", first: "Joseph", last: "Zammit", dob: "1960-11-08", gender: "male", marital: "married", children: 0, taxCat: "married", sscStatus: "standard", student: false, otOptOut: true, sickRate: "full", type: "Full-time", role: "Operations Director", salary: { amount: "65000", freq: "annual", hours: 40 }, bank: { accountName: "Joseph Zammit", bankName: "Lombard Bank", iban: "MT77 LBMA 0500 0000 0000 2201 9384 220" } },
];

const PAY_LS = "a4-payroll-proto-v1";

function PayrollApp() {
  const persisted = (() => { try { return JSON.parse(localStorage.getItem(PAY_LS)) || {}; } catch (e) { return {}; } })();
  const [employees, setEmployees] = useAppState(persisted.employees || PAY_SEED);
  const [runs, setRuns] = useAppState(persisted.runs || []);
  const [page, setPage] = useAppState("dashboard");
  const [empId, setEmpId] = useAppState(null);
  const [runId, setRunId] = useAppState(null);
  const [slip, setSlip] = useAppState(null); // {runId, empId}
  const [wizard, setWizard] = useAppState(false);
  const [monthIdx, setMonthIdx] = useAppState(persisted.monthIdx ?? 0);

  useAppEffect(() => {
    try { localStorage.setItem(PAY_LS, JSON.stringify({ employees, runs, monthIdx })); } catch (e) {}
  }, [employees, runs, monthIdx]);

  const go = (p) => { setPage(p); setEmpId(null); setRunId(null); };

  const approve = (mIdx, rows, tot) => {
    const run = {
      id: "run-" + Date.now(), monthIdx: mIdx, year: 2026,
      approvedAt: new Date().toLocaleDateString("en-MT", { day: "numeric", month: "short" }),
      rows: rows.map(({ emp, p }) => ({ empId: emp.id, name: emp.first + " " + emp.last, taxLabel: p.taxLabel, sscCat: p.sscCat, gross: p.gross, tax: p.tax, eeSSC: p.eeSSC, erSSC: p.erSSC, maternity: p.maternity, net: p.net, cost: p.employerCost })),
      totals: { gross: tot.gross, tax: tot.tax, eeSSC: tot.eeSSC, erSSC: tot.erSSC, maternity: tot.maternity, net: tot.net, cost: tot.cost },
    };
    setRuns((rs) => [...rs, run]);
    setPage("history");
  };

  const titles = { dashboard: "Dashboard", people: "People", run: "Run Payroll", history: "Payroll History", forms: "Tax Forms", reports: "Reports", settings: "Settings" };
  const emp = empId && employees.find((e) => e.id === empId);
  const run = runId && runs.find((r) => r.id === runId);
  const slipRun = slip && runs.find((r) => r.id === slip.runId);
  const slipRow = slipRun && slipRun.rows.find((x) => x.empId === slip.empId);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--canvas-dark)" }}>
      <PaySidebar page={page} go={go} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <PayTopbar title={titles[page]} monthIdx={monthIdx} setMonthIdx={setMonthIdx} />
        <main className="pay-scroll" style={{ flex: 1, overflowY: "auto", padding: "26px 28px 48px" }}>
          {page === "dashboard" && <DashboardView employees={employees} runs={runs} monthIdx={monthIdx} go={go} />}
          {page === "people" && !emp && <PeopleView employees={employees} openEmployee={setEmpId} openWizard={() => setWizard(true)} />}
          {page === "people" && emp && <EmployeeDetail emp={emp} runs={runs} back={() => setEmpId(null)} openPayslip={(r, e) => setSlip({ runId: r, empId: e })} />}
          {page === "run" && <RunPayrollView employees={employees} runs={runs} monthIdx={monthIdx} setMonthIdx={setMonthIdx} approve={approve} />}
          {page === "history" && !run && <HistoryView runs={runs} openRun={setRunId} />}
          {page === "history" && run && <RunDetail run={run} employees={employees} back={() => setRunId(null)} openPayslip={(r, e) => setSlip({ runId: r, empId: e })} />}
          {page === "forms" && <TaxFormsView employees={employees} runs={runs} />}
          {page === "reports" && <ReportsView employees={employees} runs={runs} />}
          {page === "settings" && <SettingsView />}
        </main>
      </div>
      {wizard && <WizardModal onClose={() => setWizard(false)} onSave={(e) => setEmployees((es) => [...es, e])} />}
      {slipRow && <PayslipModal run={slipRun} row={slipRow} employees={employees} onClose={() => setSlip(null)} />}
    </div>
  );
}

const payMount = () => {
  if (!window.PaySidebar || !window.WizardModal || !window.DashboardView || !window.PayCalc || !window.Icon) { setTimeout(payMount, 40); return; }
  ReactDOM.createRoot(document.getElementById("root")).render(<PayrollApp />);
};
payMount();
