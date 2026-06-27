import { useState, useCallback, useRef, useEffect } from 'react';
import { VibeCanvas, VibeCanvasHandle } from './components/VibeCanvas';
import { MoodSelector }     from './components/MoodSelector';
import { EnergySlider }     from './components/EnergySlider';
import { GenreSelector }    from './components/GenreSelector';
import { GifPlayer }           from './components/GifPlayer';
import { TvScreen }            from './components/TvScreen';
import { GeneratingOverlay }   from './components/GeneratingOverlay';
import { AdvancedPanel }       from './components/AdvancedPanel';
import { HistoryPanel }        from './components/HistoryPanel';
import { PlaybackControls } from './components/PlaybackControls';
import { useAudioEngine }   from './hooks/useAudioEngine';
import { useVideoExport }   from './hooks/useVideoExport';
import { useVibeHistory, type VibeHistoryEntry } from './hooks/useVibeHistory';
import { generateAudio, getDemoAudio } from './services/elevenLabs';
import { getGif }           from './services/gifLibrary';
import { buildAdvancedPrompt, buildSimplePrompt } from './utils/promptBuilder';
import { Mood, Genre, EnergyLevel, GenerationState, GENRE_CONFIG, AdvancedSettings, DEFAULT_ADVANCED } from './types';

function App() {
  const [mood,     setMood]     = useState<Mood>('chill');
  const [energy,   setEnergy]   = useState<EnergyLevel>(5);
  const [genre,    setGenre]    = useState<Genre>('lofi');
  const [advanced, setAdvanced] = useState<AdvancedSettings>(DEFAULT_ADVANCED);
  const [state,  setState]  = useState<GenerationState>('idle');
  const [error,  setError]  = useState<string | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_ELEVENLABS_API_KEY || '');
  const [showKey, setShowKey] = useState(false);

  const canvasRef = useRef<VibeCanvasHandle>(null);
  const engine    = useAudioEngine();
  const { startRecording, stopRecording, isRecording } = useVideoExport();
  const { history, addEntry, clearHistory } = useVibeHistory();

  const hasAudio = audioUrl !== null;

  // Revoke stale blob URLs to prevent memory leaks across generations
  useEffect(() => {
    return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); };
  }, [audioUrl]);

  const [minBpm, maxBpm] = GENRE_CONFIG[genre].bpmRange;
  const derivedBpm = Math.round(minBpm + ((energy - 1) / 9) * (maxBpm - minBpm));

  const handleGenerate = useCallback(async () => {
    engine.unlock(); // iOS Safari: must call synchronously before any async work
    setError(null);
    setState('generating');
    try {
      const prompt = buildAdvancedPrompt({ mood, energy, genre }, advanced);
      const [audioResult, gifPath] = await Promise.all([
        apiKey
          ? generateAudio(apiKey, { prompt, duration: 15 })
          : getDemoAudio(mood),
        getGif(mood, genre, energy),
      ]);
      setGifUrl(gifPath);
      setAudioUrl(audioResult.audioUrl);
      await engine.loadAudio(audioResult.audioUrl);
      engine.play();
      setState('playing');
      addEntry({ mood, energy, genre, advanced, prompt });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setState('idle');
    }
  }, [mood, energy, genre, advanced, apiKey, engine, addEntry]);

  const handlePlayPause = useCallback(() => {
    if (engine.isPlaying) engine.pause();
    else engine.play();
  }, [engine]);

  const handleReplay = useCallback((entry: VibeHistoryEntry) => {
    setMood(entry.mood);
    setEnergy(entry.energy);
    setGenre(entry.genre);
    setAdvanced(entry.advanced);
  }, []);

  const handleExport = useCallback(() => {
    if (isRecording) { stopRecording(); return; }
    const canvas       = canvasRef.current?.getCanvas();
    const audioContext = engine.getAudioContext();
    if (!canvas || !audioContext) { alert('Generate a vibe first before recording'); return; }
    if (!engine.isPlaying)        { alert('Start playback before recording'); return; }
    startRecording(canvas, audioContext, engine.connectRecording);
  }, [isRecording, engine, startRecording, stopRecording]);

  const handleDownloadAudio = useCallback(() => {
    if (!audioUrl) { alert('Generate a vibe first before downloading'); return; }
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `vibe-${mood}-${genre}-${Date.now()}.mp3`;
    link.click();
  }, [audioUrl, mood, genre]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* Header */}
      <header
        className="px-6 pt-5 pb-4 flex items-end justify-between"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <p className="eyebrow mb-1" style={{ color: 'var(--muted)' }}>
            Powered by ElevenLabs
          </p>
          <h1
            className="font-cinzel text-3xl font-bold tracking-widest"
            style={{
              color:                'transparent',
              background:           'linear-gradient(135deg, var(--gold), var(--cyan))',
              WebkitBackgroundClip: 'text',
              backgroundClip:       'text',
            }}
          >
            VIBE CREATOR
          </h1>
        </div>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          Audio + Visuals · One Click
        </p>
      </header>

      {/* Main grid */}
      <main className="flex-1 grid lg:grid-cols-2 gap-5 p-5">

        {/* Left: TV Screen */}
        <div className="flex flex-col gap-4">
          <TvScreen
            mood={mood}
            genre={genre}
            energy={energy}
            isPlaying={engine.isPlaying}
          >
            {/* Canvas ambient layer — behind GIF */}
            <div className="absolute inset-0 z-0" style={{ opacity: 0.18 }}>
              <VibeCanvas
                ref={canvasRef}
                mood={mood}
                energy={energy}
                analysis={engine.analysis}
                isPlaying={engine.isPlaying}
              />
            </div>
            {/* GIF hero layer */}
            <div className="absolute inset-0 z-10">
              <GifPlayer gifUrl={gifUrl} isPlaying={engine.isPlaying} />
            </div>
            {/* Generating overlay — z-20, sits above canvas + GIF */}
            <GeneratingOverlay isGenerating={state === 'generating'} />
          </TvScreen>

          {error && (
            <div
              className="p-3 rounded-lg text-sm text-center"
              style={{
                background: 'rgba(248,81,73,0.08)',
                border:     '1px solid rgba(248,81,73,0.3)',
                color:      '#f85149',
              }}
            >
              {error}
            </div>
          )}

          {state === 'idle' && (
            <div
              className="p-3 rounded-lg text-xs text-center app-hud"
              style={{ color: 'var(--muted)' }}
            >
              <span className="eyebrow mr-2">Preview:</span>
              {buildSimplePrompt({ mood, energy, genre })}
            </div>
          )}
        </div>

        {/* Right: Control panels */}
        <div className="flex flex-col gap-4">

          {/* SIGNAL panel */}
          <div className="app-hud p-5 space-y-5">
            <p className="eyebrow" style={{ color: 'var(--gold)' }}>⬡ Signal</p>
            <MoodSelector  value={mood}   onChange={setMood}   />
            <GenreSelector value={genre}  onChange={setGenre}  />
            <EnergySlider  value={energy} onChange={setEnergy} />
          </div>

          {/* ADVANCED panel */}
          <AdvancedPanel value={advanced} onChange={setAdvanced} />

          {/* TRANSMIT panel */}
          <div className="app-hud p-5">
            <p className="eyebrow mb-3" style={{ color: 'var(--gold)' }}>⬡ Transmit</p>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm" style={{ color: 'var(--muted)' }}>
                11Labs API Key
              </label>
              <button
                onClick={() => setShowKey(!showKey)}
                className="text-xs transition-colors"
                style={{ color: 'var(--muted)', cursor: 'pointer' }}
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Optional — demo mode without key"
              className="input-hud w-full px-3 py-2 text-sm"
            />
            <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
              Get your key at{' '}
              <a
                href="https://elevenlabs.io"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--gold)' }}
                className="hover:underline"
              >
                elevenlabs.io
              </a>
            </p>
          </div>

          {/* HISTORY panel */}
          <HistoryPanel
            history={history}
            onReplay={handleReplay}
            onClear={clearHistory}
          />
        </div>
      </main>

      {/* Playback bar */}
      <PlaybackControls
        isPlaying={engine.isPlaying}
        isLooping={engine.isLooping}
        isGenerating={state === 'generating'}
        isRecording={isRecording}
        hasAudio={hasAudio}
        tempo={derivedBpm}
        masterVolume={engine.masterVolume}
        onGenerate={handleGenerate}
        onPlayPause={handlePlayPause}
        onToggleLoop={engine.toggleLoop}
        onRecord={handleExport}
        onDownloadAudio={handleDownloadAudio}
        onVolumeChange={engine.setMasterVolume}
        onTempoChange={engine.setTempo}
      />

      {/* Footer */}
      <footer
        className="text-center py-3 text-xs"
        style={{ color: 'var(--muted)', borderTop: '1px solid var(--border)' }}
      >
        Built for Patch Night ·{' '}
        <a
          href="https://zaylegend.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--gold)' }}
          className="hover:underline"
        >
          zaylegend.com
        </a>
      </footer>
    </div>
  );
}

export default App;
