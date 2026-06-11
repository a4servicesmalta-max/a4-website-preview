// ServiceGraphics1.jsx — per-service animated mini-mockups (part 1).
// Same visual language as the landing PortalMockup: dark elevated window,
// hairlines, cobalt accents, staggered a4rise entrances. All loop gently and
// respect prefers-reduced-motion (static final state).

const SG_REDUCE = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

function useSGPhase(n, ms = 1300) {
  const [p, setP] = useState(SG_REDUCE ? n - 1 : 0);
  useEffect(() => {
    if (SG_REDUCE) return;
    const id = setInterval(() => setP((v) => (v + 1) % n), ms);
    return () => clearInterval(id);
  }, []);
  return p;
}
function sgRise(d = 0) { return SG_REDUCE ? {} : { animation: "a4rise .5s cubic-bezier(.2,.7,.2,1) both", animationDelay: `${d}s` }; }

const sgRow = { display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: "var(--r-md)", background: "var(--surface-deep)", border: "1px solid var(--hairline-dark)" };
const sgName = { flex: 1, minWidth: 0, fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 500, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const sgSub = { fontFamily: "var(--font-body)", fontSize: 12, color: "var(--stone)" };
function SGChip({ color = "var(--accent-teal)", children }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".04em", color, whiteSpace: "nowrap" }}><Icon name="check" size={12} color={color} stroke={3} />{children}</span>;
}
function SGHead({ icon, children, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
      <span style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(73,79,223,.16)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name={icon} size={15} color="var(--primary-bright)" /></span>
      <span style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600, color: "#fff" }}>{children}</span>
      {right}
    </div>
  );
}
function SGFrame({ title, children }) {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 460 }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: "-12% -8% -18%", background: "radial-gradient(58% 52% at 52% 34%, rgba(73,79,223,.18), transparent 72%)", filter: "blur(24px)", pointerEvents: "none" }}></div>
      <div style={{ position: "relative", background: "var(--surface-elevated)", border: "1px solid var(--hairline-dark)", borderRadius: "var(--r-xl)", overflow: "hidden", boxShadow: "0 36px 90px -34px rgba(0,0,0,.95)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 16px", borderBottom: "1px solid var(--divider-soft)" }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: "#3a3d40" }}></span>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: "#3a3d40" }}></span>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: "#3a3d40" }}></span>
          <div style={{ flex: 1, textAlign: "center", fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--stone)", letterSpacing: ".4px" }}>{title}</div>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

// ---- Accounting & Finance: uploaded files / document capture ----
function SGUploads() {
  const files = [
    { icon: "file-text", n: "Invoice_2041.pdf", s: "€1,260.00 · Sales", c: "Posted" },
    { icon: "image", n: "Receipt_OCT-118.jpg", s: "€84.20 · Office costs", c: "Posted" },
    { icon: "file-text", n: "Statement_BOV_Oct.pdf", s: "214 lines extracted", c: "Captured" },
    { icon: "file-text", n: "Bill_Melita_Oct.pdf", s: "€45.90 · Utilities", c: "Posted" },
  ];
  const p = useSGPhase(files.length + 2);
  return (
    <SGFrame title="client.a4.com.mt · documents">
      <SGHead icon="upload-cloud" right={<span style={sgSub}>{Math.min(p, files.length)} of {files.length}</span>}>Uploaded files</SGHead>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, minHeight: 232 }}>
        {files.slice(0, Math.max(p, 1)).map((f, i) => (
          <div key={f.n} style={{ ...sgRow, ...sgRise(0.04) }}>
            <Icon name={f.icon} size={17} color="var(--primary-bright)" />
            <span style={{ flex: 1, minWidth: 0 }}><span style={sgName}>{f.n}</span><br /><span style={sgSub}>{f.s}</span></span>
            <SGChip>{f.c}</SGChip>
          </div>
        ))}
      </div>
    </SGFrame>
  );
}

// ---- Bookkeeping: live bank reconciliation ----
function SGRecon() {
  const lines = [
    { n: "SEPA · Borg Holdings Ltd", a: "€2,400.00" },
    { n: "Card · Epic Comms", a: "−€45.90" },
    { n: "SEPA · Rent — October", a: "−€1,150.00" },
    { n: "POS settlement 04/10", a: "€913.40" },
  ];
  const p = useSGPhase(lines.length + 2);
  return (
    <SGFrame title="client.a4.com.mt · reconciliation">
      <SGHead icon="refresh-cw" right={<span style={sgSub}>BOV ··· 4471</span>}>Bank reconciliation</SGHead>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, minHeight: 218 }}>
        {lines.map((l, i) => {
          const matched = i < p;
          return (
            <div key={l.n} style={{ ...sgRow, opacity: matched ? 1 : 0.45, transition: "opacity .4s" }}>
              <Icon name={matched ? "link-2" : "circle-dashed"} size={16} color={matched ? "var(--accent-teal)" : "var(--stone)"} />
              <span style={sgName}>{l.n}</span>
              <span style={{ ...sgSub, fontWeight: 600, color: "#fff" }}>{l.a}</span>
              {matched ? <SGChip>Matched</SGChip> : <span style={sgSub}>…</span>}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--divider-soft)" }}>
        <span style={sgSub}>Ledger ↔ bank</span>
        <span style={{ ...sgSub, color: p > lines.length ? "var(--accent-teal)" : "var(--stone)", fontWeight: 700 }}>{Math.min(p, lines.length)} of {lines.length} matched</span>
      </div>
    </SGFrame>
  );
}

// ---- Audit & Assurance: audit progress tracker ----
function SGAuditTracker() {
  const p = useSGPhase(4, 1700);
  const pct = [33, 58, 84, 100][p];
  const docs = [2, 4, 5, 6][p];
  const stages = [
    { n: "Planning & risk assessment", done: true },
    { n: "Fieldwork & testing", done: p >= 2, now: p < 2 },
    { n: "Completion & opinion", done: p >= 3, now: p === 2 },
  ];
  return (
    <SGFrame title="client.a4.com.mt · audit">
      <SGHead icon="file-check-2" right={<span style={{ ...sgSub, fontWeight: 700, color: "#fff" }}>{pct}%</span>}>Audit 2025 — Borg Holdings Ltd</SGHead>
      <div style={{ height: 6, borderRadius: 999, background: "var(--surface-deep)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: "var(--primary)", transition: "width .9s cubic-bezier(.2,.7,.2,1)" }}></div>
      </div>
      <div style={{ ...sgSub, marginTop: 8 }}>Documents received — {docs} of 6</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
        {stages.map((s) => (
          <div key={s.n} style={sgRow}>
            <Icon name={s.done ? "check-circle" : s.now ? "loader" : "circle"} size={16} color={s.done ? "var(--accent-teal)" : s.now ? "var(--primary-bright)" : "var(--stone)"} />
            <span style={{ ...sgName, color: s.done || s.now ? "#fff" : "var(--on-dark-mute)" }}>{s.n}</span>
            {s.done ? <SGChip>Done</SGChip> : s.now ? <span style={{ ...sgSub, color: "var(--primary-bright)", fontWeight: 700 }}>In progress</span> : <span style={sgSub}>Pending</span>}
          </div>
        ))}
      </div>
    </SGFrame>
  );
}

// ---- Audit Readiness: pre-audit checklist completing ----
function SGChecklist() {
  const items = ["Bank reconciliations agreed", "Debtors & creditors schedules", "Fixed asset register tied in", "Policies mapped to GAPSME"];
  const p = useSGPhase(items.length + 2, 1200);
  const allDone = p >= items.length;
  return (
    <SGFrame title="client.a4.com.mt · readiness">
      <SGHead icon="clipboard-check" right={allDone ? <SGChip>Audit-ready</SGChip> : <span style={sgSub}>{Math.min(p, items.length)}/{items.length}</span>}>Pre-audit health check</SGHead>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, minHeight: 200 }}>
        {items.map((n, i) => {
          const done = i < p;
          return (
            <div key={n} style={{ ...sgRow, opacity: done ? 1 : 0.45, transition: "opacity .4s" }}>
              <span style={{ width: 20, height: 20, borderRadius: 999, display: "grid", placeItems: "center", flexShrink: 0, background: done ? "var(--primary)" : "transparent", border: done ? "none" : "1.5px solid #3a3d40", transition: "background .3s" }}>
                {done && <Icon name="check" size={12} color="#fff" stroke={3} />}
              </span>
              <span style={sgName}>{n}</span>
            </div>
          );
        })}
      </div>
    </SGFrame>
  );
}

// ---- Tax & Compliance: return filed with CFR ----
function SGTaxFiled() {
  const p = useSGPhase(3, 1900);
  return (
    <SGFrame title="client.a4.com.mt · tax">
      <SGHead icon="landmark" right={<span style={sgSub}>YA 2025</span>}>Corporate income tax return</SGHead>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {[["Chargeable income", "€212,400"], ["Tax at 35%", "€74,340"], ["Provisional tax paid", "−€49,500"]].map(([k, v], i) => (
          <div key={k} style={{ ...sgRow, opacity: p >= 1 ? 1 : 0.45, transition: `opacity .4s ${i * 0.12}s` }}>
            <span style={sgName}>{k}</span>
            <span style={{ ...sgSub, fontWeight: 700, color: "#fff" }}>{v}</span>
          </div>
        ))}
        <div style={{ ...sgRow, justifyContent: "center", gap: 9, background: p >= 2 ? "rgba(0,160,130,.12)" : "var(--surface-deep)", borderColor: p >= 2 ? "rgba(0,160,130,.4)" : "var(--hairline-dark)", transition: "all .5s" }}>
          {p >= 2 ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, ...sgRise() }}>
              <Icon name="badge-check" size={18} color="var(--accent-teal)" />
              <span style={{ ...sgName, flex: "none", color: "var(--accent-teal)", fontWeight: 700 }}>Filed with CFR</span>
              <span style={sgSub}>· on time</span>
            </span>
          ) : (
            <span style={sgSub}>Review in progress…</span>
          )}
        </div>
      </div>
    </SGFrame>
  );
}

// ---- VAT & Payroll: payslip + FS5 + VAT return ----
function SGPayslip() {
  const p = useSGPhase(4, 1400);
  return (
    <SGFrame title="client.a4.com.mt · vat & payroll">
      <SGHead icon="receipt-euro" right={<span style={sgSub}>October</span>}>Payroll & VAT run</SGHead>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, minHeight: 196 }}>
        <div style={{ ...sgRow, opacity: p >= 1 ? 1 : 0.45, transition: "opacity .4s" }}>
          <Icon name="users" size={16} color="var(--primary-bright)" />
          <span style={sgName}>Payslips issued — 12 employees</span>
          {p >= 1 && <SGChip>Net €18,442</SGChip>}
        </div>
        <div style={{ ...sgRow, opacity: p >= 2 ? 1 : 0.45, transition: "opacity .4s" }}>
          <Icon name="file-text" size={16} color="var(--primary-bright)" />
          <span style={sgName}>FS5 — PAYE & SSC</span>
          {p >= 2 ? <SGChip>Submitted</SGChip> : <span style={sgSub}>Due 30th</span>}
        </div>
        <div style={{ ...sgRow, opacity: p >= 3 ? 1 : 0.45, transition: "opacity .4s" }}>
          <Icon name="receipt-text" size={16} color="var(--primary-bright)" />
          <span style={sgName}>VAT return — Q3 · €12,408.55</span>
          {p >= 3 ? <SGChip>Filed with CFR</SGChip> : <span style={sgSub}>Preparing…</span>}
        </div>
      </div>
    </SGFrame>
  );
}

// ---- Corporate & CSP: incorporation / statutory registers ----
function SGIncorp() {
  const items = [
    { icon: "search-check", n: "Company name reserved", s: "MBR" },
    { icon: "file-signature", n: "M&A drafted & signed", s: "v2 final" },
    { icon: "building-2", n: "Registered — C 109201", s: "Certificate issued" },
    { icon: "archive", n: "Statutory registers opened", s: "Members · directors · BO" },
  ];
  const p = useSGPhase(items.length + 2, 1300);
  return (
    <SGFrame title="client.a4.com.mt · corporate">
      <SGHead icon="rocket" right={p > items.length ? <SGChip>Live</SGChip> : <span style={sgSub}>{Math.min(p, items.length)}/{items.length}</span>}>Incorporation — Malta Ltd</SGHead>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, minHeight: 232 }}>
        {items.slice(0, Math.max(p, 1)).map((it) => (
          <div key={it.n} style={{ ...sgRow, ...sgRise(0.04) }}>
            <Icon name={it.icon} size={16} color="var(--primary-bright)" />
            <span style={{ flex: 1, minWidth: 0 }}><span style={sgName}>{it.n}</span><br /><span style={sgSub}>{it.s}</span></span>
            <SGChip>Done</SGChip>
          </div>
        ))}
      </div>
    </SGFrame>
  );
}

// ---- Regulated & Licensing: MFSA application status ----
function SGLicence() {
  const p = useSGPhase(4, 1600);
  const rows = [
    { n: "Business plan & projections", st: p >= 1 ? "done" : "now" },
    { n: "Own funds & capital adequacy", st: p >= 2 ? "done" : p >= 1 ? "now" : "wait" },
    { n: "Application pack to MFSA", st: p >= 3 ? "done" : p >= 2 ? "now" : "wait" },
  ];
  return (
    <SGFrame title="client.a4.com.mt · licensing">
      <SGHead icon="shield-check" right={p >= 3 ? <SGChip>Submitted</SGChip> : <span style={{ ...sgSub, color: "var(--primary-bright)", fontWeight: 700 }}>In review</span>}>MFSA licence application</SGHead>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, minHeight: 196 }}>
        {rows.map((r) => (
          <div key={r.n} style={{ ...sgRow, opacity: r.st === "wait" ? 0.45 : 1, transition: "opacity .4s" }}>
            <Icon name={r.st === "done" ? "check-circle" : r.st === "now" ? "loader" : "circle"} size={16} color={r.st === "done" ? "var(--accent-teal)" : r.st === "now" ? "var(--primary-bright)" : "var(--stone)"} />
            <span style={sgName}>{r.n}</span>
            {r.st === "done" ? <SGChip>Reviewed</SGChip> : r.st === "now" ? <span style={{ ...sgSub, color: "var(--primary-bright)", fontWeight: 700 }}>In progress</span> : <span style={sgSub}>Queued</span>}
          </div>
        ))}
      </div>
    </SGFrame>
  );
}

// ---- Legal: agreement / e-signature flow ----
function SGSignature() {
  const p = useSGPhase(4, 1500);
  return (
    <SGFrame title="client.a4.com.mt · legal">
      <SGHead icon="file-signature" right={<span style={sgSub}>v3 · final</span>}>Shareholders' agreement</SGHead>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "14px", borderRadius: "var(--r-md)", background: "var(--surface-deep)", border: "1px solid var(--hairline-dark)" }}>
        {[86, 94, 70, 90, 52].map((w, i) => (
          <div key={i} style={{ height: 7, width: `${w}%`, borderRadius: 999, background: "#2a2d31" }}></div>
        ))}
        <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
          {[["Party A", p >= 1], ["Party B", p >= 2]].map(([label, signed]) => (
            <div key={label} style={{ flex: 1 }}>
              <div style={{ height: 26, display: "flex", alignItems: "flex-end" }}>
                {signed && <div style={{ height: 2, background: "var(--primary-bright)", borderRadius: 999, width: "88%", ...(SG_REDUCE ? {} : { animation: "a4grow .8s cubic-bezier(.2,.7,.2,1) both" }) }}></div>}
              </div>
              <div style={{ borderTop: "1px solid #3a3d40", paddingTop: 6, ...sgSub }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ ...sgRow, justifyContent: "center", marginTop: 10, background: p >= 3 ? "rgba(0,160,130,.12)" : "var(--surface-deep)", borderColor: p >= 3 ? "rgba(0,160,130,.4)" : "var(--hairline-dark)", transition: "all .5s" }}>
        {p >= 3 ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8, ...sgRise() }}><Icon name="badge-check" size={17} color="var(--accent-teal)" /><span style={{ ...sgName, flex: "none", color: "var(--accent-teal)", fontWeight: 700 }}>Signed — both parties</span></span> : <span style={sgSub}>Awaiting signatures…</span>}
      </div>
    </SGFrame>
  );
}

window.SERVICE_GRAPHICS = Object.assign(window.SERVICE_GRAPHICS || {}, {
  "accounting-finance": SGUploads,
  "bookkeeping": SGRecon,
  "audit-assurance": SGAuditTracker,
  "audit-readiness": SGChecklist,
  "tax-compliance": SGTaxFiled,
  "vat-payroll": SGPayslip,
  "corporate-csp": SGIncorp,
  "regulated-licensing": SGLicence,
  "legal": SGSignature,
});
Object.assign(window, { SGFrame, SGHead, SGChip, useSGPhase, sgRise, sgRow, sgName, sgSub, SG_REDUCE });
