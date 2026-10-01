import { useState, useEffect } from 'react';
import { RecentConversion } from '../types';

const STORAGE_KEY = 'filemaster_recent_history';

export function useRecentHistory() {
  const [history, setHistory] = useState<RecentConversion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Could not save history to localStorage', e);
    }
  }, [history]);

  const addRecord = (record: Omit<RecentConversion, 'id' | 'timestamp'>) => {
    const newRecord: RecentConversion = {
      ...record,
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
    };
    setHistory((prev) => [newRecord, ...prev.slice(0, 49)]); // keep latest 50
  };

  const removeRecord = (id: string) => {
    setHistory((prev) => prev.filter((r) => r.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return {
    history,
    addRecord,
    removeRecord,
    clearHistory,
  };
}
