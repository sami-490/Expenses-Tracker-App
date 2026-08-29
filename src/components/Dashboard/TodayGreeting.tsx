import React from 'react';
import { Sparkles, Wallet, Award, Flame, Cloud } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { getTodayDateString, formatHumanDate } from '../../utils/date';
import { DEFAULT_SETTINGS } from '../../utils/constants';

export const TodayGreeting: React.FC = () => {
  const {
    entries = [],
    expenses = [],
    advanceSections = [],
    diaryStreak = { current: 0, longest: 0 },
    settings = DEFAULT_SETTINGS,
    gmailUser = null,
  } = useDiary();

  const todayStr = getTodayDateString();
  const safeEntries = Array.isArray(entries) ? entries : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeAdvanceSections = Array.isArray(advanceSections) ? advanceSections : [];

  const hasEntryToday = safeEntries.some((e) => e.date === todayStr);

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good Morning'
      : currentHour < 17
      ? 'Good Afternoon'
      : 'Good Evening';

  const currency = settings?.currency || 'PKR ';
  const totalAdvanceAllocated = safeAdvanceSections.reduce((acc, curr) => acc + (curr.total_allocated || 0), 0);
  const totalAdvanceSpent = safeExpenses
    .filter((e) => e.is_advance_deduction && e.advance_section_id)
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalRemainingAdvance = Math.max(0, totalAdvanceAllocated - totalAdvanceSpent);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/10 dark:from-amber-950/30 dark:via-stone-900/60 dark:to-stone-900/40 border border-amber-200/60 dark:border-amber-900/40 p-6 sm:p-8">
      {/* Decorative background glow */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-1/3 -bottom-10 w-36 h-36 bg-orange-400/15 dark:bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-200/60 dark:border-amber-800/60">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{formatHumanDate(todayStr)}</span>
            </div>

            {gmailUser && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span>Gmail Synced ({gmailUser.email.split('@')[0]})</span>
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 dark:text-stone-50 tracking-tight">
            {greeting}, {settings?.user_name || 'Friend'}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 mt-1 max-w-xl">
            {hasEntryToday
              ? "You've updated your records for today! Check your expense balance and advance funds anytime."
              : "Manage your daily expenses, advance funds, calendar schedule, and records seamlessly."}
          </p>
        </div>

        {/* Highlight Stats Pill Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
          {/* Streak Card */}
          <div className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border border-stone-200/80 dark:border-stone-700/60 rounded-2xl p-3 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 mb-0.5">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="text-lg sm:text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
                {diaryStreak.current}
              </span>
            </div>
            <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Day Streak
            </p>
          </div>

          {/* Advance Balance Card */}
          <div className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border border-stone-200/80 dark:border-stone-700/60 rounded-2xl p-3 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 mb-0.5">
              <Wallet className="w-4 h-4" />
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {currency}{totalRemainingAdvance.toFixed(0)}
              </span>
            </div>
            <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Advance Bal
            </p>
          </div>

          {/* Total Entries */}
          <div className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border border-stone-200/80 dark:border-stone-700/60 rounded-2xl p-3 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1 text-indigo-600 dark:text-indigo-400 mb-0.5">
              <Award className="w-4 h-4" />
              <span className="text-lg sm:text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
                {safeEntries.length}
              </span>
            </div>
            <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Entries
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
