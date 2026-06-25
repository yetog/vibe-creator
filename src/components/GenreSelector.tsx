import { Genre, GENRE_CONFIG } from '../types';
import { getGenreEmoji } from '../utils/promptBuilder';

interface GenreSelectorProps {
  value:    Genre;
  onChange: (genre: Genre) => void;
}

const GENRES: Genre[] = [
  'lofi', 'house', 'ambient', 'electronic', 'soul', 'funk',
  'dnb', 'vaporwave', 'trapsoul', 'westcoast',
];

const GENRE_DISPLAY: Record<Genre, string> = {
  lofi:       'Lo-Fi',
  house:      'House',
  ambient:    'Ambient',
  electronic: 'Electronic',
  soul:       'Soul',
  funk:       'Funk',
  dnb:        'DNB',
  vaporwave:  'Vaporwave',
  trapsoul:   'Trap Soul',
  westcoast:  'West Coast',
};

export function GenreSelector({ value, onChange }: GenreSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="eyebrow">Genre</p>
      <div className="flex flex-wrap gap-1.5">
        {GENRES.map((genre) => {
          const isSelected   = value === genre;
          const [minBpm]     = GENRE_CONFIG[genre].bpmRange;
          return (
            <button
              key={genre}
              onClick={() => onChange(genre)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all"
              style={{
                background:  isSelected ? 'rgba(77,217,255,0.08)' : 'var(--surface-2)',
                border:      `1px solid ${isSelected ? 'var(--cyan)' : 'var(--border)'}`,
                color:       isSelected ? 'var(--cyan)' : 'var(--muted)',
                boxShadow:   isSelected ? '0 0 8px rgba(77,217,255,0.18)' : 'none',
                cursor:      'pointer',
                fontWeight:  isSelected ? 600 : 400,
              }}
            >
              <span style={{ fontSize: 12 }}>{getGenreEmoji(genre)}</span>
              <span style={{ fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {GENRE_DISPLAY[genre]}
              </span>
              <span className="font-mono" style={{ fontSize: 9, color: 'var(--muted)', opacity: 0.6 }}>
                {minBpm}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
