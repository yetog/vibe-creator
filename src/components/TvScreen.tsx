import { type ReactNode } from 'react';
import { type Mood, type Genre } from '../types';

interface TvScreenProps {
  mood:      Mood;
  genre:     Genre;
  energy:    number;
  isPlaying: boolean;
  children:  ReactNode;
}

const CHANNEL_MAP: Record<Mood, string> = {
  chill:     'CH 01',
  energetic: 'CH 02',
  dark:      'CH 03',
  uplifting: 'CH 04',
};

const GENRE_LABEL: Record<string, string> = {
  lofi:      'LO-FI',
  house:     'HOUSE',
  ambient:   'AMBIENT',
  electronic:'ELECTRONIC',
  soul:      'SOUL',
  funk:      'FUNK',
  dnb:       'DNB',
  vaporwave: 'VAPORWAVE',
  trapsoul:  'TRAP SOUL',
  westcoast: 'WEST COAST',
};

export function TvScreen({ mood, genre, energy, isPlaying, children }: TvScreenProps) {
  const channel    = CHANNEL_MAP[mood];
  const genreLabel = GENRE_LABEL[genre] ?? genre.toUpperCase();

  return (
    <div
      className="rounded-xl overflow-hidden border-2 border-sweep flex flex-col"
      style={{
        background: 'var(--surface)',
        boxShadow:  '0 0 40px rgba(201,162,74,0.1), inset 0 0 2px rgba(201,162,74,0.2)',
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        <span
          className="font-cinzel text-xs font-semibold tracking-widest"
          style={{ color: 'var(--gold)' }}
        >
          VIBE CREATOR BROADCAST
        </span>
        <span className="eyebrow" style={{ color: 'var(--muted)' }}>
          FREQ {energy * 11}.{energy} MHz
        </span>
      </div>

      {/* Screen — children are abs-positioned inside here */}
      <div
        className="relative scan-lines tv-screen flex-1"
        style={{ aspectRatio: '1 / 1' }}
      >
        {children}
      </div>

      {/* Channel bar */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          {/* Power dot */}
          <span
            className={isPlaying ? 'animate-pulse-dot' : ''}
            style={{
              display:      'inline-block',
              width:        8,
              height:       8,
              borderRadius: '50%',
              background:   isPlaying ? 'var(--cyan)' : 'var(--border)',
              boxShadow:    isPlaying ? '0 0 6px var(--cyan)' : 'none',
              transition:   'background 0.3s, box-shadow 0.3s',
              flexShrink:   0,
            }}
          />
          <span className="font-mono text-xs" style={{ color: 'var(--gold)' }}>
            {channel}
          </span>
          <span className="eyebrow" style={{ color: 'var(--muted)' }}>
            {mood.toUpperCase()} · {genreLabel}
          </span>
        </div>
        <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
          E:{energy}/10
        </span>
      </div>
    </div>
  );
}
