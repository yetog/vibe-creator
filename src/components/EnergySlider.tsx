import { EnergyLevel } from '../types';
import { getEnergyDescriptor } from '../utils/promptBuilder';

interface EnergySliderProps {
  value: EnergyLevel;
  onChange: (energy: EnergyLevel) => void;
}

export function EnergySlider({ value, onChange }: EnergySliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value) as EnergyLevel);
  };

  const percentage = ((value - 1) / 9) * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-300">
          Energy
        </label>
        <span className="text-sm text-gray-400">
          {getEnergyDescriptor(value)} ({value}/10)
        </span>
      </div>

      <div className="relative">
        {/* Track background */}
        <div className="h-3 rounded-full bg-white/10 overflow-hidden">
          {/* Filled portion */}
          <div
            className="h-full rounded-full transition-all duration-150"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg,
                #60A5FA 0%,
                #A855F7 50%,
                #F97316 100%
              )`,
            }}
          />
        </div>

        {/* Slider input */}
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {/* Thumb indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-lg pointer-events-none transition-all duration-150"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>Mellow</span>
        <span>Balanced</span>
        <span>Intense</span>
      </div>
    </div>
  );
}
