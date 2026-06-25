import { EnergyLevel } from '../types';
import { getEnergyDescriptor } from '../utils/promptBuilder';

interface EnergySliderProps {
  value:    EnergyLevel;
  onChange: (energy: EnergyLevel) => void;
}

export function EnergySlider({ value, onChange }: EnergySliderProps) {
  const pct = ((value - 1) / 9) * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="eyebrow">Energy</p>
        <span className="font-mono text-xs" style={{ color: 'var(--gold)' }}>
          {getEnergyDescriptor(value)} · {value}/10
        </span>
      </div>

      {/* Custom track */}
      <div className="relative h-5 flex items-center">
        <div
          className="absolute w-full h-1 rounded-full"
          style={{ background: 'var(--border)' }}
        />
        <div
          className="absolute h-1 rounded-full transition-all duration-150"
          style={{
            width:      `${pct}%`,
            background: 'linear-gradient(90deg, var(--gold-dim), var(--gold), var(--cyan))',
            boxShadow:  `0 0 8px rgba(201,162,74,${(pct / 100) * 0.8})`,
          }}
        />
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) as EnergyLevel)}
          className="slider-hud absolute w-full"
          style={{ background: 'transparent', height: '100%' }}
        />
      </div>

      <div className="flex justify-between">
        <span className="eyebrow">Mellow</span>
        <span className="eyebrow">Balanced</span>
        <span className="eyebrow">Intense</span>
      </div>
    </div>
  );
}
