// Core constants for the 49-Day Reset challenge.

export const STORAGE_KEY = 'bloom49:v1';
export const CONFIG_STORAGE_KEY = 'bloom49:config:v1';

export const START_DATE = '2026-11-26';
export const END_DATE = '2027-01-13';
export const TOTAL_DAYS = 49;

// A day counts as "complete" when at least this many of the 13 habits are ticked.
export const COMPLETION_THRESHOLD = 5;

// Friday = soft sage green, Sunday = soft rose. JS getDay(): 0=Sun, 5=Fri.
export const FRIDAY = 5;
export const SUNDAY = 0;

export const HABITS = [
  'fajr',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
  'tahajjud',
  'wazifa',
  'quran',
  'dsa',
  'techLearning',
  'projectLearning',
  'healthyFood',
  'sleep',
] as const;

export type HabitKey = string;

export const SALAH_HABITS: HabitKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const HABIT_LABELS: Record<string, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
  tahajjud: 'Tahajjud',
  wazifa: 'Wazifa',
  quran: 'Quran',
  dsa: 'DSA',
  techLearning: 'Tech Learning',
  projectLearning: 'Project Learning',
  healthyFood: 'Healthy Food',
  sleep: 'Sleep',
};

// Short labels for the habit grid header.
export const HABIT_SHORT: Record<string, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Magh',
  isha: 'Isha',
  tahajjud: 'Tahaj',
  wazifa: 'Wazifa',
  quran: 'Quran',
  dsa: 'DSA',
  techLearning: 'Tech',
  projectLearning: 'Proj',
  healthyFood: 'Food',
  sleep: 'Sleep',
};

export const DSA_TOPICS = [
  'Arrays',
  'Strings',
  'Linked List',
  'Trees',
  'Graphs',
  'DP',
  'Recursion',
  'Sorting',
  'Binary Search',
  'Other',
];

export const MOODS = [
  { emoji: '🌱', label: 'Growing' },
  { emoji: '🌷', label: 'Blooming' },
  { emoji: '🌤️', label: 'Calm' },
  { emoji: '🌫️', label: 'Foggy' },
  { emoji: '🌧️', label: 'Heavy' },
  { emoji: '🔥', label: 'Fired up' },
];

export const MOTIVATIONAL_LINES = [
  'A missed checkbox is information, not failure. Return with a sincere intention tomorrow.',
  'Consistency over perfection. Show up, even gently.',
  'Small steps, sincere intentions, steady progress.',
  'A single sincere prayer counts. A single thoughtful problem counts.',
  'You are not behind. You are becoming.',
  'Protect your worship, protect your rest, then build.',
  'Never restart from zero. Continue the next day.',
  'This is a gentle commitment, not a race.',
  'Bloom where you are, with what you have, today.',
  'The seed does not hurry, yet it blooms.',
];

export const FIVE_RULES = [
  {
    n: '01',
    text: 'Show up for DSA: even one thoughtful problem counts on a difficult day.',
  },
  {
    n: '02',
    text: 'Protect your worship: be consistent with five Salah; make space for Tahajjud, Wazifa and Quran.',
  },
  {
    n: '03',
    text: 'Sleep is part of the plan: do not sacrifice proper rest just to complete a checklist.',
  },
  {
    n: '04',
    text: 'Plan, then do: spend less time perfecting the routine and more time living it.',
  },
  {
    n: '05',
    text: 'Never restart from zero: if a day goes off track, continue the next day. A missed box is not failure.',
  },
];

export const TIMETABLE_ROWS = [
  'Before Fajr',
  'Fajr – 8 AM',
  '8 AM – 12 PM',
  '12 PM – 2 PM',
  '2 PM – 4 PM',
  '4 PM – 6 PM',
  '6 PM – 8 PM',
  '8 PM – Bed',
];

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// JS getDay maps column index 0..6 -> actual day 1..0
export const WEEKDAY_JS: number[] = [1, 2, 3, 4, 5, 6, 0];

export const TOTAL_WEEKS = 7;

export interface PlanHabit {
  id: string;
  label: string;
  shortLabel: string;
}

export interface PlanQuestion {
  id: string;
  label: string;
  placeholder: string;
  field?: string;
}

export interface PlanConfig {
  planTitle: string;
  planSubtitle: string;
  startDate: string;
  totalDays: number;
  habits: PlanHabit[];
  completionThreshold: number;
  dailyQuestions: PlanQuestion[];
  weeklyQuestions: PlanQuestion[];
  plannerRows: string[];
  plannerDays: string[];
  rules: string[];
  futurePrompt: string;
  moodQuestion: string;
  prioritiesQuestion: string;
  showMood: boolean;
  showPriorities: boolean;
  weeklyRatingQuestion: string;
  backgroundLight: string;
  backgroundDark: string;
}

export const DEFAULT_PLAN_CONFIG: PlanConfig = {
  planTitle: '50 Days to Bloom',
  planSubtitle: 'A gentle 49-day reset 🌷',
  startDate: START_DATE,
  totalDays: TOTAL_DAYS,
  habits: HABITS.map((id) => ({ id, label: HABIT_LABELS[id], shortLabel: HABIT_SHORT[id] })),
  completionThreshold: COMPLETION_THRESHOLD,
  dailyQuestions: [
    { id: 'intention', field: 'intention', label: "Today's Intention / Niyyah", placeholder: 'A sincere intention for today…' },
    { id: 'spiritual', field: 'spiritual', label: 'Spiritual Check-in', placeholder: 'How did I care for my connection with Allah today?' },
    { id: 'dsaLearning', field: 'dsaLearning', label: 'DSA / Technical Learning', placeholder: 'What did I solve, revise or understand today?' },
    { id: 'projectLearning', field: 'projectLearning', label: 'Project Learning', placeholder: 'What did I explore or make progress on?' },
    { id: 'win', field: 'win', label: "Today's Win", placeholder: 'What am I proud of, even if it was small?' },
    { id: 'lesson', field: 'lesson', label: 'Lesson + Tomorrow', placeholder: 'What could I improve, and what is tomorrow’s first priority?' },
    { id: 'gratitude', field: 'gratitude', label: 'Gratitude', placeholder: 'Today, I am thankful for…' },
  ],
  weeklyQuestions: [
    { id: 'achievement', field: 'achievement', label: 'Biggest achievement this week', placeholder: 'A win worth remembering' },
    { id: 'dsa', field: 'dsa', label: 'DSA: what did I solve or revise?', placeholder: 'Topics, problems, breakthroughs' },
    { id: 'spiritual', field: 'spiritual', label: 'Spiritual consistency: what went well?', placeholder: 'Salah, Quran, connection' },
    { id: 'learned', field: 'learned', label: 'What did I learn?', placeholder: 'A lesson, a skill, a realization' },
    { id: 'difficult', field: 'difficult', label: 'What made this week difficult?', placeholder: 'Be honest, be gentle' },
    { id: 'improve', field: 'improve', label: 'One thing I want to improve next week', placeholder: 'A small, doable change' },
    { id: 'proud', field: 'proud', label: "One thing I'm proud of", placeholder: 'Even something small' },
  ],
  plannerRows: [...TIMETABLE_ROWS],
  plannerDays: [...WEEKDAYS],
  rules: FIVE_RULES.map((rule) => rule.text),
  futurePrompt: 'By 13 January, I hope I feel…',
  moodQuestion: 'Mood',
  prioritiesQuestion: 'Top 3 Priorities',
  showMood: true,
  showPriorities: true,
  weeklyRatingQuestion: 'My week out of 10',
  backgroundLight: '#fff9f4',
  backgroundDark: '#1f1a16',
};
