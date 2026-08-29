import { DiaryEntry, ExpenseItem } from '../types';

export function getTodayDateString(): string {
  const today = new Date();
  return formatDateToYYYYMMDD(today);
}

export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseYYYYMMDD(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatHumanDate(dateStr: string): string {
  const date = parseYYYYMMDD(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDisplayMonth(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function calculateDiaryStreak(entries: DiaryEntry[] = []): { current: number; longest: number } {
  if (!entries || entries.length === 0) return { current: 0, longest: 0 };

  const entryDates = new Set(entries.map((e) => e.date));
  const today = new Date();
  const todayStr = formatDateToYYYYMMDD(today);

  // Check if today or yesterday has an entry
  let checkDate = new Date(today);
  let streak = 0;

  // If today isn't logged yet, streak can continue from yesterday
  if (!entryDates.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (entryDates.has(formatDateToYYYYMMDD(checkDate))) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Calculate longest streak
  const sortedDates = Array.from(entryDates)
    .map((d) => parseYYYYMMDD(d).getTime())
    .sort((a, b) => a - b);

  let longest = 0;
  let tempStreak = 0;
  let prevTime: number | null = null;

  for (const time of sortedDates) {
    if (prevTime === null) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((time - prevTime) / 86400000);
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longest) longest = tempStreak;
    prevTime = time;
  }

  return { current: streak, longest: Math.max(longest, streak) };
}

export function getOnThisDayEntries(
  entries: DiaryEntry[] = [],
  currentDateStr: string = getTodayDateString()
): DiaryEntry[] {
  if (!entries) return [];
  const [currentYear, currentMonth, currentDay] = currentDateStr.split('-');
  return entries.filter((entry) => {
    if (entry.date === currentDateStr) return false;
    const [entryYear, entryMonth, entryDay] = entry.date.split('-');
    return entryMonth === currentMonth && entryDay === currentDay && entryYear !== currentYear;
  });
}

export function countWordsAndChars(text: string): { words: number; chars: number } {
  if (!text) return { words: 0, chars: 0 };
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const chars = text.length;
  return { words, chars };
}

export function calculateTotalEntryWords(entry: DiaryEntry): number {
  let total = 0;
  if (!entry) return 0;
  if (entry.title) total += countWordsAndChars(entry.title).words;
  if (entry.sections && Array.isArray(entry.sections)) {
    for (const sec of entry.sections) {
      if (sec.content) total += countWordsAndChars(sec.content).words;
      if (sec.checklist_items && Array.isArray(sec.checklist_items)) {
        for (const item of sec.checklist_items) {
          total += countWordsAndChars(item.text).words;
        }
      }
    }
  }
  return total;
}

export interface ContributionDay {
  date: string;
  hasEntry: boolean;
  entryCount: number;
  wordCount: number;
  moodEmoji?: string;
  hasExpenses?: boolean;
  expenseAmount?: number;
  level: number; // 0 to 4
}

export function generateActivityMatrix(
  daysCount: number = 28,
  entries: DiaryEntry[] = [],
  expenses: ExpenseItem[] = []
): ContributionDay[] {
  const result: ContributionDay[] = [];
  const safeEntries = Array.isArray(entries) ? entries : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  const entriesMap = new Map<string, DiaryEntry>();
  safeEntries.forEach((e) => entriesMap.set(e.date, e));

  const expensesMap = new Map<string, number>();
  safeExpenses.forEach((exp) => {
    const prev = expensesMap.get(exp.date) || 0;
    expensesMap.set(exp.date, prev + (exp.amount || 0));
  });

  const today = new Date();

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = formatDateToYYYYMMDD(d);

    const entry = entriesMap.get(dateStr);
    const dayExpense = expensesMap.get(dateStr) || 0;

    let words = 0;
    let moodEmoji: string | undefined;

    if (entry) {
      words = calculateTotalEntryWords(entry);
      const moodSection = entry.sections?.find((s) => s.section_type === 'mood' || s.mood_value);
      if (moodSection?.mood_value) {
        moodEmoji = moodSection.mood_value;
      }
    }

    let level = 0;
    if (entry && words > 120) level = 4;
    else if (entry && words > 40) level = 3;
    else if (entry) level = 2;
    else if (dayExpense > 0) level = 1;

    result.push({
      date: dateStr,
      hasEntry: !!entry,
      entryCount: entry ? 1 : 0,
      wordCount: words,
      moodEmoji,
      hasExpenses: dayExpense > 0,
      expenseAmount: dayExpense,
      level,
    });
  }

  return result;
}
