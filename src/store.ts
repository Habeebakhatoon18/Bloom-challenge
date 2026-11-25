import { createContext, useContext } from 'react';
import { AppData, DayData, defaultSelectedDay } from './types';
import { STORAGE_KEY } from './constants';
import { PlanConfig } from './constants';

export interface BloomContext {
  data: AppData;
  setData: (next: AppData | ((prev: AppData) => AppData)) => void;
  config: PlanConfig;
  setConfig: (next: PlanConfig | ((prev: PlanConfig) => PlanConfig)) => void;
  selectedDay: string;
  setSelectedDay: (iso: string) => void;
  // helpers
  updateDay: (iso: string, patch: (d: DayData) => void) => void;
}

export const BloomCtx = createContext<BloomContext | null>(null);

export function useBloom(): BloomContext {
  const ctx = useContext(BloomCtx);
  if (!ctx) throw new Error('useBloom must be used within BloomProvider');
  return ctx;
}

export function useSelectedDay(startDate?: string, totalDays?: number): string {
  return defaultSelectedDay(startDate, totalDays);
}

export { STORAGE_KEY };
