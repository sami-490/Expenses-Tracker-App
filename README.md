# 💎 Daily Diary & Expenses Tracker Pro

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An enterprise-grade, modern Web Application built for personal financial management, advance fund ledger tracking, analytics reporting, and rich daily journaling with mood tracking and PIN security.

---

## ✨ Features at a Glance

### 📊 Financial Analytics & Budget Intelligence
- **Interactive Visual Distribution**: Category expense breakdown with percentage share progress bars and color-coded badges.
- **Budget Health & Warnings**: Real-time spending health status bars with visual alerts when nearing (>80%) or exceeding (>100%) monthly category limits.
- **Payment Channel Distribution**: Comprehensive breakdown across Cash, UPI / Online, Credit/Debit Cards, Advance Fund Balances, and Bank Wires.
- **CSV Report Export**: One-click raw CSV data exporter for accounting software and Microsoft Excel.
- **Printable PDF Financial Statement**: Generates a professional financial ledger statement with company/personal header, period metrics, transaction tables, and digital approval signature lines.

### 💳 Expense & Advance Fund Management
- **Advance Ledger Tracking**: Create and manage multiple advance fund buckets (e.g. Office Advance, Travel Budget, Client Deposit) with automatic deposit tracking and deduction ledgers.
- **Receipt & Invoice Attachments**: Attach bill/receipt image files directly to expense items with full base64 image persistence.
- **Receipt Lightbox Viewer**: Magnify, preview, and download attached receipt photos directly from the transaction table.
- **One-Click Duplication**: Duplicate frequent or recurring expenses with a single click.

### 📔 Daily Journaling & Habit Tracker
- **Rich Diary Sections**: Structured sections for Gratitude, Daily Highlights, Work Priorities, Health & Fitness, Day Scores (1-5 Stars), and Photo Memories.
- **Mood & Energy Logging**: Expressive mood selector (Overjoyed, Calming, Focused, Tired, etc.) with custom emojis and analytics tag filtering.
- **Streak Tracker**: Auto-calculates consecutive journaling streak days to build habits.

### 🔒 Security, Cloud Sync & Customization
- **4-Digit PIN Privacy Lock**: SHA-256 hashed PIN security lock screen to safeguard private diary entries and financial ledgers.
- **Gmail Account Sync**: Optional cloud backup and restore integrated directly with Gmail API storage.
- **Multi-Currency Support**: Full support for Pakistani Rupee (PKR Rs), US Dollar ($), Euro (€), British Pound (£), Indian Rupee (₹), UAE Dirham (AED), Saudi Riyal (SAR), Canadian Dollar (CA$), Australian Dollar (A$), and Japanese Yen (¥).
- **Theme Engine**: Light, Dark, Sepia, and Midnight themes with responsive glassmorphism aesthetic styling.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/) |
| **Language** | [TypeScript 5.8](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4.0](https://tailwindcss.com/) + Glassmorphism UX |
| **Animations** | [Motion (Framer Motion)](https://motion.dev/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **AI Integration** | [@google/genai](https://github.com/google/generative-ai-js) (Gemini API) |
| **Build Tooling** | ESBuild & Vite Production Compiler |

---

## 📁 Project Structure

```text
Expenses-Tracker-App/
├── public/
├── src/
│   ├── assets/               # Static assets & icons
│   ├── components/
│   │   ├── Analytics/        # AnalyticsView & Visual Charts
│   │   ├── Calendar/         # Interactive Calendar View
│   │   ├── Dashboard/        # Heatmap, Today Summary & Quick Log Modal
│   │   ├── EntryEditor/      # Daily Journal Section Inputs & Editor
│   │   ├── Expenses/         # Expense & Advance Fund Manager + Receipt Lightbox
│   │   ├── Reminders/        # Daily Reminder Scheduler Modal
│   │   ├── Settings/         # Profile, PIN Lock, Currency & Category Budgets
│   │   ├── Timeline/         # Journal Entries List & Favorites
│   │   ├── common/           # IconRenderer & Toast Notification System
│   │   ├── Header.tsx        # Top App Bar
│   │   ├── LockScreen.tsx    # PIN Lock Screen
│   │   └── Navigation.tsx    # Primary Navigation Bar
│   ├── context/
│   │   └── DiaryContext.tsx  # Central State Management & Context API
│   ├── types/
│   │   └── index.ts          # TypeScript Type Definitions & Models
│   ├── utils/
│   │   ├── confetti.ts       # Celebration FX
│   │   ├── constants.ts      # Currencies, Categories & Default Settings
│   │   ├── date.ts           # Date Parsing & Streak Calculation
│   │   ├── gmail.ts          # Gmail Sync Service
│   │   └── storage.ts        # LocalStorage Persistence Engine
│   ├── App.tsx               # Main App Shell
│   ├── index.css             # Design Tokens & Tailwind Directives
│   └── main.tsx              # React Root Entrypoint
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) installed on your machine.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sami-490/Expenses-Tracker-App.git
   cd Expenses-Tracker-App
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or using bun
   bun install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser to view the application.

4. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📜 Usage & Workflows

### 📈 Exporting CSV & Printing Financial Statements
1. Navigate to the **Analytics & Reports** tab.
2. Select your desired timeframe filter (*This Month*, *Last Month*, *This Year*, *All Time*).
3. Click **Export CSV** to download the raw data spreadsheet.
4. Click **Statement** to open the printable PDF ledger view with header summary cards and signature approval blocks.

### 💳 Receipt Image Attachments
1. Click **+ Add Expense** or **Quick Log Expense**.
2. Click **Upload Receipt Photo** and select an invoice image.
3. Save the expense item.
4. Click the **Eye** icon in the transaction table to open the Lightbox Viewer.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/sami-490/Expenses-Tracker-App/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p center>
  Made with ❤️ by <strong>Samiullah</strong> • <a href="https://github.com/sami-490">@sami-490</a>
</p>
