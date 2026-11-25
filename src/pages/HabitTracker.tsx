import { useMemo, useState } from 'react';
import { ListChecks } from 'lucide-react';
import { Card, SectionTitle, BloomCheckbox, dayTintClass, ToggleGroup } from '../components/ui';
import { useBloom } from '../store';
import {
  allChallengeDays,
  challengeDayNumber,
  formatDayRow,
  statusOfDay,
} from '../types';

export default function HabitTracker() {
  const { data, updateDay, config } = useBloom();
  const [part, setPart] = useState<'1' | '2'>('1');

  const allDays = useMemo(() => allChallengeDays(config.startDate, config.totalDays), [config.startDate, config.totalDays]);
  const split = Math.ceil(config.totalDays / 2);
  const activePart = config.totalDays > 1 ? part : '1';
  const days = activePart === '1' ? allDays.slice(0, split) : allDays.slice(split);
  const habits = config.habits;

  const toggle = (iso: string, habitIndex: number) => {
    const id = habits[habitIndex]?.id;
    if (id) updateDay(iso, (d) => { d.habits[id] = !d.habits[id]; });
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SectionTitle
            title="Habit Tracker"
            subtitle={`${config.totalDays} days · ${habits.length} habits · tick what you can`}
            icon={<ListChecks size={22} />}
          />
          {config.totalDays > 1 && (
            <ToggleGroup
              value={activePart}
              onChange={setPart}
              options={[
                { value: '1', label: `Part 1 · Days 1–${split}` },
                { value: '2', label: `Part 2 · Days ${split + 1}–${config.totalDays}` },
              ]}
            />
          )}
        </div>
      </Card>

      <Card className="p-3 sm:p-4">
        <div className="scroll-slim overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-white/95 dark:bg-[#2a2420]/95 px-3 py-2 text-left font-semibold text-ink-700/80 dark:text-cream-100/80 backdrop-blur">
                  Day
                </th>
                {habits.map((h) => (
                  <th key={h.id} className="px-2 py-2 text-center font-semibold text-ink-700/70 dark:text-cream-100/70 whitespace-nowrap">
                    <span className="block text-[11px]">{h.shortLabel}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((iso) => {
                const dn = challengeDayNumber(iso, config.startDate, config.totalDays);
                const status = statusOfDay(iso, config.startDate, config.totalDays);
                const day = data.days[iso];
                const tint = dayTintClass(iso);
                const isToday = iso === todayISO();
                return (
                  <tr
                    key={iso}
                    className={`${tint} ${isToday ? 'ring-2 ring-inset ring-blush-300' : ''} rounded-lg`}
                  >
                    <td className={`sticky left-0 z-10 ${tint} bg-inherit px-3 py-2 whitespace-nowrap`}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink-800 dark:text-cream-100">Day {dn}</span>
                        <span className="text-xs text-ink-700/60 dark:text-cream-100/50">{formatDayRow(iso)}</span>
                        {status === 'upcoming' && <span className="chip bg-cream-200 text-ink-700/50 text-[10px]">soon</span>}
                      </div>
                    </td>
                    {habits.map((h, i) => {
                      const checked = !!day?.habits[h.id];
                      const tone = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].includes(h.id) ? 'sage' : 'default';
                      return (
                        <td key={h.id} className="px-2 py-2 text-center">
                          <div className="flex justify-center">
                            <BloomCheckbox
                              checked={checked}
                              onChange={() => toggle(iso, i)}
                              ariaLabel={`${h.label} day ${dn}`}
                              size="sm"
                              tone={tone as 'sage' | 'default'}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-center text-xs text-ink-700/60 dark:text-cream-100/50">
          Friday green · Sunday red · Exercise has its own plan · Consistency over perfection
        </p>
      </Card>
    </div>
  );
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
