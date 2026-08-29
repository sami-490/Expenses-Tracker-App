import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Receipt } from 'lucide-react';
import { TodayGreeting } from './TodayGreeting';
import { TodayExpensesSummaryCard } from './TodayExpensesSummaryCard';
import { AdvanceFundStatusCard } from './AdvanceFundStatusCard';
import { DashboardQuickShortcutsCard } from './DashboardQuickShortcutsCard';
import { ActivityHeatmapCard } from './ActivityHeatmapCard';
import { QuickExpenseModal } from './QuickExpenseModal';

export const DashboardView: React.FC = () => {
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative"
    >
      {/* Hero Greeting & Stats Banner */}
      <TodayGreeting />

      {/* Primary Action & Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Expenses & Advance Management */}
        <div className="lg:col-span-7 space-y-6">
          <TodayExpensesSummaryCard />
          <AdvanceFundStatusCard />
        </div>

        {/* Right Column: Quick Actions & Activity Calendar Heatmap */}
        <div className="lg:col-span-5 space-y-6">
          <DashboardQuickShortcutsCard />
          <ActivityHeatmapCard />
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={() => setIsQuickExpenseOpen(true)}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-30 flex items-center gap-2.5 pl-4 pr-5 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm sm:text-base rounded-full shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 border border-amber-300/60 dark:border-amber-400/40 transition-all cursor-pointer group"
        aria-label="Quick log expense"
        title="Quick log new expense"
      >
        <div className="w-6 h-6 rounded-full bg-stone-950 text-amber-400 flex items-center justify-center group-hover:rotate-90 transition-transform duration-200">
          <Plus className="w-4 h-4 stroke-[3]" />
        </div>
        <span className="tracking-tight">Quick Expense</span>
      </motion.button>

      {/* Quick Expense Modal */}
      <QuickExpenseModal
        isOpen={isQuickExpenseOpen}
        onClose={() => setIsQuickExpenseOpen(false)}
      />
    </motion.div>
  );
};
