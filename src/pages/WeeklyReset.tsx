import { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, SectionTitle } from '../components/ui';
import { useBloom } from '../store';
import {
  allChallengeDays,
  challengeDayNumber,
  emptyWeek,
  isDayComplete,
  weekDateRange,
  todayISO,
} from '../types';

export default function WeeklyReset() {
  const { data, setData, config } = useBloom();
  const totalWeeks = Math.ceil(config.totalDays / 7);
  const [week, setWeekState] = useWeekState(config.startDate, config.totalDays);
  const days = useMemo(() => allChallengeDays(config.startDate, config.totalDays), [config.startDate, config.totalDays]);

  const wk = data.weeks[week] ?? emptyWeek();
  const range = weekDateRange(week, config.startDate, config.totalDays);

  const summary = useMemo(() => {
    const ws = (week - 1) * 7;
    const weekDays = days.slice(ws, ws + 7);
    const active = weekDays.filter((iso) => {
      const n = challengeDayNumber(iso, config.startDate, config.totalDays);
      return n > 0 && iso <= todayISO();
    });
    const completed = active.filter((iso) => {
      const d = data.days[iso];
      return d && isDayComplete(d, config.completionThreshold, config.habits.map((habit) => habit.id));
    });
    const habitPct = active.length ? Math.round((completed.length / active.length) * 100) : 0;
    const dsaProblems = weekDays.reduce((acc, iso) => acc + (data.days[iso]?.dsa.solved ?? 0), 0);
    return { habitPct, dsaProblems, daysActive: active.length, completed: completed.length };
  }, [data.days, days, week, config.startDate, config.totalDays, config.completionThreshold, config.habits]);

  const setField = (field: keyof typeof wk, value: string | number) => {
    setData((p) => ({
      ...p,
      weeks: { ...p.weeks, [week]: { ...(p.weeks[week] ?? emptyWeek()), [field]: value } },
    }));
  };

  const questionValue = (id: string, field?: string) => {
    if (field && ['achievement', 'dsa', 'spiritual', 'learned', 'difficult', 'improve', 'proud'].includes(field)) {
      return wk[field as keyof typeof wk] as string;
    }
    return wk.customAnswers?.[id] ?? '';
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <Card>
        <SectionTitle title="Weekly Reset" subtitle={`${totalWeeks} gentle check-ins across your ${config.totalDays}-day plan`} icon={<RefreshCw size={22} />} />

        <div className="mb-5 flex flex-wrap items-center gap-2">
          {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((w) => (
            <button
              key={w}
              onClick={() => setWeekState(w)}
              className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition ${
                week === w
                  ? 'bg-blush-300 text-white shadow-petal'
                  : 'bg-white/60 text-ink-700/70 hover:bg-cream-50 dark:bg-white/5 dark:text-cream-100/70'
              }`}
            >
              Wk {w}
            </button>
          ))}
        </div>

        <div className="mb-4 rounded-xl bg-cream-200/60 dark:bg-white/5 p-4">
          <p className="font-serif text-lg text-ink-800 dark:text-cream-100">Week {week} of {totalWeeks}</p>
          <p className="text-sm text-ink-700/60 dark:text-cream-100/50">{range.startLabel} – {range.endLabel}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <span className="chip bg-blush-100 text-blush-600 dark:bg-blush-300/20 dark:text-blush-200">Habit completion: {summary.habitPct}%</span>
            <span className="chip bg-sage-100 text-sage-600 dark:bg-sage-600/25 dark:text-sage-200">DSA problems: {summary.dsaProblems}</span>
            <span className="chip bg-gold-100 text-gold-500">Days complete: {summary.completed}/{summary.daysActive}</span>
          </div>
        </div>

        <div className="space-y-4">
          {config.weeklyQuestions.map((question) => (
            <div key={question.id}>
              <label className="label">{question.label}</label>
              <textarea
                className="field min-h-[70px]"
                placeholder={question.placeholder}
                value={questionValue(question.id, question.field)}
                onChange={(e) => {
                  if (question.field && ['achievement', 'dsa', 'spiritual', 'learned', 'difficult', 'improve', 'proud'].includes(question.field)) {
                    setField(question.field as keyof typeof wk, e.target.value);
                  } else {
                    setData((p) => ({
                      ...p,
                      weeks: {
                        ...p.weeks,
                        [week]: { ...(p.weeks[week] ?? emptyWeek()), customAnswers: { ...(p.weeks[week]?.customAnswers ?? {}), [question.id]: e.target.value } },
                      },
                    }));
                  }
                }}
              />
            </div>
          ))}

          <div>
            <label className="label">{config.weeklyRatingQuestion}</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={10}
                value={wk.rating}
                onChange={(e) => setField('rating', Number(e.target.value))}
                className="flex-1"
              />
              <span className="w-10 text-center font-serif text-xl text-blush-500">{wk.rating}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Week selection stays local to this page.
function useWeekState(startDate: string, totalDays: number): [number, (w: number) => void] {
  const [w, setW] = useState(() => {
    const today = new Date(`${todayISO()}T00:00:00`);
    const start = new Date(`${startDate}T00:00:00`);
    const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
    if (diff < 0) return 1;
    return Math.min(Math.ceil(totalDays / 7), Math.floor(diff / 7) + 1);
  });
  useEffect(() => {
    const today = new Date(`${todayISO()}T00:00:00`);
    const start = new Date(`${startDate}T00:00:00`);
    const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
    setW(diff < 0 ? 1 : Math.min(Math.ceil(totalDays / 7), Math.floor(diff / 7) + 1));
  }, [startDate, totalDays]);
  return [w, setW];
}
