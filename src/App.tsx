import { useState, useCallback, useRef, useEffect } from 'react';
import { VibeCanvas, VibeCanvasHandle } from './components/VibeCanvas';
import { MoodSelector }       from './components/MoodSelector';
import { EnergySlider }       from './components/EnergySlider';
import { GenreSelector }      from './components/GenreSelector';
import { GifPlayer }          from './components/GifPlayer';
import { TvScreen }           from './components/TvScreen';
import { PlaybackControls }   from './components/PlaybackControls';
import { AdvancedPanel }      from './components/AdvancedPanel';
import { GeneratingOverlay }  from './components/GeneratingOverlay';
import { HistoryPanel }       from './components/HistoryPanel';
import { useAudioEngine }     from './hooks/useAudioEngine';
import { useVibeHistory }     from './hooks/useVibeHistory';
import { useVideoExport }     from './hooks/useVideoExport';
import { generateAudio, getDemoAudio } from './services/elevenLabs';
import { getGifSequence }     from './services/gifLibrary';
import {
  buildAdvancedPrompt, buildSimplePrompt, getLoopDuration,
} from './utils/promptBuilder';
import {
  Mood, Genre, EnergyLevel, GenerationState, GENRE_CONFIG,
  AdvancedSettings, DEFAULT_ADVANCED, VisualSequenceEntry,
} from './types';

function App() {
  // Core selections
  const [mood,   setMood]   = useState<Mood>('chill');
  const [energy, setEnergy] = useState<EnergyLevel>(5);
  const [genre,  setGenre]  = useState<Genre>('lofi');

  // Advanced settings (used by AdvancedPanel)
  const [advanced, setAdvanced] = useState<AdvancedSettings>(DEFAULT_ADVANCED);

  // Generation
  const [state,    setState]   = useState<GenerationState>('idle');
  const [error,    setError]   = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // GIF sequence (Sprint 3)
  const [sequence, setSequence] = useState<VisualSequenceEntry[]>([]);
  const [gifIndex, setGifIndex] = useState(0);

  // API key (kept for display — actual key lives server-side on proxy)
  const [showKey, setShowKey] = useState(false);
  const [apiKey,  setApiKey]  = useState(import.meta.env.VITE_ELEVENLABS_API_KEY || '');

  const canvasRef = useRef<VibeCanvasHandle>(null);
  const engine    = useAudioEngine();
  const { startRecording, stopRecording, isRecording } = useVideoExport();
  const { history, addEntry, clearHistory } = useVibeHistory();

  const hasAudio = state !== 'idle';

  // Derived BPM from advanced loop settings
  const [minBpm, maxBpm] = GENRE_CONFIG[genre].bpmRange;
  const derivedBpm  = Math.round(minBpm + ((energy - 1) / 9) * (maxBpm - minBpm));
  const loopDuration = getLoopDuration(advanced.loopBars, derivedBpm);

  // Current GIF URL from sequence
  const currentGifUrl = sequence[gifIndex]?.gifUrl ?? null;

  // GIF rotation timer — advances index every durationSec while playing
  useEffect(() => {
    if (!engine.isPlaying || sequence.length <= 1) return;
    const secEach = sequence[0]?.durationSec ?? 4;
    const timer = setInterval(() => {
      setGifIndex((i) => (i + 1) % sequence.length);
    }, secEach * 1000);
    return () => clearInterval(timer);
  }, [engine.isPlaying, sequence]);

  const handleGenerate = useCallback(async () => {
    // Synchronous AudioContext unlock — must happen before any async work (iOS fix)
    engine.unlock();

    setError(null);
    setState('generating');
    setGifIndex(0);

    try {
      const prompt   = buildAdvancedPrompt({ mood, energy, genre }, advanced);
      const keywords = advanced.visualKeywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const [audioResult, gifSeq] = await Promise.all([
        apiKey
          ? generateAudio(apiKey, { prompt, duration: loopDuration })
          : getDemoAudio(mood),
        getGifSequence(mood, genre, energy, 6, 4, keywords),
      ]);

      setSequence(gifSeq);
      setAudioUrl(audioResult.audioUrl);
      await engine.loadAudio(audioResult.audioUrl);
      engine.play();
      setState('playing');

      addEntry({ mood, genre, energy, advanced, prompt });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed — please try again.');
      setState('idle');
    }
  }, [mood, energy, genre, advanced, apiKey, loopDuration, engine]);

  const handlePlayPause = useCallback(() => {
    if (engine.isPlaying) engine.pause();
    else engine.play();
  }, [engine]);

  const handleExport = useCallback(() => {
    if (isRecording) { stopRecording(); return; }
    const canvas       = canvasRef.current?.getCanvas();
    const audioContext = engine.getAudioContext();
    if (!canvas || !audioContext) { alert('Generate a vibe first before recording'); return; }
    if (!engine.isPlaying)        { alert('Start playback before recording'); return; }
    startRecording(canvas, audioContext, engine.connectRecording);
  }, [isRecording, engine, startRecording, stopRecording]);

  const handleReplay = useCallback((entry: import('./hooks/useVibeHistory').VibeHistoryEntry) => {
    setMood(entry.mood);
    setGenre(entry.genre);
    setEnergy(entry.energy);
    setAdvanced(entry.advanced);
  }, []);

  const handleDownloadAudio = useCallback(() => {
    if (!audioUrl) { alert('Generate a vibe first before downloading'); return; }
    const link = document.createElement('a');
    link.href     = audioUrl;
    link.download = `vibe-${mood}-${genre}-${Date.now()}.mp3`;
    link.click();
  }, [audioUrl, mood, genre]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* ── Header ── */}
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

      {/* ── Main grid ── */}
      <main className="flex-1 grid lg:grid-cols-2 gap-5 p-5">

        {/* Left: TV Screen */}
        <div className="flex flex-col gap-4">
          <TvScreen
            mood={mood}
            genre={genre}
            energy={energy}
            isPlaying={engine.isPlaying}
          >
            {/* Canvas ambient layer */}
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
              <GifPlayer gifUrl={currentGifUrl} isPlaying={engine.isPlaying} />
            </div>
            {/* Generating overlay */}
            <GeneratingOverlay isGenerating={state === 'generating'} />
          </TvScreen>

          {/* Error */}
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

          {/* Prompt preview */}
          {state === 'idle' && (
            <div
              className="p-3 rounded-lg text-xs text-center app-hud"
              style={{ color: 'var(--muted)' }}
            >
              <span className="eyebrow mr-2">Preview:</span>
              {buildSimplePrompt({ mood, energy, genre })}
            </div>
          )}

          {/* Sequence indicator */}
          {sequence.length > 1 && state === 'playing' && (
            <div className="flex justify-center gap-1.5">
              {sequence.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setGifIndex(i)}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{
                    background: i === gifIndex ? 'var(--cyan)' : 'var(--border)',
                    boxShadow:  i === gifIndex ? '0 0 6px var(--cyan)' : 'none',
                  }}
                />
              ))}
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

          {/* HISTORY panel */}
          <HistoryPanel
            history={history}
            onReplay={handleReplay}
            onClear={clearHistory}
          />

          {/* TRANSMIT panel */}
          <div className="app-hud p-5">
            <p className="eyebrow mb-3" style={{ color: 'var(--gold)' }}>⬡ Transmit</p>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm" style={{ color: 'var(--muted)' }}>
                11Labs API Key
              </label>
              <button
                onClick={() => setShowKey(!showKey)}
                className="text-xs"
                style={{ color: 'var(--muted)', cursor: 'pointer' }}
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Optional — proxy handles key server-side"
              className="input-hud w-full px-3 py-2 text-sm"
            />
            <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
              Loop: <span className="font-mono" style={{ color: 'var(--gold)' }}>
                {advanced.loopBars}-bar ({loopDuration}s)
              </span>
              {' · '}Key:{' '}
              <span className="font-mono" style={{ color: 'var(--gold)' }}>
                {advanced.key} {advanced.scale}
              </span>
            </p>
          </div>
        </div>
      </main>

      {/* ── Playback bar ── */}
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

      {/* ── Footer ── */}
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
