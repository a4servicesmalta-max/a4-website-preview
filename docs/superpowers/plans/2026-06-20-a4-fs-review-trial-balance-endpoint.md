# Trial-Balance Review Endpoint (a4-fs-review) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `POST /api/review-tb` endpoint to the `a4-fs-review` engine that accepts a Trial Balance (CSV / XLSX / PDF) and returns the same JSON shape as `/api/review` — severity-tagged findings, confirmed checks, stats, and a branded A4 PDF.

**Architecture:** New `engine/tb_review.py` module does all TB work: parse the upload into normalized rows → classify each account → run deterministic checks → produce engine-shaped finding dicts + a `passed` list + `stats`. The endpoint in `main.py` reuses the existing `_enrich_engine`, the `findings_out` JSON shaping, and `report.build_pdf` (zero changes to the report module). Deterministic math only; an optional Claude pass adds classification hints/narrative and is key-gated (degrades gracefully).

**Tech Stack:** Python 3, FastAPI, pytest, openpyxl (new), stdlib `csv`, pymupdf (existing, for PDF text), reportlab (existing).

**Working dir / repo:** `C:\Users\user\Downloads\a4-fs-review` (its own repo; commit there).

---

## File Structure

- `engine/tb_review.py` — NEW. TB parsing, classification, checks, assembly. One responsibility: turn a TB upload into findings/passed/stats.
- `tests/test_tb_review.py` — NEW. Unit tests for the parser, classifier, and each check.
- `tests/fixtures/` — NEW. Small CSV/XLSX fixtures.
- `main.py` — MODIFY. Add the `/api/review-tb` route; add `"tbAvailable": True` to `/api/config`.
- `requirements.txt` — MODIFY. Add `openpyxl>=3.1.0`.
- `report.py` — UNCHANGED (reused as-is).

**Finding dict shape (must match the existing engine):**
```python
{"rule_id": str, "severity": "critical|high|medium|low|info",
 "location": str, "description": str,
 "reported_value": float|None, "expected_value": float|None, "row_label": str|None}
```
**Passed item shape:** `{"rule_id": str}` (label text added to `report.PASS_LABELS`).

---

## Task 1: Add openpyxl dependency

**Files:** Modify: `requirements.txt`

- [ ] **Step 1: Add the dep**

Append to `requirements.txt`:
```
openpyxl>=3.1.0
```

- [ ] **Step 2: Install**

Run: `pip install -r requirements.txt`
Expected: openpyxl installs successfully.

- [ ] **Step 3: Ensure pytest is available**

Run: `pip install pytest`
Expected: pytest installed (dev dependency; not added to requirements.txt).

- [ ] **Step 4: Commit**

```bash
git add requirements.txt
git commit -m "build: add openpyxl for trial-balance parsing"
```

---

## Task 2: Normalize-rows parser (CSV + XLSX)

A TB row normalizes to `{"code": str, "name": str, "debit": float, "credit": float, "balance": float}` where `balance = debit - credit` (debit positive). Accept either separate debit/credit columns OR a single signed balance column.

**Files:**
- Create: `engine/tb_review.py`
- Create: `tests/test_tb_review.py`
- Create: `tests/fixtures/tb_basic.csv`

- [ ] **Step 1: Write the fixture**

Create `tests/fixtures/tb_basic.csv`:
```csv
Code,Account,Debit,Credit
1000,Cash at bank,5000,0
1200,Trade debtors,8000,0
2000,Trade creditors,0,3000
3000,Share capital,0,1000
4000,Sales,0,12000
5000,Cost of sales,3000,0
```

- [ ] **Step 2: Write the failing test**

Create `tests/test_tb_review.py`:
```python
from engine.tb_review import parse_rows

def test_parse_csv_debit_credit():
    with open("tests/fixtures/tb_basic.csv", "rb") as fh:
        rows = parse_rows(fh.read(), "tb_basic.csv")
    assert len(rows) == 6
    cash = next(r for r in rows if r["code"] == "1000")
    assert cash["name"] == "Cash at bank"
    assert cash["debit"] == 5000.0 and cash["credit"] == 0.0
    assert cash["balance"] == 5000.0
    sales = next(r for r in rows if r["code"] == "4000")
    assert sales["balance"] == -12000.0  # credit balance is negative
```

- [ ] **Step 3: Run test, verify it fails**

Run: `pytest tests/test_tb_review.py::test_parse_csv_debit_credit -v`
Expected: FAIL — `ModuleNotFoundError` / `parse_rows` undefined.

- [ ] **Step 4: Implement the parser**

Create `engine/tb_review.py`:
```python
"""Trial-balance review — stateless. Parse CSV/XLSX/PDF -> normalized rows ->
deterministic checks -> engine-shaped findings. Math is never AI-generated."""
import csv
import io
import re

_NUM = re.compile(r"[^0-9.\-]")


def _num(v):
    if v is None:
        return 0.0
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).strip().replace("(", "-").replace(")", "")
    s = _NUM.sub("", s)
    if s in ("", "-", "."):
        return 0.0
    try:
        return float(s)
    except ValueError:
        return 0.0


# header synonyms (lowercased, stripped)
_CODE = {"code", "account code", "acct", "a/c", "no", "number", "gl code"}
_NAME = {"account", "name", "account name", "description", "ledger", "particulars"}
_DEBIT = {"debit", "dr", "debits"}
_CREDIT = {"credit", "cr", "credits"}
_BALANCE = {"balance", "amount", "net", "closing balance", "movement"}


def _match(header, synonyms):
    for i, h in enumerate(header):
        if str(h).strip().lower() in synonyms:
            return i
    return None


def _rows_from_table(table):
    """table = list[list]; first non-empty row with a recognizable header wins."""
    header_idx = None
    cols = {}
    for i, row in enumerate(table):
        cells = [str(c or "").strip() for c in row]
        name_i = _match(cells, _NAME)
        if name_i is not None and (_match(cells, _DEBIT) is not None or _match(cells, _BALANCE) is not None):
            header_idx = i
            cols = {
                "code": _match(cells, _CODE),
                "name": name_i,
                "debit": _match(cells, _DEBIT),
                "credit": _match(cells, _CREDIT),
                "balance": _match(cells, _BALANCE),
            }
            break
    if header_idx is None:
        return []
    out = []
    for row in table[header_idx + 1:]:
        cells = [str(c or "").strip() for c in row]
        if not any(cells):
            continue
        name = cells[cols["name"]] if cols["name"] is not None and cols["name"] < len(cells) else ""
        code = cells[cols["code"]] if cols["code"] is not None and cols["code"] < len(cells) else ""
        if not name and not code:
            continue
        if cols["debit"] is not None or cols["credit"] is not None:
            debit = _num(cells[cols["debit"]]) if cols["debit"] is not None and cols["debit"] < len(cells) else 0.0
            credit = _num(cells[cols["credit"]]) if cols["credit"] is not None and cols["credit"] < len(cells) else 0.0
        else:
            bal = _num(cells[cols["balance"]]) if cols["balance"] is not None and cols["balance"] < len(cells) else 0.0
            debit, credit = (bal, 0.0) if bal >= 0 else (0.0, -bal)
        # skip total rows
        if re.search(r"\btotal\b", name, re.I):
            continue
        out.append({"code": code, "name": name, "debit": debit, "credit": credit,
                    "balance": round(debit - credit, 2)})
    return out


def parse_rows(raw: bytes, filename: str):
    name = (filename or "").lower()
    if name.endswith(".csv"):
        text = raw.decode("utf-8-sig", errors="replace")
        table = list(csv.reader(io.StringIO(text)))
        return _rows_from_table(table)
    if name.endswith((".xlsx", ".xlsm")):
        import openpyxl
        wb = openpyxl.load_workbook(io.BytesIO(raw), read_only=True, data_only=True)
        ws = wb.active
        table = [[c for c in row] for row in ws.iter_rows(values_only=True)]
        return _rows_from_table(table)
    if name.endswith(".pdf"):
        return _rows_from_pdf(raw)
    raise ValueError("Unsupported trial-balance format")


def _rows_from_pdf(raw: bytes):
    """Best-effort: extract text lines, split into [name, debit, credit] by trailing numbers."""
    import fitz  # pymupdf
    doc = fitz.open(stream=raw, filetype="pdf")
    table = []
    for page in doc:
        for line in page.get_text("text").splitlines():
            nums = re.findall(r"-?\(?\d[\d,]*\.?\d*\)?", line)
            label = re.sub(r"-?\(?\d[\d,]*\.?\d*\)?", "", line).strip(" .|")
            if label and len(nums) >= 1:
                table.append([label] + nums)
    if not table:
        return []
    # synthesize a header so _rows_from_table can map: Account, Debit, Credit
    header = ["Account", "Debit", "Credit"] if len(table[0]) >= 3 else ["Account", "Balance"]
    return _rows_from_table([header] + table)
```

- [ ] **Step 5: Run test, verify it passes**

Run: `pytest tests/test_tb_review.py::test_parse_csv_debit_credit -v`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add engine/tb_review.py tests/test_tb_review.py tests/fixtures/tb_basic.csv
git commit -m "feat(tb): normalize-rows parser for CSV trial balances"
```

---

## Task 3: XLSX + signed-balance parsing tests

**Files:** Modify: `tests/test_tb_review.py`; Create: `tests/fixtures/tb_signed.csv`

- [ ] **Step 1: Add a signed-balance fixture**

Create `tests/fixtures/tb_signed.csv`:
```csv
Account,Balance
Cash at bank,5000
Trade creditors,-3000
Sales,-12000
Cost of sales,3000
```

- [ ] **Step 2: Write the failing test**

Append to `tests/test_tb_review.py`:
```python
def test_parse_csv_signed_balance():
    with open("tests/fixtures/tb_signed.csv", "rb") as fh:
        rows = parse_rows(fh.read(), "tb_signed.csv")
    creditors = next(r for r in rows if r["name"] == "Trade creditors")
    assert creditors["balance"] == -3000.0
    assert creditors["credit"] == 3000.0 and creditors["debit"] == 0.0
```

- [ ] **Step 3: Run, verify pass** (parser already handles signed balance)

Run: `pytest tests/test_tb_review.py -v`
Expected: PASS (both tests).

- [ ] **Step 4: Commit**

```bash
git add tests/test_tb_review.py tests/fixtures/tb_signed.csv
git commit -m "test(tb): signed single-balance column parsing"
```

---

## Task 4: Account classifier

Classify each row into `asset | liability | equity | income | expense | unknown` and its normal side (`debit`/`credit`). Use account-code ranges first (1=asset, 2=liability, 3=equity, 4=income, 5–9=expense — the common SME chart), then name keywords as a fallback.

**Files:** Modify: `engine/tb_review.py`, `tests/test_tb_review.py`

- [ ] **Step 1: Write the failing test**

Append to `tests/test_tb_review.py`:
```python
from engine.tb_review import classify

def test_classify_by_code_then_name():
    assert classify("1000", "Cash at bank")["type"] == "asset"
    assert classify("2000", "Trade creditors")["type"] == "liability"
    assert classify("4000", "Sales")["type"] == "income"
    assert classify("", "Depreciation expense")["type"] == "expense"     # name fallback
    assert classify("", "Accruals")["type"] == "liability"
    assert classify("1000", "Cash")["normal"] == "debit"
    assert classify("4000", "Sales")["normal"] == "credit"
```

- [ ] **Step 2: Run, verify it fails**

Run: `pytest tests/test_tb_review.py::test_classify_by_code_then_name -v`
Expected: FAIL — `classify` undefined.

- [ ] **Step 3: Implement classifier**

Append to `engine/tb_review.py`:
```python
_NORMAL = {"asset": "debit", "expense": "debit", "liability": "credit",
           "equity": "credit", "income": "credit"}

_NAME_RULES = [
    ("asset", ("cash", "bank", "debtor", "receivable", "inventory", "stock", "prepay",
               "fixed asset", "ppe", "plant", "equipment", "vehicle", "goodwill", "vat recoverable")),
    ("liability", ("creditor", "payable", "accrual", "loan", "overdraft", "tax payable",
                   "vat payable", "deferred", "provision", "hire purchase")),
    ("equity", ("share capital", "retained earning", "reserve", "equity", "drawings", "dividend")),
    ("income", ("sales", "revenue", "turnover", "income", "interest received", "other income")),
    ("expense", ("cost of sales", "purchase", "wages", "salary", "rent", "depreciation",
                 "expense", "admin", "utilities", "insurance", "interest paid", "bank charge")),
]


def classify(code: str, name: str) -> dict:
    code = (code or "").strip()
    if code and code[0] in "123456789":
        by_code = {"1": "asset", "2": "liability", "3": "equity", "4": "income"}.get(code[0])
        if by_code is None and code[0] in "56789":
            by_code = "expense"
        if by_code:
            return {"type": by_code, "normal": _NORMAL[by_code]}
    low = (name or "").lower()
    for typ, kws in _NAME_RULES:
        if any(k in low for k in kws):
            return {"type": typ, "normal": _NORMAL[typ]}
    return {"type": "unknown", "normal": None}
```

- [ ] **Step 4: Run, verify it passes**

Run: `pytest tests/test_tb_review.py::test_classify_by_code_then_name -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add engine/tb_review.py tests/test_tb_review.py
git commit -m "feat(tb): account classifier (code ranges + name keywords)"
```

---

## Task 5: Deterministic checks → findings

`review_rows(rows)` returns `(findings, passed, stats)`. Checks:
1. **TB_BALANCE** (critical) — Σdebit ≠ Σcredit (tol €1). `reported_value=Σdebit`, `expected_value=Σcredit`.
2. **TB_SIGN** (high) — account with a balance on the abnormal side beyond €1 (e.g. credit balance in an asset), excluding `unknown` and known contras (name contains "accumulated depreciation"/"provision"/"allowance"/"drawings").
3. **TB_NEGATIVE_CASH** (medium) — asset named cash/bank with a credit balance (possible overdraft to reclassify).
4. **TB_SUSPENSE** (medium) — non-zero account whose name contains "suspense"/"clearing"/"control"/"uncategor".
5. **TB_DUP_CODE** (high) — same non-empty `code` on >1 row.
6. **TB_ROUNDING** (low) — ≥60% of non-zero balances are exact multiples of 1000 (possible placeholders), only if ≥5 rows.
Passed items (when a check finds nothing): `TB_BALANCE_PASS`, `TB_SIGN_PASS`, `TB_DUP_PASS`.

**Files:** Modify: `engine/tb_review.py`, `tests/test_tb_review.py`

- [ ] **Step 1: Write failing tests**

Append to `tests/test_tb_review.py`:
```python
from engine.tb_review import review_rows

def _rows(*triples):
    return [{"code": c, "name": n, "debit": max(b, 0.0), "credit": max(-b, 0.0),
             "balance": float(b)} for c, n, b in triples]

def test_balanced_tb_has_no_balance_finding():
    rows = _rows(("1000", "Cash", 5000), ("3000", "Capital", -5000))
    findings, passed, stats = review_rows(rows)
    assert not any(f["rule_id"] == "TB_BALANCE" for f in findings)
    assert any(p["rule_id"] == "TB_BALANCE_PASS" for p in passed)
    assert stats["checks_failed"] == len(findings)

def test_unbalanced_tb_flags_critical():
    rows = _rows(("1000", "Cash", 5000), ("3000", "Capital", -4000))
    findings, _, _ = review_rows(rows)
    bal = next(f for f in findings if f["rule_id"] == "TB_BALANCE")
    assert bal["severity"] == "critical"
    assert bal["reported_value"] == 5000.0 and bal["expected_value"] == 4000.0

def test_sign_anomaly_flagged():
    rows = _rows(("1200", "Trade debtors", -2000), ("3000", "Capital", 2000))
    findings, _, _ = review_rows(rows)
    assert any(f["rule_id"] == "TB_SIGN" and "debtors" in f["description"].lower() for f in findings)

def test_duplicate_code_flagged():
    rows = _rows(("1000", "Cash", 100), ("1000", "Cash 2", -100))
    findings, _, _ = review_rows(rows)
    assert any(f["rule_id"] == "TB_DUP_CODE" for f in findings)
```

- [ ] **Step 2: Run, verify they fail**

Run: `pytest tests/test_tb_review.py -k "tb or balanced or unbalanced or sign or duplicate" -v`
Expected: FAIL — `review_rows` undefined.

- [ ] **Step 3: Implement checks**

Append to `engine/tb_review.py`:
```python
from collections import Counter

_CONTRA = ("accumulated depreciation", "provision", "allowance", "drawings", "dividend")


def review_rows(rows: list):
    findings, passed = [], []
    if not rows:
        return findings, passed, {"checks_run": 0, "checks_passed": 0, "checks_failed": 0,
                                  "rows": 0, "framework": "Trial Balance"}

    tot_debit = round(sum(r["debit"] for r in rows), 2)
    tot_credit = round(sum(r["credit"] for r in rows), 2)

    # 1) balance
    if abs(tot_debit - tot_credit) > 1.0:
        findings.append({"rule_id": "TB_BALANCE", "severity": "critical", "location": "Trial balance",
                         "description": f"Trial balance does not balance — total debits {tot_debit:,.2f} "
                                        f"vs total credits {tot_credit:,.2f} (out by {abs(tot_debit-tot_credit):,.2f}).",
                         "reported_value": tot_debit, "expected_value": tot_credit, "row_label": "Total"})
    else:
        passed.append({"rule_id": "TB_BALANCE_PASS"})

    # 5) duplicate codes
    codes = Counter(r["code"] for r in rows if r["code"])
    dups = [c for c, n in codes.items() if n > 1]
    for c in dups:
        findings.append({"rule_id": "TB_DUP_CODE", "severity": "high", "location": f"Account {c}",
                         "description": f"Account code {c} appears on more than one line — merge or correct.",
                         "reported_value": None, "expected_value": None, "row_label": c})
    if not dups:
        passed.append({"rule_id": "TB_DUP_PASS"})

    sign_hits = 0
    for r in rows:
        cls = classify(r["code"], r["name"])
        low = r["name"].lower()
        # 2) sign anomaly
        if cls["normal"] and abs(r["balance"]) > 1.0 and not any(k in low for k in _CONTRA):
            on_debit = r["balance"] > 0
            normal_debit = cls["normal"] == "debit"
            if on_debit != normal_debit:
                sign_hits += 1
                side = "debit" if on_debit else "credit"
                findings.append({"rule_id": "TB_SIGN", "severity": "high", "location": r["name"],
                                 "description": f"{r['name']} ({cls['type']}) carries a {side} balance "
                                                f"of {abs(r['balance']):,.2f} — usually a {cls['normal']} "
                                                f"balance. Check classification or posting.",
                                 "reported_value": r["balance"], "expected_value": None,
                                 "row_label": r["name"]})
                # 3) negative cash special-case
                if cls["type"] == "asset" and any(k in low for k in ("cash", "bank")) and r["balance"] < 0:
                    findings.append({"rule_id": "TB_NEGATIVE_CASH", "severity": "medium", "location": r["name"],
                                     "description": f"{r['name']} is in credit ({abs(r['balance']):,.2f}) — if a real "
                                                    f"overdraft, reclassify to liabilities.",
                                     "reported_value": r["balance"], "expected_value": None, "row_label": r["name"]})
        # 4) suspense / clearing / control
        if abs(r["balance"]) > 1.0 and any(k in low for k in ("suspense", "clearing", "control", "uncategor")):
            findings.append({"rule_id": "TB_SUSPENSE", "severity": "medium", "location": r["name"],
                             "description": f"{r['name']} has a non-zero balance ({abs(r['balance']):,.2f}) — "
                                            f"suspense/clearing/control accounts should normally clear to nil.",
                             "reported_value": r["balance"], "expected_value": 0.0, "row_label": r["name"]})
    if sign_hits == 0:
        passed.append({"rule_id": "TB_SIGN_PASS"})

    # 6) rounding heuristic
    nz = [r["balance"] for r in rows if abs(r["balance"]) > 1.0]
    if len(nz) >= 5:
        roundish = sum(1 for b in nz if abs(b) % 1000 < 0.01)
        if roundish / len(nz) >= 0.6:
            findings.append({"rule_id": "TB_ROUNDING", "severity": "low", "location": "Trial balance",
                             "description": f"{roundish} of {len(nz)} balances are exact thousands — "
                                            f"confirm these are actual figures, not estimates/placeholders.",
                             "reported_value": None, "expected_value": None, "row_label": None})

    stats = {"checks_run": len(passed) + len({f['rule_id'] for f in findings}),
             "checks_passed": len(passed), "checks_failed": len(findings),
             "rows": len(rows), "framework": "Trial Balance"}
    return findings, passed, stats
```

- [ ] **Step 4: Run, verify pass**

Run: `pytest tests/test_tb_review.py -v`
Expected: PASS (all).

- [ ] **Step 5: Commit**

```bash
git add engine/tb_review.py tests/test_tb_review.py
git commit -m "feat(tb): deterministic trial-balance checks -> findings"
```

---

## Task 6: Register TB pass-labels in the report

**Files:** Modify: `report.py:27-46` (the `PASS_LABELS` dict)

- [ ] **Step 1: Add labels**

In `report.py`, add these entries inside `PASS_LABELS`:
```python
    "TB_BALANCE_PASS": "Trial balance balances (total debits = total credits).",
    "TB_SIGN_PASS": "No sign/classification anomalies in account balances.",
    "TB_DUP_PASS": "No duplicate account codes.",
```

- [ ] **Step 2: Commit**

```bash
git add report.py
git commit -m "feat(tb): friendly pass-labels for the TB report"
```

---

## Task 7: The `/api/review-tb` endpoint

Reuse `_enrich_engine`, the `findings_out` shaping, and `build_pdf` from `main.py`. Title the report via the company name; deep/AI is optional and additive.

**Files:** Modify: `main.py`

- [ ] **Step 1: Write the endpoint test**

Append to `tests/test_tb_review.py`:
```python
from fastapi.testclient import TestClient
import main

def test_review_tb_endpoint_returns_report():
    client = TestClient(main.app)
    with open("tests/fixtures/tb_basic.csv", "rb") as fh:
        data = fh.read()
    resp = client.post("/api/review-tb", files={"file": ("tb_basic.csv", data, "text/csv")})
    assert resp.status_code == 200
    body = resp.json()
    assert body["framework"] == "Trial Balance"
    assert "reportBase64" in body and body["reportBase64"]
    assert isinstance(body["findings"], list)
```

- [ ] **Step 2: Run, verify it fails**

Run: `pytest tests/test_tb_review.py::test_review_tb_endpoint_returns_report -v`
Expected: FAIL — 404 (route not defined).

- [ ] **Step 3: Implement the endpoint**

Add to `main.py` — first, the import near the top (after the other `engine` imports, line ~20):
```python
from engine import tb_review
```

Then add the route (after the `/api/review` function, ~line 187):
```python
@app.post("/api/review-tb")
async def review_tb(file: UploadFile = File(...), deep: bool = Form(False), _=Depends(require_login)):
    raw = await file.read()
    if not raw:
        raise HTTPException(400, "Empty file")
    name = file.filename or "trial-balance"
    try:
        rows = tb_review.parse_rows(raw, name)
    except ValueError as e:
        raise HTTPException(400, str(e))
    if not rows:
        raise HTTPException(422, "Could not read a trial balance from this file — expected columns for "
                                 "account name and debit/credit (or a signed balance). Try CSV or Excel.")

    findings, passed, stats = tb_review.review_rows(rows)

    # optional AI classification hints / narrative (additive, key-gated)
    deep_used, deep_error = False, None
    if deep and ai_review.available():
        try:
            ai_findings = await ai_review.deep_review_tb(rows, findings)  # see Task 8
            findings = findings + ai_findings
            deep_used = True
        except Exception as e:
            deep_error = str(e)

    findings = [_enrich_engine(f) for f in findings]
    order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}
    combined = sorted(findings, key=lambda x: order.get(str(x.get("severity")).lower(), 9))
    company = os.path.splitext(name)[0]

    findings_out = [{
        "ruleId": f.get("rule_id"),
        "severity": str(f.get("severity") or "info").lower(),
        "severityLabel": SEV.get(str(f.get("severity")).lower(), ("Note",))[0],
        "location": (f.get("location") or ""),
        "description": f.get("description") or "",
        "source": f.get("source", "engine"),
        "where": f.get("where", ""),
        "current": f.get("current", ""),
        "corrected": f.get("corrected", ""),
        "action": f.get("action") or f.get("description") or "",
    } for f in combined]

    counts = Counter(str(p.get("rule_id")) for p in passed)
    confirmed, seen = [], set()
    for rid, _n in counts.most_common():
        lbl = PASS_LABELS.get(rid)
        if lbl and lbl not in seen:
            seen.add(lbl); confirmed.append(lbl)

    stats_report = {**stats, "checks_failed": len(combined)}
    pdf = build_pdf(company, "Trial Balance", stats_report, combined, passed, deep_used)

    return JSONResponse({
        "company": company,
        "framework": "Trial Balance",
        "method": "tb-parser",
        "deepAvailable": ai_review.available(),
        "deepUsed": deep_used,
        "deepError": deep_error,
        "hasTables": True,
        "stats": stats_report,
        "findings": findings_out,
        "confirmed": confirmed,
        "reportBase64": base64.b64encode(pdf).decode("ascii"),
        "reportName": f"{company} - A4 Trial Balance Review.pdf",
        "annotatedDocxBase64": None,
        "annotatedName": None,
    })
```

- [ ] **Step 4: Run, verify it passes**

Run: `pytest tests/test_tb_review.py::test_review_tb_endpoint_returns_report -v`
Expected: PASS.

- [ ] **Step 5: Add the config flag**

In `main.py` `config()` (line ~76), return-dict, add `"tbAvailable": True`:
```python
    return {"deepAvailable": ai_review.available(), "ocrAvailable": claude_ocr.available(), "tbAvailable": True}
```

- [ ] **Step 6: Run the full suite**

Run: `pytest -q`
Expected: PASS (smoke + tb tests).

- [ ] **Step 7: Commit**

```bash
git add main.py
git commit -m "feat(tb): POST /api/review-tb endpoint (reuses report + findings shape)"
```

---

## Task 8: Optional AI classification hints (`deep_review_tb`)

The endpoint calls `ai_review.deep_review_tb(rows, findings)` only when `deep=True` and a key is set. It returns extra finding dicts (`source` will be set to `ai` by `_enrich_engine`'s default? No — set explicitly) for ambiguous classifications and a one-line narrative. Must never alter numbers.

**Files:** Modify: `engine/ai_review.py`

- [ ] **Step 1: Inspect the existing module**

Run: `sed -n '1,40p' engine/ai_review.py`
Expected: see `available()` and how `deep_review(...)` builds the Anthropic client + returns a list of finding dicts. Mirror its client setup and JSON parsing exactly.

- [ ] **Step 2: Implement `deep_review_tb`**

Append to `engine/ai_review.py` (mirroring the client setup used by `deep_review`):
```python
async def deep_review_tb(rows: list, findings: list) -> list:
    """Optional: ask Claude for classification hints on 'unknown' accounts and a short
    narrative. Returns engine-shaped finding dicts with source='ai'. Never changes numbers."""
    if not available():
        return []
    unknown = [r for r in rows if r["name"] and not r["code"]][:60]
    if not unknown:
        return []
    import json
    listing = "\n".join(f"- {r['name']}: balance {r['balance']:.2f}" for r in unknown)
    prompt = (
        "You are a Maltese CPA reviewing a trial balance. For any account below whose classification "
        "looks wrong or ambiguous, return a short note. DO NOT invent or change any numbers. "
        "Reply as JSON: {\"notes\":[{\"account\":str,\"severity\":\"medium|low|info\",\"note\":str}]}\n\n"
        + listing
    )
    client = _client()  # reuse the same helper deep_review uses; if named differently, match it
    msg = await client.messages.create(
        model=os.environ.get("ANTHROPIC_REVIEW_MODEL", os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-6")),
        max_tokens=1200, messages=[{"role": "user", "content": prompt}],
    )
    text = "".join(getattr(b, "text", "") for b in msg.content)
    try:
        data = json.loads(text[text.find("{"): text.rfind("}") + 1])
    except Exception:
        return []
    out = []
    for n in data.get("notes", [])[:20]:
        out.append({"rule_id": "AI · Classification", "severity": str(n.get("severity", "info")).lower(),
                    "location": n.get("account", ""), "description": n.get("note", ""),
                    "reported_value": None, "expected_value": None, "row_label": n.get("account"),
                    "source": "ai"})
    return out
```

> NOTE: in Step 1 you confirmed the real client-helper name and async pattern in `ai_review.py`. If `_client()` / `await ...messages.create` differ there, copy that module's exact pattern here instead. Do not introduce a second client style.

- [ ] **Step 3: Manual smoke (key set)**

Run: `ANTHROPIC_API_KEY=... pytest tests/test_tb_review.py -v`
Expected: still PASS (AI path is additive; without `deep=true` it isn't exercised).

- [ ] **Step 4: Commit**

```bash
git add engine/ai_review.py
git commit -m "feat(tb): optional Claude classification hints for unknown accounts"
```

---

## Task 9: Deploy + verify

- [ ] **Step 1: Run locally**

Run: `uvicorn main:app --reload --port 8090`
Then: `curl -u a4:$APP_PASSWORD -F file=@tests/fixtures/tb_basic.csv http://localhost:8090/api/review-tb | python -c "import sys,json;d=json.load(sys.stdin);print(d['framework'], len(d['findings']))"`
Expected: `Trial Balance <n>` and a non-empty `reportBase64`.

- [ ] **Step 2: Deploy to Railway** (same service) and confirm `GET /api/config` now returns `"tbAvailable": true`, and `/api/review-tb` works against the live URL with Basic auth.

- [ ] **Step 3: Record** the live base URL + Basic-auth creds — needed as `A4_FSREVIEW_URL/USER/PASS` env vars in the website plan.

---

## Self-Review Notes (author)

- Spec §6b checks covered: balance ✅, sign/classification ✅, negative cash ✅, suspense/control ✅, duplicate codes ✅, rounding ✅, missing-standard-accounts → **deferred** (low value, noisy) — call out in handoff. AI hints ✅ (optional). Same response shape as `/api/review` ✅. Branded PDF reused ✅. Stateless ✅.
- Types consistent: finding dicts use `rule_id/severity/location/description/reported_value/expected_value/row_label`; `_enrich_engine` adds `where/current/corrected/action`; endpoint maps to `findings_out` exactly like `/api/review`.
- Placeholder scan: Task 8 depends on the real `ai_review` client helper — Step 1 forces the engineer to read it and match the exact pattern (flagged explicitly), not a blind placeholder.
