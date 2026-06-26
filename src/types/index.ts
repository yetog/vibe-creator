// =============================================================================
// VIBE CREATOR TYPES
// =============================================================================

// Mood options
export type Mood = 'chill' | 'energetic' | 'dark' | 'uplifting';

// Genre options
export type Genre = 'lofi' | 'house' | 'ambient' | 'electronic' | 'soul' | 'funk' | 'dnb' | 'vaporwave' | 'trapsoul' | 'westcoast';

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
  dnb: {
    bpmRange: [160, 180],
    prompt: 'drum and bass with heavy sub-bass, breakbeats and rolling percussion',
    instruments: ['sub bass', 'breakbeats', 'pads', 'reese bass'],
  },
  vaporwave: {
    bpmRange: [70, 90],
    prompt: 'vaporwave with chopped retro samples, dreamy synths and nostalgic atmosphere',
    instruments: ['sampler', 'electric piano', 'chorus synth', 'reverb'],
  },
  trapsoul: {
    bpmRange: [65, 75],
    prompt: 'trap soul with 808 bass, dark melodic synths and R&B influenced atmosphere',
    instruments: ['808 bass', 'trap hi-hats', 'melodic synth', 'vocal chops'],
  },
  westcoast: {
    bpmRange: [90, 100],
    prompt: 'west coast rap beat with G-funk synths, laid-back groove and rolling bassline',
    instruments: ['synth lead', 'funk bass', 'drum machine', 'whistle synth'],
  },
};

// =============================================================================
// ADVANCED MODE — Music Theory (ported from chord-genesis architecture)
// =============================================================================

export type MusicKey =
  | 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F'
  | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export type MusicScale =
  | 'major' | 'minor' | 'dorian' | 'phrygian' | 'lydian'
  | 'mixolydian' | 'pentatonic-major' | 'pentatonic-minor'
  | 'blues' | 'harmonic-minor';

export type ChordTemplate =
  | 'I-V-vi-IV'
  | 'vi-IV-I-V'
  | 'ii-V-I'
  | 'I-vi-IV-V'
  | 'I-IV-V-I'
  | 'i-VI-VII-i'
  | 'I-bVII-IV-I';

export type LoopBars = 16 | 32;

export type UseCase =
  | 'study' | 'workout' | 'chill' | 'creative' | 'gaming' | 'meditation';

export interface AdvancedSettings {
  key:            MusicKey;
  scale:          MusicScale;
  chordTemplate:  ChordTemplate;
  loopBars:       LoopBars;
  addExtensions:  boolean;
  useCase:        UseCase;
  visualKeywords: string;
}

export const DEFAULT_ADVANCED: AdvancedSettings = {
  key:            'C',
  scale:          'minor',
  chordTemplate:  'i-VI-VII-i',
  loopBars:       16,
  addExtensions:  false,
  useCase:        'chill',
  visualKeywords: '',
};

// Scale display labels
export const SCALE_LABELS: Record<MusicScale, string> = {
  'major':           'Major',
  'minor':           'Minor',
  'dorian':          'Dorian',
  'phrygian':        'Phrygian',
  'lydian':          'Lydian',
  'mixolydian':      'Mixolydian',
  'pentatonic-major':'Pentatonic Major',
  'pentatonic-minor':'Pentatonic Minor',
  'blues':           'Blues',
  'harmonic-minor':  'Harmonic Minor',
};

// Chord template descriptions for UI tooltips
export const TEMPLATE_LABELS: Record<ChordTemplate, string> = {
  'I-V-vi-IV':    'Pop / Anthem',
  'vi-IV-I-V':    'Emotional / Sad',
  'ii-V-I':       'Jazz / Smooth',
  'I-vi-IV-V':    '50s / Soul',
  'I-IV-V-I':     'Classic / Blues',
  'i-VI-VII-i':   'Dark / Cinematic',
  'I-bVII-IV-I':  'Rock / Modal',
};

// =============================================================================
// GIF SEQUENCING — Multiple visuals per generation
// =============================================================================

export interface VisualSequenceEntry {
  gifUrl:      string;
  startSec:    number;
  durationSec: number;
  tags:        string[];
}

export interface VibeResult {
  audioUrl:         string;
  visualSequence:   VisualSequenceEntry[];
  settings:         VibeSettings;
  advancedSettings?: AdvancedSettings;
}

// =============================================================================
// AURA MODE — Anime-themed generation
// =============================================================================

export type AuraScene =
  | 'training'
  | 'fight'
  | 'meditation'
  | 'awakening'
  | 'journey'
  | 'festival';

export interface AuraSettings {
  scene:      AuraScene;
  powerLevel: number; // 1–100
}

export const DEFAULT_AURA: AuraSettings = {
  scene:      'training',
  powerLevel: 50,
};

export const AURA_SCENE_CONFIG: Record<AuraScene, {
  label:    string;
  emoji:    string;
  prompt:   string;
  bpmRange: [number, number];
}> = {
  training: {
    label:    'Training Arc',
    emoji:    '💪',
    prompt:   'intense training montage, building power, determination, taiko drums, rising tension',
    bpmRange: [130, 155],
  },
  fight: {
    label:    'Battle',
    emoji:    '⚔️',
    prompt:   'epic battle theme, clashing energy, dramatic chord hits, heroic brass, urgent strings',
    bpmRange: [155, 180],
  },
  meditation: {
    label:    'Meditation',
    emoji:    '🧘',
    prompt:   'inner peace, spiritual energy, zen atmosphere, calm power beneath the surface, soft bells',
    bpmRange: [60, 85],
  },
  awakening: {
    label:    'Awakening',
    emoji:    '✨',
    prompt:   'power awakening, dramatic reveal, overwhelming energy burst, choir swell, electric surge',
    bpmRange: [140, 165],
  },
  journey: {
    label:    'Journey',
    emoji:    '🌅',
    prompt:   'adventure theme, moving forward, epic landscapes, heroic melody, wanderer spirit',
    bpmRange: [100, 125],
  },
  festival: {
    label:    'Festival',
    emoji:    '🎉',
    prompt:   'anime festival, celebration joy, shamisen and synth fusion, upbeat and bright, dance energy',
    bpmRange: [120, 145],
  },
};
