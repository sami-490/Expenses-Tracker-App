import {
  BackupData,
  DiaryEntry,
  SectionTemplate,
  Reminder,
  AppSettings,
  ExpenseItem,
  AdvanceSection,
  AdvanceDeposit,
} from '../types/index';
import {
  DEFAULT_SECTION_TEMPLATES,
  DEFAULT_REMINDERS,
  DEFAULT_SETTINGS,
  DEFAULT_ADVANCE_SECTIONS,
  DEFAULT_EXPENSES,
} from './constants';

const STORAGE_KEYS = {
  SECTIONS: 'daily_diary_sections_v3',
  ENTRIES: 'daily_diary_entries_v3',
  EXPENSES: 'daily_diary_expenses_v3',
  ADVANCE_SECTIONS: 'daily_diary_advance_sections_v3',
  ADVANCE_DEPOSITS: 'daily_diary_advance_deposits_v3',
  REMINDERS: 'daily_diary_reminders_v3',
  SETTINGS: 'daily_diary_settings_v3',
  INITIALIZED: 'daily_diary_initialized_v3',
};

function sanitizeEntries(entries: any[]): DiaryEntry[] {
  if (!Array.isArray(entries)) return [];
  return entries.map((e) => ({
    ...e,
    tags: Array.isArray(e.tags) ? e.tags : [],
    sections: Array.isArray(e.sections) ? e.sections : [],
  }));
}

export function loadStoredData(): {
  sections: SectionTemplate[];
  entries: DiaryEntry[];
  expenses: ExpenseItem[];
  advanceSections: AdvanceSection[];
  advanceDeposits: AdvanceDeposit[];
  reminders: Reminder[];
  settings: AppSettings;
} {
  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);

  if (!isInitialized) {
    // First run initialization with clean empty collections
    const initialSections = DEFAULT_SECTION_TEMPLATES;
    const initialEntries: DiaryEntry[] = [];
    const initialExpenses: ExpenseItem[] = DEFAULT_EXPENSES;
    const initialAdvance: AdvanceSection[] = DEFAULT_ADVANCE_SECTIONS;
    const initialReminders = DEFAULT_REMINDERS;
    const initialSettings = DEFAULT_SETTINGS;

    localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(initialSections));
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(initialEntries));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(initialExpenses));
    localStorage.setItem(STORAGE_KEYS.ADVANCE_SECTIONS, JSON.stringify(initialAdvance));
    localStorage.setItem(STORAGE_KEYS.ADVANCE_DEPOSITS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(initialReminders));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSettings));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');

    return {
      sections: initialSections,
      entries: initialEntries,
      expenses: initialExpenses,
      advanceSections: initialAdvance,
      advanceDeposits: [],
      reminders: initialReminders,
      settings: initialSettings,
    };
  }

  try {
    const rawSections = localStorage.getItem(STORAGE_KEYS.SECTIONS);
    const rawEntries = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    const rawExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    const rawAdvance = localStorage.getItem(STORAGE_KEYS.ADVANCE_SECTIONS);
    const rawDeposits = localStorage.getItem(STORAGE_KEYS.ADVANCE_DEPOSITS);
    const rawReminders = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

    const parsedSections = rawSections ? JSON.parse(rawSections) : DEFAULT_SECTION_TEMPLATES;
    const parsedEntries = rawEntries ? JSON.parse(rawEntries) : [];
    const parsedExpenses = rawExpenses ? JSON.parse(rawExpenses) : DEFAULT_EXPENSES;
    const parsedAdvance = rawAdvance ? JSON.parse(rawAdvance) : DEFAULT_ADVANCE_SECTIONS;
    const parsedDeposits = rawDeposits ? JSON.parse(rawDeposits) : [];
    const parsedReminders = rawReminders ? JSON.parse(rawReminders) : DEFAULT_REMINDERS;
    const parsedSettings = rawSettings ? JSON.parse(rawSettings) : DEFAULT_SETTINGS;

    return {
      sections: Array.isArray(parsedSections) ? parsedSections : DEFAULT_SECTION_TEMPLATES,
      entries: sanitizeEntries(parsedEntries),
      expenses: Array.isArray(parsedExpenses) ? parsedExpenses : DEFAULT_EXPENSES,
      advanceSections: Array.isArray(parsedAdvance) ? parsedAdvance : DEFAULT_ADVANCE_SECTIONS,
      advanceDeposits: Array.isArray(parsedDeposits) ? parsedDeposits : [],
      reminders: Array.isArray(parsedReminders) ? parsedReminders : DEFAULT_REMINDERS,
      settings: { ...DEFAULT_SETTINGS, ...(parsedSettings || {}), currency: 'PKR ' },
    };
  } catch (err) {
    console.error('Error loading stored diary data, returning defaults:', err);
    return {
      sections: DEFAULT_SECTION_TEMPLATES,
      entries: [],
      expenses: DEFAULT_EXPENSES,
      advanceSections: DEFAULT_ADVANCE_SECTIONS,
      advanceDeposits: [],
      reminders: DEFAULT_REMINDERS,
      settings: DEFAULT_SETTINGS,
    };
  }
}

export function saveAllData(data: {
  sections: SectionTemplate[];
  entries: DiaryEntry[];
  expenses: ExpenseItem[];
  advanceSections: AdvanceSection[];
  advanceDeposits: AdvanceDeposit[];
  reminders: Reminder[];
  settings: AppSettings;
}) {
  try {
    localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(data.sections || []));
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(data.entries || []));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data.expenses || []));
    localStorage.setItem(STORAGE_KEYS.ADVANCE_SECTIONS, JSON.stringify(data.advanceSections || []));
    localStorage.setItem(STORAGE_KEYS.ADVANCE_DEPOSITS, JSON.stringify(data.advanceDeposits || []));
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(data.reminders || []));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings || DEFAULT_SETTINGS));
  } catch (err) {
    console.error('Failed to write data to localStorage:', err);
  }
}

export function createBackupJSON(data: {
  sections: SectionTemplate[];
  entries: DiaryEntry[];
  expenses: ExpenseItem[];
  advanceSections: AdvanceSection[];
  advanceDeposits: AdvanceDeposit[];
  reminders: Reminder[];
  settings: AppSettings;
}): string {
  const backup: BackupData = {
    version: 3,
    exported_at: new Date().toISOString(),
    app_name: 'Daily Diary',
    sections: data.sections,
    entries: data.entries,
    expenses: data.expenses,
    advance_sections: data.advanceSections,
    advance_deposits: data.advanceDeposits,
    reminders: data.reminders,
    settings: data.settings,
  };
  return JSON.stringify(backup, null, 2);
}

export function parseAndValidateBackup(jsonString: string): BackupData {
  const parsed = JSON.parse(jsonString);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid backup file structure.');
  }
  if (!Array.isArray(parsed.entries) || !Array.isArray(parsed.sections)) {
    throw new Error('Backup file is missing required entries or sections data.');
  }
  return {
    version: parsed.version || 3,
    exported_at: parsed.exported_at || new Date().toISOString(),
    app_name: parsed.app_name || 'Daily Diary',
    sections: Array.isArray(parsed.sections) ? parsed.sections : DEFAULT_SECTION_TEMPLATES,
    entries: sanitizeEntries(parsed.entries),
    expenses: Array.isArray(parsed.expenses) ? parsed.expenses : DEFAULT_EXPENSES,
    advance_sections: Array.isArray(parsed.advance_sections) ? parsed.advance_sections : DEFAULT_ADVANCE_SECTIONS,
    advance_deposits: Array.isArray(parsed.advance_deposits) ? parsed.advance_deposits : [],
    reminders: Array.isArray(parsed.reminders) ? parsed.reminders : DEFAULT_REMINDERS,
    settings: parsed.settings ? { ...DEFAULT_SETTINGS, ...parsed.settings } : DEFAULT_SETTINGS,
  };
}

export async function hashPIN(pin: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(pin + '_daily_diary_salt_secure');
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
