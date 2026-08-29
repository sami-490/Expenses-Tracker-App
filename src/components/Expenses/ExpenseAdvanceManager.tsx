import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Building,
  Calendar,
  Tag,
  Trash2,
  PieChart as PieChartIcon,
  Sparkles,
  TrendingDown,
  Layers,
  ChevronDown,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { ExpenseItem, AdvanceSection, PaymentMethod } from '../../types';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { formatHumanDate, getTodayDateString } from '../../utils/date';
import { triggerConfetti } from '../../utils/confetti';

export const ExpenseAdvanceManager: React.FC = () => {
  const {
    expenses = [],
    advanceSections = [],
    advanceDeposits = [],
    saveExpense,
    deleteExpense,
    createAdvanceSection,
    updateAdvanceSection,
    deleteAdvanceSection,
    addAdvanceDeposit,
    deleteAdvanceDeposit,
    settings,
  } = useDiary();

  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeAdvanceSections = Array.isArray(advanceSections) ? advanceSections : [];
  const safeAdvanceDeposits = Array.isArray(advanceDeposits) ? advanceDeposits : [];

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'advance' | 'categories'>('all');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddAdvanceModal, setShowAddAdvanceModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState<string | null>(null); // sectionId
  const [selectedAdvanceFilter, setSelectedAdvanceFilter] = useState<string | 'all'>('all');

  // Form states for new Expense
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(getTodayDateString());
  const [expCategory, setExpCategory] = useState(EXPENSE_CATEGORIES[0].name);
  const [expMethod, setExpMethod] = useState<PaymentMethod>('card');
  const [expIsAdvance, setExpIsAdvance] = useState(false);
  const [expAdvanceSecId, setExpAdvanceSecId] = useState(safeAdvanceSections[0]?.id || '');
  const [expNotes, setExpNotes] = useState('');

  // Form states for new Advance Section
  const [advName, setAdvName] = useState('');
  const [advInitialAmount, setAdvInitialAmount] = useState('');
  const [advColor, setAdvColor] = useState('#3B82F6');
  const [advDesc, setAdvDesc] = useState('');

  // Deposit Form
  const [depAmount, setDepAmount] = useState('');
  const [depSource, setDepSource] = useState('Employer/Client Deposit');
  const [depDate, setDepDate] = useState(getTodayDateString());
  const [depNotes, setDepNotes] = useState('');

  // Calculations
  const currency = settings?.currency || 'PKR ';

  const totalSpent = safeExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalAdvanceAllocated = safeAdvanceSections.reduce((acc, curr) => acc + (curr.total_allocated || 0), 0);
  
  const advanceExpenses = safeExpenses.filter((e) => e.is_advance_deduction && e.advance_section_id);
  const totalAdvanceSpent = advanceExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalRemainingAdvance = Math.max(0, totalAdvanceAllocated - totalAdvanceSpent);

  // Filtered expenses
  const displayedExpenses = safeExpenses.filter((e) => {
    if (selectedAdvanceFilter === 'all') return true;
    if (selectedAdvanceFilter === 'non_advance') return !e.is_advance_deduction;
    return e.advance_section_id === selectedAdvanceFilter;
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(expAmount);
    if (!expTitle.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newExpense: ExpenseItem = {
      id: `exp_${Date.now()}`,
      title: expTitle.trim(),
      amount: parsedAmount,
      date: expDate,
      category: expCategory,
      type: 'expense',
      payment_method: expIsAdvance ? 'advance_balance' : expMethod,
      is_advance_deduction: expIsAdvance,
      advance_section_id: expIsAdvance ? expAdvanceSecId : null,
      notes: expNotes.trim(),
      created_at: Date.now(),
    };

    saveExpense(newExpense);
    triggerConfetti();

    // Reset
    setExpTitle('');
    setExpAmount('');
    setExpNotes('');
    setShowAddExpenseModal(false);
  };

  const handleCreateAdvanceSection = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedInitial = parseFloat(advInitialAmount) || 0;
    if (!advName.trim()) return;

    createAdvanceSection(advName.trim(), parsedInitial, advColor, 'Briefcase', advDesc.trim());
    triggerConfetti();

    setAdvName('');
    setAdvInitialAmount('');
    setAdvDesc('');
    setShowAddAdvanceModal(false);
  };

  const handleAddDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDepositModal) return;
    const parsed = parseFloat(depAmount);
    if (isNaN(parsed) || parsed <= 0) return;

    addAdvanceDeposit(showDepositModal, parsed, depDate, depSource, depNotes);
    setDepAmount('');
    setDepNotes('');
    setShowDepositModal(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Financial Tracking
            </span>
            <span className="text-xs text-stone-400">Advance Budgets & Daily Spends</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-50">
            Expenses & Advance Manager
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
            Keep track of personal payments, company advances, travel allowances, and real-time remaining balances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setShowAddAdvanceModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs sm:text-sm font-medium transition-all"
          >
            <Building className="w-4 h-4 text-amber-400" />
            <span>+ New Advance Fund</span>
          </button>

          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 text-xs sm:text-sm font-bold shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Expenses */}
        <div className="bg-white dark:bg-stone-800/90 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-700/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">
            {currency}{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            Across {safeExpenses.length} transaction entries
          </p>
        </div>

        {/* Total Advance Allocated */}
        <div className="bg-white dark:bg-stone-800/90 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-700/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Total Advance Received
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
            {currency}{totalAdvanceAllocated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            Across {safeAdvanceSections.length} advance funds
          </p>
        </div>

        {/* Remaining Advance Balance */}
        <div className="bg-white dark:bg-stone-800/90 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-700/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Remaining Advance Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {currency}{totalRemainingAdvance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{
                  width: `${
                    totalAdvanceAllocated > 0
                      ? Math.min(100, Math.round((totalRemainingAdvance / totalAdvanceAllocated) * 100))
                      : 0
                  }%`,
                }}
              />
            </div>
            <span className="text-[10px] text-stone-400 font-mono">
              {totalAdvanceAllocated > 0
                ? `${Math.round((totalRemainingAdvance / totalAdvanceAllocated) * 100)}% left`
                : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Advance Sections Cards Carousel / Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-500" />
            <span>Advance Payment Sections</span>
          </h2>
          <button
            onClick={() => setShowAddAdvanceModal(true)}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Section</span>
          </button>
        </div>

        {advanceSections.length === 0 ? (
          <div className="p-8 rounded-3xl border-2 border-dashed border-stone-300 dark:border-stone-700 text-center space-y-3 bg-stone-50 dark:bg-stone-800/40">
            <Building className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="font-semibold text-stone-800 dark:text-stone-200">No Advance Sections Setup</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Create dedicated sections for company advances, travel allowances, project deposits, or client upfront balances to deduct expenses automatically.
            </p>
            <button
              onClick={() => setShowAddAdvanceModal(true)}
              className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold"
            >
              Setup First Advance Section
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeAdvanceSections.map((sec) => {
              const secExpenses = safeExpenses.filter(
                (e) => e.is_advance_deduction && e.advance_section_id === sec.id
              );
              const secSpent = secExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
              const secRemaining = Math.max(0, (sec.total_allocated || 0) - secSpent);
              const percentUsed =
                (sec.total_allocated || 0) > 0 ? Math.min(100, Math.round((secSpent / sec.total_allocated) * 100)) : 0;

              return (
                <div
                  key={sec.id}
                  className="bg-white dark:bg-stone-800/90 rounded-3xl border border-stone-200/80 dark:border-stone-700/80 p-5 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: sec.color || '#3B82F6' }}
                  />

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                        {sec.name}
                      </h3>
                      {sec.description && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                          {sec.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteAdvanceSection(sec.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-stone-500">Remaining Balance:</span>
                      <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {currency}{secRemaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="w-full bg-stone-100 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentUsed}%`,
                          backgroundColor: percentUsed > 90 ? '#EF4444' : sec.color || '#3B82F6',
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-400">
                      <span>Spent: {currency}{secSpent.toFixed(2)} ({percentUsed}%)</span>
                      <span>Total: {currency}{sec.total_allocated.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-700/60">
                    <button
                      onClick={() => {
                        setShowDepositModal(sec.id);
                        setDepSource(`Deposit into ${sec.name}`);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-700/60 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
                      <span>+ Add Deposit</span>
                    </button>

                    <button
                      onClick={() => {
                        setExpIsAdvance(true);
                        setExpAdvanceSecId(sec.id);
                        setShowAddExpenseModal(true);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-amber-200 dark:border-amber-800/60"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
                      <span>Spend Here</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Expense Ledger */}
      <div className="bg-white dark:bg-stone-800/90 rounded-3xl border border-stone-200/80 dark:border-stone-700/80 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-500" />
              <span>Expense History & Transactions</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Filtered records showing date, payment method, category, and advance deduct status.
            </p>
          </div>

          {/* Section Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedAdvanceFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                selectedAdvanceFilter === 'all'
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setSelectedAdvanceFilter('non_advance')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                selectedAdvanceFilter === 'non_advance'
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              Direct Spends
            </button>
            {safeAdvanceSections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSelectedAdvanceFilter(sec.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  selectedAdvanceFilter === sec.id
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sec.color }} />
                <span>{sec.name}</span>
              </button>
            ))}
          </div>
        </div>

        {displayedExpenses.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-stone-200/60 dark:border-stone-800">
            <Receipt className="w-8 h-8 text-stone-400 mx-auto" />
            <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
              No transactions recorded for this filter.
            </p>
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-all"
            >
              + Add Transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 text-xs font-semibold">
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Description</th>
                  <th className="pb-3 px-3">Category</th>
                  <th className="pb-3 px-3">Fund / Source</th>
                  <th className="pb-3 px-3 text-right">Amount</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {displayedExpenses.map((exp) => {
                  const linkedAdv = safeAdvanceSections.find((s) => s.id === exp.advance_section_id);
                  return (
                    <tr
                      key={exp.id}
                      className="hover:bg-stone-50/80 dark:hover:bg-stone-800/50 transition-colors group"
                    >
                      <td className="py-3.5 px-3 font-mono text-xs text-stone-500 whitespace-nowrap">
                        {formatHumanDate(exp.date)}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-stone-900 dark:text-stone-100">
                          {exp.title}
                        </div>
                        {exp.notes && (
                          <div className="text-xs text-stone-400 line-clamp-1">{exp.notes}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        {exp.is_advance_deduction && linkedAdv ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: `${linkedAdv.color}20`,
                              color: linkedAdv.color,
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: linkedAdv.color }} />
                            <span>{linkedAdv.name}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-stone-500 uppercase tracking-wider font-mono">
                            {exp.payment_method}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-stone-900 dark:text-stone-100 whitespace-nowrap">
                        -{currency}{exp.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Add Expense */}
      <AnimatePresence>
        {showAddExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-700 shadow-2xl max-w-lg w-full p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-amber-500" />
                  <span>Record New Expense</span>
                </h3>
                <button
                  onClick={() => setShowAddExpenseModal(false)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateExpense} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Expense Title / Item
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Taxi to Airport, Client Dinner, Stationery..."
                    value={expTitle}
                    onChange={(e) => setExpTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Amount ({currency})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="0.00"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm font-mono rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Category
                  </label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500/40"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Advance Fund Toggle */}
                <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={expIsAdvance}
                        onChange={(e) => setExpIsAdvance(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                      />
                      <span className="text-xs font-semibold text-amber-950 dark:text-amber-200">
                        Deduct from Advance Payment Fund
                      </span>
                    </label>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                      Auto-balances advance
                    </span>
                  </div>

                  {expIsAdvance && (
                    <div className="pt-2">
                      <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-300 mb-1">
                        Select Advance Section:
                      </label>
                      <select
                        value={expAdvanceSecId}
                        onChange={(e) => setExpAdvanceSecId(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700"
                      >
                        {safeAdvanceSections.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} (Balance: {currency}
                            {(
                              (s.total_allocated || 0) -
                              safeExpenses
                                .filter((x) => x.is_advance_deduction && x.advance_section_id === s.id)
                                .reduce((acc, curr) => acc + (curr.amount || 0), 0)
                            ).toFixed(2)}
                            )
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {!expIsAdvance && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={expMethod}
                      onChange={(e) => setExpMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                    >
                      <option value="card">Credit / Debit Card</option>
                      <option value="cash">Cash in Hand</option>
                      <option value="bank_transfer">Bank Transfer / Wire</option>
                      <option value="upi">UPI / Mobile Wallet</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Notes / Reference (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Invoice #, attendee names, store..."
                    value={expNotes}
                    onChange={(e) => setExpNotes(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setShowAddExpenseModal(false)}
                    className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm"
                  >
                    Save Expense
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Add Advance Section */}
      <AnimatePresence>
        {showAddAdvanceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-700 shadow-2xl max-w-md w-full p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-500" />
                  <span>Create Advance Fund Section</span>
                </h3>
                <button
                  onClick={() => setShowAddAdvanceModal(false)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAdvanceSection} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Section Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Project Apollo Advance, Travel Budget..."
                    value={advName}
                    onChange={(e) => setAdvName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Initial Advance Amount ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={advInitialAmount}
                    onChange={(e) => setAdvInitialAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-mono rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Theme Color
                  </label>
                  <div className="flex items-center gap-2">
                    {['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'].map((color) => (
                      <button
                        type="button"
                        key={color}
                        onClick={() => setAdvColor(color)}
                        className={`w-7 h-7 rounded-full transition-transform ${
                          advColor === color ? 'scale-125 ring-2 ring-stone-900 dark:ring-white ring-offset-2' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Description / Purpose
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Received from manager for Q3 project expenditures"
                    value={advDesc}
                    onChange={(e) => setAdvDesc(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setShowAddAdvanceModal(false)}
                    className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
                  >
                    Create Section
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Add Deposit to Section */}
      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-700 shadow-2xl max-w-md w-full p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
                  <span>Add Advance Deposit</span>
                </h3>
                <button
                  onClick={() => setShowDepositModal(null)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddDeposit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Deposit Amount ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={depAmount}
                    onChange={(e) => setDepAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-mono rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={depDate}
                      onChange={(e) => setDepDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Source / Sender
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bank Transfer"
                      value={depSource}
                      onChange={(e) => setDepSource(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Reference number or note"
                    value={depNotes}
                    onChange={(e) => setDepNotes(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setShowDepositModal(null)}
                    className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
                  >
                    Confirm Deposit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
