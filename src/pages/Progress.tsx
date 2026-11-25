import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Cell,
} from 'recharts';
import { TrendingUp, Heart } from 'lucide-react';
import { Card, SectionTitle, StatCard } from '../components/ui';
import { useBloom } from '../store';
import {
  allChallengeDays,
  challengeDayNumber,
  completionPct,
  emptyDay,
  habitsDone,
  habitCompletionRates,
  todayISO,
} from '../types';

export default function Progress() {
  const { data, config } = useBloom();
  const habitIds = useMemo(() => config.habits.map((habit) => habit.id), [config.habits]);
  const totalWeeks = Math.ceil(config.totalDays / 7);
  const days = useMemo(() => allChallengeDays(config.startDate, config.totalDays), [config.startDate, config.totalDays]);
  const today = todayISO();

  const overallPct = useMemo(() => {
    const active = days.filter((iso) => iso < today);
    if (!active.length) return 0;
    const total = active.reduce((acc, iso) => acc + habitsDone(data.days[iso] ?? emptyDay(habitIds), habitIds), 0);
    return habitIds.length ? Math.round((total / (active.length * habitIds.length)) * 100) : 0;
  }, [data.days, days, today, habitIds]);

  const habitRates = useMemo(() => habitCompletionRates(data, days, config.habits, config.startDate, config.totalDays), [data, days, config.habits, config.startDate, config.totalDays]);

  const dailyLine = useMemo(
    () => days.map((iso) => {
      const dn = challengeDayNumber(iso, config.startDate, config.totalDays);
      const d = data.days[iso];
      return { day: dn, pct: d ? completionPct(d, habitIds) : 0 };
    }).filter((x) => x.day > 0),
    [data.days, days, config.startDate, config.totalDays, habitIds],
  );

  const weeklyBars = useMemo(() => {
    return Array.from({ length: totalWeeks }, (_, i) => {
      const w = i + 1;
      const ws = i * 7;
      const weekDays = days.slice(ws, ws + 7).filter((iso) => iso < today);
      if (!weekDays.length) return { week: `Wk ${w}`, pct: 0 };
      const total = weekDays.reduce((acc, iso) => acc + habitsDone(data.days[iso] ?? emptyDay(habitIds), habitIds), 0);
      return { week: `Wk ${w}`, pct: habitIds.length ? Math.round((total / (weekDays.length * habitIds.length)) * 100) : 0 };
    });
  }, [data.days, days, today, totalWeeks, habitIds]);

  const strongest = useMemo(() => [...habitRates].sort((a, b) => b.pct - a.pct)[0], [habitRates]);
  const weakest = useMemo(() => [...habitRates].sort((a, b) => a.pct - b.pct)[0], [habitRates]);

  return (
    <div className="space-y-5 animate-fadeIn">
      <Card>
        <SectionTitle title="Progress" subtitle={`Your gentle bloom across ${config.totalDays} days`} icon={<TrendingUp size={22} />} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Overall" value={`${overallPct}%`} accent="text-blush-500" />
          <StatCard label="Days logged" value={days.filter((iso) => data.days[iso] && habitsDone(data.days[iso]!, habitIds) > 0).length} accent="text-sage-500" />
          <StatCard label="Strongest habit" value={<span className="text-base">{strongest?.label}</span>} accent="text-lavender-400" />
          <StatCard label="Gentle focus" value={<span className="text-base">{weakest?.label}</span>} accent="text-gold-500" />
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 font-serif text-lg text-ink-800 dark:text-cream-100">Habit-wise completion</h3>
        <ResponsiveContainer width="100%" height={360}>
            <BarChart data={habitRates} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F8E4D2" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#8a7a6a' }} />
              <YAxis type="category" dataKey="label" width={110} tick={{ fontSize: 11, fill: '#8a7a6a' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} formatter={(v) => [`${v}%`, 'Done']} />
              <Bar dataKey="pct" radius={[0, 6, 6, 0]}>
                {habitRates.map((h, i) => (
                  <Cell key={i} fill={h.pct >= 70 ? '#A8C9A1' : h.pct >= 40 ? '#FFA8C5' : '#E8CB83'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
      </Card>

      <Card>
        <h3 className="mb-3 font-serif text-lg text-ink-800 dark:text-cream-100">Daily completion %</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dailyLine} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F8E4D2" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8a7a6a' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#8a7a6a' }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
            <Line type="monotone" dataKey="pct" stroke="#F56B96" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h3 className="mb-3 font-serif text-lg text-ink-800 dark:text-cream-100">Weekly comparison</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyBars} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F8E4D2" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#8a7a6a' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#8a7a6a' }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} formatter={(v) => [`${v}%`, 'Complete']} />
            <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
              {weeklyBars.map((b, i) => (
                <Cell key={i} fill={b.pct >= 70 ? '#A8C9A1' : b.pct >= 40 ? '#FFA8C5' : '#E8CB83'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="bg-gradient-to-br from-sage-50 to-blush-50 dark:from-sage-600/10 dark:to-blush-300/10">
        <div className="flex items-start gap-3">
          <Heart className="mt-1 text-blush-400" size={20} />
          <div className="text-sm text-ink-800 dark:text-cream-100">
            {strongest && (
              <p className="mb-2">
                <span className="font-semibold">{strongest.label}</span> is your strongest habit at {strongest.pct}%. Keep tending it — it's clearly rooted in you. 🌷
              </p>
            )}
            {weakest && weakest.pct < 70 && (
              <p>
                <span className="font-semibold">{weakest.label}</span> is your gentle focus area at {weakest.pct}%. No shame — a single sincere step tomorrow is enough. Return with intention.
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
