const assert = require('assert');
const { parseCSVorTSV, createBatchManager, buildPrintHtml } = require('../js/batch-printer.js');
const { DEFAULT_TEMPLATES } = require('../js/bank-templates.js');

function testBatchPrinter() {
  console.log('Testing parseCSVorTSV...');

  // 1. Standard Comma-separated CSV with headers
  const csv = `Date,Payee,Amount,AcPayee,CrossBearer
2026-11-20,MD. RAHIM,50000,true,true
2026-11-21,ABC TRADERS,125000.50,true,false`;

  const records1 = parseCSVorTSV(csv);
  assert.strictEqual(records1.length, 2);
  assert.strictEqual(records1[0].date, '2026-11-20');
  assert.strictEqual(records1[0].payee, 'MD. RAHIM');
  assert.strictEqual(records1[0].amount, 50000);
  assert.strictEqual(records1[0].acPayee, true);
  assert.strictEqual(records1[0].crossBearer, true);

  assert.strictEqual(records1[1].date, '2026-11-21');
  assert.strictEqual(records1[1].payee, 'ABC TRADERS');
  assert.strictEqual(records1[1].amount, 125000.50);
  assert.strictEqual(records1[1].crossBearer, false);

  // 2. Tab-separated values (direct copy-paste from Excel/Google Sheets)
  const tsv = `2026-11-22\tTECH CORP\t75000\tyes\tno
2026-11-23\tGLOBAL LOGISTICS\t320000\t1\t1`;

  const records2 = parseCSVorTSV(tsv);
  assert.strictEqual(records2.length, 2);
  assert.strictEqual(records2[0].payee, 'TECH CORP');
  assert.strictEqual(records2[0].amount, 75000);
  assert.strictEqual(records2[0].acPayee, true);
  assert.strictEqual(records2[0].crossBearer, false);

  assert.strictEqual(records2[1].payee, 'GLOBAL LOGISTICS');
  assert.strictEqual(records2[1].amount, 320000);
  assert.strictEqual(records2[1].acPayee, true);
  assert.strictEqual(records2[1].crossBearer, true);

  console.log('Testing BatchManager...');
  const batch = createBatchManager();
  assert.strictEqual(batch.getQueue().length, 0);

  const id1 = batch.add({ payee: 'Alice', amount: 10000, date: '2026-11-20' });
  const id2 = batch.add({ payee: 'Bob', amount: 20000, date: '2026-11-21' });
  assert.strictEqual(batch.getQueue().length, 2);

  batch.update(id1, { amount: 15000 });
  assert.strictEqual(batch.get(id1).amount, 15000);

  batch.remove(id2);
  assert.strictEqual(batch.getQueue().length, 1);

  console.log('Testing buildPrintHtml...');
  const html = buildPrintHtml([batch.get(id1)], DEFAULT_TEMPLATES.nrbc, {
    feedMode: 'canon_center',
    printerOffsetX: 0,
    printerOffsetY: 0
  });

  assert.ok(html.includes('cheque-print-page'));
  assert.ok(html.includes('Alice'));
  assert.ok(html.includes('=***15,000/-***'));

  console.log('All batch printer tests passed!');
}

testBatchPrinter();
