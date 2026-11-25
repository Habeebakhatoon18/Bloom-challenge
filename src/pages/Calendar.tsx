import { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import { Card, SectionTitle } from '../components/ui';
import { useBloom } from '../store';
import {
  addDays,
  allChallengeDays,
  challengeDayNumber,
  completionPct,
  fromISODate,
  isFriday,
  isSunday,
  todayISO,
  toISODate,
  formatShort,
  MONTH_NAMES,
  WEEKDAY_SHORT,
  AppData,
} from '../types';

export default function Calendar({ onNavigate }: { onNavigate: (tab: string, day?: string) => void }) {
  const { data, setSelectedDay, config } = useBloom();
  const challengeSet = useMemo(() => new Set(allChallengeDays(config.startDate, config.totalDays)), [config.startDate, config.totalDays]);
  const months = useMemo(() => {
    const start = fromISODate(config.startDate);
    const end = fromISODate(addDays(config.startDate, config.totalDays - 1));
    const values: { y: number; m: number }[] = [];
    for (let date = new Date(start.getFullYear(), start.getMonth(), 1); date <= end; date = new Date(date.getFullYear(), date.getMonth() + 1, 1)) {
      values.push({ y: date.getFullYear(), m: date.getMonth() });
    }
    return values;
  }, [config.startDate, config.totalDays]);
  const today = todayISO();

  const openDay = (iso: string) => {
    if (!challengeSet.has(iso)) return;
    setSelectedDay(iso);
    onNavigate('journal', iso);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <Card>
        <SectionTitle title="Calendar" subtitle={`${formatShort(config.startDate)} – ${formatShort(addDays(config.startDate, config.totalDays - 1))} · click a challenge day`} icon={<CalendarDays size={22} />} />
        <div className={`grid gap-5 ${months.length === 1 ? 'md:grid-cols-1' : months.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
          {months.map(({ y, m }) => (
            <MonthGrid key={`${y}-${m}`} y={y} m={m} data={data} challengeSet={challengeSet} today={today} onOpen={openDay} config={config} />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-ink-700/60 dark:text-cream-100/50">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-sage-100" /> Friday</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-rose-100" /> Sunday</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full ring-2 ring-blush-300" /> Today</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-cream-300/50" /> Outside challenge</span>
        </div>
      </Card>
    </div>
  );
}

function MonthGrid({
  y, m, data, challengeSet, today, onOpen,
  config,
}: {
  y: number; m: number;
  data: AppData; challengeSet: Set<string>; today: string;
  onOpen: (iso: string) => void;
  config: ReturnType<typeof useBloom>['config'];
}) {
  const first = new Date(y, m, 1);
  const startCol = first.getDay(); // 0=Sun
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const cells: (string | null)[] = [];
  for (let i = 0; i < startCol; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(toISODate(new Date(y, m, d)));
  }

  return (
    <div className="rounded-2xl border border-cream-300 bg-white p-3 dark:bg-white/5 dark:border-white/10">
      <h3 className="mb-2 text-center font-serif text-lg text-ink-800 dark:text-cream-100">
        {MONTH_NAMES[m]} {y}
      </h3>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-ink-700/50 dark:text-cream-100/40">
        {WEEKDAY_SHORT.map((w) => <div key={w}>{w}</div>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((iso, i) => {
          if (!iso) return <div key={i} />;
          const inChallenge = challengeSet.has(iso);
          const isToday = iso === today;
          const dn = inChallenge ? challengeDayNumber(iso, config.startDate, config.totalDays) : null;
          const d = data.days[iso];
          const pct = d ? completionPct(d, config.habits.map((habit) => habit.id)) : 0;
          const fri = isFriday(iso);
          const sun = isSunday(iso);
          let bg = 'bg-cream-100 dark:bg-white/5 text-ink-700/40 dark:text-cream-100/30';
          if (inChallenge) {
            if (fri) bg = 'bg-sage-100 dark:bg-sage-600/30 text-sage-600 dark:text-sage-100';
            else if (sun) bg = 'bg-rose-100 dark:bg-rose-400/25 text-rose-400 dark:text-rose-100';
            else bg = 'bg-white dark:bg-white/10 text-ink-800 dark:text-cream-100';
          }
          return (
            <button
              key={i}
              disabled={!inChallenge}
              onClick={() => onOpen(iso)}
              className={`relative aspect-square rounded-lg text-xs font-medium transition ${bg} ${
                inChallenge ? 'hover:scale-105 hover:shadow-sm' : 'cursor-default'
              } ${isToday ? 'ring-2 ring-blush-300' : ''}`}
              title={inChallenge ? `Day ${dn} · ${pct}%` : 'Outside challenge'}
            >
              <span>{fromISODate(iso).getDate()}</span>
              {inChallenge && dn && (
                <span className="absolute bottom-0.5 left-0 right-0 text-[8px] opacity-60">D{dn}</span>
              )}
              {inChallenge && pct > 0 && (
                <span
                  className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full"
                  style={{ background: pct >= 70 ? '#649159' : pct >= 40 ? '#D8507C' : '#D9B25A' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
