import { CalendarHeart } from 'lucide-react';
import { Card, SectionTitle, BloomCheckbox } from '../components/ui';
import { useBloom } from '../store';

export default function Planner() {
  const { data, setData, config } = useBloom();
  const days = config.plannerDays;

  const setTT = (row: string, day: string, value: string) => {
    setData((p) => ({
      ...p,
      planner: {
        ...p.planner,
        timetable: { ...p.planner.timetable, [`${row}|${day}`]: value },
      },
    }));
  };

  const setLearn = (day: string, patch: Partial<{ topic: string; completed: boolean }>) => {
    setData((p) => ({
      ...p,
      planner: {
        ...p.planner,
        learningPlan: {
          ...p.planner.learningPlan,
          [day]: { ...(p.planner.learningPlan[day] ?? { topic: '', completed: false }), ...patch },
        },
      },
    }));
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <Card>
        <SectionTitle title="Weekly Planner" subtitle="Fill this around college, prayer times, energy & commitments." icon={<CalendarHeart size={22} />} />
      </Card>

      <Card className="p-3 sm:p-4">
        <h3 className="mb-3 font-serif text-lg text-ink-800 dark:text-cream-100">Weekly timetable</h3>
        <div className="scroll-slim overflow-x-auto">
          <table className="w-full border-separate border-spacing-1 text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-white/95 dark:bg-[#2a2420]/95 px-2 py-2 text-left font-semibold text-ink-700/80 dark:text-cream-100/80">Time</th>
                {days.map((d) => (
                  <th key={d} className="px-2 py-2 text-center font-semibold text-ink-700/70 dark:text-cream-100/70">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {config.plannerRows.map((row) => (
                <tr key={row}>
                  <td className="sticky left-0 z-10 bg-white/95 dark:bg-[#2a2420]/95 px-2 py-1.5 whitespace-nowrap text-xs font-semibold text-ink-700/70 dark:text-cream-100/70">
                    {row}
                  </td>
                  {days.map((d) => (
                    <td key={d} className="p-0.5">
                      <input
                        className="field min-w-[80px] text-xs"
                        placeholder="—"
                        value={data.planner.timetable[`${row}|${d}`] ?? ''}
                        onChange={(e) => setTT(row, d, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 font-serif text-lg text-ink-800 dark:text-cream-100">Technical learning plan</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {days.map((d) => {
            const lp = data.planner.learningPlan[d] ?? { topic: '', completed: false };
            return (
              <div key={d} className="rounded-xl border border-cream-300 bg-white p-3 dark:bg-white/5 dark:border-white/10">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-serif text-sm font-semibold text-blush-500">{d}</span>
                  <BloomCheckbox
                    checked={lp.completed}
                    onChange={() => setLearn(d, { completed: !lp.completed })}
                    ariaLabel={`${d} completed`}
                    size="sm"
                    tone="sage"
                  />
                </div>
                <input
                  className="field text-sm"
                  placeholder="Topic"
                  value={lp.topic}
                  onChange={(e) => setLearn(d, { topic: e.target.value })}
                />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
