import { useMemo, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { Card, SectionTitle, EmptyHint } from '../components/ui';
import { useBloom } from '../store';
import { addDays, allChallengeDays, challengeDayNumber, ensureDay, formatDayRow } from '../types';

export default function LearningTracker() {
  const { data, updateDay, selectedDay, setSelectedDay, config } = useBloom();
  const [query, setQuery] = useState('');
  const days = useMemo(() => allChallengeDays(config.startDate, config.totalDays), [config.startDate, config.totalDays]);

  const day = ensureDay(data, selectedDay);
  const move = (delta: number) => {
    const next = addDays(selectedDay, delta);
    const dn = challengeDayNumber(next, config.startDate, config.totalDays);
    if (dn === 0 || dn === -1) return;
    setSelectedDay(next);
  };

  const past = useMemo(() => {
    return days
      .map((iso) => ({ iso, d: data.days[iso] }))
      .filter((x) => x.d && (x.d.learning.technical.trim() || x.d.learning.project.trim()))
      .filter((x) => {
        if (!query) return true;
        const q = query.toLowerCase();
        return (
          x.d!.learning.technical.toLowerCase().includes(q) ||
          x.d!.learning.project.toLowerCase().includes(q)
        );
      })
      .reverse();
  }, [data.days, days, query]);

  return (
    <div className="space-y-5 animate-fadeIn">
      <Card>
        <SectionTitle title="Learning Tracker" subtitle="Technical + Project learning, one day at a time" icon={<BookOpen size={22} />} />
        <div className="mb-5 flex items-center justify-between gap-2">
          <button className="btn-ghost" onClick={() => move(-1)}>‹ Prev</button>
          <div className="text-center font-serif text-lg text-ink-800 dark:text-cream-100">
            Day {challengeDayNumber(selectedDay, config.startDate, config.totalDays)} · {formatDayRow(selectedDay)}
          </div>
          <button className="btn-ghost" onClick={() => move(1)}>Next ›</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Technical learning — what I solved, revised or understood</label>
            <textarea
              className="field min-h-[90px]"
              placeholder="e.g. revised sliding window; solved two-sum variant"
              value={day.learning.technical}
              onChange={(e) => updateDay(selectedDay, (d) => { d.learning.technical = e.target.value; })}
            />
          </div>
          <div>
            <label className="label">Project learning — what I explored or made progress on</label>
            <textarea
              className="field min-h-[90px]"
              placeholder="e.g. built the auth flow; explored a new library"
              value={day.learning.project}
              onChange={(e) => updateDay(selectedDay, (d) => { d.learning.project = e.target.value; })}
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-serif text-lg text-ink-800 dark:text-cream-100">Past entries</h3>
          <div className="relative">
            <Search size={15} className="absolute left-2.5 top-2.5 text-ink-700/40" />
            <input
              className="field pl-8 w-40 sm:w-56"
              placeholder="Search entries"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        {past.length === 0 ? (
          <EmptyHint>No entries yet. Your first note is a seed. 🌱</EmptyHint>
        ) : (
          <div className="space-y-3">
            {past.map(({ iso, d }) => (
              <button
                key={iso}
                onClick={() => setSelectedDay(iso)}
                className="w-full text-left rounded-xl border border-cream-300 bg-white p-4 transition hover:border-blush-300 dark:bg-white/5 dark:border-white/10"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-serif text-sm font-semibold text-blush-500">
                    Day {challengeDayNumber(iso, config.startDate, config.totalDays)} · {formatDayRow(iso)}
                  </span>
                </div>
                {d!.learning.technical && (
                  <p className="text-sm text-ink-800 dark:text-cream-100"><span className="font-semibold">Tech:</span> {d!.learning.technical}</p>
                )}
                {d!.learning.project && (
                  <p className="mt-1 text-sm text-ink-800 dark:text-cream-100"><span className="font-semibold">Project:</span> {d!.learning.project}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
