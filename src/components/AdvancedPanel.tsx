import { useState } from 'react';
import {
  AdvancedSettings, MusicKey, MusicScale, ChordTemplate, UseCase,
  SCALE_LABELS, TEMPLATE_LABELS, DEFAULT_ADVANCED,
} from '../types';

interface AdvancedPanelProps {
  value:    AdvancedSettings;
  onChange: (s: AdvancedSettings) => void;
}

const KEYS: MusicKey[]           = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const SCALES: MusicScale[]       = ['major','minor','dorian','phrygian','lydian','mixolydian','pentatonic-major','pentatonic-minor','blues','harmonic-minor'];
const TEMPLATES: ChordTemplate[] = Object.keys(TEMPLATE_LABELS) as ChordTemplate[];
const USE_CASES: UseCase[]       = ['chill','study','workout','creative','gaming','meditation'];

const USE_CASE_LABELS: Record<UseCase, string> = {
  chill:      'Chill',
  study:      'Study',
  workout:    'Workout',
  creative:   'Creative',
  gaming:     'Gaming',
  meditation: 'Meditate',
};

const selectStyle: React.CSSProperties = {
  background:   'var(--surface-2)',
  border:       '1px solid var(--border)',
  color:        'var(--text)',
  borderRadius: 6,
  padding:      '6px 8px',
  fontSize:     12,
  width:        '100%',
  cursor:       'pointer',
  outline:      'none',
};

export function AdvancedPanel({ value, onChange }: AdvancedPanelProps) {
  const [open, setOpen] = useState(false);

  const set = <K extends keyof AdvancedSettings>(key: K, val: AdvancedSettings[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="app-hud">
      {/* Toggle header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3 transition-opacity"
        style={{ cursor: 'pointer' }}
      >
        <div className="flex items-center gap-2">
          <span className="eyebrow" style={{ color: 'var(--gold)' }}>⬡ Advanced</span>
          {open && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-mono"
              style={{ background: 'rgba(201,162,74,0.15)', color: 'var(--gold)', fontSize: 10 }}
            >
              ON
            </span>
          )}
        </div>
        <span style={{ color: 'var(--muted)', fontSize: 10 }}>{open ? '▲ collapse' : '▼ expand'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs pt-3" style={{ color: 'var(--muted)' }}>
            Adds music theory parameters to your generation prompt.
          </p>

          {/* Key + Scale */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <p className="eyebrow">Key</p>
              <select value={value.key} onChange={(e) => set('key', e.target.value as MusicKey)} style={selectStyle}>
                {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <p className="eyebrow">Scale</p>
              <select value={value.scale} onChange={(e) => set('scale', e.target.value as MusicScale)} style={selectStyle}>
                {SCALES.map((s) => <option key={s} value={s}>{SCALE_LABELS[s]}</option>)}
              </select>
            </div>
          </div>

          {/* Chord progression */}
          <div className="space-y-1.5">
            <p className="eyebrow">Chord Progression</p>
            <select value={value.chordTemplate} onChange={(e) => set('chordTemplate', e.target.value as ChordTemplate)} style={selectStyle}>
              {TEMPLATES.map((t) => (
                <option key={t} value={t}>{t} — {TEMPLATE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* Loop length */}
          <div className="space-y-1.5">
            <p className="eyebrow">Loop Length</p>
            <div className="flex gap-2">
              {([16, 32] as const).map((bars) => (
                <button
                  key={bars}
                  onClick={() => set('loopBars', bars)}
                  className="flex-1 py-2 rounded-md font-mono text-xs transition-all"
                  style={{
                    background: value.loopBars === bars ? 'rgba(201,162,74,0.12)' : 'var(--surface-2)',
                    border:     `1px solid ${value.loopBars === bars ? 'var(--gold)' : 'var(--border)'}`,
                    color:      value.loopBars === bars ? 'var(--gold)' : 'var(--muted)',
                    cursor:     'pointer',
                  }}
                >
                  {bars}-Bar
                </button>
              ))}
            </div>
          </div>

          {/* 7th / 9th extensions toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">7th / 9th Extensions</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Adds maj7 / min9 chord colour</p>
            </div>
            <button
              onClick={() => set('addExtensions', !value.addExtensions)}
              aria-pressed={value.addExtensions}
              aria-label="Toggle 7th/9th chord extensions"
              className="w-10 h-5 rounded-full transition-all relative"
              style={{ background: value.addExtensions ? 'var(--gold)' : 'var(--border)' }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                style={{ background: 'var(--bg)', left: value.addExtensions ? '22px' : '2px' }}
              />
            </button>
          </div>

          {/* Use case */}
          <div className="space-y-1.5">
            <p className="eyebrow">Use Case</p>
            <div className="flex flex-wrap gap-1.5">
              {USE_CASES.map((uc) => (
                <button
                  key={uc}
                  onClick={() => set('useCase', uc)}
                  className="px-3 py-1 rounded-md text-xs transition-all"
                  style={{
                    background: value.useCase === uc ? 'rgba(77,217,255,0.08)' : 'var(--surface-2)',
                    border:     `1px solid ${value.useCase === uc ? 'var(--cyan)' : 'var(--border)'}`,
                    color:      value.useCase === uc ? 'var(--cyan)' : 'var(--muted)',
                    cursor:     'pointer',
                  }}
                >
                  {USE_CASE_LABELS[uc]}
                </button>
              ))}
            </div>
          </div>

          {/* Visual keywords */}
          <div className="space-y-1.5">
            <p className="eyebrow">Visual Keywords</p>
            <input
              type="text"
              value={value.visualKeywords}
              onChange={(e) => set('visualKeywords', e.target.value)}
              placeholder="e.g. blue flame samurai, cyberpunk rain"
              className="input-hud w-full px-3 py-2 text-sm"
            />
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Influences both GIF selection and the music prompt
            </p>
          </div>

          {/* Reset */}
          <button
            onClick={() => onChange(DEFAULT_ADVANCED)}
            className="text-xs transition-colors"
            style={{ color: 'var(--muted)', cursor: 'pointer' }}
          >
            Reset to defaults
          </button>
        </div>
      )}
    </div>
  );
}
