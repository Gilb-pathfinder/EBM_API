# VSDC/EBM CIS — Verification Checklist by Category

**Target:** 2-hour verification minimum per category  
**Overall Status:** 91% complete (53/58 features)

---

## 1. ITEM MANAGEMENT
**Status:** ✅ ~95% Complete | **Remaining:** F-12 composition UI details

| # | Feature | Status | Test Time | Priority | Notes |
|---|---------|--------|-----------|----------|-------|
| F-02 | Item Classification Codes | ✅ Done | 20 min | CRITICAL | Foundation; test HS code hierarchy |
| F-11 | Item Sync from EBM | ✅ Done | 30 min | HIGH | Delta sync with itemLastReqDt |
| F-12 | Item Composition | 🟡 Partial | 40 min | MEDIUM | Core done; UI refinement may be needed |
| | **CATEGORY TOTAL** | | **90 min** | | **Can start immediately** |

**What to Verify:**
- [ ] Item codes load correctly from EBM
- [ ] Classification codes (HS codes) display properly
- [ ] Product type extraction works (raw/finished/service/composed)
- [ ] Stock levels sync correctly
- [ ] Composition items: components deduct from inventory
- [ ] Composed items cannot be sold directly

**Dependencies:** F-02 → F-11 → F-12

---

## 2. INVOICE MANAGEMENT
**Status:** ⚠️ ~75% Complete | **Remaining:** F-27, F-28, F-29, F-32 need verification

| # | Feature | Status | Test Time | Priority | Notes |
|---|---------|--------|-----------|----------|-------|
| F-23 | Sale Receipt Generation | ✅ Done | 30 min | CRITICAL | Core sales; test all receipt types |
| F-27 | Multi-Currency Support | ✅ Done* | 120 min | HIGH | *Status unclear; needs verification |
| F-28 | Mixed Payment Support | 🟡 Partial | 120 min | HIGH | UI may need refinement |
| F-29 | Credit Sale Details | 🟡 Partial | 120 min | HIGH | Field tracking done; UI completion |
| F-32 | Export Invoice (Cat D) | 🟡 Partial | 120 min | MEDIUM | Validation done; reporting review |
| | **CATEGORY TOTAL** | | **510 min (8.5h)** | | **Start after F-23 verified** |

**What to Verify:**
- [ ] Sale creation with all metadata
- [ ] Currency selection and exchange rate lookup
- [ ] Mixed payment breakdown tracking
- [ ] Credit sale with expected payment date
- [ ] Export invoice with category D enforcement
- [ ] All fields display on receipt
- [ ] Fields persist in database

**Dependency Chain:**
```
F-23 (Sales)
  ├→ F-27 (Currency)
  ├→ F-28 (Mixed Payment)
  ├→ F-29 (Credit Sales)
  └→ F-32 (Export)
```

---

## 3. PURCHASE OPERATIONS
**Status:** ⚠️ ~60% Complete | **Remaining:** F-36 refund service method

| # | Feature | Status | Test Time | Priority | Notes |
|---|---------|--------|-----------|----------|-------|
| F-34 | Save Purchase | ✅ Done | 30 min | CRITICAL | Core purchase; mirror of sales |
| F-35 | Purchase List | ✅ Done | 20 min | HIGH | List/filter/search |
| F-36 | Purchase Refund | 🟡 Partial | 120 min | MEDIUM | **Needs 3h implementation first** |
| | **CATEGORY TOTAL** | | **170 min (2.8h)** | | **F-36 blocks; implement first** |

**What to Verify:**
- [ ] Purchase record creation
- [ ] Items added to stock correctly
- [ ] Purchase total calculated accurately
- [ ] EBM transmission successful
- [ ] Offline queueing works
- [ ] Purchase list displays all data
- [ ] Refund reverses stock and amounts

**Dependency Chain:**
```
F-34 (Save Purchase)
  ├→ F-35 (List)
  └→ F-36 (Refund) [NEEDS IMPLEMENTATION]
```

**BLOCKER:** F-36 requires implementing `PurchaseAction.createRefund()` service method (3 hours)

---

## 4. STOCK MANAGEMENT
**Status:** ✅ 100% Complete

| # | Feature | Status | Test Time | Priority | Notes |
|---|---------|--------|-----------|----------|-------|
| F-16 | Stock Adjustment with Reason Codes | ✅ Done | 25 min | HIGH | Qty adjustment; reason tracking |
| F-17 | Stock Item List | ✅ Done | 20 min | HIGH | Inventory view |
| F-18 | Stock Movement Log | ✅ Done | 25 min | MEDIUM | History/audit trail |
| F-20 | Internal Branch Transfer | ✅ Done | 30 min | MEDIUM | Inter-branch movements |
| | **CATEGORY TOTAL** | | **100 min (1.7h)** | | **All ready; can verify anytime** |

**What to Verify:**
- [ ] Stock adjustments work (increase/decrease)
- [ ] Reason codes display on receipt
- [ ] Movement log shows all transaction types
- [ ] Branch transfers move items correctly
- [ ] Quantities match across locations
- [ ] All movements recorded for audit

**No Dependencies:** All independent; can verify in parallel

---

## 5. TAX MANAGEMENT
**Status:** ✅ 100% Complete

| # | Feature | Status | Test Time | Priority | Notes |
|---|---------|--------|-----------|----------|-------|
| F-06 | Tax Categories (A, B, C, D) | ✅ Done | 15 min | CRITICAL | Foundation for all transactions |
| F-08 | Tax Rate Configuration | ✅ Done | 20 min | CRITICAL | Rates must match RRA rates |
| F-09 | Tax Amount Calculation | ✅ Done | 25 min | CRITICAL | Accuracy critical for RRA |
| | **CATEGORY TOTAL** | | **60 min (1h)** | | **Critical for compliance** |

**What to Verify:**
- [ ] All 4 categories available (A, B, C, D)
- [ ] Categories correctly assigned to items
- [ ] Tax rates load correctly (e.g., 18% for B)
- [ ] Tax calculations accurate (test various amounts)
- [ ] Rounding handled correctly
- [ ] Receipt shows accurate tax breakdown

**Dependency Chain:**
```
F-06 (Categories) → F-08 (Rates) → F-09 (Calculation)
```

---

## 6. BRANCH MANAGEMENT
**Status:** ✅ 100% Complete

| # | Feature | Status | Test Time | Priority | Notes |
|---|---------|--------|-----------|----------|-------|
| F-40 | Branch CRUD Operations | ✅ Done | 30 min | HIGH | Create/update/list branches |
| F-41 | Branch User Management | ✅ Done | 30 min | HIGH | Assign users to branches |
| | **CATEGORY TOTAL** | | **60 min (1h)** | | **All ready for verification** |

**What to Verify:**
- [ ] Branch creation with all fields
- [ ] Branch editing and updates
- [ ] Branch list displays correctly
- [ ] Users assigned to branches
- [ ] Permissions enforced per branch
- [ ] Data isolation by branch works

**Dependency Chain:**
```
F-40 (Branch CRUD) → F-41 (User Assignment)
```

---

## 7. CUSTOMER MANAGEMENT
**Status:** ✅ 100% Complete

| # | Feature | Status | Test Time | Priority | Notes |
|---|---------|--------|-----------|----------|-------|
| F-42 | Customer CRUD | ✅ Done | 25 min | HIGH | Create/edit/search customers |
| F-43 | Customer TIN Sync (RRA) | ✅ Done | 25 min | HIGH | Lookup from RRA database |
| | **CATEGORY TOTAL** | | **50 min (0.8h)** | | **All ready for verification** |

**What to Verify:**
- [ ] Customer creation with TIN, name, location
- [ ] Customer editing and updates
- [ ] TIN format validation (15 digits)
- [ ] RRA lookup returns customer name/status
- [ ] Auto-fill works on match
- [ ] Fallback on RRA unavailable

**Dependency Chain:**
```
F-42 (Customer CRUD) → F-43 (TIN Lookup)
```

---

## 8. INSURANCE MANAGEMENT
**Status:** ✅ 100% Complete

| # | Feature | Status | Test Time | Priority | Notes |
|---|---------|--------|-----------|----------|-------|
| F-44 | Insurance Management | ✅ Done | 120 min | MEDIUM | Code assignment; rate calc |
| | **CATEGORY TOTAL** | | **120 min (2h)** | | **May need detailed verification** |

**What to Verify:**
- [ ] Insurance codes assigned to items
- [ ] Insurance rates applied correctly
- [ ] Insurance amount calculated accurately
- [ ] Insurance displays on receipt
- [ ] Included in totals correctly
- [ ] Works with all tax categories

**Dependencies:** Requires F-02 (item classification)

---

## 9. REPORTING & COMPLIANCE
**Status:** ✅ 100% Complete (9 reports)

| # | Feature | Status | Test Time | Priority | Notes |
|---|---------|--------|-----------|----------|-------|
| F-45 | X Report (Intraday) | ✅ Done | 30 min | CRITICAL | Sales summary; required by RRA |
| F-46 | Z Report (End of Day) | ✅ Done | 30 min | CRITICAL | Daily close; blocks next sales |
| F-47 | PLU Report | ✅ Done | 15 min | HIGH | Item sales summary |
| F-48 | Electronic Journal (EBM) | ✅ Done | 20 min | CRITICAL | EBM delta sync; audit log |
| F-49 | Period Report | ✅ Done | 15 min | HIGH | Custom date range summary |
| F-50 | Purchases Report | ✅ Done | 15 min | MEDIUM | Purchase summary |
| F-51 | Item Group Breakdown | ✅ Done | 20 min | HIGH | Sales by classification group |
| F-52 | RRA Notices | ✅ Done | 15 min | MEDIUM | Notice display/handling |
| F-54 | Signature Chaining | ✅ Done | 20 min | CRITICAL | Tamper-evident receipts |
| | **CATEGORY TOTAL** | | **180 min (3h)** | | **All ready; cross-verify vs source** |

**What to Verify:**
- [ ] X report totals match today's sales
- [ ] Z report blocks sales correctly
- [ ] EJ syncs correctly from EBM
- [ ] All reports export/print correctly
- [ ] Signature chain verification works
- [ ] Report data matches transaction sources

**Note:** All reports depend on correct transaction recording from F-23, F-34, F-16, F-20

---

## 10. SYSTEM INFRASTRUCTURE
**Status:** ✅ 100% Complete (5 features)

| # | Feature | Status | Test Time | Priority | Notes |
|---|---------|--------|-----------|----------|-------|
| F-53 | Offline Detection | ✅ Done | 30 min | HIGH | Connection loss handling |
| F-55 | Cash Management | ✅ Done | 30 min | MEDIUM | Opening deposit; movements |
| F-56 | Settings Persistence | ✅ Done | 30 min | MEDIUM | SMTP, webhooks, timezone |
| F-57 | Operator Code Sync | ✅ Done | 15 min | LOW | Operator management |
| F-58 | EBM Response Code Handler | ✅ Done | 15 min | LOW | Error mapping; recovery actions |
| | **CATEGORY TOTAL** | | **120 min (2h)** | | **All ready for verification** |

**What to Verify:**
- [ ] Offline mode activates correctly
- [ ] Transactions queue when offline
- [ ] Auto-sync on reconnect works
- [ ] SMTP settings persist
- [ ] Response code lookup returns correct messages
- [ ] Recovery strategies make sense

**No External Dependencies:** All work independently

---

## Summary by Effort & Priority

### 🔴 CRITICAL (Must Complete/Verify First)
- F-02 Item Classification (20 min) — Foundation
- F-06 Tax Categories (15 min) — Foundation
- F-23 Sale Creation (30 min) — Core
- F-34 Purchase Save (30 min) — Core
- **Total: 95 minutes**

### 🟠 HIGH (Complete Phase 2)
- F-27, F-28, F-29, F-32 (Invoice features: 480 min)
- F-40, F-42 (Branch/Customer: 55 min)
- F-45, F-46, F-48 (Reports: 80 min)
- **Total: 615 minutes (10 hours)**

### 🟡 MEDIUM (Complete Phase 3)
- F-11, F-12 (Item sync: 70 min)
- F-35, F-36 (Purchase features: 140 min)
- F-44 (Insurance: 120 min)
- F-49, F-50, F-51 (Reports: 50 min)
- **Total: 380 minutes (6.3 hours)**

### 🟢 LOW (Complete Phase 4)
- F-16, F-17, F-18, F-20 (Stock: 100 min)
- F-52, F-54 (Compliance: 35 min)
- F-53, F-55, F-56, F-57, F-58 (Infrastructure: 90 min)
- **Total: 225 minutes (3.75 hours)**

---

## Recommended Verification Order

**Day 1 (8 hours):**
1. Phase 1: F-02, F-06, F-23, F-34 (Foundation) — 95 min
2. Phase 2: F-27, F-28, F-29, F-32 (Invoice features) — 480 min
3. F-40, F-42 (Branch/Customer) — 55 min

**Day 2 (8 hours):**
1. Implement F-36 (3 hours)
2. F-35, F-36 verification (2.5 hours)
3. F-45, F-46, F-48 (Reports) — 80 min
4. F-11, F-12 (Item features) — 70 min

**Day 3 (8 hours):**
1. F-44 (Insurance) — 2 hours
2. Stock features (F-16-F-20) — 1.7 hours
3. Infrastructure (F-53-F-58) — 2 hours
4. Reports (F-49-F-52, F-54) — 1.8 hours

**Total: 24 hours (3 days) of focused verification**
