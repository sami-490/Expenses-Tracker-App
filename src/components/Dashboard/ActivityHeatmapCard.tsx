import React, { useState } from 'react';
import { Calendar, ChevronRight, Info } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { generateActivityMatrix, formatHumanDate } from '../../utils/date';

export const ActivityHeatmapCard: React.FC = () => {
  const { entries = [], expenses = [], openEditor, setActiveTab, settings } = useDiary();
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    hasEntry: boolean;
    words: number;
    hasExpenses: boolean;
    expenseAmount?: number;
    moodEmoji?: string;
  } | null>(null);

  // Generate 28 days (4 weeks) for clean mobile/desktop grid
  const days = generateActivityMatrix(28, entries, expenses);

  return (
    <div className="bg-white dark:bg-stone-800/90 rounded-3xl border border-stone-200/80 dark:border-stone-700/80 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
              Consistency Matrix
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Last 4 weeks of journaling & entries
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('calendar')}
          className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5"
        >
          <span>Full Calendar</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid Container */}
      <div className="mb-3">
        <div className="grid grid-cols-7 gap-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayName, idx) => (
            <span
              key={idx}
              className="text-center text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase"
            >
              {dayName}
            </span>
          ))}

          {days.map((d) => {
            const dayNum = parseInt(d.date.split('-')[2], 10);

            // Calculate styling based on level
            let cellBg = 'bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400';
            if (d.level === 4) {
              cellBg = 'bg-amber-500 text-white font-bold shadow-sm shadow-amber-500/30';
            } else if (d.level === 3) {
              cellBg = 'bg-amber-400 dark:bg-amber-500 text-stone-900 font-semibold';
            } else if (d.level === 2) {
              cellBg = 'bg-amber-200 dark:bg-amber-700 text-stone-900 dark:text-stone-100';
            } else if (d.level === 1) {
              cellBg = 'bg-amber-100 dark:bg-amber-900/60 text-stone-700 dark:text-stone-300';
            }

            return (
              <button
                key={d.date}
                onClick={() => openEditor(d.date)}
                onMouseEnter={() =>
                  setHoveredDay({
                    date: d.date,
                    hasEntry: d.hasEntry,
                    words: d.wordCount,
                    hasExpenses: !!d.hasExpenses,
                    expenseAmount: d.expenseAmount,
                    moodEmoji: d.moodEmoji,
                  })
                }
                onMouseLeave={() => setHoveredDay(null)}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all hover:scale-105 active:scale-95 ${cellBg} border border-stone-200/40 dark:border-stone-700/40`}
                title={`${formatHumanDate(d.date)} - ${
                  d.hasEntry ? `${d.wordCount} words written` : 'No entry'
                }`}
              >
                <span className="text-xs">{dayNum}</span>
                {d.moodEmoji && (
                  <span className="text-[10px] leading-none absolute -bottom-1">
                    {d.moodEmoji === 'ecstatic'
                      ? '🤩'
                      : d.moodEmoji === 'happy'
                      ? '😊'
                      : d.moodEmoji === 'peaceful'
                      ? '🌿'
                      : d.moodEmoji === 'productive'
                      ? '⚡'
                      : d.moodEmoji === 'tired'
                      ? '🥱'
                      : d.moodEmoji === 'anxious'
                      ? '😰'
                      : '📝'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Hover/Status Detail */}
      <div className="h-6 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-1">
        {hoveredDay ? (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              {formatHumanDate(hoveredDay.date)}:
            </span>
            <span>
              {hoveredDay.hasEntry ? `Journaled (${hoveredDay.words} words)` : 'No journal entry'}
            </span>
            {hoveredDay.hasExpenses && hoveredDay.expenseAmount !== undefined && hoveredDay.expenseAmount > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                • {settings?.currency || 'PKR '}{hoveredDay.expenseAmount.toLocaleString()} logged
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px]">
            <Info className="w-3.5 h-3.5 text-stone-400" />
            <span>Click any day to write or review that date</span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <span className="text-[10px] text-stone-400">Less</span>
          <div className="flex gap-0.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-stone-100 dark:bg-stone-800"></span>
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-100 dark:bg-amber-900/60"></span>
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-300 dark:bg-amber-700"></span>
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
          </div>
          <span className="text-[10px] text-stone-400">More</span>
        </div>
      </div>
    </div>
  );
};
