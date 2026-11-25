import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Dumbbell } from 'lucide-react';
import { Card, SectionTitle, StatCard, EmptyHint } from '../components/ui';
import { useBloom } from '../store';
import {
  addDays,
  allChallengeDays,
  challengeDayNumber,
  ensureDay,
  formatDayRow,
  weekNumberForDay,
  weekDateRange,
} from '../types';

const EX_TYPES = ['Workout', 'Recovery', 'Rest'] as const;

export default function ExerciseTracker() {
  const { data, updateDay, setData, selectedDay, setSelectedDay, config } = useBloom();
  const days = useMemo(() => allChallengeDays(config.startDate, config.totalDays), [config.startDate, config.totalDays]);
  const totalWeeks = Math.ceil(config.totalDays / 7);

  const day = ensureDay(data, selectedDay);
  const move = (delta: number) => {
    const next = addDays(selectedDay, delta);
    const dn = challengeDayNumber(next, config.startDate, config.totalDays);
    if (dn === 0 || dn === -1) return;
    setSelectedDay(next);
  };

  const weekIdx = weekNumberForDay(challengeDayNumber(selectedDay, config.startDate, config.totalDays), config.totalDays);

  const stats = useMemo(() => {
    let workouts = 0, recovery = 0, rest = 0, minutes = 0;
    const perWeek: { week: string; minutes: number }[] = [];
    for (let w = 1; w <= totalWeeks; w++) {
      const ws = (w - 1) * 7;
      let wm = 0;
      for (let i = 0; i < Math.min(7, config.totalDays - ws); i++) {
        const iso = days[ws + i];
        if (!iso) continue;
        const d = data.days[iso];
        if (!d) continue;
        if (d.exercise.type === 'Workout') workouts++;
        if (d.exercise.type === 'Recovery') recovery++;
        if (d.exercise.type === 'Rest') rest++;
        minutes += d.exercise.minutes;
        wm += d.exercise.minutes;
      }
      perWeek.push({ week: `Wk ${w}`, minutes: wm });
    }
    return { workouts, recovery, rest, minutes, perWeek };
  }, [data.days, days, totalWeeks, config.totalDays]);

  return (
    <div className="space-y-5 animate-fadeIn">
      <Card>
        <SectionTitle title="Exercise Tracker" subtitle="Move gently, rest honestly" icon={<Dumbbell size={22} />} />
        <div className="mb-5 flex items-center justify-between gap-2">
          <button className="btn-ghost" onClick={() => move(-1)}>‹ Prev</button>
          <div className="text-center font-serif text-lg text-ink-800 dark:text-cream-100">
            Day {challengeDayNumber(selectedDay, config.startDate, config.totalDays)} · {formatDayRow(selectedDay)}
          </div>
          <button className="btn-ghost" onClick={() => move(1)}>Next ›</button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="label">Type</label>
            <div className="flex gap-2">
              {EX_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => updateDay(selectedDay, (d) => { d.exercise.type = d.exercise.type === t ? '' : t; })}
                  className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition ${
                    day.exercise.type === t
                      ? 'border-sage-300 bg-sage-50 text-sage-600 dark:bg-sage-600/20 dark:text-sage-200'
                      : 'border-cream-300 bg-white text-ink-700 dark:bg-white/5 dark:border-white/10'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Activity</label>
            <input
              className="field"
              placeholder="Walk, yoga, weights…"
              value={day.exercise.activity}
              onChange={(e) => updateDay(selectedDay, (d) => { d.exercise.activity = e.target.value; })}
            />
          </div>
          <div>
            <label className="label">Minutes</label>
            <input
              type="number"
              min={0}
              className="field"
              value={day.exercise.minutes}
              onChange={(e) => updateDay(selectedDay, (d) => { d.exercise.minutes = Math.max(0, Number(e.target.value)); })}
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Workouts" value={stats.workouts} accent="text-sage-500" />
        <StatCard label="Recovery" value={stats.recovery} accent="text-lavender-400" />
        <StatCard label="Total min" value={stats.minutes} accent="text-gold-500" />
      </div>

      <Card>
        <h3 className="mb-3 font-serif text-lg text-ink-800 dark:text-cream-100">Weekly exercise plan</h3>
        <p className="mb-3 text-xs text-ink-700/60 dark:text-cream-100/50">
          Week {weekIdx}/{totalWeeks} · {weekDateRange(weekIdx, config.startDate, config.totalDays).startLabel} – {weekDateRange(weekIdx, config.startDate, config.totalDays).endLabel}
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {config.plannerDays.map((wd) => (
            <div key={wd}>
              <label className="label">{wd}</label>
              <input
                className="field"
                placeholder="e.g. 30min walk"
                value={data.planner.timetable[`exercisePlan|wk${weekIdx}|${wd}`] ?? ''}
                onChange={(e) =>
                  setData((p) => ({ ...p, planner: { ...p.planner, timetable: { ...p.planner.timetable, [`exercisePlan|wk${weekIdx}|${wd}`]: e.target.value } } }))
                }
              />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 font-serif text-lg text-ink-800 dark:text-cream-100">Minutes per week</h3>
        {stats.minutes === 0 ? (
          <EmptyHint>Log your first session to see it here. 🌷</EmptyHint>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.perWeek} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F8E4D2" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#8a7a6a' }} />
              <YAxis tick={{ fontSize: 11, fill: '#8a7a6a' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
              <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                {stats.perWeek.map((_, i) => (
                  <Cell key={i} fill={i % 2 ? '#A8C9A1' : '#FFA8C5'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
