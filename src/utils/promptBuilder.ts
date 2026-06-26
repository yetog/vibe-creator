import { VibeSettings, AdvancedSettings, MOOD_CONFIG, GENRE_CONFIG } from '../types';

/**
 * Build a prompt for 11Labs audio generation based on user selections
 */
export function buildAudioPrompt(settings: VibeSettings): string {
  const moodConfig = MOOD_CONFIG[settings.mood];
  const genreConfig = GENRE_CONFIG[settings.genre];

  const [minBpm, maxBpm] = genreConfig.bpmRange;
  const bpm = Math.round(minBpm + ((settings.energy - 1) / 9) * (maxBpm - minBpm));

  // 5-level energy descriptor (pairs: 1-2, 3-4, 5-6, 7-8, 9-10)
  const energyTiers = [
    'very gentle and subdued',
    'soft and laid-back',
    'moderate and steady',
    'energetic and driving',
    'intense and powerful',
  ];
  const energyDesc = energyTiers[Math.min(Math.floor((settings.energy - 1) / 2), 4)];

  return [
    `${genreConfig.prompt},`,
    `${moodConfig.prompt} feeling,`,
    `${energyDesc} energy,`,
    `${bpm} BPM,`,
    `featuring ${genreConfig.instruments.join(', ')},`,
    `15 seconds`,
  ].join(' ');
}

/**
 * Build a richer prompt including music-theory parameters from AdvancedPanel.
 * Subsumes buildAudioPrompt when advanced settings are active.
 */
export function buildAdvancedPrompt(
  settings: VibeSettings,
  advanced: AdvancedSettings
): string {
  const { mood, energy, genre } = settings;
  const { key, scale, chordTemplate, loopBars, addExtensions, useCase, visualKeywords } = advanced;

  const [minBpm, maxBpm] = GENRE_CONFIG[genre].bpmRange;
  const bpm         = Math.round(minBpm + ((energy - 1) / 9) * (maxBpm - minBpm));
  const durationSec = getLoopDuration(loopBars, bpm);
  const instruments = GENRE_CONFIG[genre].instruments.join(', ');
  const extensions  = addExtensions ? ' with maj7/min7 and 9th chord extensions' : '';

  const parts = [
    `${genre}, ${mood}, ${bpm} BPM`,
    `key of ${key} ${scale}`,
    `${chordTemplate} chord progression${extensions}`,
    `${instruments}, no vocals`,
    `${loopBars}-bar loop (${durationSec} seconds)`,
    `use case: ${useCase}`,
    `emotional feel: ${MOOD_CONFIG[mood].prompt}`,
    `style: ${GENRE_CONFIG[genre].prompt}`,
    visualKeywords ? `visual atmosphere: ${visualKeywords}` : '',
  ].filter(Boolean);

  return parts.join(', ');
}

export function getLoopDuration(loopBars: 16 | 32, bpm: number): number {
  return Math.round((loopBars * 4) / (bpm / 60));
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
