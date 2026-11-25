import { useMemo } from 'react';
import { Sparkles, Flame, CalendarHeart, Flower2, ArrowRight } from 'lucide-react';
import { Card, SectionTitle, BloomCheckbox, ProgressRing, StatCard, Tulip } from '../components/ui';
import { useBloom } from '../store';
import {
  allChallengeDays,
  challengeDayNumber,
  completionPct,
  formatDayRow,
  fromISODate,
  getDay,
  habitsDone,
  isDayComplete,
  todayISO,
} from '../types';
import { MOTIVATIONAL_LINES } from '../constants';

function milestoneMessage(day: number, totalDays: number): string | null {
  if (day === 7) return '🌷 One week of showing up. That already means something.';
  if (day === 21) return '🌱 Three weeks in. Habits are taking root.';
  if (day === totalDays) return '🌷 You reached the end of the reset. Be gentle and proud.';
  return null;
}

export default function Dashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { data, setData, updateDay, config } = useBloom();
  const today = todayISO();
  const habitIds = useMemo(() => config.habits.map((habit) => habit.id), [config.habits]);
  const dayNum = challengeDayNumber(today, config.startDate, config.totalDays);
  const days = useMemo(() => allChallengeDays(config.startDate, config.totalDays), [config.startDate, config.totalDays]);

  const daysCompleted = useMemo(
    () => days.filter((iso) => {
      if (iso >= today) return false;
      const d = data.days[iso];
      return d && isDayComplete(d, config.completionThreshold, habitIds);
    }).length,
    [data.days, days, today, config.completionThreshold, habitIds],
  );

  const daysRemaining = useMemo(() => {
    const n = challengeDayNumber(today, config.startDate, config.totalDays);
    if (n === -1) return 0;
    if (n === 0) return config.totalDays;
    return config.totalDays - n + 1;
  }, [today, config.startDate, config.totalDays]);

  const overallPct = Math.round((daysCompleted / config.totalDays) * 100);

  // streaks
  const { current, best } = useMemo(() => {
    let current = 0;
    let best = 0;
    let run = 0;
    for (const iso of days) {
      if (iso >= today) break;
      const d = data.days[iso];
      if (d && isDayComplete(d, config.completionThreshold, habitIds)) {
        run += 1;
        current = run;
        best = Math.max(best, run);
      } else {
        run = 0;
        current = 0;
      }
    }
    best = Math.max(best, current);
    return { current, best };
  }, [data.days, days, today, config.completionThreshold, habitIds]);

  const todayDay = getDay(data, today);
  const todayDone = habitsDone(todayDay, habitIds);
  const todayPct = completionPct(todayDay, habitIds);

  const motLine = useMemo(() => {
    const idx = Math.floor(new Date().getDate() % MOTIVATIONAL_LINES.length);
    return MOTIVATIONAL_LINES[idx];
  }, []);

  const milestone = milestoneMessage(dayNum, config.totalDays);

  const setName = (name: string) => setData((p) => ({ ...p, name }));

  const greeting = dayNum === 0
    ? `Assalamu alaikum${data.name ? `, ${data.name}` : ''} 🌷`
    : dayNum === -1
    ? `Assalamu alaikum${data.name ? `, ${data.name}` : ''} 🌷`
    : `Assalamu alaikum, ${data.name || 'friend'} 🌷`;

  const headerLine = dayNum === 0
    ? `Starts in ${Math.round((fromISODate(config.startDate).getTime() - new Date().setHours(0,0,0,0)) / 86400000)} days`
    : dayNum === -1
    ? 'Challenge complete 🌷'
    : `Day ${dayNum} of ${config.totalDays}`;

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card className="relative overflow-hidden">
        <Tulip className="absolute -right-3 -top-3 h-24 w-24 opacity-20 animate-floaty" />
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blush-400">{headerLine}</p>
            <h1 className="mt-1 text-3xl font-serif font-semibold text-ink-800 dark:text-cream-100">{greeting}</h1>
            <div className="mt-3 flex items-center gap-2">
              <input
                className="field max-w-xs"
                placeholder="Your name"
                aria-label="Your name"
                value={data.name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <ProgressRing pct={overallPct} label={`${daysCompleted}/${config.totalDays} days`} />
        </div>
        {milestone && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-blush-50 dark:bg-blush-300/15 px-4 py-3 text-sm text-blush-600 dark:text-blush-200">
            <Sparkles size={16} /> {milestone}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Day" value={dayNum > 0 ? `${dayNum}/${config.totalDays}` : '—'} accent="text-blush-500" />
        <StatCard label="Days completed" value={daysCompleted} accent="text-sage-500" />
        <StatCard label="Days remaining" value={daysRemaining} accent="text-gold-500" />
        <StatCard label="Best streak" value={`${best} 🔥`} accent="text-blush-500" />
      </div>

      <Card>
        <SectionTitle title="Today's quick checklist" subtitle="Tick without leaving the dashboard" icon={<Flower2 size={22} />} />
        <div className="mb-3 flex items-center justify-between text-sm text-ink-700/70 dark:text-cream-100/60">
          <span>{todayDone}/{config.habits.length} habits · {todayPct}%</span>
          <button className="btn-ghost text-xs" onClick={() => onNavigate('habits')}>
            Open tracker <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
          {config.habits.map(({ id: h, label }) => {
            const checked = todayDay.habits[h];
            const toggle = () => updateDay(today, (d) => { d.habits[h] = !d.habits[h]; });
            return (
              <div
                key={h}
                role="button"
                tabIndex={0}
                onClick={toggle}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
                }}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition cursor-pointer ${
                  checked
                    ? 'border-blush-300 bg-blush-100 dark:bg-blush-300/15 dark:border-blush-300/40'
                    : 'border-cream-300 bg-white/70 hover:bg-cream-100 dark:bg-white/5 dark:border-white/15'
                }`}
              >
                <BloomCheckbox checked={checked} onChange={toggle} ariaLabel={label} size="sm" />
                <span className="truncate text-ink-900 dark:text-cream-100">{label}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-blush-100 to-sage-100 dark:from-blush-300/10 dark:to-sage-600/10 border-blush-200 dark:border-white/5">
        <div className="flex items-start gap-3">
          <CalendarHeart className="mt-1 text-blush-500" size={20} />
          <div>
            <p className="font-serif text-lg text-ink-900 dark:text-cream-100">"{motLine}"</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-700 dark:text-cream-100/50">
              <Flame size={14} className="text-gold-400" /> Current streak: {current} day{current === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      </Card>

      <p className="text-center text-xs text-ink-700 dark:text-cream-100/40">
        {formatDayRow(today)} · Threshold for a complete day: {config.completionThreshold} of {config.habits.length} habits
      </p>
    </div>
  );
}
