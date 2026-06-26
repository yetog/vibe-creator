import { AuraSettings, AuraScene, AURA_SCENE_CONFIG } from '../types';

interface AuraPanelProps {
  value:    AuraSettings;
  onChange: (s: AuraSettings) => void;
}

const SCENES = Object.entries(AURA_SCENE_CONFIG) as [AuraScene, typeof AURA_SCENE_CONFIG[AuraScene]][];

function powerColor(level: number): string {
  if (level <= 25)  return '#4dd9ff'; // cyan — low
  if (level <= 50)  return '#C9A24A'; // gold — mid
  if (level <= 75)  return '#ff9f43'; // orange — high
  return '#ff4757';                    // red — max
}

function powerLabel(level: number): string {
  if (level <= 25)  return 'Suppressed';
  if (level <= 50)  return 'Rising';
  if (level <= 75)  return 'Unleashed';
  if (level < 100)  return 'Overwhelming';
  return 'MAXIMUM';
}

export function AuraPanel({ value, onChange }: AuraPanelProps) {
  const color = powerColor(value.powerLevel);

  return (
    <div
      className="p-5 space-y-5 rounded-xl"
      style={{
        background: 'rgba(255,71,87,0.04)',
        border:     `1px solid rgba(255,71,87,0.2)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span style={{ color: '#ff4757', fontSize: '1rem' }}>⬡</span>
        <p
          className="eyebrow"
          style={{ color: '#ff4757', letterSpacing: '0.12em' }}
        >
          Aura Mode
        </p>
      </div>

      {/* Scene chips */}
      <div>
        <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>Scene Type</p>
        <div className="grid grid-cols-3 gap-1.5">
          {SCENES.map(([key, cfg]) => {
            const active = value.scene === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ ...value, scene: key })}
                className="px-2 py-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-0.5"
                style={{
                  background: active ? 'rgba(255,71,87,0.15)' : 'rgba(255,255,255,0.03)',
                  border:     active ? '1px solid rgba(255,71,87,0.5)' : '1px solid var(--border)',
                  color:      active ? '#ff4757' : 'var(--muted)',
                  boxShadow:  active ? '0 0 10px rgba(255,71,87,0.15)' : 'none',
                }}
              >
                <span style={{ fontSize: '1rem' }}>{cfg.emoji}</span>
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Power level */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Power Level</p>
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-cinzel text-xl font-bold tabular-nums"
              style={{ color, transition: 'color 0.3s' }}
            >
              {value.powerLevel}
            </span>
            <span className="text-xs font-medium" style={{ color }}>
              {powerLabel(value.powerLevel)}
            </span>
          </div>
        </div>

        {/* Custom slider */}
        <div className="relative">
          <input
            type="range"
            min={1}
            max={100}
            value={value.powerLevel}
            onChange={(e) => onChange({ ...value, powerLevel: Number(e.target.value) })}
            className="w-full"
            style={{
              WebkitAppearance: 'none',
              appearance:       'none',
              height:           '6px',
              borderRadius:     '3px',
              outline:          'none',
              cursor:           'pointer',
              background: `linear-gradient(to right,
                #4dd9ff 0%, #C9A24A 25%, #ff9f43 60%, #ff4757 100%
              )`,
              // Thumb styled via global CSS or inline — we rely on Tailwind's
              // default range reset being applied
            }}
          />
        </div>

        {/* Level markers */}
        <div className="flex justify-between mt-1">
          {['1', '25', '50', '75', '100'].map((v) => (
            <span key={v} className="text-xs" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
              {v}
            </span>
          ))}
        </div>
      </div>

      {/* Hint */}
      <p className="text-xs" style={{ color: 'var(--muted)' }}>
        Generates anime OST matched to your scene and power level.
        <br />
        <span style={{ color: '#ff4757', fontSize: '0.65rem' }}>
          ⚠ Swap GIF IDs in manifest.json to match your preferred anime clips.
        </span>
      </p>
    </div>
  );
}
