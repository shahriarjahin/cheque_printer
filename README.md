# ৳ ChequePrint BD - Bank Cheque Printer & Visual Calibrator

A 100% client-side, zero-dependency Bank Cheque Printing Web Application built in pure **HTML5, Modern CSS, and Vanilla JavaScript**. Designed to run immediately on **GitHub Pages** or locally offline in any modern web browser.

---

## 🌟 Highlights

- **Pre-calibrated Bangladeshi Bank Presets**:
  - **NRBC Bank PLC** (189.0 mm × 89.0 mm)
  - **Islami Bank Bangladesh Limited (IBBL)** (189.0 mm × 88.0 mm)
  - **Sonali Bank Limited (SBL)** (187.0 mm × 87.5 mm)
  - **Standard Generic Cheque** (189.0 mm × 88.0 mm, customizable for any bank)
- **Canon G3010 / Center-Feed Support**:
  - Automatically calculates center alignment (`X offset = (210mm - cheque_width) / 2`) matching Canon G3010 rear tray center sliding guides.
  - Also supports A4 carrier sheets (top-left) and direct custom size envelope feeders.
  - Hardware micro-offset calibration inputs (`±0.5mm` / `±1mm`).
- **Bangladeshi Currency Number-to-Words Engine**:
  - Automatically converts amounts into words using the Bangladeshi numbering system (`Crore`, `Lakh`, `Thousand`, `Hundred`, `Taka`, and `Poisha`).
  - Tamper-proof formatting: `=***52,34,500/-***` and `*** Fifty Two Lakh Thirty Four Thousand Five Hundred Taka Only ***`.
  - Auto-wraps long amounts in words across two physical cheque lines.
- **Cheque Formatting**:
  - **Discrete Date Boxes**: Box-by-box 8-digit alignment (`D D M M Y Y Y Y`) matching pre-printed boxes.
  - **Payee Name**: With prefix/suffix security protection.
  - **A/C PAYEE ONLY**: Parallel line crossing (toggleable).
  - **Cross "Or Bearer"**: Strikethrough line (toggleable).
- **Interactive Visual Calibrator (WYSIWYG)**:
  - Toggleable **1mm × 1mm graph grid** overlay.
  - Background high-resolution scan preview with adjustable opacity.
  - Drag-and-drop field positioning or micro-nudging via D-pad buttons and keyboard arrow keys (`0.5mm` step, or `Shift + Arrow` for fine `0.1mm`).
- **Batch Printing**:
  - Add, edit, duplicate, and delete multiple cheques in an interactive table.
  - Copy-paste data directly from **Microsoft Excel** or **Google Sheets**.
  - Upload CSV/TSV files.
  - One-click batch print: each cheque prints accurately on its own physical page (`page-break-after: always`).
- **100% Private & Persistent**:
  - Zero financial data leaves your browser.
  - All calibrations, custom bank templates, and printer offsets save automatically to `localStorage`.
  - JSON Export & Import for backing up and sharing settings across devices.

---

## 🚀 How to Run

### Option 1: Run Locally (Offline)
Simply double-click `index.html` or open it with any web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Deploy to GitHub Pages
1. Push this repository to GitHub.
2. In your repository, go to **Settings** > **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` (or `master`) branch and `/ (root)` folder, then click **Save**.
5. Your cheque printer web app is live at `https://<your-username>.github.io/<repo-name>/`!

---

## 🖨️ Printer Setup & Canon G3010 Tips

1. **Printer Loading (Canon G3010 Rear Tray)**:
   - Insert the cheque into the rear tray.
   - Slide the paper guides from both sides so they hold the cheque gently in the **middle (center)**.
   - Keep the feed mode set to **"Canon G3010 Center Feed"**.
2. **Browser Print Dialog Settings**:
   - In the print dialog (Chrome / Edge):
     - **Destination**: Canon G3000 series (G3010).
     - **Paper Size**: **A4**.
     - **Margins**: Set to **"None"** or **"Minimum"**.
     - **Scale**: Set to **"Default" (100%)** — do NOT select "Fit to printable area".
     - **Headers and footers**: **Uncheck** to hide URLs and dates.
3. **One-Time Micro-Tuning**:
   - Every physical printer grab roller has a minor mechanical variance (~1-2mm).
   - Use the **Offset (X / Y mm)** inputs at the top to adjust left/right or top/bottom alignment once, and it will be remembered for all future prints!

---

## 🧪 Automated Testing

Run the included automated test suite (Node.js built-in, zero dependencies):

```bash
node tests/run-tests.js
```

Covers:
- `tests/words-converter.test.js`: Number-to-words, Bangladeshi numbering (Crores/Lakhs), poisha, tamper-proof formatters.
- `tests/bank-templates.test.js`: Template schemas, dimensions, and local storage management.
- `tests/calibrator-math.test.js`: Canon G3010 center math, millimeter-to-pixel conversions, and date box intervals.
- `tests/batch-printer.test.js`: CSV/Excel parsing, batch queue operations, and multi-page print HTML generation.

---

## 📁 Project Architecture

```
├── index.html                  # Single page web application
├── assets/                     # Scanned bank template previews (NRBC, IBBL, Sonali)
├── css/
│   ├── styles.css              # Responsive financial UI design
│   └── print.css               # Strict physical millimeter @media print rules
├── js/
│   ├── app.js                  # Main controller and event handlers
│   ├── bank-templates.js       # Pre-calibrated bank templates
│   ├── words-converter.js      # Bangladeshi Taka number-to-words algorithm
│   ├── calibrator.js           # Live WYSIWYG drag-and-drop & 1mm grid canvas
│   ├── batch-printer.js        # Batch queue manager & CSV/Excel parser
│   └── storage.js              # LocalStorage manager & JSON export/import
└── tests/                      # Automated unit test suite
```

---

## 📄 License
MIT License. Free to use for personal or commercial accounting and cheque issuance.
