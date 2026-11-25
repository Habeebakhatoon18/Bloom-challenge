import { ScrollText, PenLine } from 'lucide-react';
import { Card, SectionTitle } from '../components/ui';
import { useBloom } from '../store';
import { addDays, formatShort } from '../types';

export default function RulesFuture() {
  const { data, setData, config } = useBloom();
  const endDate = formatShort(addDays(config.startDate, config.totalDays - 1));

  return (
    <div className="space-y-5 animate-fadeIn">
      <Card>
        <SectionTitle title="My Rules" subtitle={`The heart of your ${config.totalDays}-day plan`} icon={<ScrollText size={22} />} />
        <ol className="space-y-3">
          {config.rules.map((rule, index) => (
            <li key={`${index}-${rule}`} className="flex gap-3 rounded-xl bg-cream-100/70 dark:bg-white/5 p-4">
              <span className="font-serif text-xl font-semibold text-blush-400">{String(index + 1).padStart(2, '0')}</span>
              <p className="text-sm text-ink-800 dark:text-cream-100">{rule}</p>
            </li>
          ))}
        </ol>
      </Card>

      <Card className="bg-gradient-to-br from-blush-50 to-sage-50 dark:from-blush-300/10 dark:to-sage-600/10">
        <SectionTitle title="Note to Future Self" subtitle={`For ${endDate} — when your plan is complete`} icon={<PenLine size={22} />} />
        <label className="label">{config.futurePrompt}</label>
        <textarea
          className="field min-h-[140px] font-serif text-lg"
          placeholder="Write to the version of you who finishes the reset…"
          value={data.futureNote}
          onChange={(e) => setData((p) => ({ ...p, futureNote: e.target.value }))}
        />
        <p className="mt-3 text-center text-xs italic text-ink-700/60 dark:text-cream-100/50">
          A missed checkbox is information, not failure. Return with a sincere intention tomorrow.
        </p>
      </Card>
    </div>
  );
}
