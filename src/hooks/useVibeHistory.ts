import { useState, useCallback, useEffect } from 'react';
import { Mood, Genre, EnergyLevel, AdvancedSettings } from '../types';

export interface VibeHistoryEntry {
  id:        string;
  timestamp: number;
  mood:      Mood;
  genre:     Genre;
  energy:    EnergyLevel;
  advanced:  AdvancedSettings;
  prompt:    string;
}

const STORAGE_KEY = 'vibe-creator-history';
const MAX_ENTRIES = 10;

function loadFromStorage(): VibeHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as VibeHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(entries: VibeHistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Quota exceeded — storage unavailable, continue silently
  }
}

export function useVibeHistory() {
  const [history, setHistory] = useState<VibeHistoryEntry[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(history);
  }, [history]);

  const addEntry = useCallback((entry: Omit<VibeHistoryEntry, 'id' | 'timestamp'>) => {
    setHistory((prev) => {
      const next: VibeHistoryEntry = {
        ...entry,
        id:        `${entry.mood}-${entry.genre}-${Date.now()}`,
        timestamp: Date.now(),
      };
      return [next, ...prev].slice(0, MAX_ENTRIES);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, addEntry, clearHistory };
}
