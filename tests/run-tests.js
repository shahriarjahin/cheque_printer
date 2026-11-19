/**
 * Complete Test Suite Runner for Cheque Printer App
 */

const { execSync } = require('child_process');

const testFiles = [
  'tests/words-converter.test.js',
  'tests/bank-templates.test.js',
  'tests/calibrator-math.test.js',
  'tests/batch-printer.test.js'
];

console.log('==================================================');
console.log('Running Cheque Printer Automated Test Suite...');
console.log('==================================================\n');

let allPassed = true;

testFiles.forEach(file => {
  console.log(`▶ Running ${file}...`);
  try {
    const output = execSync(`node "${file}"`, { encoding: 'utf8' });
    console.log(output);
  } catch (err) {
    console.error(`❌ FAILED: ${file}`);
    console.error(err.stdout || err.message);
    allPassed = false;
  }
});

if (allPassed) {
  console.log('==================================================');
  console.log('✔ ALL TEST SUITES PASSED CLEANLY (4/4)');
  console.log('==================================================');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED');
  process.exit(1);
}
