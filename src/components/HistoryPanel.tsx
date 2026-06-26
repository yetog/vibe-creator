import { VibeHistoryEntry } from '../hooks/useVibeHistory';

interface HistoryPanelProps {
  history:  VibeHistoryEntry[];
  onReplay: (entry: VibeHistoryEntry) => void;
  onClear:  () => void;
}

function timeAgo(ts: number): string {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60)   return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export function HistoryPanel({ history, onReplay, onClear }: HistoryPanelProps) {
  if (history.length === 0) return null;

  return (
    <div className="app-hud p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="eyebrow" style={{ color: 'var(--gold)' }}>⬡ History</p>
        <button
          onClick={onClear}
          className="text-xs hover:opacity-80 transition-opacity"
          style={{ color: 'var(--muted)' }}
        >
          Clear
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {history.map((entry) => {
          return (
            <button
              key={entry.id}
              onClick={() => onReplay(entry)}
              className="w-full text-left px-3 py-2 rounded-lg transition-all hover:opacity-90 active:scale-[0.99]"
              style={{
                background: 'rgba(201,162,74,0.06)',
                border:     '1px solid rgba(201,162,74,0.15)',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm truncate" style={{ color: 'var(--text)' }}>
                  {entry.mood} · {entry.genre}
                  {' '}
                  <span className="font-mono text-xs" style={{ color: 'var(--cyan)' }}>
                    {entry.advanced.key} {entry.advanced.scale}
                  </span>
                </span>
                <span className="text-xs shrink-0" style={{ color: 'var(--muted)' }}>
                  {timeAgo(entry.timestamp)}
                </span>
              </div>
              <p
                className="text-xs mt-0.5 truncate"
                style={{ color: 'var(--muted)' }}
                title={entry.prompt}
              >
                {entry.prompt}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
