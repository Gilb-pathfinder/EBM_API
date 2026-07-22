# Version 1: VSDC Hub Compliance Roadmap

This document outlines the final 10 tasks required to complete Version 1 of the VSDC Hub. Each task includes a technical description and an estimated time to completion.

## 🟢 Category: RRA Compliance (High Priority)

| # | Feature | Time | Description |
| :--- | :--- | :--- | :--- |
| **1** | **Z-Report (End-of-Day)** | 30 min | Implement the mandatory Z-Report closure that resets EBM counters and transmits daily totals. |
| **2** | **Electronic Journal (EJ) Fetch** | 30 min | Update the EJ report to pull official data directly from the EBM device instead of a local database approximation. |
| **3** | **Tax Config EBM Sync** | 15 min | Ensure that updating tax rates in the local UI also pushes those changes to the EBM device registry. |
| **4** | **saveDeviceInfo Call** | 10 min | Implement the CIS-required trigger that updates EBM information whenever system settings change. |
| **5** | **Sale Lock Implementation** | 15 min | Complete the "Lock" mechanism to prevent any modifications once a sale is finalized. |

## 🔵 Category: UI & User Experience (Medium Priority)

| # | Feature | Time | Description |
| :--- | :--- | :--- | :--- |
| **6** | **Global Search Engine** | 15 min | Wire up the topbar search bar in `AppShell.jsx` to search across Items, Invoices, and TINs. |
| **7** | **Multi-Language (i18n)** | 20 min | Build the translation infrastructure for English, Kinyarwanda, and Français switching. |
| **8** | **Admin Settings Persistence** | 30 min | Create the backend endpoints and database tables to save SMTP, timezone, and webhook settings. |
| **9** | **Operator Code Sync** | 10 min | Allow regular operators (not just admins) to refresh their Classification and Unit codes from RRA. |
| **10** | **Receipt Lookup in Reports** | 10 min | Add a standalone "Lookup & Reprint" tool in the Reports sidebar for quick invoice retrieval. |

---
**Status:** Ready for implementation. Total estimated time: 185 minutes.


Missing & Partial Features vs. Spec
CIS Spec (CISforVSDC_technical_specsnew.pdf)
1. §7.22 — Tax rate B (18%) missing on A-EX-only receipts MEDIUM

receipts/index.edge:395 uses @if(sale.taxableAmountB > 0), so when a receipt has only exempt items (A-EX), the "Total B-18.00%" and "Total Tax B" lines are omitted entirely.
Spec requires: all tax rates programmed at value > 0 must appear on every receipt, even if 0.00 (only zero-rate types like A-EX are conditional). The X/Z report already handles this correctly (B row has no @if).
2. §7.17 — No double-refund prevention at CIS level MEDIUM

The backend user_transcations_controller.ts:213 doesn't check whether the sale was already refunded before sending to EBM.
The frontend shows the Refund button for any sale where receiptType !== 'R' — it cannot distinguish "has an NR been issued against this NS."
The EBM server will reject the duplicate, but spec §7.17 says the CIS must enforce "an original transaction is allowed to be cancelled only once."
3. §7.31 — Closing stock by given date MEDIUM

StockReport.jsx shows stock movement events over a date range. There is no point-in-time snapshot query ("what was the stock level as of Dec 31?").
Spec: "be able to provide a closing stock of a given date by user."
X/Z Daily Report (§18/§19)
4. §18.1.6/19.1.6 — NS sales breakdown by main item group LOW

daily.edge:100 has the requirement commented out: {{-- NS Sales by Main Groups --}}. Same in X report — no per-group breakdown.
Spec says "for the different main groups if main groups are used." Conditional, but if item classification groups are active it's required.
5. §19.1.3 — Z report not labeled as "Z Daily Report" LOW

daily.edge:83 shows the title as "Daily Report" (not "Z Daily Report").
Spec: "information showing this is a Z daily report."
6. §19.1.19 — "Other registrations reducing day's sales" LOW

daily.edge:187: {{-- Other Reductions: RWF 15,000 --}} — permanently commented out placeholder.
Spec requires listing any other reductions (e.g., cash withdrawals reducing cash balance). Not implemented.
Minor Bugs Found
7. Z report footer hardcodes version string LOW

daily.edge:193: CIS version 1.0, power by RRA VSDC EBM 2.1 — static text.
X report uses {{auth.user.cisApiVersion}} and {{auth.user.ebmApiVersion}} dynamically. Z report should do the same.
8. HTML bug in Z report payment table LOW

daily.edge:177: <tr> should be </tr> (closing tag missing inside @each). This will break the payment table layout on print.
Already Confirmed Implemented ✅
All 8 VSDC API categories (init, codes, branches, items, imports, sales, purchases, stock)
prcOrdCd in sales and purchase requests (v1.0.5 field)
New API response codes 881, 882, 883, 884
Receipt: QR code, signatures, internal data, MRC, RRA logo, item counter, client TIN/phone, receipt counter A/B RT
Receipt: COPY/TRAINING/PROFORMA watermarks and "THIS IS NOT AN OFFICIAL RECEIPT"
Refund receipt: REF. NORMAL RECEIPT# header
X/Z report: all 20 required fields (except #4–6 above)
24h offline receipt block, TIN reprogramming, stock pre-check, 24h offline detection