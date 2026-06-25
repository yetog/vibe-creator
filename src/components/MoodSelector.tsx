import { Mood, MOOD_CONFIG } from '../types';
import { getMoodEmoji } from '../utils/promptBuilder';

interface MoodSelectorProps {
  value:    Mood;
  onChange: (mood: Mood) => void;
}

const MOODS: Mood[] = ['chill', 'energetic', 'dark', 'uplifting'];

const MOOD_DESC: Record<Mood, string> = {
  chill:     'Relaxed, smooth',
  energetic: 'High energy',
  dark:      'Mysterious, deep',
  uplifting: 'Positive, bright',
};

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="eyebrow">Mood</p>
      <div className="grid grid-cols-2 gap-2">
        {MOODS.map((mood) => {
          const isSelected = value === mood;
          const config     = MOOD_CONFIG[mood];
          return (
            <button
              key={mood}
              onClick={() => onChange(mood)}
              className="relative p-3 rounded-lg text-left transition-all"
              style={{
                background: isSelected ? 'rgba(201,162,74,0.08)' : 'var(--surface-2)',
                border:     `1px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}`,
                boxShadow:  isSelected ? '0 0 12px rgba(201,162,74,0.18)' : 'none',
                cursor:     'pointer',
              }}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 18 }}>{getMoodEmoji(mood)}</span>
                <div>
                  <div
                    className="font-cinzel text-xs font-semibold tracking-wider capitalize"
                    style={{ color: isSelected ? 'var(--gold)' : 'var(--text)' }}
                  >
                    {mood}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted)', fontSize: 10 }}>
                    {MOOD_DESC[mood]}
                  </div>
                </div>
              </div>
              {/* Color pips */}
              <div className="absolute top-2 right-2 flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: config.colors.primary }} />
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: config.colors.secondary }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
