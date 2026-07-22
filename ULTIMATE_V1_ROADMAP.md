# Ultimate VSDC V1 Roadmap: 100% Certification Guide

This document is the master unified checklist for the VSDC Hub. It combines core RRA compliance, advanced technical requirements, and UI/UX enhancements into a single implementation guide.

## 🟢 1. Core RRA Compliance (High Priority)
| # | Feature | Time | Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Z-Report (Daily Close)** | 30m | `[ ]` | Mandatory daily reset and transmission of tax counters. |
| 2 | **Signature Chaining** | 30m | `[ ]` | Link every receipt to the previous one for data integrity. |
| 3 | **Offline Sync Queue** | 30m | `[ ]` | Store and push offline sales in chronological order. |
| 4 | **24-Hour Lockdown** | 20m | `[ ]` | Block sales if device stays offline for >24 hours. |
| 5 | **EJ Real Data Fetch** | 30m | `[ ]` | Pull official Electronic Journal data directly from EBM. |
| 6 | **Tax Config EBM Sync** | 15m | `[ ]` | Push local tax rate changes to the EBM device. |
| 7 | **Export/Exemption Codes**| 20m | `[ ]` | Capture reasons for Cat C and Export docs for Cat D. |
| 8 | **saveDeviceInfo Call** | 10m | `[ ]` | Trigger mandatory info update on system changes. |
| 9 | **Sale Lock Action** | 15m | `[ ]` | Prevent all modifications once a sale is finalized. |
| 10 | **Multi-Currency Logic** | 20m | `[ ]` | Automatic conversion to RWF using RRA daily rates. |

## 🔵 2. Inventory & Stock Hub
| # | Feature | Time | Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| 11 | **Import Module** | 30m | `[ ]` | Fetch, approve, and register items from RRA imports. |
| 12 | **Internal Movement** | 20m | `[ ]` | Document transfers between branches under same TIN. |
| 13 | **Item Composition** | 30m | `[ ]` | Handle bundled products and their sub-components. |
| 14 | **Adjustment Reasons** | 10m | `[ ]` | Mandatory RRA codes (Expiry, Damage, etc.) for stock. |
| 15 | **Classification Auto-fill**| 10m | `[x]` | Rapid entry via code/name search (COMPLETED). |

## 🟡 3. UI, UX & Administration
| # | Feature | Time | Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| 16 | **Global Search Engine** | 15m | `[ ]` | Functional search for Items, Invoices, and TINs. |
| 17 | **Multi-Language (i18n)** | 20m | `[ ]` | Full support for EN, FR, and RW across the UI. |
| 18 | **Admin Persistence** | 30m | `[ ]` | Save SMTP, webhook, and system settings to DB. |
| 19 | **Real-time TIN Lookup** | 20m | `[ ]` | Verify customer TINs against RRA database. |
| 20 | **Manager Permissions** | 20m | `[ ]` | Restrict high-risk actions to authorized managers. |
| 21 | **Operator Code Sync** | 10m | `[ ]` | Allow operators to refresh codes from the dashboard. |
| 22 | **Receipt Lookup Tool** | 10m | `[ ]` | Standalone "Search & Reprint" tool in Reports. |
| 23 | **A4/Thermal Printing** | 20m | `[x]` | Professional dual-branded layout (COMPLETED). |
| 24 | **Purchase OTP Request**| 15m | `[x]` | B2B OTP verification button in invoice form (COMPLETED). |
| 25 | **Receipt Clarification**| 10m | `[x]` | Remarks/Clarification field for RRA compliance (COMPLETED). |

---
**Current Certification Progress:** 16% Complete
