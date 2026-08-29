import React, { useState } from 'react';
import {
  BookOpen,
  Flame,
  Plus,
  Lock,
  Moon,
  Sun,
  ShieldCheck,
  Bell,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useDiary } from '../context/DiaryContext';
import { getTodayDateString, formatHumanDate } from '../utils/date';

interface HeaderProps {
  onOpenReminders: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenReminders }) => {
  const {
    diaryStreak,
    openEditor,
    lockApp,
    settings,
    updateSettings,
    entries,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
  } = useDiary();

  const todayStr = getTodayDateString();
  const hasEntryToday = entries.some((e) => e.date === todayStr);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : settings.theme === 'dark' ? 'sepia' : 'light';
    updateSettings({ theme: nextTheme });
  };

  return (
    <header className="sticky top-0 z-30 bg-stone-50/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Brand & Date */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 tracking-tight leading-none">
                    Daily Diary
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3" />
                    Offline
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  {formatHumanDate(todayStr)}
                </p>
              </div>
            </button>

            {/* Streak Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                diaryStreak.current > 0
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700'
              }`}
              title={`Current streak: ${diaryStreak.current} days (Best: ${diaryStreak.longest} days)`}
            >
              <Flame
                className={`w-4 h-4 ${
                  diaryStreak.current > 0 ? 'text-amber-500 fill-amber-500 animate-pulse' : 'text-stone-400'
                }`}
              />
              <span>
                {diaryStreak.current} {diaryStreak.current === 1 ? 'day' : 'days'} streak
              </span>
            </div>
          </div>

          {/* Center Search (Expandable or desktop) */}
          <div className="hidden md:flex flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search entries, thoughts, tags..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value && activeTab !== 'entries') {
                    setActiveTab('entries');
                  }
                }}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search icon on mobile */}
            <button
              onClick={() => {
                setShowSearchInput(!showSearchInput);
                if (activeTab !== 'entries') setActiveTab('entries');
              }}
              className="md:hidden p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Reminders button */}
            <button
              onClick={onOpenReminders}
              className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors relative"
              title="Daily Reminders & Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500"></span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title={`Theme: ${settings.theme} (Click to switch)`}
            >
              {settings.theme === 'dark' || settings.theme === 'midnight' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-stone-600" />
              )}
            </button>

            {/* PIN Lock button if enabled */}
            {settings.is_pin_enabled && (
              <button
                onClick={lockApp}
                className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title="Lock Diary"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}

            {/* Primary Action Button */}
            <button
              onClick={() => openEditor(todayStr)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-medium text-xs sm:text-sm shadow-sm shadow-amber-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {hasEntryToday ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-amber-200" />
                  <span>Edit Today</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Write Today</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Expandable Bar */}
        {showSearchInput && (
          <div className="md:hidden pb-3 pt-1">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search entries, thoughts, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
