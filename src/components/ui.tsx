import { Check } from 'lucide-react';
import { HABIT_LABELS, HabitKey } from '../constants';
import { isFriday, isSunday } from '../types';

export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`card p-5 ${className}`}>{children}</div>;
}

export function SectionTitle({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      {icon && <div className="mt-0.5 text-blush-500">{icon}</div>}
      <div>
        <h2 className="text-2xl font-semibold leading-tight text-ink-900 dark:text-cream-100">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-ink-700 dark:text-cream-100/60">{subtitle}</p>}
      </div>
    </div>
  );
}

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  ariaLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'default' | 'sage' | 'rose' | 'blush';
}

export function BloomCheckbox({ checked, onChange, label, ariaLabel, size = 'md', tone = 'default' }: CheckboxProps) {
  const sizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-9 w-9',
  };
  const tones = {
    default: 'bg-blush-400 border-blush-500 text-white',
    sage: 'bg-sage-400 border-sage-500 text-white',
    rose: 'bg-rose-300 border-rose-400 text-white',
    blush: 'bg-blush-500 border-blush-600 text-white',
  };
  const checkSizes = { sm: 14, md: 18, lg: 24 };

  // Use a real button so there is exactly one click handler — no label wrapper
  // to double-fire or swallow the toggle on the second click.
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel ?? label}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onChange();
      }}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onChange();
        }
      }}
      className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 outline-none transition-all focus-visible:ring-2 focus-visible:ring-blush-300 ${
        sizes[size]
      } ${checked ? `${tones[tone]} shadow-sm animate-bloom` : 'bg-white border-cream-300 hover:border-blush-300 dark:bg-white/10 dark:border-white/25 dark:hover:border-blush-300/60'}`}
    >
      {checked && <Check size={checkSizes[size]} strokeWidth={3} />}
    </button>
  );
}

// A labeled checkbox row — uses the real button so toggling is reliable.
export function LabeledCheckbox({
  checked,
  onChange,
  label,
  ariaLabel,
  size = 'md',
  tone = 'default',
}: CheckboxProps) {
  return (
    <div
      className="inline-flex cursor-pointer items-center gap-2.5 select-none"
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
    >
      <BloomCheckbox checked={checked} onChange={onChange} ariaLabel={ariaLabel ?? label} size={size} tone={tone} />
      {label && <span className="text-sm font-medium text-ink-900 dark:text-cream-100">{label}</span>}
    </div>
  );
}

// Day row tint: Friday sage, Sunday rose.
export function dayTintClass(iso: string): string {
  if (isFriday(iso)) return 'bg-sage-100/70 dark:bg-sage-600/15';
  if (isSunday(iso)) return 'bg-rose-200/60 dark:bg-rose-400/15';
  return '';
}

export function dayBadgeClass(iso: string): string {
  if (isFriday(iso)) return 'chip bg-sage-200 text-sage-600 dark:bg-sage-600/30 dark:text-sage-200';
  if (isSunday(iso)) return 'chip bg-rose-200 text-rose-400 dark:bg-rose-400/25 dark:text-rose-200';
  return 'chip bg-cream-200 text-ink-700 dark:bg-white/10 dark:text-cream-100/70';
}

export function HabitPill({ habit, checked }: { habit: HabitKey; checked: boolean }) {
  return (
    <span
      className={`chip ${
        checked
          ? 'bg-blush-200 text-blush-600 dark:bg-blush-300/25 dark:text-blush-200'
          : 'bg-cream-200 text-ink-700/60 dark:bg-white/5 dark:text-cream-100/40 line-through'
      }`}
    >
      {HABIT_LABELS[habit]}
    </span>
  );
}

export function ProgressRing({ pct, size = 120, label }: { pct: number; size?: number; label?: string }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F8E4D2" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 600ms ease' }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F56B96" />
            <stop offset="100%" stopColor="#649159" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-serif font-semibold text-ink-900 dark:text-cream-100">{pct}%</span>
        {label && <span className="text-[11px] text-ink-700 dark:text-cream-100/50">{label}</span>}
      </div>
    </div>
  );
}

export function StatCard({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="card p-4 text-center">
      <div className={`text-2xl font-serif font-semibold ${accent ?? 'text-ink-900 dark:text-cream-100'}`}>{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-700 dark:text-cream-100/50">{label}</div>
    </div>
  );
}

export function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl bg-cream-200/70 dark:bg-white/5 px-4 py-3 text-sm text-ink-700 dark:text-cream-100/60 text-center">
      {children}
    </p>
  );
}

export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-xl bg-cream-200 dark:bg-white/5 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
            value === o.value
              ? 'bg-white text-blush-600 shadow-sm dark:bg-white/15 dark:text-blush-200'
              : 'text-ink-700 hover:text-ink-900 dark:text-cream-100/60 dark:hover:text-cream-100'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Tulip({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden>
      <path d="M16 28V16" stroke="#649159" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 22c3 0 5-2 5-6 0 4 2 6 5 6" stroke="#4E7547" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 16c-3-1-5-4-5-8 0-2 2-3 5-3s5 1 5 3c0 4-2 7-5 8z" fill="#F56B96" />
      <path d="M16 16V5" stroke="#D8507C" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}
