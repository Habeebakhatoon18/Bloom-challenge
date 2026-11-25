import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { Code2 } from 'lucide-react';
import { Card, SectionTitle, StatCard, EmptyHint } from '../components/ui';
import { useBloom } from '../store';
import {
  addDays,
  allChallengeDays,
  challengeDayNumber,
  ensureDay,
  formatDayRow,
  statusOfDay,
} from '../types';
import { DSA_TOPICS } from '../constants';

const PIE_COLORS = ['#FFA8C5', '#A8C9A1', '#9D86D0', '#D9B25A', '#F6A5A5', '#85B07C', '#BBAAE0', '#E8CB83', '#FFC9DA', '#C9DFC4'];

export default function DsaTracker() {
  const { data, updateDay, selectedDay, setSelectedDay, config } = useBloom();
  const days = useMemo(() => allChallengeDays(config.startDate, config.totalDays), [config.startDate, config.totalDays]);

  const day = ensureDay(data, selectedDay);
  const move = (delta: number) => {
    const next = addDays(selectedDay, delta);
    const dn = challengeDayNumber(next, config.startDate, config.totalDays);
    if (dn === 0 || dn === -1) return;
    setSelectedDay(next);
  };

  const totals = useMemo(() => {
    let total = 0;
    let activeDays = 0;
    const perDay: { day: number; solved: number }[] = [];
    const topicMap: Record<string, number> = {};
    days.forEach((iso) => {
      const d = data.days[iso];
      const solved = d?.dsa.solved ?? 0;
      const dn = challengeDayNumber(iso, config.startDate, config.totalDays);
      if (dn > 0) perDay.push({ day: dn, solved });
      total += solved;
      if (solved > 0) activeDays += 1;
      const t = d?.dsa.topic;
      if (t && solved > 0) topicMap[t] = (topicMap[t] ?? 0) + solved;
    });
    const topicData = Object.entries(topicMap).map(([name, value]) => ({ name, value }));
    return {
      total,
      avg: activeDays ? (total / activeDays).toFixed(1) : '0',
      perDay,
      topicData,
    };
  }, [data.days, days, config.startDate, config.totalDays]);

  const isFuture = statusOfDay(selectedDay, config.startDate, config.totalDays) === 'upcoming';

  return (
    <div className="space-y-5 animate-fadeIn">
      <Card>
        <SectionTitle title="DSA Tracker" subtitle="Problems solved, topics and notes" icon={<Code2 size={22} />} />
        <div className="mb-5 flex items-center justify-between gap-2">
          <button className="btn-ghost" onClick={() => move(-1)}>‹ Prev</button>
          <div className="text-center font-serif text-lg text-ink-800 dark:text-cream-100">
            Day {challengeDayNumber(selectedDay, config.startDate, config.totalDays)} · {formatDayRow(selectedDay)}
          </div>
          <button className="btn-ghost" onClick={() => move(1)}>Next ›</button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="label">Problems solved</label>
            <input
              type="number"
              min={0}
              className="field"
              value={day.dsa.solved}
              onChange={(e) => updateDay(selectedDay, (d) => { d.dsa.solved = Math.max(0, Number(e.target.value)); })}
            />
          </div>
          <div>
            <label className="label">Topic</label>
            <input
              list="dsa-topics"
              className="field"
              placeholder="Arrays, Trees…"
              value={day.dsa.topic}
              onChange={(e) => updateDay(selectedDay, (d) => { d.dsa.topic = e.target.value; })}
            />
            <datalist id="dsa-topics">
              {DSA_TOPICS.map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>
          <div>
            <label className="label">Notes / links</label>
            <input
              className="field"
              placeholder="Problem name, link, reflection"
              value={day.dsa.notes}
              onChange={(e) => updateDay(selectedDay, (d) => { d.dsa.notes = e.target.value; })}
            />
          </div>
        </div>
        {isFuture && <p className="mt-3 text-xs text-gold-500">This is an upcoming day — plan ahead if you like.</p>}
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="Total problems" value={totals.total} accent="text-blush-500" />
        <StatCard label="Avg / active day" value={totals.avg} accent="text-sage-500" />
        <StatCard label="Active days" value={totals.topicData.length ? Math.round(totals.total / Number(totals.avg || 1)) : 0} accent="text-gold-500" />
      </div>

      <Card>
        <h3 className="mb-3 font-serif text-lg text-ink-800 dark:text-cream-100">Problems per day</h3>
        {totals.total === 0 ? (
          <EmptyHint>No problems logged yet. Even one counts. 🌱</EmptyHint>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={totals.perDay} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F8E4D2" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8a7a6a' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#8a7a6a' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 6px 24px -8px rgba(0,0,0,0.15)' }} />
              <Bar dataKey="solved" fill="#FFA8C5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card>
        <h3 className="mb-3 font-serif text-lg text-ink-800 dark:text-cream-100">Topic breakdown</h3>
        {totals.topicData.length === 0 ? (
          <EmptyHint>Add topics to see your focus areas bloom.</EmptyHint>
        ) : (
          <div className="grid items-center gap-4 md:grid-cols-2">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={totals.topicData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={2}>
                  {totals.topicData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="space-y-1.5">
              {totals.topicData.map((t, i) => (
                <li key={t.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {t.name}
                  </span>
                  <span className="font-semibold text-ink-800 dark:text-cream-100">{t.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
