/**
 * Cheque Visual Calibrator & Millimeter Grid Canvas Engine
 * Provides live WYSIWYG drag-and-drop, millimeter coordinates,
 * Canon G3010 center feeding calculation, and micro-nudging.
 */

// Screen DPI constant (standard CSS pixel ratio is 96 DPI: 1 inch = 25.4mm = 96px)
const SCREEN_DPI = 96;
const MM_PER_INCH = 25.4;

function mmToPx(mm, dpi = SCREEN_DPI) {
  return (mm * dpi) / MM_PER_INCH;
}

function pxToMm(px, dpi = SCREEN_DPI) {
  return (px * MM_PER_INCH) / dpi;
}

/**
 * Calculates center offset for printer feeder (e.g. Canon G3010 rear tray)
 * @param {number} chequeDimensionMm - Width (or height if vertical)
 * @param {number} totalWidthMm - Feed tray width (standard A4 is 210mm)
 * @returns {number} Offset in mm from left edge
 */
function calculateCenterOffset(chequeDimensionMm, totalWidthMm = 210) {
  return Math.max(0, (totalWidthMm - chequeDimensionMm) / 2);
}

/**
 * Calculates discrete positions for 8-digit date boxes (D D M M Y Y Y Y)
 * @param {object} dateConfig
 * @param {string} dateStr (e.g. "2026-11-20" or "20-11-2026")
 * @returns {Array<{ digit: string, xMm: number, yMm: number }>}
 */
function calculateDateBoxPositions(dateConfig, dateStr) {
  let digitsStr = '';
  if (typeof WordsConverter !== 'undefined' && WordsConverter.formatDateToDDMMYYYY) {
    digitsStr = WordsConverter.formatDateToDDMMYYYY(dateStr);
  } else if (typeof require !== 'undefined') {
    try {
      const wc = require('./words-converter.js');
      digitsStr = wc.formatDateToDDMMYYYY(dateStr);
    } catch(e) {
      digitsStr = String(dateStr || '').replace(/\D/g, '');
    }
  } else {
    digitsStr = String(dateStr || '').replace(/\D/g, '');
  }

  const digits = digitsStr.padEnd(dateConfig.digitCount || 8, ' ').split('');
  const result = [];
  const startX = dateConfig.xMm;
  const startY = dateConfig.yMm;
  const boxWidth = dateConfig.boxWidthMm || 5.5;

  for (let i = 0; i < (dateConfig.digitCount || 8); i++) {
    result.push({
      index: i,
      digit: digits[i] || '',
      xMm: startX + i * boxWidth,
      yMm: startY
    });
  }
  return result;
}

/**
 * Calibrator Class for interactive visual editing
 */
class Calibrator {
  constructor(options = {}) {
    this.container = options.container || null;
    this.template = options.template || null;
    this.chequeData = options.chequeData || {};
    this.selectedField = null;
    this.showGrid = options.showGrid !== false;
    this.showBackground = options.showBackground !== false;
    this.backgroundOpacity = options.backgroundOpacity || 0.85;
    this.zoom = options.zoom || 1.0;
    this.onTemplateChange = options.onTemplateChange || null;
    this.onFieldSelect = options.onFieldSelect || null;

    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragStartFieldX = 0;
    this.dragStartFieldY = 0;

    if (this.container) {
      this.initDOM();
    }
  }

  setTemplate(template) {
    this.template = JSON.parse(JSON.stringify(template));
    this.render();
  }

  setChequeData(data) {
    this.chequeData = { ...data };
    this.render();
  }

  setZoom(zoom) {
    this.zoom = Math.max(0.5, Math.min(2.5, zoom));
    this.render();
  }

  toggleGrid(show) {
    this.showGrid = show;
    if (this.gridCanvas) {
      this.gridCanvas.style.display = show ? 'block' : 'none';
    }
  }

  toggleBackground(show) {
    this.showBackground = show;
    if (this.bgImg) {
      this.bgImg.style.display = show ? 'block' : 'none';
    }
  }

  setBackgroundOpacity(opacity) {
    this.backgroundOpacity = opacity;
    if (this.bgImg) {
      this.bgImg.style.opacity = String(opacity);
    }
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="calibrator-viewport" style="position: relative; overflow: auto; width: 100%; height: 100%; display: flex; justify-content: center; align-items: flex-start; padding: 20px;">
        <div class="calibrator-cheque-board" style="position: relative; box-shadow: 0 4px 20px rgba(0,0,0,0.15); background: #ffffff; user-select: none;">
          <img class="calibrator-bg-image" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1;" />
          <canvas class="calibrator-grid-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2;"></canvas>
          <div class="calibrator-fields-layer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 3;"></div>
        </div>
      </div>
    `;

    this.board = this.container.querySelector('.calibrator-cheque-board');
    this.bgImg = this.container.querySelector('.calibrator-bg-image');
    this.gridCanvas = this.container.querySelector('.calibrator-grid-canvas');
    this.fieldsLayer = this.container.querySelector('.calibrator-fields-layer');

    // Setup drag events
    this.fieldsLayer.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.addEventListener('mouseup', () => this.handleMouseUp());

    // Keyboard nudge support
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  drawGrid() {
    if (!this.gridCanvas || !this.template) return;
    const canvas = this.gridCanvas;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const pxPerMm = (SCREEN_DPI / MM_PER_INCH) * this.zoom;

    // Draw 1mm minor lines
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgba(0, 150, 255, 0.15)';
    for (let x = 0; x <= w; x += pxPerMm) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += pxPerMm) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw 5mm medium lines
    ctx.strokeStyle = 'rgba(0, 150, 255, 0.35)';
    for (let x = 0; x <= w; x += pxPerMm * 5) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += pxPerMm * 5) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw 10mm (1cm) major lines with numbers
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0, 100, 220, 0.65)';
    ctx.fillStyle = 'rgba(0, 70, 180, 0.85)';
    ctx.font = '9px monospace';

    for (let x = 0; x <= w; x += pxPerMm * 10) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
      const cm = Math.round(x / (pxPerMm * 10));
      if (cm > 0) ctx.fillText(`${cm}`, x + 2, 10);
    }
    for (let y = 0; y <= h; y += pxPerMm * 10) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
      const cm = Math.round(y / (pxPerMm * 10));
      if (cm > 0) ctx.fillText(`${cm}`, 2, y - 2);
    }
  }

  render() {
    if (!this.board || !this.template) return;

    const widthPx = mmToPx(this.template.widthMm) * this.zoom;
    const heightPx = mmToPx(this.template.heightMm) * this.zoom;

    this.board.style.width = `${widthPx}px`;
    this.board.style.height = `${heightPx}px`;

    // Background image
    if (this.template.previewImage && this.showBackground) {
      this.bgImg.src = this.template.previewImage;
      this.bgImg.style.display = 'block';
      this.bgImg.style.opacity = String(this.backgroundOpacity);
    } else {
      this.bgImg.style.display = 'none';
    }

    // Grid canvas
    this.gridCanvas.width = widthPx;
    this.gridCanvas.height = heightPx;
    this.toggleGrid(this.showGrid);
    this.drawGrid();

    // Render Field Elements
    this.renderFieldElements();
  }

  renderFieldElements() {
    if (!this.fieldsLayer || !this.template) return;
    this.fieldsLayer.innerHTML = '';

    const fields = this.template.fields;
    const data = this.chequeData || {};
    const pxPerMm = (SCREEN_DPI / MM_PER_INCH) * this.zoom;

    // 1. Date Field
    if (fields.date) {
      const dateEl = document.createElement('div');
      dateEl.className = `calibrator-field ${this.selectedField === 'date' ? 'selected' : ''}`;
      dateEl.dataset.field = 'date';
      dateEl.style.position = 'absolute';
      dateEl.style.left = `${fields.date.xMm * pxPerMm}px`;
      dateEl.style.top = `${fields.date.yMm * pxPerMm}px`;
      dateEl.style.cursor = 'move';

      if (fields.date.mode === 'boxes') {
        const boxes = calculateDateBoxPositions(fields.date, data.date || '20112026');
        dateEl.innerHTML = `
          <div style="display: flex; gap: 0;">
            ${boxes.map(b => `
              <div style="width: ${fields.date.boxWidthMm * pxPerMm}px; height: ${(fields.date.boxWidthMm + 1) * pxPerMm}px; border: 1px dashed rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-family: monospace; font-weight: bold; font-size: ${(fields.date.fontSizePt || 12) * this.zoom}pt;">
                ${b.digit}
              </div>
            `).join('')}
          </div>
        `;
      } else {
        dateEl.innerHTML = `<span style="font-size: ${(fields.date.fontSizePt || 12) * this.zoom}pt; font-weight: bold;">${data.date || '20-11-2026'}</span>`;
      }
      this.fieldsLayer.appendChild(dateEl);
    }

    // 2. Payee Name Field
    if (fields.payee) {
      const payeeEl = document.createElement('div');
      payeeEl.className = `calibrator-field ${this.selectedField === 'payee' ? 'selected' : ''}`;
      payeeEl.dataset.field = 'payee';
      payeeEl.style.position = 'absolute';
      payeeEl.style.left = `${fields.payee.xMm * pxPerMm}px`;
      payeeEl.style.top = `${fields.payee.yMm * pxPerMm}px`;
      payeeEl.style.width = `${(fields.payee.widthMm || 110) * pxPerMm}px`;
      payeeEl.style.fontSize = `${(fields.payee.fontSizePt || 11) * this.zoom}pt`;
      payeeEl.style.fontWeight = fields.payee.bold ? 'bold' : 'normal';
      payeeEl.style.cursor = 'move';
      const payeeText = data.payee || 'MD. SHAHRIAR MORSHED JAHIN';
      payeeEl.innerHTML = `<span class="field-text">${fields.payee.prefixAsterisks ? `*** ${payeeText} ***` : payeeText}</span>`;
      this.fieldsLayer.appendChild(payeeEl);
    }

    // 3. Amount Words Line 1
    if (fields.amountWordsLine1) {
      const w1El = document.createElement('div');
      w1El.className = `calibrator-field ${this.selectedField === 'amountWordsLine1' ? 'selected' : ''}`;
      w1El.dataset.field = 'amountWordsLine1';
      w1El.style.position = 'absolute';
      w1El.style.left = `${fields.amountWordsLine1.xMm * pxPerMm}px`;
      w1El.style.top = `${fields.amountWordsLine1.yMm * pxPerMm}px`;
      w1El.style.width = `${(fields.amountWordsLine1.widthMm || 100) * pxPerMm}px`;
      w1El.style.fontSize = `${(fields.amountWordsLine1.fontSizePt || 10) * this.zoom}pt`;
      w1El.style.cursor = 'move';
      w1El.innerHTML = `<span class="field-text">${data.wordsLine1 || '*** Fifty Two Lakh Thirty Four Thousand'}</span>`;
      this.fieldsLayer.appendChild(w1El);
    }

    // 4. Amount Words Line 2
    if (fields.amountWordsLine2) {
      const w2El = document.createElement('div');
      w2El.className = `calibrator-field ${this.selectedField === 'amountWordsLine2' ? 'selected' : ''}`;
      w2El.dataset.field = 'amountWordsLine2';
      w2El.style.position = 'absolute';
      w2El.style.left = `${fields.amountWordsLine2.xMm * pxPerMm}px`;
      w2El.style.top = `${fields.amountWordsLine2.yMm * pxPerMm}px`;
      w2El.style.width = `${(fields.amountWordsLine2.widthMm || 115) * pxPerMm}px`;
      w2El.style.fontSize = `${(fields.amountWordsLine2.fontSizePt || 10) * this.zoom}pt`;
      w2El.style.cursor = 'move';
      w2El.innerHTML = `<span class="field-text">${data.wordsLine2 || 'Five Hundred Taka and Fifty Poisha Only ***'}</span>`;
      this.fieldsLayer.appendChild(w2El);
    }

    // 5. Amount in Numbers
    if (fields.amountNumber) {
      const numEl = document.createElement('div');
      numEl.className = `calibrator-field ${this.selectedField === 'amountNumber' ? 'selected' : ''}`;
      numEl.dataset.field = 'amountNumber';
      numEl.style.position = 'absolute';
      numEl.style.left = `${fields.amountNumber.xMm * pxPerMm}px`;
      numEl.style.top = `${fields.amountNumber.yMm * pxPerMm}px`;
      numEl.style.width = `${(fields.amountNumber.widthMm || 42) * pxPerMm}px`;
      numEl.style.height = `${(fields.amountNumber.heightMm || 8.5) * pxPerMm}px`;
      numEl.style.fontSize = `${(fields.amountNumber.fontSizePt || 12) * this.zoom}pt`;
      numEl.style.fontWeight = 'bold';
      numEl.style.cursor = 'move';
      numEl.innerHTML = `<span class="field-text">${data.amountNumber || '=***52,34,500.50/-***'}</span>`;
      this.fieldsLayer.appendChild(numEl);
    }

    // 6. A/C Payee Crossing (Top-left diagonal corner or horizontal)
    if (fields.acPayee && data.acPayee !== false) {
      const acEl = document.createElement('div');
      acEl.className = `calibrator-field ${this.selectedField === 'acPayee' ? 'selected' : ''}`;
      acEl.dataset.field = 'acPayee';
      acEl.style.position = 'absolute';
      acEl.style.left = `${(fields.acPayee.xMm || 0) * pxPerMm}px`;
      acEl.style.top = `${(fields.acPayee.yMm || 0) * pxPerMm}px`;
      acEl.style.width = `${(fields.acPayee.sizeMm || 35) * pxPerMm}px`;
      acEl.style.height = `${(fields.acPayee.sizeMm || 35) * pxPerMm}px`;
      acEl.style.cursor = 'move';

      const s = fields.acPayee.sizeMm || 35;
      const l1 = fields.acPayee.line1Start || 19;
      const l2 = fields.acPayee.line2Start || 25;

      if (fields.acPayee.style === 'horizontal_box') {
        acEl.style.height = 'auto';
        acEl.innerHTML = `
          <div style="border-top: 1.5px solid #000; border-bottom: 1.5px solid #000; padding: 2px 0; text-align: center; font-weight: bold; font-size: ${8 * this.zoom}pt; letter-spacing: 1px;">
            A/C PAYEE ONLY
          </div>
        `;
      } else {
        acEl.innerHTML = `
          <svg style="width: 100%; height: 100%; pointer-events: none;" viewBox="0 0 ${s} ${s}">
            <line x1="0" y1="${l1}" x2="${l1}" y2="0" stroke="#000000" stroke-width="0.5" />
            ${fields.acPayee.style === 'diagonal_lines' ? '' : `
              <text x="11" y="11" transform="rotate(-45 11 11)" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="2.0" font-weight="bold" letter-spacing="0.2" fill="#000000">A/C PAYEE ONLY</text>
            `}
            <line x1="0" y1="${l2}" x2="${l2}" y2="0" stroke="#000000" stroke-width="0.5" />
          </svg>
        `;
      }
      this.fieldsLayer.appendChild(acEl);
    }

    // 7. Or Bearer Strikethrough
    if (fields.bearer && data.crossBearer !== false) {
      const bEl = document.createElement('div');
      bEl.className = `calibrator-field ${this.selectedField === 'bearer' ? 'selected' : ''}`;
      bEl.dataset.field = 'bearer';
      bEl.style.position = 'absolute';
      bEl.style.left = `${fields.bearer.xMm * pxPerMm}px`;
      bEl.style.top = `${fields.bearer.yMm * pxPerMm}px`;
      bEl.style.width = `${(fields.bearer.widthMm || 16) * pxPerMm}px`;
      bEl.style.cursor = 'move';
      bEl.innerHTML = `
        <div style="position: relative; height: 12px; display: flex; align-items: center;">
          <div style="position: absolute; left: 0; right: 0; height: 1.5px; background: #000;"></div>
          <span style="font-size: ${7 * this.zoom}pt; opacity: 0.5;">Strike</span>
        </div>
      `;
      this.fieldsLayer.appendChild(bEl);
    }
  }

  handleMouseDown(e) {
    const fieldEl = e.target.closest('.calibrator-field');
    if (!fieldEl) return;

    const fieldName = fieldEl.dataset.field;
    this.selectField(fieldName);

    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;

    const field = this.template.fields[fieldName];
    this.dragStartFieldX = field.xMm;
    this.dragStartFieldY = field.yMm;

    e.preventDefault();
  }

  handleMouseMove(e) {
    if (!this.isDragging || !this.selectedField || !this.template) return;

    const pxPerMm = (SCREEN_DPI / MM_PER_INCH) * this.zoom;
    const dxPx = e.clientX - this.dragStartX;
    const dyPx = e.clientY - this.dragStartY;

    const dxMm = dxPx / pxPerMm;
    const dyMm = dyPx / pxPerMm;

    const field = this.template.fields[this.selectedField];
    field.xMm = Math.max(0, Math.round((this.dragStartFieldX + dxMm) * 2) / 2); // snap to 0.5mm
    field.yMm = Math.max(0, Math.round((this.dragStartFieldY + dyMm) * 2) / 2);

    this.renderFieldElements();

    if (this.onTemplateChange) {
      this.onTemplateChange(this.template, this.selectedField);
    }
  }

  handleMouseUp() {
    this.isDragging = false;
  }

  handleKeyDown(e) {
    if (!this.selectedField || !this.template) return;

    const step = e.shiftKey ? 0.1 : 0.5; // Shift for fine 0.1mm micro-adjustment
    let handled = false;

    if (e.key === 'ArrowLeft') {
      this.nudgeField(-step, 0);
      handled = true;
    } else if (e.key === 'ArrowRight') {
      this.nudgeField(step, 0);
      handled = true;
    } else if (e.key === 'ArrowUp') {
      this.nudgeField(0, -step);
      handled = true;
    } else if (e.key === 'ArrowDown') {
      this.nudgeField(0, step);
      handled = true;
    }

    if (handled) {
      e.preventDefault();
    }
  }

  selectField(fieldName) {
    this.selectedField = fieldName;
    if (this.fieldsLayer) {
      this.fieldsLayer.querySelectorAll('.calibrator-field').forEach(el => {
        el.classList.toggle('selected', el.dataset.field === fieldName);
      });
    }
    if (this.onFieldSelect) {
      this.onFieldSelect(fieldName, this.template ? this.template.fields[fieldName] : null);
    }
  }

  nudgeField(dxMm, dyMm) {
    if (!this.selectedField || !this.template) return;
    const field = this.template.fields[this.selectedField];
    if (!field) return;

    field.xMm = Math.max(0, Math.round((field.xMm + dxMm) * 10) / 10);
    field.yMm = Math.max(0, Math.round((field.yMm + dyMm) * 10) / 10);

    this.renderFieldElements();

    if (this.onTemplateChange) {
      this.onTemplateChange(this.template, this.selectedField);
    }
  }

  updateFieldProp(fieldName, prop, val) {
    if (!this.template || !this.template.fields[fieldName]) return;
    this.template.fields[fieldName][prop] = val;
    this.renderFieldElements();

    if (this.onTemplateChange) {
      this.onTemplateChange(this.template, fieldName);
    }
  }
}

const CalibratorModule = {
  SCREEN_DPI,
  MM_PER_INCH,
  mmToPx,
  pxToMm,
  calculateCenterOffset,
  calculateDateBoxPositions,
  Calibrator
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CalibratorModule;
}

if (typeof window !== 'undefined') {
  window.Calibrator = Calibrator;
  window.CalibratorModule = CalibratorModule;
}
