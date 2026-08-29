import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  DiaryEntry,
  SectionTemplate,
  Reminder,
  AppSettings,
  ExpenseItem,
  AdvanceSection,
  AdvanceDeposit,
  GmailAccountInfo,
  GmailBackupMetadata,
  ToastNotification,
} from '../types';
import { ToastContainer } from '../components/common/ToastContainer';
import {
  loadStoredData,
  saveAllData,
  createBackupJSON,
  parseAndValidateBackup,
  hashPIN,
} from '../utils/storage';
import {
  getTodayDateString,
  calculateDiaryStreak,
} from '../utils/date';
import { triggerConfetti } from '../utils/confetti';
import { DEFAULT_SETTINGS } from '../utils/constants';
import { GmailSyncService } from '../utils/gmail';

interface DiaryContextType {
  entries: DiaryEntry[];
  sections: SectionTemplate[];
  expenses: ExpenseItem[];
  advanceSections: AdvanceSection[];
  advanceDeposits: AdvanceDeposit[];
  reminders: Reminder[];
  settings: AppSettings;
  isLocked: boolean;
  activeTab: 'home' | 'entries' | 'calendar' | 'expenses' | 'analytics' | 'settings';
  setActiveTab: (tab: 'home' | 'entries' | 'calendar' | 'expenses' | 'analytics' | 'settings') => void;
  editorDate: string | null;
  openEditor: (date?: string) => void;
  closeEditor: () => void;
  selectedEntryDetail: DiaryEntry | null;
  setSelectedEntryDetail: (entry: DiaryEntry | null) => void;
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
  dismissToast: (id: string) => void;

  // Entry Operations
  saveEntry: (entry: DiaryEntry) => void;
  deleteEntry: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getEntryForDate: (dateStr: string) => DiaryEntry | undefined;

  // Expense & Advance Operations
  saveExpense: (expense: ExpenseItem) => void;
  deleteExpense: (id: string) => void;
  duplicateExpense: (id: string) => void;
  createAdvanceSection: (name: string, initialAmount: number, color?: string, icon?: string, description?: string) => AdvanceSection;
  updateAdvanceSection: (id: string, updates: Partial<AdvanceSection>) => void;
  deleteAdvanceSection: (id: string) => void;
  addAdvanceDeposit: (sectionId: string, amount: number, date: string, source?: string, notes?: string) => void;
  deleteAdvanceDeposit: (depositId: string) => void;

  // Template Operations
  addSectionTemplate: (template: Omit<SectionTemplate, 'id' | 'created_at'>) => SectionTemplate;
  updateSectionTemplate: (id: string, updates: Partial<SectionTemplate>) => void;
  deleteSectionTemplate: (id: string) => void;
  reorderSectionTemplates: (reordered: SectionTemplate[]) => void;

  // Reminder Operations
  saveReminder: (reminder: Reminder) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;

  // Settings & Security
  updateSettings: (updates: Partial<AppSettings>) => void;
  setPin: (pin: string | null) => Promise<void>;
  unlockApp: (pin: string) => Promise<boolean>;
  lockApp: () => void;
  exportBackup: () => void;
  importBackup: (jsonStr: string) => boolean;
  resetAllData: () => void;

  // Gmail Sync & Cloud Backup
  gmailUser: GmailAccountInfo | null;
  isGmailConnecting: boolean;
  isGmailSyncing: boolean;
  connectGmail: () => Promise<void>;
  disconnectGmail: () => void;
  backupToGmail: () => Promise<boolean>;
  restoreFromGmailMessage: (messageId: string) => Promise<boolean>;
  fetchGmailBackups: () => Promise<GmailBackupMetadata[]>;

  // Computed & Filters
  diaryStreak: { current: number; longest: number };
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  selectedMood: string | null;
  setSelectedMood: (mood: string | null) => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (fav: boolean) => void;
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

export const DiaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState(() => loadStoredData());
  const [activeTab, setActiveTab] = useState<'home' | 'entries' | 'calendar' | 'expenses' | 'analytics' | 'settings'>('home');
  const [editorDate, setEditorDate] = useState<string | null>(null);
  const [selectedEntryDetail, setSelectedEntryDetail] = useState<DiaryEntry | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return Boolean(data.settings.is_pin_enabled && data.settings.pin_hash);
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success', duration = 3500) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Gmail State
  const [gmailUser, setGmailUser] = useState<GmailAccountInfo | null>(() => GmailSyncService.getStoredUser());
  const [isGmailConnecting, setIsGmailConnecting] = useState(false);
  const [isGmailSyncing, setIsGmailSyncing] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Sync to local storage whenever data changes
  useEffect(() => {
    saveAllData({
      sections: data.sections,
      entries: data.entries,
      expenses: data.expenses,
      advanceSections: data.advanceSections,
      advanceDeposits: data.advanceDeposits,
      reminders: data.reminders,
      settings: data.settings,
    });
  }, [data]);

  // Apply theme & font size to DOM
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-sepia', 'theme-midnight');
    root.classList.add(`theme-${data.settings.theme}`);
    
    if (data.settings.theme === 'dark' || data.settings.theme === 'midnight') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [data.settings.theme]);

  const diaryStreak = useMemo(() => {
    return calculateDiaryStreak(data.entries);
  }, [data.entries]);

  const openEditor = useCallback((date?: string) => {
    setEditorDate(date || getTodayDateString());
  }, []);

  const closeEditor = useCallback(() => {
    setEditorDate(null);
  }, []);

  const saveEntry = useCallback((entry: DiaryEntry) => {
    setData((prev) => {
      const existingIdx = prev.entries.findIndex((e) => e.date === entry.date);
      let updatedEntries: DiaryEntry[];

      if (existingIdx >= 0) {
        updatedEntries = [...prev.entries];
        updatedEntries[existingIdx] = {
          ...entry,
          updated_at: Date.now(),
        };
      } else {
        updatedEntries = [
          {
            ...entry,
            id: entry.id || `entry_${entry.date.replace(/-/g, '')}`,
            created_at: Date.now(),
            updated_at: Date.now(),
          },
          ...prev.entries,
        ];
      }

      return {
        ...prev,
        entries: updatedEntries.sort((a, b) => b.date.localeCompare(a.date)),
      };
    });

    triggerConfetti();
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      entries: prev.entries.filter((e) => e.id !== id),
    }));
    if (selectedEntryDetail?.id === id) {
      setSelectedEntryDetail(null);
    }
  }, [selectedEntryDetail]);

  const toggleFavorite = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      entries: prev.entries.map((e) =>
        e.id === id ? { ...e, is_favorite: !e.is_favorite } : e
      ),
    }));
  }, []);

  const getEntryForDate = useCallback(
    (dateStr: string) => {
      return data.entries.find((e) => e.date === dateStr);
    },
    [data.entries]
  );

  // ----------------------------------------------------
  // EXPENSE & ADVANCE HANDLERS
  // ----------------------------------------------------
  const saveExpense = useCallback((expense: ExpenseItem) => {
    setData((prev) => {
      const existingIdx = prev.expenses.findIndex((x) => x.id === expense.id);
      let updatedExpenses = [...prev.expenses];
      if (existingIdx >= 0) {
        updatedExpenses[existingIdx] = expense;
      } else {
        updatedExpenses.unshift(expense);
      }
      return {
        ...prev,
        expenses: updatedExpenses.sort((a, b) => b.date.localeCompare(a.date) || b.created_at - a.created_at),
      };
    });
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((x) => x.id !== id),
    }));
    showToast('Expense item deleted', 'info');
  }, [showToast]);

  const duplicateExpense = useCallback((id: string) => {
    setData((prev) => {
      const item = prev.expenses.find((e) => e.id === id);
      if (!item) return prev;
      const duplicated: ExpenseItem = {
        ...item,
        id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: `${item.title} (Copy)`,
        date: getTodayDateString(),
        created_at: Date.now(),
      };
      return {
        ...prev,
        expenses: [duplicated, ...prev.expenses].sort((a, b) => b.date.localeCompare(a.date) || b.created_at - a.created_at),
      };
    });
    showToast('Expense duplicated successfully!', 'success');
  }, [showToast]);

  const createAdvanceSection = useCallback(
    (name: string, initialAmount: number, color = '#3B82F6', icon = 'Briefcase', description = '') => {
      const newSecId = `adv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newSection: AdvanceSection = {
        id: newSecId,
        name: name.trim(),
        total_allocated: initialAmount,
        color,
        icon,
        description,
        created_at: Date.now(),
      };

      const initialDeposit: AdvanceDeposit = {
        id: `dep_${Date.now()}`,
        advance_section_id: newSecId,
        amount: initialAmount,
        date: getTodayDateString(),
        source: 'Initial Setup Deposit',
        notes: 'Initial opening advance balance',
        created_at: Date.now(),
      };

      setData((prev) => ({
        ...prev,
        advanceSections: [...prev.advanceSections, newSection],
        advanceDeposits: initialAmount > 0 ? [...prev.advanceDeposits, initialDeposit] : prev.advanceDeposits,
      }));

      return newSection;
    },
    []
  );

  const updateAdvanceSection = useCallback((id: string, updates: Partial<AdvanceSection>) => {
    setData((prev) => ({
      ...prev,
      advanceSections: prev.advanceSections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, []);

  const deleteAdvanceSection = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      advanceSections: prev.advanceSections.filter((s) => s.id !== id),
      advanceDeposits: prev.advanceDeposits.filter((d) => d.advance_section_id !== id),
      expenses: prev.expenses.map((e) =>
        e.advance_section_id === id ? { ...e, is_advance_deduction: false, advance_section_id: null } : e
      ),
    }));
  }, []);

  const addAdvanceDeposit = useCallback(
    (sectionId: string, amount: number, date: string, source = 'Cash/Bank Deposit', notes = '') => {
      const deposit: AdvanceDeposit = {
        id: `dep_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        advance_section_id: sectionId,
        amount: Math.abs(amount),
        date: date || getTodayDateString(),
        source,
        notes,
        created_at: Date.now(),
      };

      setData((prev) => {
        const sec = prev.advanceSections.find((s) => s.id === sectionId);
        const updatedSections = prev.advanceSections.map((s) =>
          s.id === sectionId ? { ...s, total_allocated: s.total_allocated + amount } : s
        );
        return {
          ...prev,
          advanceSections: updatedSections,
          advanceDeposits: [deposit, ...prev.advanceDeposits],
        };
      });
      triggerConfetti();
    },
    []
  );

  const deleteAdvanceDeposit = useCallback((depositId: string) => {
    setData((prev) => {
      const dep = prev.advanceDeposits.find((d) => d.id === depositId);
      if (!dep) return prev;
      const updatedSections = prev.advanceSections.map((s) =>
        s.id === dep.advance_section_id
          ? { ...s, total_allocated: Math.max(0, s.total_allocated - dep.amount) }
          : s
      );
      return {
        ...prev,
        advanceSections: updatedSections,
        advanceDeposits: prev.advanceDeposits.filter((d) => d.id !== depositId),
      };
    });
  }, []);

  // Template Handlers
  const addSectionTemplate = useCallback(
    (template: Omit<SectionTemplate, 'id' | 'created_at'>) => {
      const newTemplate: SectionTemplate = {
        ...template,
        id: `template_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        created_at: Date.now(),
      };
      setData((prev) => ({
        ...prev,
        sections: [...prev.sections, newTemplate],
      }));
      return newTemplate;
    },
    []
  );

  const updateSectionTemplate = useCallback((id: string, updates: Partial<SectionTemplate>) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, []);

  const deleteSectionTemplate = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id),
    }));
  }, []);

  const reorderSectionTemplates = useCallback((reordered: SectionTemplate[]) => {
    setData((prev) => ({
      ...prev,
      sections: reordered.map((s, idx) => ({ ...s, sort_order: idx + 1 })),
    }));
  }, []);

  // Reminder Handlers
  const saveReminder = useCallback((reminder: Reminder) => {
    setData((prev) => {
      const existingIdx = prev.reminders.findIndex((r) => r.id === reminder.id);
      let updatedReminders = [...prev.reminders];
      if (existingIdx >= 0) {
        updatedReminders[existingIdx] = reminder;
      } else {
        updatedReminders.push(reminder);
      }
      return { ...prev, reminders: updatedReminders };
    });
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      reminders: prev.reminders.filter((r) => r.id !== id),
    }));
  }, []);

  const toggleReminder = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      reminders: prev.reminders.map((r) =>
        r.id === id ? { ...r, is_active: !r.is_active } : r
      ),
    }));
  }, []);

  // Settings & Security Handlers
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  }, []);

  const setPin = useCallback(async (pin: string | null) => {
    if (!pin) {
      setData((prev) => ({
        ...prev,
        settings: { ...prev.settings, is_pin_enabled: false, pin_hash: null },
      }));
      setIsLocked(false);
      return;
    }

    const hashed = await hashPIN(pin);
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, is_pin_enabled: true, pin_hash: hashed },
    }));
  }, []);

  const unlockApp = useCallback(
    async (pin: string): Promise<boolean> => {
      if (!data.settings.pin_hash) {
        setIsLocked(false);
        return true;
      }
      const attemptHash = await hashPIN(pin);
      if (attemptHash === data.settings.pin_hash) {
        setIsLocked(false);
        return true;
      }
      return false;
    },
    [data.settings.pin_hash]
  );

  const lockApp = useCallback(() => {
    if (data.settings.is_pin_enabled) {
      setIsLocked(true);
    }
  }, [data.settings.is_pin_enabled]);

  const exportBackup = useCallback(() => {
    const jsonStr = createBackupJSON({
      sections: data.sections,
      entries: data.entries,
      expenses: data.expenses,
      advanceSections: data.advanceSections,
      advanceDeposits: data.advanceDeposits,
      reminders: data.reminders,
      settings: data.settings,
    });
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily_diary_backup_${getTodayDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data]);

  const importBackup = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = parseAndValidateBackup(jsonStr);
      setData({
        sections: parsed.sections,
        entries: parsed.entries,
        expenses: parsed.expenses || [],
        advanceSections: parsed.advance_sections || [],
        advanceDeposits: parsed.advance_deposits || [],
        reminders: parsed.reminders,
        settings: parsed.settings || DEFAULT_SETTINGS,
      });
      return true;
    } catch (e) {
      console.error('Backup import error:', e);
      return false;
    }
  }, []);

  const resetAllData = useCallback(() => {
    localStorage.clear();
    const fresh = loadStoredData();
    setData(fresh);
    setIsLocked(false);
  }, []);

  // ----------------------------------------------------
  // GMAIL SYNC & BACKUP INTEGRATION
  // ----------------------------------------------------
  const connectGmail = useCallback(async () => {
    setIsGmailConnecting(true);
    try {
      const { user } = await GmailSyncService.requestGoogleToken();
      setGmailUser(user);
      triggerConfetti();
    } catch (err: any) {
      console.error('Gmail connect error:', err);
      throw err;
    } finally {
      setIsGmailConnecting(false);
    }
  }, []);

  const disconnectGmail = useCallback(() => {
    GmailSyncService.disconnect();
    setGmailUser(null);
  }, []);

  const backupToGmail = useCallback(async (): Promise<boolean> => {
    setIsGmailSyncing(true);
    try {
      const payload = {
        version: 2,
        exported_at: new Date().toISOString(),
        app_name: 'Daily Diary & Expense Manager',
        sections: data.sections,
        entries: data.entries,
        expenses: data.expenses,
        advance_sections: data.advanceSections,
        advance_deposits: data.advanceDeposits,
        reminders: data.reminders,
        settings: data.settings,
      };

      await GmailSyncService.backupToGmail(payload, gmailUser?.email);
      setGmailUser(GmailSyncService.getStoredUser());
      triggerConfetti();
      return true;
    } catch (err: any) {
      console.error('Gmail backup failed:', err);
      throw err;
    } finally {
      setIsGmailSyncing(false);
    }
  }, [data, gmailUser]);

  const fetchGmailBackups = useCallback(async (): Promise<GmailBackupMetadata[]> => {
    return await GmailSyncService.listGmailBackups();
  }, []);

  const restoreFromGmailMessage = useCallback(async (messageId: string): Promise<boolean> => {
    setIsGmailSyncing(true);
    try {
      const restored = await GmailSyncService.restoreFromGmailMessage(messageId);
      setData({
        sections: restored.sections || data.sections,
        entries: restored.entries || [],
        expenses: restored.expenses || [],
        advanceSections: restored.advance_sections || [],
        advanceDeposits: restored.advance_deposits || [],
        reminders: restored.reminders || data.reminders,
        settings: restored.settings || data.settings,
      });
      triggerConfetti();
      return true;
    } catch (err: any) {
      console.error('Gmail restore error:', err);
      throw err;
    } finally {
      setIsGmailSyncing(false);
    }
  }, [data]);

  return (
    <DiaryContext.Provider
      value={{
        entries: data.entries,
        sections: data.sections,
        expenses: data.expenses,
        advanceSections: data.advanceSections,
        advanceDeposits: data.advanceDeposits,
        reminders: data.reminders,
        settings: data.settings,
        isLocked,
        activeTab,
        setActiveTab,
        editorDate,
        openEditor,
        closeEditor,
        selectedEntryDetail,
        setSelectedEntryDetail,
        toasts,
        showToast,
        dismissToast,

        // Entry Operations
        saveEntry,
        deleteEntry,
        toggleFavorite,
        getEntryForDate,

        // Expenses & Advance
        saveExpense,
        deleteExpense,
        duplicateExpense,
        createAdvanceSection,
        updateAdvanceSection,
        deleteAdvanceSection,
        addAdvanceDeposit,
        deleteAdvanceDeposit,

        // Template Operations
        addSectionTemplate,
        updateSectionTemplate,
        deleteSectionTemplate,
        reorderSectionTemplates,

        // Reminders
        saveReminder,
        deleteReminder,
        toggleReminder,

        // Settings & Security
        updateSettings,
        setPin,
        unlockApp,
        lockApp,
        exportBackup,
        importBackup,
        resetAllData,

        // Gmail
        gmailUser,
        isGmailConnecting,
        isGmailSyncing,
        connectGmail,
        disconnectGmail,
        backupToGmail,
        restoreFromGmailMessage,
        fetchGmailBackups,

        // Filters
        diaryStreak,
        searchQuery,
        setSearchQuery,
        selectedTag,
        setSelectedTag,
        selectedMood,
        setSelectedMood,
        showFavoritesOnly,
        setShowFavoritesOnly,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </DiaryContext.Provider>
  );
};

export const useDiary = () => {
  const context = useContext(DiaryContext);
  if (!context) {
    throw new Error('useDiary must be used within a DiaryProvider');
  }
  return context;
};
