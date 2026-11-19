/**
 * Calibrated Bank Cheque Templates
 * Measurements are in exact physical millimeters (mm)
 */

const DEFAULT_TEMPLATES = {
  nrbc: {
    id: 'nrbc',
    name: 'NRBC Bank PLC',
    widthMm: 187.1,
    heightMm: 82.1,
    previewImage: 'assets/nrbc_preview.png',
    fields: {
      date: {
        xMm: 138.0,
        yMm: 6.5,
        boxWidthMm: 5.4,
        digitCount: 8,
        fontSizePt: 12,
        mode: 'boxes' // 'boxes' (individual D D M M Y Y Y Y) or 'text'
      },
      payee: {
        xMm: 33.0,
        yMm: 23.5,
        widthMm: 115.0,
        fontSizePt: 11,
        bold: true,
        prefixAsterisks: true
      },
      amountWordsLine1: {
        xMm: 42.0,
        yMm: 30.5,
        widthMm: 105.0,
        fontSizePt: 10,
        bold: false
      },
      amountWordsLine2: {
        xMm: 18.0,
        yMm: 37.0,
        widthMm: 120.0,
        fontSizePt: 10,
        bold: false
      },
      amountNumber: {
        xMm: 140.0,
        yMm: 33.5,
        widthMm: 42.0,
        heightMm: 8.5,
        fontSizePt: 12,
        bold: true
      },
      bearer: {
        xMm: 168.0,
        yMm: 23.5,
        widthMm: 16.0,
        strikeYMm: 25.5
      },
      acPayee: {
        xMm: 20.0,
        yMm: 9.0,
        widthMm: 38.0,
        heightMm: 14.0,
        style: 'lines' // 'lines' (two parallel lines with A/C PAYEE ONLY)
      }
    }
  },

  ibbl: {
    id: 'ibbl',
    name: 'Islami Bank Bangladesh Limited (IBBL)',
    widthMm: 181.6,
    heightMm: 81.8,
    previewImage: 'assets/ibbl_preview.png',
    fields: {
      date: {
        xMm: 133.5,
        yMm: 8.5,
        boxWidthMm: 5.3,
        digitCount: 8,
        fontSizePt: 12,
        mode: 'boxes'
      },
      payee: {
        xMm: 32.0,
        yMm: 25.0,
        widthMm: 110.0,
        fontSizePt: 11,
        bold: true,
        prefixAsterisks: true
      },
      amountWordsLine1: {
        xMm: 40.0,
        yMm: 32.5,
        widthMm: 98.0,
        fontSizePt: 10,
        bold: false
      },
      amountWordsLine2: {
        xMm: 16.0,
        yMm: 39.5,
        widthMm: 118.0,
        fontSizePt: 10,
        bold: false
      },
      amountNumber: {
        xMm: 136.0,
        yMm: 34.0,
        widthMm: 42.0,
        heightMm: 8.5,
        fontSizePt: 12,
        bold: true
      },
      bearer: {
        xMm: 162.0,
        yMm: 25.0,
        widthMm: 16.0,
        strikeYMm: 27.0
      },
      acPayee: {
        xMm: 20.0,
        yMm: 10.0,
        widthMm: 38.0,
        heightMm: 14.0,
        style: 'lines'
      }
    }
  },

  sonali: {
    id: 'sonali',
    name: 'Sonali Bank Limited',
    widthMm: 190.6,
    heightMm: 84.4,
    previewImage: 'assets/sonali_preview.png',
    fields: {
      date: {
        xMm: 138.5,
        yMm: 7.0,
        boxWidthMm: 5.6,
        digitCount: 8,
        fontSizePt: 12,
        mode: 'boxes'
      },
      payee: {
        xMm: 32.0,
        yMm: 24.0,
        widthMm: 115.0,
        fontSizePt: 11,
        bold: true,
        prefixAsterisks: true
      },
      amountWordsLine1: {
        xMm: 40.0,
        yMm: 31.5,
        widthMm: 102.0,
        fontSizePt: 10,
        bold: false
      },
      amountWordsLine2: {
        xMm: 18.0,
        yMm: 38.5,
        widthMm: 120.0,
        fontSizePt: 10,
        bold: false
      },
      amountNumber: {
        xMm: 142.0,
        yMm: 33.0,
        widthMm: 44.0,
        heightMm: 8.5,
        fontSizePt: 12,
        bold: true
      },
      bearer: {
        xMm: 168.0,
        yMm: 24.0,
        widthMm: 16.0,
        strikeYMm: 26.0
      },
      acPayee: {
        xMm: 22.0,
        yMm: 9.0,
        widthMm: 38.0,
        heightMm: 14.0,
        style: 'lines'
      }
    }
  },

  generic: {
    id: 'generic',
    name: 'Standard Generic Cheque',
    widthMm: 187.0,
    heightMm: 82.0,
    previewImage: null,
    fields: {
      date: {
        xMm: 138.0,
        yMm: 7.0,
        boxWidthMm: 5.5,
        digitCount: 8,
        fontSizePt: 12,
        mode: 'boxes'
      },
      payee: {
        xMm: 33.0,
        yMm: 24.0,
        widthMm: 115.0,
        fontSizePt: 11,
        bold: true,
        prefixAsterisks: true
      },
      amountWordsLine1: {
        xMm: 42.0,
        yMm: 31.0,
        widthMm: 102.0,
        fontSizePt: 10,
        bold: false
      },
      amountWordsLine2: {
        xMm: 18.0,
        yMm: 38.0,
        widthMm: 120.0,
        fontSizePt: 10,
        bold: false
      },
      amountNumber: {
        xMm: 140.0,
        yMm: 33.5,
        widthMm: 42.0,
        heightMm: 8.5,
        fontSizePt: 12,
        bold: true
      },
      bearer: {
        xMm: 166.0,
        yMm: 24.0,
        widthMm: 16.0,
        strikeYMm: 26.0
      },
      acPayee: {
        xMm: 20.0,
        yMm: 9.0,
        widthMm: 38.0,
        heightMm: 14.0,
        style: 'lines'
      }
    }
  }
};

const BankTemplates = {
  DEFAULT_TEMPLATES
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BankTemplates;
}

if (typeof window !== 'undefined') {
  window.BankTemplates = BankTemplates;
}
