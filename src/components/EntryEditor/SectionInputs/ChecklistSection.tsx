import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { EntrySection, ChecklistItem } from '../../../types';

interface ChecklistSectionProps {
  section: EntrySection;
  onChange: (updated: EntrySection) => void;
}

export const ChecklistSection: React.FC<ChecklistSectionProps> = ({ section, onChange }) => {
  // Parse items from checklist_items or JSON content
  let items: ChecklistItem[] = section.checklist_items || [];
  if (items.length === 0 && section.content) {
    try {
      const parsed = JSON.parse(section.content);
      if (Array.isArray(parsed)) items = parsed;
    } catch {
      // Not json
    }
  }

  const [newItemText, setNewItemText] = useState('');

  const updateItems = (newItems: ChecklistItem[]) => {
    onChange({
      ...section,
      checklist_items: newItems,
      content: JSON.stringify(newItems),
    });
  };

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      text: newItemText.trim(),
      done: false,
    };

    updateItems([...items, newItem]);
    setNewItemText('');
  };

  const handleToggleItem = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    updateItems(updated);
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    updateItems(updated);
  };

  const handleItemTextChange = (id: string, text: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, text } : item
    );
    updateItems(updated);
  };

  const completedCount = items.filter((i) => i.done).length;

  return (
    <div className="space-y-3">
      {/* Progress header if items exist */}
      {items.length > 0 && (
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pb-1">
          <span>
            {completedCount} of {items.length} tasks completed
          </span>
          <span>{Math.round((completedCount / items.length) * 100)}%</span>
        </div>
      )}

      {/* Items list */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
              item.done
                ? 'bg-stone-50/70 dark:bg-stone-800/40 border-stone-200/50 dark:border-stone-700/40'
                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700/70'
            }`}
          >
            <button
              type="button"
              onClick={() => handleToggleItem(item.id)}
              className={`shrink-0 transition-colors ${
                item.done
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {item.done ? (
                <CheckCircle2 className="w-5 h-5 fill-emerald-500/20 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Circle className="w-5 h-5 stroke-[1.5]" />
              )}
            </button>

            <input
              type="text"
              value={item.text}
              onChange={(e) => handleItemTextChange(item.id, e.target.value)}
              className={`flex-1 bg-transparent text-sm focus:outline-none ${
                item.done
                  ? 'line-through text-stone-400 dark:text-stone-500'
                  : 'text-stone-800 dark:text-stone-100'
              }`}
            />

            <button
              type="button"
              onClick={() => handleDeleteItem(item.id)}
              className="p-1 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-stone-100 dark:hover:bg-stone-700/60 opacity-60 hover:opacity-100 transition-all"
              title="Delete item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Item Input */}
      <form onSubmit={handleAddItem} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Add a new checklist task..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        />
        <button
          type="submit"
          disabled={!newItemText.trim()}
          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </form>
    </div>
  );
};
