const assert = require('assert');
const { DEFAULT_TEMPLATES } = require('../js/bank-templates.js');
const { createStorageManager } = require('../js/storage.js');

function testTemplates() {
  console.log('Testing DEFAULT_TEMPLATES...');
  // NRBC
  assert.ok(DEFAULT_TEMPLATES.nrbc, 'NRBC template must exist');
  assert.strictEqual(DEFAULT_TEMPLATES.nrbc.widthMm, 189.0);
  assert.strictEqual(DEFAULT_TEMPLATES.nrbc.heightMm, 89.0);
  assert.ok(DEFAULT_TEMPLATES.nrbc.fields.date);
  assert.strictEqual(DEFAULT_TEMPLATES.nrbc.fields.date.digitCount, 8);
  assert.ok(DEFAULT_TEMPLATES.nrbc.fields.payee);
  assert.ok(DEFAULT_TEMPLATES.nrbc.fields.amountNumber);
  assert.ok(DEFAULT_TEMPLATES.nrbc.fields.amountWordsLine1);
  assert.ok(DEFAULT_TEMPLATES.nrbc.fields.amountWordsLine2);
  assert.ok(DEFAULT_TEMPLATES.nrbc.fields.acPayee);
  assert.ok(DEFAULT_TEMPLATES.nrbc.fields.bearer);

  // IBBL
  assert.ok(DEFAULT_TEMPLATES.ibbl, 'IBBL template must exist');
  assert.strictEqual(DEFAULT_TEMPLATES.ibbl.widthMm, 189.0);
  assert.strictEqual(DEFAULT_TEMPLATES.ibbl.heightMm, 88.0);

  // Sonali
  assert.ok(DEFAULT_TEMPLATES.sonali, 'Sonali template must exist');
  assert.strictEqual(DEFAULT_TEMPLATES.sonali.widthMm, 187.0);
  assert.strictEqual(DEFAULT_TEMPLATES.sonali.heightMm, 87.5);

  // Generic
  assert.ok(DEFAULT_TEMPLATES.generic, 'Generic template must exist');
  assert.strictEqual(DEFAULT_TEMPLATES.generic.widthMm, 189.0);
  assert.strictEqual(DEFAULT_TEMPLATES.generic.heightMm, 88.0);

  console.log('Testing StorageManager...');
  // Mock localStorage for Node test
  const mockStore = {};
  const mockLocalStorage = {
    getItem: (k) => mockStore[k] || null,
    setItem: (k, v) => { mockStore[k] = String(v); },
    removeItem: (k) => { delete mockStore[k]; }
  };

  const storage = createStorageManager(mockLocalStorage);
  const templates = storage.getTemplates();
  assert.ok(templates.nrbc);
  assert.ok(templates.ibbl);
  assert.ok(templates.sonali);

  // Save custom template
  const custom = {
    id: 'my-bank',
    name: 'My Bank PLC',
    widthMm: 185,
    heightMm: 80,
    fields: { ...DEFAULT_TEMPLATES.nrbc.fields }
  };
  storage.saveTemplate(custom);
  assert.ok(storage.getTemplates()['my-bank']);

  // Global settings
  const settings = storage.getGlobalSettings();
  assert.strictEqual(settings.feedMode, 'canon_center');
  storage.saveGlobalSettings({ feedMode: 'carrier_top_left', printerOffsetX: 1.5, printerOffsetY: -0.5 });
  const updatedSettings = storage.getGlobalSettings();
  assert.strictEqual(updatedSettings.feedMode, 'carrier_top_left');
  assert.strictEqual(updatedSettings.printerOffsetX, 1.5);

  // Export / Import
  const backup = storage.exportBackup();
  assert.ok(typeof backup === 'string');
  const parsed = JSON.parse(backup);
  assert.ok(parsed.templates['my-bank']);

  console.log('All bank template and storage tests passed!');
}

testTemplates();
