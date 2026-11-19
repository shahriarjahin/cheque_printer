/**
 * Batch Cheque Printer & CSV/TSV Parser Module
 * Supports batch table queue, Excel/Google Sheets copy-paste,
 * and multi-page print HTML generator with physical millimeter styling.
 */

// Universal import for WordsConverter & Calibrator in CommonJS vs Browser
let wordsModule = typeof WordsConverter !== 'undefined' ? WordsConverter : null;
let calibratorModule = typeof CalibratorModule !== 'undefined' ? CalibratorModule : null;

if (!wordsModule && typeof require !== 'undefined') {
  try { wordsModule = require('./words-converter.js'); } catch (e) {}
}
if (!calibratorModule && typeof require !== 'undefined') {
  try { calibratorModule = require('./calibrator.js'); } catch (e) {}
}

/**
 * Parses raw CSV or TSV string into structured cheque records
 * @param {string} text
 * @returns {Array<ChequeRecord>}
 */
function parseCSVorTSV(text) {
  if (!text || typeof text !== 'string') return [];

  const lines = text.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  // Detect delimiter: check first line for tabs, commas, or semicolons
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) {
    delimiter = '\t';
  } else if (firstLine.includes(';') && !firstLine.includes(',')) {
    delimiter = ';';
  }

  // Check if first line is a header
  const lowerHeader = firstLine.toLowerCase();
  const hasHeader = lowerHeader.includes('payee') || lowerHeader.includes('name') || lowerHeader.includes('amount');
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const records = [];

  for (let i = 0; i < dataLines.length; i++) {
    const rawLine = dataLines[i];
    // Split by delimiter (handling quoted fields simply)
    const cols = rawLine.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));

    if (cols.length === 0 || (cols.length === 1 && !cols[0])) continue;

    // Default column mapping:
    // If 5 cols: Date, Payee, Amount, AcPayee, CrossBearer
    // If 3 cols: Date, Payee, Amount (or Payee, Amount, Date)
    let date = '';
    let payee = '';
    let amount = 0;
    let acPayee = true;
    let crossBearer = true;

    if (cols.length >= 3) {
      // Check if first column looks like a date (contains - or / or 8 digits)
      if (cols[0].match(/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/) || cols[0].match(/^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/)) {
        date = cols[0];
        payee = cols[1];
        amount = parseFloat(cols[2].replace(/,/g, '')) || 0;
      } else if (cols[1].match(/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/) || cols[1].match(/^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/)) {
        payee = cols[0];
        date = cols[1];
        amount = parseFloat(cols[2].replace(/,/g, '')) || 0;
      } else {
        // Fallback: Date, Payee, Amount
        date = cols[0];
        payee = cols[1];
        amount = parseFloat(cols[2].replace(/,/g, '')) || 0;
      }

      if (cols.length >= 4) {
        const val = cols[3].toLowerCase();
        acPayee = val === 'true' || val === 'yes' || val === '1' || val === 'y';
      }
      if (cols.length >= 5) {
        const val = cols[4].toLowerCase();
        crossBearer = val === 'true' || val === 'yes' || val === '1' || val === 'y';
      }
    } else if (cols.length === 2) {
      payee = cols[0];
      amount = parseFloat(cols[1].replace(/,/g, '')) || 0;
      date = new Date().toISOString().split('T')[0];
    }

    if (payee || amount > 0) {
      records.push({
        id: 'chk_' + Date.now() + '_' + i,
        date: date || new Date().toISOString().split('T')[0],
        payee: payee || '',
        amount: isNaN(amount) ? 0 : amount,
        acPayee: acPayee,
        crossBearer: crossBearer
      });
    }
  }

  return records;
}

/**
 * Batch Manager factory function
 */
function createBatchManager() {
  let queue = [];

  function getQueue() {
    return [...queue];
  }

  function add(record) {
    const item = {
      id: record.id || 'chk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      date: record.date || new Date().toISOString().split('T')[0],
      payee: record.payee || '',
      amount: Number(record.amount) || 0,
      acPayee: record.acPayee !== false,
      crossBearer: record.crossBearer !== false
    };
    queue.push(item);
    return item.id;
  }

  function update(id, updates) {
    const idx = queue.findIndex(r => r.id === id);
    if (idx !== -1) {
      queue[idx] = { ...queue[idx], ...updates };
      return true;
    }
    return false;
  }

  function remove(id) {
    queue = queue.filter(r => r.id !== id);
  }

  function clear() {
    queue = [];
  }

  function setQueue(newQueue) {
    queue = Array.isArray(newQueue) ? [...newQueue] : [];
  }

  function get(id) {
    return queue.find(r => r.id === id) || null;
  }

  return {
    getQueue,
    get,
    add,
    update,
    remove,
    clear,
    setQueue
  };
}

/**
 * Builds HTML markup for printing one or more cheques with strict millimeter styles.
 * @param {Array<ChequeRecord>} cheques
 * @param {object} template
 * @param {object} options { feedMode, printerOffsetX, printerOffsetY }
 * @returns {string} HTML string
 */
function buildPrintHtml(cheques, template, options = {}) {
  if (!cheques || cheques.length === 0 || !template) return '';

  const feedMode = options.feedMode || 'canon_center';
  const offsetX = Number(options.printerOffsetX) || 0;
  const offsetY = Number(options.printerOffsetY) || 0;

  // Calculate layout offset based on feeding mode
  let baseLeftMm = 0;
  let baseTopMm = 0;

  if (feedMode === 'canon_center') {
    // Canon G3010 rear center tray: center on 210mm A4 width
    const centerOffset = Math.max(0, (210 - template.widthMm) / 2);
    baseLeftMm = centerOffset + offsetX;
    baseTopMm = Math.max(0, offsetY);
  } else if (feedMode === 'carrier_top_left') {
    // Aligned to top-left of A4 sheet
    baseLeftMm = Math.max(0, offsetX);
    baseTopMm = Math.max(0, offsetY);
  } else {
    // Direct custom size: 0 margin
    baseLeftMm = Math.max(0, offsetX);
    baseTopMm = Math.max(0, offsetY);
  }

  const f = template.fields;

  return cheques.map((chk, idx) => {
    // Format amount number and words
    const amountNumFormatted = wordsModule
      ? wordsModule.formatAmountNumber(chk.amount)
      : `=***${chk.amount}/-***`;

    const rawWords = wordsModule
      ? wordsModule.numberToWordsBDT(chk.amount)
      : `${chk.amount} Taka Only`;

    const formattedWords = wordsModule
      ? wordsModule.formatAmountWords(rawWords)
      : `*** ${rawWords} ***`;

    const splitWords = wordsModule
      ? wordsModule.splitWordsIntoTwoLines(formattedWords, 45)
      : { line1: formattedWords, line2: '' };

    // Format Date digits
    const cleanDate = (chk.date || '').replace(/\D/g, '');
    let dateHtml = '';

    if (f.date && f.date.mode === 'boxes') {
      const boxW = f.date.boxWidthMm || 5.4;
      const digits = cleanDate.padEnd(f.date.digitCount || 8, ' ').split('');
      dateHtml = digits.map((d, i) => `
        <span style="position: absolute; left: ${(f.date.xMm + i * boxW).toFixed(2)}mm; top: ${f.date.yMm.toFixed(2)}mm; width: ${boxW.toFixed(2)}mm; text-align: center; font-family: 'Courier New', monospace; font-size: ${f.date.fontSizePt || 12}pt; font-weight: bold; line-height: 1;">
          ${d}
        </span>
      `).join('');
    } else if (f.date) {
      dateHtml = `
        <div style="position: absolute; left: ${f.date.xMm.toFixed(2)}mm; top: ${f.date.yMm.toFixed(2)}mm; font-size: ${f.date.fontSizePt || 12}pt; font-weight: bold;">
          ${chk.date}
        </div>
      `;
    }

    const payeeText = f.payee && f.payee.prefixAsterisks
      ? `*** ${chk.payee} ***`
      : chk.payee;

    return `
      <div class="cheque-print-page" style="page-break-after: always; break-after: page; position: relative; width: 210mm; height: 297mm; margin: 0; padding: 0; box-sizing: border-box; overflow: hidden;">
        <div class="cheque-print-leaf" style="position: absolute; left: ${baseLeftMm.toFixed(2)}mm; top: ${baseTopMm.toFixed(2)}mm; width: ${template.widthMm}mm; height: ${template.heightMm}mm; box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; color: #000000;">
          
          <!-- Date -->
          ${dateHtml}

          <!-- Payee Name -->
          ${f.payee ? `
            <div style="position: absolute; left: ${f.payee.xMm.toFixed(2)}mm; top: ${f.payee.yMm.toFixed(2)}mm; width: ${(f.payee.widthMm || 115).toFixed(2)}mm; font-size: ${f.payee.fontSizePt || 11}pt; font-weight: ${f.payee.bold ? 'bold' : 'normal'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2;">
              ${payeeText}
            </div>
          ` : ''}

          <!-- Amount in Words Line 1 -->
          ${f.amountWordsLine1 ? `
            <div style="position: absolute; left: ${f.amountWordsLine1.xMm.toFixed(2)}mm; top: ${f.amountWordsLine1.yMm.toFixed(2)}mm; width: ${(f.amountWordsLine1.widthMm || 105).toFixed(2)}mm; font-size: ${f.amountWordsLine1.fontSizePt || 10}pt; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2;">
              ${splitWords.line1}
            </div>
          ` : ''}

          <!-- Amount in Words Line 2 -->
          ${f.amountWordsLine2 && splitWords.line2 ? `
            <div style="position: absolute; left: ${f.amountWordsLine2.xMm.toFixed(2)}mm; top: ${f.amountWordsLine2.yMm.toFixed(2)}mm; width: ${(f.amountWordsLine2.widthMm || 120).toFixed(2)}mm; font-size: ${f.amountWordsLine2.fontSizePt || 10}pt; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2;">
              ${splitWords.line2}
            </div>
          ` : ''}

          <!-- Amount in Figures -->
          ${f.amountNumber ? `
            <div style="position: absolute; left: ${f.amountNumber.xMm.toFixed(2)}mm; top: ${f.amountNumber.yMm.toFixed(2)}mm; width: ${(f.amountNumber.widthMm || 42).toFixed(2)}mm; height: ${(f.amountNumber.heightMm || 8.5).toFixed(2)}mm; font-size: ${f.amountNumber.fontSizePt || 12}pt; font-weight: bold; font-family: 'Segoe UI', Arial, sans-serif; white-space: nowrap; display: flex; align-items: center;">
              ${amountNumFormatted}
            </div>
          ` : ''}

          <!-- A/C Payee Crossing -->
          ${f.acPayee && chk.acPayee !== false ? `
            <div style="position: absolute; left: ${f.acPayee.xMm.toFixed(2)}mm; top: ${f.acPayee.yMm.toFixed(2)}mm; width: ${(f.acPayee.widthMm || 38).toFixed(2)}mm; border-top: 1.5px solid #000; border-bottom: 1.5px solid #000; padding: 1.5px 0; text-align: center; font-weight: bold; font-size: 8pt; letter-spacing: 1px; line-height: 1.1;">
              A/C PAYEE ONLY
            </div>
          ` : ''}

          <!-- Or Bearer Strikethrough -->
          ${f.bearer && chk.crossBearer !== false ? `
            <div style="position: absolute; left: ${f.bearer.xMm.toFixed(2)}mm; top: ${(f.bearer.strikeYMm || f.bearer.yMm + 2).toFixed(2)}mm; width: ${(f.bearer.widthMm || 16).toFixed(2)}mm; height: 1.5px; background: #000000;"></div>
          ` : ''}

        </div>
      </div>
    `;
  }).join('\n');
}

const BatchPrinterModule = {
  parseCSVorTSV,
  createBatchManager,
  buildPrintHtml
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BatchPrinterModule;
}

if (typeof window !== 'undefined') {
  window.BatchPrinterModule = BatchPrinterModule;
}
