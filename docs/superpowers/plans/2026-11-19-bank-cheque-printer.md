# Bank Cheque Printer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a zero-dependency, client-side Bank Cheque Printer web app in pure HTML5, CSS3, and Vanilla JavaScript, with calibrated presets for NRBC Bank, Islami Bank Bangladesh, and Sonali Bank Limited, Canon G3010 center-feed support, batch printing, and an interactive WYSIWYG millimeter calibrator.

**Architecture:** A static, zero-build single page web application composed of modular ES6 components: a Bangladeshi currency words converter, pre-calibrated bank templates, a millimeter grid calibration engine, a batch table/CSV parser, and a print stylesheet utilizing native CSS `@media print` physical `mm` coordinates. All custom templates and printer offsets persist in `localStorage` with JSON export/import.

**Tech Stack:** HTML5, CSS3 (CSS Grid/Flexbox, CSS variables, physical `mm` print units), Vanilla ES6 JavaScript, Node.js (for local zero-dependency test runner).

**Spec:** `docs/superpowers/specs/2026-11-19-cheque-printer-design.md`

## Global Constraints
- Target Stack: 100% pure HTML5, CSS3, Vanilla ES6 JavaScript; zero npm build step or server required for runtime.
- Deployable directly to GitHub Pages or runs locally by opening `index.html`.
- Strict physical units (`mm`, `pt`) for all print layout elements to guarantee 1:1 physical printing.
- Built-in calibrated presets: NRBC Bank (187.1mm × 82.1mm), Islami Bank Bangladesh (181.6mm × 81.8mm), Sonali Bank Limited (190.6mm × 84.4mm).
- Support Canon G3010 rear tray center feed (`X offset = (210mm - width) / 2`).

## Review Focus
1. Number-to-Words for Bangladeshi numbering edge cases: e.g. `1,00,00,000` (One Crore), `52,34,500.50` (Poisha), `0`, and values with leading/trailing decimals.
2. Long Amount in Words wrapping: When words exceed line 1 length, cleanly split across two print lines without clipping.
3. Date formatting: Discrete 8-box positioning (`D D M M Y Y Y Y`) with configurable pitch (e.g. 5.5mm - 6.5mm) aligning exactly inside pre-printed bank boxes.
4. Canon G3010 Center-Feeding alignment: Correct calculation of left margin on standard A4 paper width (`(210mm - width) / 2`) plus hardware micro-nudge offsets.
5. Batch Printing page breaks: Multiple cheques in batch printing print exactly one cheque per physical page without spilling or generating blank pages.

---

### Task 1: Bangladeshi Number-to-Words Converter & Formatting Engine

**Files:**
- Create: `js/words-converter.js`
- Test: `tests/words-converter.test.js`
- Test Runner: `tests/run-tests.js`

**Interfaces:**
- Produces:
  - `numberToWordsBDT(amount: number | string): string`
  - `formatAmountWords(words: string, options?: { prefixAsterisks?: boolean, suffixOnly?: boolean }): string`
  - `formatAmountNumber(amount: number | string): string` (e.g. `=***50,000/-***`)
  - `splitWordsIntoTwoLines(words: string, maxLine1Chars?: number): { line1: string, line2: string }`

- [ ] **Step 1: Write the failing tests for words-converter**

```javascript
// tests/words-converter.test.js
const assert = require('assert');
const { numberToWordsBDT, formatAmountWords, formatAmountNumber, splitWordsIntoTwoLines } = require('../js/words-converter.js');

function runTests() {
  console.log('Testing numberToWordsBDT...');
  assert.strictEqual(numberToWordsBDT(0), 'Zero Taka Only');
  assert.strictEqual(numberToWordsBDT(500), 'Five Hundred Taka Only');
  assert.strictEqual(numberToWordsBDT(1000), 'One Thousand Taka Only');
  assert.strictEqual(numberToWordsBDT(100000), 'One Lakh Taka Only');
  assert.strictEqual(numberToWordsBDT(10000000), 'One Crore Taka Only');
  assert.strictEqual(numberToWordsBDT(5234500.50), 'Fifty Two Lakh Thirty Four Thousand Five Hundred Taka and Fifty Poisha Only');
  assert.strictEqual(numberToWordsBDT(123456789), 'Twelve Crore Thirty Four Lakh Fifty Six Thousand Seven Hundred Eighty Nine Taka Only');
  
  console.log('Testing formatAmountWords...');
  assert.strictEqual(formatAmountWords('Fifty Thousand Taka Only'), '*** Fifty Thousand Taka Only ***');

  console.log('Testing formatAmountNumber...');
  assert.strictEqual(formatAmountNumber(50000), '=***50,000/-***');
  assert.strictEqual(formatAmountNumber('1234567.50'), '=***12,34,567.50/-***');

  console.log('Testing splitWordsIntoTwoLines...');
  const split = splitWordsIntoTwoLines('Fifty Two Lakh Thirty Four Thousand Five Hundred Taka and Fifty Poisha Only', 40);
  assert.ok(split.line1.length <= 40);
  assert.ok(split.line2.length > 0);
  console.log('All words-converter tests passed!');
}

runTests();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/words-converter.test.js`  
Expected: FAIL with "Cannot find module '../js/words-converter.js'"

- [ ] **Step 3: Implement `js/words-converter.js`**

Implement Bangladeshi crore/lakh/thousand/hundred logic, poisha handling, tamper-proof asterisks, and words two-line splitting with CommonJS/ES module universal export.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/words-converter.test.js`  
Expected: PASS with "All words-converter tests passed!"

- [ ] **Step 5: Commit**

```bash
git add js/words-converter.js tests/words-converter.test.js
git commit -m "feat: implement Bangladeshi Taka number to words converter and formatters"
```

---

### Task 2: Bank Templates & Persistence Engine

**Files:**
- Create: `js/bank-templates.js`
- Create: `js/storage.js`
- Test: `tests/bank-templates.test.js`

**Interfaces:**
- Consumes: None
- Produces:
  - `DEFAULT_TEMPLATES`: Object containing `nrbc`, `ibbl`, `sonali`, `generic` template definitions with exact calibrated dimensions and field coordinates.
  - `storage`: Helper object with `getTemplates()`, `saveTemplate(template)`, `deleteTemplate(id)`, `getGlobalSettings()`, `saveGlobalSettings(settings)`, `exportBackup()`, `importBackup(jsonString)`.

- [ ] **Step 1: Write the failing tests for bank-templates and storage**

```javascript
// tests/bank-templates.test.js
const assert = require('assert');
const { DEFAULT_TEMPLATES } = require('../js/bank-templates.js');

function testTemplates() {
  assert.ok(DEFAULT_TEMPLATES.nrbc, 'NRBC template must exist');
  assert.strictEqual(DEFAULT_TEMPLATES.nrbc.widthMm, 187.1);
  assert.strictEqual(DEFAULT_TEMPLATES.nrbc.heightMm, 82.1);
  assert.ok(DEFAULT_TEMPLATES.nrbc.fields.date);
  assert.ok(DEFAULT_TEMPLATES.nrbc.fields.payee);
  assert.ok(DEFAULT_TEMPLATES.nrbc.fields.amountNumber);
  assert.ok(DEFAULT_TEMPLATES.nrbc.fields.amountWordsLine1);
  
  assert.ok(DEFAULT_TEMPLATES.ibbl, 'IBBL template must exist');
  assert.strictEqual(DEFAULT_TEMPLATES.ibbl.widthMm, 181.6);
  assert.strictEqual(DEFAULT_TEMPLATES.ibbl.heightMm, 81.8);

  assert.ok(DEFAULT_TEMPLATES.sonali, 'Sonali template must exist');
  assert.strictEqual(DEFAULT_TEMPLATES.sonali.widthMm, 190.6);
  assert.strictEqual(DEFAULT_TEMPLATES.sonali.heightMm, 84.4);

  console.log('All bank template tests passed!');
}

testTemplates();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/bank-templates.test.js`  
Expected: FAIL with "Cannot find module '../js/bank-templates.js'"

- [ ] **Step 3: Implement `js/bank-templates.js` and `js/storage.js`**

Implement complete definitions for NRBC, Islami Bank, Sonali Bank, and Generic bank templates with exact mm coordinates measured from the 1mm grid sheets. Implement storage module with `localStorage` fallback and JSON export/import.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/bank-templates.test.js`  
Expected: PASS with "All bank template tests passed!"

- [ ] **Step 5: Commit**

```bash
git add js/bank-templates.js js/storage.js tests/bank-templates.test.js
git commit -m "feat: add calibrated bank templates and storage persistence module"
```

---

### Task 3: Visual Calibrator & Millimeter Grid Canvas Engine

**Files:**
- Create: `js/calibrator.js`
- Copy assets: `assets/nrbc_preview.png`, `assets/ibbl_preview.png`, `assets/sonali_preview.png`

**Interfaces:**
- Consumes:
  - `DEFAULT_TEMPLATES` from `js/bank-templates.js`
  - `storage` from `js/storage.js`
- Produces:
  - `Calibrator`: Class that manages:
    - `renderCheque(template, chequeData)`
    - `toggleGrid(show: boolean)`
    - `toggleBackgroundScan(show: boolean, opacity: number)`
    - `selectField(fieldName: string)`
    - `nudgeField(dxMm: number, dyMm: number)`
    - `updateFieldProp(fieldName: string, prop: string, value: any)`
    - `saveCurrentTemplate()`
    - `calculateCenterFeedOffset(chequeWidthMm: number): { xOffsetMm: number, yOffsetMm: number }`

- [ ] **Step 1: Write test verifying center feed and coordinate math**

```javascript
// tests/calibrator-math.test.js
const assert = require('assert');
const { calculateCenterOffset } = require('../js/calibrator.js');

function testCalibratorMath() {
  // A4 paper is 210mm wide.
  // NRBC is 187.1mm wide -> (210 - 187.1) / 2 = 11.45mm
  const nrbcOffset = calculateCenterOffset(187.1, 210);
  assert.strictEqual(Math.round(nrbcOffset * 100) / 100, 11.45);

  // IBBL is 181.6mm wide -> (210 - 181.6) / 2 = 14.2mm
  const ibblOffset = calculateCenterOffset(181.6, 210);
  assert.strictEqual(Math.round(ibblOffset * 100) / 100, 14.2);

  // Sonali is 190.6mm wide -> (210 - 190.6) / 2 = 9.7mm
  const sonaliOffset = calculateCenterOffset(190.6, 210);
  assert.strictEqual(Math.round(sonaliOffset * 100) / 100, 9.7);

  console.log('All calibrator math tests passed!');
}

testCalibratorMath();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/calibrator-math.test.js`  
Expected: FAIL with "Cannot find module '../js/calibrator.js'"

- [ ] **Step 3: Implement `js/calibrator.js` and stage preview assets**

Create `assets/` directory and copy the oriented preview images. Implement `Calibrator` with interactive drag-and-drop, bounding box constraints, millimeter snapping, keyboard micro-nudging (Arrow keys), and background scan overlay.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/calibrator-math.test.js`  
Expected: PASS with "All calibrator math tests passed!"

- [ ] **Step 5: Commit**

```bash
git add js/calibrator.js assets/ tests/calibrator-math.test.js
git commit -m "feat: implement visual calibrator and millimeter grid engine"
```

---

### Task 4: Batch Management & CSV/Excel Parser

**Files:**
- Create: `js/batch-printer.js`
- Test: `tests/batch-printer.test.js`

**Interfaces:**
- Consumes:
  - `numberToWordsBDT`, `formatAmountNumber`, `formatAmountWords` from `js/words-converter.js`
- Produces:
  - `parseCSVorTSV(text: string): Array<ChequeRecord>`
  - `BatchManager`: Class managing queue of cheques (add, edit, delete, duplicate, clear, getQueue())
  - `renderBatchPrintPages(queue: Array<ChequeRecord>, template: Template, feedMode: string, globalOffset: {x: number, y: number}): HTMLElement`

- [ ] **Step 1: Write failing test for CSV/TSV parser**

```javascript
// tests/batch-printer.test.js
const assert = require('assert');
const { parseCSVorTSV } = require('../js/batch-printer.js');

function testParser() {
  const csv = "Date,Payee,Amount,AcPayee,CrossBearer\n2026-11-20,MD. RAHIM,50000,true,true\n2026-11-21,ABC TRADERS,125000.50,true,false";
  const records = parseCSVorTSV(csv);
  assert.strictEqual(records.length, 2);
  assert.strictEqual(records[0].payee, 'MD. RAHIM');
  assert.strictEqual(records[0].amount, 50000);
  assert.strictEqual(records[0].acPayee, true);
  assert.strictEqual(records[0].crossBearer, true);

  // Test Excel TSV copy paste
  const tsv = "2026-11-22\tTECH CORP\t75000\tyes\tno";
  const tsvRecords = parseCSVorTSV(tsv);
  assert.strictEqual(tsvRecords.length, 1);
  assert.strictEqual(tsvRecords[0].payee, 'TECH CORP');
  assert.strictEqual(tsvRecords[0].amount, 75000);
  console.log('All batch printer tests passed!');
}

testParser();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/batch-printer.test.js`  
Expected: FAIL with "Cannot find module '../js/batch-printer.js'"

- [ ] **Step 3: Implement `js/batch-printer.js`**

Implement robust delimiter detection (comma, tab, semicolon), auto-header detection, record validation, and batch DOM builder.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/batch-printer.test.js`  
Expected: PASS with "All batch printer tests passed!"

- [ ] **Step 5: Commit**

```bash
git add js/batch-printer.js tests/batch-printer.test.js
git commit -m "feat: implement batch printing queue and CSV/Excel import parser"
```

---

### Task 5: Print Stylesheet & Screen UI Styling

**Files:**
- Create: `css/styles.css`
- Create: `css/print.css`

**Interfaces:**
- Consumes: CSS variables for theme and coordinates
- Produces:
  - Responsive screen layout: sidebar controls, bank selector, live WYSIWYG canvas, batch table view, tabs for Single vs Batch vs Calibration.
  - Strict `@media print` rules with `@page { size: auto; margin: 0; }` ensuring 1:1 physical printing, hiding UI chrome, and page-breaking between batch cheques.

- [ ] **Step 1: Write `css/print.css` with strict millimeter print rules**
- [ ] **Step 2: Write `css/styles.css` with modern responsive financial UI layout**
- [ ] **Step 3: Commit**

```bash
git add css/styles.css css/print.css
git commit -m "style: add print stylesheet and responsive web application styling"
```

---

### Task 6: Main Application Assembly & Integration (`index.html` & `js/app.js`)

**Files:**
- Create: `index.html`
- Create: `js/app.js`

**Interfaces:**
- Consumes: All modules (`bank-templates.js`, `words-converter.js`, `calibrator.js`, `batch-printer.js`, `storage.js`)
- Produces: Complete working web application

- [ ] **Step 1: Create `index.html`**
  - Header with Bank Preset Selector, Feeding Mode Selector (Canon G3010 Center Feed, Carrier Sheet Top-Left, Direct Custom Feed), Printer Offset Controls, and Print Button.
  - Tab navigation: **Single Cheque**, **Batch Printing**, **Visual Calibrator**.
  - Single Cheque View: Form inputs with instant live preview.
  - Batch Printing View: Add row, paste CSV/Excel, bulk preview, Print All.
  - Visual Calibrator View: Full WYSIWYG canvas with drag & drop, background cheque opacity slider, 1mm grid toggle, and micro-nudge buttons.
  - Hidden print container (`#print-area`) dynamically populated for print execution.
- [ ] **Step 2: Create `js/app.js`**
  - Wire up all reactive inputs, bank preset switching, number-to-words auto-conversion, feed mode adjustments, and `window.print()` triggers.
- [ ] **Step 3: Verification with automated tests and headless browser verification**
  - Run all unit tests: `node tests/run-tests.js`
  - Start local HTTP server and verify application loads with zero console errors.
- [ ] **Step 4: Commit**

```bash
git add index.html js/app.js
git commit -m "feat: assemble main cheque printer application and wire controller"
```

---

### Task 7: Final Verification & GitHub Pages Readiness

**Files:**
- Create: `README.md` (clear user guide, Canon G3010 printing tips, GitHub Pages deployment instructions)
- Verify: Full test suite and static web assets

- [ ] **Step 1: Create `README.md` with full documentation and setup guide**
- [ ] **Step 2: Execute test suite `node tests/run-tests.js` to ensure all tests pass**
- [ ] **Step 3: Verify zero external network requests and GitHub Pages compatibility**
- [ ] **Step 4: Final commit**

```bash
git add README.md
git commit -m "docs: add user manual, printer setup instructions and deployment guide"
```
