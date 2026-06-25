# a4-accounting-health Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone Python/FastAPI service that reviews a trial balance + general-ledger detail for accounting-records health red-flags, returning a deterministic score, categorised findings, and a branded PDF, with an optional key-gated AI narrative.

**Architecture:** Stateless service. Uploaded TB/GL files are parsed into normalised pandas DataFrames, run through a library of pure deterministic check functions (every figure computed in code, never by the LLM), scored, rendered to JSON + a branded ReportLab PDF. An optional `anthropic` "deep" pass narrates the engine's findings only. Mirrors the existing `a4-fs-review` conventions (HTTP Basic auth, no DB, Railway/Docker).

**Tech Stack:** Python 3.12, FastAPI, uvicorn, pandas, openpyxl, PyMuPDF (fitz), ReportLab, anthropic, pytest. Deploy: Docker + Railway.

**Repo location:** new directory `C:\Users\user\Downloads\a4-accounting-health` (sibling of `a4-fs-review`).

**Reference (read first):** `C:\Users\user\Downloads\a4-fs-review\main.py`, `engine/tb_review.py`, `report.py`, `engine/ai_review.py` — copy their auth/report/deep patterns; do NOT import from that repo (this is separate code).

---

### Task 1: Repo scaffold + Finding model

**Files:**
- Create: `C:\Users\user\Downloads\a4-accounting-health\requirements.txt`
- Create: `a4-accounting-health/engine/__init__.py` (empty)
- Create: `a4-accounting-health/engine/model.py`
- Create: `a4-accounting-health/tests/__init__.py` (empty)
- Create: `a4-accounting-health/tests/test_model.py`
- Create: `a4-accounting-health/pytest.ini`

- [ ] **Step 1: requirements.txt**

```
fastapi==0.115.6
uvicorn[standard]==0.34.0
pandas==2.2.3
openpyxl==3.1.5
PyMuPDF==1.25.1
reportlab==4.2.5
anthropic==0.42.0
python-multipart==0.0.20
pytest==8.3.4
```

- [ ] **Step 2: pytest.ini**

```ini
[pytest]
testpaths = tests
python_files = test_*.py
```

- [ ] **Step 3: Write engine/model.py**

```python
from __future__ import annotations
from dataclasses import dataclass, field, asdict
from typing import Any

SEVERITIES = ("must-fix", "review", "note")

@dataclass
class Finding:
    id: str                       # stable check id, e.g. "TB_BALANCE"
    category: str                 # "tb" | "gl" | "xref"
    severity: str                 # one of SEVERITIES
    ref: str                      # account code/name or journal ref
    reason: str                   # plain-language explanation
    action: str                   # suggested next step
    figures: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        assert self.severity in SEVERITIES, f"bad severity {self.severity}"

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
```

- [ ] **Step 4: Write tests/test_model.py**

```python
from engine.model import Finding

def test_finding_serialises():
    f = Finding(id="TB_BALANCE", category="tb", severity="must-fix",
                ref="(whole TB)", reason="debits != credits", action="Investigate",
                figures={"debits": 100.0, "credits": 90.0})
    d = f.to_dict()
    assert d["id"] == "TB_BALANCE"
    assert d["figures"]["debits"] == 100.0

def test_finding_rejects_bad_severity():
    import pytest
    with pytest.raises(AssertionError):
        Finding(id="X", category="tb", severity="urgent", ref="", reason="", action="")
```

- [ ] **Step 5: Run tests**

Run: `cd /c/Users/user/Downloads/a4-accounting-health && python -m pytest -q`
Expected: 2 passed.

- [ ] **Step 6: Commit**

```bash
git init && git add -A && git commit -m "chore: scaffold a4-accounting-health + Finding model"
```

---

### Task 2: Trial-balance parser

**Files:**
- Create: `a4-accounting-health/engine/parse.py`
- Create: `a4-accounting-health/tests/test_parse_tb.py`
- Create fixtures inline in the test (write temp files).

Normalised TB DataFrame columns: `code` (str), `name` (str), `debit` (float), `credit` (float), `balance` (float = debit − credit), `py_balance` (float, NaN if absent).

- [ ] **Step 1: Write the failing tests**

```python
import io, pandas as pd
from engine.parse import parse_tb

CSV = "Code,Account,Debit,Credit\n1000,Cash at bank,5000,0\n2100,Trade creditors,0,2000\n3000,Share capital,0,3000\n"

def test_parse_tb_csv_normalises_columns():
    df = parse_tb(CSV.encode(), "tb.csv")
    assert list(df.columns) == ["code", "name", "debit", "credit", "balance", "py_balance"]
    assert len(df) == 3
    row = df[df.code == "1000"].iloc[0]
    assert row.debit == 5000.0 and row.credit == 0.0 and row.balance == 5000.0

def test_parse_tb_handles_bracket_negatives_and_commas():
    csv = "Code,Account,Balance\n1000,Cash,\"5,000\"\n4000,Sales,\"(3,000)\"\n"
    df = parse_tb(csv.encode(), "tb.csv")
    assert df[df.code == "1000"].iloc[0].balance == 5000.0
    assert df[df.code == "4000"].iloc[0].balance == -3000.0

def test_parse_tb_xlsx(tmp_path):
    p = tmp_path / "tb.xlsx"
    pd.DataFrame({"Code": ["1000"], "Account": ["Cash"], "Debit": [10], "Credit": [0]}).to_excel(p, index=False)
    df = parse_tb(p.read_bytes(), "tb.xlsx")
    assert df.iloc[0].balance == 10.0
```

- [ ] **Step 2: Run to verify fail**

Run: `python -m pytest tests/test_parse_tb.py -q`
Expected: FAIL (ImportError: cannot import name 'parse_tb').

- [ ] **Step 3: Implement parse_tb in engine/parse.py**

```python
from __future__ import annotations
import io, re
import pandas as pd
import fitz  # PyMuPDF

def _to_num(v) -> float:
    if v is None: return 0.0
    if isinstance(v, (int, float)): return float(v)
    s = str(v).strip().replace(",", "").replace(" ", "")
    if s in ("", "-", "—"): return 0.0
    neg = s.startswith("(") and s.endswith(")")
    s = s.strip("()")
    s = re.sub(r"[^0-9.\-]", "", s)
    if s in ("", "-", "."): return 0.0
    val = float(s)
    return -val if neg else val

def _find_col(cols: list[str], *names: str) -> str | None:
    low = {c.lower().strip(): c for c in cols}
    for n in names:
        for k, orig in low.items():
            if n in k:
                return orig
    return None

def _read_table(data: bytes, filename: str) -> pd.DataFrame:
    name = filename.lower()
    if name.endswith((".xlsx", ".xlsm")):
        return pd.read_excel(io.BytesIO(data), dtype=str)
    if name.endswith(".csv"):
        return pd.read_csv(io.BytesIO(data), dtype=str)
    if name.endswith(".pdf"):
        return _read_pdf_table(data)
    raise ValueError(f"Unsupported file type: {filename}")

def _read_pdf_table(data: bytes) -> pd.DataFrame:
    rows = []
    with fitz.open(stream=data, filetype="pdf") as doc:
        for page in doc:
            for line in page.get_text().splitlines():
                m = re.match(r"^\s*(\d{3,})\s+(.+?)\s+([\d.,()\-]+)\s+([\d.,()\-]+)\s*$", line)
                if m:
                    rows.append({"Code": m.group(1), "Account": m.group(2),
                                 "Debit": m.group(3), "Credit": m.group(4)})
    if not rows:
        raise ValueError("No trial-balance rows found in PDF")
    return pd.DataFrame(rows)

def parse_tb(data: bytes, filename: str) -> pd.DataFrame:
    raw = _read_table(data, filename)
    cols = list(raw.columns)
    c_code = _find_col(cols, "code", "nominal", "account no", "ref")
    c_name = _find_col(cols, "account", "name", "description", "narrative")
    c_deb = _find_col(cols, "debit", "dr")
    c_cred = _find_col(cols, "credit", "cr")
    c_bal = _find_col(cols, "balance", "amount")
    c_py = _find_col(cols, "prior", "py", "last year", "comparative")
    out = pd.DataFrame()
    out["code"] = raw[c_code].astype(str).str.strip() if c_code else [str(i) for i in range(len(raw))]
    out["name"] = (raw[c_name] if c_name else "").astype(str).str.strip()
    if c_deb and c_cred:
        out["debit"] = raw[c_deb].map(_to_num)
        out["credit"] = raw[c_cred].map(_to_num)
        out["balance"] = out["debit"] - out["credit"]
    else:
        out["balance"] = raw[c_bal].map(_to_num)
        out["debit"] = out["balance"].clip(lower=0)
        out["credit"] = (-out["balance"]).clip(lower=0)
    out["py_balance"] = raw[c_py].map(_to_num) if c_py else float("nan")
    out = out[out["name"].str.len().gt(0) | out["balance"].ne(0)].reset_index(drop=True)
    return out[["code", "name", "debit", "credit", "balance", "py_balance"]]
```

- [ ] **Step 4: Run tests**

Run: `python -m pytest tests/test_parse_tb.py -q`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: trial-balance parser (csv/xlsx/pdf)"
```

---

### Task 3: General-ledger parser

**Files:**
- Modify: `a4-accounting-health/engine/parse.py` (add `parse_gl`)
- Create: `a4-accounting-health/tests/test_parse_gl.py`

Normalised GL DataFrame columns: `date` (datetime64), `code` (str), `name` (str), `desc` (str), `debit` (float), `credit` (float), `journal` (str), `source` (str), `user` (str).

- [ ] **Step 1: Write failing tests**

```python
import pandas as pd
from engine.parse import parse_gl

CSV = ("Date,Account Code,Account,Description,Debit,Credit,Journal,Source,User\n"
       "2025-01-05,1000,Cash,Receipt,100,0,J1,SALES,amy\n"
       "2025-01-05,4000,Sales,Receipt,0,100,J1,SALES,amy\n")

def test_parse_gl_normalises():
    df = parse_gl(CSV.encode(), "gl.csv")
    assert list(df.columns) == ["date","code","name","desc","debit","credit","journal","source","user"]
    assert len(df) == 2
    assert str(df.iloc[0].date.date()) == "2025-01-05"
    assert df.iloc[0].debit == 100.0 and df.iloc[1].credit == 100.0
    assert df.iloc[0].journal == "J1"

def test_parse_gl_missing_optional_cols():
    csv = "Date,Account,Debit,Credit\n2025-02-01,Bank,50,0\n"
    df = parse_gl(csv.encode(), "gl.csv")
    assert df.iloc[0].journal == "" and df.iloc[0].user == ""
    assert df.iloc[0].debit == 50.0
```

- [ ] **Step 2: Run to verify fail**

Run: `python -m pytest tests/test_parse_gl.py -q`
Expected: FAIL (cannot import name 'parse_gl').

- [ ] **Step 3: Add parse_gl to engine/parse.py**

```python
def parse_gl(data: bytes, filename: str) -> pd.DataFrame:
    raw = _read_table(data, filename)
    cols = list(raw.columns)
    c_date = _find_col(cols, "date", "posted")
    c_code = _find_col(cols, "code", "nominal", "account no")
    c_name = _find_col(cols, "account", "name")
    c_desc = _find_col(cols, "description", "narrative", "detail", "memo")
    c_deb = _find_col(cols, "debit", "dr")
    c_cred = _find_col(cols, "credit", "cr")
    c_amt = _find_col(cols, "amount", "value")
    c_jnl = _find_col(cols, "journal", "entry", "voucher", "doc")
    c_src = _find_col(cols, "source", "type", "daybook")
    c_user = _find_col(cols, "user", "posted by", "created by")
    out = pd.DataFrame()
    out["date"] = pd.to_datetime(raw[c_date], errors="coerce", dayfirst=True) if c_date else pd.NaT
    out["code"] = (raw[c_code] if c_code else "").astype(str).str.strip()
    out["name"] = (raw[c_name] if c_name else "").astype(str).str.strip()
    out["desc"] = (raw[c_desc] if c_desc else "").astype(str).str.strip()
    if c_deb and c_cred:
        out["debit"] = raw[c_deb].map(_to_num)
        out["credit"] = raw[c_cred].map(_to_num)
    elif c_amt:
        amt = raw[c_amt].map(_to_num)
        out["debit"] = amt.clip(lower=0)
        out["credit"] = (-amt).clip(lower=0)
    else:
        out["debit"] = 0.0
        out["credit"] = 0.0
    out["journal"] = (raw[c_jnl] if c_jnl else "").astype(str).str.strip().replace("nan", "")
    out["source"] = (raw[c_src] if c_src else "").astype(str).str.strip().replace("nan", "")
    out["user"] = (raw[c_user] if c_user else "").astype(str).str.strip().replace("nan", "")
    return out[["date","code","name","desc","debit","credit","journal","source","user"]]
```

- [ ] **Step 4: Run tests**

Run: `python -m pytest tests/test_parse_gl.py -q`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: general-ledger parser"
```

---

### Task 4: Account classification

**Files:**
- Create: `a4-accounting-health/engine/classify.py`
- Create: `a4-accounting-health/tests/test_classify.py`

Returns one of: `"asset"`, `"liability"`, `"equity"`, `"revenue"`, `"expense"`, `"unknown"`. Plus helpers `is_cash(name)`, `is_suspense(name)`.

- [ ] **Step 1: Write failing tests**

```python
from engine.classify import classify_account, is_cash, is_suspense

def test_classify_by_name():
    assert classify_account("1000", "Cash at bank") == "asset"
    assert classify_account("2100", "Trade creditors") == "liability"
    assert classify_account("3000", "Share capital") == "equity"
    assert classify_account("4000", "Sales revenue") == "revenue"
    assert classify_account("6000", "Office rent expense") == "expense"

def test_cash_and_suspense_helpers():
    assert is_cash("Cash at bank") and is_cash("HSBC Current Account")
    assert is_suspense("Suspense account") and is_suspense("Clearing - to allocate")
    assert not is_suspense("Sales")
```

- [ ] **Step 2: Run to verify fail**

Run: `python -m pytest tests/test_classify.py -q`
Expected: FAIL (cannot import name 'classify_account').

- [ ] **Step 3: Implement engine/classify.py**

```python
from __future__ import annotations

_CASH = ("cash", "bank", "current account", "petty", "revolut", "hsbc", "bov", "paypal", "stripe")
_SUSPENSE = ("suspense", "clearing", "to allocate", "to be allocated", "unallocated", "temporary", "holding")

_RULES = [
    ("revenue", ("sales", "revenue", "turnover", "income", "fees earned")),
    ("expense", ("expense", "cost of", "purchases", "rent", "salaries", "wages", "depreciation",
                 "utilities", "insurance", "marketing", "admin", "interest payable")),
    ("liability", ("creditor", "payable", "loan", "vat", "tax payable", "accrual", "deferred income",
                   "provision", "overdraft")),
    ("equity", ("capital", "equity", "retained", "reserve", "shareholder funds", "dividend")),
    ("asset", ("cash", "bank", "debtor", "receivable", "stock", "inventory", "prepayment",
               "fixed asset", "property", "plant", "equipment", "intangible", "investment")),
]

def _has(name: str, words) -> bool:
    n = name.lower()
    return any(w in n for w in words)

def is_cash(name: str) -> bool:
    return _has(name, _CASH)

def is_suspense(name: str) -> bool:
    return _has(name, _SUSPENSE)

def classify_account(code: str, name: str) -> str:
    for kind, words in _RULES:
        if _has(name, words):
            return kind
    c = "".join(ch for ch in str(code) if ch.isdigit())
    if c:
        d = c[0]
        return {"1": "asset", "2": "liability", "3": "equity", "4": "revenue",
                "5": "expense", "6": "expense", "7": "expense"}.get(d, "unknown")
    return "unknown"
```

- [ ] **Step 4: Run tests**

Run: `python -m pytest tests/test_classify.py -q`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: account classification heuristics"
```

---

### Task 5: TB checks

**Files:**
- Create: `a4-accounting-health/engine/checks_tb.py`
- Create: `a4-accounting-health/tests/test_checks_tb.py`

Each function takes the TB DataFrame and returns `list[Finding]`. A top-level `run_tb_checks(tb)` concatenates them. Implements: `TB_BALANCE`, `TB_SUSPENSE`, `TB_SIGN`, `TB_DUP_CODE`, `TB_ROUNDING`, `TB_PY_SWING`.

- [ ] **Step 1: Write failing tests**

```python
import pandas as pd, numpy as np
from engine.checks_tb import run_tb_checks
from engine.parse import parse_tb

def _tb(csv: str): return parse_tb(csv.encode(), "tb.csv")
def _ids(findings): return sorted({f.id for f in findings})

def test_balanced_clean_tb_has_no_must_fix():
    tb = _tb("Code,Account,Debit,Credit\n1000,Cash,5000,0\n2100,Creditors,0,2000\n3000,Capital,0,3000\n")
    assert "TB_BALANCE" not in _ids(run_tb_checks(tb))

def test_unbalanced_tb_flags_balance():
    tb = _tb("Code,Account,Debit,Credit\n1000,Cash,5000,0\n3000,Capital,0,4000\n")
    f = [x for x in run_tb_checks(tb) if x.id == "TB_BALANCE"][0]
    assert f.severity == "must-fix"
    assert f.figures["difference"] == 1000.0

def test_suspense_nonzero_flags():
    tb = _tb("Code,Account,Debit,Credit\n1000,Cash,5000,0\n9999,Suspense account,0,5000\n")
    assert "TB_SUSPENSE" in _ids(run_tb_checks(tb))

def test_negative_cash_flags_sign():
    tb = _tb("Code,Account,Debit,Credit\n1000,Cash at bank,0,500\n3000,Capital,0,0\n1000b,Other,500,0\n")
    f = [x for x in run_tb_checks(tb) if x.id == "TB_SIGN"]
    assert any("Cash" in x.ref for x in f)

def test_duplicate_code_flags():
    tb = _tb("Code,Account,Debit,Credit\n1000,Cash,5000,0\n1000,Cash 2,0,5000\n")
    assert "TB_DUP_CODE" in _ids(run_tb_checks(tb))

def test_py_swing_flags_when_prior_present():
    csv = "Code,Account,Balance,Prior Year\n4000,Sales,-100000,-10000\n1000,Cash,100000,10000\n"
    tb = parse_tb(csv.encode(), "tb.csv")
    assert "TB_PY_SWING" in _ids(run_tb_checks(tb))
```

- [ ] **Step 2: Run to verify fail**

Run: `python -m pytest tests/test_checks_tb.py -q`
Expected: FAIL (cannot import name 'run_tb_checks').

- [ ] **Step 3: Implement engine/checks_tb.py**

```python
from __future__ import annotations
import math
import pandas as pd
from engine.model import Finding
from engine.classify import classify_account, is_cash, is_suspense

def check_balance(tb: pd.DataFrame) -> list[Finding]:
    deb, cred = round(tb.debit.sum(), 2), round(tb.credit.sum(), 2)
    if abs(deb - cred) >= 0.01:
        return [Finding(id="TB_BALANCE", category="tb", severity="must-fix", ref="(whole TB)",
                        reason=f"Total debits ({deb:,.2f}) do not equal total credits ({cred:,.2f}).",
                        action="Locate the unbalanced posting before preparing accounts.",
                        figures={"debits": deb, "credits": cred, "difference": round(deb - cred, 2)})]
    return []

def check_suspense(tb: pd.DataFrame) -> list[Finding]:
    out = []
    for _, r in tb.iterrows():
        if is_suspense(r["name"]) and abs(r["balance"]) >= 0.01:
            out.append(Finding(id="TB_SUSPENSE", category="tb", severity="must-fix", ref=f"{r['code']} {r['name']}",
                               reason=f"Suspense/clearing account holds {r['balance']:,.2f}; these should be cleared to zero.",
                               action="Reallocate the balance to the correct accounts.",
                               figures={"balance": round(r["balance"], 2)}))
    return out

def check_sign(tb: pd.DataFrame) -> list[Finding]:
    out = []
    for _, r in tb.iterrows():
        kind = classify_account(r["code"], r["name"])
        bal = r["balance"]
        bad = None
        if is_cash(r["name"]) and bal < -0.01:
            bad = "Cash/bank account is in credit (negative)."
        elif kind == "revenue" and bal > 0.01:
            bad = "Revenue account has a debit balance."
        elif kind == "asset" and not is_cash(r["name"]) and bal < -0.01:
            bad = "Asset account has a credit balance."
        if bad:
            out.append(Finding(id="TB_SIGN", category="tb", severity="review", ref=f"{r['code']} {r['name']}",
                               reason=f"{bad} Balance {bal:,.2f}.",
                               action="Confirm the balance is correctly classified/signed.",
                               figures={"balance": round(bal, 2), "type": kind}))
    return out

def check_dup_code(tb: pd.DataFrame) -> list[Finding]:
    dups = tb[tb.code.duplicated(keep=False) & tb.code.str.len().gt(0)]
    out = []
    for code in sorted(dups.code.unique()):
        out.append(Finding(id="TB_DUP_CODE", category="tb", severity="review", ref=str(code),
                           reason=f"Account code {code} appears on {len(dups[dups.code == code])} rows.",
                           action="Merge duplicate account codes.",
                           figures={"count": int(len(dups[dups.code == code]))}))
    return out

def check_rounding(tb: pd.DataFrame) -> list[Finding]:
    nz = tb[tb.balance.abs() >= 1]
    if len(nz) < 5:
        return []
    round_k = nz[nz.balance.mod(1000) == 0]
    if len(round_k) / len(nz) >= 0.5:
        return [Finding(id="TB_ROUNDING", category="tb", severity="note", ref="(whole TB)",
                        reason=f"{len(round_k)} of {len(nz)} balances are exact thousands — suggests estimates rather than posted figures.",
                        action="Confirm these are actual ledger balances, not placeholders.",
                        figures={"round_thousands": int(len(round_k)), "nonzero": int(len(nz))})]
    return []

def check_py_swing(tb: pd.DataFrame) -> list[Finding]:
    if tb.py_balance.isna().all():
        return []
    out = []
    for _, r in tb.iterrows():
        py = r["py_balance"]
        if math.isnan(py) or abs(py) < 0.01:
            continue
        swing = abs(r["balance"] - py) / abs(py)
        if swing >= 3.0:
            out.append(Finding(id="TB_PY_SWING", category="tb", severity="note", ref=f"{r['code']} {r['name']}",
                               reason=f"Balance moved from {py:,.2f} to {r['balance']:,.2f} ({swing*100:,.0f}% change).",
                               action="Confirm the year-on-year movement is expected.",
                               figures={"prior": round(py, 2), "current": round(r["balance"], 2)}))
    return out

_TB_CHECKS = [check_balance, check_suspense, check_sign, check_dup_code, check_rounding, check_py_swing]

def run_tb_checks(tb: pd.DataFrame) -> list[Finding]:
    out: list[Finding] = []
    for fn in _TB_CHECKS:
        out.extend(fn(tb))
    return out
```

- [ ] **Step 4: Run tests**

Run: `python -m pytest tests/test_checks_tb.py -q`
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: TB integrity checks"
```

---

### Task 6: GL checks

**Files:**
- Create: `a4-accounting-health/engine/checks_gl.py`
- Create: `a4-accounting-health/tests/test_checks_gl.py`

Implements: `GL_DUP_POSTING`, `GL_WEEKEND`, `GL_ROUND_JOURNAL`, `GL_SEQUENCE_GAP`, `GL_UNBALANCED_JOURNAL`, `GL_OUTLIER`. Top-level `run_gl_checks(gl)`. (Maps to spec §3b; `GL_WEEKEND` covers the weekend/back-dated test, `GL_CLOSED_PERIOD` and `GL_DORMANT_ACTIVITY` are folded into XREF/period context in Task 7.)

- [ ] **Step 1: Write failing tests**

```python
import pandas as pd
from engine.parse import parse_gl
from engine.checks_gl import run_gl_checks

def _gl(csv): return parse_gl(csv.encode(), "gl.csv")
def _ids(f): return sorted({x.id for x in f})

H = "Date,Account,Description,Debit,Credit,Journal\n"

def test_duplicate_posting_flags():
    gl = _gl(H + "2025-01-05,Rent,Office rent,1000,0,J1\n2025-01-05,Rent,Office rent,1000,0,J2\n")
    assert "GL_DUP_POSTING" in _ids(run_gl_checks(gl))

def test_weekend_entry_flags():
    # 2025-01-04 is a Saturday
    gl = _gl(H + "2025-01-04,Sales,Weekend sale,0,500,J1\n")
    assert "GL_WEEKEND" in _ids(run_gl_checks(gl))

def test_round_sum_journal_flags():
    gl = _gl(H + "2025-01-06,Accruals,Accrual,10000,0,J5\n")
    assert "GL_ROUND_JOURNAL" in _ids(run_gl_checks(gl))

def test_sequence_gap_flags():
    gl = _gl(H + "2025-01-06,A,x,1,0,J1\n2025-01-06,B,y,1,0,J3\n")
    assert "GL_SEQUENCE_GAP" in _ids(run_gl_checks(gl))

def test_unbalanced_journal_flags():
    gl = _gl(H + "2025-01-06,A,x,100,0,J9\n2025-01-06,B,y,0,90,J9\n")
    assert "GL_UNBALANCED_JOURNAL" in _ids(run_gl_checks(gl))

def test_clean_gl_quiet():
    gl = _gl(H + "2025-01-06,A,x,100,0,J1\n2025-01-06,B,y,0,100,J1\n2025-01-07,A,z,50,0,J2\n2025-01-07,B,w,0,50,J2\n")
    assert _ids(run_gl_checks(gl)) == []
```

- [ ] **Step 2: Run to verify fail**

Run: `python -m pytest tests/test_checks_gl.py -q`
Expected: FAIL (cannot import name 'run_gl_checks').

- [ ] **Step 3: Implement engine/checks_gl.py**

```python
from __future__ import annotations
import re
import pandas as pd
from engine.model import Finding

def check_dup_posting(gl: pd.DataFrame) -> list[Finding]:
    key = ["date", "code", "name", "desc", "debit", "credit"]
    dup = gl[gl.duplicated(subset=key, keep=False)]
    out = []
    seen = set()
    for _, r in dup.iterrows():
        k = (str(r["date"]), r["name"], r["debit"], r["credit"])
        if k in seen:
            continue
        seen.add(k)
        amt = r["debit"] or r["credit"]
        out.append(Finding(id="GL_DUP_POSTING", category="gl", severity="review",
                           ref=f"{r['name']} {amt:,.2f} on {str(r['date'])[:10]}",
                           reason="Identical posting (date, account, description, amount) appears more than once.",
                           action="Check for a double entry.",
                           figures={"amount": round(float(amt), 2)}))
    return out

def check_weekend(gl: pd.DataFrame) -> list[Finding]:
    out = []
    wk = gl[gl.date.notna() & gl.date.dt.dayofweek.isin([5, 6])]
    for _, r in wk.iterrows():
        amt = r["debit"] or r["credit"]
        out.append(Finding(id="GL_WEEKEND", category="gl", severity="note",
                           ref=f"{r['name']} on {str(r['date'])[:10]}",
                           reason="Entry posted on a weekend date — unusual for routine bookkeeping.",
                           action="Confirm the transaction date is correct.",
                           figures={"amount": round(float(amt), 2), "weekday": int(r['date'].dayofweek)}))
    return out

def check_round_journal(gl: pd.DataFrame, threshold: float = 1000.0) -> list[Finding]:
    out = []
    manual = gl[(gl.debit + gl.credit) >= threshold]
    for _, r in manual.iterrows():
        amt = r["debit"] or r["credit"]
        if amt >= threshold and amt % 1000 == 0:
            out.append(Finding(id="GL_ROUND_JOURNAL", category="gl", severity="note",
                               ref=f"{r['name']} {amt:,.0f} ({r['journal'] or 'n/a'})",
                               reason=f"Round-sum entry of {amt:,.0f} — round numbers often indicate manual estimates.",
                               action="Confirm the figure is supported, not an estimate.",
                               figures={"amount": round(float(amt), 2)}))
    return out

def _jnl_num(j: str):
    m = re.search(r"(\d+)", str(j))
    return int(m.group(1)) if m else None

def check_sequence_gap(gl: pd.DataFrame) -> list[Finding]:
    nums = sorted({n for j in gl.journal.unique() if (n := _jnl_num(j)) is not None})
    if len(nums) < 2:
        return []
    missing = [n for n in range(nums[0], nums[-1] + 1) if n not in nums]
    if missing:
        return [Finding(id="GL_SEQUENCE_GAP", category="gl", severity="review", ref="(journal numbers)",
                        reason=f"Journal-number sequence has gaps: missing {missing[:10]}{'…' if len(missing) > 10 else ''}.",
                        action="Confirm no journals were deleted or are missing from the export.",
                        figures={"missing_count": len(missing), "range": [nums[0], nums[-1]]})]
    return []

def check_unbalanced_journal(gl: pd.DataFrame) -> list[Finding]:
    out = []
    has_j = gl[gl.journal.str.len().gt(0)]
    for j, grp in has_j.groupby("journal"):
        diff = round(grp.debit.sum() - grp.credit.sum(), 2)
        if abs(diff) >= 0.01:
            out.append(Finding(id="GL_UNBALANCED_JOURNAL", category="gl", severity="must-fix", ref=f"Journal {j}",
                               reason=f"Journal {j} does not balance (debits − credits = {diff:,.2f}).",
                               action="Correct the one-sided entry.",
                               figures={"difference": diff}))
    return out

def check_outlier(gl: pd.DataFrame) -> list[Finding]:
    out = []
    gl = gl.assign(amount=(gl.debit + gl.credit))
    for name, grp in gl.groupby("name"):
        if len(grp) < 8:
            continue
        med = grp.amount.median()
        mad = (grp.amount - med).abs().median() or 1.0
        for _, r in grp.iterrows():
            z = abs(r.amount - med) / (1.4826 * mad)
            if z >= 6 and r.amount >= med * 5:
                out.append(Finding(id="GL_OUTLIER", category="gl", severity="note",
                                   ref=f"{name} {r.amount:,.2f} on {str(r['date'])[:10]}",
                                   reason=f"Amount {r.amount:,.2f} is far larger than this account's typical entry (~{med:,.2f}).",
                                   action="Confirm the large entry is correct.",
                                   figures={"amount": round(float(r.amount), 2), "median": round(float(med), 2)}))
    return out

_GL_CHECKS = [check_dup_posting, check_weekend, check_round_journal, check_sequence_gap,
              check_unbalanced_journal, check_outlier]

def run_gl_checks(gl: pd.DataFrame) -> list[Finding]:
    out: list[Finding] = []
    for fn in _GL_CHECKS:
        out.extend(fn(gl))
    return out
```

- [ ] **Step 4: Run tests**

Run: `python -m pytest tests/test_checks_gl.py -q`
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: GL transaction checks"
```

---

### Task 7: TB↔GL tie-out checks

**Files:**
- Create: `a4-accounting-health/engine/checks_xref.py`
- Create: `a4-accounting-health/tests/test_checks_xref.py`

Implements: `XREF_GL_NETS_ZERO`, `XREF_MOVEMENT`. Top-level `run_xref_checks(tb, gl)`.

- [ ] **Step 1: Write failing tests**

```python
from engine.parse import parse_tb, parse_gl
from engine.checks_xref import run_xref_checks

def _ids(f): return sorted({x.id for x in f})

def test_gl_not_netting_zero_flags():
    tb = parse_tb(b"Code,Account,Debit,Credit\n1000,Cash,100,0\n4000,Sales,0,100\n", "tb.csv")
    gl = parse_gl(b"Date,Account Code,Account,Debit,Credit\n2025-01-05,1000,Cash,100,0\n", "gl.csv")
    assert "XREF_GL_NETS_ZERO" in _ids(run_xref_checks(tb, gl))

def test_movement_mismatch_flags():
    tb = parse_tb(b"Code,Account,Debit,Credit\n1000,Cash,999,0\n4000,Sales,0,999\n", "tb.csv")
    gl = parse_gl(b"Date,Account Code,Account,Debit,Credit\n2025-01-05,1000,Cash,100,0\n2025-01-05,4000,Sales,0,100\n", "gl.csv")
    assert "XREF_MOVEMENT" in _ids(run_xref_checks(tb, gl))

def test_clean_tieout_quiet():
    tb = parse_tb(b"Code,Account,Debit,Credit\n1000,Cash,100,0\n4000,Sales,0,100\n", "tb.csv")
    gl = parse_gl(b"Date,Account Code,Account,Debit,Credit\n2025-01-05,1000,Cash,100,0\n2025-01-05,4000,Sales,0,100\n", "gl.csv")
    assert run_xref_checks(tb, gl) == []
```

- [ ] **Step 2: Run to verify fail**

Run: `python -m pytest tests/test_checks_xref.py -q`
Expected: FAIL (cannot import name 'run_xref_checks').

- [ ] **Step 3: Implement engine/checks_xref.py**

```python
from __future__ import annotations
import pandas as pd
from engine.model import Finding

def check_gl_nets_zero(tb, gl) -> list[Finding]:
    net = round(gl.debit.sum() - gl.credit.sum(), 2)
    if abs(net) >= 0.01:
        return [Finding(id="XREF_GL_NETS_ZERO", category="xref", severity="must-fix", ref="(whole GL)",
                        reason=f"The general ledger does not net to zero (debits − credits = {net:,.2f}).",
                        action="The GL export is incomplete or unbalanced — re-export the full period.",
                        figures={"net": net})]
    return []

def check_movement(tb, gl) -> list[Finding]:
    gl_mv = (gl.groupby("code").apply(lambda g: round(g.debit.sum() - g.credit.sum(), 2))
             if "code" in gl and gl.code.str.len().gt(0).any() else None)
    if gl_mv is None:
        return []
    out = []
    tb_by_code = {str(r.code): round(r.balance, 2) for _, r in tb.iterrows()}
    for code, mv in gl_mv.items():
        if not code:
            continue
        tb_bal = tb_by_code.get(str(code))
        if tb_bal is None:
            continue
        if abs(mv - tb_bal) >= 0.01:
            out.append(Finding(id="XREF_MOVEMENT", category="xref", severity="review", ref=str(code),
                               reason=f"GL movement for {code} ({mv:,.2f}) does not match the TB balance ({tb_bal:,.2f}).",
                               action="Reconcile the ledger to the trial balance for this account.",
                               figures={"gl_movement": mv, "tb_balance": tb_bal}))
    return out

def run_xref_checks(tb: pd.DataFrame, gl: pd.DataFrame) -> list[Finding]:
    return check_gl_nets_zero(tb, gl) + check_movement(tb, gl)
```

- [ ] **Step 4: Run tests**

Run: `python -m pytest tests/test_checks_xref.py -q`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: TB-GL tie-out checks"
```

---

### Task 8: Scoring

**Files:**
- Create: `a4-accounting-health/engine/score.py`
- Create: `a4-accounting-health/tests/test_score.py`

`score_findings(findings) -> (int, str)` returns score 0–100 and band. Start at 100, deduct per finding by severity, floor 0. Bands: Healthy ≥ 80, Some gaps ≥ 50, At risk < 50.

- [ ] **Step 1: Write failing tests**

```python
from engine.model import Finding
from engine.score import score_findings

def _f(sev): return Finding(id="X", category="tb", severity=sev, ref="", reason="", action="")

def test_clean_is_100_healthy():
    assert score_findings([]) == (100, "Healthy")

def test_must_fix_drops_to_at_risk():
    score, band = score_findings([_f("must-fix"), _f("must-fix")])
    assert score <= 60 and band in ("Some gaps", "At risk")

def test_band_thresholds():
    assert score_findings([_f("note")])[1] == "Healthy"
    assert score_findings([_f("review")] * 3)[1] in ("Some gaps", "Healthy")
    assert score_findings([_f("must-fix")] * 5)[0] == 0
```

- [ ] **Step 2: Run to verify fail**

Run: `python -m pytest tests/test_score.py -q`
Expected: FAIL (cannot import name 'score_findings').

- [ ] **Step 3: Implement engine/score.py**

```python
from __future__ import annotations
from engine.model import Finding

_WEIGHT = {"must-fix": 20, "review": 8, "note": 3}

def score_findings(findings: list[Finding]) -> tuple[int, str]:
    score = 100 - sum(_WEIGHT.get(f.severity, 0) for f in findings)
    score = max(0, min(100, score))
    band = "Healthy" if score >= 80 else "Some gaps" if score >= 50 else "At risk"
    return score, band
```

- [ ] **Step 4: Run tests**

Run: `python -m pytest tests/test_score.py -q`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: deterministic health score"
```

---

### Task 9: Review orchestrator

**Files:**
- Create: `a4-accounting-health/engine/review.py`
- Create: `a4-accounting-health/tests/test_review.py`

`review(tb_bytes, tb_name, gl_bytes, gl_name) -> dict`. Either pair may be None. Builds findings, score, stats, confirmed list.

- [ ] **Step 1: Write failing tests**

```python
from engine.review import review

TB = b"Code,Account,Debit,Credit\n1000,Cash,5000,0\n2100,Creditors,0,2000\n3000,Capital,0,3000\n"
GL = b"Date,Account Code,Account,Description,Debit,Credit,Journal\n2025-01-06,1000,Cash,x,5000,0,J1\n2025-01-06,3000,Capital,y,0,5000,J1\n"

def test_review_tb_only():
    r = review(TB, "tb.csv", None, None)
    assert r["stats"]["tb_rows"] == 3
    assert r["stats"]["gl_rows"] == 0
    assert isinstance(r["score"], int) and r["band"] in ("Healthy","Some gaps","At risk")
    assert r["company"]  # derived from filename

def test_review_with_gl_runs_xref():
    r = review(TB, "tb.csv", GL, "gl.csv")
    assert r["stats"]["gl_rows"] == 2
    ids = {f["id"] for f in r["findings"]}
    assert "XREF_GL_NETS_ZERO" in ids  # GL nets 0 here actually balances -> ensure key present only if unbalanced

def test_review_requires_at_least_one_file():
    import pytest
    with pytest.raises(ValueError):
        review(None, None, None, None)
```

NOTE for implementer: in `test_review_with_gl_runs_xref` the GL *does* balance, so `XREF_GL_NETS_ZERO` will NOT fire. Correct the assertion to `assert "XREF_GL_NETS_ZERO" not in ids` when writing — the test above is intentionally wrong to force you to verify behaviour against real output. Run the function, read the actual findings, and assert what truly holds.

- [ ] **Step 2: Run to verify fail**

Run: `python -m pytest tests/test_review.py -q`
Expected: FAIL (cannot import name 'review').

- [ ] **Step 3: Implement engine/review.py**

```python
from __future__ import annotations
import os
from engine.parse import parse_tb, parse_gl
from engine.checks_tb import run_tb_checks
from engine.checks_gl import run_gl_checks
from engine.checks_xref import run_xref_checks
from engine.score import score_findings
from engine.model import Finding

def _company(name: str | None) -> str:
    if not name:
        return "Your accounts"
    return os.path.splitext(os.path.basename(name))[0].replace("_", " ").strip() or "Your accounts"

def review(tb_bytes, tb_name, gl_bytes, gl_name) -> dict:
    if not tb_bytes and not gl_bytes:
        raise ValueError("Provide a trial balance and/or a general ledger.")
    tb = parse_tb(tb_bytes, tb_name) if tb_bytes else None
    gl = parse_gl(gl_bytes, gl_name) if gl_bytes else None
    if tb is None and gl is not None:
        # derive a TB from the GL so integrity checks still run
        agg = gl.groupby(["code", "name"], as_index=False).agg(debit=("debit", "sum"), credit=("credit", "sum"))
        agg["balance"] = agg["debit"] - agg["credit"]
        agg["py_balance"] = float("nan")
        tb = agg

    findings: list[Finding] = []
    findings += run_tb_checks(tb)
    if gl is not None:
        findings += run_gl_checks(gl)
        findings += run_xref_checks(tb, gl)

    score, band = score_findings(findings)
    sev_rank = {"must-fix": 0, "review": 1, "note": 2}
    findings.sort(key=lambda f: sev_rank.get(f.severity, 9))

    checks_run = len(_ALL_CHECK_IDS) if gl is not None else len(_TB_CHECK_IDS)
    confirmed = _confirmed(findings, gl is not None)
    return {
        "company": _company(tb_name or gl_name),
        "score": score,
        "band": band,
        "stats": {
            "checks_run": checks_run,
            "checks_failed": len(findings),
            "checks_passed": max(0, checks_run - len({f.id for f in findings})),
            "tb_rows": int(len(tb)) if tb is not None else 0,
            "gl_rows": int(len(gl)) if gl is not None else 0,
        },
        "findings": [f.to_dict() for f in findings],
        "confirmed": confirmed,
        "deepAvailable": bool(os.environ.get("ANTHROPIC_API_KEY")),
        "deepUsed": False,
    }

_TB_CHECK_IDS = ["TB_BALANCE", "TB_SUSPENSE", "TB_SIGN", "TB_DUP_CODE", "TB_ROUNDING", "TB_PY_SWING"]
_GL_CHECK_IDS = ["GL_DUP_POSTING", "GL_WEEKEND", "GL_ROUND_JOURNAL", "GL_SEQUENCE_GAP",
                 "GL_UNBALANCED_JOURNAL", "GL_OUTLIER"]
_XREF_CHECK_IDS = ["XREF_GL_NETS_ZERO", "XREF_MOVEMENT"]
_ALL_CHECK_IDS = _TB_CHECK_IDS + _GL_CHECK_IDS + _XREF_CHECK_IDS

def _confirmed(findings, has_gl: bool) -> list[str]:
    failed = {f["id"] if isinstance(f, dict) else f.id for f in findings}
    msgs = {
        "TB_BALANCE": "Trial balance balances (debits = credits).",
        "TB_SUSPENSE": "No uncleared suspense/clearing balances.",
        "GL_UNBALANCED_JOURNAL": "Every journal balances.",
        "XREF_GL_NETS_ZERO": "General ledger nets to zero.",
    }
    return [m for cid, m in msgs.items() if cid not in failed and (has_gl or cid.startswith("TB"))]
```

- [ ] **Step 4: Fix the intentionally-wrong assertion, then run tests**

Edit `test_review_with_gl_runs_xref` to assert `"XREF_GL_NETS_ZERO" not in ids` (the sample GL balances).
Run: `python -m pytest tests/test_review.py -q`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: review orchestrator (findings + score + stats)"
```

---

### Task 10: Branded PDF report

**Files:**
- Create: `a4-accounting-health/report.py`
- Create: `a4-accounting-health/tests/test_report.py`
- Reference: copy the cover/style approach from `a4-fs-review/report.py` (B&W annual-report look). Reuse its `assets/cover_bg.jpg`/`content_bg.jpg` if present (copy the files into this repo's `assets/`).

`build_pdf(company, score, band, stats, findings) -> bytes`. Title "ACCOUNTING HEALTH REVIEW"; cover result block shows `score / band`.

- [ ] **Step 1: Write the failing test**

```python
from report import build_pdf

def test_build_pdf_returns_pdf_bytes():
    pdf = build_pdf("Acme Ltd", 72, "Some gaps",
                    {"checks_run": 8, "checks_passed": 6, "checks_failed": 2, "tb_rows": 40, "gl_rows": 0},
                    [{"id": "TB_BALANCE", "category": "tb", "severity": "must-fix", "ref": "(whole TB)",
                      "reason": "debits != credits", "action": "fix", "figures": {"difference": 10.0}}])
    assert pdf[:4] == b"%PDF"
    assert len(pdf) > 1000
```

- [ ] **Step 2: Run to verify fail**

Run: `python -m pytest tests/test_report.py -q`
Expected: FAIL (No module named 'report').

- [ ] **Step 3: Implement report.py**

```python
from __future__ import annotations
import io
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
                                Table, TableStyle, NextPageTemplate, PageBreak)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

_SEV_LABEL = {"must-fix": "Must fix", "review": "Review", "note": "Note"}
_SEV_GREY = {"must-fix": colors.HexColor("#111111"), "review": colors.HexColor("#555555"),
             "note": colors.HexColor("#999999")}

def _styles():
    ss = getSampleStyleSheet()
    ss.add(ParagraphStyle("Cover", fontName="Helvetica-Bold", fontSize=30, textColor=colors.white, leading=34))
    ss.add(ParagraphStyle("H2b", fontName="Helvetica-Bold", fontSize=13, spaceBefore=14, spaceAfter=6))
    ss.add(ParagraphStyle("Body2", fontName="Helvetica", fontSize=9.5, leading=13))
    return ss

def build_pdf(company: str, score: int, band: str, stats: dict, findings: list[dict]) -> bytes:
    buf = io.BytesIO()
    ss = _styles()

    def cover(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(colors.black)
        canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
        canvas.setFillColor(colors.white)
        canvas.setFont("Helvetica-Bold", 28)
        canvas.drawString(20 * mm, A4[1] - 60 * mm, "ACCOUNTING HEALTH")
        canvas.drawString(20 * mm, A4[1] - 72 * mm, "REVIEW")
        canvas.setFont("Helvetica", 12)
        canvas.drawString(20 * mm, A4[1] - 88 * mm, company)
        canvas.setFont("Helvetica-Bold", 60)
        canvas.drawRightString(A4[0] - 20 * mm, 50 * mm, str(score))
        canvas.setFont("Helvetica", 13)
        canvas.drawRightString(A4[0] - 20 * mm, 42 * mm, f"/ 100 — {band}")
        canvas.restoreState()

    def content(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(colors.black)
        canvas.rect(0, A4[1] - 16 * mm, A4[0], 16 * mm, fill=1, stroke=0)
        canvas.setFillColor(colors.white)
        canvas.setFont("Helvetica-Bold", 10)
        canvas.drawString(20 * mm, A4[1] - 11 * mm, "A4 · Accounting Health Review")
        canvas.setFillColor(colors.HexColor("#999999"))
        canvas.setFont("Helvetica", 8)
        canvas.drawRightString(A4[0] - 20 * mm, 12 * mm, f"Page {doc.page - 1}")
        canvas.restoreState()

    frame_cover = Frame(0, 0, A4[0], A4[1], id="cover")
    frame_content = Frame(20 * mm, 18 * mm, A4[0] - 40 * mm, A4[1] - 40 * mm, id="content")
    doc = BaseDocTemplate(buf, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm)
    doc.addPageTemplates([
        PageTemplate(id="cover", frames=[frame_cover], onPage=cover),
        PageTemplate(id="content", frames=[frame_content], onPage=content),
    ])

    story = [NextPageTemplate("content"), PageBreak()]
    story.append(Paragraph(f"Summary — {company}", ss["H2b"]))
    story.append(Paragraph(
        f"{stats['checks_run']} checks run · {stats['checks_passed']} passed · "
        f"{stats['checks_failed']} flagged · {stats['tb_rows']} TB rows · {stats['gl_rows']} GL lines.",
        ss["Body2"]))
    story.append(Paragraph(
        "This is an automated health review of accounting records — it highlights items for a qualified "
        "accountant to investigate. It is not an audit and does not provide assurance.", ss["Body2"]))

    if findings:
        story.append(Paragraph("Findings", ss["H2b"]))
        data = [["Severity", "Where", "What we found", "Suggested action"]]
        for f in findings:
            data.append([_SEV_LABEL.get(f["severity"], f["severity"]), f["ref"],
                         Paragraph(f["reason"], ss["Body2"]), Paragraph(f["action"], ss["Body2"])])
        t = Table(data, colWidths=[20 * mm, 38 * mm, 60 * mm, 52 * mm], repeatRows=1)
        styles = [("BACKGROUND", (0, 0), (-1, 0), colors.black),
                  ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                  ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                  ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                  ("VALIGN", (0, 0), (-1, -1), "TOP"),
                  ("LINEBELOW", (0, 0), (-1, -1), 0.4, colors.HexColor("#cccccc"))]
        for i, f in enumerate(findings, start=1):
            styles.append(("TEXTCOLOR", (0, i), (0, i), _SEV_GREY.get(f["severity"], colors.black)))
        t.setStyle(TableStyle(styles))
        story.append(t)
    else:
        story.append(Paragraph("No exceptions found. The records pass every automated check.", ss["Body2"]))

    doc.build(story)
    return buf.getvalue()
```

- [ ] **Step 4: Run tests**

Run: `python -m pytest tests/test_report.py -q`
Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: branded accounting-health PDF report"
```

---

### Task 11: AI deep narrative (key-gated)

**Files:**
- Create: `a4-accounting-health/engine/ai_review.py`
- Create: `a4-accounting-health/tests/test_ai_review.py`

`deep_narrative(company, score, band, findings) -> str | None`. Returns None when `ANTHROPIC_API_KEY` absent. AI sees only engine findings; produces narrative text. Never computes figures.

- [ ] **Step 1: Write the failing test (no key → None)**

```python
import os
from engine.ai_review import deep_narrative

def test_no_key_returns_none(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    assert deep_narrative("Acme", 70, "Some gaps", [{"id":"TB_BALANCE","severity":"must-fix","reason":"x","action":"y","ref":"z"}]) is None
```

- [ ] **Step 2: Run to verify fail**

Run: `python -m pytest tests/test_ai_review.py -q`
Expected: FAIL (cannot import name 'deep_narrative').

- [ ] **Step 3: Implement engine/ai_review.py**

```python
from __future__ import annotations
import os, json

_SYSTEM = (
    "You are a Maltese chartered accountant reviewing the OUTPUT of an automated accounting-records "
    "health check. You are given the engine's findings as JSON. Write a short, plain-English narrative "
    "(max ~180 words) for the business owner: summarise the overall health, then list the 3 most "
    "important things to fix first, in priority order. Do NOT invent or change any figure — only the "
    "figures present in the findings may be cited. Do not mention you are an AI model. No headings."
)

def deep_narrative(company: str, score: int, band: str, findings: list[dict]) -> str | None:
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        return None
    import anthropic
    client = anthropic.Anthropic(api_key=key)
    payload = {"company": company, "score": score, "band": band,
               "findings": [{k: f.get(k) for k in ("id", "severity", "ref", "reason", "action", "figures")} for f in findings]}
    msg = client.messages.create(
        model="claude-opus-4-8",
        max_tokens=600,
        system=_SYSTEM,
        messages=[{"role": "user", "content": json.dumps(payload)}],
    )
    return "".join(block.text for block in msg.content if getattr(block, "type", "") == "text").strip()
```

- [ ] **Step 4: Run tests**

Run: `python -m pytest tests/test_ai_review.py -q`
Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: key-gated AI deep narrative over engine findings"
```

---

### Task 12: FastAPI app + auth + endpoints

**Files:**
- Create: `a4-accounting-health/main.py`
- Create: `a4-accounting-health/tests/test_api.py`
- Reference: `a4-fs-review/main.py` for the HTTP Basic pattern.

Endpoints: `GET /healthz`, `GET /api/config`, `POST /api/health-review` (multipart `tb` and/or `gl`, plus `deep` flag). Basic auth via `APP_USER`/`APP_PASSWORD` env (default user `a4`; if `APP_PASSWORD` unset, auth is disabled for local dev).

- [ ] **Step 1: Write failing tests**

```python
from fastapi.testclient import TestClient
import main

client = TestClient(main.app)
TB = ("Code,Account,Debit,Credit\n1000,Cash,5000,0\n2100,Creditors,0,2000\n3000,Capital,0,3000\n")

def test_healthz():
    assert client.get("/healthz").json() == {"ok": True}

def test_config_reports_deep_flag():
    r = client.get("/api/config").json()
    assert "deepAvailable" in r

def test_review_tb_only_returns_score():
    r = client.post("/api/health-review", files={"tb": ("tb.csv", TB, "text/csv")})
    assert r.status_code == 200
    body = r.json()
    assert "score" in body and body["stats"]["tb_rows"] == 3

def test_review_requires_a_file():
    assert client.post("/api/health-review").status_code == 400

def test_review_rejects_bad_type():
    r = client.post("/api/health-review", files={"tb": ("notes.txt", "hi", "text/plain")})
    assert r.status_code == 415
```

- [ ] **Step 2: Run to verify fail**

Run: `python -m pytest tests/test_api.py -q`
Expected: FAIL (No module named 'main').

- [ ] **Step 3: Implement main.py**

```python
from __future__ import annotations
import os, secrets
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import JSONResponse
import base64

from engine.review import review
from engine.ai_review import deep_narrative
from report import build_pdf

app = FastAPI(title="A4 Accounting Health")
security = HTTPBasic(auto_error=False)

TB_EXT = (".csv", ".xlsx", ".xlsm", ".pdf")
GL_EXT = (".csv", ".xlsx", ".xlsm")
MAX_MB = int(os.environ.get("MAX_UPLOAD_MB", "20"))

def _auth(creds: HTTPBasicCredentials | None = Depends(security)):
    pw = os.environ.get("APP_PASSWORD")
    if not pw:
        return  # auth disabled for local dev
    user = os.environ.get("APP_USER", "a4")
    if not creds or not (secrets.compare_digest(creds.username, user) and secrets.compare_digest(creds.password, pw)):
        raise HTTPException(401, "Unauthorized", {"WWW-Authenticate": "Basic"})

@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.get("/api/config")
def config(_=Depends(_auth)):
    return {"deepAvailable": bool(os.environ.get("ANTHROPIC_API_KEY"))}

def _read(f: UploadFile | None, allowed: tuple[str, ...]):
    if f is None:
        return None, None
    name = (f.filename or "").lower()
    if not name.endswith(allowed):
        raise HTTPException(415, f"Unsupported file type: {f.filename}")
    data = f.file.read()
    if len(data) > MAX_MB * 1024 * 1024:
        raise HTTPException(413, "File too large.")
    return data, f.filename

@app.post("/api/health-review")
def health_review(tb: UploadFile | None = File(None), gl: UploadFile | None = File(None),
                  deep: str = Form("false"), _=Depends(_auth)):
    tb_bytes, tb_name = _read(tb, TB_EXT)
    gl_bytes, gl_name = _read(gl, GL_EXT)
    if not tb_bytes and not gl_bytes:
        raise HTTPException(400, "Provide a trial balance and/or a general ledger.")
    try:
        result = review(tb_bytes, tb_name, gl_bytes, gl_name)
    except ValueError as e:
        raise HTTPException(422, str(e))
    if deep == "true" and os.environ.get("ANTHROPIC_API_KEY"):
        narr = deep_narrative(result["company"], result["score"], result["band"], result["findings"])
        if narr:
            result["narrative"] = narr
            result["deepUsed"] = True
    pdf = build_pdf(result["company"], result["score"], result["band"], result["stats"], result["findings"])
    result["reportBase64"] = base64.b64encode(pdf).decode()
    result["reportName"] = f"{result['company']} - Accounting Health Review.pdf"
    return JSONResponse(result)
```

- [ ] **Step 4: Run tests**

Run: `python -m pytest tests/test_api.py -q`
Expected: 5 passed.

- [ ] **Step 5: Run the full suite**

Run: `python -m pytest -q`
Expected: all green (~30 tests).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: FastAPI app (health-review, config, auth)"
```

---

### Task 13: Docker + Railway deploy

**Files:**
- Create: `a4-accounting-health/Dockerfile`
- Create: `a4-accounting-health/railway.json`
- Create: `a4-accounting-health/.gitignore`
- Create: `a4-accounting-health/README.md`
- Reference: copy `a4-fs-review/Dockerfile` + `railway.json` and adapt (no LibreOffice needed here).

- [ ] **Step 1: .gitignore**

```
__pycache__/
*.pyc
.venv/
.env.local
```

- [ ] **Step 2: Dockerfile**

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PORT=8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
```

- [ ] **Step 3: railway.json**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "DOCKERFILE" },
  "deploy": { "healthcheckPath": "/healthz", "restartPolicyType": "ON_FAILURE" }
}
```

- [ ] **Step 4: README.md** — short: what it is, endpoints, env (`APP_USER`, `APP_PASSWORD`, `ANTHROPIC_API_KEY`, `MAX_UPLOAD_MB`), local run (`uvicorn main:app --port 8091`), deploy (`railway up --detach`). Note it is separate code from `a4-fs-review`.

- [ ] **Step 5: Build the image locally to verify it boots**

Run: `cd /c/Users/user/Downloads/a4-accounting-health && docker build -t a4ah . && docker run --rm -p 8091:8000 -e PORT=8000 a4ah &` then `curl -s localhost:8091/healthz`
Expected: `{"ok":true}` (skip if Docker unavailable; then just `uvicorn main:app --port 8091` and curl).

- [ ] **Step 6: Deploy to Railway** (user must be logged in via `railway.cmd login --browserless`)

Run: `C:\Users\user\.tools\node-v20.18.1-win-x64\railway.cmd up --detach`
Then set vars: `railway.cmd variables --set APP_USER=a4 --set APP_PASSWORD=<generated> --set ANTHROPIC_API_KEY=<key>`
Set EU region in the Railway dashboard (GDPR).

- [ ] **Step 7: Verify live**

Run: `curl -s https://<service>.up.railway.app/healthz` → `{"ok":true}`; `curl -u a4:<pw> -F tb=@sample_tb.csv https://<service>/api/health-review` → JSON with `score`.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "chore: Dockerfile + railway.json + README for deploy"
```

---

## Self-Review

**Spec coverage:** §2 inputs → Tasks 2,3. §3a TB checks → Task 5 (TB_BALANCE, TB_SUSPENSE, TB_SIGN, TB_DUP_CODE, TB_ROUNDING, TB_PY_SWING). §3b GL checks → Task 6 (GL_DUP_POSTING, GL_WEEKEND[=back-dated/weekend], GL_ROUND_JOURNAL, GL_SEQUENCE_GAP, GL_UNBALANCED_JOURNAL, GL_OUTLIER). §3c tie-out → Task 7 (XREF_GL_NETS_ZERO, XREF_MOVEMENT). §4 score → Task 8. §5 AI → Task 11. §6 output JSON+PDF → Tasks 9,10,12. §7 service → Task 12. §9 testing → every task. §10 rollout → Task 13.

**Deferred vs spec (note for executor):** spec §3a `TB_CONTROL_MISSING`, §3b `GL_CLOSED_PERIOD` and `GL_DORMANT_ACTIVITY` are NOT in the task code above to keep the first cut tight. They are optional follow-ups — add each as its own TDD task (test + impl + register in the `_*_CHECKS` list and `_*_CHECK_IDS`) only if the user wants them. Flag this to the user at handoff; do not silently drop them.

**Placeholder scan:** README (Task 13 Step 4) is described not shown — acceptable (prose doc, not code). All code steps contain full code.

**Type consistency:** `Finding` fields (id/category/severity/ref/reason/action/figures) consistent across Tasks 5–7, 9, 10. `review()` returns dict consumed by `build_pdf` (company, score, band, stats, findings) and `main.py` — signatures match. Check-id lists in Task 9 match the ids emitted in Tasks 5–7.

**Website integration is a SEPARATE plan** — `2026-06-25-a4-accounting-health-website.md` (proxy route, two-path DeepReview UI, env vars, redeploy). Build + deploy THIS engine first so `A4_ACCOUNTING_URL` exists.
