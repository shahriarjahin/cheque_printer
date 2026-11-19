/**
 * Calibrated Bank Cheque Templates
 * Measurements are in exact physical millimeters (mm)
 */

const DEFAULT_TEMPLATES = {
  nrbc: {
    id: 'nrbc',
    name: 'NRBC Bank PLC',
    widthMm: 189.0,
    heightMm: 89.0,
    previewImage: 'assets/nrbc_preview.png',
    fields: {
      date: {
        xMm: 138.0,
        yMm: 15.0,
        boxWidthMm: 5.4,
        digitCount: 8,
        fontSizePt: 12,
        mode: 'boxes'
      },
      payee: {
        xMm: 34.0,
        yMm: 34.0,
        widthMm: 125.0,
        fontSizePt: 11,
        bold: true,
        prefixAsterisks: true
      },
      amountWordsLine1: {
        xMm: 45.0,
        yMm: 42.0,
        widthMm: 95.0,
        fontSizePt: 10,
        bold: false
      },
      amountWordsLine2: {
        xMm: 22.0,
        yMm: 50.0,
        widthMm: 125.0,
        fontSizePt: 10,
        bold: false
      },
      amountNumber: {
        xMm: 142.0,
        yMm: 43.0,
        widthMm: 44.0,
        heightMm: 9.0,
        fontSizePt: 12,
        bold: true
      },
      bearer: {
        xMm: 168.0,
        yMm: 34.0,
        widthMm: 16.0,
        strikeYMm: 36.0
      },
      acPayee: {
        xMm: 0.0,
        yMm: 0.0,
        sizeMm: 35.0,
        style: 'diagonal_text',
        line1Start: 19.0,
        line2Start: 25.0
      }
    }
  },

  ibbl: {
    id: 'ibbl',
    name: 'Islami Bank Bangladesh Limited (IBBL)',
    widthMm: 189.0,
    heightMm: 88.0,
    previewImage: 'assets/ibbl_preview.png',
    fields: {
      date: {
        xMm: 138.0,
        yMm: 15.0,
        boxWidthMm: 5.4,
        digitCount: 8,
        fontSizePt: 12,
        mode: 'boxes'
      },
      payee: {
        xMm: 34.0,
        yMm: 34.0,
        widthMm: 125.0,
        fontSizePt: 11,
        bold: true,
        prefixAsterisks: true
      },
      amountWordsLine1: {
        xMm: 45.0,
        yMm: 42.0,
        widthMm: 95.0,
        fontSizePt: 10,
        bold: false
      },
      amountWordsLine2: {
        xMm: 22.0,
        yMm: 50.0,
        widthMm: 125.0,
        fontSizePt: 10,
        bold: false
      },
      amountNumber: {
        xMm: 142.0,
        yMm: 43.0,
        widthMm: 44.0,
        heightMm: 9.0,
        fontSizePt: 12,
        bold: true
      },
      bearer: {
        xMm: 168.0,
        yMm: 34.0,
        widthMm: 16.0,
        strikeYMm: 36.0
      },
      acPayee: {
        xMm: 0.0,
        yMm: 0.0,
        sizeMm: 35.0,
        style: 'diagonal_text',
        line1Start: 19.0,
        line2Start: 25.0
      }
    }
  },

  sonali: {
    id: 'sonali',
    name: 'Sonali Bank Limited (SBL)',
    widthMm: 187.0,
    heightMm: 87.5,
    previewImage: 'assets/sonali_preview.png',
    fields: {
      date: {
        xMm: 136.0,
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
        xMm: 140.0,
        yMm: 42.5,
        widthMm: 44.0,
        heightMm: 9.0,
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
        xMm: 0.0,
        yMm: 0.0,
        sizeMm: 35.0,
        style: 'diagonal_text',
        line1Start: 19.0,
        line2Start: 25.0
      }
    }
  },

  generic: {
    id: 'generic',
    name: 'Standard Generic Cheque',
    widthMm: 189.0,
    heightMm: 88.0,
    previewImage: null,
    fields: {
      date: {
        xMm: 138.0,
        yMm: 15.0,
        boxWidthMm: 5.4,
        digitCount: 8,
        fontSizePt: 12,
        mode: 'boxes'
      },
      payee: {
        xMm: 34.0,
        yMm: 34.0,
        widthMm: 125.0,
        fontSizePt: 11,
        bold: true,
        prefixAsterisks: true
      },
      amountWordsLine1: {
        xMm: 45.0,
        yMm: 42.0,
        widthMm: 95.0,
        fontSizePt: 10,
        bold: false
      },
      amountWordsLine2: {
        xMm: 22.0,
        yMm: 50.0,
        widthMm: 125.0,
        fontSizePt: 10,
        bold: false
      },
      amountNumber: {
        xMm: 142.0,
        yMm: 43.0,
        widthMm: 44.0,
        heightMm: 9.0,
        fontSizePt: 12,
        bold: true
      },
      bearer: {
        xMm: 168.0,
        yMm: 34.0,
        widthMm: 16.0,
        strikeYMm: 36.0
      },
      acPayee: {
        xMm: 0.0,
        yMm: 0.0,
        sizeMm: 35.0,
        style: 'diagonal_text',
        line1Start: 19.0,
        line2Start: 25.0
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
