const assert = require('assert');
const { calculateCenterOffset, mmToPx, pxToMm, calculateDateBoxPositions } = require('../js/calibrator.js');

function testCalibratorMath() {
  console.log('Testing calculateCenterOffset...');
  // A4 paper is 210mm wide.
  // NRBC is 189.0mm wide -> (210 - 189.0) / 2 = 10.5mm
  const nrbcOffset = calculateCenterOffset(189.0, 210);
  assert.strictEqual(Math.round(nrbcOffset * 100) / 100, 10.5);

  // IBBL is 189.0mm wide -> (210 - 189.0) / 2 = 10.5mm
  const ibblOffset = calculateCenterOffset(189.0, 210);
  assert.strictEqual(Math.round(ibblOffset * 100) / 100, 10.5);

  // Sonali is 187.0mm wide -> (210 - 187.0) / 2 = 11.5mm
  const sonaliOffset = calculateCenterOffset(187.0, 210);
  assert.strictEqual(Math.round(sonaliOffset * 100) / 100, 11.5);

  // Vertical feeding: (210 - height) / 2
  const nrbcVerticalOffset = calculateCenterOffset(89.0, 210);
  assert.strictEqual(Math.round(nrbcVerticalOffset * 100) / 100, 60.5);

  console.log('Testing mm to px conversions...');
  // 96 DPI: 1 inch = 25.4mm = 96px => 1mm = 96 / 25.4 = 3.7795px
  const px = mmToPx(10, 96);
  assert.strictEqual(Math.round(px * 10) / 10, 37.8);
  const mm = pxToMm(px, 96);
  assert.strictEqual(Math.round(mm), 10);

  console.log('Testing calculateDateBoxPositions...');
  // 8 boxes starting at x = 138, y = 15.0, boxWidth = 5.4
  // '2026-11-20' formats to '20112026' (DDMMYYYY)
  const boxes = calculateDateBoxPositions({ xMm: 138, yMm: 15.0, boxWidthMm: 5.4, digitCount: 8 }, '2026-11-20');
  assert.strictEqual(boxes.length, 8);
  assert.strictEqual(boxes[0].digit, '2'); // Day 2
  assert.strictEqual(boxes[1].digit, '0'); // Day 0
  assert.strictEqual(boxes[0].xMm, 138);
  assert.strictEqual(boxes[7].digit, '6'); // Year last digit 6
  assert.strictEqual(boxes[7].xMm, 138 + 7 * 5.4);

  console.log('All calibrator math tests passed!');
}

testCalibratorMath();
