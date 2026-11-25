import { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { Card, SectionTitle } from './ui';
import { useBloom } from '../store';
import { emptyData, AppData } from '../types';
import { CONFIG_STORAGE_KEY, DEFAULT_PLAN_CONFIG, STORAGE_KEY } from '../constants';
import type { PlanConfig } from '../constants';
import { replaceStored } from '../hooks/useLocalStorage';

export function Settings({ dark, toggleDark, resetAppearance }: { dark: boolean; toggleDark: () => void; resetAppearance: () => void }) {
  const { data, setData, config, setConfig, setSelectedDay } = useBloom();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [msg, setMsg] = useState('');

  const exportData = () => {
    try {
      const blob = new Blob([JSON.stringify({ data, config }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `50-days-to-bloom-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg('Exported your journal as a backup file. 🌷');
    } catch {
      setMsg('Could not export. Try again.');
    }
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as AppData | { data: AppData; config?: PlanConfig };
        const importedData = 'data' in parsed ? parsed.data : parsed;
        if (!importedData || typeof importedData !== 'object' || !('days' in importedData)) throw new Error('bad');
        let restoredConfig = config;
        if ('data' in parsed && parsed.config) {
          restoredConfig = { ...DEFAULT_PLAN_CONFIG, ...parsed.config };
          if (!Array.isArray(restoredConfig.habits) || !Array.isArray(restoredConfig.dailyQuestions) || !Array.isArray(restoredConfig.weeklyQuestions)) throw new Error('bad config');
        }
        const merged: AppData = { ...emptyData(restoredConfig), ...importedData };
        setData(merged);
        replaceStored(STORAGE_KEY, merged);
        if ('data' in parsed && parsed.config) {
          setConfig(restoredConfig);
          replaceStored(CONFIG_STORAGE_KEY, restoredConfig);
        }
        setMsg('Imported your backup successfully.');
      } catch {
        setMsg('That file does not look like a valid Bloom backup.');
      }
    };
    reader.readAsText(file);
  };

  const resetAll = () => {
    const fresh = emptyData(DEFAULT_PLAN_CONFIG);
    setData(fresh);
    setConfig(DEFAULT_PLAN_CONFIG);
    replaceStored(CONFIG_STORAGE_KEY, DEFAULT_PLAN_CONFIG);
    replaceStored(STORAGE_KEY, fresh);
    setSelectedDay(DEFAULT_PLAN_CONFIG.startDate);
    resetAppearance();
    setConfirmReset(false);
    setMsg('Started fresh. Every day is a new beginning. 🌱');
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <Card>
        <SectionTitle title="Settings" subtitle="Back up, restore or begin again" icon={<SettingsIcon size={22} />} />

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-cream-100/70 dark:bg-white/5 p-4">
            <div>
              <p className="font-semibold text-ink-800 dark:text-cream-100">Appearance</p>
              <p className="text-sm text-ink-700/60 dark:text-cream-100/50">{dark ? 'Dark mode' : 'Light mode'}</p>
            </div>
            <button className="btn-ghost" onClick={toggleDark} aria-label="Toggle dark mode">
              {dark ? <Sun size={16} /> : <Moon size={16} />} {dark ? 'Light' : 'Dark'}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <button className="btn-ghost flex-col h-auto py-4" onClick={exportData}>
              <Download size={20} />
              <span>Export backup</span>
            </button>
            <button className="btn-ghost flex-col h-auto py-4" onClick={() => fileRef.current?.click()}>
              <Upload size={20} />
              <span>Import backup</span>
            </button>
            <button
              className="btn flex-col h-auto py-4 bg-rose-100 text-rose-400 hover:bg-rose-200 border border-rose-200"
              onClick={() => setConfirmReset(true)}
            >
              <RotateCcw size={20} />
              <span>Reset all</span>
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importData(f);
              e.target.value = '';
            }}
          />

          {msg && <p className="rounded-xl bg-sage-50 dark:bg-sage-600/15 px-4 py-3 text-sm text-sage-600 dark:text-sage-200">{msg}</p>}
        </div>
      </Card>

      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setConfirmReset(false)}>
          <div className="card max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-xl text-ink-800 dark:text-cream-100">Begin again?</h3>
            <p className="mt-2 text-sm text-ink-700/70 dark:text-cream-100/60">
              This restores the original plan and appearance, and permanently erases all journal entries, habits, planner notes and customizations. This cannot be undone — consider exporting a backup first.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button className="btn-ghost" onClick={() => setConfirmReset(false)}>Keep my data</button>
              <button className="btn bg-rose-300 text-white hover:bg-rose-400" onClick={resetAll}>Yes, reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
