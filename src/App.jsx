import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  Repeat,
  Settings,
  Plus,
  Trash2,
  Moon,
  Sun,
  Search,
  Download,
  Upload,
  PieChart,
  BarChart3,
  CalendarDays,
  AlertTriangle,
  CreditCard,
  Landmark,
  Tags,
  Target,
  Pencil,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const STORAGE_KEY = "budgetflow_web_v1";

const defaultCategories = [
  "Groceries",
  "Food",
  "Transport",
  "Rent/Bond",
  "Utilities",
  "Subscriptions",
  "Debt",
  "Medical",
  "Shopping",
  "Entertainment",
  "Family",
  "Savings",
  "Investments",
];

const defaultIncomeTypes = ["Salary", "Side Income", "Bonus", "Allowance", "Rental Income", "Other"];
const defaultInvestmentTypes = ["TFSA", "ETF", "Stocks", "Retirement Annuity", "Savings", "Crypto", "Other"];
const frequencyOptions = ["Weekly", "Monthly", "Yearly", "Custom"];
const categoryColors = ["#047857", "#0f766e", "#0369a1", "#b45309", "#be123c", "#7c3aed", "#52525b", "#16a34a"];
const paletteOptions = ["emerald", "ocean", "plum", "graphite"];
const palettes = {
  emerald: {
    label: "Emerald",
    accent: "#047857",
    accentStrong: "#065f46",
    accentSoft: "#ecfdf5",
    expense: "#be123c",
    expenseSoft: "#fff1f2",
    heroLight: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 52%, #d1fae5 100%)",
    heroDark: "linear-gradient(135deg, #022c22 0%, #09090b 62%, #111827 100%)",
    appLight: "linear-gradient(135deg, #f7f8fb 0%, #ffffff 48%, #eefdf6 100%)",
    appDark: "linear-gradient(135deg, #09090b 0%, #111113 48%, #052e2b 100%)",
  },
  ocean: {
    label: "Ocean",
    accent: "#0369a1",
    accentStrong: "#075985",
    accentSoft: "#e0f2fe",
    expense: "#ea580c",
    expenseSoft: "#fff7ed",
    heroLight: "linear-gradient(135deg, #e0f2fe 0%, #ffffff 52%, #bae6fd 100%)",
    heroDark: "linear-gradient(135deg, #082f49 0%, #020617 60%, #111827 100%)",
    appLight: "linear-gradient(135deg, #f8fafc 0%, #ffffff 48%, #e0f2fe 100%)",
    appDark: "linear-gradient(135deg, #020617 0%, #111827 52%, #082f49 100%)",
  },
  plum: {
    label: "Plum",
    accent: "#7c3aed",
    accentStrong: "#6d28d9",
    accentSoft: "#f3e8ff",
    expense: "#db2777",
    expenseSoft: "#fdf2f8",
    heroLight: "linear-gradient(135deg, #f3e8ff 0%, #ffffff 52%, #e9d5ff 100%)",
    heroDark: "linear-gradient(135deg, #2e1065 0%, #09090b 58%, #111827 100%)",
    appLight: "linear-gradient(135deg, #faf7ff 0%, #ffffff 48%, #f3e8ff 100%)",
    appDark: "linear-gradient(135deg, #09090b 0%, #181026 55%, #2e1065 100%)",
  },
  graphite: {
    label: "Graphite",
    accent: "#52525b",
    accentStrong: "#27272a",
    accentSoft: "#f4f4f5",
    expense: "#a16207",
    expenseSoft: "#fefce8",
    heroLight: "linear-gradient(135deg, #f4f4f5 0%, #ffffff 52%, #e4e4e7 100%)",
    heroDark: "linear-gradient(135deg, #09090b 0%, #18181b 62%, #27272a 100%)",
    appLight: "linear-gradient(135deg, #fafafa 0%, #ffffff 48%, #f4f4f5 100%)",
    appDark: "linear-gradient(135deg, #09090b 0%, #111113 52%, #27272a 100%)",
  },
};

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const pad = (value) => String(value).padStart(2, "0");
const formatDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const today = () => formatDate(new Date());

function formatAmount(value) {
  const number = Number(value || 0);
  const sign = number < 0 ? "-" : "";
  const [whole, decimal] = Math.abs(number).toFixed(2).split(".");
  return `${sign}${whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}.${decimal}`;
}

function parseAmount(value) {
  const normalized = String(value ?? "").replace(/\s+/g, "").replace(",", ".");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

const money = (value, currency = "R") => `${currency}${formatAmount(value)}`;

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function uniqueList(items) {
  return [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))];
}

function normalizeCategories(categories) {
  const next = uniqueList(categories || []).filter((category) => category !== "Other");
  return next.length ? next : [...defaultCategories];
}

function getPalette(key) {
  return palettes[key] || palettes.emerald;
}

function getPaletteVars(key, isDark) {
  const palette = getPalette(key);
  return {
    "--accent": palette.accent,
    "--accent-strong": palette.accentStrong,
    "--accent-soft": palette.accentSoft,
    "--income": palette.accent,
    "--expense": palette.expense,
    "--expense-soft": palette.expenseSoft,
    "--hero-text": isDark ? "#ffffff" : "#18181b",
    "--hero-muted": isDark ? "#d4d4d8" : "#52525b",
    "--hero-chip": isDark ? "rgba(255, 255, 255, 0.1)" : palette.accentSoft,
    "--hero-panel": isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.68)",
    "--hero-panel-border": isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(24, 24, 27, 0.12)",
    "--hero-track": isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(24, 24, 27, 0.14)",
    "--hero-positive": isDark ? "#ffffff" : palette.accentStrong,
    "--hero-negative": isDark ? "#fecdd3" : "#be123c",
    "--app-background": isDark ? palette.appDark : palette.appLight,
    "--hero-background": isDark ? palette.heroDark : palette.heroLight,
    "--header-background": isDark ? "rgba(9, 9, 11, 0.88)" : "rgba(255, 255, 255, 0.88)",
    "--border-color": isDark ? "rgba(39, 39, 42, 0.86)" : "rgba(228, 228, 231, 0.86)",
  };
}

function parseDate(value) {
  if (!value) return parseDate(today());
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return parseDate(today());
  return new Date(year, month - 1, day);
}

function displayDate(value) {
  const date = parseDate(value);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function displayRange(start, end) {
  return `${displayDate(start)} - ${displayDate(end)}`;
}

function parseDisplayDate(value) {
  const trimmed = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const match = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!match) return "";

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const parsed = new Date(year, month - 1, day);

  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) return "";
  return formatDate(parsed);
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function clampStartDay(value) {
  return Math.min(31, Math.max(1, Number(value || 1)));
}

function dateFromDay(year, monthIndex, day) {
  const safeDay = Math.min(clampStartDay(day), daysInMonth(year, monthIndex));
  return new Date(year, monthIndex, safeDay);
}

function getFinancialStartDay(settings) {
  if (settings?.financialStartDate) return clampStartDay(parseDate(settings.financialStartDate).getDate());
  return clampStartDay(settings?.financialStartDay || 25);
}

function getCurrentFinancialStartDate(startDay) {
  const now = new Date();
  let start = dateFromDay(now.getFullYear(), now.getMonth(), startDay);
  if (now < start) start = dateFromDay(now.getFullYear(), now.getMonth() - 1, startDay);
  return formatDate(start);
}

function getFinancialRange(settings) {
  const startDay = getFinancialStartDay(settings);
  const now = new Date();
  let start = dateFromDay(now.getFullYear(), now.getMonth(), startDay);
  if (now < start) start = dateFromDay(now.getFullYear(), now.getMonth() - 1, startDay);

  const nextStart = dateFromDay(start.getFullYear(), start.getMonth() + 1, startDay);
  const end = new Date(nextStart);
  end.setDate(end.getDate() - 1);
  return { start: formatDate(start), end: formatDate(end), startDay };
}

function inRange(date, start, end) {
  return date >= start && date <= end;
}

function projection(currentBalance, monthlyContribution, annualReturn, years) {
  const months = years * 12;
  const monthlyRate = annualReturn / 100 / 12;
  let value = Number(currentBalance || 0);
  for (let i = 0; i < months; i += 1) {
    value = value * (1 + monthlyRate) + Number(monthlyContribution || 0);
  }
  return value;
}

function nextDueDate(startDate, frequency, customDays = 30) {
  const date = parseDate(startDate || today());
  const now = parseDate(today());
  while (date < now) {
    if (frequency === "Weekly") date.setDate(date.getDate() + 7);
    else if (frequency === "Yearly") date.setFullYear(date.getFullYear() + 1);
    else if (frequency === "Custom") date.setDate(date.getDate() + Number(customDays || 30));
    else date.setMonth(date.getMonth() + 1);
  }
  return formatDate(date);
}

function createInitialState() {
  const financialStartDay = 25;
  return {
    settings: {
      currency: "R",
      theme: "system",
      palette: "emerald",
      financialStartDay,
      financialStartDate: getCurrentFinancialStartDate(financialStartDay),
    },
    incomes: [],
    expenses: [],
    recurring: [],
    investments: [],
    contributions: [],
    savings: [],
    savingsContributions: [],
    categories: [...defaultCategories],
    incomeTypes: [...defaultIncomeTypes],
  };
}

function normalizeRecurring(item) {
  const kind = item.kind === "income" ? "income" : "expense";
  return {
    id: item.id || uid(),
    kind,
    title: item.title || item.name || "",
    amount: parseAmount(item.amount),
    category: item.category || "Subscriptions",
    type: item.type || "Salary",
    startDate: item.startDate || item.date || today(),
    frequency: item.frequency || "Monthly",
    customDays: Number(item.customDays || 30),
    notes: item.notes || "",
    active: item.active !== false,
  };
}

function normalizeSavings(item) {
  return {
    id: item.id || uid(),
    name: item.name || "Savings account",
    currentBalance: Number(item.currentBalance || item.balance || 0),
    goal: Number(item.goal || 0),
    monthlyTarget: Number(item.monthlyTarget || 0),
    notes: item.notes || "",
  };
}

function normalizeData(value) {
  const base = createInitialState();
  const raw = value && typeof value === "object" ? value : {};
  const settings = { ...base.settings, ...(raw.settings || {}) };

  settings.financialStartDay = clampStartDay(
    settings.financialStartDate ? parseDate(settings.financialStartDate).getDate() : settings.financialStartDay,
  );
  settings.financialStartDate = settings.financialStartDate || getCurrentFinancialStartDate(settings.financialStartDay);
  if (!["system", "light", "dark"].includes(settings.theme)) settings.theme = "system";
  if (!paletteOptions.includes(settings.palette)) settings.palette = "emerald";

  return {
    ...base,
    ...raw,
    settings,
    incomes: Array.isArray(raw.incomes) ? raw.incomes : [],
    expenses: Array.isArray(raw.expenses) ? raw.expenses : [],
    recurring: Array.isArray(raw.recurring) ? raw.recurring.map(normalizeRecurring) : [],
    investments: Array.isArray(raw.investments) ? raw.investments : [],
    contributions: Array.isArray(raw.contributions) ? raw.contributions : [],
    savings: Array.isArray(raw.savings) ? raw.savings.map(normalizeSavings) : [],
    savingsContributions: Array.isArray(raw.savingsContributions) ? raw.savingsContributions : [],
    categories: Array.isArray(raw.categories) && raw.categories.length ? normalizeCategories(raw.categories) : [...defaultCategories],
    incomeTypes: Array.isArray(raw.incomeTypes) && raw.incomeTypes.length ? uniqueList(raw.incomeTypes) : [...defaultIncomeTypes],
  };
}

function cloneBudgetData(value) {
  return JSON.parse(JSON.stringify(value));
}

function useBudgetStore() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return normalizeData(saved ? JSON.parse(saved) : undefined);
    } catch {
      return createInitialState();
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const update = (fn) => {
    setData((prev) => normalizeData(fn(cloneBudgetData(prev)) || prev));
  };

  const replaceData = (next) => setData(normalizeData(next));

  return [data, update, replaceData];
}

function Shell({ data, update, tab, setTab, children }) {
  const tabs = [
    ["Dashboard", Wallet],
    ["Transactions", CreditCard],
    ["Recurring", Repeat],
    ["Savings", Landmark],
    ["Investments", TrendingUp],
    ["Settings", Settings],
  ];
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const dark = data.settings.theme === "dark" || (data.settings.theme === "system" && media.matches);
      root.classList.toggle("dark", dark);
      root.dataset.palette = data.settings.palette || "emerald";
      root.style.colorScheme = dark ? "dark" : "light";
      setIsDark(dark);
    };

    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [data.settings.palette, data.settings.theme]);

  const toggleTheme = () => {
    update((draft) => {
      draft.settings.theme = isDark ? "light" : "dark";
      return draft;
    });
  };

  return (
    <div
      className="min-h-screen bg-[var(--app-background)] text-zinc-950 dark:text-zinc-50"
      style={getPaletteVars(data.settings.palette, isDark)}
    >
      <header className="sticky top-0 z-20 border-b border-[var(--border-color)] bg-[var(--header-background)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <h1 className="text-xl font-black tracking-tight sm:text-2xl">BudgetFlow</h1>
            <p className="truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Helping you out budget the Flow-State.
            </p>
          </div>
          <button
            type="button"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="grid h-11 w-11 place-items-center rounded-lg border border-[var(--border-color)] bg-white text-zinc-800 shadow-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)] dark:bg-zinc-900 dark:text-zinc-100"
            onClick={toggleTheme}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 lg:py-8">{children}</main>

      <nav className="fixed bottom-3 left-1/2 z-30 w-[calc(100%-1.5rem)] max-w-3xl -translate-x-1/2 rounded-lg border border-zinc-200 bg-white/92 p-1.5 shadow-[0_20px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/92">
        <div className="grid grid-cols-6 gap-1">
          {tabs.map(([name, Icon]) => (
            <button
              key={name}
              type="button"
              aria-label={name}
              onClick={() => setTab(name)}
              className={cx(
                "rounded-md px-2 py-2.5 text-[11px] font-semibold transition sm:text-xs",
                tab === name
                  ? "bg-[var(--accent-strong)] text-white shadow-sm"
                  : "text-zinc-500 hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)] dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white",
              )}
            >
              <Icon className="mx-auto sm:mb-1" size={18} />
              <span className="hidden sm:inline">{name}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function Dashboard({ data }) {
  const range = useMemo(
    () => getFinancialRange(data.settings),
    [data.settings],
  );

  const totals = useMemo(() => {
    const income = data.incomes
      .filter((item) => inRange(item.date, range.start, range.end))
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const expenses = data.expenses
      .filter((item) => inRange(item.date, range.start, range.end))
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const investmentContrib = data.contributions
      .filter((item) => inRange(item.date, range.start, range.end))
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const savingsContrib = data.savingsContributions
      .filter((item) => inRange(item.date, range.start, range.end))
      .reduce((sum, item) => {
        const direction = item.direction === "withdrawal" ? -1 : 1;
        return sum + Number(item.amount || 0) * direction;
      }, 0);
    const investmentValue = data.investments.reduce((sum, item) => sum + Number(item.currentBalance || 0), 0);
    const savingsValue = data.savings.reduce((sum, item) => sum + Number(item.currentBalance || 0), 0);
    const leftAfterExpenses = income - expenses;
    const remaining = leftAfterExpenses - investmentContrib - savingsContrib;
    const savingsRate = income ? ((Math.max(0, savingsContrib) + investmentContrib) / income) * 100 : 0;
    const daysLeft = Math.max(1, Math.ceil((parseDate(range.end) - parseDate(today())) / 86400000) + 1);
    return {
      income,
      expenses,
      investmentContrib,
      savingsContrib,
      investmentValue,
      savingsValue,
      netWorth: investmentValue + savingsValue,
      leftAfterExpenses,
      remaining,
      savingsRate,
      daysLeft,
    };
  }, [data.contributions, data.expenses, data.incomes, data.investments, data.savings, data.savingsContributions, range.end, range.start]);

  const byCategory = useMemo(
    () =>
      data.categories
        .map((category) => ({
          name: category,
          value: data.expenses
            .filter((expense) => expense.category === category && inRange(expense.date, range.start, range.end))
            .reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
        }))
        .filter((item) => item.value > 0),
    [data.categories, data.expenses, range.end, range.start],
  );

  const upcoming = useMemo(
    () =>
      data.recurring
        .filter((item) => item.active)
        .map((item) => ({ ...item, next: nextDueDate(item.startDate, item.frequency, item.customDays) }))
        .sort((a, b) => a.next.localeCompare(b.next))
        .slice(0, 8),
    [data.recurring],
  );

  const safeSpend = totals.remaining / totals.daysLeft;
  const palette = getPalette(data.settings.palette);
  const flowData = [
    { name: "Income", amount: totals.income, fill: palette.accent },
    { name: "Expenses", amount: totals.expenses, fill: palette.expense },
    {
      name: totals.leftAfterExpenses >= 0 ? "Left" : "Shortfall",
      amount: Math.abs(totals.leftAfterExpenses),
      fill: totals.leftAfterExpenses >= 0 ? palette.accentStrong : "#dc2626",
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="grid gap-5 rounded-lg bg-[var(--hero-background)] p-5 text-[var(--hero-text)] shadow-[0_28px_80px_rgba(9,9,11,0.35)] md:grid-cols-[1.05fr_0.95fr] md:p-6">
        <div className="flex min-h-[220px] flex-col justify-between">
          <div>
            <p className="inline-flex rounded-md bg-[var(--hero-chip)] px-3 py-1.5 text-xs font-bold text-[var(--hero-muted)]">
              Cycle {displayRange(range.start, range.end)}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[var(--hero-chip)] text-[var(--hero-text)]">
                <Wallet size={22} />
              </span>
              <h2 className="max-w-xl text-3xl font-black tracking-tight text-[var(--hero-text)] sm:text-4xl">Available balance</h2>
            </div>
            <p className="mt-2 max-w-lg text-sm font-medium text-[var(--hero-muted)]">
              Savings and investments are tracked separately, so the daily number stays honest.
            </p>
          </div>
          <div className="space-y-4 pt-6">
            <MonthProgress start={range.start} end={range.end} />
            <div className="grid gap-3 sm:grid-cols-2">
            <SummaryPill label="Money left" value={money(totals.leftAfterExpenses, data.settings.currency)} />
            <SummaryPill label="Safe per day" value={money(safeSpend, data.settings.currency)} />
            </div>
          </div>
        </div>
        <MoneyLeftGraphic
          currency={data.settings.currency}
          expenses={totals.expenses}
          income={totals.income}
          left={totals.leftAfterExpenses}
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Wallet} label="Income" value={money(totals.income, data.settings.currency)} hint="month" />
        <StatCard icon={CreditCard} label="Expenses" value={money(totals.expenses, data.settings.currency)} hint="month" />
        <StatCard icon={Landmark} label="Saved + invested" value={money(totals.savingsContrib + totals.investmentContrib, data.settings.currency)} hint="month" />
        <StatCard icon={TrendingUp} label="Net worth" value={money(totals.netWorth, data.settings.currency)} hint="tracked" />
      </section>

      {totals.income > 0 && totals.expenses / totals.income > 0.85 && (
        <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-950 dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-100">
          <AlertTriangle className="shrink-0" size={18} />
          <p>Your spending is close to your income for this financial month.</p>
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <ChartCard title="Income minus expenses" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={flowData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => money(value, data.settings.currency)} />
              <Tooltip formatter={(value) => money(value, data.settings.currency)} cursor={{ fill: "rgba(4,120,87,0.08)" }} />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {flowData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Expense breakdown" icon={PieChart}>
          {byCategory.length ? (
            <ResponsiveContainer width="100%" height={230}>
              <RPieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={54} outerRadius={86} paddingAngle={3}>
                  {byCategory.map((_, index) => (
                    <Cell key={index} fill={categoryColors[index % categoryColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => money(value, data.settings.currency)} />
              </RPieChart>
            </ResponsiveContainer>
          ) : (
            <Empty text="Add expenses to see category breakdown." />
          )}
        </ChartCard>
      </section>

      <ChartCard title="Upcoming recurring" icon={CalendarDays}>
        {upcoming.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {upcoming.map((item) => (
              <Row
                key={item.id}
                left={
                  <>
                    <p className="font-semibold">{item.title || item.type || item.category || "Recurring item"}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {item.kind === "income" ? item.type : item.category} - Due {displayDate(item.next)}
                    </p>
                  </>
                }
                right={
                  <span style={{ color: item.kind === "income" ? "var(--income)" : "var(--expense)" }}>
                    {item.kind === "income" ? "+" : "-"}
                    {money(item.amount, data.settings.currency)}
                  </span>
                }
              />
            ))}
          </div>
        ) : (
          <Empty text="No recurring payments or income yet." />
        )}
      </ChartCard>
    </div>
  );
}

function MonthProgress({ start, end }) {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  const currentDate = parseDate(today());
  const totalDays = Math.max(1, Math.ceil((endDate - startDate) / 86400000) + 1);
  const elapsed = Math.min(totalDays, Math.max(1, Math.ceil((currentDate - startDate) / 86400000) + 1));
  const percent = Math.min(100, Math.max(0, (elapsed / totalDays) * 100));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.08em] text-[var(--hero-muted)]">
        <span>Month progress</span>
        <span>{percent.toFixed(0)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--hero-track)]">
        <span className="block h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: "var(--income)" }} />
      </div>
    </div>
  );
}

function MoneyLeftGraphic({ income, expenses, left, currency }) {
  const expensePercent = income ? Math.min(100, Math.max(0, (expenses / income) * 100)) : 0;
  const leftPercent = income ? Math.max(0, Math.min(100, (left / income) * 100)) : 0;

  return (
    <div className="flex flex-col justify-between rounded-lg border border-[var(--hero-panel-border)] bg-[var(--hero-panel)] p-4">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--hero-muted)]">Income - expenses</p>
            <p
              className="mt-1 text-3xl font-black"
              style={{ color: left >= 0 ? "var(--hero-positive)" : "var(--hero-negative)" }}
            >
              {money(left, currency)}
            </p>
          </div>
          <div className="rounded-lg bg-[var(--hero-chip)] px-3 py-2 text-right text-xs font-semibold text-[var(--hero-muted)]">
            {leftPercent.toFixed(0)}% left
          </div>
        </div>
        <div className="mt-6 h-4 overflow-hidden rounded-full bg-[var(--hero-track)]">
          <div className="flex h-full">
            <span className="h-full" style={{ width: `${expensePercent}%`, backgroundColor: "var(--expense)" }} />
            <span className="h-full" style={{ width: `${leftPercent}%`, backgroundColor: "var(--income)" }} />
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="flex items-center gap-2 text-[var(--hero-muted)]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--income)" }} />
            Income
          </p>
          <p className="font-bold">{money(income, currency)}</p>
        </div>
        <div>
          <p className="flex items-center gap-2 text-[var(--hero-muted)]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--expense)" }} />
            Expenses
          </p>
          <p className="font-bold">{money(expenses, currency)}</p>
        </div>
      </div>
    </div>
  );
}

function SummaryPill({ label, value }) {
  return (
    <div className="rounded-lg border border-[var(--hero-panel-border)] bg-[var(--hero-panel)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--hero-muted)]">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-[0_12px_35px_rgba(24,24,27,0.07)] dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] dark:bg-zinc-900 dark:text-white">
          <Icon size={18} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">{hint}</span>
      </div>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 break-words text-2xl font-black tracking-tight">{value}</p>
    </motion.div>
  );
}

function ChartCard({ title, icon: Icon, children }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-[0_12px_35px_rgba(24,24,27,0.07)] dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="text-[var(--accent)] dark:text-white" size={18} />
        <h3 className="font-bold">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Empty({ text }) {
  return (
    <div className="flex min-h-[150px] items-center justify-center rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm font-medium text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
      {text}
    </div>
  );
}

function Transactions({ data, update }) {
  const [kind, setKind] = useState("expense");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({
    title: "",
    amount: "",
    date: today(),
    category: data.categories[0] || "Groceries",
    type: "Salary",
    notes: "",
  });

  const items = useMemo(
    () =>
      [
        ...data.incomes.map((item) => ({ ...item, kind: "income" })),
        ...data.expenses.map((item) => ({ ...item, kind: "expense" })),
      ]
        .filter((item) => [item.title, item.name, item.notes, item.category, item.type].join(" ").toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data.expenses, data.incomes, query],
  );

  const add = () => {
    if (!form.amount) return;
    update((draft) => {
      if (kind === "income") {
        draft.incomes.push({
          id: uid(),
          name: form.title.trim() || form.type,
          amount: parseAmount(form.amount),
          date: form.date,
          type: form.type,
          notes: form.notes,
        });
      } else {
        draft.expenses.push({
          id: uid(),
          title: form.title.trim() || form.category,
          amount: parseAmount(form.amount),
          date: form.date,
          category: form.category,
          paymentMethod: "Card",
          notes: form.notes,
        });
      }
      return draft;
    });
    setForm({ title: "", amount: "", date: form.date, category: form.category, type: form.type, notes: "" });
  };

  const remove = (item) =>
    update((draft) => {
      const key = item.kind === "income" ? "incomes" : "expenses";
      draft[key] = draft[key].filter((entry) => entry.id !== item.id);
      return draft;
    });

  return (
    <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
      <Panel title="Add transaction">
        <Segment options={["expense", "income"]} value={kind} setValue={setKind} />
        <Input label="Details (optional)" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
        <AmountInput label="Amount" value={form.amount} onChange={(value) => setForm({ ...form, amount: value })} />
        <DateInput label="Date" value={form.date} onChange={(value) => setForm({ ...form, date: value })} />
        {kind === "expense" ? (
          <Select label="Category" value={form.category} options={data.categories} onChange={(value) => setForm({ ...form, category: value })} />
        ) : (
          <Select label="Income type" value={form.type} options={data.incomeTypes} onChange={(value) => setForm({ ...form, type: value })} />
        )}
        <Input label="Notes" value={form.notes} onChange={(value) => setForm({ ...form, notes: value })} />
        <Button onClick={add}>
          <Plus size={16} /> Add
        </Button>
      </Panel>

      <Panel title="Transactions">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-zinc-400" size={18} />
          <input
            className="w-full rounded-lg border border-zinc-200 bg-white p-3 pl-10 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)] dark:border-zinc-800 dark:bg-zinc-900"
            placeholder="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <Row
              key={`${item.kind}-${item.id}`}
              left={
                <>
                  <p className="font-semibold">{item.title || item.name || item.category || item.type}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {displayDate(item.date)} - {item.category || item.type}
                  </p>
                </>
              }
              right={
                <div className="flex items-center gap-3">
                  <span style={{ color: item.kind === "income" ? "var(--income)" : "var(--expense)" }}>
                    {item.kind === "income" ? "+" : "-"}
                    {money(item.amount, data.settings.currency)}
                  </span>
                  <IconButton label="Delete transaction" onClick={() => remove(item)}>
                    <Trash2 size={16} />
                  </IconButton>
                </div>
              }
            />
          ))}
          {!items.length && <Empty text="No transactions yet." />}
        </div>
      </Panel>
    </div>
  );
}

function Recurring({ data, update }) {
  const [form, setForm] = useState({
    kind: "expense",
    title: "",
    amount: "",
    category: data.categories.includes("Subscriptions") ? "Subscriptions" : data.categories[0] || "Groceries",
    type: "Salary",
    startDate: today(),
    frequency: "Monthly",
    customDays: 30,
    notes: "",
  });
  const [editingId, setEditingId] = useState("");

  const recurringItems = useMemo(
    () =>
      data.recurring
        .map((item) => ({ ...item, next: nextDueDate(item.startDate, item.frequency, item.customDays) }))
        .sort((a, b) => a.next.localeCompare(b.next)),
    [data.recurring],
  );

  const resetForm = () => {
    setForm({
      kind: form.kind,
      title: "",
      amount: "",
      category: form.category,
      type: form.type,
      startDate: form.startDate,
      frequency: form.frequency,
      customDays: form.customDays,
      notes: "",
    });
  };

  const save = () => {
    if (!form.amount) return;
    update((draft) => {
      const recurring = {
        ...form,
        title: form.title.trim() || (form.kind === "income" ? form.type : form.category),
        amount: parseAmount(form.amount),
        customDays: Number(form.customDays || 30),
      };

      if (editingId) {
        draft.recurring = draft.recurring.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...recurring,
                id: item.id,
                active: item.active !== false,
              }
            : item,
        );
      } else {
        draft.recurring.push({
          id: uid(),
          ...recurring,
          active: true,
        });
      }
      return draft;
    });
    setEditingId("");
    resetForm();
  };

  const edit = (item) => {
    setEditingId(item.id);
    setForm({
      kind: item.kind || "expense",
      title: item.title || "",
      amount: formatAmount(item.amount).replace(/\.00$/, ""),
      category: item.category || data.categories[0] || "Groceries",
      type: item.type || "Salary",
      startDate: item.startDate || today(),
      frequency: item.frequency || "Monthly",
      customDays: item.customDays || 30,
      notes: item.notes || "",
    });
  };

  const cancelEdit = () => {
    setEditingId("");
    resetForm();
  };

  const recordNow = (item) =>
    update((draft) => {
      if (item.kind === "income") {
        draft.incomes.push({
          id: uid(),
          name: item.title || item.type,
          amount: parseAmount(item.amount),
          date: today(),
          type: item.type,
          notes: item.notes,
        });
      } else {
        draft.expenses.push({
          id: uid(),
          title: item.title || item.category,
          amount: parseAmount(item.amount),
          date: today(),
          category: item.category,
          paymentMethod: "Recurring",
          notes: item.notes,
        });
      }
      return draft;
    });

  return (
    <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
      <Panel title={editingId ? "Edit recurring flow" : "Add recurring flow"}>
        <Segment options={["expense", "income"]} value={form.kind} setValue={(value) => setForm({ ...form, kind: value })} />
        <Input label="Name (optional)" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
        <AmountInput label="Amount" value={form.amount} onChange={(value) => setForm({ ...form, amount: value })} />
        {form.kind === "expense" ? (
          <Select label="Category" value={form.category} options={data.categories} onChange={(value) => setForm({ ...form, category: value })} />
        ) : (
          <Select label="Income type" value={form.type} options={data.incomeTypes} onChange={(value) => setForm({ ...form, type: value })} />
        )}
        <DateInput label="Start date" value={form.startDate} onChange={(value) => setForm({ ...form, startDate: value })} />
        <Select label="Frequency" value={form.frequency} options={frequencyOptions} onChange={(value) => setForm({ ...form, frequency: value })} />
        {form.frequency === "Custom" && (
          <Input label="Custom days" type="number" min="1" value={form.customDays} onChange={(value) => setForm({ ...form, customDays: value })} />
        )}
        <Input label="Notes" value={form.notes} onChange={(value) => setForm({ ...form, notes: value })} />
        <div className="grid gap-2 sm:grid-cols-2">
          <Button onClick={save}>
            <Plus size={16} /> {editingId ? "Update recurring" : "Add recurring"}
          </Button>
          {editingId && (
            <Button variant="secondary" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </Panel>

      <Panel title="Recurring payments and income">
        <div className="space-y-3">
          {recurringItems.map((item) => (
            <Row
              key={item.id}
              left={
                <>
                  <p className="font-semibold">{item.title || item.type || item.category}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {item.kind === "income" ? item.type : item.category} - {item.frequency} - Next {displayDate(item.next)}
                  </p>
                </>
              }
              right={
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <span style={{ color: item.kind === "income" ? "var(--income)" : "var(--expense)" }}>
                    {item.kind === "income" ? "+" : "-"}
                    {money(item.amount, data.settings.currency)}
                  </span>
                  <button
                    type="button"
                    className="rounded-md bg-[var(--accent-soft)] px-3 py-2 text-xs font-bold text-[var(--accent-strong)] transition hover:opacity-85 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => edit(item)}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Pencil size={13} /> Edit
                    </span>
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-[var(--accent-soft)] px-3 py-2 text-xs font-bold text-[var(--accent-strong)] transition hover:opacity-85 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => recordNow(item)}
                  >
                    {item.kind === "income" ? "Received" : "Paid"}
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-[var(--accent-soft)] px-3 py-2 text-xs font-bold text-[var(--accent-strong)] transition hover:opacity-85 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() =>
                      update((draft) => {
                        const recurring = draft.recurring.find((entry) => entry.id === item.id);
                        if (recurring) recurring.active = !recurring.active;
                        return draft;
                      })
                    }
                  >
                    {item.active ? "Pause" : "Resume"}
                  </button>
                  <IconButton
                    label="Delete recurring item"
                    onClick={() =>
                      update((draft) => {
                        draft.recurring = draft.recurring.filter((entry) => entry.id !== item.id);
                        return draft;
                      })
                    }
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </div>
              }
            />
          ))}
          {!recurringItems.length && <Empty text="No recurring payments or income yet." />}
        </div>
      </Panel>
    </div>
  );
}

function Savings({ data, update }) {
  const range = getFinancialRange(data.settings);
  const [form, setForm] = useState({
    name: "",
    currentBalance: "",
    goal: "",
    monthlyTarget: "",
    notes: "",
  });
  const [movement, setMovement] = useState({
    savingsId: "",
    amount: "",
    date: today(),
    direction: "deposit",
  });

  const totalSavings = data.savings.reduce((sum, item) => sum + Number(item.currentBalance || 0), 0);
  const totalGoal = data.savings.reduce((sum, item) => sum + Number(item.goal || 0), 0);
  const savedThisMonth = data.savingsContributions
    .filter((item) => inRange(item.date, range.start, range.end))
    .reduce((sum, item) => sum + Number(item.amount || 0) * (item.direction === "withdrawal" ? -1 : 1), 0);
  const selectedSavingsId = movement.savingsId || data.savings[0]?.id || "";
  const goalProgress = totalGoal ? Math.min(100, (totalSavings / totalGoal) * 100) : 0;

  const addSavings = () => {
    update((draft) => {
      draft.savings.push({
        id: uid(),
        name: form.name.trim() || "Savings account",
        currentBalance: parseAmount(form.currentBalance),
        goal: parseAmount(form.goal),
        monthlyTarget: parseAmount(form.monthlyTarget),
        notes: form.notes,
      });
      return draft;
    });
    setForm({ name: "", currentBalance: "", goal: "", monthlyTarget: "", notes: "" });
  };

  const recordMovement = () => {
    if (!selectedSavingsId || !movement.amount) return;
    update((draft) => {
      const account = draft.savings.find((item) => item.id === selectedSavingsId);
      if (!account) return draft;
      const amount = parseAmount(movement.amount);
      const signedAmount = movement.direction === "withdrawal" ? -amount : amount;
      account.currentBalance = Math.max(0, Number(account.currentBalance || 0) + signedAmount);
      draft.savingsContributions.push({
        id: uid(),
        savingsId: selectedSavingsId,
        amount,
        date: movement.date,
        direction: movement.direction,
      });
      return draft;
    });
    setMovement({ savingsId: selectedSavingsId, amount: "", date: movement.date, direction: movement.direction });
  };

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={Landmark} label="Savings balance" value={money(totalSavings, data.settings.currency)} hint="all" />
        <StatCard icon={Target} label="Goal progress" value={totalGoal ? `${goalProgress.toFixed(0)}%` : "No goal"} hint="saved" />
        <StatCard icon={TrendingUp} label="Saved this month" value={money(savedThisMonth, data.settings.currency)} hint="cycle" />
      </section>

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Panel title="Add savings account">
          <Input label="Account name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
          <AmountInput label="Current balance" value={form.currentBalance} onChange={(value) => setForm({ ...form, currentBalance: value })} />
          <AmountInput label="Goal amount" value={form.goal} onChange={(value) => setForm({ ...form, goal: value })} />
          <AmountInput label="Monthly target" value={form.monthlyTarget} onChange={(value) => setForm({ ...form, monthlyTarget: value })} />
          <Input label="Notes" value={form.notes} onChange={(value) => setForm({ ...form, notes: value })} />
          <Button onClick={addSavings}>
            <Plus size={16} /> Add savings
          </Button>
        </Panel>

        <Panel title="Record savings movement">
          {data.savings.length ? (
            <div className="grid gap-3 md:grid-cols-4">
              <Select
                label="Account"
                value={selectedSavingsId}
                options={data.savings.map((item) => item.id)}
                labels={Object.fromEntries(data.savings.map((item) => [item.id, item.name]))}
                onChange={(value) => setMovement({ ...movement, savingsId: value })}
              />
              <Select
                label="Type"
                value={movement.direction}
                options={["deposit", "withdrawal"]}
                labels={{ deposit: "Deposit", withdrawal: "Withdrawal" }}
                onChange={(value) => setMovement({ ...movement, direction: value })}
              />
              <AmountInput label="Amount" value={movement.amount} onChange={(value) => setMovement({ ...movement, amount: value })} />
              <DateInput label="Date" value={movement.date} onChange={(value) => setMovement({ ...movement, date: value })} />
              <div className="md:col-span-4">
                <Button onClick={recordMovement}>
                  <Plus size={16} /> Save movement
                </Button>
              </div>
            </div>
          ) : (
            <Empty text="Create a savings account first." />
          )}
        </Panel>
      </div>

      <Panel title="Savings accounts">
        <div className="space-y-3">
          {data.savings.map((account) => {
            const accountProgress = account.goal ? Math.min(100, (Number(account.currentBalance || 0) / Number(account.goal || 1)) * 100) : 0;
            return (
              <div key={account.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/70">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold">{account.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Target {money(account.goal, data.settings.currency)} - Monthly {money(account.monthlyTarget, data.settings.currency)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 font-bold">
                    <span>{money(account.currentBalance, data.settings.currency)}</span>
                    <IconButton
                      label="Delete savings account"
                      onClick={() =>
                        update((draft) => {
                          draft.savings = draft.savings.filter((item) => item.id !== account.id);
                          draft.savingsContributions = draft.savingsContributions.filter((item) => item.savingsId !== account.id);
                          return draft;
                        })
                      }
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                </div>
                {account.goal > 0 && (
                  <div className="mt-4">
                    <div className="mb-2 flex justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400">
                      <span>Goal progress</span>
                      <span>{accountProgress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <span className="block h-full rounded-full bg-[var(--accent)]" style={{ width: `${accountProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {!data.savings.length && <Empty text="No savings accounts yet." />}
        </div>
      </Panel>
    </div>
  );
}

function Investments({ data, update }) {
  const [form, setForm] = useState({
    name: "",
    type: "TFSA",
    openingBalance: "",
    currentBalance: "",
    monthlyContribution: "",
    annualReturn: "8",
    notes: "",
  });
  const [contrib, setContrib] = useState({ investmentId: "", amount: "", date: today() });

  const addInvestment = () => {
    if (!form.name.trim()) return;
    update((draft) => {
      draft.investments.push({
        id: uid(),
        ...form,
        name: form.name.trim(),
        openingBalance: parseAmount(form.openingBalance),
        currentBalance: parseAmount(form.currentBalance || form.openingBalance),
        monthlyContribution: parseAmount(form.monthlyContribution),
        annualReturn: Number(form.annualReturn || 0),
      });
      return draft;
    });
    setForm({ name: "", type: "TFSA", openingBalance: "", currentBalance: "", monthlyContribution: "", annualReturn: "8", notes: "" });
  };

  const addContribution = () =>
    update((draft) => {
      const investmentId = contrib.investmentId || draft.investments[0]?.id;
      const investment = draft.investments.find((item) => item.id === investmentId);
      if (investment && contrib.amount) {
        const amount = parseAmount(contrib.amount);
        investment.currentBalance += amount;
        draft.contributions.push({ id: uid(), ...contrib, investmentId, amount });
      }
      return draft;
    });

  const totalValue = data.investments.reduce((sum, item) => sum + Number(item.currentBalance || 0), 0);
  const totalMonthly = data.investments.reduce((sum, item) => sum + Number(item.monthlyContribution || 0), 0);
  const growthData = [1, 5, 10, 20, 30].map((year) => ({
    year: `${year}y`,
    value: data.investments.reduce((sum, item) => sum + projection(item.currentBalance, item.monthlyContribution, item.annualReturn, year), 0),
  }));
  const selectedInvestmentId = contrib.investmentId || data.investments[0]?.id || "";

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={TrendingUp} label="Current value" value={money(totalValue, data.settings.currency)} hint="all" />
        <StatCard icon={Landmark} label="Monthly contributions" value={money(totalMonthly, data.settings.currency)} hint="recurring" />
        <StatCard icon={BarChart3} label="30y projection" value={money(growthData[growthData.length - 1]?.value || 0, data.settings.currency)} hint="estimate" />
      </section>

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Panel title="Add investment">
          <Input label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
          <Select label="Type" value={form.type} options={defaultInvestmentTypes} onChange={(value) => setForm({ ...form, type: value })} />
          <AmountInput label="Opening balance" value={form.openingBalance} onChange={(value) => setForm({ ...form, openingBalance: value })} />
          <AmountInput label="Current balance" value={form.currentBalance} onChange={(value) => setForm({ ...form, currentBalance: value })} />
          <AmountInput label="Monthly contribution" value={form.monthlyContribution} onChange={(value) => setForm({ ...form, monthlyContribution: value })} />
          <Input label="Expected return %" type="number" value={form.annualReturn} onChange={(value) => setForm({ ...form, annualReturn: value })} />
          <Button onClick={addInvestment}>
            <Plus size={16} /> Add investment
          </Button>
        </Panel>

        <ChartCard title="Investment projection" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={growthData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
              <XAxis dataKey="year" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => money(value, data.settings.currency)} />
              <Tooltip formatter={(value) => money(value, data.settings.currency)} />
              <Line type="monotone" dataKey="value" stroke="#047857" strokeWidth={3} dot={{ fill: "#047857", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Panel title="Investment accounts">
        <div className="space-y-3">
          {data.investments.map((investment) => (
            <Row
              key={investment.id}
              left={
                <>
                  <p className="font-semibold">{investment.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {investment.type} - {investment.annualReturn}% expected return
                  </p>
                </>
              }
              right={
                <div className="flex items-center gap-3">
                  <span>{money(investment.currentBalance, data.settings.currency)}</span>
                  <IconButton
                    label="Delete investment"
                    onClick={() =>
                      update((draft) => {
                        draft.investments = draft.investments.filter((item) => item.id !== investment.id);
                        return draft;
                      })
                    }
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </div>
              }
            />
          ))}
          {!data.investments.length && <Empty text="No investments yet." />}
        </div>
      </Panel>

      {data.investments.length > 0 && (
        <Panel title="Add contribution">
          <div className="grid gap-3 md:grid-cols-4">
            <Select
              label="Investment"
              value={selectedInvestmentId}
              options={data.investments.map((item) => item.id)}
              labels={Object.fromEntries(data.investments.map((item) => [item.id, item.name]))}
              onChange={(value) => setContrib({ ...contrib, investmentId: value })}
            />
            <AmountInput label="Amount" value={contrib.amount} onChange={(value) => setContrib({ ...contrib, amount: value })} />
            <DateInput label="Date" value={contrib.date} onChange={(value) => setContrib({ ...contrib, date: value })} />
            <div className="md:pt-6">
              <Button
                onClick={() => {
                  addContribution();
                  setContrib({ investmentId: selectedInvestmentId, amount: "", date: contrib.date });
                }}
              >
                <Plus size={16} /> Add
              </Button>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}

function SettingsScreen({ data, update, setData }) {
  const [importError, setImportError] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const range = getFinancialRange(data.settings);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = "budgetflow-backup.json";
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  const exportCsv = () => {
    const savingsNames = Object.fromEntries(data.savings.map((item) => [item.id, item.name]));
    const investmentNames = Object.fromEntries(data.investments.map((item) => [item.id, item.name]));
    const rows = [
      ["kind", "title", "amount", "date", "category/type", "notes"],
      ...data.incomes.map((item) => ["income", item.name, item.amount, displayDate(item.date), item.type, item.notes]),
      ...data.expenses.map((item) => ["expense", item.title, item.amount, displayDate(item.date), item.category, item.notes]),
      ...data.savingsContributions.map((item) => [
        item.direction === "withdrawal" ? "savings withdrawal" : "savings deposit",
        savingsNames[item.savingsId] || "Savings",
        item.amount,
        displayDate(item.date),
        "Savings",
        "",
      ]),
      ...data.contributions.map((item) => [
        "investment contribution",
        investmentNames[item.investmentId] || "Investment",
        item.amount,
        displayDate(item.date),
        "Investments",
        "",
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = "budgetflow-transactions.csv";
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  const importJson = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setData(JSON.parse(reader.result));
        setImportError("");
      } catch {
        setImportError("That backup file could not be imported.");
      }
    };
    reader.readAsText(file);
  };

  const updateFinancialStart = (value) => {
    const selectedDate = parseDate(value || range.start);
    update((draft) => {
      draft.settings.financialStartDate = formatDate(selectedDate);
      draft.settings.financialStartDay = selectedDate.getDate();
      return draft;
    });
  };

  const addCategory = () => {
    const nextCategory = categoryName.trim();
    if (!nextCategory) return;
    update((draft) => {
      draft.categories = uniqueList([...draft.categories, nextCategory]);
      return draft;
    });
    setCategoryName("");
  };

  const removeCategory = (category) => {
    if (defaultCategories.includes(category)) return;
    update((draft) => {
      draft.categories = draft.categories.filter((item) => item !== category);
      return draft;
    });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Preferences">
        <Select
          label="Mode"
          value={data.settings.theme}
          options={["system", "light", "dark"]}
          labels={{ system: "Use device", light: "Light", dark: "Dark" }}
          onChange={(value) =>
            update((draft) => {
              draft.settings.theme = value;
              return draft;
            })
          }
        />
        <Select
          label="Visual theme"
          value={data.settings.palette}
          options={paletteOptions}
          labels={Object.fromEntries(paletteOptions.map((key) => [key, getPalette(key).label]))}
          onChange={(value) =>
            update((draft) => {
              draft.settings.palette = value;
              return draft;
            })
          }
        />
        <Input
          label="Currency symbol"
          value={data.settings.currency}
          onChange={(value) =>
            update((draft) => {
              draft.settings.currency = value;
              return draft;
            })
          }
        />
        <DateInput
          label="Financial month starts"
          value={data.settings.financialStartDate || range.start}
          onChange={updateFinancialStart}
        />
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          Current range: {displayRange(range.start, range.end)}
        </div>
      </Panel>

      <Panel title="Categories">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Input label="New category" value={categoryName} onChange={setCategoryName} />
          <div className="sm:pt-6">
            <Button onClick={addCategory}>
              <Plus size={16} /> Save
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.categories.map((category) => (
            <span
              key={category}
              className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <Tags size={14} />
              {category}
              {!defaultCategories.includes(category) && (
                <button
                  type="button"
                  aria-label={`Remove ${category}`}
                  className="text-zinc-400 transition hover:text-rose-600"
                  onClick={() => removeCategory(category)}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </span>
          ))}
        </div>
      </Panel>

      <Panel title="Backup and data">
        <Button onClick={exportJson} variant="secondary">
          <Download size={16} /> Export JSON backup
        </Button>
        <Button onClick={exportCsv} variant="secondary">
          <Download size={16} /> Export CSV transactions
        </Button>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-bold text-zinc-900 transition hover:border-[var(--accent)] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
          <Upload size={16} /> Import JSON
          <input
            type="file"
            accept="application/json"
            hidden
            onChange={(event) => event.target.files?.[0] && importJson(event.target.files[0])}
          />
        </label>
        {importError && <p className="text-sm font-semibold text-rose-600 dark:text-rose-300">{importError}</p>}
        <button
          type="button"
          className="rounded-lg bg-rose-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700"
          onClick={() => confirm("Reset all BudgetFlow data?") && setData(createInitialState())}
        >
          Reset all data
        </button>
      </Panel>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-[0_12px_35px_rgba(24,24,27,0.07)] dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="mb-4 text-lg font-black tracking-tight">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Input({ label, value, onChange, type = "text", min }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.06em] text-zinc-500 dark:text-zinc-400">{label}</span>
      <input
        type={type}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-950 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
      />
    </label>
  );
}

function AmountInput({ label, value, onChange }) {
  const commit = () => {
    if (String(value).trim() === "") return;
    const parsed = parseAmount(value);
    const formatted = formatAmount(parsed).replace(/\.00$/, "");
    onChange(formatted);
  };

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.06em] text-zinc-500 dark:text-zinc-400">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onBlur={commit}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-950 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
      />
    </label>
  );
}

function DateInput({ label, value, onChange }) {
  const pickerRef = useRef(null);
  const [draftState, setDraftState] = useState({ source: value, draft: displayDate(value) });
  const draft = draftState.source === value ? draftState.draft : displayDate(value);

  const setDate = (nextValue) => {
    onChange(nextValue);
    setDraftState({ source: nextValue, draft: displayDate(nextValue) });
  };

  const commit = (nextValue) => {
    const parsed = parseDisplayDate(nextValue);
    if (!parsed) {
      setDraftState({ source: value, draft: displayDate(value) });
      return;
    }
    setDate(parsed);
  };

  const openPicker = () => {
    if (pickerRef.current?.showPicker) pickerRef.current.showPicker();
    else pickerRef.current?.click();
  };

  return (
    <div className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.06em] text-zinc-500 dark:text-zinc-400">{label}</span>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          placeholder="dd/mm/yyyy"
          value={draft}
          onBlur={() => commit(draft)}
          onChange={(event) => {
            const nextValue = event.target.value;
            setDraftState({ source: value, draft: nextValue });
            const parsed = parseDisplayDate(nextValue);
            if (parsed) onChange(parsed);
          }}
          className="w-full rounded-lg border border-zinc-200 bg-white p-3 pr-12 text-sm text-zinc-950 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          type="button"
          aria-label={`Choose ${label.toLowerCase()}`}
          onClick={openPicker}
          className="absolute right-1.5 top-1.5 grid h-9 w-9 place-items-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-[var(--accent-strong)] dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          <CalendarDays size={17} />
        </button>
        <input
          ref={pickerRef}
          tabIndex={-1}
          aria-hidden="true"
          type="date"
          value={value}
          onChange={(event) => {
            if (event.target.value) setDate(event.target.value);
          }}
          className="pointer-events-none absolute right-1.5 top-1.5 h-9 w-9 opacity-0"
        />
      </div>
    </div>
  );
}

function Select({ label, value, options, labels = {}, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.06em] text-zinc-500 dark:text-zinc-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-950 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option] || option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Button({ children, onClick, variant = "primary" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold shadow-sm transition",
        variant === "primary"
          ? "bg-[var(--accent-strong)] text-white hover:opacity-90"
          : "border border-zinc-200 bg-white text-zinc-900 hover:border-[var(--accent)] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100",
      )}
    >
      {children}
    </button>
  );
}

function IconButton({ children, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-rose-600 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-rose-300"
    >
      {children}
    </button>
  );
}

function Segment({ options, value, setValue }) {
  return (
    <div className="grid rounded-lg bg-[var(--accent-soft)] p-1 dark:bg-zinc-900" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setValue(option)}
          className={cx(
            "rounded-md px-3 py-2 text-sm font-bold capitalize transition",
            value === option
              ? "bg-[var(--accent-strong)] text-white shadow-sm"
              : "text-[var(--accent-strong)] opacity-75 hover:opacity-100 dark:text-zinc-300",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function Row({ left, right }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/70 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">{left}</div>
      <div className="font-bold sm:text-right">{right}</div>
    </div>
  );
}

export default function BudgetFlowApp() {
  const [data, update, setData] = useBudgetStore();
  const [tab, setTab] = useState("Dashboard");

  return (
    <Shell data={data} update={update} tab={tab} setTab={setTab}>
      {tab === "Dashboard" && <Dashboard data={data} />}
      {tab === "Transactions" && <Transactions data={data} update={update} />}
      {tab === "Recurring" && <Recurring data={data} update={update} />}
      {tab === "Savings" && <Savings data={data} update={update} />}
      {tab === "Investments" && <Investments data={data} update={update} />}
      {tab === "Settings" && <SettingsScreen data={data} update={update} setData={setData} />}
    </Shell>
  );
}
