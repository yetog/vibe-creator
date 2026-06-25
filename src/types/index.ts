// =============================================================================
// VIBE CREATOR TYPES
// =============================================================================

// Mood options
export type Mood = 'chill' | 'energetic' | 'dark' | 'uplifting';

// Genre options
export type Genre = 'lofi' | 'house' | 'ambient' | 'electronic' | 'soul' | 'funk';

// Energy level (1-10)
export type EnergyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// User selections
export interface VibeSettings {
  mood: Mood;
  energy: EnergyLevel;
  genre: Genre;
}

// Color palette for visuals
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

// Visual parameters derived from audio
export interface VisualParams {
  bassLevel: number;      // 0-1, controls size/pulse
  midLevel: number;       // 0-1, controls rotation/movement
  highLevel: number;      // 0-1, controls particles/sparkle
  beatDetected: boolean;  // Triggers flash/impact
  averageLevel: number;   // 0-1, overall intensity
}

// Audio analysis data
export interface AudioAnalysis {
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
  bass: number;
  mid: number;
  high: number;
  rms: number;
}

// Generation state
export type GenerationState = 'idle' | 'generating' | 'playing' | 'recording' | 'complete';

// Export options
export interface ExportOptions {
  duration: number;       // seconds
  fps: number;            // frames per second
  quality: 'low' | 'medium' | 'high';
  format: 'webm' | 'gif';
}

// Mood configurations
export const MOOD_CONFIG: Record<Mood, {
  colors: ColorPalette;
  prompt: string;
  particleCount: number;
  motionSpeed: number;
}> = {
  chill: {
    colors: {
      primary: '#60A5FA',
      secondary: '#818CF8',
      accent: '#A78BFA',
      background: '#0f172a',
    },
    prompt: 'relaxing, calm, peaceful, smooth',
    particleCount: 50,
    motionSpeed: 0.5,
  },
  energetic: {
    colors: {
      primary: '#F97316',
      secondary: '#EF4444',
      accent: '#FBBF24',
      background: '#1c1917',
    },
    prompt: 'high energy, powerful, driving, intense',
    particleCount: 200,
    motionSpeed: 2.0,
  },
  dark: {
    colors: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#A855F7',
      background: '#09090b',
    },
    prompt: 'dark, mysterious, deep, atmospheric',
    particleCount: 80,
    motionSpeed: 0.8,
  },
  uplifting: {
    colors: {
      primary: '#10B981',
      secondary: '#34D399',
      accent: '#FBBF24',
      background: '#052e16',
    },
    prompt: 'uplifting, happy, positive, bright',
    particleCount: 150,
    motionSpeed: 1.2,
  },
};

// Genre configurations
export const GENRE_CONFIG: Record<Genre, {
  bpmRange: [number, number];
  prompt: string;
  instruments: string[];
}> = {
  lofi: {
    bpmRange: [70, 90],
    prompt: 'lo-fi hip hop beat with vinyl crackle and soft drums',
    instruments: ['Rhodes piano', 'soft drums', 'bass'],
  },
  house: {
    bpmRange: [120, 130],
    prompt: 'house music with four-on-the-floor beat and groovy bassline',
    instruments: ['synthesizer', 'kick drum', 'hi-hats', 'bass'],
  },
  ambient: {
    bpmRange: [60, 80],
    prompt: 'ambient soundscape with pads and atmospheric textures',
    instruments: ['pads', 'textures', 'reverb'],
  },
  electronic: {
    bpmRange: [128, 140],
    prompt: 'electronic music with synths and modern production',
    instruments: ['synthesizer', 'drums', 'effects'],
  },
  soul: {
    bpmRange: [85, 105],
    prompt: 'soulful groove with warm tones and groove',
    instruments: ['organ', 'guitar', 'drums', 'bass'],
  },
  funk: {
    bpmRange: [100, 120],
    prompt: 'funky groove with slap bass and rhythmic guitar',
    instruments: ['bass', 'guitar', 'drums', 'horns'],
  },
};
