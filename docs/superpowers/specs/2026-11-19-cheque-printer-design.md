# Design Specification: Bank Cheque Printer Web App

**Date**: 2026-11-19  
**Status**: Draft  
**Target Environment**: GitHub Pages / Static Web (Pure HTML5, CSS3, Vanilla JavaScript)  
**Primary Language/Stack**: HTML5, Modern CSS, Vanilla ES6 JavaScript (zero backend, zero external npm build dependencies)

---

## 1. Intent & Purpose

A 100% client-side, zero-install, browser-based web application for printing bank cheques with millimeter-level physical accuracy. Built to run directly on GitHub Pages or locally offline. It enables users to print single or batch cheques for Bangladeshi banks (calibrated with real 1mm grid scans for NRBC Bank, Islami Bank Bangladesh, and Sonali Bank Limited, plus custom bank template creation), with automated number-to-Bangladeshi-words conversion, "A/C PAYEE ONLY" crossing, "Or Bearer" strikethrough, and an interactive WYSIWYG visual calibrator.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
- **Exact Millimeter Printing**: Native browser printing using CSS physical units (`mm`, `pt`) and `@media print` rules with `@page { size: auto; margin: 0; }`.
- **Pre-calibrated Bangladeshi Bank Presets**:
  - **NRBC Bank**: 187.1 mm × 82.1 mm
  - **Islami Bank Bangladesh Limited (IBBL)**: 181.6 mm × 81.8 mm
  - **Sonali Bank Limited**: 190.6 mm × 84.4 mm
  - Extensible architecture to add custom bank presets.
- **Core Cheque Print Fields**:
  - **Date**: Discrete 8-box formatting (`D D M M Y Y Y Y`) with configurable digit pitch, or standard formatted string (`DD-MM-YYYY`).
  - **Payee Name**: ("Pay To") with security asterisks (`*** MD. RAHIM ***`).
  - **Amount in Figures**: ("Tk." / "TK.") with tamper-proof formatting (`=***50,000/-***`).
  - **Amount in Words**: ("The Sum of Taka ... Only") auto-generated in Bangladeshi numbering (Crore, Lakh, Thousand, Hundred, Taka and Poisha), with 2-line auto-wrap if amount length exceeds the first line.
  - **A/C Payee Crossing**: Parallel double lines with "A/C PAYEE ONLY" (toggleable, default top-left).
  - **Or Bearer Strikethrough**: Horizontal line striking out "Or Bearer" (toggleable).
  - **Signatory Area / Note**: Optional reference line or note.
- **Printer Feeding Modes**:
  1. *Canon G3010 / Center Rear-Tray Feed (Landscape)*: Automatically centers the cheque along the A4 210mm paper width (`X offset = (210mm - cheque_width) / 2`), matching the Canon G3010 center-sliding paper guides when feeding cheques horizontally.
  2. *Center Rear-Tray Feed (Portrait / Vertical)*: Centers the 82-84mm short edge in the feeder (`X offset = (210mm - cheque_height) / 2`) with 90° clockwise/counter-clockwise rotated print orientation.
  3. *A4 Carrier Sheet Feed (Top-Left)*: Aligned to the top-left of an A4 carrier sheet (matching the scan position).
  4. *Direct Custom Size Feed*: Full bleed cheque size for direct envelope / custom paper feeder drivers.
  5. *Hardware Micro-Calibration Offset*: Global adjustable X and Y offset (±0.5mm / ±1mm) to compensate for any mechanical printer feed variance once.
- **Interactive Visual Calibrator (WYSIWYG)**:
  - Live preview with real cheque background scan preview and toggleable 1mm grid paper overlay.
  - Interactive drag-and-drop or precision micro-adjusters (±0.5mm / ±1mm nudge) for field coordinates (X, Y, font-size, letter-spacing).
  - Global printer calibration offset (X mm, Y mm) to calibrate hardware printer feed variance once.
- **Batch Printing**:
  - Interactive editable spreadsheet-like table to add, duplicate, and delete multiple cheques.
  - CSV / Excel tab-separated copy-paste or file import.
  - Batch print command that outputs every cheque onto its own printed leaf sequentially (`page-break-after: always`).
- **Persistence & Portability**:
  - All custom templates, field coordinates, and printer offsets persist in `localStorage`.
  - JSON Export / Import for backing up and sharing bank configurations across devices.

### Non-Goals
- No backend server or server-side database required.
- No direct banking API integration or transaction ledger accounting.

### Anti-Goals
- No heavy frameworks (React/Vue/Angular) or Node/npm build steps; must run directly by double-clicking `index.html` or hosting as static files on GitHub Pages.

---

## 3. Approaches Considered & Trade-offs

### Approach 1: Native Millimeter CSS Engine with Interactive Visual Calibrator *(Selected)*
- **Architecture**: Pure HTML5/CSS3/Vanilla JS. Uses native CSS millimeter physical units (`mm`) and browser `@media print`.
- **Trade-offs**: Requires setting print dialog margin to "None" once in the browser.
- **Why chosen**: 100% vector-sharp text, zero dependencies, instant GitHub Pages deployment, live DOM drag-and-drop with millimeter snapping.

### Approach 2: Client-side PDF generation (`jsPDF` / `pdf-lib`) *(Rejected)*
- **Architecture**: Assembles a PDF file in-memory and opens browser PDF viewer.
- **Trade-offs**: Browser/Adobe PDF viewers frequently default to "Fit to Printable Page" or "Shrink oversized pages", scaling down to 93-96% and destroying 1mm physical accuracy. Additionally requires external library bundle.

---

## 4. System Architecture & Module Design

The application will be organized into clean, modular vanilla JavaScript components without bundler overhead:

```
d:\projects\check printer\
├── index.html                  # Main application UI (Calibrator, Form, Batch Table, Print View)
├── css/
│   ├── styles.css              # Main application styling (modern responsive UI, dark/light theme)
│   └── print.css               # Dedicated print styles (strict mm units, page breaks, zero margin)
├── js/
│   ├── app.js                  # Main controller, state management, event listeners
│   ├── bank-templates.js       # Pre-calibrated bank templates (NRBC, IBBL, Sonali, generic)
│   ├── words-converter.js      # Bangladeshi Taka number-to-words algorithm (Lakh/Crore/Poisha)
│   ├── calibrator.js           # Drag-and-drop coordinate engine, millimeter grid renderer
│   ├── batch-printer.js        # Batch table editor, CSV/Excel parser, multi-page print renderer
│   └── storage.js              # LocalStorage sync, JSON export/import
└── assets/
    ├── nrbc_preview.png        # Calibrated preview image for NRBC Bank
    ├── ibbl_preview.png        # Calibrated preview image for Islami Bank Bangladesh
    └── sonali_preview.png      # Calibrated preview image for Sonali Bank Limited
```

---

## 5. Field Coordinates & Bank Calibrations (Millimeter Grid Reference)

Based on the 1mm × 1mm scanned grid measurements:

| Bank | Width (mm) | Height (mm) | Date (X, Y) | Payee (X, Y) | Words Line 1 (X, Y) | Words Line 2 (X, Y) | Amount Tk. (X, Y) | Bearer (X, Y) | A/C Payee (X, Y) |
|---|---|---|---|---|---|---|---|---|---|
| **NRBC Bank** | 187.1 | 82.1 | (138, 7.5) | (35, 23.5) | (44, 30.5) | (20, 37.0) | (142, 33.5) | (168, 23.5) | (22, 10) |
| **Islami Bank (IBBL)** | 181.6 | 81.8 | (134, 9.0) | (32, 25.0) | (42, 32.5) | (18, 39.5) | (138, 34.0) | (163, 25.0) | (20, 10) |
| **Sonali Bank** | 190.6 | 84.4 | (140, 7.5) | (33, 24.0) | (42, 31.5) | (20, 38.5) | (144, 33.0) | (170, 24.0) | (22, 10) |

*All coordinates are fully editable via the UI and saved to localStorage.*

---

## 6. Number to Bangladeshi Words Converter Specifications

- **Numbering Scale**:
  - 100 = Hundred
  - 1,000 = One Thousand
  - 1,00,000 = One Lakh
  - 1,00,00,000 = One Crore
- **Formatting**:
  - Example: `52,34,500.50` -> `Fifty Two Lakh Thirty Four Thousand Five Hundred Taka and Fifty Poisha Only`
  - Option to wrap with security asterisks: `*** Fifty Two Lakh Thirty Four Thousand Five Hundred Taka and Fifty Poisha Only ***`
- **Tamper-proof Numeric Formatting**:
  - Example: `5234500` -> `=***52,34,500/-***`

---

## 7. What is Left to the Builder's Judgment

- Specific color palette and icon choices for the web UI (using modern Tailwind-inspired CSS styling with slate/blue accents).
- Keyboard shortcuts for quick nudging (Arrow keys = 1mm, Shift + Arrow = 0.1mm / 0.5mm).
- CSV parsing resilience for various delimiter formats (comma, tab, semicolon).
