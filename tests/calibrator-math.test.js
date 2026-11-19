const assert = require('assert');
const { calculateCenterOffset, mmToPx, pxToMm, calculateDateBoxPositions } = require('../js/calibrator.js');

function testCalibratorMath() {
  console.log('Testing calculateCenterOffset...');
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

  // Vertical feeding: (210 - height) / 2
  const nrbcVerticalOffset = calculateCenterOffset(82.1, 210);
  assert.strictEqual(Math.round(nrbcVerticalOffset * 100) / 100, 63.95);

  console.log('Testing mm to px conversions...');
  // 96 DPI: 1 inch = 25.4mm = 96px => 1mm = 96 / 25.4 = 3.7795px
  const px = mmToPx(10, 96);
  assert.strictEqual(Math.round(px * 10) / 10, 37.8);
  const mm = pxToMm(px, 96);
  assert.strictEqual(Math.round(mm), 10);

  console.log('Testing calculateDateBoxPositions...');
  // 8 boxes starting at x = 138, y = 6.5, boxWidth = 5.4
  const boxes = calculateDateBoxPositions({ xMm: 138, yMm: 6.5, boxWidthMm: 5.4, digitCount: 8 }, '20112026');
  assert.strictEqual(boxes.length, 8);
  assert.strictEqual(boxes[0].digit, '2');
  assert.strictEqual(boxes[0].xMm, 138);
  assert.strictEqual(boxes[7].digit, '6');
  assert.strictEqual(boxes[7].xMm, 138 + 7 * 5.4);

  console.log('All calibrator math tests passed!');
}

testCalibratorMath();
