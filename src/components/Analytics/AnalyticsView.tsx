import React, { useState, useMemo } from 'react';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Printer,
  Calendar,
  Filter,
  DollarSign,
  CreditCard,
  Building2,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { IconRenderer } from '../common/IconRenderer';

type TimeFilter = 'this_month' | 'last_month' | 'this_year' | 'all';

export const AnalyticsView: React.FC = () => {
  const { expenses, advanceSections, advanceDeposits, settings, showToast } = useDiary();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('this_month');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const currencySymbol = settings.currency || 'Rs ';

  // Filter expenses by selected time range
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return expenses.filter((item) => {
      if (selectedCategoryFilter !== 'all' && item.category !== selectedCategoryFilter) {
        return false;
      }

      if (!item.date) return true;
      const d = new Date(item.date);
      if (isNaN(d.getTime())) return true;

      if (timeFilter === 'this_month') {
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      }
      if (timeFilter === 'last_month') {
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        return d.getFullYear() === lastMonthYear && d.getMonth() === lastMonth;
      }
      if (timeFilter === 'this_year') {
        return d.getFullYear() === currentYear;
      }
      return true;
    });
  }, [expenses, timeFilter, selectedCategoryFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let totalExpense = 0;
    let totalIncome = 0;
    const categoryTotals: Record<string, number> = {};
    const paymentTotals: Record<string, number> = {};

    filteredExpenses.forEach((item) => {
      const amt = Number(item.amount) || 0;
      if (item.type === 'income') {
        totalIncome += amt;
      } else {
        totalExpense += amt;
        categoryTotals[item.category] = (categoryTotals[item.category] || 0) + amt;
        const pm = item.payment_method || 'other';
        paymentTotals[pm] = (paymentTotals[pm] || 0) + amt;
      }
    });

    const netCashflow = totalIncome - totalExpense;

    // Top Category
    let topCategory = 'None';
    let topCategoryAmount = 0;
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > topCategoryAmount) {
        topCategoryAmount = amt;
        topCategory = cat;
      }
    });

    return {
      totalExpense,
      totalIncome,
      netCashflow,
      topCategory,
      topCategoryAmount,
      categoryTotals,
      paymentTotals,
      count: filteredExpenses.length,
    };
  }, [filteredExpenses]);

  // Category Budgets Health
  const categoryBudgetsHealth = useMemo(() => {
    const budgets = settings.category_budgets || [];
    return budgets.map((b) => {
      const spent = metrics.categoryTotals[b.category] || 0;
      const limit = b.monthly_limit || 1;
      const percentage = Math.min(Math.round((spent / limit) * 100), 999);
      const isOver = spent > limit;
      const isNear = spent >= limit * 0.8 && !isOver;

      return {
        category: b.category,
        limit,
        spent,
        percentage,
        isOver,
        isNear,
      };
    });
  }, [settings.category_budgets, metrics.categoryTotals]);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      showToast('No transaction data to export', 'info');
      return;
    }

    const headers = ['ID', 'Date', 'Title', 'Type', 'Amount', 'Category', 'Payment Method', 'Is Advance Deduction', 'Notes'];
    const rows = filteredExpenses.map((e) => [
      `"${e.id}"`,
      `"${e.date}"`,
      `"${(e.title || '').replace(/"/g, '""')}"`,
      `"${e.type}"`,
      e.amount,
      `"${e.category}"`,
      `"${e.payment_method}"`,
      e.is_advance_deduction ? 'Yes' : 'No',
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Financial_Report_${timeFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('CSV Financial Report downloaded successfully!', 'success');
  };

  // Printable Financial Statement Window
  const handlePrintStatement = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Pop-up blocked! Please allow pop-ups to print statement', 'error');
      return;
    }

    const rowsHtml = filteredExpenses
      .map(
        (e) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px;">${e.date}</td>
        <td style="padding: 10px; font-weight: 600;">${e.title}</td>
        <td style="padding: 10px;">${e.category}</td>
        <td style="padding: 10px; text-transform: uppercase;">${e.payment_method.replace('_', ' ')}</td>
        <td style="padding: 10px; text-align: right; color: ${e.type === 'income' ? '#059669' : '#dc2626'}; font-weight: 600;">
          ${e.type === 'income' ? '+' : '-'}${currencySymbol}${e.amount.toLocaleString()}
        </td>
      </tr>
    `
      )
      .join('');

    const htmlStr = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Financial Ledger Statement - ${settings.user_name || 'Expenses Tracker'}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #cbd5e1; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: 700; color: #0f172a; }
            .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
            .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; }
            .card-label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; }
            .card-val { font-size: 20px; font-weight: 700; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
            th { background: #f1f5f9; text-align: left; padding: 10px; font-weight: 700; color: #475569; border-bottom: 2px solid #cbd5e1; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">${settings.user_name || 'User'} - Financial Statement</div>
              <div class="subtitle">Generated on ${new Date().toLocaleDateString()} | Filter: ${timeFilter.replace('_', ' ').toUpperCase()}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: 700; color: #d97706;">EXPENSE TRACKER PRO</div>
              <div style="font-size: 11px; color: #64748b;">Verified Statement Ledger</div>
            </div>
          </div>

          <div class="summary-cards">
            <div class="card">
              <div class="card-label">Total Expenses</div>
              <div class="card-val" style="color: #dc2626;">${currencySymbol}${metrics.totalExpense.toLocaleString()}</div>
            </div>
            <div class="card">
              <div class="card-label">Total Income</div>
              <div class="card-val" style="color: #059669;">${currencySymbol}${metrics.totalIncome.toLocaleString()}</div>
            </div>
            <div class="card">
              <div class="card-label">Net Cashflow</div>
              <div class="card-val" style="color: ${metrics.netCashflow >= 0 ? '#059669' : '#dc2626'};">${currencySymbol}${metrics.netCashflow.toLocaleString()}</div>
            </div>
          </div>

          <h3>Transaction Ledger (${filteredExpenses.length} Records)</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Payment Method</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <div>Official Expenses & Advance Ledger Report</div>
            <div>Signature / Approval: _____________________</div>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlStr);
    printWindow.document.close();
    showToast('Printable financial statement opened!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/70 dark:bg-stone-900/70 backdrop-blur-md p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <BarChart3 className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Analytics & Financial Reports
            </h1>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Comprehensive financial breakdown, budget health, and ledger statement generator.
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Filter Pills */}
          <div className="inline-flex p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl border border-stone-200/60 dark:border-stone-700/60 text-xs font-medium">
            {(
              [
                { id: 'this_month', label: 'This Month' },
                { id: 'last_month', label: 'Last Month' },
                { id: 'this_year', label: 'This Year' },
                { id: 'all', label: 'All Time' },
              ] as const
            ).map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeFilter(tf.id)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  timeFilter === tf.id
                    ? 'bg-amber-500 text-white shadow-sm font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
            title="Export transactions to CSV spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          {/* Print Statement Button */}
          <button
            onClick={handlePrintStatement}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-all"
            title="Generate printable PDF financial statement"
          >
            <Printer className="w-4 h-4" />
            <span>Statement</span>
          </button>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expense */}
        <div className="bg-white/80 dark:bg-stone-900/80 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-stone-400">
            <span>TOTAL EXPENSE</span>
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100">
            {currencySymbol}
            {metrics.totalExpense.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
            <span className="font-semibold text-rose-600 dark:text-rose-400">{metrics.count}</span> records in this period
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white/80 dark:bg-stone-900/80 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-stone-400">
            <span>TOTAL INCOME</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {currencySymbol}
            {metrics.totalIncome.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-stone-500 dark:text-stone-400">
            Inflow revenue logged
          </div>
        </div>

        {/* Net Savings / Cashflow */}
        <div className="bg-white/80 dark:bg-stone-900/80 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-stone-400">
            <span>NET CASHFLOW</span>
            <span
              className={`p-2 rounded-xl ${
                metrics.netCashflow >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div
            className={`mt-2 text-2xl sm:text-3xl font-extrabold ${
              metrics.netCashflow >= 0 ? 'text-stone-900 dark:text-stone-100' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {metrics.netCashflow < 0 ? '-' : ''}
            {currencySymbol}
            {Math.abs(metrics.netCashflow).toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-stone-500 dark:text-stone-400">
            {metrics.netCashflow >= 0 ? 'Positive liquidity ratio' : 'Negative balance deficit'}
          </div>
        </div>

        {/* Top Spending Category */}
        <div className="bg-white/80 dark:bg-stone-900/80 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-stone-400">
            <span>HIGHEST EXPENSE CAT</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-stone-900 dark:text-stone-100 truncate">
            {metrics.topCategory}
          </div>
          <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">
            {currencySymbol}
            {metrics.topCategoryAmount.toLocaleString()} total spent
          </div>
        </div>
      </div>

      {/* Main Grid: Category Breakdown & Budget Health Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Category Spending Breakdown */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-stone-900/80 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-amber-500" />
                Category Expense Distribution
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Visual percentage share of expenses grouped by category
              </p>
            </div>
            {/* Category Filter */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-medium text-stone-900 dark:text-stone-100"
            >
              <option value="all">All Categories</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {metrics.totalExpense === 0 ? (
            <div className="py-12 text-center text-stone-400 dark:text-stone-500 text-sm">
              No expense records found for this period. Add expenses to view visual distribution.
            </div>
          ) : (
            <div className="space-y-4">
              {EXPENSE_CATEGORIES.map((cat) => {
                const amount = metrics.categoryTotals[cat.name] || 0;
                if (amount === 0 && selectedCategoryFilter !== 'all') return null;

                const percent = metrics.totalExpense > 0 ? Math.round((amount / metrics.totalExpense) * 100) : 0;

                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: cat.color }}
                        >
                          <IconRenderer name={cat.icon} className="w-4 h-4" />
                        </span>
                        <span className="font-semibold">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-stone-500 dark:text-stone-400 text-xs font-mono">{percent}%</span>
                        <span className="font-bold">
                          {currencySymbol}
                          {amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: cat.color,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Category Budget Health Tracker */}
        <div className="bg-white/80 dark:bg-stone-900/80 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-5">
          <div className="border-b border-stone-200/60 dark:border-stone-800 pb-4">
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Budget Health & Limits
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Monthly targets vs actual category spending
            </p>
          </div>

          {categoryBudgetsHealth.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-400 dark:text-stone-500">
              No category budget limits set. Configure budget limits in Settings.
            </div>
          ) : (
            <div className="space-y-4">
              {categoryBudgetsHealth.map((b) => (
                <div
                  key={b.category}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    b.isOver
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : b.isNear
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-stone-50/50 dark:bg-stone-800/40 border-stone-200/60 dark:border-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      {b.isOver && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                      {b.isNear && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      {!b.isOver && !b.isNear && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                      {b.category}
                    </span>
                    <span
                      className={`font-mono ${
                        b.isOver
                          ? 'text-rose-600 dark:text-rose-400'
                          : b.isNear
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-stone-500 dark:text-stone-400'
                      }`}
                    >
                      {b.percentage}%
                    </span>
                  </div>

                  <div className="mt-2 w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        b.isOver ? 'bg-rose-500' : b.isNear ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    ></div>
                  </div>

                  <div className="mt-2 flex justify-between text-[11px] text-stone-500 dark:text-stone-400">
                    <span>
                      Spent: {currencySymbol}
                      {b.spent.toLocaleString()}
                    </span>
                    <span>
                      Limit: {currencySymbol}
                      {b.limit.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Method Distribution & Advance Fund Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-white/80 dark:bg-stone-900/80 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-500" />
            Payment Channel Breakdown
          </h3>
          <div className="space-y-3">
            {[
              { key: 'cash', label: 'Cash Payment' },
              { key: 'upi', label: 'UPI / Online Transfer' },
              { key: 'card', label: 'Credit / Debit Card' },
              { key: 'advance_balance', label: 'Advance Fund Balance' },
              { key: 'bank_transfer', label: 'Direct Bank Wire' },
              { key: 'other', label: 'Other' },
            ].map((pm) => {
              const amt = metrics.paymentTotals[pm.key] || 0;
              if (amt === 0) return null;

              const percent = metrics.totalExpense > 0 ? Math.round((amt / metrics.totalExpense) * 100) : 0;

              return (
                <div key={pm.key} className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50">
                  <div>
                    <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">{pm.label}</div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">{percent}% of total expenses</div>
                  </div>
                  <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {currencySymbol}
                    {amt.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Advance Fund Balances Summary */}
        <div className="bg-white/80 dark:bg-stone-900/80 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            Advance Ledger Status
          </h3>

          {advanceSections.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-400 dark:text-stone-500">
              No advance funds created yet. Manage advance sections in the Expenses tab.
            </div>
          ) : (
            <div className="space-y-3">
              {advanceSections.map((sec) => {
                const totalSpentFromAdv = expenses
                  .filter((e) => e.advance_section_id === sec.id)
                  .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

                const remaining = sec.total_allocated - totalSpentFromAdv;

                return (
                  <div key={sec.id} className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">{sec.name}</span>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Balance: {currencySymbol}
                        {remaining.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-stone-500 dark:text-stone-400">
                      <span>Total Allocated: {currencySymbol}{sec.total_allocated.toLocaleString()}</span>
                      <span>Spent: {currencySymbol}{totalSpentFromAdv.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
