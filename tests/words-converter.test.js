const assert = require('assert');
const { numberToWordsBDT, formatAmountWords, formatAmountNumber, splitWordsIntoTwoLines, formatDateToDDMMYYYY } = require('../js/words-converter.js');

function runTests() {
  console.log('Testing numberToWordsBDT...');
  assert.strictEqual(numberToWordsBDT(0), 'Zero Taka Only');
  assert.strictEqual(numberToWordsBDT(5), 'Five Taka Only');
  assert.strictEqual(numberToWordsBDT(15), 'Fifteen Taka Only');
  assert.strictEqual(numberToWordsBDT(85), 'Eighty Five Taka Only');
  assert.strictEqual(numberToWordsBDT(500), 'Five Hundred Taka Only');
  assert.strictEqual(numberToWordsBDT(1000), 'One Thousand Taka Only');
  assert.strictEqual(numberToWordsBDT(50000), 'Fifty Thousand Taka Only');
  assert.strictEqual(numberToWordsBDT(100000), 'One Lakh Taka Only');
  assert.strictEqual(numberToWordsBDT(500000), 'Five Lakh Taka Only');
  assert.strictEqual(numberToWordsBDT(10000000), 'One Crore Taka Only');
  assert.strictEqual(numberToWordsBDT(5234500.50), 'Fifty Two Lakh Thirty Four Thousand Five Hundred Taka and Fifty Poisha Only');
  assert.strictEqual(numberToWordsBDT(123456789), 'Twelve Crore Thirty Four Lakh Fifty Six Thousand Seven Hundred Eighty Nine Taka Only');
  assert.strictEqual(numberToWordsBDT('750000000.25'), 'Seventy Five Crore Taka and Twenty Five Poisha Only');

  console.log('Testing formatAmountWords...');
  assert.strictEqual(formatAmountWords('Fifty Thousand Taka Only'), '*** Fifty Thousand Taka Only ***');
  assert.strictEqual(formatAmountWords('*** Fifty Thousand Taka Only ***'), '*** Fifty Thousand Taka Only ***');

  console.log('Testing formatAmountNumber...');
  assert.strictEqual(formatAmountNumber(50000), '=***50,000/-***');
  assert.strictEqual(formatAmountNumber('1234567.5'), '=***12,34,567.50/-***');
  assert.strictEqual(formatAmountNumber('1234567.50'), '=***12,34,567.50/-***');
  assert.strictEqual(formatAmountNumber('10000000'), '=***1,00,00,000/-***');

  console.log('Testing formatDateToDDMMYYYY...');
  assert.strictEqual(formatDateToDDMMYYYY('2026-11-19'), '19112026');
  assert.strictEqual(formatDateToDDMMYYYY('19-11-2026'), '19112026');
  assert.strictEqual(formatDateToDDMMYYYY('19/11/2026'), '19112026');
  assert.strictEqual(formatDateToDDMMYYYY('20261119'), '19112026');

  console.log('Testing splitWordsIntoTwoLines...');
  const split1 = splitWordsIntoTwoLines('Fifty Two Lakh Thirty Four Thousand Five Hundred Taka and Fifty Poisha Only', 40);
  assert.ok(split1.line1.length <= 40, `line1 length should be <= 40, got ${split1.line1.length}`);
  assert.ok(split1.line2.length > 0, 'line2 should not be empty');
  assert.strictEqual(`${split1.line1} ${split1.line2}`.trim(), 'Fifty Two Lakh Thirty Four Thousand Five Hundred Taka and Fifty Poisha Only');

  const shortSplit = splitWordsIntoTwoLines('Ten Thousand Taka Only', 40);
  assert.strictEqual(shortSplit.line1, 'Ten Thousand Taka Only');
  assert.strictEqual(shortSplit.line2, '');

  console.log('All words-converter tests passed!');
}

runTests();
