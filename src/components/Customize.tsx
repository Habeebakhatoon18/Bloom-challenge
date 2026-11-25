import { useEffect, useState } from 'react';
import { CalendarDays, Check, ClipboardList, Palette, Plus, ScrollText, Trash2 } from 'lucide-react';
import { Card, SectionTitle } from './ui';
import { useBloom } from '../store';
import { addDays, fromISODate, toISODate } from '../types';
import { PlanQuestion } from '../constants';

function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function Customize() {
  const { config: savedConfig, setConfig: applyConfig } = useBloom();
  const [draft, setDraft] = useState(() => cloneConfig(savedConfig));
  useEffect(() => setDraft(cloneConfig(savedConfig)), [savedConfig]);
  const config = draft;
  const setConfig = setDraft;
  const hasChanges = JSON.stringify(config) !== JSON.stringify(savedConfig);
  const endDate = addDays(config.startDate, config.totalDays - 1);
  const updateQuestion = (section: 'dailyQuestions' | 'weeklyQuestions', id: string, patch: Partial<PlanQuestion>) => {
    setConfig((current) => ({
      ...current,
      [section]: current[section].map((question) => question.id === id ? { ...question, ...patch } : question),
    }));
  };
  const addQuestion = (section: 'dailyQuestions' | 'weeklyQuestions') => {
    const question: PlanQuestion = { id: nextId('question'), label: 'New question', placeholder: 'Write your response…' };
    setConfig((current) => ({ ...current, [section]: [...current[section], question] }));
  };
  const updateListItem = (key: 'plannerRows' | 'plannerDays' | 'rules', index: number, value: string) => {
    setConfig((current) => ({
      ...current,
      [key]: current[key].map((item, i) => i === index ? value : item),
    }));
  };
  const removeListItem = (key: 'plannerRows' | 'plannerDays' | 'rules', index: number) => {
    setConfig((current) => ({ ...current, [key]: current[key].filter((_, i) => i !== index) }));
  };
  const addListItem = (key: 'plannerRows' | 'plannerDays' | 'rules', value: string) => {
    if (!value.trim()) return;
    setConfig((current) => ({ ...current, [key]: [...current[key], value.trim()] }));
  };

  const setEndDate = (value: string) => {
    if (!isISODate(value) || value < config.startDate) return;
    const duration = Math.round((fromISODate(value).getTime() - fromISODate(config.startDate).getTime()) / 86400000) + 1;
    setConfig((current) => ({ ...current, totalDays: duration }));
  };
  const setStartDate = (value: string) => {
    if (isISODate(value)) setConfig((current) => ({ ...current, startDate: value }));
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <Card>
        <SectionTitle title="Customize your plan" subtitle="Make your changes here, then apply them to update the rest of your plan." icon={<ClipboardList size={22} />} />
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-blush-50 p-3 dark:bg-blush-300/10">
          <p className="text-sm text-ink-700 dark:text-cream-100/70">
            {hasChanges ? 'You have unapplied changes.' : 'Your plan is up to date.'}
          </p>
          <button className="btn-primary" disabled={!hasChanges} onClick={() => applyConfig(cloneConfig(config))}>
            Apply changes
          </button>
        </div>
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="plan-title">Plan title</label>
            <input id="plan-title" className="field" value={config.planTitle} onChange={(e) => setConfig((c) => ({ ...c, planTitle: e.target.value }))} />
          </div>
          <div>
            <label className="label" htmlFor="plan-subtitle">Plan subtitle</label>
            <input id="plan-subtitle" className="field" value={config.planSubtitle} onChange={(e) => setConfig((c) => ({ ...c, planSubtitle: e.target.value }))} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="plan-start">Start date</label>
            <input id="plan-start" type="date" className="field" value={config.startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="plan-end">End date</label>
            <input id="plan-end" type="date" className="field" min={config.startDate} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="plan-days">Total days</label>
            <input
              id="plan-days"
              type="number"
              min={1}
              max={3660}
              className="field"
              value={config.totalDays}
              onChange={(e) => {
                const totalDays = Math.min(3660, Math.max(1, Number(e.target.value) || 1));
                setConfig((c) => ({ ...c, totalDays }));
              }}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-ink-700/60 dark:text-cream-100/50">Changing the end date or duration keeps the dates in sync.</p>
        <div className="mt-4 max-w-xs">
          <label className="label" htmlFor="plan-threshold">Habits needed for a complete day</label>
          <input id="plan-threshold" type="number" min={1} max={Math.max(1, config.habits.length)} className="field" value={Math.min(config.completionThreshold, Math.max(1, config.habits.length))} onChange={(e) => setConfig((c) => ({ ...c, completionThreshold: Math.min(c.habits.length, Math.max(1, Number(e.target.value) || 1)) }))} />
        </div>
      </Card>

      <Card>
        <SectionTitle title="Habits to track" subtitle="Add, rename, or remove habits from your daily checklist." icon={<Check size={22} />} />
        <div className="space-y-2">
          {config.habits.map((habit) => (
            <div key={habit.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input aria-label="Habit name" className="field" value={habit.label} onChange={(e) => setConfig((c) => ({ ...c, habits: c.habits.map((h) => h.id === habit.id ? { ...h, label: e.target.value, shortLabel: e.target.value.slice(0, 7) } : h) }))} />
              <input aria-label="Short habit name" className="field" value={habit.shortLabel} onChange={(e) => setConfig((c) => ({ ...c, habits: c.habits.map((h) => h.id === habit.id ? { ...h, shortLabel: e.target.value } : h) }))} />
              <button className="btn-ghost px-3" aria-label={`Remove ${habit.label}`} onClick={() => setConfig((c) => ({ ...c, habits: c.habits.filter((h) => h.id !== habit.id), completionThreshold: Math.min(c.completionThreshold, Math.max(1, c.habits.length - 1)) }))}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <button className="btn-ghost mt-3" onClick={() => setConfig((c) => ({ ...c, habits: [...c.habits, { id: nextId('habit'), label: 'New habit', shortLabel: 'New' }] }))}><Plus size={16} /> Add habit</button>
      </Card>

      <Card>
        <SectionTitle title="Daily journal questions" subtitle="Rename prompts, edit their hints, or add and remove questions." icon={<CalendarDays size={22} />} />
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <label className="label flex items-center gap-2 normal-case tracking-normal">
            <input type="checkbox" checked={config.showMood} onChange={(e) => setConfig((c) => ({ ...c, showMood: e.target.checked }))} />
            <span>Show mood check-in</span>
          </label>
          <label className="label flex items-center gap-2 normal-case tracking-normal">
            <input type="checkbox" checked={config.showPriorities} onChange={(e) => setConfig((c) => ({ ...c, showPriorities: e.target.checked }))} />
            <span>Show daily priorities</span>
          </label>
        </div>
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div><label className="label" htmlFor="mood-question">Mood prompt</label><input id="mood-question" className="field" value={config.moodQuestion} onChange={(e) => setConfig((c) => ({ ...c, moodQuestion: e.target.value }))} /></div>
          <div><label className="label" htmlFor="priorities-question">Priorities prompt</label><input id="priorities-question" className="field" value={config.prioritiesQuestion} onChange={(e) => setConfig((c) => ({ ...c, prioritiesQuestion: e.target.value }))} /></div>
        </div>
        <QuestionEditor questions={config.dailyQuestions} onUpdate={(id, patch) => updateQuestion('dailyQuestions', id, patch)} onRemove={(id) => setConfig((c) => ({ ...c, dailyQuestions: c.dailyQuestions.filter((q) => q.id !== id) }))} />
        <button className="btn-ghost mt-3" onClick={() => addQuestion('dailyQuestions')}><Plus size={16} /> Add question</button>
      </Card>

      <Card>
        <SectionTitle title="Weekly journal questions" subtitle="Shape the weekly reset around what matters to you." icon={<CalendarDays size={22} />} />
        <QuestionEditor questions={config.weeklyQuestions} onUpdate={(id, patch) => updateQuestion('weeklyQuestions', id, patch)} onRemove={(id) => setConfig((c) => ({ ...c, weeklyQuestions: c.weeklyQuestions.filter((q) => q.id !== id) }))} />
        <button className="btn-ghost mt-3" onClick={() => addQuestion('weeklyQuestions')}><Plus size={16} /> Add question</button>
        <div className="mt-4"><label className="label" htmlFor="weekly-rating">Weekly rating prompt</label><input id="weekly-rating" className="field" value={config.weeklyRatingQuestion} onChange={(e) => setConfig((c) => ({ ...c, weeklyRatingQuestion: e.target.value }))} /></div>
      </Card>

      <Card>
        <SectionTitle title="Planner layout" subtitle="Customize timetable rows and the days shown in your planner." icon={<ClipboardList size={22} />} />
        <EditableList title="Timetable rows" values={config.plannerRows} onChange={(i, value) => updateListItem('plannerRows', i, value)} onRemove={(i) => removeListItem('plannerRows', i)} onAdd={(value) => addListItem('plannerRows', value)} placeholder="Add a time block" />
        <EditableList title="Planner days" values={config.plannerDays} onChange={(i, value) => updateListItem('plannerDays', i, value)} onRemove={(i) => removeListItem('plannerDays', i)} onAdd={(value) => addListItem('plannerDays', value)} placeholder="Add a day" />
      </Card>

      <Card>
        <SectionTitle title="Rules + future self" subtitle="Keep your personal rules and end-of-plan reflection prompt." icon={<ScrollText size={22} />} />
        <EditableList title="My rules" values={config.rules} onChange={(i, value) => updateListItem('rules', i, value)} onRemove={(i) => removeListItem('rules', i)} onAdd={(value) => addListItem('rules', value)} placeholder="Add a rule" />
        <label className="label mt-4" htmlFor="future-prompt">Future-self prompt</label>
        <input id="future-prompt" className="field" value={config.futurePrompt} onChange={(e) => setConfig((c) => ({ ...c, futurePrompt: e.target.value }))} />
      </Card>

      <Card>
        <SectionTitle title="Background colors" subtitle="Choose the page background for each appearance mode." icon={<Palette size={22} />} />
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorInput label="Light mode background" value={config.backgroundLight} onChange={(value) => setConfig((c) => ({ ...c, backgroundLight: value }))} />
          <ColorInput label="Dark mode background" value={config.backgroundDark} onChange={(value) => setConfig((c) => ({ ...c, backgroundDark: value }))} />
        </div>
        <div className="mt-5 flex justify-end">
          <button className="btn-primary" disabled={!hasChanges} onClick={() => applyConfig(cloneConfig(config))}>
            Apply changes
          </button>
        </div>
      </Card>
    </div>
  );
}

function cloneConfig(config: ReturnType<typeof useBloom>['config']): ReturnType<typeof useBloom>['config'] {
  return {
    ...config,
    habits: config.habits.map((habit) => ({ ...habit })),
    dailyQuestions: config.dailyQuestions.map((question) => ({ ...question })),
    weeklyQuestions: config.weeklyQuestions.map((question) => ({ ...question })),
    plannerRows: [...config.plannerRows],
    plannerDays: [...config.plannerDays],
    rules: [...config.rules],
  };
}

function QuestionEditor({ questions, onUpdate, onRemove }: {
  questions: PlanQuestion[];
  onUpdate: (id: string, patch: Partial<PlanQuestion>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      {questions.map((question) => (
        <div key={question.id} className="grid gap-2 rounded-xl bg-cream-100/70 p-3 dark:bg-white/5 sm:grid-cols-[1fr_1fr_auto]">
          <input aria-label="Question title" className="field" value={question.label} onChange={(e) => onUpdate(question.id, { label: e.target.value })} />
          <input aria-label="Question placeholder" className="field" value={question.placeholder} onChange={(e) => onUpdate(question.id, { placeholder: e.target.value })} />
          <button className="btn-ghost px-3" aria-label={`Remove ${question.label}`} onClick={() => onRemove(question.id)}><Trash2 size={16} /></button>
        </div>
      ))}
    </div>
  );
}

function EditableList({ title, values, onChange, onRemove, onAdd, placeholder }: {
  title: string;
  values: string[];
  onChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onAdd: (value: string) => void;
  placeholder: string;
}) {
  const [newValue, setNewValue] = useState('');
  return (
    <div className="mt-4">
      <h3 className="label">{title}</h3>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={`${title}-${index}`} className="flex gap-2">
            <input className="field" value={value} onChange={(e) => onChange(index, e.target.value)} />
            <button className="btn-ghost px-3" aria-label={`Remove ${title} item ${index + 1}`} onClick={() => onRemove(index)}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
      <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); onAdd(newValue); setNewValue(''); }}>
        <input className="field" placeholder={placeholder} value={newValue} onChange={(e) => setNewValue(e.target.value)} />
        <button className="btn-ghost px-3" type="submit" aria-label={`Add ${title}`}><Plus size={16} /></button>
      </form>
    </div>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="label">
      {label}
      <span className="mt-1 flex items-center gap-3">
        <input type="color" className="h-10 w-14 cursor-pointer rounded border-0 bg-transparent" value={value} onChange={(e) => onChange(e.target.value)} />
        <span className="normal-case tracking-normal">{value}</span>
      </span>
    </label>
  );
}

function isISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = fromISODate(value);
  return !Number.isNaN(parsed.getTime()) && toISODate(parsed) === value;
}

