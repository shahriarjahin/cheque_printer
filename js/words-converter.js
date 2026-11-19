/**
 * Bangladeshi Taka Currency Number-to-Words & Security Formatters
 * Supports: Crores, Lakhs, Thousands, Hundreds, Taka and Poisha.
 */

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertBelowThousand(n) {
  let str = '';
  if (n >= 100) {
    str += ONES[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    str += TENS[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ONES[n % 10] : '');
  } else if (n > 0) {
    str += ONES[n];
  }
  return str.trim();
}

/**
 * Converts integer part using Bangladeshi numbering (Crores, Lakhs, Thousands, Hundreds)
 */
function convertBangladeshiInteger(n) {
  if (n === 0) return 'Zero';

  let result = '';

  // Crores: 1,00,00,000
  if (n >= 10000000) {
    const croreVal = Math.floor(n / 10000000);
    result += convertBangladeshiInteger(croreVal) + ' Crore ';
    n %= 10000000;
  }

  // Lakhs: 1,00,000
  if (n >= 100000) {
    const lakhVal = Math.floor(n / 100000);
    result += convertBelowThousand(lakhVal) + ' Lakh ';
    n %= 100000;
  }

  // Thousands: 1,000
  if (n >= 1000) {
    const thousandVal = Math.floor(n / 1000);
    result += convertBelowThousand(thousandVal) + ' Thousand ';
    n %= 1000;
  }

  // Remaining below 1000
  if (n > 0) {
    result += convertBelowThousand(n);
  }

  return result.trim();
}

/**
 * Converts any numeric amount into words in Bangladeshi Taka
 * @param {number|string} amount
 * @returns {string} e.g. "Fifty Two Lakh Thirty Four Thousand Five Hundred Taka and Fifty Poisha Only"
 */
function numberToWordsBDT(amount) {
  if (amount === null || amount === undefined || amount === '') return '';
  const cleanAmount = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : Number(amount);
  if (isNaN(cleanAmount) || cleanAmount < 0) return '';

  const integerPart = Math.floor(cleanAmount);
  const decimalPart = Math.round((cleanAmount - integerPart) * 100);

  let words = convertBangladeshiInteger(integerPart) + ' Taka';

  if (decimalPart > 0) {
    words += ' and ' + convertBelowThousand(decimalPart) + ' Poisha';
  }

  words += ' Only';
  return words.replace(/\s+/g, ' ').trim();
}

/**
 * Wraps words in security asterisks
 * @param {string} words
 * @returns {string} e.g. "*** Fifty Thousand Taka Only ***"
 */
function formatAmountWords(words) {
  if (!words) return '';
  const clean = words.replace(/^\*+\s*|\s*\*+$/g, '').trim();
  return `*** ${clean} ***`;
}

/**
 * Formats a numeric value with Bangladeshi comma separators and security markers
 * e.g. 5234500.5 -> "=***52,34,500.50/-***"
 * @param {number|string} amount
 * @returns {string}
 */
function formatAmountNumber(amount) {
  if (amount === null || amount === undefined || amount === '') return '';
  const cleanAmount = typeof amount === 'string' ? amount.replace(/,/g, '').trim() : String(amount);
  if (!cleanAmount || isNaN(Number(cleanAmount))) return '';

  const parts = cleanAmount.split('.');
  let integerPart = parts[0];
  let decimalPart = parts[1];

  // Bangladeshi comma grouping: rightmost 3 digits, then groups of 2
  let formatted = '';
  if (integerPart.length > 3) {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const rest = integerPart.substring(0, integerPart.length - 3);
    formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  } else {
    formatted = integerPart;
  }

  if (decimalPart !== undefined) {
    // Pad single decimal (e.g. .5 -> .50)
    decimalPart = decimalPart.padEnd(2, '0').slice(0, 2);
    formatted += '.' + decimalPart;
  }

  return `=***${formatted}/-***`;
}

/**
 * Formats date input into discrete DDMMYYYY digits for 8-box cheque fields
 * Handles YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, and raw digits.
 * @param {string} dateStr
 * @returns {string} exactly 8 digits (e.g. "19112026")
 */
function formatDateToDDMMYYYY(dateStr) {
  if (!dateStr) return '';
  const str = String(dateStr).trim();

  // YYYY-MM-DD
  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2].padStart(2, '0')}${parts[1].padStart(2, '0')}${parts[0]}`;
    } else if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[0].padStart(2, '0')}${parts[1].padStart(2, '0')}${parts[2]}`;
    }
  }

  // DD/MM/YYYY
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[0].padStart(2, '0')}${parts[1].padStart(2, '0')}${parts[2]}`;
    } else if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2].padStart(2, '0')}${parts[1].padStart(2, '0')}${parts[0]}`;
    }
  }

  const digits = str.replace(/\D/g, '');
  // If YYYYMMDD (starts with 19xx or 20xx and 8 digits)
  if (digits.length === 8 && (digits.startsWith('19') || digits.startsWith('20'))) {
    return `${digits.slice(6, 8)}${digits.slice(4, 6)}${digits.slice(0, 4)}`;
  }

  return digits.padEnd(8, ' ').slice(0, 8);
}

/**
 * Splits words into two lines for cheques where the amount in words
 * exceeds the first line's maximum physical length.
 * @param {string} words
 * @param {number} maxLine1Chars (default: 45)
 * @returns {{ line1: string, line2: string }}
 */
function splitWordsIntoTwoLines(words, maxLine1Chars = 45) {
  if (!words) return { line1: '', line2: '' };
  const trimmed = words.trim();
  if (trimmed.length <= maxLine1Chars) {
    return { line1: trimmed, line2: '' };
  }

  // Find last space before maxLine1Chars
  let splitIndex = trimmed.lastIndexOf(' ', maxLine1Chars);
  if (splitIndex === -1) {
    splitIndex = maxLine1Chars;
  }

  return {
    line1: trimmed.substring(0, splitIndex).trim(),
    line2: trimmed.substring(splitIndex).trim()
  };
}

const WordsConverter = {
  numberToWordsBDT,
  formatAmountWords,
  formatAmountNumber,
  splitWordsIntoTwoLines,
  formatDateToDDMMYYYY
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = WordsConverter;
}

if (typeof window !== 'undefined') {
  window.WordsConverter = WordsConverter;
}
