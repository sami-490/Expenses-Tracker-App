import React from 'react';
import {
  PlusCircle,
  Receipt,
  CalendarDays,
  Settings,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { getTodayDateString } from '../../utils/date';

export const DashboardQuickShortcutsCard: React.FC = () => {
  const { setActiveTab, openEditor, expenses = [], advanceSections = [] } = useDiary();
  const todayStr = getTodayDateString();
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeAdvance = Array.isArray(advanceSections) ? advanceSections : [];

  return (
    <div className="bg-white dark:bg-stone-800/90 rounded-3xl border border-stone-200/80 dark:border-stone-700/80 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h2 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
            Quick Actions
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Log Expense Button */}
        <button
          onClick={() => setActiveTab('expenses')}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-stone-800 dark:text-stone-200 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
            <Receipt className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-xs text-stone-900 dark:text-stone-100 flex items-center justify-between">
              <span>Expenses & Advance</span>
              <ArrowRight className="w-3 h-3 text-amber-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
              {safeExpenses.length} transactions logged
            </div>
          </div>
        </button>

        {/* View Calendar Button */}
        <button
          onClick={() => setActiveTab('calendar')}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/60 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-xs text-stone-900 dark:text-stone-100 flex items-center justify-between">
              <span>Calendar View</span>
              <ArrowRight className="w-3 h-3 text-blue-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
              Monthly overview & memory
            </div>
          </div>
        </button>

        {/* Advance Ledger Button */}
        <button
          onClick={() => setActiveTab('expenses')}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/60 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
            <PlusCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-xs text-stone-900 dark:text-stone-100 flex items-center justify-between">
              <span>Advance Funds</span>
              <ArrowRight className="w-3 h-3 text-emerald-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
              {safeAdvance.length} active funds
            </div>
          </div>
        </button>

        {/* Security & Settings Button */}
        <button
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/60 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-stone-700 dark:bg-stone-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
            <Settings className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-xs text-stone-900 dark:text-stone-100 flex items-center justify-between">
              <span>Settings & Sync</span>
              <ArrowRight className="w-3 h-3 text-stone-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
              Security, themes & backup
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
