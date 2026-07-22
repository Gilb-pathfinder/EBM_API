# VSDC/EBM CIS — Implementation Roadmap & Verification Plan

**Generated:** 2026-05-31  
**Overall Progress:** 53/58 features complete (91%)  
**Remaining Work:** 4 Partial + 1 Missing

---

## Executive Summary

The VSDC/EBM CIS system is 91% feature-complete. Remaining work consists of:
- **4 Partially Implemented Features** — require completion/integration
- **1 Missing Feature** — needs full implementation

This roadmap provides a verification plan (2-hour minimum per feature) and implementation priorities based on:
1. Dependency relationships
2. Complexity/effort estimate
3. RRA compliance criticality
4. System readiness (can start without other features)

---

## 1. ITEM MANAGEMENT

### Status Summary
- ✅ F-02 Item classification codes — Complete
- ✅ F-11 Item sync from EBM — Complete
- ✅ F-12 Item composition — Complete (with note on details)
- ⚠️ **F-12 Item Composition Detail** — Partial (composition list may need UI completion)

### Verification Checklist (2 hours)

**F-02 Classification Codes:**
- [ ] Verify item codes load from EBM correctly
- [ ] Test filtering by classification code in inventory
- [ ] Confirm HS code hierarchy working
- [ ] Check product type extraction (raw material, finished product, service, composed)
- Estimated: 20 min

**F-11 Item Sync:**
- [ ] Test delta sync using itemLastReqDt parameter
- [ ] Verify incremental fetch works
- [ ] Check stock levels update correctly
- [ ] Confirm item metadata (barcode, units) synced
- Estimated: 30 min

**F-12 Item Composition:**
- [ ] Test composition item creation
- [ ] Verify components quantity deduction on sale
- [ ] Check composition item cannot be sold directly
- [ ] Test UI for adding/managing components
- Estimated: 40 min

**Dependency Tree:**
```
F-02 (Item Classes) — no dependencies
  ↓
F-11 (Item Sync) — depends on F-02
  ↓
F-12 (Composition) — depends on F-02, F-11
```

**Start With:** F-02 (no dependencies, foundational)

---

## 2. INVOICE MANAGEMENT

### Status Summary
- ✅ F-23 Sale receipt generation — Complete
- ⚠️ **F-27 Multi-Currency** — Status unclear (docs say Done, but summary says Missing)
- ⚠️ **F-28 Mixed Payment** — Partial (UI may need refinement)
- ⚠️ **F-29 Credit Sales** — Partial (field tracking complete, may need UI)
- ⚠️ **F-32 Export Invoice (Cat D)** — Partial (validation done, may need reporting)

### Verification Checklist (2 hours each feature)

**F-27 Multi-Currency Support:**
- [ ] Test currency selection in new invoice
- [ ] Verify exchange rate lookup works
- [ ] Check original amount and converted amount in receipt
- [ ] Test receipt display with currency conversion
- [ ] Verify currency field saved in sale record
- Estimated: 2 hours

**F-28 Mixed Payment Support:**
- [ ] Test payment breakdown UI (cash + credit mix)
- [ ] Verify breakdown amounts sum to total
- [ ] Check payment breakdown saved in sale
- [ ] Test receipt displays breakdown correctly
- [ ] Verify X/Z reports include payment breakdown
- Estimated: 2 hours

**F-29 Credit Sales:**
- [ ] Test expected payment date entry
- [ ] Verify creditStatus set to 'outstanding' on creation
- [ ] Check expected payment date displays on receipt
- [ ] Test credit payment tracking UI
- [ ] Verify credit sales separated in reports
- Estimated: 2 hours

**F-32 Export Invoice (Category D):**
- [ ] Test export date selection
- [ ] Verify tax type enforcement (all items must be D)
- [ ] Check export document reference entry
- [ ] Test country code selection
- [ ] Verify export invoice marked in receipt
- [ ] Check export invoices in reporting
- Estimated: 2 hours

**Dependency Tree:**
```
F-23 (Sale Creation) — no dependencies
  ├→ F-27 (Currency) — depends on F-23
  ├→ F-28 (Mixed Payment) — depends on F-23
  ├→ F-29 (Credit Sales) — depends on F-23
  └→ F-32 (Export) — depends on F-23
```

**Start With:** F-23 verification first (foundation), then F-27, F-28, F-29, F-32 in parallel (all independent)

---

## 3. PURCHASE OPERATIONS

### Status Summary
- ✅ F-34 Save purchase — Complete
- ✅ F-35 Purchase list — Complete
- ⚠️ **F-36 Purchase Refund** — Partial (service method not implemented)

### Verification Checklist (2 hours)

**F-34 Save Purchase:**
- [ ] Test purchase record creation
- [ ] Verify items added to stock
- [ ] Check purchase total calculated correctly
- [ ] Test EBM transmission
- [ ] Verify offline queueing works
- Estimated: 30 min

**F-35 Purchase List:**
- [ ] Test purchase filtering by date range
- [ ] Check list displays all fields
- [ ] Verify sorting by amount/date
- [ ] Test search functionality
- Estimated: 20 min

**F-36 Purchase Refund:**
- [ ] Test refund record creation (UI)
- [ ] **Missing:** Implement `PurchaseAction.createRefund()` service method
- [ ] Test items returned to stock
- [ ] Verify refund total calculated correctly
- [ ] Test EBM transmission
- **Effort:** 3 hours to complete + 2 hours verification
- Estimated: 2 hours (if service completed)

**Dependency Tree:**
```
F-34 (Save Purchase) — no dependencies
  ├→ F-35 (List) — depends on F-34
  └→ F-36 (Refund) — depends on F-34
```

**Start With:** F-34 (foundation), then F-35, then F-36

---

## 4. STOCK MANAGEMENT

### Status Summary
- ✅ F-16 Stock adjustment with reason codes — Complete
- ✅ F-17 Stock item list — Complete
- ✅ F-18 Stock movement log — Complete
- ✅ F-20 Internal branch transfer — Complete

### Verification Checklist (2 hours)

**F-16 Stock Adjustment:**
- [ ] Test adjustment creation with reason code
- [ ] Verify quantity updated correctly
- [ ] Check reason code displays on receipt
- [ ] Test both increase and decrease
- Estimated: 25 min

**F-17 Stock List:**
- [ ] Test list displays all items
- [ ] Verify quantities match
- [ ] Test filtering by classification
- [ ] Check sorting options
- Estimated: 20 min

**F-18 Stock Movement Log:**
- [ ] Test movement history displays
- [ ] Verify all movements recorded (sale, purchase, transfer, adjustment)
- [ ] Check filtering by movement type
- [ ] Test date range filtering
- Estimated: 25 min

**F-20 Internal Branch Transfer:**
- [ ] Test inter-branch transfer creation
- [ ] Verify items moved between branches
- [ ] Check transfer approval workflow (if applicable)
- [ ] Test transfer reversal
- Estimated: 30 min

**Dependency Tree:**
```
(No external dependencies)
F-16, F-17, F-18, F-20 can be verified independently
```

**Start With:** F-16 (foundational), then F-17, F-18, F-20 (independent)

---

## 5. TAX MANAGEMENT

### Status Summary
- ✅ F-06 Tax categories (A, B, C, D) — Complete
- ✅ F-08 Tax rate configuration — Complete
- ✅ F-09 Tax amount calculation — Complete

### Verification Checklist (2 hours)

**F-06 Tax Categories:**
- [ ] Verify all 4 categories available (A, B, C, D)
- [ ] Check category assignments in items
- [ ] Test category enforcement in invoices
- Estimated: 15 min

**F-08 Tax Rates:**
- [ ] Verify rates load from database/EBM
- [ ] Test rate application (e.g., 18% for B)
- [ ] Check rate updates propagate
- Estimated: 20 min

**F-09 Tax Calculation:**
- [ ] Test tax amount on single item
- [ ] Verify tax on multi-item invoice
- [ ] Check rounding accuracy
- [ ] Test tax-on-tax scenarios (if applicable)
- [ ] Verify receipt shows tax breakdown
- Estimated: 25 min

**Dependency Tree:**
```
F-06 (Categories) — no dependencies
  ├→ F-08 (Rates) — depends on F-06
  └→ F-09 (Calculation) — depends on F-06, F-08
```

**Start With:** F-06, then F-08, then F-09

---

## 6. BRANCH MANAGEMENT

### Status Summary
- ✅ F-40 Branch management (CRUD) — Complete
- ✅ F-41 Branch user management — Complete

### Verification Checklist (2 hours)

**F-40 Branch Management:**
- [ ] Test branch creation
- [ ] Verify branch settings (location, manager, etc.)
- [ ] Test branch editing
- [ ] Check branch deletion/archiving
- [ ] Verify branch list displays correctly
- Estimated: 30 min

**F-41 Branch User Management:**
- [ ] Test assigning users to branches
- [ ] Verify permissions enforcement per branch
- [ ] Test user removal from branch
- [ ] Check branch-specific data isolation
- Estimated: 30 min

**Dependency Tree:**
```
F-40 (Branch CRUD) — no external dependencies
  └→ F-41 (Users) — depends on F-40
```

**Start With:** F-40, then F-41

---

## 7. CUSTOMER MANAGEMENT

### Status Summary
- ✅ F-42 Customer CRUD — Complete
- ✅ F-43 Customer TIN sync from RRA — Complete

### Verification Checklist (2 hours)

**F-42 Customer Management:**
- [ ] Test customer creation
- [ ] Verify customer fields (name, TIN, location)
- [ ] Test customer editing
- [ ] Check customer search/list
- Estimated: 25 min

**F-43 TIN Lookup:**
- [ ] Test TIN format validation (15 digits)
- [ ] Verify RRA lookup works
- [ ] Check auto-fill on match
- [ ] Test fallback on RRA unavailable
- [ ] Verify customer name and status returned
- Estimated: 25 min

**Dependency Tree:**
```
F-42 (Customer CRUD) — no dependencies
  └→ F-43 (TIN Sync) — depends on F-42
```

**Start With:** F-42, then F-43

---

## 8. INSURANCE MANAGEMENT

### Status Summary
- ✅ F-44 Insurance management — Complete

### Verification Checklist (2 hours)

**F-44 Insurance:**
- [ ] Test insurance code assignment to items
- [ ] Verify insurance rate applied
- [ ] Check insurance amount calculated
- [ ] Test insurance displays on receipt
- [ ] Verify insurance included in totals
- Estimated: 2 hours

**Dependency Tree:**
```
F-44 (Insurance) — depends on item classification (F-02)
```

**Start With:** After F-02

---

## 9. REPORTING & COMPLIANCE

### Status Summary (Complete)
- ✅ F-45 X Report (Intraday) — Complete
- ✅ F-46 Z Report (End of Day) — Complete
- ✅ F-47 PLU Report — Complete
- ✅ F-48 Electronic Journal — Complete with EBM sync
- ✅ F-49 Period Report — Complete
- ✅ F-50 Purchases Report — Complete
- ✅ F-51 Item Group Breakdown (X/Z) — Complete
- ✅ F-52 RRA Notices — Complete
- ✅ F-54 Signature Chaining — Complete

### Verification Checklist (2 hours per report)

All reports should be verified to ensure:
- [ ] Date range filtering works
- [ ] Totals are accurate (match against source data)
- [ ] PDF generation succeeds
- [ ] Print output is readable
- [ ] Data exports correctly (where applicable)

**Priority:** After invoice/purchase/stock features (these reports depend on transaction data)

---

## 10. SYSTEM INFRASTRUCTURE

### Status Summary (Complete)
- ✅ F-53 Offline detection — Complete
- ✅ F-55 Cash management — Complete
- ✅ F-56 Settings persistence — Complete
- ✅ F-57 Operator code sync — Complete
- ✅ F-58 Response code handler — Complete

### Verification Checklist (2 hours per feature)

**F-53 Offline Detection:**
- [ ] Verify offline mode activates on connection loss
- [ ] Check queuing works offline
- [ ] Test reconnection detection
- [ ] Verify auto-sync on reconnect
- Estimated: 30 min

**F-55 Cash Management:**
- [ ] Test opening deposit entry
- [ ] Verify cash movement tracking
- [ ] Test withdrawal/deposit recording
- Estimated: 30 min

**F-56 Settings Persistence:**
- [ ] Test SMTP settings save/load
- [ ] Verify webhook config works
- [ ] Test timezone setting
- [ ] Check cache invalidation
- Estimated: 30 min

**F-57 Operator Code Sync:**
- [ ] Test operator code creation
- [ ] Verify sync with EBM
- [ ] Check code uniqueness
- Estimated: 15 min

**F-58 Response Code Handler:**
- [ ] Test response code lookup endpoints
- [ ] Verify appropriate error messages
- [ ] Check recovery strategy suggestions
- Estimated: 15 min

---

## Verification Implementation Schedule

### Phase 1: Foundation (Start Here)
**Effort:** 2 hours each  
**Total:** 6 hours

1. **F-02 Item Classification** ← No dependencies
   - Simple lookup functionality
   - Foundation for all item operations

2. **F-23 Sale Creation** ← No dependencies (except basic items)
   - Core transaction functionality
   - Foundation for F-27, F-28, F-29, F-32

3. **F-34 Purchase Save** ← No dependencies
   - Mirror to sales
   - Foundation for F-36

### Phase 2: Core Features (Can run in parallel)
**Effort:** 2 hours each × 4 features = 8 hours

- **F-27 Multi-Currency** (depends: F-23)
- **F-28 Mixed Payment** (depends: F-23)
- **F-29 Credit Sales** (depends: F-23)
- **F-32 Export Invoice** (depends: F-23)

### Phase 3: Supporting Features
**Effort:** 2 hours each × 6 features = 12 hours

- **F-11 Item Sync** (depends: F-02)
- **F-12 Item Composition** (depends: F-02, F-11)
- **F-35 Purchase List** (depends: F-34)
- **F-36 Purchase Refund** (depends: F-34) — *Requires 3h implementation first*
- **F-40 Branch Management**
- **F-42 Customer Management**

### Phase 4: Reporting & Compliance
**Effort:** 2 hours each × 10 features = 20 hours

- **F-45 through F-51** (Sales & inventory reports)
- **F-52 RRA Notices**
- **F-54 Signature Chaining**
- All dependent on Phase 1-3 completion

### Phase 5: Infrastructure & System
**Effort:** 2 hours each × 5 features = 10 hours

- **F-53 Offline Detection**
- **F-55 Cash Management**
- **F-56 Settings Persistence**
- **F-57 Operator Code Sync**
- **F-58 Response Code Handler**

---

## Remaining Implementation Work

### Must Complete (Blocking)
| Feature | Effort | Priority | Note |
|---------|--------|----------|------|
| F-36 Purchase Refund | 3h impl + 2h verify | HIGH | Service method stub exists, needs implementation |

### May Need Completion (Partial)
| Feature | Status | Effort | Priority | Note |
|---------|--------|--------|----------|------|
| F-27 Multi-Currency | Unclear | 2h verify | MEDIUM | Docs show Done; verify actual state |
| F-28 Mixed Payment | Partial | 2h verify | MEDIUM | Core logic done; UI refinement may be needed |
| F-29 Credit Sales | Partial | 2h verify | MEDIUM | Field tracking done; UI completion |
| F-32 Export Invoice | Partial | 2h verify | MEDIUM | Validation done; reporting may need work |
| F-12 Composition | Partial | 2h verify | LOW | Core logic done; UI may need refinement |

---

## Quick Reference: Feature by Category

### 🔴 CRITICAL (Must Verify/Complete Before Testing)
- F-23 Sale Creation
- F-34 Purchase Save
- F-06 Tax Categories
- F-02 Item Classification

### 🟠 HIGH (Complete within Phase 2)
- F-27, F-28, F-29, F-32 (Invoice enhancements)
- F-40, F-42 (Branch/Customer setup)
- F-36 Purchase Refund

### 🟡 MEDIUM (Complete within Phase 3)
- F-11, F-12 (Item sync/composition)
- F-35 Purchase List
- F-43 TIN Lookup
- F-44 Insurance

### 🟢 LOW (Complete in Phase 4-5)
- All reporting features (F-45-F-51)
- All infrastructure features (F-53-F-58)

---

## Estimated Total Verification Time

| Phase | Features | Time Each | Total |
|-------|----------|-----------|-------|
| Phase 1: Foundation | 3 | 2h | 6h |
| Phase 2: Core | 4 | 2h | 8h |
| Phase 3: Supporting | 6 | 2h | 12h |
| Phase 4: Reporting | 10 | 2h | 20h |
| Phase 5: Infrastructure | 5 | 2h | 10h |
| **TOTAL** | **28** | **2h** | **56h** |

**Plus Implementation:**
- F-36 Purchase Refund: 3h (implementation) + 2h (verification) = 5h

**Grand Total Estimate: 61 hours (approximately 8 working days)**

---

## Notes for RRA Compliance

Per VSDCSPECIFICATIONDOCUMENT.pdf, the following are CRITICAL for RRA approval:
- ✅ Receipt signature chaining (F-54)
- ✅ Z report (F-46)
- ✅ Electronic Journal (F-48)
- ✅ Tax categories (F-06)
- ⚠️ All transaction recording must be verified for accuracy
- ⚠️ All reports must match transaction source data

---

## Next Steps

1. **Start Phase 1** (Foundation) — Verify F-02, F-23, F-34
2. **Complete F-36** (3-hour implementation) if not already done
3. **Run Phase 2-5** in order, with parallel testing where dependencies allow
4. **Create test data** representing typical business scenarios
5. **Cross-verify** reports against source transactions for accuracy

