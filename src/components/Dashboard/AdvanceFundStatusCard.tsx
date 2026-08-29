import React from 'react';
import { Wallet, Plus, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { DEFAULT_SETTINGS } from '../../utils/constants';

export const AdvanceFundStatusCard: React.FC = () => {
  const { advanceSections = [], expenses = [], setActiveTab, settings = DEFAULT_SETTINGS } = useDiary();
  const safeAdvance = Array.isArray(advanceSections) ? advanceSections : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const currency = settings?.currency || 'PKR ';

  return (
    <div className="bg-white dark:bg-stone-800/90 rounded-3xl border border-stone-200/80 dark:border-stone-700/80 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 leading-tight">
              Advance Fund Ledgers
            </h2>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Departmental & project funds allocation
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('expenses')}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {safeAdvance.length === 0 ? (
        <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-900/40 border border-dashed border-stone-300 dark:border-stone-700 text-center space-y-2">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            No advance fund sections created yet.
          </p>
          <button
            onClick={() => setActiveTab('expenses')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Advance Fund</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {safeAdvance.slice(0, 3).map((sec) => {
            const secExpenses = safeExpenses.filter(
              (e) => e.is_advance_deduction && e.advance_section_id === sec.id
            );
            const spent = secExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
            const allocated = sec.total_allocated || 0;
            const remaining = Math.max(0, allocated - spent);
            const percentUsed = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;

            return (
              <div
                key={sec.id}
                className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/60 dark:border-stone-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: sec.color || '#10B981' }}
                    />
                    <span className="font-semibold text-xs text-stone-800 dark:text-stone-200">
                      {sec.name}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-stone-900 dark:text-stone-100">
                    {currency}{remaining.toFixed(2)} left
                  </span>
                </div>

                <div className="w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${percentUsed}%`,
                      backgroundColor: percentUsed > 85 ? '#EF4444' : sec.color || '#10B981',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400">
                  <span>Allocated: {currency}{allocated.toFixed(2)}</span>
                  <span>Spent: {currency}{spent.toFixed(2)} ({percentUsed}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
