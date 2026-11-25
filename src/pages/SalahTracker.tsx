import { useMemo, useState } from 'react';
import { Heart } from 'lucide-react';
import { Card, SectionTitle, BloomCheckbox, LabeledCheckbox, dayBadgeClass } from '../components/ui';
import { useBloom } from '../store';
import {
  addDays,
  allChallengeDays,
  challengeDayNumber,
  formatDayRow,
  emptyDay,
  salahDone,
  todayISO,
} from '../types';
import { SALAH_HABITS } from '../constants';

function heatColor(count: number): string {
  if (count === 0) return 'bg-cream-200 dark:bg-white/5';
  if (count <= 2) return 'bg-sage-100 dark:bg-sage-600/30';
  if (count <= 4) return 'bg-sage-300 dark:bg-sage-400/60';
  return 'bg-sage-500 dark:bg-sage-300';
}

export default function SalahTracker() {
  const { data, updateDay, selectedDay, setSelectedDay, config } = useBloom();
  const [showExtras, setShowExtras] = useState(true);
  const days = useMemo(() => allChallengeDays(config.startDate, config.totalDays), [config.startDate, config.totalDays]);
  const prayerHabits = config.habits.filter((habit) => SALAH_HABITS.includes(habit.id)).map((habit) => habit.id);
  const habitLabel = (id: string) => config.habits.find((habit) => habit.id === id)?.label ?? id;

  const day = data.days[selectedDay] ?? emptyDay(config.habits.map((habit) => habit.id));
  const salahCount = salahDone(day, prayerHabits);
  const today = todayISO();

  const move = (delta: number) => {
    const next = addDays(selectedDay, delta);
    const dn = challengeDayNumber(next, config.startDate, config.totalDays);
    if (dn === 0 || dn === -1) return;
    setSelectedDay(next);
  };

  const extras: ('tahajjud' | 'wazifa' | 'quran')[] = ['tahajjud', 'wazifa', 'quran'].filter((id) => config.habits.some((habit) => habit.id === id)) as ('tahajjud' | 'wazifa' | 'quran')[];

  return (
    <div className="space-y-5 animate-fadeIn">
      <Card>
        <SectionTitle title="Salah Tracker" subtitle={`${prayerHabits.length} daily prayers, one day at a time`} icon={<Heart size={22} />} />

        <div className="mb-5 flex items-center justify-between gap-2">
          <button className="btn-ghost" onClick={() => move(-1)} aria-label="Previous day">‹ Prev</button>
          <div className="text-center">
            <div className="font-serif text-lg text-ink-800 dark:text-cream-100">
              Day {challengeDayNumber(selectedDay, config.startDate, config.totalDays)} · {formatDayRow(selectedDay)}
            </div>
            <span className={dayBadgeClass(selectedDay)}>
              {new Date(selectedDay).getDay() === 5 ? 'Friday' : new Date(selectedDay).getDay() === 0 ? 'Sunday' : 'Weekday'}
            </span>
          </div>
          <button className="btn-ghost" onClick={() => move(1)} aria-label="Next day">Next ›</button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {prayerHabits.map((h) => {
            const checked = !!day.habits?.[h];
            return (
              <div
                key={h}
                role="button"
                tabIndex={0}
                onClick={() => updateDay(selectedDay, (d) => { d.habits[h] = !d.habits[h]; })}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    updateDay(selectedDay, (d) => { d.habits[h] = !d.habits[h]; });
                  }
                }}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-5 transition cursor-pointer ${
                  checked
                    ? 'border-sage-400 bg-sage-100 dark:bg-sage-600/20 dark:border-sage-400/40'
                    : 'border-cream-300 bg-white/70 hover:bg-cream-100 dark:bg-white/5 dark:border-white/15'
                }`}
              >
                <BloomCheckbox checked={checked} onChange={() => updateDay(selectedDay, (d) => { d.habits[h] = !d.habits[h]; })} ariaLabel={habitLabel(h)} size="lg" tone="sage" />
                <span className="font-serif text-lg text-ink-900 dark:text-cream-100">{habitLabel(h)}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 text-center text-sm text-ink-700 dark:text-cream-100/60">
          {salahCount} of {prayerHabits.length} prayers today
        </div>

        <div className="mt-5">
          <button
            className="btn-ghost text-xs"
            onClick={() => setShowExtras((s) => !s)}
          >
            {showExtras ? 'Hide' : 'Show'} Tahajjud · Wazifa · Quran
          </button>
          {showExtras && (
            <div className="mt-3 flex flex-wrap gap-4">
              {extras.map((h) => (
                <LabeledCheckbox
                  key={h}
                  checked={!!day.habits?.[h]}
                  onChange={() => updateDay(selectedDay, (d) => { d.habits[h] = !d.habits[h]; })}
                  ariaLabel={habitLabel(h)}
                  label={habitLabel(h)}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 font-serif text-lg text-ink-800 dark:text-cream-100">{config.totalDays}-day prayer heatmap</h3>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {days.map((iso) => {
            const count = data.days[iso] ? salahDone(data.days[iso], prayerHabits) : 0;
            const isToday = iso === today;
            const isSel = iso === selectedDay;
            return (
              <button
                key={iso}
                onClick={() => setSelectedDay(iso)}
                title={`Day ${challengeDayNumber(iso, config.startDate, config.totalDays)} · ${count}/${prayerHabits.length}`}
                className={`aspect-square rounded-lg ${heatColor(count)} transition hover:scale-105 ${
                  isToday ? 'ring-2 ring-blush-300' : ''
                } ${isSel ? 'ring-2 ring-gold-400' : ''}`}
              />
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-end gap-2 text-xs text-ink-700/60 dark:text-cream-100/50">
          <span>Less</span>
          <span className="h-3 w-3 rounded bg-cream-200" />
          <span className="h-3 w-3 rounded bg-sage-100" />
          <span className="h-3 w-3 rounded bg-sage-300" />
          <span className="h-3 w-3 rounded bg-sage-500" />
          <span>More</span>
        </div>
      </Card>
    </div>
  );
}
