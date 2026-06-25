import { Genre, GENRE_CONFIG } from '../types';
import { getGenreEmoji } from '../utils/promptBuilder';

interface GenreSelectorProps {
  value: Genre;
  onChange: (genre: Genre) => void;
}

const GENRES: Genre[] = ['lofi', 'house', 'ambient', 'electronic', 'soul', 'funk'];

export function GenreSelector({ value, onChange }: GenreSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Genre
      </label>
      <div className="flex flex-wrap gap-2">
        {GENRES.map((genre) => {
          const config = GENRE_CONFIG[genre];
          const isSelected = value === genre;
          const [minBpm, maxBpm] = config.bpmRange;

          return (
            <button
              key={genre}
              onClick={() => onChange(genre)}
              className={`
                px-4 py-2 rounded-full border transition-all duration-200
                flex items-center gap-2
                ${isSelected
                  ? 'border-purple-500 bg-purple-500/20 text-white'
                  : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10'
                }
              `}
            >
              <span>{getGenreEmoji(genre)}</span>
              <span className="capitalize">{genre}</span>
              <span className="text-xs text-gray-500">
                {minBpm}-{maxBpm}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
