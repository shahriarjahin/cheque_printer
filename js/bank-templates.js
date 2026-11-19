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
        yMm: 14.5,
        boxWidthMm: 5.4,
        digitCount: 8,
        fontSizePt: 12,
        mode: 'boxes'
      },
      payee: {
        xMm: 34.0,
        yMm: 33.0,
        widthMm: 125.0,
        fontSizePt: 11,
        bold: true,
        prefixAsterisks: true
      },
      amountWordsLine1: {
        xMm: 44.0,
        yMm: 40.5,
        widthMm: 95.0,
        fontSizePt: 10,
        bold: false
      },
      amountWordsLine2: {
        xMm: 20.0,
        yMm: 48.0,
        widthMm: 120.0,
        fontSizePt: 10,
        bold: false
      },
      amountNumber: {
        xMm: 140.0,
        yMm: 41.5,
        widthMm: 42.0,
        heightMm: 8.5,
        fontSizePt: 12,
        bold: true
      },
      bearer: {
        xMm: 168.0,
        yMm: 33.0,
        widthMm: 16.0,
        strikeYMm: 35.0
      },
      acPayee: {
        xMm: 20.0,
        yMm: 7.0,
        widthMm: 38.0,
        heightMm: 14.0,
        style: 'lines'
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
        xMm: 134.0,
        yMm: 15.5,
        boxWidthMm: 5.3,
        digitCount: 8,
        fontSizePt: 12,
        mode: 'boxes'
      },
      payee: {
        xMm: 33.0,
        yMm: 34.0,
        widthMm: 120.0,
        fontSizePt: 11,
        bold: true,
        prefixAsterisks: true
      },
      amountWordsLine1: {
        xMm: 42.0,
        yMm: 41.5,
        widthMm: 92.0,
        fontSizePt: 10,
        bold: false
      },
      amountWordsLine2: {
        xMm: 18.0,
        yMm: 49.0,
        widthMm: 118.0,
        fontSizePt: 10,
        bold: false
      },
      amountNumber: {
        xMm: 138.0,
        yMm: 42.5,
        widthMm: 42.0,
        heightMm: 8.5,
        fontSizePt: 12,
        bold: true
      },
      bearer: {
        xMm: 164.0,
        yMm: 34.0,
        widthMm: 16.0,
        strikeYMm: 36.0
      },
      acPayee: {
        xMm: 18.0,
        yMm: 7.0,
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
        xMm: 138.0,
        yMm: 15.0,
        boxWidthMm: 5.5,
        digitCount: 8,
        fontSizePt: 12,
        mode: 'boxes'
      },
      payee: {
        xMm: 34.0,
        yMm: 33.5,
        widthMm: 125.0,
        fontSizePt: 11,
        bold: true,
        prefixAsterisks: true
      },
      amountWordsLine1: {
        xMm: 45.0,
        yMm: 41.5,
        widthMm: 95.0,
        fontSizePt: 10,
        bold: false
      },
      amountWordsLine2: {
        xMm: 22.0,
        yMm: 49.0,
        widthMm: 120.0,
        fontSizePt: 10,
        bold: false
      },
      amountNumber: {
        xMm: 142.0,
        yMm: 42.5,
        widthMm: 44.0,
        heightMm: 8.5,
        fontSizePt: 12,
        bold: true
      },
      bearer: {
        xMm: 168.0,
        yMm: 33.5,
        widthMm: 16.0,
        strikeYMm: 35.5
      },
      acPayee: {
        xMm: 18.0,
        yMm: 7.0,
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
        yMm: 15.0,
        boxWidthMm: 5.5,
        digitCount: 8,
        fontSizePt: 12,
        mode: 'boxes'
      },
      payee: {
        xMm: 34.0,
        yMm: 33.5,
        widthMm: 125.0,
        fontSizePt: 11,
        bold: true,
        prefixAsterisks: true
      },
      amountWordsLine1: {
        xMm: 44.0,
        yMm: 41.0,
        widthMm: 95.0,
        fontSizePt: 10,
        bold: false
      },
      amountWordsLine2: {
        xMm: 20.0,
        yMm: 48.5,
        widthMm: 120.0,
        fontSizePt: 10,
        bold: false
      },
      amountNumber: {
        xMm: 140.0,
        yMm: 42.0,
        widthMm: 42.0,
        heightMm: 8.5,
        fontSizePt: 12,
        bold: true
      },
      bearer: {
        xMm: 166.0,
        yMm: 33.5,
        widthMm: 16.0,
        strikeYMm: 35.5
      },
      acPayee: {
        xMm: 20.0,
        yMm: 7.0,
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
