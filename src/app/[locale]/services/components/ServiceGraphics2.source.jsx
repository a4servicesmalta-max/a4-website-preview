// ServiceGraphics2.jsx — per-service animated mini-mockups (part 2).
// Requires ServiceGraphics1.jsx (shared SGFrame/SGHead/SGChip/useSGPhase helpers).

// ---- Advisory & Growth: KPI dashboard ticking up ----
function SGKPI() {
  const p = useSGPhase(4, 1600);
  const kpis = [
    { n: "Revenue YTD", v: ["€148k", "€162k", "€175k", "€182k"][p], w: [62, 70, 78, 84][p], up: "+12%" },
    { n: "Gross margin", v: ["38%", "39%", "40%", "41%"][p], w: [55, 58, 61, 64][p], up: "+3pts" },
    { n: "Cash runway", v: ["71 days", "80 days", "88 days", "94 days"][p], w: [48, 58, 66, 72][p], up: "+23d" },
  ];
  return (
    <SGFrame title="client.a4.com.mt · performance">
      <SGHead icon="line-chart" right={<span style={sgSub}>Q4 board pack</span>}>KPI dashboard</SGHead>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {kpis.map((k) => (
          <div key={k.n}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={sgSub}>{k.n}</span>
              <span><span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 19, color: "#fff", letterSpacing: "-.2px" }}>{k.v}</span> <span style={{ ...sgSub, color: "var(--accent-teal)", fontWeight: 700 }}>{k.up}</span></span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: "var(--surface-deep)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${k.w}%`, borderRadius: 999, background: "var(--primary)", transition: "width .9s cubic-bezier(.2,.7,.2,1)" }}></div>
            </div>
          </div>
        ))}
      </div>
    </SGFrame>
  );
}

// ---- Company Structure: shareholding diagram ----
function SGOrg() {
  const p = useSGPhase(4, 1400);
  const node = (label, sub, on) => (
    <div style={{ textAlign: "center", padding: "10px 12px", borderRadius: "var(--r-md)", background: "var(--surface-deep)", border: `1px solid ${on ? "rgba(73,79,223,.5)" : "var(--hairline-dark)"}`, opacity: on ? 1 : 0.4, transition: "all .5s", minWidth: 116 }}>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>{label}</div>
      <div style={sgSub}>{sub}</div>
    </div>
  );
  return (
    <SGFrame title="client.a4.com.mt · structure">
      <SGHead icon="git-branch" right={p >= 3 ? <SGChip>MBR filings up to date</SGChip> : <span style={sgSub}>Updating…</span>}>Group structure</SGHead>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: 196 }}>
        {node("Borg Holdings Ltd", "Parent · C 88410", p >= 1)}
        <div style={{ display: "flex", gap: 64, height: 26, alignItems: "stretch" }}>
          <div style={{ width: 1, background: p >= 2 ? "var(--primary-bright)" : "#3a3d40", transition: "background .5s" }}></div>
          <div style={{ width: 1, background: p >= 2 ? "var(--primary-bright)" : "#3a3d40", transition: "background .5s" }}></div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <div>
            <div style={{ textAlign: "center", ...sgSub, fontWeight: 700, color: p >= 2 ? "var(--primary-bright)" : "var(--stone)", marginBottom: 4 }}>60%</div>
            {node("Borg Retail Ltd", "Subsidiary", p >= 2)}
          </div>
          <div>
            <div style={{ textAlign: "center", ...sgSub, fontWeight: 700, color: p >= 2 ? "var(--primary-bright)" : "var(--stone)", marginBottom: 4 }}>40%</div>
            {node("Borg Property Ltd", "Subsidiary", p >= 2)}
          </div>
        </div>
        <div style={{ ...sgSub, marginTop: 14, opacity: p >= 3 ? 1 : 0, transition: "opacity .5s" }}>Share transfer registered · Form T filed</div>
      </div>
    </SGFrame>
  );
}

// ---- Liquidation & Wind-Down: closure checklist → strike-off ----
function SGStrikeOff() {
  const items = ["Final accounts approved", "Tax clearance received", "VAT number deregistered"];
  const p = useSGPhase(items.length + 2, 1400);
  const done = p > items.length;
  return (
    <SGFrame title="client.a4.com.mt · wind-down">
      <SGHead icon="power" right={<span style={sgSub}>Members' voluntary</span>}>Company closure</SGHead>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, minHeight: 196 }}>
        {items.map((n, i) => {
          const d = i < p;
          return (
            <div key={n} style={{ ...sgRow, opacity: d ? 1 : 0.45, transition: "opacity .4s" }}>
              <Icon name={d ? "check-circle" : "circle"} size={16} color={d ? "var(--accent-teal)" : "var(--stone)"} />
              <span style={sgName}>{n}</span>
              {d && <SGChip>Done</SGChip>}
            </div>
          );
        })}
        <div style={{ ...sgRow, justifyContent: "center", background: done ? "rgba(0,160,130,.12)" : "var(--surface-deep)", borderColor: done ? "rgba(0,160,130,.4)" : "var(--hairline-dark)", transition: "all .5s" }}>
          {done ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8, ...sgRise() }}><Icon name="badge-check" size={17} color="var(--accent-teal)" /><span style={{ ...sgName, flex: "none", color: "var(--accent-teal)", fontWeight: 700 }}>Struck off the register — MBR</span></span> : <span style={sgSub}>Strike-off pending clearances…</span>}
        </div>
      </div>
    </SGFrame>
  );
}

// ---- International Structures: multi-jurisdiction nodes ----
function SGJurisdictions() {
  const pins = [
    { code: "IE", n: "Dublin TradeCo", x: 8, y: 8 },
    { code: "DE", n: "Berlin GmbH", x: 64, y: 4 },
    { code: "AE", n: "Dubai FZE", x: 70, y: 64 },
  ];
  const p = useSGPhase(pins.length + 2, 1400);
  return (
    <SGFrame title="client.a4.com.mt · structures">
      <SGHead icon="globe" right={p > pins.length ? <SGChip>Substance documented</SGChip> : <span style={sgSub}>{Math.min(p, pins.length)}/{pins.length} linked</span>}>Multi-jurisdiction group</SGHead>
      <div style={{ position: "relative", height: 210, borderRadius: "var(--r-md)", background: "var(--surface-deep)", border: "1px solid var(--hairline-dark)", overflow: "hidden" }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }} aria-hidden="true">
          {pins.map((pin, i) => i < p ? <line key={pin.code} x1="42" y1="44" x2={pin.x + 7} y2={pin.y + 10} stroke="rgba(73,79,223,.55)" strokeWidth="0.7" strokeDasharray="2 1.6" /> : null)}
        </svg>
        <div style={{ position: "absolute", left: "32%", top: "36%", textAlign: "center", padding: "9px 13px", borderRadius: "var(--r-md)", background: "rgba(73,79,223,.16)", border: "1px solid rgba(73,79,223,.5)" }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>Malta HoldCo</div>
          <div style={sgSub}>Hub · substance</div>
        </div>
        {pins.map((pin, i) => (
          <div key={pin.code} style={{ position: "absolute", left: `${pin.x}%`, top: `${pin.y}%`, display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, background: "#1c1e22", border: "1px solid var(--hairline-dark)", opacity: i < p ? 1 : 0, transform: i < p ? "none" : "translateY(6px)", transition: "all .5s" }}>
            <span style={{ width: 18, height: 18, borderRadius: 999, background: "var(--surface-elevated)", display: "grid", placeItems: "center", fontFamily: "var(--font-body)", fontSize: 8.5, fontWeight: 800, color: "var(--primary-bright)" }}>{pin.code}</span>
            <span style={{ ...sgSub, color: "#fff", fontWeight: 600, whiteSpace: "nowrap" }}>{pin.n}</span>
          </div>
        ))}
      </div>
    </SGFrame>
  );
}

// ---- Group & Consolidation: entities merge into one statement ----
function SGConsolidate() {
  const p = useSGPhase(4, 1500);
  const ent = (n, on) => (
    <div style={{ flex: 1, textAlign: "center", padding: "9px 6px", borderRadius: "var(--r-md)", background: "var(--surface-deep)", border: "1px solid var(--hairline-dark)", opacity: on ? 1 : 0.4, transition: "opacity .5s" }}>
      <Icon name="building-2" size={14} color="var(--primary-bright)" style={{ margin: "0 auto 4px" }} />
      <div style={{ ...sgSub, color: "#fff", fontWeight: 600, whiteSpace: "nowrap" }}>{n}</div>
    </div>
  );
  return (
    <SGFrame title="client.a4.com.mt · consolidation">
      <SGHead icon="boxes" right={<span style={sgSub}>FY 2025</span>}>Group consolidation</SGHead>
      <div style={{ display: "flex", gap: 9 }}>
        {ent("A Ltd", p >= 1)}{ent("B Ltd", p >= 1)}{ent("C GmbH", p >= 1)}
      </div>
      <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
        <Icon name="arrow-down" size={16} color={p >= 2 ? "var(--primary-bright)" : "var(--stone)"} style={{ transition: "color .4s" }} />
      </div>
      <div style={{ ...sgRow, flexDirection: "column", alignItems: "stretch", gap: 7, borderColor: p >= 2 ? "rgba(73,79,223,.5)" : "var(--hairline-dark)", transition: "border-color .5s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Icon name="file-check-2" size={16} color="var(--primary-bright)" />
          <span style={sgName}>Consolidated FS — IFRS</span>
          {p >= 3 && <SGChip>Eliminations posted</SGChip>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", opacity: p >= 2 ? 1 : 0.4, transition: "opacity .4s" }}>
          <span style={sgSub}>Group revenue</span><span style={{ ...sgSub, color: "#fff", fontWeight: 700 }}>€4.82m</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", opacity: p >= 2 ? 1 : 0.4, transition: "opacity .4s" }}>
          <span style={sgSub}>Intercompany eliminated</span><span style={{ ...sgSub, color: "#fff", fontWeight: 700 }}>−€612k</span>
        </div>
      </div>
    </SGFrame>
  );
}

// ---- Banking & Payments: bank feeds / confirmations ----
function SGBankFeed() {
  const rows = [
    { icon: "arrow-down-left", n: "SEPA in — Borg Holdings", a: "€4,200.00", c: "Cleared" },
    { icon: "credit-card", n: "Card settlement — POS", a: "€913.40", c: "Cleared" },
    { icon: "arrow-up-right", n: "EMI payout — Revolut Bus.", a: "€2,050.00", c: "Confirmed" },
    { icon: "arrow-down-left", n: "FX in — GBP → EUR", a: "€1,318.77", c: "Cleared" },
  ];
  const p = useSGPhase(rows.length + 2, 1200);
  return (
    <SGFrame title="client.a4.com.mt · banking">
      <SGHead icon="wallet" right={<span style={sgSub}>3 accounts</span>}>Live bank feeds</SGHead>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, minHeight: 232 }}>
        {rows.slice(0, Math.max(p, 1)).map((r) => (
          <div key={r.n} style={{ ...sgRow, ...sgRise(0.04) }}>
            <Icon name={r.icon} size={16} color="var(--primary-bright)" />
            <span style={{ flex: 1, minWidth: 0 }}><span style={sgName}>{r.n}</span><br /><span style={sgSub}>{r.a}</span></span>
            <SGChip>{r.c}</SGChip>
          </div>
        ))}
      </div>
    </SGFrame>
  );
}

// ---- Crypto & Digital Assets: wallet balances ----
function SGWallet() {
  const p = useSGPhase(4, 1500);
  const rows = [
    { sym: "BTC", n: "Cold wallet", q: "1.2481", v: "€82,410" },
    { sym: "ETH", n: "Treasury", q: "18.05", v: "€58,920" },
    { sym: "EURC", n: "Operating", q: "25,000", v: "€25,000" },
  ];
  return (
    <SGFrame title="client.a4.com.mt · digital assets">
      <SGHead icon="bitcoin" right={p >= 3 ? <SGChip>Custody verified</SGChip> : <span style={sgSub}>Reconciling…</span>}>Digital-asset balances</SGHead>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {rows.map((r, i) => (
          <div key={r.sym} style={{ ...sgRow, opacity: p >= 1 ? 1 : 0.45, transition: `opacity .4s ${i * 0.12}s` }}>
            <span style={{ width: 26, height: 26, borderRadius: 999, background: "rgba(73,79,223,.16)", display: "grid", placeItems: "center", fontFamily: "var(--font-body)", fontSize: 8.5, fontWeight: 800, color: "var(--primary-bright)", flexShrink: 0 }}>{r.sym}</span>
            <span style={{ flex: 1, minWidth: 0 }}><span style={sgName}>{r.q} {r.sym}</span><br /><span style={sgSub}>{r.n}</span></span>
            <span style={{ ...sgSub, color: "#fff", fontWeight: 700 }}>{r.v}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 11, borderTop: "1px solid var(--divider-soft)" }}>
          <span style={sgSub}>Total · period-end valuation</span>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 17, color: "#fff", letterSpacing: "-.2px" }}>{p >= 2 ? "€166,330" : "—"}</span>
        </div>
      </div>
    </SGFrame>
  );
}

// ---- Corporate Transactions: deal-completion tracker ----
function SGDeal() {
  const p = useSGPhase(5, 1500);
  const rows = [
    { n: "Quality of earnings review", k: 1 },
    { n: "Working capital & net debt", k: 2 },
    { n: "SPA accounting input", k: 3 },
    { n: "Completion accounts", k: 4 },
  ];
  return (
    <SGFrame title="client.a4.com.mt · transactions">
      <SGHead icon="briefcase" right={p >= 4 ? <SGChip>Deal completed</SGChip> : <span style={sgSub}>Project Harbour</span>}>Due-diligence tracker</SGHead>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, minHeight: 218 }}>
        {rows.map((r) => {
          const done = p >= r.k, now = p === r.k - 1;
          return (
            <div key={r.n} style={{ ...sgRow, opacity: done || now ? 1 : 0.45, transition: "opacity .4s" }}>
              <Icon name={done ? "check-circle" : now ? "loader" : "circle"} size={16} color={done ? "var(--accent-teal)" : now ? "var(--primary-bright)" : "var(--stone)"} />
              <span style={sgName}>{r.n}</span>
              {done ? <SGChip>Complete</SGChip> : now ? <span style={{ ...sgSub, color: "var(--primary-bright)", fontWeight: 700 }}>In progress</span> : <span style={sgSub}>Pending</span>}
            </div>
          );
        })}
      </div>
    </SGFrame>
  );
}

window.SERVICE_GRAPHICS = Object.assign(window.SERVICE_GRAPHICS || {}, {
  "advisory-growth": SGKPI,
  "company-structure": SGOrg,
  "liquidation-winddown": SGStrikeOff,
  "international-structures": SGJurisdictions,
  "group-consolidation": SGConsolidate,
  "banking-payments": SGBankFeed,
  "crypto-digital-assets": SGWallet,
  "corporate-transactions": SGDeal,
});
