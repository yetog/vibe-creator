import { Play, Pause, Repeat, Sparkles, Volume2, Circle, Square, Download } from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying:      boolean;
  isLooping:      boolean;
  isGenerating:   boolean;
  isRecording:    boolean;
  hasAudio:       boolean;
  tempo:          number;
  masterVolume:   number;
  onGenerate:     () => void;
  onPlayPause:    () => void;
  onToggleLoop:   () => void;
  onRecord:       () => void;
  onDownloadAudio: () => void;
  onVolumeChange: (vol: number) => void;
  onTempoChange:  (bpm: number) => void;
}

export function PlaybackControls({
  isPlaying, isLooping, isGenerating, isRecording, hasAudio,
  tempo, masterVolume,
  onGenerate, onPlayPause, onToggleLoop, onRecord, onDownloadAudio,
  onVolumeChange, onTempoChange,
}: PlaybackControlsProps) {
  return (
    <div
      className="flex items-center gap-3 px-6 py-4 flex-wrap"
      style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}
    >
      {/* Generate */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-cinzel font-semibold text-sm tracking-widest transition-all"
        style={{
          background: isGenerating
            ? 'var(--surface-2)'
            : 'linear-gradient(135deg, var(--gold), var(--cyan))',
          color:      isGenerating ? 'var(--muted)' : 'var(--bg)',
          cursor:     isGenerating ? 'wait' : 'pointer',
          boxShadow:  isGenerating ? 'none' : '0 0 16px rgba(201,162,74,0.3)',
          border:     '1px solid transparent',
        }}
      >
        <Sparkles size={14} />
        {isGenerating ? 'GENERATING…' : 'GENERATE VIBE'}
      </button>

      {/* Play / Pause */}
      {hasAudio && (
        <button
          onClick={onPlayPause}
          className="p-2.5 rounded-lg transition-all card-hud"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying
            ? <Pause size={15} style={{ color: 'var(--gold)' }} />
            : <Play  size={15} style={{ color: 'var(--gold)' }} />
          }
        </button>
      )}

      {/* Loop */}
      {hasAudio && (
        <button
          onClick={onToggleLoop}
          className="p-2.5 rounded-lg transition-all"
          title={isLooping ? 'Disable loop' : 'Enable loop'}
          style={{
            background: isLooping ? 'rgba(201,162,74,0.12)' : 'var(--surface-2)',
            border:     `1px solid ${isLooping ? 'var(--gold)' : 'var(--border)'}`,
            color:      isLooping ? 'var(--gold)' : 'var(--muted)',
          }}
        >
          <Repeat size={15} />
        </button>
      )}

      {/* Record Video */}
      {hasAudio && (
        <button
          onClick={onRecord}
          className="p-2.5 rounded-lg transition-all"
          title={isRecording ? 'Stop Recording' : 'Record Video'}
          style={{
            background: isRecording ? 'rgba(239,68,68,0.2)' : 'var(--surface-2)',
            border:     `1px solid ${isRecording ? '#ef4444' : 'var(--border)'}`,
            color:      isRecording ? '#ef4444' : 'var(--muted)',
          }}
        >
          {isRecording ? <Square size={15} /> : <Circle size={15} />}
        </button>
      )}

      {/* Download Audio */}
      {hasAudio && (
        <button
          onClick={onDownloadAudio}
          className="p-2.5 rounded-lg transition-all card-hud"
          title="Download Audio"
        >
          <Download size={15} style={{ color: 'var(--cyan)' }} />
        </button>
      )}

      <div style={{ flex: 1 }} />

      {/* Volume */}
      <div className="flex items-center gap-2">
        <Volume2 size={13} style={{ color: 'var(--muted)', flexShrink: 0 }} />
        <input
          type="range"
          min="0" max="1" step="0.01"
          value={masterVolume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="slider-hud w-20"
        />
        <span className="font-mono text-xs w-9 text-right" style={{ color: 'var(--muted)' }}>
          {Math.round(masterVolume * 100)}%
        </span>
      </div>

      {/* BPM */}
      <div className="flex items-center gap-2">
        <span className="eyebrow" style={{ flexShrink: 0 }}>BPM</span>
        <input
          type="range"
          min="60" max="180" step="1"
          value={tempo}
          onChange={(e) => onTempoChange(parseInt(e.target.value))}
          className="slider-hud w-20"
        />
        <span className="font-mono text-xs w-8 text-right" style={{ color: 'var(--gold)' }}>
          {tempo}
        </span>
      </div>
    </div>
  );
}
