import React, { useState } from 'react';
import {
  Bell,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { Reminder } from '../../types';

interface RemindersModalProps {
  onClose: () => void;
}

export const RemindersModal: React.FC<RemindersModalProps> = ({ onClose }) => {
  const { reminders, saveReminder, deleteReminder, toggleReminder } = useDiary();

  const [title, setTitle] = useState('');
  const [time, setTime] = useState('20:00');

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newReminder: Reminder = {
      id: `rem_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      title: title.trim(),
      time,
      repeat_days: 'daily',
      is_active: true,
    };

    saveReminder(newReminder);
    setTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-800 rounded-3xl border border-stone-200 dark:border-stone-700 w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                Daily Reminders & Habits
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Add Reminder Form */}
          <form onSubmit={handleAddReminder} className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-700 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
              Add New Daily Prompt
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-8">
                <input
                  type="text"
                  required
                  placeholder="e.g. Evening Reflection, Gratitude check..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="sm:col-span-4 flex items-center gap-1">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!title.trim()}
              className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Reminder</span>
            </button>
          </form>

          {/* Existing Reminders List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Active Schedules ({reminders.length})
            </h4>

            {reminders.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-4 text-center">
                No custom reminders created yet.
              </p>
            ) : (
              reminders.map((rem) => (
                <div
                  key={rem.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleReminder(rem.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                        rem.is_active
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'bg-stone-100 dark:bg-stone-700 border-stone-300 dark:border-stone-600'
                      }`}
                    >
                      {rem.is_active && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div>
                      <span
                        className={`text-xs sm:text-sm font-semibold block ${
                          rem.is_active
                            ? 'text-stone-900 dark:text-stone-100'
                            : 'text-stone-400 line-through'
                        }`}
                      >
                        {rem.title}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{rem.time}</span>
                        <span>•</span>
                        <span>Daily</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteReminder(rem.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
