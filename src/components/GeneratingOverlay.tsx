import { useState, useEffect } from 'react';

const STEPS = [
  'Tuning the frequency…',
  'Composing your track…',
  'Selecting visuals…',
  'Locking in the vibe…',
];

interface GeneratingOverlayProps {
  isGenerating: boolean;
}

export function GeneratingOverlay({ isGenerating }: GeneratingOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [dotCount, setDotCount]   = useState(0);

  useEffect(() => {
    if (!isGenerating) { setStepIndex(0); return; }
    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 2200);
    const dotTimer = setInterval(() => {
      setDotCount((d) => (d + 1) % 4);
    }, 400);
    return () => { clearInterval(stepTimer); clearInterval(dotTimer); };
  }, [isGenerating]);

  if (!isGenerating) return null;

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4"
      style={{ background: 'rgba(2,2,2,0.85)', backdropFilter: 'blur(4px)' }}
    >
      {/* Pulsing ring */}
      <div
        className="w-16 h-16 rounded-full border-2 animate-spin"
        style={{
          borderColor: 'var(--gold)',
          borderTopColor: 'var(--cyan)',
          animationDuration: '1s',
        }}
      />

      {/* Step text */}
      <p
        className="font-cinzel text-sm tracking-widest text-center px-4"
        style={{ color: 'var(--gold)' }}
      >
        {STEPS[stepIndex]}
        {'.'.repeat(dotCount)}
      </p>

      {/* Progress bar */}
      <div
        className="w-40 h-0.5 rounded-full overflow-hidden"
        style={{ background: 'var(--border)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${((stepIndex + 1) / STEPS.length) * 100}%`,
            background: 'linear-gradient(90deg, var(--gold), var(--cyan))',
          }}
        />
      </div>
    </div>
  );
}
