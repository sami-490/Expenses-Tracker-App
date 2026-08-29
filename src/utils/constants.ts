import { MoodOption, SectionTemplate, AppSettings, Reminder, AdvanceSection, ExpenseItem } from '../types';

export const DEFAULT_MOODS: MoodOption[] = [
  { value: 'ecstatic', label: 'Overjoyed', emoji: '🤩', color: '#F59E0B', description: 'Feeling amazing, energized & thrilled' },
  { value: 'happy', label: 'Happy & Content', emoji: '😊', color: '#10B981', description: 'Good spirits, smiling and fulfilled' },
  { value: 'peaceful', label: 'Calm & Peaceful', emoji: '🌿', color: '#06B6D4', description: 'Tranquil, centered and relaxed' },
  { value: 'productive', label: 'Focused & Driven', emoji: '⚡', color: '#8B5CF6', description: 'In the flow zone, accomplished' },
  { value: 'neutral', label: 'Neutral / Okay', emoji: '😐', color: '#6B7280', description: 'Normal everyday balanced state' },
  { value: 'tired', label: 'Exhausted & Low', emoji: '🥱', color: '#9CA3AF', description: 'Needing rest and recharge' },
  { value: 'anxious', label: 'Anxious / Stressed', emoji: '😰', color: '#EF4444', description: 'Overwhelmed with tension' },
  { value: 'sad', label: 'Down / Gloomy', emoji: '🌧️', color: '#3B82F6', description: 'Reflective, sad or hurt' },
];

export const DEFAULT_SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: 'template_mood',
    name: 'Mood & Energy',
    icon: 'Smile',
    color: '#F59E0B',
    type: 'mood',
    sort_order: 1,
    is_deleted: false,
    created_at: Date.now(),
    description: 'Track how you felt today and note the primary emotions.',
  },
  {
    id: 'template_gratitude',
    name: 'Gratitude & Joy',
    icon: 'Heart',
    color: '#EC4899',
    type: 'text',
    sort_order: 2,
    is_deleted: false,
    created_at: Date.now(),
    description: '3 things you are deeply thankful for today.',
    default_placeholder: '1. I am grateful for...\n2. Today I appreciated...\n3. A small moment of beauty was...',
  },
  {
    id: 'template_reflection',
    name: 'Daily Highlights & Reflection',
    icon: 'Sparkles',
    color: '#6366F1',
    type: 'text',
    sort_order: 3,
    is_deleted: false,
    created_at: Date.now(),
    description: 'Freeform thoughts, stories, and what made today unique.',
    default_placeholder: 'Write about the pivotal events, conversations, thoughts or discoveries from your day...',
  },
  {
    id: 'template_work',
    name: 'Work & Key Tasks',
    icon: 'Briefcase',
    color: '#3B82F6',
    type: 'checklist',
    sort_order: 4,
    is_deleted: false,
    created_at: Date.now(),
    description: 'Track key accomplishments and priorities tackled.',
  },
  {
    id: 'template_health',
    name: 'Health & Fitness Note',
    icon: 'Activity',
    color: '#10B981',
    type: 'text',
    sort_order: 5,
    is_deleted: false,
    created_at: Date.now(),
    description: 'Log meals, workouts, sleep quality, and physical state.',
    default_placeholder: '• Workout: 30 min run / lifting\n• Nutrition: Clean meals, plenty of water\n• Sleep: 8 hours restful',
  },
  {
    id: 'template_rating',
    name: 'Day Score Rating',
    icon: 'Star',
    color: '#EAB308',
    type: 'rating',
    sort_order: 6,
    is_deleted: false,
    created_at: Date.now(),
    description: 'Overall score from 1 to 5 stars for how fulfilled you feel.',
  },
  {
    id: 'template_photo',
    name: 'Photo Memory',
    icon: 'Camera',
    color: '#8B5CF6',
    type: 'photo',
    sort_order: 7,
    is_deleted: false,
    created_at: Date.now(),
    description: 'Attach picture memories, views, sketches or snapshots.',
  },
];

export const DEFAULT_ADVANCE_SECTIONS: AdvanceSection[] = [];

export const DEFAULT_EXPENSES: ExpenseItem[] = [];

export const EXPENSE_CATEGORIES = [
  { name: 'Food & Dining', icon: 'Utensils', color: '#F59E0B' },
  { name: 'Groceries', icon: 'ShoppingBag', color: '#10B981' },
  { name: 'Travel & Transit', icon: 'Car', color: '#3B82F6' },
  { name: 'Bills & Utilities', icon: 'FileText', color: '#EF4444' },
  { name: 'Shopping & Gear', icon: 'Package', color: '#8B5CF6' },
  { name: 'Health & Wellness', icon: 'HeartPulse', color: '#EC4899' },
  { name: 'Entertainment', icon: 'Film', color: '#06B6D4' },
  { name: 'Office & Work', icon: 'Briefcase', color: '#6366F1' },
  { name: 'Other', icon: 'MoreHorizontal', color: '#64748B' },
];

export const DEFAULT_REMINDERS: Reminder[] = [
  {
    id: 'reminder_evening',
    title: 'Time to write your Daily Diary ✨',
    time: '21:00',
    repeat_days: 'daily',
    is_active: true,
  },
  {
    id: 'reminder_expense_log',
    title: 'Log today\'s expenses & advance money 💳',
    time: '20:00',
    repeat_days: 'daily',
    is_active: true,
  },
];

export const CURRENCIES = [
  { code: 'PKR', symbol: 'Rs ', label: 'Pakistani Rupee (PKR)' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹)' },
  { code: 'AED', symbol: 'AED ', label: 'UAE Dirham (AED)' },
  { code: 'SAR', symbol: 'SAR ', label: 'Saudi Riyal (SAR)' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar (A$)' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen (¥)' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  accent_color: 'amber',
  font_size: 'normal',
  is_pin_enabled: false,
  pin_hash: null,
  daily_reminder_time: '21:00',
  backup_reminder_enabled: true,
  user_name: 'Journaler',
  currency: 'Rs ',
  category_budgets: [
    { category: 'Food & Dining', monthly_limit: 15000 },
    { category: 'Groceries', monthly_limit: 25000 },
    { category: 'Travel & Transit', monthly_limit: 10000 },
    { category: 'Bills & Utilities', monthly_limit: 20000 },
    { category: 'Shopping & Gear', monthly_limit: 15000 },
    { category: 'Health & Wellness', monthly_limit: 10000 },
  ],
};

export const INSPIRATIONAL_PROMPTS: string[] = [
  "What is one unexpected thing that brought a smile to your face today?",
  "What was the most challenging moment today, and how did you handle it?",
  "What is something you learned about yourself recently?",
  "Describe a person who showed you kindness today or whom you appreciate.",
  "If today were a chapter in your autobiography, what title would you give it?",
  "What are you proud of having completed or attempted today?",
  "What is a peaceful moment you want to remember from this week?",
  "What is one burden you're ready to let go of before you sleep tonight?",
  "What is something you are looking forward to tomorrow?",
  "How did you nurture your mind, body, and spirit today?",
];
