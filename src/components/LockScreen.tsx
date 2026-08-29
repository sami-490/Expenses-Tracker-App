import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, KeyRound, ShieldAlert } from 'lucide-react';
import { useDiary } from '../context/DiaryContext';

export const LockScreen: React.FC = () => {
  const { unlockApp } = useDiary();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleKeyPress = async (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        const success = await unlockApp(newPin);
        if (!success) {
          setError(true);
          setShake(true);
          setTimeout(() => {
            setPin('');
            setShake(false);
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/95 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-stone-800 border border-stone-700/80 rounded-3xl p-8 text-center shadow-2xl"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-5 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-serif font-bold text-white mb-1 tracking-tight">
          Daily Diary
        </h2>
        <p className="text-sm text-stone-400 mb-6">
          Enter your 4-digit PIN to access your private entries
        </p>

        {/* PIN Indicators */}
        <motion.div
          animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex justify-center items-center gap-4 mb-8"
        >
          {[0, 1, 2, 3].map((idx) => {
            const filled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  error
                    ? 'bg-rose-500 scale-110 shadow-lg shadow-rose-500/30'
                    : filled
                    ? 'bg-amber-400 scale-110 shadow-lg shadow-amber-400/30'
                    : 'bg-stone-700 border border-stone-600'
                }`}
              />
            );
          })}
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs font-medium text-rose-400 mb-4 flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Incorrect PIN. Please try again.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="h-14 rounded-2xl bg-stone-700/50 hover:bg-stone-700 active:bg-amber-500/20 active:border-amber-400/40 text-xl font-semibold text-white border border-stone-600/50 transition-all flex items-center justify-center shadow-sm"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-14 rounded-2xl text-xs font-medium text-stone-400 hover:text-white hover:bg-stone-700/40 active:scale-95 transition-all flex items-center justify-center"
          >
            Clear
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-stone-700/50 hover:bg-stone-700 active:bg-amber-500/20 text-xl font-semibold text-white border border-stone-600/50 transition-all flex items-center justify-center shadow-sm"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl text-xs font-medium text-stone-400 hover:text-white hover:bg-stone-700/40 active:scale-95 transition-all flex items-center justify-center"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
};
