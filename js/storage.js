/**
 * Persistence Manager for Cheque Printer
 * Manages custom templates, active template, printer offsets, and settings.
 */

const STORAGE_KEYS = {
  TEMPLATES: 'cheque_printer_templates_v3',
  SETTINGS: 'cheque_printer_settings_v3',
  ACTIVE_TEMPLATE: 'cheque_printer_active_template'
};

const DEFAULT_SETTINGS = {
  feedMode: 'canon_center', // 'canon_center', 'carrier_top_left', 'direct_custom'
  printerOffsetX: 0.0,      // Global printer alignment micro-offset (mm)
  printerOffsetY: 0.0,      // Global printer alignment micro-offset (mm)
  activeBankId: 'nrbc',
  showGrid: true,
  showPreviewImage: true,
  previewOpacity: 0.85
};

function createStorageManager(backendStorage) {
  // Use provided storage (for tests) or window.localStorage
  const storage = backendStorage || (typeof window !== 'undefined' ? window.localStorage : null);

  function getTemplates() {
    let custom = {};
    if (storage) {
      try {
        const raw = storage.getItem(STORAGE_KEYS.TEMPLATES);
        if (raw) custom = JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse stored templates:', e);
      }
    }

    // Merge default templates with any custom/overridden templates
    // If running in CommonJS, require DEFAULT_TEMPLATES, else use window
    let defaults = {};
    if (typeof DEFAULT_TEMPLATES !== 'undefined') {
      defaults = DEFAULT_TEMPLATES;
    } else if (typeof window !== 'undefined' && window.BankTemplates) {
      defaults = window.BankTemplates.DEFAULT_TEMPLATES;
    } else if (typeof require !== 'undefined') {
      defaults = require('./bank-templates.js').DEFAULT_TEMPLATES;
    }

    return { ...defaults, ...custom };
  }

  function saveTemplate(template) {
    if (!storage || !template || !template.id) return;
    const all = getTemplates();
    all[template.id] = { ...template, isCustom: true };
    try {
      storage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(all));
    } catch (e) {
      console.error('Failed to save template:', e);
    }
  }

  function deleteTemplate(id) {
    if (!storage || !id) return;
    let custom = {};
    try {
      const raw = storage.getItem(STORAGE_KEYS.TEMPLATES);
      if (raw) custom = JSON.parse(raw);
      delete custom[id];
      storage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(custom));
    } catch (e) {
      console.error('Failed to delete template:', e);
    }
  }

  function getGlobalSettings() {
    if (!storage) return { ...DEFAULT_SETTINGS };
    try {
      const raw = storage.getItem(STORAGE_KEYS.SETTINGS);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
    } catch (e) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveGlobalSettings(settings) {
    if (!storage) return;
    const current = getGlobalSettings();
    const updated = { ...current, ...settings };
    try {
      storage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  function exportBackup() {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: getGlobalSettings(),
      templates: getTemplates()
    };
    return JSON.stringify(data, null, 2);
  }

  function importBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.templates && storage) {
        storage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(data.templates));
      }
      if (data.settings && storage) {
        storage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  return {
    getTemplates,
    saveTemplate,
    deleteTemplate,
    getGlobalSettings,
    saveGlobalSettings,
    exportBackup,
    importBackup
  };
}

const StorageModule = {
  createStorageManager,
  STORAGE_KEYS,
  DEFAULT_SETTINGS
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageModule;
}

if (typeof window !== 'undefined') {
  window.StorageManager = createStorageManager();
  window.StorageModule = StorageModule;
}
