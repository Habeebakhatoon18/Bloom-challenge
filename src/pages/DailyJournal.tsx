import { useMemo } from 'react';
import { NotebookPen } from 'lucide-react';
import { Card, SectionTitle } from '../components/ui';
import { useBloom } from '../store';
import {
  addDays,
  allChallengeDays,
  challengeDayNumber,
  ensureDay,
  formatDayRow,
} from '../types';
import { MOODS } from '../constants';
import type { PlanQuestion } from '../constants';

type DailyField = 'intention' | 'spiritual' | 'dsaLearning' | 'projectLearning' | 'win' | 'lesson' | 'gratitude';
const DAILY_FIELDS: DailyField[] = ['intention', 'spiritual', 'dsaLearning', 'projectLearning', 'win', 'lesson', 'gratitude'];

export default function DailyJournal() {
  const { data, updateDay, selectedDay, setSelectedDay, config } = useBloom();
  const days = useMemo(() => allChallengeDays(config.startDate, config.totalDays), [config.startDate, config.totalDays]);

  const day = ensureDay(data, selectedDay);
  const j = day.journal;
  const move = (delta: number) => {
    const next = addDays(selectedDay, delta);
    const dn = challengeDayNumber(next, config.startDate, config.totalDays);
    if (dn === 0 || dn === -1) return;
    setSelectedDay(next);
  };

  const questionValue = (question: PlanQuestion) => {
    if (question.field && DAILY_FIELDS.includes(question.field as DailyField)) return j[question.field as DailyField];
    return j.customAnswers?.[question.id] ?? '';
  };
  const setQuestion = (question: PlanQuestion, value: string) => {
    updateDay(selectedDay, (d) => {
      if (question.field && DAILY_FIELDS.includes(question.field as DailyField)) d.journal[question.field as DailyField] = value;
      else d.journal.customAnswers[question.id] = value;
    });
  };
  const setPriority = (i: number, value: string) => {
    updateDay(selectedDay, (d) => {
      const arr = [...d.journal.priorities] as [string, string, string];
      arr[i] = value;
      d.journal.priorities = arr;
    });
  };

  const daysJournaled = useMemo(
    () => days.filter((iso) => {
      const jj = data.days[iso]?.journal;
      return jj && (jj.intention.trim() || jj.gratitude.trim() || jj.mood || jj.win.trim());
    }).length,
    [data.days, days],
  );

  return (
    <div className="space-y-5 animate-fadeIn">
      <Card>
        <SectionTitle title="Daily Journal" subtitle="A gentle page for your day" icon={<NotebookPen size={22} />} />
        <div className="mb-5 flex items-center justify-between gap-2">
          <button className="btn-ghost" onClick={() => move(-1)}>‹ Prev</button>
          <div className="text-center">
            <div className="font-serif text-lg text-ink-800 dark:text-cream-100">
              Day {challengeDayNumber(selectedDay, config.startDate, config.totalDays)} of {config.totalDays} · {formatDayRow(selectedDay)}
            </div>
            <span className="text-xs text-ink-700/60 dark:text-cream-100/50">{daysJournaled} days journaled</span>
          </div>
          <button className="btn-ghost" onClick={() => move(1)}>Next ›</button>
        </div>

        <div className="mb-5">
          {config.showMood && (
            <>
              <label className="label">{config.moodQuestion}</label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
              <button
                key={m.emoji}
                onClick={() => updateDay(selectedDay, (d) => { d.journal.mood = j.mood === m.emoji ? '' : m.emoji; })}
                className={`rounded-2xl border-2 px-3 py-2 text-center transition ${
                  j.mood === m.emoji
                    ? 'border-blush-300 bg-blush-50 dark:bg-blush-300/15'
                    : 'border-cream-300 bg-white hover:bg-cream-100 dark:bg-white/5 dark:border-white/10'
                }`}
              >
                <div className="text-xl">{m.emoji}</div>
                <div className="text-[10px] text-ink-700/60 dark:text-cream-100/60">{m.label}</div>
              </button>
                ))}
              </div>
            </>
          )}
        </div>

        {config.showPriorities && (
        <div className="mb-5">
          <label className="label">{config.prioritiesQuestion}</label>
          <div className="grid gap-2 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <input
                key={i}
                className="field"
                placeholder={`Priority ${i + 1}`}
                value={j.priorities[i]}
                onChange={(e) => setPriority(i, e.target.value)}
              />
            ))}
          </div>
        </div>
        )}

        <div className="space-y-4">
          {config.dailyQuestions.map((question) => (
            <div key={question.id}>
              <label className="label">{question.label}</label>
              <textarea
                className="field min-h-[80px]"
                placeholder={question.placeholder}
                value={questionValue(question)}
                onChange={(e) => setQuestion(question, e.target.value)}
              />
            </div>
          ))}
        </div>

        <p className="mt-5 text-center text-xs italic text-ink-700/60 dark:text-cream-100/50">
          A missed checkbox is information, not failure. Return with a sincere intention tomorrow.
        </p>
      </Card>
    </div>
  );
}
