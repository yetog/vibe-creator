import { useEffect, useState } from 'react';

interface GifPlayerProps {
  gifUrl:    string | null;
  isPlaying: boolean;
}

export function GifPlayer({ gifUrl, isPlaying }: GifPlayerProps) {
  const [displayUrl, setDisplayUrl] = useState<string | null>(gifUrl);
  const [fading,     setFading]     = useState(false);

  useEffect(() => {
    if (gifUrl === displayUrl) return;
    setFading(true);
    const t = setTimeout(() => {
      setDisplayUrl(gifUrl);
      setFading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [gifUrl, displayUrl]);

  if (!displayUrl) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center gap-3"
        style={{ background: '#0a0a0a' }}
      >
        <div style={{ fontSize: 40, opacity: 0.25 }}>📡</div>
        <p className="eyebrow" style={{ color: 'var(--muted)' }}>Awaiting signal</p>
      </div>
    );
  }

  return (
    <img
      src={displayUrl}
      alt="vibe visual"
      className="w-full h-full object-cover"
      style={{
        opacity:    fading ? 0 : (isPlaying ? 1 : 0.45),
        transition: 'opacity 0.3s ease',
        display:    'block',
      }}
    />
  );
}
