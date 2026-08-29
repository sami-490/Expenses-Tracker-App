import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  Lock,
  Download,
  Upload,
  Sparkles,
  ShieldCheck,
  User,
  Trash2,
  CheckCircle2,
  Mail,
  Cloud,
  CloudUpload,
  CloudDownload,
  RefreshCw,
  LogOut,
  AlertCircle,
  Clock,
  Building,
  DollarSign,
} from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { GmailBackupMetadata } from '../../types';
import { IconRenderer } from '../common/IconRenderer';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    setPin,
    sections,
    deleteSectionTemplate,
    exportBackup,
    importBackup,
    resetAllData,
    gmailUser,
    isGmailConnecting,
    isGmailSyncing,
    connectGmail,
    disconnectGmail,
    backupToGmail,
    restoreFromGmailMessage,
    fetchGmailBackups,
  } = useDiary();

  const [userName, setUserName] = useState(settings.user_name || '');
  const [currency, setCurrency] = useState(settings.currency || 'PKR ');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMessage, setPinMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Gmail backup list state
  const [gmailBackups, setGmailBackups] = useState<GmailBackupMetadata[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [gmailStatusMsg, setGmailStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadGmailBackups = async () => {
    if (!gmailUser) return;
    setLoadingBackups(true);
    try {
      const list = await fetchGmailBackups();
      setGmailBackups(list);
    } catch (err: any) {
      console.warn('Failed to load Gmail backups:', err);
    } finally {
      setLoadingBackups(false);
    }
  };

  useEffect(() => {
    if (gmailUser) {
      loadGmailBackups();
    }
  }, [gmailUser]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ user_name: userName.trim(), currency });
    setPinMessage({ text: 'Profile and currency settings updated!', type: 'success' });
  };

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setPinMessage({ text: 'PIN must be exactly 4 digits.', type: 'error' });
      return;
    }
    if (newPin !== confirmPin) {
      setPinMessage({ text: 'PINs do not match.', type: 'error' });
      return;
    }

    await setPin(newPin);
    setNewPin('');
    setConfirmPin('');
    setPinMessage({ text: 'PIN lock enabled successfully!', type: 'success' });
  };

  const handleDisablePin = async () => {
    if (window.confirm('Are you sure you want to disable the PIN security lock?')) {
      await setPin(null);
      setPinMessage({ text: 'PIN lock disabled.', type: 'success' });
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackup(content);
        if (success) {
          setImportStatus('Backup restored successfully!');
        } else {
          setImportStatus('Failed to parse backup JSON. Please ensure it is a valid Daily Diary export.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleGmailConnect = async () => {
    try {
      setGmailStatusMsg(null);
      await connectGmail();
      setGmailStatusMsg({ text: 'Connected to Gmail successfully!', type: 'success' });
    } catch (err: any) {
      setGmailStatusMsg({ text: err.message || 'Failed to connect Gmail.', type: 'error' });
    }
  };

  const handleBackupNow = async () => {
    try {
      setGmailStatusMsg(null);
      await backupToGmail();
      setGmailStatusMsg({ text: 'Data successfully backed up to your Gmail!', type: 'success' });
      loadGmailBackups();
    } catch (err: any) {
      setGmailStatusMsg({ text: err.message || 'Gmail backup failed.', type: 'error' });
    }
  };

  const handleRestoreFromGmail = async (messageId: string) => {
    if (
      !window.confirm(
        'Restore data from this Gmail backup? This will update your local diary and expense logs.'
      )
    ) {
      return;
    }
    try {
      setGmailStatusMsg(null);
      await restoreFromGmailMessage(messageId);
      setGmailStatusMsg({ text: 'Data restored successfully from Gmail backup!', type: 'success' });
    } catch (err: any) {
      setGmailStatusMsg({ text: err.message || 'Failed to restore backup.', type: 'error' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
          Settings & Gmail Cloud Sync
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Sync data securely with your Gmail account, manage security PIN, expenses currency, and custom templates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Gmail Sync & Profile */}
        <div className="lg:col-span-6 space-y-6">
          {/* GMAIL SYNC CARD */}
          <div className="bg-white dark:bg-stone-800/90 rounded-3xl border border-stone-200/80 dark:border-stone-700/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                    Gmail Account Sync & Cloud Backup
                  </h2>
                  <p className="text-xs text-stone-500">
                    Automatic cloud backup & restore of diary entries, expenses & advance balances
                  </p>
                </div>
              </div>

              {gmailUser ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                  Not Connected
                </span>
              )}
            </div>

            {gmailStatusMsg && (
              <div
                className={`p-3 rounded-2xl text-xs font-medium flex items-center gap-2 ${
                  gmailStatusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200'
                }`}
              >
                {gmailStatusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{gmailStatusMsg.text}</span>
              </div>
            )}

            {gmailUser ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {gmailUser.picture ? (
                      <img
                        src={gmailUser.picture}
                        alt="Profile"
                        className="w-10 h-10 rounded-full border border-stone-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
                        {gmailUser.email[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {gmailUser.name || gmailUser.email}
                      </div>
                      <div className="text-xs text-stone-500 font-mono">{gmailUser.email}</div>
                      {gmailUser.last_backup_at && (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Last synced: {new Date(gmailUser.last_backup_at).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={disconnectGmail}
                    className="p-2 text-stone-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Disconnect Account"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBackupNow}
                    disabled={isGmailSyncing}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CloudUpload className="w-4 h-4" />
                    <span>{isGmailSyncing ? 'Backing Up...' : 'Save & Backup to Gmail'}</span>
                  </button>

                  <button
                    onClick={loadGmailBackups}
                    disabled={loadingBackups}
                    className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 text-stone-700 dark:text-stone-300 transition-colors"
                    title="Refresh Backups List"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingBackups ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Available Gmail Backups */}
                <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-700/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Saved Gmail Backups
                  </span>

                  {loadingBackups ? (
                    <div className="text-center py-4 text-xs text-stone-400">Loading backups from Gmail...</div>
                  ) : gmailBackups.length === 0 ? (
                    <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900/40 text-center text-xs text-stone-500">
                      No cloud backups found in your Gmail yet. Click <strong>"Save & Backup to Gmail"</strong> to create your first backup.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {gmailBackups.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-700"
                        >
                          <div>
                            <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                              {b.date}
                            </div>
                            <div className="text-[11px] text-stone-500">
                              {b.entries_count} Entries • {b.expenses_count} Expenses
                            </div>
                          </div>

                          <button
                            onClick={() => handleRestoreFromGmail(b.id)}
                            className="px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 text-white dark:text-stone-900 text-xs font-semibold flex items-center gap-1 transition-all"
                          >
                            <CloudDownload className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  Connect your Google account to automatically store and restore your diary entries, expenses ledger, and advance fund balances safely via your Gmail account.
                </p>

                <button
                  onClick={handleGmailConnect}
                  disabled={isGmailConnecting}
                  className="w-full py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2.5"
                >
                  <Mail className="w-4 h-4 text-red-400" />
                  <span>{isGmailConnecting ? 'Connecting...' : 'Connect Gmail Account'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Profile Name & Currency Card */}
          <div className="bg-white dark:bg-stone-800/90 rounded-3xl border border-stone-200/80 dark:border-stone-700/80 p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h2 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                Personal Identity & Preferences
              </h2>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                  Your Name / Greeting
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex, Sam, Samiullah..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                  Expense & Ledger Currency
                </label>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm border border-amber-600 shadow-sm flex items-center gap-2">
                    <span className="font-mono">PKR</span>
                    <span className="text-xs font-medium text-stone-900">(Pakistani Rupee)</span>
                  </div>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    All balances, advances, and expenses are tracked in PKR.
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                Save Preferences
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Security, Local Backup & Templates */}
        <div className="lg:col-span-6 space-y-6">
          {/* PIN Lock Card */}
          <div className="bg-white dark:bg-stone-800/90 rounded-3xl border border-stone-200/80 dark:border-stone-700/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <h2 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  PIN Privacy Lock
                </h2>
              </div>

              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  settings.is_pin_enabled
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500 border-stone-200 dark:border-stone-700'
                }`}
              >
                {settings.is_pin_enabled ? 'Protected' : 'Unprotected'}
              </span>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 mb-4">
              Set a 4-digit PIN lock. Your entries and balances are protected locally behind your personal passcode.
            </p>

            {pinMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium mb-4 flex items-center gap-2 ${
                  pinMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{pinMessage.text}</span>
              </div>
            )}

            {settings.is_pin_enabled ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      PIN Security Active
                    </div>
                    <div className="text-[11px] text-stone-500">
                      App locks automatically upon closing or locking.
                    </div>
                  </div>
                  <button
                    onClick={handleDisablePin}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors border border-rose-200"
                  >
                    Remove PIN
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSetPin} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-stone-500 mb-1">
                      New 4-Digit PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-center font-mono text-base font-bold tracking-widest text-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-stone-500 mb-1">
                      Confirm PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-center font-mono text-base font-bold tracking-widest text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={newPin.length !== 4 || confirmPin.length !== 4}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold transition-all shadow-sm"
                >
                  Enable PIN Protection
                </button>
              </form>
            )}
          </div>

          {/* Local JSON Backup & Restore */}
          <div className="bg-white dark:bg-stone-800/90 rounded-3xl border border-stone-200/80 dark:border-stone-700/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                Offline Backup & Data Portability
              </h2>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300">
              Download your complete diary entries, expenses, advances, and templates as a JSON file, or restore a file from your hard drive.
            </p>

            {importStatus && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-medium border border-amber-200 dark:border-amber-800">
                {importStatus}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={exportBackup}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON File</span>
              </button>

              <label className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold cursor-pointer transition-colors border border-stone-200 dark:border-stone-600">
                <Upload className="w-4 h-4" />
                <span>Restore JSON File</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-stone-700/60">
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      'Warning: This will permanently wipe all local diary entries, expenses, advances, and settings. Are you completely sure?'
                    )
                  ) {
                    resetAllData();
                  }
                }}
                className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset all local data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
