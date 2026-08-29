import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Heart,
  Calendar as CalendarIcon,
  Sparkles,
  Star,
  CheckCircle2,
  Clock,
  History,
  Receipt,
  Wallet,
} from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import {
  formatDateToYYYYMMDD,
  formatHumanDate,
  formatDisplayMonth,
  getTodayDateString,
  getOnThisDayEntries,
} from '../../utils/date';
import { DEFAULT_MOODS } from '../../utils/constants';
import { DiaryEntry } from '../../types';

export const CalendarView: React.FC = () => {
  const {
    entries = [],
    expenses = [],
    advanceSections = [],
    openEditor,
    setSelectedEntryDetail,
    settings,
  } = useDiary();

  const safeEntries = Array.isArray(entries) ? entries : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  const currency = settings?.currency || 'PKR ';
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState(getTodayDateString());

  const todayStr = getTodayDateString();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    setCurrentDate(new Date());
    setSelectedDayStr(todayStr);
  };

  // Build calendar matrix
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      entry?: DiaryEntry;
      dayExpenses: typeof expenses;
    }[] = [];

    // Prev month days
    for (let i = startOffset - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const d = new Date(year, month - 1, dayNum);
      const dateStr = formatDateToYYYYMMDD(d);
      const entry = safeEntries.find((e) => e.date === dateStr);
      const dayExpenses = safeExpenses.filter((exp) => exp.date === dateStr);

      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        entry,
        dayExpenses,
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const d = new Date(year, month, dayNum);
      const dateStr = formatDateToYYYYMMDD(d);
      const entry = safeEntries.find((e) => e.date === dateStr);
      const dayExpenses = safeExpenses.filter((exp) => exp.date === dateStr);

      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        entry,
        dayExpenses,
      });
    }

    // Next month filler
    const totalSlots = Math.ceil(days.length / 7) * 7;
    const remaining = totalSlots - days.length;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const d = new Date(year, month + 1, dayNum);
      const dateStr = formatDateToYYYYMMDD(d);
      const entry = safeEntries.find((e) => e.date === dateStr);
      const dayExpenses = safeExpenses.filter((exp) => exp.date === dateStr);

      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        entry,
        dayExpenses,
      });
    }

    return days;
  }, [currentDate, safeEntries, safeExpenses, todayStr]);

  const selectedDayData = calendarDays.find((d) => d.dateStr === selectedDayStr);
  const onThisDayPastYears = useMemo(() => {
    return getOnThisDayEntries(safeEntries, selectedDayStr);
  }, [safeEntries, selectedDayStr]);

  const selectedDayExpenses = safeExpenses.filter((e) => e.date === selectedDayStr);
  const selectedDayTotalSpend = selectedDayExpenses.reduce((a, b) => a + (b.amount || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
    >
      {/* Header & Month Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Interactive Calendar
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            View diary memories, moods, and daily expense activity day by day
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGoToday}
            className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-800/60 transition-colors"
          >
            Today
          </button>

          <div className="flex items-center bg-white dark:bg-stone-800 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 p-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 text-xs sm:text-sm font-serif font-bold text-stone-900 dark:text-stone-100 min-w-[130px] text-center">
              {formatDisplayMonth(currentDate)}
            </span>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Calendar Grid */}
        <div className="lg:col-span-8 bg-white dark:bg-stone-800/90 rounded-3xl border border-stone-200/80 dark:border-stone-700/80 p-5 sm:p-6 shadow-sm">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName) => (
              <div
                key={dayName}
                className="text-center text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider py-1"
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
            {calendarDays.map((d) => {
              const isSelected = selectedDayStr === d.dateStr;
              const moodSec = d.entry?.sections.find(
                (s) => s.section_type === 'mood' || s.mood_value
              );
              const moodObj = DEFAULT_MOODS.find((m) => m.value === moodSec?.mood_value);
              const daySpendTotal = d.dayExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);

              return (
                <button
                  key={d.dateStr}
                  onClick={() => setSelectedDayStr(d.dateStr)}
                  className={`min-h-[76px] sm:min-h-[90px] p-2 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30'
                      : d.isCurrentMonth
                      ? 'bg-stone-50/50 dark:bg-stone-900/40 border-stone-200/70 dark:border-stone-700/60 hover:border-amber-300 dark:hover:border-amber-700'
                      : 'bg-stone-100/30 dark:bg-stone-900/10 border-stone-100 dark:border-stone-800/40 opacity-40 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        d.isToday
                          ? 'bg-amber-600 text-white'
                          : isSelected
                          ? 'text-amber-700 dark:text-amber-300'
                          : 'text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      {d.dayNumber}
                    </span>

                    {moodObj && (
                      <span className="text-base" title={moodObj.label}>
                        {moodObj.emoji}
                      </span>
                    )}
                  </div>

                  {/* Indicators for entry & expenses */}
                  <div className="space-y-0.5 mt-auto">
                    {d.entry && (
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                        <span className="text-[10px] font-medium text-stone-600 dark:text-stone-300 truncate hidden sm:inline">
                          {d.entry.title || 'Entry'}
                        </span>
                      </div>
                    )}

                    {daySpendTotal > 0 && (
                      <div className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 truncate">
                        -{currency}{daySpendTotal.toFixed(0)}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Day Inspector & On This Day */}
        <div className="lg:col-span-4 space-y-6">
          {/* Day Inspector Card */}
          <div className="bg-white dark:bg-stone-800/90 rounded-3xl border border-stone-200/80 dark:border-stone-700/80 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-700/60 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {selectedDayStr === todayStr ? 'Today' : 'Selected Date'}
                </span>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  {formatHumanDate(selectedDayStr)}
                </h3>
              </div>

              <button
                onClick={() => openEditor(selectedDayStr)}
                className="p-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all"
                title={selectedDayData?.entry ? 'Edit this entry' : 'Write for this day'}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Entry Summary */}
            {selectedDayData?.entry ? (
              <div className="space-y-3">
                <div
                  onClick={() => setSelectedEntryDetail(selectedDayData.entry!)}
                  className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 cursor-pointer hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 line-clamp-1">
                      {selectedDayData.entry.title || 'Untitled Journal Entry'}
                    </h4>
                    {selectedDayData.entry.is_favorite && (
                      <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                    {selectedDayData.entry.sections?.find((s) => s.content)?.content ||
                      'No written description'}
                  </p>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-2">
                    Click to view full entry →
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800 text-center space-y-2">
                <p className="text-xs text-stone-500">No journal entry recorded on this date.</p>
                <button
                  onClick={() => openEditor(selectedDayStr)}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold transition-colors"
                >
                  + Write Entry
                </button>
              </div>
            )}

            {/* Daily Expenses Section */}
            <div className="space-y-3 pt-3 border-t border-stone-100 dark:border-stone-700/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-amber-500" />
                  <span>Expenses for this day</span>
                </span>
                {selectedDayTotalSpend > 0 && (
                  <span className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400">
                    -{currency}{selectedDayTotalSpend.toFixed(2)}
                  </span>
                )}
              </div>

              {selectedDayExpenses.length === 0 ? (
                <p className="text-xs text-stone-400">No expenses recorded for this date.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedDayExpenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-700 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-stone-900 dark:text-stone-100">
                          {exp.title}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {exp.category} {exp.is_advance_deduction && '• Advance deduction'}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                        -{currency}{exp.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* On This Day Flashback */}
          {onThisDayPastYears.length > 0 && (
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-3xl border border-amber-200/80 dark:border-amber-900/50 p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                  On This Day in Past Years
                </h4>
              </div>
              {onThisDayPastYears.map((pastEntry) => (
                <div
                  key={pastEntry.id}
                  onClick={() => setSelectedEntryDetail(pastEntry)}
                  className="p-3 rounded-2xl bg-white/80 dark:bg-stone-800/80 border border-amber-200/60 dark:border-amber-800/40 cursor-pointer hover:shadow-sm"
                >
                  <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                    {pastEntry.date.split('-')[0]} (
                    {new Date().getFullYear() - parseInt(pastEntry.date.split('-')[0], 10)} years ago)
                  </div>
                  <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 line-clamp-1">
                    {pastEntry.title || 'Past Reflection'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
