import React from 'react';
import {
  Wallet,
  ArrowRight,
} from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { DEFAULT_SETTINGS } from '../../utils/constants';

export const TodayExpensesSummaryCard: React.FC = () => {
  const { expenses = [], advanceSections = [], setActiveTab, settings = DEFAULT_SETTINGS } = useDiary();
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeAdvanceSections = Array.isArray(advanceSections) ? advanceSections : [];

  const currency = settings?.currency || 'PKR ';

  const totalAdvanceAllocated = safeAdvanceSections.reduce((acc, curr) => acc + (curr.total_allocated || 0), 0);
  const advanceExpenses = safeExpenses.filter((e) => e.is_advance_deduction && e.advance_section_id);
  const totalAdvanceSpent = advanceExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalRemainingAdvance = Math.max(0, totalAdvanceAllocated - totalAdvanceSpent);

  const recentExpenses = safeExpenses.slice(0, 3);

  return (
    <div className="bg-white dark:bg-stone-800/90 rounded-3xl border border-stone-200/80 dark:border-stone-700/80 p-6 shadow-sm hover:shadow-md transition-all space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
          <h2 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
            Expenses & Advance
          </h2>
        </div>

        <button
          onClick={() => setActiveTab('expenses')}
          className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
        >
          <span>Manage</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Advance Fund Balances Quick Snapshot */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-white space-y-2 shadow-sm">
        <div className="flex items-center justify-between text-xs text-stone-300">
          <span>Available Advance Balance</span>
          <span className="font-mono text-emerald-400 font-bold">
            {totalAdvanceAllocated > 0
              ? `${Math.round((totalRemainingAdvance / totalAdvanceAllocated) * 100)}% Left`
              : '0%'}
          </span>
        </div>
        <div className="text-2xl font-bold font-mono text-emerald-400">
          {currency}{totalRemainingAdvance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-700">
          <span>Total Allocated: {currency}{totalAdvanceAllocated.toFixed(2)}</span>
          <span>Deducted: {currency}{totalAdvanceSpent.toFixed(2)}</span>
        </div>
      </div>

      {/* Recent 3 Spends */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
          Recent Spends
        </span>
        {recentExpenses.length === 0 ? (
          <p className="text-xs text-stone-400 py-2">No transactions recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {recentExpenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-100 dark:border-stone-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <div>
                    <div className="font-medium text-stone-800 dark:text-stone-200 line-clamp-1">
                      {exp.title}
                    </div>
                    <div className="text-[10px] text-stone-400">{exp.category}</div>
                  </div>
                </div>
                <div className="font-mono font-bold text-stone-900 dark:text-stone-100">
                  -{currency}{exp.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setActiveTab('expenses')}
        className="w-full py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-700/60 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
      >
        <span>Open Expense Tracker & Advance Ledger</span>
      </button>
    </div>
  );
};
