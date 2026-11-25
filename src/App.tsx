import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Home, ListChecks, Heart, Code2, BookOpen, Dumbbell, NotebookPen,
  RefreshCw, TrendingUp, CalendarDays, CalendarHeart, ScrollText, Settings as SettingsIcon, SlidersHorizontal, Menu, X, Moon, Sun, Flower2,
} from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AppData, DayData, addDays, defaultSelectedDay, emptyData, emptyDay } from './types';
import { CONFIG_STORAGE_KEY, DEFAULT_PLAN_CONFIG, STORAGE_KEY } from './constants';
import type { PlanConfig } from './constants';
import { BloomCtx } from './store';
import { Settings } from './components/Settings';
import { Customize } from './components/Customize';
import { Tulip } from './components/ui';

import Dashboard from './pages/Dashboard';
import HabitTracker from './pages/HabitTracker';
import SalahTracker from './pages/SalahTracker';
import DsaTracker from './pages/DsaTracker';
import LearningTracker from './pages/LearningTracker';
import ExerciseTracker from './pages/ExerciseTracker';
import DailyJournal from './pages/DailyJournal';
import WeeklyReset from './pages/WeeklyReset';
import Progress from './pages/Progress';
import Calendar from './pages/Calendar';
import Planner from './pages/Planner';
import RulesFuture from './pages/RulesFuture';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'habits', label: 'Habit Tracker', icon: ListChecks },
  { id: 'salah', label: 'Salah', icon: Heart },
  { id: 'dsa', label: 'DSA', icon: Code2 },
  { id: 'learning', label: 'Learning', icon: BookOpen },
  { id: 'exercise', label: 'Exercise', icon: Dumbbell },
  { id: 'journal', label: 'Daily Journal', icon: NotebookPen },
  { id: 'weekly', label: 'Weekly Reset', icon: RefreshCw },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'planner', label: 'Planner', icon: CalendarHeart },
  { id: 'rules', label: 'Rules + Future', icon: ScrollText },
  { id: 'customize', label: 'Customize plan', icon: SlidersHorizontal },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

function App() {
  const [data, setData] = useLocalStorage<AppData>(STORAGE_KEY, emptyData());
  const [storedConfig, setConfig] = useLocalStorage<PlanConfig>(CONFIG_STORAGE_KEY, DEFAULT_PLAN_CONFIG);
  const config = useMemo(() => ({ ...DEFAULT_PLAN_CONFIG, ...storedConfig }), [storedConfig]);
  const [selectedDay, setSelectedDayState] = useState<string>(() => defaultSelectedDay(config.startDate, config.totalDays));
  const [tab, setTab] = useState('dashboard');
  const [navOpen, setNavOpen] = useState(false);
  const [dark, setDark] = useLocalStorage<boolean>('bloom49:dark', false);
  const planTitle = config.planTitle === DEFAULT_PLAN_CONFIG.planTitle && config.totalDays !== DEFAULT_PLAN_CONFIG.totalDays
    ? `${config.totalDays} Days to Bloom`
    : config.planTitle;
  const planSubtitle = config.planSubtitle === DEFAULT_PLAN_CONFIG.planSubtitle
    ? config.totalDays === DEFAULT_PLAN_CONFIG.totalDays
      ? config.planSubtitle
      : `A gentle ${config.totalDays}-day reset 🌷`
    : `${config.totalDays}-day plan · ${config.planSubtitle}`;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-bg-light', config.backgroundLight);
    document.documentElement.style.setProperty('--app-bg-dark', config.backgroundDark);
    document.documentElement.style.setProperty('--app-bg', dark ? config.backgroundDark : config.backgroundLight);
    document.title = planTitle;
  }, [config.backgroundDark, config.backgroundLight, config.totalDays, dark, planTitle]);

  useEffect(() => {
    if (selectedDay < config.startDate || selectedDay > addDays(config.startDate, config.totalDays - 1)) {
      setSelectedDayState(defaultSelectedDay(config.startDate, config.totalDays));
    }
  }, [config.startDate, config.totalDays, selectedDay]);

  const setSelectedDay = useCallback((iso: string) => setSelectedDayState(iso), []);

  const updateDay = useCallback((iso: string, patch: (d: DayData) => void) => {
    setData((prev) => {
      const existing = prev.days[iso] ?? emptyDay(config.habits.map((habit) => habit.id));
      // Deep-ish clone so we never mutate prev's nested objects.
      const d: DayData = {
        habits: { ...emptyDay(config.habits.map((habit) => habit.id)).habits, ...existing.habits },
        dsa: { ...existing.dsa },
        learning: { ...existing.learning },
        exercise: { ...existing.exercise },
        journal: { ...existing.journal, priorities: [...existing.journal.priorities], customAnswers: { ...(existing.journal.customAnswers ?? {}) } },
      };
      patch(d);
      return { ...prev, days: { ...prev.days, [iso]: d } };
    });
  }, [config.habits, setData]);

  const ctx = useMemo(
    () => ({ data, setData, config, setConfig, selectedDay, setSelectedDay, updateDay }),
    [data, setData, config, setConfig, selectedDay, setSelectedDay, updateDay],
  );

  const navigate = (id: string) => {
    setTab(id);
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateDay = (id: string, day?: string) => {
    if (day) setSelectedDay(day);
    navigate(id);
  };

  const renderPage = () => {
    switch (tab) {
      case 'dashboard': return <Dashboard onNavigate={navigate} />;
      case 'habits': return <HabitTracker />;
      case 'salah': return <SalahTracker />;
      case 'dsa': return <DsaTracker />;
      case 'learning': return <LearningTracker />;
      case 'exercise': return <ExerciseTracker />;
      case 'journal': return <DailyJournal />;
      case 'weekly': return <WeeklyReset />;
      case 'progress': return <Progress />;
      case 'calendar': return <Calendar onNavigate={navigateDay} />;
      case 'planner': return <Planner />;
      case 'rules': return <RulesFuture />;
      case 'customize': return <Customize />;
      case 'settings': return <Settings dark={dark} toggleDark={() => setDark((v) => !v)} resetAppearance={() => setDark(false)} />;
      default: return <Dashboard onNavigate={navigate} />;
    }
  };

  const activeLabel = NAV.find((n) => n.id === tab)?.label ?? '';

  return (
    <BloomCtx.Provider value={ctx}>
      <div className="min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-cream-200/70 bg-cream-100/90 backdrop-blur-md dark:bg-[#1f1a16]/90 dark:border-white/5">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <button onClick={() => navigate('dashboard')} className="flex items-center gap-2">
              <Tulip className="h-7 w-7" />
              <div className="text-left">
                <div className="font-serif text-lg font-semibold leading-none text-ink-900 dark:text-cream-100">{planTitle}</div>
                <div className="text-[10px] text-ink-700 dark:text-cream-100/50">{planSubtitle}</div>
              </div>
            </button>
            <div className="flex items-center gap-2">
              <button
                className="btn-ghost px-2.5"
                onClick={() => setDark((v) => !v)}
                aria-label="Toggle dark mode"
              >
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                className="btn-ghost px-2.5 md:hidden"
                onClick={() => setNavOpen((v) => !v)}
                aria-label="Toggle navigation"
              >
                {navOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
          {/* Sidebar (desktop) */}
          <aside className="hidden md:block w-56 shrink-0">
            <nav className="sticky top-20 space-y-1">
              {NAV.map((n) => {
                const Icon = n.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => navigate(n.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                      tab === n.id
                        ? 'bg-blush-100 text-blush-600 dark:bg-blush-300/20 dark:text-blush-200'
                        : 'text-ink-800 hover:bg-cream-200 dark:text-cream-100/60 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon size={17} /> {n.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Mobile drawer */}
          {navOpen && (
            <div className="fixed inset-0 z-40 md:hidden" onClick={() => setNavOpen(false)}>
              <div className="absolute inset-0 bg-black/30" />
              <div
                className="absolute left-0 top-0 h-full w-64 bg-cream-100 p-4 shadow-xl dark:bg-[#241e19]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-serif text-lg text-ink-900 dark:text-cream-100">Menu</span>
                  <button onClick={() => setNavOpen(false)}><X size={18} /></button>
                </div>
                <nav className="space-y-1">
                  {NAV.map((n) => {
                    const Icon = n.icon;
                    return (
                      <button
                        key={n.id}
                        onClick={() => navigate(n.id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                          tab === n.id ? 'bg-blush-100 text-blush-600' : 'text-ink-800 hover:bg-cream-200'
                        }`}
                      >
                        <Icon size={17} /> {n.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          )}

          {/* Main content */}
          <main className="min-w-0 flex-1">
            <div className="mb-4 flex items-center gap-2 md:hidden">
              <Flower2 size={16} className="text-blush-400" />
              <h1 className="font-serif text-xl text-ink-900 dark:text-cream-100">{activeLabel}</h1>
            </div>
            {renderPage()}
          </main>
        </div>

        <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-center text-xs text-ink-700 dark:text-cream-100/40">
          Small steps, sincere intentions, steady progress. Consistency over perfection. 🌷
        </footer>
      </div>
    </BloomCtx.Provider>
  );
}

export default App;
