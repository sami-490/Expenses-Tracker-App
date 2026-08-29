import React, { useState } from 'react';
import { DiaryProvider, useDiary } from './context/DiaryContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/Dashboard/DashboardView';
import { TimelineView } from './components/Timeline/TimelineView';
import { CalendarView } from './components/Calendar/CalendarView';
import { ExpenseAdvanceManager } from './components/Expenses/ExpenseAdvanceManager';
import { SettingsView } from './components/Settings/SettingsView';
import { EntryEditorModal } from './components/EntryEditor/EntryEditorModal';
import { EntryDetailModal } from './components/Timeline/EntryDetailModal';
import { RemindersModal } from './components/Reminders/RemindersModal';
import { LockScreen } from './components/LockScreen';

const MainApp: React.FC = () => {
  const {
    isLocked,
    activeTab,
    editorDate,
    selectedEntryDetail,
    setSelectedEntryDetail,
  } = useDiary();

  const [isRemindersOpen, setIsRemindersOpen] = useState(false);

  if (isLocked) {
    return <LockScreen />;
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-700 dark:selection:text-amber-300">
      {/* Top App Header */}
      <Header onOpenReminders={() => setIsRemindersOpen(true)} />

      {/* Navigation Tabs Bar */}
      <Navigation />

      {/* Dynamic Main View */}
      <main className="flex-1 pb-16 sm:pb-12">
        {activeTab === 'home' && <DashboardView />}
        {activeTab === 'entries' && <TimelineView />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'expenses' && <ExpenseAdvanceManager />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Global Modals */}
      {editorDate && <EntryEditorModal />}

      {selectedEntryDetail && (
        <EntryDetailModal
          entry={selectedEntryDetail}
          onClose={() => setSelectedEntryDetail(null)}
        />
      )}

      {isRemindersOpen && (
        <RemindersModal onClose={() => setIsRemindersOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <DiaryProvider>
      <MainApp />
    </DiaryProvider>
  );
}
