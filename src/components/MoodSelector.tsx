import { Mood, MOOD_CONFIG } from '../types';
import { getMoodEmoji } from '../utils/promptBuilder';

interface MoodSelectorProps {
  value: Mood;
  onChange: (mood: Mood) => void;
}

const MOODS: Mood[] = ['chill', 'energetic', 'dark', 'uplifting'];

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Mood
      </label>
      <div className="grid grid-cols-2 gap-3">
        {MOODS.map((mood) => {
          const config = MOOD_CONFIG[mood];
          const isSelected = value === mood;

          return (
            <button
              key={mood}
              onClick={() => onChange(mood)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200
                ${isSelected
                  ? 'border-white/50 bg-white/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }
              `}
              style={{
                boxShadow: isSelected ? `0 0 20px ${config.colors.primary}40` : 'none',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getMoodEmoji(mood)}</span>
                <div className="text-left">
                  <div className="font-medium capitalize">{mood}</div>
                  <div className="text-xs text-gray-400">
                    {mood === 'chill' && 'Relaxed vibes'}
                    {mood === 'energetic' && 'High energy'}
                    {mood === 'dark' && 'Mysterious'}
                    {mood === 'uplifting' && 'Positive energy'}
                  </div>
                </div>
              </div>

              {/* Color indicator */}
              <div className="absolute top-2 right-2 flex gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: config.colors.primary }}
                />
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: config.colors.secondary }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
