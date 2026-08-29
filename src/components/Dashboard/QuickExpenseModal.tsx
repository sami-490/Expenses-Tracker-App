import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Receipt,
  Wallet,
  CreditCard,
  Banknote,
  Building,
  Check,
  Tag,
  Calendar,
  FileText,
  Plus,
} from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { ExpenseItem, PaymentMethod } from '../../types';
import { getTodayDateString } from '../../utils/date';
import { EXPENSE_CATEGORIES, DEFAULT_SETTINGS } from '../../utils/constants';

interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickExpenseModal: React.FC<QuickExpenseModalProps> = ({ isOpen, onClose }) => {
  const {
    saveExpense,
    advanceSections = [],
    expenses = [],
    settings = DEFAULT_SETTINGS,
  } = useDiary();

  const safeAdvance = Array.isArray(advanceSections) ? advanceSections : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const currency = settings?.currency || 'PKR ';

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].name);
  const [date, setDate] = useState(getTodayDateString());
  const [isAdvanceDeduction, setIsAdvanceDeduction] = useState(false);
  const [advanceSectionId, setAdvanceSectionId] = useState(safeAdvance[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (!title.trim()) {
      setError('Please provide a title or description');
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (isAdvanceDeduction && !advanceSectionId) {
      setError('Please select an advance fund to deduct from');
      return;
    }

    const newExpense: ExpenseItem = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: title.trim(),
      amount: numAmount,
      date: date || getTodayDateString(),
      category,
      type: 'expense',
      payment_method: isAdvanceDeduction ? 'advance_balance' : paymentMethod,
      is_advance_deduction: isAdvanceDeduction,
      advance_section_id: isAdvanceDeduction ? advanceSectionId : null,
      notes: notes.trim() || undefined,
      created_at: Date.now(),
    };

    saveExpense(newExpense);
    setIsSaved(true);

    setTimeout(() => {
      setIsSaved(false);
      setTitle('');
      setAmount('');
      setNotes('');
      setError(null);
      onClose();
    }, 400);
  };

  const selectedAdvance = safeAdvance.find((s) => s.id === advanceSectionId);
  const selectedAdvSpent = selectedAdvance
    ? safeExpenses
        .filter((e) => e.is_advance_deduction && e.advance_section_id === selectedAdvance.id)
        .reduce((sum, item) => sum + (item.amount || 0), 0)
    : 0;
  const selectedAdvRemaining = selectedAdvance
    ? Math.max(0, (selectedAdvance.total_allocated || 0) - selectedAdvSpent)
    : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden z-10 my-auto"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-sm font-bold">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                  Quick Log Expense
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Record an instant transaction in {currency.trim()}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Amount Field (Hero numeric input) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                Amount ({currency.trim()})
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-mono font-bold text-lg text-amber-600 dark:text-amber-400 pointer-events-none">
                  {currency}
                </span>
                <input
                  type="number"
                  step="any"
                  autoFocus
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError(null);
                  }}
                  className="w-full pl-20 pr-4 py-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900 dark:text-stone-100 font-mono font-bold text-2xl placeholder-stone-400 dark:placeholder-stone-600"
                />
              </div>
            </div>

            {/* Title / Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                Description / Title
              </label>
              <input
                type="text"
                placeholder="e.g. Office lunch, Fuel refuel, Groceries, Uber..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError(null);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900 dark:text-stone-100 text-sm placeholder-stone-400 dark:placeholder-stone-500"
              />
            </div>

            {/* Category & Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-amber-500" />
                  <span>Category</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900 dark:text-stone-100 text-xs font-medium"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-500" />
                  <span>Date</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900 dark:text-stone-100 text-xs font-medium"
                />
              </div>
            </div>

            {/* Payment Source / Advance Toggle */}
            <div className="pt-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                Payment Source
              </label>

              <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsAdvanceDeduction(false)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    !isAdvanceDeduction
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  Direct Payment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdvanceDeduction(true);
                    if (safeAdvance.length > 0 && !advanceSectionId) {
                      setAdvanceSectionId(safeAdvance[0].id);
                    }
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    isAdvanceDeduction
                      ? 'bg-emerald-500 text-stone-950 shadow-sm font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  Deduct from Advance
                </button>
              </div>

              {!isAdvanceDeduction ? (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { id: 'cash' as const, label: 'Cash', icon: Banknote },
                    { id: 'card' as const, label: 'Card', icon: CreditCard },
                    { id: 'bank_transfer' as const, label: 'Bank/App', icon: Building },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500/80 text-amber-900 dark:text-amber-200 font-semibold'
                            : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700/70 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : safeAdvance.length === 0 ? (
                <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-300">
                  No advance fund sections found. You can create one in the full Expenses & Advance tab.
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  <select
                    value={advanceSectionId}
                    onChange={(e) => setAdvanceSectionId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-medium"
                  >
                    {safeAdvance.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>

                  {selectedAdvance && (
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-[11px] text-emerald-800 dark:text-emerald-300">
                      <span>Available in {selectedAdvance.name}:</span>
                      <span className="font-mono font-bold">
                        {currency}{selectedAdvRemaining.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5 flex items-center gap-1">
                <FileText className="w-3 h-3 text-stone-400" />
                <span>Notes (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="Reference / invoice number or note..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900 dark:text-stone-100 text-xs placeholder-stone-400 dark:placeholder-stone-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaved}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-950 text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Save Expense</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
