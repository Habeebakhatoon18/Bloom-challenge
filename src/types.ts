import {
  HABITS,
  HabitKey,
  TOTAL_DAYS,
  START_DATE,
  WEEKDAYS,
  TIMETABLE_ROWS,
  DEFAULT_PLAN_CONFIG,
} from './constants';
import type { PlanConfig } from './constants';

export type Habits = Record<HabitKey, boolean>;

export interface DsaEntry {
  solved: number;
  topic: string;
  notes: string;
}

export interface LearningEntry {
  technical: string;
  project: string;
}

export interface ExerciseEntry {
  type: '' | 'Workout' | 'Recovery' | 'Rest';
  activity: string;
  minutes: number;
}

export interface JournalEntry {
  mood: string;
  intention: string;
  priorities: [string, string, string];
  spiritual: string;
  dsaLearning: string;
  projectLearning: string;
  win: string;
  lesson: string;
  gratitude: string;
  customAnswers: Record<string, string>;
}

export interface WeekEntry {
  achievement: string;
  dsa: string;
  spiritual: string;
  learned: string;
  difficult: string;
  improve: string;
  rating: number;
  proud: string;
  customAnswers: Record<string, string>;
}

export interface DayData {
  habits: Habits;
  dsa: DsaEntry;
  learning: LearningEntry;
  exercise: ExerciseEntry;
  journal: JournalEntry;
}

export interface PlannerData {
  timetable: Record<string, string>;
  learningPlan: Record<string, { topic: string; completed: boolean }>;
}

export interface AppData {
  name: string;
  days: Record<string, DayData>;
  weeks: Record<number, WeekEntry>;
  planner: PlannerData;
  futureNote: string;
}

export function emptyHabits(habits: readonly string[] = HABITS): Habits {
  const h: Habits = {};
  habits.forEach((k) => (h[k] = false));
  return h;
}

export function emptyDay(habits: readonly string[] = HABITS): DayData {
  return {
    habits: emptyHabits(habits),
    dsa: { solved: 0, topic: '', notes: '' },
    learning: { technical: '', project: '' },
    exercise: { type: '', activity: '', minutes: 0 },
    journal: {
      mood: '',
      intention: '',
      priorities: ['', '', ''],
      spiritual: '',
      dsaLearning: '',
      projectLearning: '',
      win: '',
      lesson: '',
      gratitude: '',
      customAnswers: {},
    },
  };
}

export function emptyWeek(): WeekEntry {
  return {
    achievement: '',
    dsa: '',
    spiritual: '',
    learned: '',
    difficult: '',
    improve: '',
    rating: 5,
    proud: '',
    customAnswers: {},
  };
}

export function emptyPlanner(rows: string[] = TIMETABLE_ROWS, weekdays: string[] = WEEKDAYS): PlannerData {
  const timetable: Record<string, string> = {};
  rows.forEach((row) => {
    weekdays.forEach((day) => {
      timetable[`${row}|${day}`] = '';
    });
  });
  const learningPlan: Record<string, { topic: string; completed: boolean }> = {};
  weekdays.forEach((day) => {
    learningPlan[day] = { topic: '', completed: false };
  });
  return { timetable, learningPlan };
}

export function emptyData(config: PlanConfig = DEFAULT_PLAN_CONFIG): AppData {
  return {
    name: '',
    days: {},
    weeks: {},
    planner: emptyPlanner(config.plannerRows, config.plannerDays),
    futureNote: '',
  };
}

// ---------- Date helpers ----------

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, n: number): string {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function challengeDayNumber(iso: string, startDate = START_DATE, totalDays = TOTAL_DAYS): number {
  // 1-based day number within challenge, or 0 if before, -1 if after.
  const start = fromISODate(startDate);
  const d = fromISODate(iso);
  const diff = Math.round((d.getTime() - start.getTime()) / 86400000);
  if (diff < 0) return 0;
  if (diff >= totalDays) return -1;
  return diff + 1;
}

export function todayISO(): string {
  return toISODate(new Date());
}

// The default selected day: today if within window, else Day 1.
export function defaultSelectedDay(startDate = START_DATE, totalDays = TOTAL_DAYS): string {
  const t = todayISO();
  const n = challengeDayNumber(t, startDate, totalDays);
  if (n > 0) return t;
  if (n === -1) return startDate;
  return startDate;
}

export function statusOfDay(iso: string, startDate = START_DATE, totalDays = TOTAL_DAYS): 'before' | 'upcoming' | 'active' | 'after' {
  const n = challengeDayNumber(iso, startDate, totalDays);
  if (n === 0) return 'before';
  if (n === -1) return 'after';
  const t = todayISO();
  if (iso > t) return 'upcoming';
  return 'active';
}

export function allChallengeDays(startDate = START_DATE, totalDays = TOTAL_DAYS): string[] {
  const out: string[] = [];
  for (let i = 0; i < totalDays; i++) out.push(addDays(startDate, i));
  return out;
}

export function weekNumberForDay(dayNum: number, totalDays = TOTAL_DAYS): number {
  return Math.min(Math.ceil(totalDays / 7), Math.floor((dayNum - 1) / 7) + 1);
}

export function weekDateRange(week: number, startDate = START_DATE, totalDays = TOTAL_DAYS): { start: string; end: string; startLabel: string; endLabel: string } {
  const startDay = (week - 1) * 7 + 1;
  const endDay = Math.min(totalDays, week * 7);
  const start = addDays(startDate, startDay - 1);
  const end = addDays(startDate, endDay - 1);
  return { start, end, startLabel: formatShort(start), endLabel: formatShort(end) };
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatShort(iso: string): string {
  const d = fromISODate(iso);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`;
}

export function formatDayRow(iso: string): string {
  const d = fromISODate(iso);
  return `${formatShort(iso)} · ${WEEKDAY_SHORT[d.getDay()]}`;
}

export function isFriday(iso: string): boolean {
  return fromISODate(iso).getDay() === 5;
}

export function isSunday(iso: string): boolean {
  return fromISODate(iso).getDay() === 0;
}

// ---------- Completion / stats ----------

export function getDay(data: AppData, iso: string): DayData {
  return data.days[iso] ?? emptyDay();
}

export function ensureDay(data: AppData, iso: string): DayData {
  return data.days[iso] ?? emptyDay();
}

export function habitsDone(day: DayData, habits: readonly string[] = HABITS): number {
  return habits.reduce((acc, k) => acc + (day.habits[k] ? 1 : 0), 0);
}

export function isDayComplete(day: DayData, threshold: number, habits: readonly string[] = HABITS): boolean {
  return habitsDone(day, habits) >= threshold;
}

export function salahDone(day: DayData, habits: readonly string[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']): number {
  return habits.reduce(
    (acc, k) => acc + (day.habits[k] ? 1 : 0),
    0,
  );
}

export function completionPct(day: DayData, habits: readonly string[] = HABITS): number {
  return habits.length ? Math.round((habitsDone(day, habits) / habits.length) * 100) : 0;
}

export function habitCompletionRates(
  data: AppData,
  days: string[],
  habits: PlanConfig['habits'] = DEFAULT_PLAN_CONFIG.habits,
  startDate = START_DATE,
  totalDays = TOTAL_DAYS,
): { habit: HabitKey; label: string; pct: number; done: number; total: number }[] {
  return habits.map(({ id, label }) => {
    const active = days.filter((iso) => statusOfDay(iso, startDate, totalDays) !== 'upcoming' && statusOfDay(iso, startDate, totalDays) !== 'before');
    const done = active.filter((iso) => data.days[iso]?.habits[id]).length;
    return {
      habit: id,
      label,
      pct: active.length ? Math.round((done / active.length) * 100) : 0,
      done,
      total: active.length,
    };
  });
}

// Avoid extra import: redefine labels locally via constants.
