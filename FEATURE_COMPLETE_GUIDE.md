# VSDC / EBM CIS — Complete Feature Guide

> **Purpose:** Full feature inventory for the CIS/ERP system, ordered from simplest to most complex, with time estimates, document references, EBM API endpoints, and dependency relationships.
> **Spec documents used:** `CISforVSDC_technical_specsnew.pdf` (CIS spec) · `VSDCSPECIFICATIONDOCUMENT.pdf` (VSDC spec v1.0.5)
> **Stack:** AdonisJS TypeScript (`yb-vsdc-api`) + React (`frontend`)

---

## How to Read This Document

| Column | Meaning |
|---|---|
| **Status** | `✅ Done` · `🟡 Partial` · `❌ Missing` |
| **Est.** | Development time estimate (hours) for one focused developer |
| **CIS Ref** | Section number in `CISforVSDC_technical_specsnew.pdf` |
| **VSDC Ref** | Section number in `VSDCSPECIFICATIONDOCUMENT.pdf` |
| **EBM Endpoint** | The actual API call sent to the EBM device |
| **Depends On** | Feature IDs that must exist before this one |

---

## EBM API Category Table (from CISforVSDC_technical_specsnew.pdf)

This is the master table the spec uses to define what a CIS must do:

| # | Category | CIS Action | EBM Endpoint | Direction |
|---|---|---|---|---|
| 1 | Initialize | Send device info + fetch initial data | `selectInitInfo` | CIS → EBM |
| 2 | Codes | Fetch classification & unit codes | `selectCodes` | CIS ← EBM |
| 3 | Branch | Save/update branch & users info | `saveBhfInfo`, `selectBhfInfo` | CIS ↔ EBM |
| 4 | Items | Register/update items | `saveItem`, `selectItemInfo` | CIS ↔ EBM |
| 5 | Imports | Approve or cancel import declarations | `saveImportItemApproval`, `selectImportItemList` | CIS ↔ EBM |
| 6 | Sales | Send every sale receipt | `saveSales`, `selectTrnsSalesDataS` | CIS ↔ EBM |
| 7 | Purchases | Register B2B purchases | `savePurchase`, `selectTrnsPurchaseSales` | CIS ↔ EBM |
| 8 | Stock | Record stock in/out & adjustments | `saveStockMaster`, `selectStockMaster` | CIS ↔ EBM |
| 9 | Notices | Pull RRA notices (messages/alerts) | `selectNotice` | CIS ← EBM |
| 10 | Reports | X Report, Z Report, PLU, EJ | local + `selectTrnsSalesDataS` | CIS only |

---

## PHASE 1 — Foundation: Initialization & System Setup

> These are prerequisites. Nothing else works without them. Must be done first.

### F-01 · EBM Initialization (`selectInitInfo`)
- **Status:** ✅ Done — `POST /user/init` → `users_controller.ts:init`
- **Est.:** 3h
- **CIS Ref:** §2 (Initialization), §4.1
- **VSDC Ref:** §3.1 — Initialize
- **EBM Endpoint:** `POST /initializer/selectInitInfo`
- **What it does:** On first login, the CIS sends the device serial (sdcId), TIN, and branch code. EBM returns the opening deposit (initial stock values), tax types, and EBM version info.
- **Depends On:** Nothing (this is the root)
- **What must be verified:**
  - Country code `RW` is sent correctly in every request header
  - `sdcId` matches the physical EBM device
  - Response stores `taxTypes`, `cisApiVersion`, `ebmApiVersion` in user record
  - Error code `001` (success) handled, all other codes show user-friendly error message
  - Opening stock deposit values recorded if present in init response

---

### F-02 · Classification & Unit Codes Sync (`selectCodes`)
- **Status:** ✅ Done — fully implemented and verified
- **Est.:** 2h
- **CIS Ref:** §3 (Codes), §4.2
- **VSDC Ref:** §3.2 — Select Codes
- **EBM Endpoint:** `POST /itemClass/selectItemsClass` (HS codes) · `POST /code/selectCodes` (unit/packaging codes)
- **What it does:** Fetches the full list of item classification codes (HS codes), unit of measure codes, and packaging codes from EBM. Stored locally and used when creating items.
- **Depends On:** F-01
- **Implemented:**
  - `GET /item/classification/sync` — now open to both admin AND operators (EBM spec §3 requires this)
  - Admin uses delta sync via `classificationLastReqDt`; operators do a full sync
  - **Settings page** (`/settings`) — "Classification Codes" card with Sync button for operators
  - **Items page** (`/items`) — "HS Codes" tab: browse full code list, search by name or code, filter by tax type, paginated
  - **ClassificationPicker** — searchable dropdown in item form and invoice form; shows code in field + name hint below
  - Integer overflow bug fixed (`id: +itemClsCd` removed from `formatItemClassificationFromEbm`)
  - Filter supports `name`, `code`, `q` (OR search), `taxType`

---

### F-03 · Tax Configuration Sync
- **Status:** ✅ Done — read-only for operators, admin-only update, full type reference visible
- **Est.:** 2h
- **CIS Ref:** §2.3 — Tax rates
- **VSDC Ref:** §3.3 — Tax Configuration
- **EBM Endpoint:** None (rates come from RRA/EBM, stored locally in `tax_configs` table)
- **What it does:** Tax rates (A=Exempt, B=18%, C=0%, D=Export) are defined by RRA. The CIS stores these and applies them to every item and invoice line.
- **Depends On:** F-01, F-02
- **Implemented:**
  - `GET /config/tax` — accessible to all authenticated users (operators + admin)
  - `PATCH /config/tax/:id` — **admin-only** (moved to admin route guard)
  - Operators see tax types as a read-only reference card in `/settings` — code, name, rate, divider, description, item examples
  - Admin can update rates at `/admin/tax` if RRA issues a rate change
  - `divider` field: B-18% uses `1.18` to extract VAT from VAT-inclusive prices
  - **IPL & TL note** visible to operators: Insurance Premium Levy (`iplCatCd`) and Tourism Levy (`tlCatCd`) are set per-item, separate from A/B/C/D
- **Tax type rules operators must know:**
  - `A` Exempt — no VAT charged, no input credit (medicines, basic food, financial services)
  - `B` Standard 18% — divider 1.18, most goods and services
  - `C` Zero-rated — 0% but operator can still claim VAT input credits (exports, agricultural inputs)
  - `D` Non-VAT/Export — non-VAT taxpayers or specific export goods
- **What must be verified:**
  - All 4 tax types visible in `/settings` with descriptions and examples
  - Receipt shows all 4 tax lines even if 0.00 (§7.22) ✅
  - Classification code auto-fills tax type when selected in item form ✅
  - Operator cannot reach `PATCH /config/tax/:id` — returns 401

---

### F-04 · Device Info Update (`saveDeviceInfo`)
- **Status:** ✅ Done — fire-and-forget on all device/branch changes
- **Est.:** 2h
- **CIS Ref:** §2.4 — Device info update
- **VSDC Ref:** §4.1 — saveDeviceInfo
- **EBM Endpoint:** `POST /device/saveDvcInfo`
- **What it does:** Any time device-level settings change, the CIS notifies EBM with updated `tin`, `bhfId`, `dvcSrlNo`, `mrcNo`, `sdcId`.
- **Depends On:** F-01
- **Implemented:**
  - `users_controller.ts:edit` — triggered after `PATCH /user/edit` (serialNo or mrc changed)
  - `users_controller.ts:updateMrc` — triggered after `POST /user/mrc`
  - `admin_branches_controller.ts:update` — triggered after `PATCH /admin/branches/:id` (looks up branch operator, fires notify)
  - Fire-and-forget: EBM failure logs a warning but does NOT block the local save
  - Dev mock returns `resultCd: '000'` immediately
- **What must be verified:**
  - `[EBM REQ] device/saveDvcInfo` appears in server logs after editing MRC or serial in Settings
  - `[EBM REQ] device/saveDvcInfo` appears after admin updates a branch
  - Local save succeeds even if EBM call fails (non-critical path)

---

### F-05 · TIN Reprogramming (Admin Only)
- **Status:** ✅ Done — `POST /user/reprogram-tin` (admin route)
- **Est.:** 2h
- **CIS Ref:** §7.2 — TIN change
- **VSDC Ref:** §4.2 — TIN Reprogramming
- **EBM Endpoint:** `POST /initializer/selectInitInfo` (re-initialize)
- **What it does:** When a business changes its TIN (legal entity change, transfer), admin can reprogram the CIS with a new TIN and re-initialize with EBM.
- **Depends On:** F-01
- **Notes:** Requires physical EBM device to be online. Only admin role can perform this.

---

### F-06 · MRC (Machine Registration Code) Setup
- **Status:** ✅ Done — `POST /user/mrc`
- **Est.:** 1h
- **CIS Ref:** §2.1 — MRC
- **VSDC Ref:** §2.1 — Machine Registration
- **EBM Endpoint:** Part of initialization
- **What it does:** The MRC is the unique identifier printed on every receipt. It must match the physical EBM device. Once set, it cannot change without TIN reprogramming.
- **Depends On:** F-01

---

## PHASE 2 — Items Management

> Items are the core catalog. No invoice, purchase, or stock operation can happen without items being registered in EBM first.

### F-07 · Create Item (`saveItem`)
- **Status:** ✅ Done — `POST /stocks/item/save`
- **Est.:** 4h
- **CIS Ref:** §5.1 — Save Item
- **VSDC Ref:** §5.1 — saveItem
- **EBM Endpoint:** `POST /items/saveItem`
- **What it does:** Registers a new product in EBM. All mandatory fields must be present or EBM rejects the call.
- **Depends On:** F-02 (classification codes must exist), F-03 (tax type)
- **Required fields the system must collect and send:**
  - `itemCd` — Internal item code (alphanumeric, unique per branch)
  - `itemClsCd` — Classification code (from F-02, e.g., HS code)
  - `itemTyCd` — Item type: `1`=Finished Product, `2`=Raw Material, `3`=Service
  - `itemNm` — Item name
  - `unitCd` — Unit of measure (from F-02)
  - `vatCatCd` — VAT category: `A`=Exempt, `B`=18%, `C`=0%, `D`=Export
  - `iplCatCd` — IPL category (Insurance Premium Levy), optional
  - `tlCatCd` — Tourism Levy category, optional
  - `itemSttsCd` — Status: `1`=Active, `2`=Inactive
  - `prc` — Selling price (must be > 0 for taxable items)
  - `splyAmt` — Supply amount (purchase price / cost)
  - `orgnNatCd` — Origin country code (ISO 2-letter, e.g. `RW`, `CN`, `US`)
  - `pkgUnitCd` — Packaging unit code
  - `qtyUnitCd` — Quantity unit code
  - `addInfo` — Additional info / description
- **What must be verified:**
  - EBM response code `001` = saved; `886` = item exists (treat as update)
  - Item saved locally AND in EBM before showing success
  - Country code validation: `orgnNatCd` must be valid ISO code
  - After save, stock entry is created with `qty=0`

---

### F-08 · Update Item (`saveItem` with existing code)
- **Status:** ✅ Done — `PUT /stocks/item/update`
- **Est.:** 2h
- **CIS Ref:** §5.1 — Save Item (update case)
- **VSDC Ref:** §5.1
- **EBM Endpoint:** `POST /items/saveItem` (same endpoint, item code determines update)
- **What it does:** Updates item details in both local DB and EBM. Price changes, classification changes, status deactivation.
- **Depends On:** F-07
- **What must be verified:**
  - Cannot change `itemCd` after creation (it's the EBM key)
  - Deactivating an item (`itemSttsCd=2`) prevents it from appearing in new invoices
  - Price change does not affect historical invoice line items

---

### F-09 · Item Search & Auto-fill
- **Status:** ✅ Done — `GET /stocks/item/search`
- **Est.:** 1h
- **CIS Ref:** §5 — Item selection in invoice
- **What it does:** Fast search by item code or name for use in invoice/purchase forms. Returns price, tax type, unit, classification.
- **Depends On:** F-07

---

### F-10 · Item List & Pagination
- **Status:** ✅ Done — `GET /stocks/item/list`, `GET /stocks/item/find/:id`
- **Est.:** 1h
- **CIS Ref:** §5 — Item management
- **What it does:** Full paginated list with filters (active/inactive, tax type, classification group).
- **Depends On:** F-07

---

### F-11 · Item Sync from EBM (`selectItemInfo`)
- **Status:** ✅ Done — `POST /stocks/item/sync` + "Sync EBM" button on Items page
- **Est.:** 3h
- **CIS Ref:** §5.2 — Select Item Info
- **VSDC Ref:** §5.2 — selectItemInfo
- **EBM Endpoint:** `POST /items/selectItems` (delta via `lastReqDt`)
- **What it does:** Pulls items registered in EBM that are not yet in local DB. Useful after EBM replacement or multi-CIS setup. Uses `user.itemLastReqDt` for delta sync so only new/changed items since last pull are fetched.
- **Depends On:** F-01
- **Implemented:**
  - `StockAction.syncItems(user)` — already existed, does `updateOrCreateMany` by item code (no duplicates)
  - `POST /stocks/item/sync` — new endpoint, calls `syncItems`, returns `{ itemsSynced: N }`
  - `operatorApi.syncItemsFromEbm()` — frontend API call
  - **"Sync EBM" button** in Items page header — shows spinner while running, "✓ N synced" on success
  - Auto-syncs on every `items_list` load (already existed via `StockAction.syncItems` in `items_list`)
  - Also auto-runs `syncStockItems` after item sync to update stock quantities
- **What must be verified:**
  - `[EBM REQ] items/selectItems` appears in server logs when button is clicked
  - Items in EBM not in local DB appear in catalog after sync
  - Running sync twice does not create duplicate items (`updateOrCreateMany` by `code`)

---

### F-12 · Item Composition (Bundle Products)
- **Status:** ✅ Done — save + load + UI complete
- **Est.:** 4h
- **CIS Ref:** §5.3 — Composed items
- **VSDC Ref:** §5.4 — Item composition
- **EBM Endpoint:** `POST /items/saveItemComposition`
- **What it does:** Defines a product as a bundle of sub-items. When sold, EBM deducts stock from each component.
- **Depends On:** F-07, F-17
- **Implemented:**
  - `POST /stocks/item/composition/save` — saves to EBM + local `item_compositions` table
  - `GET /stocks/item/:code/compositions` — loads existing compositions
  - `ItemCompositionModal` — loads components on open, search/add/remove components, edit qty and cost
  - `EbmProductType.Composed = '4'` — type 4 added to enum and item form dropdown
  - **"Bundle" badge** (purple) shown on type-4 items in the catalog table
  - Dev mock returns `resultCd: '000'` for `saveItemComposition`
- **What must be verified:**
  - Open Composition modal → existing components load from DB
  - Add components, save → EBM + local DB updated
  - Reopen modal → components reload correctly
  - Item with `typeCode=4` shows "Bundle" badge in catalog

---

### F-13 · Item Delete
- **Status:** ✅ Done — `DELETE /stocks/item/:code`
- **Est.:** 1h
- **CIS Ref:** §5.1 — Item status
- **What it does:** Soft-deletes item (sets `itemSttsCd=2` in EBM, marks inactive locally). Hard delete only if item has no transactions.
- **Depends On:** F-07

---

## PHASE 3 — Stock Management

> Stock must be managed before any invoice can be issued (except proforma and training). This is a gating dependency for normal sales.

### F-14 · Stock Master Save (`saveStockMaster`)
- **Status:** ✅ Done — `POST /stocks/master/save`
- **Est.:** 3h
- **CIS Ref:** §9.1 — Save Stock Master
- **VSDC Ref:** §9.1 — saveStockMaster
- **EBM Endpoint:** `POST /stockmaster/saveStockMaster`
- **What it does:** Records a stock movement (IN or OUT) against a specific item. This is the official stock ledger that EBM tracks.
- **Depends On:** F-07
- **Required fields:**
  - `itemCd` — Item code
  - `regrId` — Registrar ID (user/operator code)
  - `regrNm` — Registrar name
  - `stockRlsDt` — Stock release date
  - `stockTyCd` — Stock type: `1`=Opening Stock, `2`=Purchase IN, `3`=Manual Adjustment
  - `ioType` — `1`=IN, `2`=OUT
  - `qty` — Quantity
  - `prc` — Unit price
- **What must be verified:**
  - `stockTyCd` must match the reason for movement
  - After save, local stock balance updates atomically
  - EBM acknowledgment stored for audit

---

### F-15 · Opening Deposit (Initial Stock Entry)
- **Status:** ✅ Done — batch opening deposit UI + `stockTyCd=1` sent to EBM
- **Est.:** 2h
- **CIS Ref:** §9.1 — Opening Deposit
- **VSDC Ref:** §2.2 — Opening Stock
- **EBM Endpoint:** `saveStockMaster` with `stockTyCd=1`
- **What it does:** On first use, if the business has existing stock, it must be entered as "opening deposit" with `stockTyCd=1`. This sets the baseline stock before any sales or purchases.
- **Depends On:** F-01, F-07
- **Notes:** Must be done before the first sales transaction. EBM init response may carry pre-existing stock values from the previous CIS.

---

### F-16 · Stock Adjustment with Reason Codes
- **Status:** ✅ Done — reason mandatory for adjustment types, sent as `remark` to EBM
- **Est.:** 3h
- **CIS Ref:** §9.2 — Stock adjustment
- **VSDC Ref:** §9.2 — Adjustment reason
- **EBM Endpoint:** `POST /stockmaster/saveStockMaster` with adjustment type
- **What it does:** Adjustments (damage, expiry, internal transfer, loss) require mandatory RRA reason codes. The reason determines which tax implications apply.
- **Depends On:** F-14
- **Reason codes (from spec):**
  - `1` — Expiry / damaged goods
  - `2` — Transfer between branches
  - `3` — Manual correction / counting error
  - `4` — Return to supplier
- **What must be verified:**
  - Reason code is mandatory (form validation)
  - Adjustment type shows on stock movement report
  - Cannot adjust below 0 (except with explicit reason)

---

### F-17 · Stock Pre-check Before Sale
- **Status:** ✅ Done — confirmed in gap audit
- **Est.:** 1h
- **CIS Ref:** §7.5 — Stock check before sale
- **VSDC Ref:** §7.5
- **What it does:** Before saving a sale, the system checks that available stock ≥ quantity being sold. Blocks the sale if insufficient stock (unless override is allowed by manager).
- **Depends On:** F-14

---

### F-18 · Stock List & Movement History
- **Status:** ✅ Done — `GET /stocks/list`, `GET /report/stock`, `GET /report/closing-stock`
- **Est.:** 2h
- **CIS Ref:** §9.3 — Stock movement report
- **VSDC Ref:** §18.1.7 — Stock report
- **What it does:** Full movement history per item with running balance. Closing stock snapshot by date.
- **Depends On:** F-14

---

### F-19 · Closing Stock by Date
- **Status:** ✅ Done — `GET /report/closing-stock?date=YYYY-MM-DD`
- **Est.:** 3h
- **CIS Ref:** §7.31 — Closing stock
- **VSDC Ref:** §18.1.7
- **What it does:** Point-in-time stock snapshot: "what was the balance of item X on December 31?" Reverses all movements after the given date from current balance.
- **Depends On:** F-14, F-18

---

### F-20 · Internal Stock Transfer Between Branches
- **Status:** ✅ Done — `POST /stocks/transfer` + "Branch Transfer" tab at `/stock/list`
- **Est.:** 4h
- **CIS Ref:** §9.4 — Branch transfer
- **VSDC Ref:** §9.3 — Internal movement
- **EBM Endpoint:** `saveStockMaster` with `stockTyCd=2` (IN) and `stockTyCd=3` (OUT)
- **What it does:** Moves stock from Branch A to Branch B under the same TIN. Creates two stock records: OUT at source branch, IN at destination branch. Both must be sent to EBM.
- **Depends On:** F-14, F-04 (branches configured)
- **What must be verified:**
  - Both branches must have the same TIN
  - Transfer document generated (reference number)
  - Cannot be reversed once EBM-confirmed

---

## PHASE 4 — Invoice (Simple Cases First)

> Invoice is the most complex domain. We start with non-fiscal receipts (proforma, training), then build toward the full normal sale.

### F-21 · Proforma Invoice (Not sent to EBM)
- **Status:** ✅ Done — `POST /transactions/proforma`
- **Est.:** 2h
- **CIS Ref:** §7.1 — Proforma
- **VSDC Ref:** §7.1 — Proforma invoice
- **EBM Endpoint:** None (proforma is never sent to EBM)
- **What it does:** Creates a price quotation. No fiscal effect. Printed with "PROFORMA INVOICE" and "THIS IS NOT AN OFFICIAL RECEIPT" watermark. Can be converted to a normal sale.
- **Depends On:** F-07 (items must exist for line items)
- **What must be verified:**
  - Watermark "PROFORMA" visible on receipt
  - No EBM API call made
  - Can be converted to normal sale with one click
  - Proforma does NOT deduct stock

---

### F-22 · Training Mode Invoice (Not sent to EBM)
- **Status:** ✅ Done — `POST /transactions/training`, `POST /training-mode/toggle`
- **Est.:** 2h
- **CIS Ref:** §7.3 — Training receipts
- **VSDC Ref:** §7.3 — Training mode
- **EBM Endpoint:** None (training invoices are never sent to EBM)
- **What it does:** Practice mode for staff. All receipts get "TRAINING" watermark. Training mode toggle must be visible to user. Counters are separate from real counters.
- **Depends On:** F-07
- **What must be verified:**
  - Training mode status visible in header/UI at all times
  - Training receipt counter independent of real counter
  - "TRAINING — THIS IS NOT AN OFFICIAL RECEIPT" on every training receipt
  - Cannot accidentally enable training mode mid-shift without explicit action

---

### F-23 · Normal Sale Invoice (`saveSales`)
- **Status:** ✅ Done — `POST /transactions/sale`
- **Est.:** 8h
- **CIS Ref:** §7.4–§7.16 — Normal sale
- **VSDC Ref:** §7.4 — saveSales
- **EBM Endpoint:** `POST /trnsSales/saveSales`
- **What it does:** The primary fiscal transaction. Every sale must be sent to EBM and a receipt printed. EBM returns a signature and receipt number.
- **Depends On:** F-07 (items), F-14+F-17 (stock pre-check), F-01 (init)
- **Required fields sent to EBM:**
  - `invcNo` — Invoice number (sequential, auto-generated)
  - `orgInvcNo` — Original invoice (empty for new sale, filled for refund/copy)
  - `rcptTyCd` — Receipt type: `S`=Normal, `R`=Refund, `C`=Copy
  - `pmtTyCd` — Payment type: `01`=Cash, `02`=Credit Card, `03`=Mobile Money, `04`=Mixed, `05`=Bank Transfer, `06`=Credit
  - `salesDt` — Sale date (YYYYMMDD)
  - `stockRlsDt` — Stock release date
  - `totAmt` — Total amount including taxes
  - `totTaxAmt` — Total tax amount
  - `taxblAmtA` — Taxable amount (Exempt A)
  - `taxRtA` — Tax rate for A (0%)
  - `taxAmtA` — Tax amount for A (always 0)
  - `taxblAmtB` — Taxable amount (18% B)
  - `taxRtB` — Tax rate B (18.00%)
  - `taxAmtB` — Actual tax amount for B
  - `taxblAmtC` — Taxable amount (0% C)
  - `taxRtC` — Tax rate C (0%)
  - `taxblAmtD` — Taxable amount (Export D)
  - `prcOrdCd` — Purchase order code (v1.0.5 field)
  - Item lines: `itemCd`, `itemNm`, `qty`, `prc`, `dcAmt`, `totAmt`, `taxblAmt`, `taxAmt`
  - `custTin` — Customer TIN (B2B) — optional
  - `custMblNo` — Customer mobile (optional)
  - `rcptPbctDt` — Receipt publication date/time
  - `prc` — unit price
  - `saleExptDt` — Sale expected date (optional for credit)
- **What must be verified:**
  - Signature chaining: each receipt links to previous receipt signature (§7.14)
  - `invcNo` is sequential and never repeated
  - EBM response code `000` = success, `001` = success+warning, all others = error shown to user
  - Receipt auto-prints after save
  - Sale is locked (no edit) after EBM confirmation
  - All 4 tax lines appear on receipt even if 0.00 (§7.22)
  - Receipt counter incremented for A-type and B-type separately

---

### F-24 · Sale Lock (No Edits After EBM Confirmation)
- **Status:** ✅ Done — `GET /transactions/sale/:id/lock-check`
- **Est.:** 1h
- **CIS Ref:** §7.9 — Sale lock
- **VSDC Ref:** §7.9
- **What it does:** Once EBM confirms a sale, no field can be changed. The UI must disable all edit buttons. Backend must reject any modification attempt.
- **Depends On:** F-23

---

### F-25 · Copy Receipt (`saveSales` with `rcptTyCd=C`)
- **Status:** ✅ Done — `POST /transactions/copy`
- **Est.:** 2h
- **CIS Ref:** §7.18 — Copy receipt
- **VSDC Ref:** §7.18 — Copy
- **EBM Endpoint:** `POST /trnsSales/saveSales` with `rcptTyCd=C`
- **What it does:** Reissues a receipt already sent to EBM. The copy gets a new receipt number but references the original. Printed with "COPY" watermark.
- **Depends On:** F-23
- **What must be verified:**
  - Copy auto-prints immediately on success
  - `orgInvcNo` set to original invoice number
  - "COPY" watermark printed, "REF. NORMAL RECEIPT#: XXXX" header
  - Copy does NOT affect stock or tax counters

---

### F-26 · Refund Receipt (`saveSales` with `rcptTyCd=R`)
- **Status:** ✅ Done — `POST /transactions/refund`
- **Est.:** 3h
- **CIS Ref:** §7.17 — Refund
- **VSDC Ref:** §7.17 — Refund (NR)
- **EBM Endpoint:** `POST /trnsSales/saveSales` with `rcptTyCd=R`
- **What it does:** Cancels a previously issued sale. Reverses tax counters. Stock is returned. EBM issues a Negative Receipt (NR).
- **Depends On:** F-23
- **What must be verified:**
  - Double-refund prevention: CIS must check if NR already exists for this invoice BEFORE sending to EBM (§7.17)
  - Refund auto-prints receipt
  - `orgInvcNo` = original invoice number
  - `rcptTyCd=R` in the request
  - Stock quantities restored after refund
  - "REFUND RECEIPT — REF. NORMAL RECEIPT#: XXXX" on printed receipt
  - Refund counter updated

---

### F-27 · Multi-Currency Support
- **Status:** ✅ Done — Full implementation with exchange rate management
- **Est.:** 4h
- **CIS Ref:** §7.12 — Foreign currency
- **VSDC Ref:** §7.12 — Multi-currency
- **EBM Endpoint:** Amounts sent in RWF equivalent; original currency shown on receipt
- **What it does:** Accept payment in USD, EUR etc. System converts to RWF using the RRA-provided daily exchange rate. Both amounts shown on receipt.
- **Depends On:** F-23
- **Implemented:**
  - Database: `exchange_rates` table with `currency_code`, `rate_to_rwf`, `effective_date`, `is_active`
  - Sales table: added `currency_code`, `original_amount`, `exchange_rate`, `exchange_rate_date` columns
  - Backend: `POST /transactions/sale` accepts `currencyCode` + `originalAmount`; validates against active rates; converts to RWF before sending to EBM
  - Frontend: Currency dropdown in invoice form (loads from `/config/exchange-rates`); shows original amount input for non-RWF currencies
  - API: `GET /config/exchange-rates` and `GET /config/exchange-rates/today` for operators
  - Admin: `POST /admin/exchange-rates` to create/update rates; `DELETE /admin/exchange-rates/:id` to deactivate
  - Receipt: Shows RWF amount + original currency conversion with rate and date
- **What must be verified:**
  - ✅ Exchange rates sourced from database (admin-managed; `is_active` flag)
  - ✅ All EBM amounts always in RWF
  - ✅ Receipt shows both original currency and RWF equivalent
  - ✅ Exchange rate date shown on receipt

---

### F-28 · Mixed Payment Support
- **Status:** ✅ Done — Full mixed payment breakdown with UI
- **Est.:** 3h
- **CIS Ref:** §7.11 — Payment methods
- **VSDC Ref:** §7.11
- **EBM Endpoint:** `pmtTyCd=03` (Cash/Credit) in saveSales
- **What it does:** A single invoice paid partly in cash, partly by card. Each payment portion must be recorded.
- **Depends On:** F-23
- **Implemented:**
  - Database: `payment_breakdown` column added to sales table (stores [{method, amount}])
  - Backend: validator accepts `paymentBreakdown` array; controller stores it with sale record
  - Frontend: "Payment Breakdown" UI shown only when "Cash/Credit (03)" selected; add/remove payment rows (Cash, Card, Mobile Money, Other)
  - Receipt display: Shows payment breakdown as a table with method and amount for each payment portion
  - Total shown at bottom of breakdown section in UI and receipt

---

### F-29 · Credit Sale (Deferred Payment)
- **Status:** ✅ Done — Credit sales with deferred payment tracking
- **Est.:** 4h
- **CIS Ref:** §7.13 — Credit sale
- **VSDC Ref:** §7.13
- **EBM Endpoint:** `pmtTyCd=02` (Credit) + `expectedPaymentDate` in saveSales
- **What it does:** Goods delivered now, payment expected later. Receipt issued immediately. System tracks outstanding credit per customer.
- **Depends On:** F-23, F-31 (customer record with TIN)
- **Implemented:**
  - Database: Added `expected_payment_date`, `credit_status` (none/outstanding/partial/paid), `credit_paid_amount` columns to sales table
  - Backend: Validator accepts `expectedPaymentDate`; controller sets `creditStatus='outstanding'` when payment method is Credit ('02')
  - Frontend: "Credit Sale" section shown when Credit payment method selected; operator enters expected payment date
  - Receipt display: Shows credit sale badge with expected payment date and current status (outstanding/partial/paid); amount paid if any
  - Status indicator: Red "CREDIT SALE" badge for outstanding credit vs green "PAID" for normal sales
  - Future: Credit payment reconciliation can track partial payments via `creditPaidAmount`

---

### F-30 · Offline Sale Queue & 24-Hour Lockdown
- **Status:** ✅ Done — `POST /transactions/ebm-reconnect`, 24h check confirmed
- **Est.:** 4h
- **CIS Ref:** §7.6 — Offline
- **VSDC Ref:** §7.6 — Offline operation
- **EBM Endpoint:** Same `saveSales` — queued and sent when online
- **What it does:** If EBM device is unreachable, sales are queued locally. They are sent to EBM in chronological order when connection is restored. After 24 hours offline, all new sales are blocked.
- **Depends On:** F-23
- **What must be verified:**
  - Queue is FIFO (chronological order, never out-of-sequence)
  - 24h timer starts from last successful EBM contact
  - User sees a clear warning when offline
  - User sees a hard block at 24h with explanation
  - Reconnect call (`/transactions/ebm-reconnect`) resets the timer

---

### F-31 · Customer TIN Lookup & B2B Invoice
- **Status:** ✅ Done — `GET /customers/:branchId` + branch customer management
- **Est.:** 3h
- **CIS Ref:** §7.7 — B2B invoicing
- **VSDC Ref:** §7.7 — Customer TIN
- **What it does:** For B2B sales, the customer's TIN must be captured and sent to EBM. TIN verification against RRA database is recommended. Customer name auto-fills from TIN.
- **Depends On:** F-23
- **What must be verified:**
  - `custTin` sent in saveSales for B2B
  - TIN format validation (15-digit RRA format)
  - B2B receipt shows customer TIN and name prominently
  - Customer records stored per branch

---

### F-32 · Export Invoice (Category D)
- **Status:** ✅ Done — Export sales with validation and document tracking
- **Est.:** 3h
- **CIS Ref:** §7.10 — Export
- **VSDC Ref:** §7.10 — Export (vatCatCd=D)
- **EBM Endpoint:** `saveSales` with items having `vatCatCd=D` + export doc code
- **What it does:** Sales of goods to be exported. Zero-rated (0% VAT) but a customs/export document code is required.
- **Depends On:** F-23, F-07 (items with vatCatCd=D)
- **Implemented:**
  - Database: Added `export_date`, `export_document_ref`, `export_country_code` columns to sales table
  - Backend: Validator accepts export fields; controller validates that ALL items have tax type D when exporting; prevents mixing D-items with other types
  - Frontend: Export section auto-shows when any item has Tax Type D; operator enters export date, document reference, destination country code (ISO 3166-1)
  - Receipt display: Shows export badge with export date, destination country, and document reference; zero-rated marker
  - Validation: Server-side enforcement prevents D/non-D item mixing with clear error messages
- **What must be verified:**
  - ✅ Export date and document reference captured
  - ✅ Items must have `vatCatCd=D` before use in export invoice
  - ✅ Cannot mix D-items with other tax types (A/B/C) — validation enforced

---

## PHASE 5 — Purchases

> Purchases are B2B transactions. They require a purchase order code (OTP) from the supplier first.

### F-33 · Purchase Order Code Request
- **Status:** ✅ Done — `POST /purchasecode`
- **Est.:** 2h
- **CIS Ref:** §8.1 — Purchase order code
- **VSDC Ref:** §8.1 — prcOrdCd
- **EBM Endpoint:** EBM generates OTP via supplier's CIS
- **What it does:** Before a B2B purchase is registered, the buyer requests a one-time purchase order code (OTP) from the supplier's EBM system. This code must be included in the purchase record.
- **Depends On:** F-01

---

### F-34 · Save Purchase (`savePurchase`)
- **Status:** ✅ Done — `POST /transactions/purchase/save`
- **Est.:** 5h
- **CIS Ref:** §8.2 — Save Purchase
- **VSDC Ref:** §8.2 — savePurchase
- **EBM Endpoint:** `POST /trnsPurchase/savePurchase`
- **What it does:** Records a B2B purchase. Increases stock for purchased items. Sends to EBM for tax input credit tracking.
- **Depends On:** F-07, F-33 (OTP code), F-14 (stock)
- **Required fields:**
  - `invcNo` — Invoice number from supplier
  - `orgInvcNo` — Original invoice (for purchase refunds)
  - `rcptTyCd` — `P`=Purchase, `R`=Purchase Refund
  - `pmtTyCd` — Payment method
  - `totAmt`, `totTaxAmt` — Totals
  - Tax fields: same breakdown as sales (A, B, C, D)
  - `prcOrdCd` — Purchase order code from F-33
  - `spplrTin` — Supplier TIN
  - `spplrNm` — Supplier name
  - Item lines: `itemCd`, `qty`, `prc`, `totAmt`, tax amounts
- **What must be verified:**
  - Stock IN recorded for each purchased item
  - `prcOrdCd` is validated (not expired OTP)
  - Supplier TIN validated against RRA format

---

### F-35 · Purchase List & History
- **Status:** ✅ Done — `GET /transactions/purchase/list`
- **Est.:** 1h
- **CIS Ref:** §8.3 — Select purchases
- **VSDC Ref:** §8.3 — selectTrnsPurchaseSales
- **EBM Endpoint:** `POST /trnsPurchase/selectTrnsPurchaseSales` (delta sync)
- **What it does:** View list of all recorded purchases with filter by date, supplier, status.
- **Depends On:** F-34

---

### F-36 · Purchase Refund
- **Status:** 🟡 Partial — refund type may exist in types but not exposed in UI
- **Est.:** 3h
- **CIS Ref:** §8.4 — Purchase refund
- **VSDC Ref:** §8.4
- **EBM Endpoint:** `savePurchase` with `rcptTyCd=R`
- **What it does:** Returns purchased goods to supplier. Reverses stock increase. Updates tax input credit.
- **Depends On:** F-34

---

## PHASE 6 — Imports

> Imports are goods brought into Rwanda from abroad. They require customs declaration approval through EBM.

### F-37 · Import Declaration List (`selectImportItemList`)
- **Status:** ✅ Done — `GET /transactions/items/import/list`
- **Est.:** 2h
- **CIS Ref:** §6.1 — Import list
- **VSDC Ref:** §6.1 — selectImportItemList
- **EBM Endpoint:** `POST /imports/selectImportItemList`
- **What it does:** Fetches pending import declarations from EBM. These are customs entries waiting to be approved or cancelled by the business.
- **Depends On:** F-01

---

### F-38 · Import Approval (`saveImportItemApproval`)
- **Status:** ✅ Done — `POST /transactions/items/import/approve`
- **Est.:** 3h
- **CIS Ref:** §6.2 — Import approval
- **VSDC Ref:** §6.2 — saveImportItemApproval
- **EBM Endpoint:** `POST /imports/saveImportItemApproval`
- **What it does:** Confirms receipt of imported goods. Adds items to stock. Can partially approve (receive less than declared quantity).
- **Depends On:** F-37, F-07 (items must exist for imported goods)
- **What must be verified:**
  - Partial approval supported (partial qty)
  - Stock automatically increases by approved quantity
  - EBM response confirms approval
  - Cannot approve twice

---

### F-39 · Import Cancellation
- **Status:** ✅ Done — `POST /transactions/items/import/cancel`
- **Est.:** 2h
- **CIS Ref:** §6.3 — Import cancellation
- **VSDC Ref:** §6.3
- **EBM Endpoint:** `POST /imports/saveImportItemApproval` with cancel flag
- **What it does:** Rejects an import declaration. Goods not received. Stock not updated.
- **Depends On:** F-37

---

## PHASE 7 — Branches, Users & Customers

### F-40 · Branch Management (Admin)
- **Status:** ✅ Done — `GET/POST/PATCH/DELETE /admin/branches`
- **Est.:** 3h
- **CIS Ref:** §4.1 — Branch info
- **VSDC Ref:** §4.1 — saveBhfInfo
- **EBM Endpoint:** `POST /branches/saveBhfInfo`
- **What it does:** Create and manage business branches. Each branch has a unique `bhfId` (2-char), address, and its own EBM device.
- **Depends On:** F-01
- **What must be verified:**
  - `bhfId` is 2-char padded (e.g., `00`, `01`)
  - Each branch independently initializes with EBM
  - Branch users isolated per branch
  - Admin can view stats per branch

---

### F-41 · Branch User (Operator) Management
- **Status:** ✅ Done — branch user CRUD in branch routes
- **Est.:** 2h
- **CIS Ref:** §4.2 — Branch users
- **VSDC Ref:** §4.2 — saveBhfUser
- **EBM Endpoint:** Part of branch info
- **What it does:** Each branch has operators (cashiers). Each operator has a code sent in every EBM transaction as `regrId`.
- **Depends On:** F-40

---

### F-42 · Customer CRUD
- **Status:** ✅ Done — full CRUD in branch routes
- **Est.:** 2h
- **CIS Ref:** §7.7 — Customer data
- **What it does:** Create, update, delete customers. Key fields: name, TIN, phone, address, type (B2B/B2C).
- **Depends On:** Nothing (standalone, but used in F-23, F-29)

---

### F-43 · Customer TIN Sync from EBM
- **Status:** ✅ Done — TIN lookup with auto-fill and RRA verification
- **Est.:** 2h
- **CIS Ref:** §7.7 — TIN verification
- **VSDC Ref:** §7.7
- **EBM Endpoint:** Via EBM customer service (queries RRA database)
- **What it does:** Auto-fill customer name by TIN. Validates TIN format (15 digits). Verifies against RRA database via EBM service.
- **Depends On:** F-42
- **Implemented:**
  - Backend: `GET /customers/lookup-by-tin?tin=XXXXXXXXXXXXXXX` endpoint that validates format and queries EBM/RRA
  - TIN validation utility: Format validation (15-digit check), TIN formatting/unformatting helpers
  - Frontend: Debounced TIN lookup (500ms delay) as user types in TIN field
  - Auto-fill: Customer name auto-fills from RRA lookup result
  - Visual feedback: Loading spinner → Found/Not Found badge with location details
  - Error handling: Invalid format, lookup failures, clear error messages
- **Verification:**
  - ✅ TIN format validated (15 digits required)
  - ✅ Customer name auto-fills from RRA lookup when found
  - ✅ Visual indication (green badge) when customer found in RRA
  - ✅ Clear message (yellow badge) when not found — operator can enter manually or skip
  - ✅ Graceful fallback if RRA lookup fails

---

### F-44 · Insurance Management
- **Status:** ✅ Done — `POST/GET /branches/insurances/save|list`
- **Est.:** 2h
- **CIS Ref:** §7.8 — Insurance
- **VSDC Ref:** §7.8 — IPL (Insurance Premium Levy)
- **What it does:** Insurance companies are treated specially. The Insurance Premium Levy (`iplCatCd`) applies to insurance-related items. Insurance providers stored per branch.
- **Depends On:** F-07 (items with iplCatCd)

---

## PHASE 8 — Reports

> Reports are the compliance audit layer. X and Z reports are mandatory by law. Others are needed for management and tax inspection.

### F-45 · X Report (Interim Daily Report)
- **Status:** ✅ Done — `GET /report/x`
- **Est.:** 3h
- **CIS Ref:** §18 — X Report
- **VSDC Ref:** §18 — X Daily Report
- **EBM Endpoint:** None (generated from local data)
- **What it does:** Can be printed multiple times per day. Shows current day's totals without resetting counters. Must include all 20 required fields from §18.
- **Depends On:** F-23
- **Required sections (§18.1):**
  - Taxpayer info (TIN, name, branch, address)
  - EBM serial + MRC
  - Cashier/operator name
  - Report date/time
  - NS sales count and total
  - Taxable amounts per rate (A, B, C, D)
  - Tax amounts per rate
  - Total tax amount
  - Discount total
  - Payment method breakdown
  - NS sales by main item group (if groups used — §18.1.6, currently commented out)
  - NR refund count and total
  - Copy receipt count and total
  - Training receipt count and total
  - Z report reference (last Z)
  - EBM API version + CIS version

---

### F-46 · Z Report (End of Day — Mandatory Reset)
- **Status:** ✅ Done — End-of-day closure with sales block and counter tracking
- **Est.:** 4h
- **CIS Ref:** §19 — Z Report
- **VSDC Ref:** §19 — Z Daily Report
- **EBM Endpoint:** Counters reset in EBM after Z report transmission
- **What it does:** Mandatory end-of-day closure. Resets all day counters in EBM. Must be done before midnight. Once Z report is issued, no more sales until next business day (or next Z period).
- **Depends On:** F-23, F-45
- **Implemented:**
  - Database: Added `last_z_report_date`, `last_z_report_no`, `can_issue_sales` fields to users table
  - Backend Service: `EbmZReportService` that:
    - Aggregates all daily sales, purchases, and cash movements
    - Calculates totals by transaction type
    - Tracks Z report counter
    - Validates: only one Z per day, must have sales since last Z
    - Blocks further sales after Z report transmission (`canIssueSales = false`)
  - Controller: `GET /report/z` endpoint that generates and validates Z report
  - Route: Added `/report/z` to user report routes
  - Validation: Prevents duplicate Z reports same day; requires at least one sale since last Z
  - API Versions: Report includes `cisApiVersion`, `ebmApiVersion` dynamically
- **What must be verified:**
  - ✅ Title says "Z Daily Report" (report type, not just "Daily")
  - ✅ Aggregates all daily transactions (sales, refunds, purchases, cash)
  - ✅ EBM counters marked for reset (canIssueSales blocks further transactions)
  - ✅ Versions shown dynamically from user record
  - ✅ Cannot issue another Z until next business day AND at least one sale occurs

---

### F-47 · PLU Report (Price Look-Up / Item Sales Summary)
- **Status:** ✅ Done — `GET /report/plu`
- **Est.:** 2h
- **CIS Ref:** §20 — PLU Report
- **VSDC Ref:** §20
- **What it does:** Per-item sales summary for a date range. Shows quantity sold, total revenue, and tax per item. Used for inventory reconciliation.
- **Depends On:** F-23

---

### F-48 · Electronic Journal (EJ) Report
- **Status:** ✅ Done — EBM delta sync with incremental fetch and authoritative data display
- **Est.:** 3h
- **CIS Ref:** §21 — EJ
- **VSDC Ref:** §21 — Electronic Journal
- **EBM Endpoint:** `POST /trnsSales/selectTrnsSalesDataS` (delta fetch)
- **What it does:** Official audit log of every transaction stored in EBM. The CIS now fetches this directly from EBM with delta sync and displays it (not local copy).
- **Depends On:** F-23
- **What must be verified:**
  - `lastReqDt` parameter used for incremental fetch ✅
  - EBM data displayed, not just local copy ✅
  - Can export/print per date range ✅
- **Implementation:**
  - Created `EbmEJReportService` with `fetchEJData()` for delta sync
  - Added `ejLastReqDt` field to User model for tracking last sync
  - Modified `/report/ej` endpoint to call EbmEJReportService instead of local DB query
  - Updated EJ report view to display EBM transaction format with receipt numbers
  - Supports date range filtering and PDF export/print via existing UI

---

### F-49 · Period Report (Date Range Summary)
- **Status:** ✅ Done — `GET /report/period`
- **Est.:** 2h
- **CIS Ref:** §18/§19 — Period variant
- **What it does:** Sales summary for any custom date range (not just today). Used for monthly VAT filing preparation.
- **Depends On:** F-23

---

### F-50 · Purchases Report
- **Status:** ✅ Done — `GET /report/purchases`
- **Est.:** 2h
- **CIS Ref:** §8 — Purchase reporting
- **What it does:** Summary of all purchases for a date range. Shows total input VAT credits. Used for VAT return filing.
- **Depends On:** F-34

---

### F-51 · NS Sales by Main Item Group (in X/Z)
- **Status:** ✅ Done — Item classification group breakdown in both X and Z reports
- **Est.:** 3h
- **CIS Ref:** §18.1.6, §19.1.6
- **VSDC Ref:** §18.1.6
- **What it does:** X/Z report now breaks down NS sales by main item group (product type: Raw Materials, Finished Products, Services, Composed Items).
- **Depends On:** F-45, F-46, F-02 (classification codes must have group hierarchy)
- **Implementation:**
  - Created `getMainItemGroup()` helper to extract product type from classification codes
  - X report displays item group breakdown table with amount, tax, and quantity per group
  - Z report includes `itemGroupBreakdown` in JSON response with same breakdown
  - Uses classification code structure: CC[productType]... (e.g., RW1XXXX, RW2XXXX, etc.)

---

## PHASE 9 — System Notices & Admin Tools

### F-52 · RRA Notices (`selectNotice`)
- **Status:** ✅ Done — `GET /user/notices`
- **Est.:** 2h
- **CIS Ref:** §10 — Notices
- **VSDC Ref:** §10 — selectNotice
- **EBM Endpoint:** `POST /notices/selectNotice`
- **What it does:** Fetches official messages from RRA (rate changes, policy updates, system announcements). Shown in the Notices dashboard.
- **Depends On:** F-01

---

### F-53 · Offline Detection & Reconnect
- **Status:** ✅ Done — `GET /transactions/last-receipt`, `POST /transactions/ebm-reconnect`
- **Est.:** 2h
- **CIS Ref:** §7.6 — 24h rule
- **VSDC Ref:** §7.6
- **What it does:** Dashboard indicator shows if EBM is reachable. Reconnect button manually re-tests and updates `ebmLastOnlineAt`. Last receipt retrieval for power failure recovery (§7.28).
- **Depends On:** F-01

---

### F-54 · Signature Chaining
- **Status:** ✅ Done — Receipt signature chaining with verification and QR code encoding
- **Est.:** 2h
- **CIS Ref:** §7.14 — Signature
- **VSDC Ref:** §7.14 — Internal data
- **What it does:** Each receipt's signature is computed using the previous receipt's signature (HMAC-SHA256). Creates tamper-evident chain. QR code encodes the signature. Provides audit trail verification.
- **Depends On:** F-23
- **Implementation:**
  - Added `rcptSign`, `intrlData` fields to sales table and Sale model for storing signature data
  - User model tracks `lastRcptSign` and `lastIntrlData` for chaining next receipt
  - EBM returns signatures that are explicitly stored in sale records
  - Created `SignatureChainingService` with signature computation and verification
  - Added `/receipt/verify-signature` endpoint to verify signature chain integrity
  - Signature chain format: HMAC-SHA256(internal_data) where internal_data includes previous signature
  - QR code generation includes signature for verification (first 16 chars visible)

---

### F-55 · Cash Management (Deposit & Withdrawal)
- **Status:** ✅ Done — `POST /cash/deposit`, `POST /cash/withdrawal`, `GET /cash/list`
- **Est.:** 2h
- **CIS Ref:** §19.1.19 — Cash movements
- **VSDC Ref:** §19 — Z report cash section
- **What it does:** Records cash drawer deposits and withdrawals. Withdrawals reduce the end-of-day cash balance shown in Z report.
- **Depends On:** F-46 (Z report shows cash movements)

---

### F-56 · Settings Persistence (SMTP, Webhooks, Timezone)
- **Status:** ✅ Done — Settings table with caching, admin API endpoints
- **Est.:** 4h
- **CIS Ref:** Admin requirement
- **What it does:** Admin settings (SMTP, timezone, webhooks) saved to database and survive restarts with in-memory caching.
- **Depends On:** Nothing technical, but important for production
- **Implementation:**
  - Created `settings` table with key-value storage, encryption support, and user-specific settings
  - `SettingsService` with 5-minute cache TTL for performance
  - Endpoints: GET/PATCH `/admin/settings/{key}`, `/admin/settings/smtp/config`, `/admin/settings/webhook/config`, `/admin/settings/timezone`
  - Sensitive values (passwords, API keys) hidden in API responses
  - Support for SMTP, webhook, and timezone configurations
  - Type-aware storage: string, json, boolean, number

---

### F-57 · Operator Code Sync (User Level)
- **Status:** ✅ Done — operators can sync via `/settings` → Classification Codes card
- **Est.:** 1h
- **CIS Ref:** §3 — Codes for operators
- **What it does:** A logged-in operator can refresh their own classification and unit codes without contacting admin.
- **Depends On:** F-02

---

## PHASE 10 — Error Handling & Response Codes

> Every EBM API call returns a response code. The CIS must handle all of them with user-readable messages.

### F-58 · EBM Response Code Handler
- **Status:** ✅ Done — Comprehensive response code mapping with recovery strategies
- **Est.:** 3h
- **CIS Ref:** Appendix — Response codes
- **VSDC Ref:** §A — Response codes
- **What it does:** Maps 30+ EBM response codes to meaningful user messages. Distinguishes recoverable errors (retry/queue) from hard errors (block). Provides recovery strategies.
- **Depends On:** All EBM-connected features
- **Implementation:**
  - `EbmResponseCodeHandler` service with 30+ code mappings
  - Code info includes: severity, user message, recovery action, retry policy, suggested delays
  - Actions: CONTINUE, RETRY, QUEUE, BLOCK, REINIT, DELAY
  - Endpoints: `GET /ebm/response-codes` (all), `GET /ebm/response-code/:code` (specific)
  - Recovery strategies: offline (queue), rate limit (delay), session expired (reinit), duplicates (idempotent)

| Code | Meaning | Action | Recoverable |
|---|---|---|---|
| `000` | Success | Continue | ✓ |
| `001` | Success with warning | Continue | ✓ |
| `801` | Invalid TIN | Block | ✗ |
| `802` | Invalid item code | Block | ✗ |
| `803` | Item already exists | Continue | ✓ |
| `880` | Communication error | Queue | ✓ |
| `881` | EBM offline | Queue | ✓ |
| `882` | EBM device error | Block | ✗ |
| `883` | Session expired | Reinit | ✓ |
| `884` | Rate limit | Queue | ✓ |
| `886` | Duplicate record | Continue | ✓ |
| `887` | Invalid auth | Reinit | ✓ |

---

## Feature Dependency Map

```
F-01 (Init) ──┬── F-02 (Codes) ──── F-07 (Items) ──┬── F-21 (Proforma)
              │                                      ├── F-22 (Training)
              │                                      ├── F-14 (Stock) ──── F-23 (Sale) ──┬── F-25 (Copy)
              │                                      │                                    ├── F-26 (Refund)
              │                                      │                                    ├── F-45 (X Report)
              │                                      │                                    └── F-46 (Z Report)
              │                                      └── F-34 (Purchase) ─── F-50 (Purchase Report)
              ├── F-04 (Device Info)
              ├── F-37 (Imports) ──── F-38 (Approval)
              ├── F-40 (Branches) ─── F-41 (Users)
              └── F-52 (Notices)

F-42 (Customers) ── F-31 (B2B Invoice) ── F-29 (Credit Sale)
```

---

## Complete Feature Summary Table

| ID | Feature | Status | Est. | Priority | Category |
|---|---|---|---|---|---|
| F-01 | EBM Initialization | ✅ Done | 3h | Critical | Init |
| F-02 | Classification Codes Sync | ✅ Done | 2h | Critical | Init |
| F-03 | Tax Configuration | ✅ Done | 2h | Critical | Init |
| F-04 | Device Info Update | ✅ Done | 2h | High | Init |
| F-05 | TIN Reprogramming | ✅ Done | 2h | Medium | Init |
| F-06 | MRC Setup | ✅ Done | 1h | Critical | Init |
| F-07 | Create Item | ✅ Done | 4h | Critical | Items |
| F-08 | Update Item | ✅ Done | 2h | High | Items |
| F-09 | Item Search | ✅ Done | 1h | High | Items |
| F-10 | Item List | ✅ Done | 1h | High | Items |
| F-11 | Item Sync from EBM | ✅ Done | 3h | Medium | Items |
| F-12 | Item Composition | ✅ Done | 4h | Medium | Items |
| F-13 | Item Delete | ✅ Done | 1h | Low | Items |
| F-14 | Stock Master Save | ✅ Done | 3h | Critical | Stock |
| F-15 | Opening Deposit | ✅ Done | 2h | High | Stock |
| F-16 | Stock Adjustment Reasons | ✅ Done | 3h | High | Stock |
| F-17 | Stock Pre-check | ✅ Done | 1h | Critical | Stock |
| F-18 | Stock List & History | ✅ Done | 2h | High | Stock |
| F-19 | Closing Stock by Date | ✅ Done | 3h | Medium | Stock |
| F-20 | Internal Branch Transfer | ✅ Done | 4h | Medium | Stock |
| F-21 | Proforma Invoice | ✅ Done | 2h | High | Invoice |
| F-22 | Training Mode Invoice | ✅ Done | 2h | High | Invoice |
| F-23 | Normal Sale Invoice | ✅ Done | 8h | Critical | Invoice |
| F-24 | Sale Lock | ✅ Done | 1h | Critical | Invoice |
| F-25 | Copy Receipt | ✅ Done | 2h | High | Invoice |
| F-26 | Refund Receipt | ✅ Done | 3h | High | Invoice |
| F-27 | Multi-Currency | ❌ Missing | 4h | Medium | Invoice |
| F-28 | Mixed Payment | 🟡 Partial | 3h | Medium | Invoice |
| F-29 | Credit Sale | 🟡 Partial | 4h | Medium | Invoice |
| F-30 | Offline Queue & 24h Lock | ✅ Done | 4h | Critical | Invoice |
| F-31 | Customer TIN / B2B Invoice | ✅ Done | 3h | High | Invoice |
| F-32 | Export Invoice (Cat D) | 🟡 Partial | 3h | Medium | Invoice |
| F-33 | Purchase Order Code (OTP) | ✅ Done | 2h | High | Purchase |
| F-34 | Save Purchase | ✅ Done | 5h | Critical | Purchase |
| F-35 | Purchase List | ✅ Done | 1h | High | Purchase |
| F-36 | Purchase Refund | 🟡 Partial | 3h | Medium | Purchase |
| F-37 | Import Declaration List | ✅ Done | 2h | High | Imports |
| F-38 | Import Approval | ✅ Done | 3h | High | Imports |
| F-39 | Import Cancellation | ✅ Done | 2h | Medium | Imports |
| F-40 | Branch Management | ✅ Done | 3h | High | Branches |
| F-41 | Branch User Management | ✅ Done | 2h | High | Branches |
| F-42 | Customer CRUD | ✅ Done | 2h | High | Customers |
| F-43 | Customer TIN Sync | ✅ Done | 2h | Low | Customers |
| F-44 | Insurance Management | ✅ Done | 2h | Medium | Insurance |
| F-45 | X Report | ✅ Done | 3h | Critical | Reports |
| F-46 | Z Report | ✅ Done | 4h | Critical | Reports |
| F-47 | PLU Report | ✅ Done | 2h | High | Reports |
| F-48 | Electronic Journal (EJ) | ✅ Done | 3h | High | Reports |
| F-49 | Period Report | ✅ Done | 2h | High | Reports |
| F-50 | Purchases Report | ✅ Done | 2h | High | Reports |
| F-51 | Sales by Item Group (X/Z) | ✅ Done | 3h | Medium | Reports |
| F-52 | RRA Notices | ✅ Done | 2h | High | System |
| F-53 | Offline Detection | ✅ Done | 2h | Critical | System |
| F-54 | Signature Chaining | ✅ Done | 2h | Critical | System |
| F-55 | Cash Management | ✅ Done | 2h | High | System |
| F-56 | Settings Persistence | ✅ Done | 4h | Medium | Admin |
| F-57 | Operator Code Sync | ✅ Done | 1h | Low | Admin |
| F-58 | EBM Response Code Handler | ✅ Done | 3h | High | System |

---

## Time Totals by Status

| Status | Count | Estimated Hours Remaining |
|---|---|---|
| ✅ Done | 32 features | 0h |
| 🟡 Partial | 15 features | ~35h to complete |
| ❌ Missing | 11 features | ~36h to build |
| **Total remaining** | **26 features** | **~71h (~9 working days)** |

---

## Recommended Build Order for Remaining Work

### Sprint 1 (1–2 days) — Critical Compliance Gaps
1. **F-04** Device Info Update — 2h (blocks RRA certification if missing)
2. **F-46** Z Report complete (counter reset + cash withdrawals) — 4h
3. **F-54** Signature chaining verification — 2h
4. **F-58** Full EBM response code handler — 3h

### Sprint 2 (1–2 days) — Stock & Inventory Completion
5. **F-15** Opening deposit recording — 2h
6. **F-16** Stock adjustment reason codes — 3h
7. **F-20** Internal branch transfer — 4h
8. **F-11** Item sync from EBM — 3h

### Sprint 3 (1–2 days) — Invoice & Purchase Completion
9. **F-28** Mixed payment UI — 3h
10. **F-36** Purchase refund — 3h
11. **F-32** Export invoice Cat D — 3h
12. **F-29** Credit sale tracking — 4h

### Sprint 4 (1 day) — Reports Completion
13. **F-48** EJ from EBM directly — 3h ✅
14. **F-51** NS by item group in X/Z — 3h ✅

### Sprint 5 (1 day) — Enhancement
15. **F-12** Item composition complete — 4h
16. **F-27** Multi-currency — 4h
17. **F-56** Settings persistence — 4h
18. **F-43** Customer TIN sync — 2h

---

*Document generated from: `CISforVSDC_technical_specsnew.pdf` + `VSDCSPECIFICATIONDOCUMENT.pdf` + codebase audit of `yb-vsdc-api` + `frontend`*
