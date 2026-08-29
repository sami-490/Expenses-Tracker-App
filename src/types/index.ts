export type SectionType = 'text' | 'checklist' | 'rating' | 'mood' | 'photo';

export interface SectionTemplate {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: SectionType;
  sort_order: number;
  is_deleted: boolean;
  created_at: number;
  description?: string;
  default_placeholder?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface PhotoAttachment {
  id: string;
  url: string;
  caption?: string;
  created_at: number;
}

export interface EntrySection {
  id: string;
  entry_id: string;
  section_id: string;
  section_name?: string;
  section_type?: SectionType;
  section_color?: string;
  section_icon?: string;
  content: string; // text body or JSON string for checklist
  checklist_items?: ChecklistItem[];
  mood_value?: string;
  rating?: number; // 1-5
  photo_paths?: PhotoAttachment[];
  sort_order: number;
}

export interface DiaryEntry {
  id: string;
  date: string; // 'YYYY-MM-DD'
  title?: string;
  is_favorite: boolean;
  tags: string[];
  weather?: {
    icon: string;
    label: string;
    temp?: string;
  };
  sections: EntrySection[];
  created_at: number;
  updated_at: number;
}

// ----------------------------------------------------
// EXPENSE & ADVANCE PAYMENT MANAGEMENT
// ----------------------------------------------------
export type TransactionType = 'expense' | 'income';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'upi' | 'advance_balance' | 'other';

export interface AdvanceSection {
  id: string;
  name: string; // e.g. "Office Advance", "Travel Fund", "Client XYZ Advance", "Rent Deposit"
  total_allocated: number; // sum of deposits/initial balance
  color: string; // Hex color
  icon?: string;
  description?: string;
  created_at: number;
}

export interface AdvanceDeposit {
  id: string;
  advance_section_id: string;
  amount: number;
  date: string; // 'YYYY-MM-DD'
  source?: string; // e.g. "Employer deposit", "Personal transfer"
  notes?: string;
  created_at: number;
}

export interface CategoryBudget {
  category: string;
  monthly_limit: number;
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  date: string; // 'YYYY-MM-DD'
  category: string; // e.g. "Food", "Transport", "Bills", "Shopping", "Health", "Advance Spend"
  type: TransactionType;
  payment_method: PaymentMethod;
  is_advance_deduction: boolean;
  advance_section_id?: string | null; // link to advance section if paid from advance
  notes?: string;
  receipt_url?: string;
  receipt_name?: string;
  created_at: number;
}

export interface Reminder {
  id: string;
  title: string;
  time: string; // 'HH:mm'
  repeat_days: string[] | 'daily';
  is_active: boolean;
  notification_id?: string;
  last_triggered?: number;
}

export type AppTheme = 'light' | 'dark' | 'sepia' | 'midnight';
export type AccentColor = 'amber' | 'emerald' | 'indigo' | 'rose' | 'teal' | 'violet';

export interface AppSettings {
  theme: AppTheme;
  accent_color: AccentColor;
  font_size: 'compact' | 'normal' | 'spacious';
  is_pin_enabled: boolean;
  pin_hash: string | null;
  daily_reminder_time: string;
  backup_reminder_enabled: boolean;
  user_name: string;
  currency: string; // e.g. "$", "₹", "€", "£", "AED"
  category_budgets?: CategoryBudget[];
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

export interface GmailAccountInfo {
  email: string;
  name?: string;
  picture?: string;
  connected_at: string;
  last_backup_at?: string;
}

export interface GmailBackupMetadata {
  id: string;
  subject: string;
  date: string;
  entries_count: number;
  expenses_count: number;
  advances_count: number;
}

export interface BackupData {
  version: number;
  exported_at: string;
  app_name: string;
  sections: SectionTemplate[];
  entries: DiaryEntry[];
  expenses: ExpenseItem[];
  advance_sections: AdvanceSection[];
  advance_deposits: AdvanceDeposit[];
  reminders: Reminder[];
  settings?: AppSettings;
}

export interface MoodOption {
  value: string;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

// Target definition for goals/targets
export type TargetFrequency = 'daily' | 'weekly' | 'custom';
export type TargetType = 'boolean' | 'number' | 'streak';

export interface Target {
  id: string;
  title: string;
  description?: string;
  category: string;
  color: string;
  icon: string;
  frequency: TargetFrequency;
  target_type: TargetType;
  target_value?: number;
  goal_value?: number;
  unit: string;
  start_date?: string;
  linked_section_id?: string;
  is_archived: boolean;
  created_at: number;
}

export interface TargetLog {
  id: string;
  target_id: string;
  date: string;
  value: number;
  is_completed: boolean;
  notes?: string;
  created_at: number;
}
