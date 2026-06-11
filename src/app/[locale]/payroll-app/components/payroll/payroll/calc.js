// calc.js — Malta payroll engine, 2026 government rates. Plain JS (no JSX).
// All figures computed live from these tables; no hardcoded results.

(function () {
  // ---- Income tax (FSS) — annual bands: [from, to, rate, subtract] ----
  const TAX_TABLES = {
    single: [[0, 12000, 0, 0], [12001, 16000, .15, 1800], [16001, 60000, .25, 3400], [60001, Infinity, .35, 9400]],
    married0: [[0, 15000, 0, 0], [15001, 23000, .15, 2250], [23001, 60000, .25, 4550], [60001, Infinity, .35, 10550]],
    married1: [[0, 17500, 0, 0], [17501, 26500, .15, 2625], [26501, 60000, .25, 5275], [60001, Infinity, .35, 11275]],
    married2: [[0, 22500, 0, 0], [22501, 32000, .15, 3375], [32001, 60000, .25, 6575], [60001, Infinity, .35, 12575]],
    parent0: [[0, 13000, 0, 0], [13001, 17500, .15, 1950], [17501, 60000, .25, 3700], [60001, Infinity, .35, 9700]],
    parent1: [[0, 14500, 0, 0], [14501, 21000, .15, 2175], [21001, 60000, .25, 4275], [60001, Infinity, .35, 10275]],
    parent2: [[0, 18500, 0, 0], [18501, 25500, .15, 2775], [25501, 60000, .25, 5325], [60001, Infinity, .35, 11325]],
  };

  const TAX_LABELS = {
    single: "Single rates", married0: "Married rates", married1: "Married rates (+1 child)",
    married2: "Married rates (+2 children)", parent0: "Parent rates", parent1: "Parent rates (+1 child)",
    parent2: "Parent rates (+2 children)",
  };

  const MIN_WAGE_WEEKLY = 229.44;
  const MATERNITY_RATE = 0.003; // employer-only "Maternity fund" placeholder

  // Tax table key from FS4 election + qualified children
  function taxKey(taxCat, children) {
    if (taxCat === "single") return "single";
    const n = Math.min(Math.max(children || 0, 0), 2);
    return taxCat + n;
  }

  // Annual income tax from annual chargeable income
  function annualTax(annual, key) {
    const table = TAX_TABLES[key] || TAX_TABLES.single;
    const band = table.find(([from, to]) => annual >= from && annual <= to) || table[table.length - 1];
    return Math.max(0, annual * band[2] - band[3]);
  }
  function taxBandInfo(annual, key) {
    const table = TAX_TABLES[key] || TAX_TABLES.single;
    const band = table.find(([from, to]) => annual >= from && annual <= to) || table[table.length - 1];
    return { rate: band[2], subtract: band[3], from: band[0], to: band[1] };
  }

  // Annual basic salary from amount + frequency
  function annualBasic(salary) {
    const a = parseFloat(salary.amount) || 0;
    const h = parseFloat(salary.hours) || 40;
    switch (salary.freq) {
      case "annual": return a;
      case "monthly": return a * 12;
      case "weekly": return a * 52;
      case "hourly": return a * h * 52;
      default: return a;
    }
  }

  // Age on a given date from ISO dob
  function ageOn(dob, onDate) {
    const d = new Date(dob), o = onDate || new Date(2026, 0, 1);
    let age = o.getFullYear() - d.getFullYear();
    const m = o.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && o.getDate() < d.getDate())) age--;
    return isNaN(age) ? 0 : age;
  }

  // ---- SSC Class 1 — weekly contribution (employee AND employer each) ----
  // Returns { cat, weekly, desc }
  function sscWeekly(emp, weekly) {
    const w = weekly;
    const age = ageOn(emp.dob);
    const bornYear = new Date(emp.dob).getFullYear() || 1990;
    if (emp.student) {
      if (age < 18) return { cat: "E", weekly: Math.min(.10 * w, 4.38), desc: "Student worker under 18 — 10% capped at €4.38" };
      return { cat: "F", weekly: Math.min(.10 * w, 7.94), desc: "Student worker 18+ — 10% capped at €7.94" };
    }
    if (w <= MIN_WAGE_WEEKLY) {
      if (age < 18) return { cat: "A", weekly: 6.62, desc: "Under 18, basic weekly wage ≤ €229.44 — fixed €6.62" };
      return { cat: "B", weekly: 22.94, desc: "18+, basic weekly wage ≤ €229.44 — fixed €22.94" };
    }
    if (bornYear >= 1962) {
      if (w <= 559.30) return { cat: "C2", weekly: .10 * w, desc: "Born 1962+, wage €229.45–€559.30 — 10% of basic weekly wage" };
      return { cat: "D2", weekly: 54.43, desc: "Born 1962+, wage above €559.30 — fixed €54.43" };
    }
    if (w <= 490.38) return { cat: "C1", weekly: .10 * w, desc: "Born ≤1961, wage €229.45–€490.38 — 10% of basic weekly wage" };
    return { cat: "D1", weekly: 45.19, desc: "Born ≤1961, wage above €490.38 — fixed €45.19" };
  }

  // ---- Full monthly computation for one employee ----
  function computePay(emp) {
    const annual = annualBasic(emp.salary);
    const key = taxKey(emp.taxCat, emp.children);
    const tAnnual = annualTax(annual, key);
    const weekly = annual / 52;
    const ssc = sscWeekly(emp, weekly);
    const grossM = annual / 12;
    const taxM = tAnnual / 12;
    const sscM = ssc.weekly * 52 / 12;
    const matM = MATERNITY_RATE * weekly * 52 / 12;
    const net = grossM - taxM - sscM;
    return {
      annual, weekly, taxKey: key, taxLabel: TAX_LABELS[key],
      band: taxBandInfo(annual, key),
      annualTax: tAnnual,
      gross: grossM, tax: taxM,
      eeSSC: sscM, erSSC: sscM, sscCat: ssc.cat, sscDesc: ssc.desc, sscWeekly: ssc.weekly,
      maternity: matM,
      net, employerCost: grossM + sscM + matM,
    };
  }

  const fmtE = (n) => "€" + (Math.round((n + Number.EPSILON) * 100) / 100).toLocaleString("en-MT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtE0 = (n) => "€" + Math.round(n).toLocaleString("en-MT");

  window.PayCalc = { TAX_TABLES, TAX_LABELS, MIN_WAGE_WEEKLY, taxKey, annualTax, taxBandInfo, annualBasic, ageOn, sscWeekly, computePay, fmtE, fmtE0 };
})();
