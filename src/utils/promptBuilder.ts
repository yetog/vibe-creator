import {
  VibeSettings, AdvancedSettings,
  MOOD_CONFIG, GENRE_CONFIG,
} from '../types';

/**
 * Build a prompt for 11Labs audio generation based on user selections
 */
export function buildAudioPrompt(settings: VibeSettings): string {
  const moodConfig = MOOD_CONFIG[settings.mood];
  const genreConfig = GENRE_CONFIG[settings.genre];

  // Calculate BPM based on energy within genre range
  const [minBpm, maxBpm] = genreConfig.bpmRange;
  const bpm = Math.round(minBpm + ((settings.energy - 1) / 9) * (maxBpm - minBpm));

  // Build the prompt
  const parts = [
    `Create a ${settings.energy > 5 ? 'high-energy' : 'mellow'} ${settings.genre} track`,
    `at ${bpm} BPM`,
    `with a ${moodConfig.prompt} vibe`,
    `featuring ${genreConfig.instruments.slice(0, 3).join(', ')}`,
    `Duration: 15-20 seconds`,
    `Style: ${genreConfig.prompt}`,
  ];

  return parts.join('. ');
}

/**
 * Build a simpler prompt for quick generation
 */
export function buildSimplePrompt(settings: VibeSettings): string {
  const genreConfig = GENRE_CONFIG[settings.genre];
  const [minBpm, maxBpm] = genreConfig.bpmRange;
  const bpm = Math.round(minBpm + ((settings.energy - 1) / 9) * (maxBpm - minBpm));

  return `${settings.mood} ${settings.genre} beat, ${bpm} BPM, 15 seconds`;
}

/**
 * Get energy descriptor
 */
export function getEnergyDescriptor(energy: number): string {
  if (energy <= 3) return 'Low';
  if (energy <= 6) return 'Medium';
  if (energy <= 8) return 'High';
  return 'Maximum';
}

/**
 * Get mood emoji
 */
export function getMoodEmoji(mood: string): string {
  const emojis: Record<string, string> = {
    chill: '😌',
    energetic: '⚡',
    dark: '🌙',
    uplifting: '✨',
  };
  return emojis[mood] || '🎵';
}

/**
 * Build a sophisticated Advanced Mode prompt using music theory parameters.
 * Ported from chord-genesis prompt architecture — includes key, scale,
 * chord template, loop length, extensions, use case, and visual keywords.
 */
export function buildAdvancedPrompt(
  settings: VibeSettings,
  advanced: AdvancedSettings
): string {
  const { mood, energy, genre } = settings;
  const {
    key, scale, chordTemplate, loopBars,
    addExtensions, useCase, visualKeywords,
  } = advanced;

  const [minBpm, maxBpm] = GENRE_CONFIG[genre].bpmRange;
  const bpm          = Math.round(minBpm + ((energy - 1) / 9) * (maxBpm - minBpm));
  const durationSec  = getLoopDuration(loopBars, bpm);
  const instruments  = GENRE_CONFIG[genre].instruments.join(', ');
  const extensionStr = addExtensions ? ' with maj7/min7 and 9th chord extensions' : '';
  const moodStr      = MOOD_CONFIG[mood].prompt;

  const parts = [
    `${genre}, ${mood}, ${bpm} BPM`,
    `key of ${key} ${scale}`,
    `${chordTemplate} chord progression${extensionStr}`,
    `${instruments}, no vocals`,
    `${loopBars}-bar loop (${durationSec} seconds)`,
    `use case: ${useCase}`,
    `emotional feel: ${moodStr}`,
    `style: ${GENRE_CONFIG[genre].prompt}`,
    visualKeywords ? `visual atmosphere: ${visualKeywords}` : '',
  ].filter(Boolean);

  return parts.join(', ');
}

/**
 * Calculate loop duration in seconds from bar count and BPM.
 * Formula: (bars × 4 beats) ÷ (bpm / 60)
 */
export function getLoopDuration(loopBars: 16 | 32, bpm: number): number {
  return Math.round((loopBars * 4) / (bpm / 60));
}

/**
 * Get genre emoji
 */
export function getGenreEmoji(genre: string): string {
  const emojis: Record<string, string> = {
    lofi:      '🎧',
    house:     '🏠',
    ambient:   '🌊',
    electronic:'🤖',
    soul:      '💜',
    funk:      '🕺',
    dnb:       '🥁',
    vaporwave: '📼',
    trapsoul:  '🌃',
    westcoast: '🌴',
  };
  return emojis[genre] || '🎵';
}
