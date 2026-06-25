import { useState, useCallback } from 'react';
import { Play, Pause, Download, Sparkles } from 'lucide-react';
import { VibeCanvas } from './components/VibeCanvas';
import { MoodSelector } from './components/MoodSelector';
import { EnergySlider } from './components/EnergySlider';
import { GenreSelector } from './components/GenreSelector';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import { generateAudio, getDemoAudio } from './services/elevenLabs';
import { buildAudioPrompt, buildSimplePrompt } from './utils/promptBuilder';
import { Mood, Genre, EnergyLevel, GenerationState, MOOD_CONFIG } from './types';

function App() {
  // User selections
  const [mood, setMood] = useState<Mood>('chill');
  const [energy, setEnergy] = useState<EnergyLevel>(5);
  const [genre, setGenre] = useState<Genre>('lofi');

  // Generation state
  const [state, setState] = useState<GenerationState>('idle');
  const [error, setError] = useState<string | null>(null);

  // Audio
  const { isPlaying, analysis, loadAudio, play, pause } = useAudioAnalyzer();

  // API Key (in production, this would be handled securely)
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const config = MOOD_CONFIG[mood];

  // Generate vibe
  const handleGenerate = useCallback(async () => {
    setError(null);
    setState('generating');

    try {
      const settings = { mood, energy, genre };
      let result;

      if (apiKey) {
        // Use 11Labs API
        const prompt = buildAudioPrompt(settings);
        console.log('Generating with prompt:', prompt);
        result = await generateAudio(apiKey, { prompt, duration: 15 });
      } else {
        // Demo mode
        console.log('Demo mode: Using sample audio');
        result = await getDemoAudio(mood);
      }

      await loadAudio(result.audioUrl);
      play();
      setState('playing');
    } catch (err) {
      console.error('Generation failed:', err);
      setError(err instanceof Error ? err.message : 'Generation failed');
      setState('idle');
    }
  }, [mood, energy, genre, apiKey, loadAudio, play]);

  // Toggle playback
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  // Export video (placeholder)
  const handleExport = useCallback(() => {
    // TODO: Implement MediaRecorder capture
    alert('Export coming soon! This will capture the canvas + audio as a video.');
  }, []);

  return (
    <div
      className="min-h-screen p-6 transition-colors duration-500"
      style={{ backgroundColor: config.colors.background }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Vibe Creator
          </h1>
          <p className="text-gray-400">
            Generate audio + matching visuals in one click
          </p>
        </header>

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Canvas */}
          <div className="space-y-4">
            <VibeCanvas
              mood={mood}
              energy={energy}
              analysis={analysis}
              isPlaying={isPlaying}
            />

            {/* Playback controls */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleGenerate}
                disabled={state === 'generating'}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all
                  ${state === 'generating'
                    ? 'bg-gray-600 cursor-wait'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  }
                `}
              >
                <Sparkles className="w-5 h-5" />
                {state === 'generating' ? 'Generating...' : 'Generate Vibe'}
              </button>

              {state !== 'idle' && (
                <>
                  <button
                    onClick={handlePlayPause}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    onClick={handleExport}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Error display */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            {/* Prompt preview */}
            {state === 'idle' && (
              <div className="p-3 bg-white/5 rounded-lg text-sm text-gray-400 text-center">
                Preview: {buildSimplePrompt({ mood, energy, genre })}
              </div>
            )}
          </div>

          {/* Right: Controls */}
          <div className="space-y-6 bg-black/20 rounded-2xl p-6 border border-white/10">
            <MoodSelector value={mood} onChange={setMood} />
            <EnergySlider value={energy} onChange={setEnergy} />
            <GenreSelector value={genre} onChange={setGenre} />

            {/* API Key section */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
                  11Labs API Key
                </label>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-xs text-gray-500 hover:text-gray-300"
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Optional - uses demo audio without key"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
              />
              <p className="mt-2 text-xs text-gray-500">
                Get your key at{' '}
                <a
                  href="https://elevenlabs.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline"
                >
                  elevenlabs.io
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Built for Patch Night | Sound + Visuals + Code</p>
          <p className="mt-1">
            <a href="https://zaylegend.com" className="text-purple-400 hover:underline">
              zaylegend.com
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
