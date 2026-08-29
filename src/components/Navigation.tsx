import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Receipt,
  Settings,
} from 'lucide-react';
import { useDiary } from '../context/DiaryContext';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, expenses, advanceSections } = useDiary();

  const navItems = [
    { id: 'home' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'entries' as const, label: 'Journal', icon: BookOpen },
    { id: 'calendar' as const, label: 'Calendar', icon: CalendarDays },
    {
      id: 'expenses' as const,
      label: 'Expenses & Advance',
      icon: Receipt,
      badge: Array.isArray(expenses) && expenses.length > 0 ? `${expenses.length}` : undefined,
    },
    { id: 'settings' as const, label: 'Settings & Cloud', icon: Settings },
  ];

  return (
    <nav className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-t sm:border-t-0 sm:border-b border-stone-200/80 dark:border-stone-800 transition-colors z-20">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-around sm:justify-start sm:gap-2 h-14 sm:h-12 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap relative ${
                  isActive
                    ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 sm:shadow-sm font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform ${
                    isActive ? 'scale-110 text-amber-600 dark:text-amber-400' : ''
                  }`}
                />
                <span>{item.label}</span>
                {item.badge && !isActive && (
                  <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-mono">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-amber-500 ml-0.5"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
