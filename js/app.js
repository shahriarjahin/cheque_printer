/**
 * Main Application Controller - ChequePrint BD
 * Connects UI, storage, visual calibrator, and print engine.
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentBankId = 'nrbc';
  let currentTemplate = null;
  let allTemplates = {};
  let settings = {};
  let batchManager = null;
  let calibrator = null;
  let currentZoom = 1.0;

  // DOM Elements
  const bankSelect = document.getElementById('bank-select');
  const feedModeSelect = document.getElementById('feed-mode-select');
  const printerOffsetXInput = document.getElementById('printer-offset-x');
  const printerOffsetYInput = document.getElementById('printer-offset-y');
  const btnPrintCurrent = document.getElementById('btn-print-current');
  const btnBackupModal = document.getElementById('btn-backup-modal');
  const toastContainer = document.getElementById('toast-container');
  const printArea = document.getElementById('print-area');

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // Single Form Elements
  const singleDate = document.getElementById('single-date');
  const singlePayee = document.getElementById('single-payee');
  const singleAmount = document.getElementById('single-amount');
  const singleAmountFormatted = document.getElementById('single-amount-formatted');
  const singleWords = document.getElementById('single-words');
  const singleAcPayee = document.getElementById('single-ac-payee');
  const singleAcStyle = document.getElementById('single-ac-style');
  const singleCrossBearer = document.getElementById('single-cross-bearer');
  const singleBankLabel = document.getElementById('single-bank-label');
  const btnAddToBatch = document.getElementById('btn-add-to-batch');
  const btnPrintSingle = document.getElementById('btn-print-single');
  const btnSwitchToCalibrator = document.getElementById('btn-switch-to-calibrator');

  // Single Preview Elements
  const singlePreviewViewport = document.getElementById('single-preview-viewport');
  const singlePreviewBg = document.getElementById('single-preview-bg');
  const singlePreviewFields = document.getElementById('single-preview-fields');

  // Batch Elements
  const batchBadge = document.getElementById('batch-badge');
  const batchSummaryText = document.getElementById('batch-summary-text');
  const batchTableBody = document.getElementById('batch-table-body');
  const btnAddBatchRow = document.getElementById('btn-add-batch-row');
  const btnOpenCsvModal = document.getElementById('btn-open-csv-modal');
  const btnClearBatch = document.getElementById('btn-clear-batch');
  const btnPrintBatch = document.getElementById('btn-print-batch');

  // Calibrator Elements
  const calibratorBankBadge = document.getElementById('calibrator-bank-badge');
  const calibratorBankName = document.getElementById('calibrator-bank-name');
  const calibratorDimensions = document.getElementById('calibrator-dimensions');
  const calibratorCanvasMount = document.getElementById('calibrator-canvas-mount');
  const calToggleGrid = document.getElementById('cal-toggle-grid');
  const calToggleBg = document.getElementById('cal-toggle-bg');
  const calOpacitySlider = document.getElementById('cal-opacity-slider');
  const calZoomIn = document.getElementById('cal-zoom-in');
  const calZoomOut = document.getElementById('cal-zoom-out');
  const calZoomLabel = document.getElementById('cal-zoom-label');
  const btnSaveTemplate = document.getElementById('btn-save-template');
  const btnResetTemplate = document.getElementById('btn-reset-template');

  // Calibrator Field Properties
  const propFieldName = document.getElementById('prop-field-name');
  const propControlsContainer = document.getElementById('prop-controls-container');
  const propEmptyMessage = document.getElementById('prop-empty-message');
  const propX = document.getElementById('prop-x');
  const propY = document.getElementById('prop-y');
  const propWidth = document.getElementById('prop-width');
  const propFontSize = document.getElementById('prop-font-size');
  const propDateBoxGroup = document.getElementById('prop-date-box-group');
  const propDateBoxWidth = document.getElementById('prop-date-box-width');

  // Nudge Buttons
  const nudgeUp = document.getElementById('nudge-up');
  const nudgeDown = document.getElementById('nudge-down');
  const nudgeLeft = document.getElementById('nudge-left');
  const nudgeRight = document.getElementById('nudge-right');
  const nudgeCenter = document.getElementById('nudge-center');

  // Modals
  const modalCsv = document.getElementById('modal-csv');
  const modalBackup = document.getElementById('modal-backup');
  const csvPasteArea = document.getElementById('csv-paste-area');
  const btnLoadSampleCsv = document.getElementById('btn-load-sample-csv');
  const btnBrowseCsv = document.getElementById('btn-browse-csv');
  const csvFileInput = document.getElementById('csv-file-input');
  const btnImportCsvConfirm = document.getElementById('btn-import-csv-confirm');
  const btnExportBackup = document.getElementById('btn-export-backup');
  const backupFileInput = document.getElementById('backup-file-input');

  // Initialize
  initApp();

  function initApp() {
    // 1. Load Settings & Storage
    settings = window.StorageManager.getGlobalSettings();
    allTemplates = window.StorageManager.getTemplates();
    currentBankId = settings.activeBankId || 'nrbc';
    if (!allTemplates[currentBankId]) currentBankId = 'nrbc';
    currentTemplate = allTemplates[currentBankId];

    // 2. Init Batch Manager
    batchManager = window.BatchPrinterModule.createBatchManager();
    // Pre-populate with sample cheques
    batchManager.add({ date: getTodayDate(), payee: 'MD. SHAHRIAR MORSHED JAHIN', amount: 5234500.50, acPayee: true, crossBearer: true });
    batchManager.add({ date: getTodayDate(), payee: 'ACME TRADING CORP', amount: 150000.00, acPayee: true, crossBearer: false });

    // 3. Populate Bank Dropdown
    populateBankDropdown();

    // 4. Set Header Controls
    feedModeSelect.value = settings.feedMode || 'canon_center';
    printerOffsetXInput.value = settings.printerOffsetX || 0;
    printerOffsetYInput.value = settings.printerOffsetY || 0;

    // 5. Setup Single Form defaults
    singleDate.value = getTodayDate();
    singlePayee.value = 'MD. SHAHRIAR MORSHED JAHIN';
    singleAmount.value = '5234500.50';
    updateAmountWords();

    // 6. Init Calibrator
    initCalibrator();

    // 7. Render Views
    renderSinglePreview();
    renderBatchTable();

    // 8. Event Listeners
    setupEventListeners();
  }

  function getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function populateBankDropdown() {
    bankSelect.innerHTML = '';
    Object.values(allTemplates).forEach(tmpl => {
      const opt = document.createElement('option');
      opt.value = tmpl.id;
      opt.textContent = `${tmpl.name} (${tmpl.widthMm} × ${tmpl.heightMm} mm)`;
      if (tmpl.id === currentBankId) opt.selected = true;
      bankSelect.appendChild(opt);
    });

    singleBankLabel.textContent = currentTemplate.name;
    calibratorBankName.textContent = currentTemplate.name;
    calibratorBankBadge.textContent = currentTemplate.id.toUpperCase();
    calibratorDimensions.textContent = `${currentTemplate.widthMm}mm × ${currentTemplate.heightMm}mm`;
  }

  function initCalibrator() {
    calibrator = new window.Calibrator({
      container: calibratorCanvasMount,
      template: currentTemplate,
      chequeData: getSingleChequeData(),
      showGrid: calToggleGrid.checked,
      showBackground: calToggleBg.checked,
      backgroundOpacity: parseFloat(calOpacitySlider.value),
      zoom: currentZoom,
      onTemplateChange: (updatedTemplate, changedField) => {
        currentTemplate = updatedTemplate;
        allTemplates[currentBankId] = updatedTemplate;
        updatePropertyInputs(changedField);
        renderSinglePreview();
      },
      onFieldSelect: (fieldName, fieldConfig) => {
        showFieldProperties(fieldName, fieldConfig);
      }
    });
  }

  function updateAmountWords() {
    const rawVal = singleAmount.value;
    if (!rawVal || isNaN(Number(rawVal))) {
      singleAmountFormatted.textContent = '=***0/-***';
      singleWords.value = '';
      return;
    }
    singleAmountFormatted.textContent = window.WordsConverter.formatAmountNumber(rawVal);
    const words = window.WordsConverter.numberToWordsBDT(rawVal);
    singleWords.value = window.WordsConverter.formatAmountWords(words);
  }

  function getSingleChequeData() {
    const amountVal = parseFloat(singleAmount.value) || 0;
    const rawWords = window.WordsConverter.numberToWordsBDT(amountVal);
    const formattedWords = window.WordsConverter.formatAmountWords(rawWords);
    const split = window.WordsConverter.splitWordsIntoTwoLines(formattedWords, 45);

    return {
      date: singleDate.value,
      payee: singlePayee.value.trim(),
      amount: amountVal,
      amountNumber: window.WordsConverter.formatAmountNumber(amountVal),
      wordsLine1: split.line1,
      wordsLine2: split.line2,
      acPayee: singleAcPayee.checked,
      acStyle: singleAcStyle ? singleAcStyle.value : 'diagonal_text',
      crossBearer: singleCrossBearer.checked
    };
  }

  function renderSinglePreview() {
    if (!currentTemplate) return;
    const data = getSingleChequeData();
    const pxPerMm = (window.CalibratorModule.SCREEN_DPI / window.CalibratorModule.MM_PER_INCH) * 0.95;

    singlePreviewViewport.style.width = `${currentTemplate.widthMm * pxPerMm}px`;
    singlePreviewViewport.style.height = `${currentTemplate.heightMm * pxPerMm}px`;

    if (currentTemplate.previewImage) {
      singlePreviewBg.src = currentTemplate.previewImage;
      singlePreviewBg.style.display = 'block';
    } else {
      singlePreviewBg.style.display = 'none';
    }

    const f = currentTemplate.fields;
    let html = '';

    // Date
    if (f.date && f.date.mode === 'boxes') {
      const boxes = window.CalibratorModule.calculateDateBoxPositions(f.date, data.date);
      html += boxes.map(b => `
        <div style="position: absolute; left: ${b.xMm * pxPerMm}px; top: ${b.yMm * pxPerMm}px; width: ${f.date.boxWidthMm * pxPerMm}px; height: ${(f.date.boxWidthMm + 1) * pxPerMm}px; border: 1px dashed rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: ${(f.date.fontSizePt || 12) * 0.95}pt; font-weight: bold;">
          ${b.digit}
        </div>
      `).join('');
    } else if (f.date) {
      html += `<div style="position: absolute; left: ${f.date.xMm * pxPerMm}px; top: ${f.date.yMm * pxPerMm}px; font-size: ${(f.date.fontSizePt || 12) * 0.95}pt; font-weight: bold;">${data.date}</div>`;
    }

    // Payee
    if (f.payee) {
      const text = f.payee.prefixAsterisks ? `*** ${data.payee} ***` : data.payee;
      html += `<div style="position: absolute; left: ${f.payee.xMm * pxPerMm}px; top: ${f.payee.yMm * pxPerMm}px; width: ${(f.payee.widthMm || 110) * pxPerMm}px; font-size: ${(f.payee.fontSizePt || 11) * 0.95}pt; font-weight: ${f.payee.bold ? 'bold' : 'normal'}; overflow: hidden; white-space: nowrap;">${text}</div>`;
    }

    // Words Line 1
    if (f.amountWordsLine1) {
      html += `<div style="position: absolute; left: ${f.amountWordsLine1.xMm * pxPerMm}px; top: ${f.amountWordsLine1.yMm * pxPerMm}px; width: ${(f.amountWordsLine1.widthMm || 105) * pxPerMm}px; font-size: ${(f.amountWordsLine1.fontSizePt || 10) * 0.95}pt; overflow: hidden; white-space: nowrap;">${data.wordsLine1}</div>`;
    }

    // Words Line 2
    if (f.amountWordsLine2 && data.wordsLine2) {
      html += `<div style="position: absolute; left: ${f.amountWordsLine2.xMm * pxPerMm}px; top: ${f.amountWordsLine2.yMm * pxPerMm}px; width: ${(f.amountWordsLine2.widthMm || 120) * pxPerMm}px; font-size: ${(f.amountWordsLine2.fontSizePt || 10) * 0.95}pt; overflow: hidden; white-space: nowrap;">${data.wordsLine2}</div>`;
    }

    // Amount Number
    if (f.amountNumber) {
      html += `<div style="position: absolute; left: ${f.amountNumber.xMm * pxPerMm}px; top: ${f.amountNumber.yMm * pxPerMm}px; font-size: ${(f.amountNumber.fontSizePt || 12) * 0.95}pt; font-weight: bold; font-family: monospace;">${data.amountNumber}</div>`;
    }

    // A/C Payee (Top-Left Diagonal Corner Crossing)
    if (f.acPayee && data.acPayee) {
      const style = data.acStyle || f.acPayee.style || 'diagonal_text';
      const s = f.acPayee.sizeMm || 35;
      const l1 = f.acPayee.line1Start || 19;
      const l2 = f.acPayee.line2Start || 25;

      if (style === 'horizontal_box') {
        html += `<div style="position: absolute; left: ${f.acPayee.xMm * pxPerMm}px; top: ${f.acPayee.yMm * pxPerMm}px; width: ${(f.acPayee.widthMm || 38) * pxPerMm}px; border-top: 1.5px solid #000; border-bottom: 1.5px solid #000; padding: 1px 0; text-align: center; font-weight: bold; font-size: ${7.5 * 0.95}pt; letter-spacing: 1px;">A/C PAYEE ONLY</div>`;
      } else {
        html += `
          <div style="position: absolute; left: ${(f.acPayee.xMm || 0) * pxPerMm}px; top: ${(f.acPayee.yMm || 0) * pxPerMm}px; width: ${s * pxPerMm}px; height: ${s * pxPerMm}px; pointer-events: none;">
            <svg style="width: 100%; height: 100%;" viewBox="0 0 ${s} ${s}">
              <line x1="0" y1="${l1}" x2="${l1}" y2="0" stroke="#000000" stroke-width="0.5" />
              ${style === 'diagonal_lines' ? '' : `
                <text x="11" y="11" transform="rotate(-45 11 11)" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="2.0" font-weight="bold" letter-spacing="0.2" fill="#000000">A/C PAYEE ONLY</text>
              `}
              <line x1="0" y1="${l2}" x2="${l2}" y2="0" stroke="#000000" stroke-width="0.5" />
            </svg>
          </div>
        `;
      }
    }

    // Bearer
    if (f.bearer && data.crossBearer) {
      html += `<div style="position: absolute; left: ${f.bearer.xMm * pxPerMm}px; top: ${(f.bearer.strikeYMm || f.bearer.yMm + 2) * pxPerMm}px; width: ${(f.bearer.widthMm || 16) * pxPerMm}px; height: 1.5px; background: #000;"></div>`;
    }

    singlePreviewFields.innerHTML = html;
  }

  function renderBatchTable() {
    const queue = batchManager.getQueue();
    batchBadge.textContent = String(queue.length);

    let totalAmount = 0;
    queue.forEach(item => { totalAmount += item.amount || 0; });
    batchSummaryText.textContent = `${queue.length} cheques in queue — Total: ৳${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    if (queue.length === 0) {
      batchTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">Queue is empty. Click "+ Add Cheque Row" or paste CSV data.</td></tr>`;
      return;
    }

    batchTableBody.innerHTML = queue.map((item, idx) => `
      <tr data-id="${item.id}">
        <td style="text-align: center; font-weight: bold; color: var(--text-muted);">${idx + 1}</td>
        <td>
          <input type="date" class="table-input batch-field-date" value="${item.date}" />
        </td>
        <td>
          <input type="text" class="table-input batch-field-payee" value="${item.payee}" placeholder="Payee name" />
        </td>
        <td>
          <input type="number" class="table-input batch-field-amount" value="${item.amount}" step="0.01" style="font-weight: bold;" />
        </td>
        <td style="text-align: center;">
          <input type="checkbox" class="batch-field-ac" ${item.acPayee ? 'checked' : ''} />
        </td>
        <td style="text-align: center;">
          <input type="checkbox" class="batch-field-bearer" ${item.crossBearer ? 'checked' : ''} />
        </td>
        <td style="text-align: center;">
          <button class="btn btn-outline btn-sm btn-batch-dup" title="Duplicate Row">⎘</button>
          <button class="btn btn-outline btn-sm btn-batch-del" style="color: var(--danger);" title="Delete Row">✕</button>
        </td>
      </tr>
    `).join('');
  }

  function showFieldProperties(fieldName, fieldConfig) {
    if (!fieldName || !fieldConfig) {
      propFieldName.textContent = 'None';
      propControlsContainer.style.display = 'none';
      propEmptyMessage.style.display = 'block';
      return;
    }

    propFieldName.textContent = fieldName;
    propControlsContainer.style.display = 'block';
    propEmptyMessage.style.display = 'none';

    propX.value = fieldConfig.xMm !== undefined ? fieldConfig.xMm : 0;
    propY.value = fieldConfig.yMm !== undefined ? fieldConfig.yMm : 0;
    propWidth.value = fieldConfig.widthMm !== undefined ? fieldConfig.widthMm : 0;
    propFontSize.value = fieldConfig.fontSizePt !== undefined ? fieldConfig.fontSizePt : 11;

    if (fieldName === 'date' && fieldConfig.mode === 'boxes') {
      propDateBoxGroup.style.display = 'block';
      propDateBoxWidth.value = fieldConfig.boxWidthMm || 5.4;
    } else {
      propDateBoxGroup.style.display = 'none';
    }
  }

  function updatePropertyInputs(fieldName) {
    if (calibrator && calibrator.selectedField === fieldName) {
      const field = currentTemplate.fields[fieldName];
      if (field) {
        propX.value = field.xMm;
        propY.value = field.yMm;
      }
    }
  }

  function printCheques(chequeList) {
    if (!chequeList || chequeList.length === 0) {
      showToast('No cheques to print!', 'error');
      return;
    }

    const feedMode = feedModeSelect.value;
    const offsetX = parseFloat(printerOffsetXInput.value) || 0;
    const offsetY = parseFloat(printerOffsetYInput.value) || 0;

    const html = window.BatchPrinterModule.buildPrintHtml(chequeList, currentTemplate, {
      feedMode,
      printerOffsetX: offsetX,
      printerOffsetY: offsetY
    });

    printArea.innerHTML = html;

    // Small delay to ensure styles apply
    setTimeout(() => {
      window.print();
    }, 150);
  }

  function setupEventListeners() {
    // Bank Switcher
    bankSelect.addEventListener('change', (e) => {
      currentBankId = e.target.value;
      currentTemplate = allTemplates[currentBankId];
      settings.activeBankId = currentBankId;
      window.StorageManager.saveGlobalSettings(settings);

      populateBankDropdown();
      calibrator.setTemplate(currentTemplate);
      renderSinglePreview();
      showToast(`Switched to ${currentTemplate.name}`);
    });

    // Feeding Mode Switcher
    feedModeSelect.addEventListener('change', (e) => {
      settings.feedMode = e.target.value;
      window.StorageManager.saveGlobalSettings(settings);
      showToast(`Feed mode set to: ${e.target.options[e.target.selectedIndex].text}`);
    });

    // Printer Offsets
    printerOffsetXInput.addEventListener('change', (e) => {
      settings.printerOffsetX = parseFloat(e.target.value) || 0;
      window.StorageManager.saveGlobalSettings(settings);
    });
    printerOffsetYInput.addEventListener('change', (e) => {
      settings.printerOffsetY = parseFloat(e.target.value) || 0;
      window.StorageManager.saveGlobalSettings(settings);
    });

    // Tab Switching
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetTab = document.getElementById(btn.dataset.tab);
        if (targetTab) targetTab.classList.add('active');

        if (btn.dataset.tab === 'tab-calibrator') {
          calibrator.setTemplate(currentTemplate);
          calibrator.setChequeData(getSingleChequeData());
        }
      });
    });

    btnSwitchToCalibrator.addEventListener('click', () => {
      document.querySelector('[data-tab="tab-calibrator"]').click();
    });

    // Single Form Real-time Binding
    [singleDate, singlePayee, singleAmount, singleAcPayee, singleAcStyle, singleCrossBearer].forEach(el => {
      if (!el) return;
      el.addEventListener('input', () => {
        updateAmountWords();
        renderSinglePreview();
        if (calibrator) {
          calibrator.setChequeData(getSingleChequeData());
        }
      });
    });
    if (singleAcStyle) {
      singleAcStyle.addEventListener('change', () => {
        renderSinglePreview();
        if (currentTemplate && currentTemplate.fields.acPayee) {
          currentTemplate.fields.acPayee.style = singleAcStyle.value;
          if (calibrator) calibrator.setTemplate(currentTemplate);
        }
      });
    }

    // Single Form Actions
    btnAddToBatch.addEventListener('click', () => {
      const data = getSingleChequeData();
      batchManager.add({
        date: data.date,
        payee: data.payee,
        amount: data.amount,
        acPayee: data.acPayee,
        crossBearer: data.crossBearer
      });
      renderBatchTable();
      showToast('Added cheque to batch queue!', 'success');
    });

    btnPrintSingle.addEventListener('click', () => {
      printCheques([getSingleChequeData()]);
    });

    btnPrintCurrent.addEventListener('click', () => {
      printCheques([getSingleChequeData()]);
    });

    // Batch Actions
    btnAddBatchRow.addEventListener('click', () => {
      batchManager.add({ date: getTodayDate(), payee: '', amount: 0 });
      renderBatchTable();
    });

    btnClearBatch.addEventListener('click', () => {
      if (confirm('Clear all cheques from batch queue?')) {
        batchManager.clear();
        renderBatchTable();
        showToast('Batch queue cleared');
      }
    });

    btnPrintBatch.addEventListener('click', () => {
      printCheques(batchManager.getQueue());
    });

    // Batch Table Inline Editing
    batchTableBody.addEventListener('input', (e) => {
      const tr = e.target.closest('tr');
      if (!tr) return;
      const id = tr.dataset.id;
      const date = tr.querySelector('.batch-field-date').value;
      const payee = tr.querySelector('.batch-field-payee').value;
      const amount = parseFloat(tr.querySelector('.batch-field-amount').value) || 0;
      const acPayee = tr.querySelector('.batch-field-ac').checked;
      const crossBearer = tr.querySelector('.batch-field-bearer').checked;

      batchManager.update(id, { date, payee, amount, acPayee, crossBearer });

      let total = 0;
      batchManager.getQueue().forEach(i => { total += i.amount || 0; });
      batchSummaryText.textContent = `${batchManager.getQueue().length} cheques in queue — Total: ৳${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    });

    // Batch Row Duplicate / Delete
    batchTableBody.addEventListener('click', (e) => {
      const tr = e.target.closest('tr');
      if (!tr) return;
      const id = tr.dataset.id;

      if (e.target.closest('.btn-batch-del')) {
        batchManager.remove(id);
        renderBatchTable();
      } else if (e.target.closest('.btn-batch-dup')) {
        const item = batchManager.get(id);
        if (item) {
          batchManager.add({ ...item, id: undefined });
          renderBatchTable();
          showToast('Duplicated cheque row');
        }
      }
    });

    // Calibrator Controls
    calToggleGrid.addEventListener('change', (e) => calibrator.toggleGrid(e.target.checked));
    calToggleBg.addEventListener('change', (e) => calibrator.toggleBackground(e.target.checked));
    calOpacitySlider.addEventListener('input', (e) => calibrator.setBackgroundOpacity(parseFloat(e.target.value)));

    calZoomIn.addEventListener('click', () => {
      currentZoom = Math.min(2.5, currentZoom + 0.25);
      calZoomLabel.textContent = `${Math.round(currentZoom * 100)}%`;
      calibrator.setZoom(currentZoom);
    });

    calZoomOut.addEventListener('click', () => {
      currentZoom = Math.max(0.5, currentZoom - 0.25);
      calZoomLabel.textContent = `${Math.round(currentZoom * 100)}%`;
      calibrator.setZoom(currentZoom);
    });

    btnSaveTemplate.addEventListener('click', () => {
      window.StorageManager.saveTemplate(currentTemplate);
      showToast(`Calibration for ${currentTemplate.name} saved!`, 'success');
    });

    btnResetTemplate.addEventListener('click', () => {
      if (confirm(`Reset ${currentTemplate.name} to default factory coordinates?`)) {
        window.StorageManager.deleteTemplate(currentBankId);
        allTemplates = window.StorageManager.getTemplates();
        currentTemplate = allTemplates[currentBankId];
        calibrator.setTemplate(currentTemplate);
        renderSinglePreview();
        showToast('Reset to original coordinates', 'info');
      }
    });

    // Field Property Inputs
    propX.addEventListener('change', (e) => {
      if (calibrator && calibrator.selectedField) {
        calibrator.updateFieldProp(calibrator.selectedField, 'xMm', parseFloat(e.target.value) || 0);
      }
    });
    propY.addEventListener('change', (e) => {
      if (calibrator && calibrator.selectedField) {
        calibrator.updateFieldProp(calibrator.selectedField, 'yMm', parseFloat(e.target.value) || 0);
      }
    });
    propWidth.addEventListener('change', (e) => {
      if (calibrator && calibrator.selectedField) {
        calibrator.updateFieldProp(calibrator.selectedField, 'widthMm', parseFloat(e.target.value) || 0);
      }
    });
    propFontSize.addEventListener('change', (e) => {
      if (calibrator && calibrator.selectedField) {
        calibrator.updateFieldProp(calibrator.selectedField, 'fontSizePt', parseFloat(e.target.value) || 0);
      }
    });
    propDateBoxWidth.addEventListener('change', (e) => {
      if (calibrator && calibrator.selectedField === 'date') {
        calibrator.updateFieldProp('date', 'boxWidthMm', parseFloat(e.target.value) || 5.4);
      }
    });

    // Micro Nudge Buttons
    nudgeUp.addEventListener('click', () => calibrator.nudgeField(0, -0.5));
    nudgeDown.addEventListener('click', () => calibrator.nudgeField(0, 0.5));
    nudgeLeft.addEventListener('click', () => calibrator.nudgeField(-0.5, 0));
    nudgeRight.addEventListener('click', () => calibrator.nudgeField(0.5, 0));
    nudgeCenter.addEventListener('click', () => {
      if (calibrator && calibrator.selectedField) {
        calibrator.updateFieldProp(calibrator.selectedField, 'xMm', 20);
        showToast('Reset field to 20mm');
      }
    });

    // Modals
    btnOpenCsvModal.addEventListener('click', () => modalCsv.classList.add('show'));
    btnBackupModal.addEventListener('click', () => modalBackup.classList.add('show'));

    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        modalCsv.classList.remove('show');
        modalBackup.classList.remove('show');
      });
    });

    btnLoadSampleCsv.addEventListener('click', () => {
      csvPasteArea.value = `Date\tPayee\tAmount\tAcPayee\tCrossBearer\n${getTodayDate()}\tMD. RAHIM HOSSAIN\t125000.00\tyes\tyes\n${getTodayDate()}\tBANGLADESH PETROLEUM LTD\t450000.50\tyes\tno\n${getTodayDate()}\tCREATIVE TECH CONSULTING\t85000.00\tyes\tyes`;
    });

    btnBrowseCsv.addEventListener('click', () => csvFileInput.click());
    csvFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        csvPasteArea.value = evt.target.result;
      };
      reader.readAsText(file);
    });

    btnImportCsvConfirm.addEventListener('click', () => {
      const text = csvPasteArea.value.trim();
      if (!text) {
        showToast('Please paste or upload data first', 'error');
        return;
      }
      const records = window.BatchPrinterModule.parseCSVorTSV(text);
      if (records.length === 0) {
        showToast('No valid records found in data', 'error');
        return;
      }
      records.forEach(r => batchManager.add(r));
      renderBatchTable();
      modalCsv.classList.remove('show');
      csvPasteArea.value = '';
      showToast(`Imported ${records.length} cheques into batch queue!`, 'success');
      document.querySelector('[data-tab="tab-batch"]').click();
    });

    // Backup Export / Import
    btnExportBackup.addEventListener('click', () => {
      const backupJson = window.StorageManager.exportBackup();
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cheque_printer_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Settings backup exported!', 'success');
    });

    backupFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const res = window.StorageManager.importBackup(evt.target.result);
        if (res.success) {
          allTemplates = window.StorageManager.getTemplates();
          settings = window.StorageManager.getGlobalSettings();
          currentTemplate = allTemplates[currentBankId] || Object.values(allTemplates)[0];
          populateBankDropdown();
          calibrator.setTemplate(currentTemplate);
          renderSinglePreview();
          modalBackup.classList.remove('show');
          showToast('Settings imported successfully!', 'success');
        } else {
          showToast(`Import error: ${res.error}`, 'error');
        }
      };
      reader.readAsText(file);
    });
  }
});
