import { VibeSettings, MOOD_CONFIG, GENRE_CONFIG } from '../types';

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
 * Get genre emoji
 */
export function getGenreEmoji(genre: string): string {
  const emojis: Record<string, string> = {
    lofi: '🎧',
    house: '🏠',
    ambient: '🌊',
    electronic: '🤖',
    soul: '💜',
    funk: '🕺',
  };
  return emojis[genre] || '🎵';
}
