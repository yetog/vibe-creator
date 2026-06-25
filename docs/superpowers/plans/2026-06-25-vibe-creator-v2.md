# Vibe Creator 2.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild vibe-creator with a SLAM OG HUD aesthetic, GIF-as-hero display inside a retro TV screen frame, 10 genres, and a proper audio engine — all pushable to GitHub Pages.

**Architecture:** User selects mood/genre/energy → `gifLibrary.ts` picks a curated GIF from `public/vibes/` → ElevenLabs (or demo tone) generates audio → `TvScreen` displays the looping GIF with scan-line overlay while `VibeCanvas` pulses behind it as ambient glow. `useAudioEngine` (ported from chord-genesis) handles compression + master gain + tempo + loop.

**Tech Stack:** React 18, TypeScript 5.6, Vite 5.4, Tailwind CSS 3.4, Web Audio API, ElevenLabs sound-generation API, Google Fonts (Cinzel + Inter)

## Global Constraints

- `base: '/vibe-creator/'` in vite.config.ts — all `public/` asset paths must be prefixed with `import.meta.env.BASE_URL`
- TypeScript strict mode — no implicit `any`
- No new npm dependencies — use only what's in package.json already
- All new genres must have entries in both `GENRE_CONFIG` (types/index.ts) and `promptBuilder.ts`
- Commit after every task

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `tailwind.config.js` | Modify | Add SLAM OG color tokens + font families |
| `src/index.css` | Rewrite | Design system: tokens, Cinzel import, HUD classes, animations |
| `src/types/index.ts` | Modify | Add 4 new genres, keep EnergyLevel fix |
| `src/utils/promptBuilder.ts` | Modify | Add new genre prompts + emoji |
| `src/services/elevenLabs.ts` | Modify | Fix BASE_URL prefix on demo sample paths |
| `.env.example` | Create | Document VITE_ELEVENLABS_API_KEY |
| `src/components/VibeCanvas.tsx` | Modify | Fix RAF bug: move analysis/energy/mood to refs |
| `src/services/gifLibrary.ts` | Create | Read manifest.json, filter by mood/genre/energy, return gif path |
| `public/vibes/manifest.json` | Create | GIF index with mood/genre/energy tags |
| `public/vibes/placeholder.gif` | Create | Single placeholder so demo always renders |
| `src/hooks/useAudioEngine.ts` | Create | Port chord-genesis useAudioContext: compression + gain + tempo + loop |
| `src/components/GifPlayer.tsx` | Create | Loop a GIF URL, crossfade on src change |
| `src/components/TvScreen.tsx` | Create | Monitor bezel + scan lines + channel bar |
| `src/components/PlaybackControls.tsx` | Create | Volume, BPM readout, play/pause, loop — adapted from chord-genesis PlaybackBar |
| `src/components/MoodSelector.tsx` | Rewrite | SLAM OG HUD style |
| `src/components/GenreSelector.tsx` | Rewrite | SLAM OG style + 4 new genres |
| `src/components/EnergySlider.tsx` | Rewrite | SLAM OG gold slider |
| `src/App.tsx` | Rewrite | Two-column HUD layout: TV screen left, controls right, playback bar bottom |

---

## Task 1: Design System — Tailwind + CSS

**Files:**
- Modify: `tailwind.config.js`
- Rewrite: `src/index.css`

**Interfaces:**
- Produces: CSS custom properties (`--gold`, `--cyan`, `--bg`, etc.), utility classes (`.app-hud`, `.eyebrow`, `.card-hud`, `.border-sweep`, `.scan-lines`), Cinzel font available via `font-cinzel` Tailwind class

- [ ] **Step 1: Update tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A24A',
          dim:     '#8a6e2f',
          glow:    '#e8c06a',
        },
        cyan: {
          hud:     '#4dd9ff',
          dim:     '#2a8fa8',
        },
        slam: {
          bg:      '#020202',
          surface: '#151515',
          surface2:'#1e1e1e',
          border:  '#262626',
        },
      },
      fontFamily: {
        cinzel: ['Cinzel', 'Georgia', 'serif'],
        inter:  ['Inter', 'system-ui', 'sans-serif'],
        mono:   ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'border-sweep': 'borderSweep 6s linear infinite',
        'pulse-dot':    'pulseDot 2s ease-in-out infinite',
        'scan':         'scanMove 8s linear infinite',
      },
      keyframes: {
        borderSweep: {
          '0%, 100%': { borderColor: '#C9A24A' },
          '50%':      { borderColor: '#4dd9ff' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1',   transform: 'scale(1)' },
          '50%':      { opacity: '0.4', transform: 'scale(0.85)' },
        },
        scanMove: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      boxShadow: {
        'gold-glow':  '0 0 20px rgba(201, 162, 74, 0.4)',
        'cyan-glow':  '0 0 20px rgba(77, 217, 255, 0.4)',
        'tv-inner':   'inset 0 0 40px rgba(0,0,0,0.8), inset 0 0 80px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: Rewrite src/index.css**

```css
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ── Design tokens ── */
:root {
  --bg:        #020202;
  --surface:   #151515;
  --surface-2: #1e1e1e;
  --gold:      #C9A24A;
  --gold-dim:  #8a6e2f;
  --cyan:      #4dd9ff;
  --cyan-dim:  #2a8fa8;
  --text:      #F8F6F0;
  --muted:     #6b7280;
  --border:    #262626;
  --grid-dot:  rgba(201, 162, 74, 0.06);
}

/* ── Base ── */
html, body {
  margin: 0;
  background-color: var(--bg);
  color: var(--text);
  font-family: 'Inter', system-ui, sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

/* ── HUD grid panel ── */
.app-hud {
  background-color: var(--surface);
  background-image: radial-gradient(var(--grid-dot) 1px, transparent 1px);
  background-size: 20px 20px;
  border: 1px solid var(--border);
  border-radius: 8px;
}

/* ── Eyebrow label ── */
.eyebrow {
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--muted);
}

/* ── Card with hover gold border ── */
.card-hud {
  background-color: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.card-hud:hover {
  border-color: var(--gold-dim);
  box-shadow: 0 0 12px rgba(201,162,74,0.15);
}

/* ── Border sweep animation ── */
.border-sweep {
  animation: borderSweep 6s linear infinite;
}
@keyframes borderSweep {
  0%, 100% { border-color: var(--gold); }
  50%       { border-color: var(--cyan); }
}

/* ── Scan lines ── */
.scan-lines::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 3px,
    rgba(0,0,0,0.08) 3px,
    rgba(0,0,0,0.08) 4px
  );
  pointer-events: none;
  z-index: 10;
  border-radius: inherit;
}

/* ── TV screen glow (used on canvas container) ── */
.tv-screen {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow:
    inset 0 0 40px rgba(0,0,0,0.8),
    inset 0 0 80px rgba(0,0,0,0.4),
    0 0 30px rgba(201,162,74,0.15);
}

/* ── Gold input focus ── */
.input-hud {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-family: 'Inter', sans-serif;
  transition: border-color 0.15s;
}
.input-hud:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 2px rgba(201,162,74,0.15);
}
.input-hud::placeholder { color: var(--muted); }

/* ── Range slider — gold thumb ── */
input[type='range'].slider-hud {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  outline: none;
}
input[type='range'].slider-hud::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--gold);
  cursor: pointer;
  box-shadow: 0 0 6px rgba(201,162,74,0.6);
}
input[type='range'].slider-hud::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--gold);
  cursor: pointer;
  border: none;
  box-shadow: 0 0 6px rgba(201,162,74,0.6);
}

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--gold-dim); }
```

- [ ] **Step 3: Commit**

```bash
cd /c/Users/iyoungburke/Desktop/Projects/vibe-creator
git add tailwind.config.js src/index.css
git commit -m "feat: SLAM OG design system — Cinzel, gold/cyan tokens, HUD classes"
```

---

## Task 2: Types + promptBuilder — add 4 new genres

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/utils/promptBuilder.ts`

**Interfaces:**
- Produces: `Genre` type includes `'dnb' | 'vaporwave' | 'trapsoul' | 'westcoast'`; `GENRE_CONFIG` has entries for all 10; `getGenreEmoji` handles all 10

- [ ] **Step 1: Update Genre type and GENRE_CONFIG in src/types/index.ts**

Replace the `Genre` type and `GENRE_CONFIG` object (keep everything else unchanged):

```ts
export type Genre = 'lofi' | 'house' | 'ambient' | 'electronic' | 'soul' | 'funk' | 'dnb' | 'vaporwave' | 'trapsoul' | 'westcoast';
```

Add these 4 entries to `GENRE_CONFIG` after `funk`:

```ts
  dnb: {
    bpmRange: [160, 180] as [number, number],
    prompt: 'drum and bass with heavy sub-bass, breakbeats and rolling percussion',
    instruments: ['sub bass', 'breakbeats', 'pads', 'reese bass'],
  },
  vaporwave: {
    bpmRange: [70, 90] as [number, number],
    prompt: 'vaporwave with chopped retro samples, dreamy synths and nostalgic atmosphere',
    instruments: ['sampler', 'electric piano', 'chorus synth', 'reverb'],
  },
  trapsoul: {
    bpmRange: [65, 75] as [number, number],
    prompt: 'trap soul with 808 bass, dark melodic synths and R&B influenced atmosphere',
    instruments: ['808 bass', 'trap hi-hats', 'melodic synth', 'vocal chops'],
  },
  westcoast: {
    bpmRange: [90, 100] as [number, number],
    prompt: 'west coast rap beat with G-funk synths, laid-back groove and rolling bassline',
    instruments: ['synth lead', 'funk bass', 'drum machine', 'whistle synth'],
  },
```

- [ ] **Step 2: Update src/utils/promptBuilder.ts — add new emoji**

Replace the `getGenreEmoji` function:

```ts
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
```

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts src/utils/promptBuilder.ts
git commit -m "feat: add DNB, Vaporwave, Trap Soul, West Coast genres"
```

---

## Task 3: Fix elevenLabs.ts + add .env.example

**Files:**
- Modify: `src/services/elevenLabs.ts`
- Create: `.env.example`

**Interfaces:**
- Consumes: `import.meta.env.BASE_URL` (string, e.g. `/vibe-creator/`)
- Produces: Demo sample paths prefixed correctly; `.env.example` documents the key

- [ ] **Step 1: Fix demo sample paths in getDemoAudio**

In `src/services/elevenLabs.ts`, replace the `demoSamples` object inside `getDemoAudio`:

```ts
const base = import.meta.env.BASE_URL;
const demoSamples: Record<string, string> = {
  chill:     `${base}samples/chill-demo.mp3`,
  energetic: `${base}samples/energetic-demo.mp3`,
  dark:      `${base}samples/dark-demo.mp3`,
  uplifting: `${base}samples/uplifting-demo.mp3`,
};
```

- [ ] **Step 2: Create .env.example**

Create file at repo root:

```
# ElevenLabs API key — get yours at https://elevenlabs.io
# Without this, the app runs in demo mode with a synthesized audio fallback
VITE_ELEVENLABS_API_KEY=your_key_here
```

- [ ] **Step 3: Commit**

```bash
git add src/services/elevenLabs.ts .env.example
git commit -m "fix: BASE_URL prefix on demo sample paths, add .env.example"
```

---

## Task 4: Fix VibeCanvas RAF bug

**Files:**
- Modify: `src/components/VibeCanvas.tsx`

**Interfaces:**
- Consumes: `analysis: AudioAnalysis | null`, `energy: number`, `mood: Mood` (all via refs now)
- Produces: Stable `draw` callback with empty deps; animation runs via clean RAF chain without effect restarts

- [ ] **Step 1: Add refs for reactive values at top of VibeCanvas component**

After the existing refs (`canvasRef`, `particlesRef`, `animationRef`, `timeRef`), add:

```ts
const analysisRef  = useRef<AudioAnalysis | null>(analysis);
const energyRef    = useRef<number>(energy);
const moodRef      = useRef<Mood>(mood);
```

- [ ] **Step 2: Add effects to keep refs in sync**

After the existing `useImperativeHandle`:

```ts
useEffect(() => { analysisRef.current  = analysis; }, [analysis]);
useEffect(() => { energyRef.current    = energy;   }, [energy]);
useEffect(() => { moodRef.current      = mood;     }, [mood]);
```

- [ ] **Step 3: Update draw to read from refs, remove reactive deps**

Change the `draw` useCallback to read from refs instead of closure values, and change its dependency array to `[]`:

Inside `draw`, replace every reference to `analysis` with `analysisRef.current`, `energy` with `energyRef.current`, and update `config` / `colors` to derive from `moodRef.current`:

```ts
const draw = useCallback(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Read live values from refs — stable closure, no dep restarts
  const analysis      = analysisRef.current;
  const energy        = energyRef.current;
  const currentConfig = MOOD_CONFIG[moodRef.current];
  const colors        = currentConfig.colors;

  const width   = canvas.width;
  const height  = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;

  timeRef.current += 0.016;
  const time = timeRef.current;

  const bass = analysis?.bass ?? 0.5;
  const mid  = analysis?.mid  ?? 0.5;
  const high = analysis?.high ?? 0.5;
  const rms  = analysis?.rms  ?? 0.3;

  ctx.fillStyle = `${colors.background}cc`;
  ctx.fillRect(0, 0, width, height);

  const pulseSize = 100 + bass * 150;
  const gradient  = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize);
  gradient.addColorStop(0, `${colors.primary}40`);
  gradient.addColorStop(0.5, `${colors.secondary}20`);
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const ringCount = 3;
  for (let r = 0; r < ringCount; r++) {
    const ringRadius = 60 + r * 40 + mid * 30;
    const rotation   = time * (0.5 + r * 0.2) * currentConfig.motionSpeed;
    const segments   = 12 + r * 4;
    ctx.strokeStyle = `${colors.accent}${Math.floor(50 + high * 50).toString(16).padStart(2, '0')}`;
    ctx.lineWidth   = 2 + bass * 2;
    ctx.beginPath();
    for (let i = 0; i < segments; i++) {
      const angle  = (i / segments) * Math.PI * 2 + rotation;
      const wobble = Math.sin(time * 3 + i) * 5 * mid;
      const x = centerX + Math.cos(angle) * (ringRadius + wobble);
      const y = centerY + Math.sin(angle) * (ringRadius + wobble);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  const orbSize    = 30 + bass * 40 + rms * 20;
  const orbGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbSize);
  orbGradient.addColorStop(0, colors.primary);
  orbGradient.addColorStop(0.5, colors.secondary);
  orbGradient.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(centerX, centerY, orbSize, 0, Math.PI * 2);
  ctx.fillStyle = orbGradient;
  ctx.fill();

  const speedMultiplier = currentConfig.motionSpeed * (0.5 + energy / 10);
  particlesRef.current.forEach((particle) => {
    particle.x += particle.vx * speedMultiplier * (1 + bass);
    particle.y += particle.vy * speedMultiplier * (1 + bass);
    if (particle.x < 0)      particle.x = width;
    if (particle.x > width)  particle.x = 0;
    if (particle.y < 0)      particle.y = height;
    if (particle.y > height) particle.y = 0;
    const particleSize = particle.size * (1 + high * 2);
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particleSize, 0, Math.PI * 2);
    ctx.fillStyle = particle.color + Math.floor(particle.alpha * 255 * (0.5 + rms)).toString(16).padStart(2, '0');
    ctx.fill();
  });

  if (analysis?.frequencyData) {
    const barCount = 32;
    const barWidth = width / barCount;
    for (let i = 0; i < barCount; i++) {
      const value     = analysis.frequencyData[i * 4] / 255;
      const barHeight = value * 50;
      ctx.fillStyle = `${colors.accent}30`;
      ctx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight);
    }
  }

  animationRef.current = requestAnimationFrame(draw);
}, []); // empty deps — stable loop, refs provide live values
```

- [ ] **Step 4: Simplify the isPlaying effect**

Replace the existing `useEffect` that calls `draw()`:

```ts
useEffect(() => {
  if (isPlaying) {
    animationRef.current = requestAnimationFrame(draw);
  }
  return () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };
}, [isPlaying, draw]);
```

- [ ] **Step 5: Commit**

```bash
git add src/components/VibeCanvas.tsx
git commit -m "fix: VibeCanvas RAF loop — stable draw via refs, no per-frame effect restart"
```

---

## Task 5: GIF Library

**Files:**
- Create: `src/services/gifLibrary.ts`
- Create: `public/vibes/manifest.json`

**Interfaces:**
- Produces: `getGif(mood, genre, energy): string` — returns a full URL path (prefixed with BASE_URL); `GifEntry` type; `manifest.json` schema

- [ ] **Step 1: Create public/vibes/manifest.json**

```json
{
  "vibes": [
    {
      "id": "chill-lofi-1",
      "file": "chill_lofi/placeholder.gif",
      "mood": "chill",
      "genre": "lofi",
      "energyMin": 1,
      "energyMax": 10
    },
    {
      "id": "chill-ambient-1",
      "file": "chill_ambient/placeholder.gif",
      "mood": "chill",
      "genre": "ambient",
      "energyMin": 1,
      "energyMax": 10
    },
    {
      "id": "chill-vaporwave-1",
      "file": "chill_vaporwave/placeholder.gif",
      "mood": "chill",
      "genre": "vaporwave",
      "energyMin": 1,
      "energyMax": 10
    },
    {
      "id": "energetic-house-1",
      "file": "energetic_house/placeholder.gif",
      "mood": "energetic",
      "genre": "house",
      "energyMin": 5,
      "energyMax": 10
    },
    {
      "id": "energetic-dnb-1",
      "file": "energetic_dnb/placeholder.gif",
      "mood": "energetic",
      "genre": "dnb",
      "energyMin": 6,
      "energyMax": 10
    },
    {
      "id": "energetic-funk-1",
      "file": "energetic_funk/placeholder.gif",
      "mood": "energetic",
      "genre": "funk",
      "energyMin": 4,
      "energyMax": 10
    },
    {
      "id": "dark-electronic-1",
      "file": "dark_electronic/placeholder.gif",
      "mood": "dark",
      "genre": "electronic",
      "energyMin": 1,
      "energyMax": 10
    },
    {
      "id": "dark-trapsoul-1",
      "file": "dark_trapsoul/placeholder.gif",
      "mood": "dark",
      "genre": "trapsoul",
      "energyMin": 1,
      "energyMax": 10
    },
    {
      "id": "dark-dnb-1",
      "file": "dark_dnb/placeholder.gif",
      "mood": "dark",
      "genre": "dnb",
      "energyMin": 5,
      "energyMax": 10
    },
    {
      "id": "uplifting-soul-1",
      "file": "uplifting_soul/placeholder.gif",
      "mood": "uplifting",
      "genre": "soul",
      "energyMin": 1,
      "energyMax": 10
    },
    {
      "id": "uplifting-westcoast-1",
      "file": "uplifting_westcoast/placeholder.gif",
      "mood": "uplifting",
      "genre": "westcoast",
      "energyMin": 1,
      "energyMax": 10
    },
    {
      "id": "fallback-chill",
      "file": "fallback.gif",
      "mood": "chill",
      "genre": "lofi",
      "energyMin": 1,
      "energyMax": 10
    }
  ]
}
```

- [ ] **Step 2: Create placeholder GIF and folder structure**

```bash
cd /c/Users/iyoungburke/Desktop/Projects/vibe-creator

# Create a 1×1 valid GIF as fallback (base64 decode via node)
node -e "
const fs = require('fs');
const b64 = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
const buf = Buffer.from(b64, 'base64');
fs.mkdirSync('public/vibes', { recursive: true });
fs.writeFileSync('public/vibes/fallback.gif', buf);
console.log('placeholder.gif written');
"
```

All manifest entries point to `fallback.gif` initially. Drop real GIFs into `public/vibes/` and update `manifest.json` file paths whenever you have them — no code changes needed.

- [ ] **Step 3: Create src/services/gifLibrary.ts**

```ts
interface GifEntry {
  id: string;
  file: string;
  mood: string;
  genre: string;
  energyMin: number;
  energyMax: number;
}

interface GifManifest {
  vibes: GifEntry[];
}

let cachedManifest: GifManifest | null = null;

async function loadManifest(): Promise<GifManifest> {
  if (cachedManifest) return cachedManifest;
  const base = import.meta.env.BASE_URL;
  const res  = await fetch(`${base}vibes/manifest.json`);
  if (!res.ok) throw new Error(`Failed to load GIF manifest: ${res.status}`);
  cachedManifest = await res.json() as GifManifest;
  return cachedManifest;
}

export async function getGif(
  mood: string,
  genre: string,
  energy: number
): Promise<string> {
  const base     = import.meta.env.BASE_URL;
  const manifest = await loadManifest();

  // 1. Exact match: mood + genre + energy in range
  let candidates = manifest.vibes.filter(
    (v) => v.mood === mood && v.genre === genre && energy >= v.energyMin && energy <= v.energyMax
  );

  // 2. Fallback: mood + genre (any energy)
  if (candidates.length === 0) {
    candidates = manifest.vibes.filter((v) => v.mood === mood && v.genre === genre);
  }

  // 3. Fallback: mood only
  if (candidates.length === 0) {
    candidates = manifest.vibes.filter((v) => v.mood === mood);
  }

  // 4. Last resort: any entry
  if (candidates.length === 0) {
    candidates = manifest.vibes;
  }

  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  return `${base}vibes/${pick.file}`;
}
```

- [ ] **Step 4: Commit**

```bash
git add public/vibes/ src/services/gifLibrary.ts
git commit -m "feat: GIF library — manifest.json + gifLibrary service with mood/genre/energy fallback"
```

---

## Task 6: useAudioEngine hook

**Files:**
- Create: `src/hooks/useAudioEngine.ts`

**Interfaces:**
- Produces: `useAudioEngine()` returns `{ isPlaying, isLooping, tempo, masterVolume, loadAudio, play, pause, stop, toggleLoop, setTempo, setMasterVolume, getAudioContext, connectRecording }`

- [ ] **Step 1: Create src/hooks/useAudioEngine.ts**

```ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioAnalysis } from '../types';

interface UseAudioEngineReturn {
  isPlaying:    boolean;
  isLooping:    boolean;
  tempo:        number;
  masterVolume: number;
  analysis:     AudioAnalysis | null;
  loadAudio:    (url: string) => Promise<void>;
  play:         () => void;
  pause:        () => void;
  stop:         () => void;
  toggleLoop:   () => void;
  setTempo:     (bpm: number) => void;
  setMasterVolume: (vol: number) => void;
  getAudioContext: () => AudioContext | null;
  connectRecording: (dest: MediaStreamAudioDestinationNode) => void;
}

export function useAudioEngine(): UseAudioEngineReturn {
  const audioContextRef  = useRef<AudioContext | null>(null);
  const analyserRef      = useRef<AnalyserNode | null>(null);
  const compressorRef    = useRef<DynamicsCompressorNode | null>(null);
  const masterGainRef    = useRef<GainNode | null>(null);
  const sourceRef        = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef   = useRef<AudioBuffer | null>(null);

  const [isPlaying,    setIsPlaying]    = useState(false);
  const [isLooping,    setIsLooping]    = useState(true);
  const [tempo,        setTempoState]   = useState(90);
  const [masterVolume, setVolumeState]  = useState(0.8);

  const initContext = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Analyser (for canvas reactivity)
    analyserRef.current              = ctx.createAnalyser();
    analyserRef.current.fftSize      = 256;
    analyserRef.current.smoothingTimeConstant = 0.8;

    // Compressor — from chord-genesis tuning
    compressorRef.current            = ctx.createDynamicsCompressor();
    compressorRef.current.threshold.setValueAtTime(-24, ctx.currentTime);
    compressorRef.current.knee.setValueAtTime(30, ctx.currentTime);
    compressorRef.current.ratio.setValueAtTime(12, ctx.currentTime);
    compressorRef.current.attack.setValueAtTime(0.003, ctx.currentTime);
    compressorRef.current.release.setValueAtTime(0.25, ctx.currentTime);

    // Master gain
    masterGainRef.current = ctx.createGain();
    masterGainRef.current.gain.setValueAtTime(0.8, ctx.currentTime);

    // Chain: analyser → compressor → masterGain → destination
    analyserRef.current.connect(compressorRef.current);
    compressorRef.current.connect(masterGainRef.current);
    masterGainRef.current.connect(ctx.destination);

    audioContextRef.current = ctx;
    return ctx;
  }, []);

  const loadAudio = useCallback(async (url: string) => {
    const ctx = initContext();
    if (ctx.state === 'suspended') await ctx.resume();
    const response    = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    audioBufferRef.current = await ctx.decodeAudioData(arrayBuffer);
  }, [initContext]);

  const play = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx || !audioBufferRef.current || !analyserRef.current) {
      console.error('Audio not loaded');
      return;
    }
    if (ctx.state === 'suspended') ctx.resume();
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch (_) { /* already stopped */ }
    }
    const source        = ctx.createBufferSource();
    source.buffer       = audioBufferRef.current;
    source.loop         = isLooping;
    source.connect(analyserRef.current);
    source.start();
    sourceRef.current = source;
    source.onended = () => {
      if (!source.loop) setIsPlaying(false);
    };
    setIsPlaying(true);
  }, [isLooping]);

  const pause = useCallback(() => {
    audioContextRef.current?.suspend();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch (_) { /* already stopped */ }
      sourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const toggleLoop = useCallback(() => {
    setIsLooping((prev) => {
      if (sourceRef.current) sourceRef.current.loop = !prev;
      return !prev;
    });
  }, []);

  const setTempo = useCallback((bpm: number) => {
    setTempoState(bpm);
  }, []);

  const setMasterVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (masterGainRef.current) {
      masterGainRef.current.gain.setValueAtTime(vol, masterGainRef.current.context.currentTime);
    }
  }, []);

  const getAudioContext = useCallback(() => audioContextRef.current, []);

  const connectRecording = useCallback((dest: MediaStreamAudioDestinationNode) => {
    analyserRef.current?.connect(dest);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      audioContextRef.current?.close();
    };
  }, [stop]);

  return {
    isPlaying, isLooping, tempo, masterVolume,
    loadAudio, play, pause, stop,
    toggleLoop, setTempo, setMasterVolume,
    getAudioContext, connectRecording,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useAudioEngine.ts
git commit -m "feat: useAudioEngine — compression chain + master gain + loop (ported from chord-genesis)"
```

---

## Task 7: GifPlayer component

**Files:**
- Create: `src/components/GifPlayer.tsx`

**Interfaces:**
- Consumes: `gifUrl: string | null`, `isPlaying: boolean`
- Produces: `<GifPlayer>` renders an `<img>` that crossfades when `gifUrl` changes; shows a "standby" state when `gifUrl` is null

- [ ] **Step 1: Create src/components/GifPlayer.tsx**

```tsx
import { useEffect, useState } from 'react';

interface GifPlayerProps {
  gifUrl:    string | null;
  isPlaying: boolean;
}

export function GifPlayer({ gifUrl, isPlaying }: GifPlayerProps) {
  const [displayUrl, setDisplayUrl] = useState<string | null>(gifUrl);
  const [fading,     setFading]     = useState(false);

  useEffect(() => {
    if (gifUrl === displayUrl) return;
    setFading(true);
    const t = setTimeout(() => {
      setDisplayUrl(gifUrl);
      setFading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [gifUrl, displayUrl]);

  if (!displayUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3"
           style={{ background: '#0a0a0a' }}>
        <div className="text-4xl opacity-30">📡</div>
        <p className="eyebrow" style={{ color: 'var(--muted)' }}>Awaiting signal</p>
      </div>
    );
  }

  return (
    <img
      src={displayUrl}
      alt="vibe visual"
      className="w-full h-full object-cover"
      style={{
        opacity:    fading ? 0 : (isPlaying ? 1 : 0.5),
        transition: 'opacity 0.3s ease',
        display:    'block',
      }}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GifPlayer.tsx
git commit -m "feat: GifPlayer — crossfade on URL change, standby state"
```

---

## Task 8: TvScreen component

**Files:**
- Create: `src/components/TvScreen.tsx`

**Interfaces:**
- Consumes: `mood: Mood`, `genre: Genre`, `energy: number`, `isPlaying: boolean`, `children: ReactNode` (the GifPlayer + VibeCanvas sit inside)
- Produces: `<TvScreen>` renders the monitor bezel, scan-line overlay, channel bar, power dot

- [ ] **Step 1: Create src/components/TvScreen.tsx**

```tsx
import { type ReactNode } from 'react';
import { type Mood, type Genre } from '../types';

interface TvScreenProps {
  mood:      Mood;
  genre:     Genre;
  energy:    number;
  isPlaying: boolean;
  children:  ReactNode;
}

const CHANNEL_MAP: Record<Mood, string> = {
  chill:     'CH 01',
  energetic: 'CH 02',
  dark:      'CH 03',
  uplifting: 'CH 04',
};

const GENRE_LABEL: Record<string, string> = {
  lofi:      'LO-FI',
  house:     'HOUSE',
  ambient:   'AMBIENT',
  electronic:'ELECTRONIC',
  soul:      'SOUL',
  funk:      'FUNK',
  dnb:       'DNB',
  vaporwave: 'VAPORWAVE',
  trapsoul:  'TRAP SOUL',
  westcoast: 'WEST COAST',
};

export function TvScreen({ mood, genre, energy, isPlaying, children }: TvScreenProps) {
  const channel    = CHANNEL_MAP[mood];
  const genreLabel = GENRE_LABEL[genre] ?? genre.toUpperCase();

  return (
    <div
      className="rounded-xl overflow-hidden border-2 border-sweep"
      style={{
        background:    'var(--surface)',
        boxShadow:     '0 0 40px rgba(201,162,74,0.12), inset 0 0 2px rgba(201,162,74,0.3)',
        display:       'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          background:  'var(--bg)',
          borderBottom:'1px solid var(--border)',
        }}
      >
        <span className="font-cinzel text-xs font-semibold tracking-widest"
              style={{ color: 'var(--gold)' }}>
          VIBE CREATOR BROADCAST
        </span>
        <span className="eyebrow" style={{ color: 'var(--muted)' }}>
          FREQ {energy * 11}.{energy}MHz
        </span>
      </div>

      {/* Screen area — children are positioned absolutely by the parent (App.tsx) */}
      <div className="relative scan-lines tv-screen" style={{ aspectRatio: '1 / 1' }}>
        {children}
      </div>

      {/* Channel bar */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          background:  'var(--bg)',
          borderTop:   '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Power dot */}
          <span
            className={isPlaying ? 'animate-pulse-dot' : ''}
            style={{
              display:      'inline-block',
              width:        8,
              height:       8,
              borderRadius: '50%',
              background:   isPlaying ? 'var(--cyan)' : 'var(--border)',
              boxShadow:    isPlaying ? '0 0 6px var(--cyan)' : 'none',
              transition:   'background 0.3s, box-shadow 0.3s',
            }}
          />
          <span className="font-mono text-xs" style={{ color: 'var(--gold)' }}>
            {channel}
          </span>
          <span className="eyebrow" style={{ color: 'var(--muted)' }}>
            {mood.toUpperCase()} · {genreLabel}
          </span>
        </div>
        <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
          E:{energy}/10
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TvScreen.tsx
git commit -m "feat: TvScreen — monitor bezel, scan lines, channel bar, power dot"
```

---

## Task 9: PlaybackControls component

**Files:**
- Create: `src/components/PlaybackControls.tsx`

**Interfaces:**
- Consumes: `isPlaying`, `isLooping`, `isGenerating`, `tempo`, `masterVolume`, `onGenerate`, `onPlayPause`, `onToggleLoop`, `onVolumeChange`, `onTempoChange` (all passed from App)
- Produces: `<PlaybackControls>` — full bottom bar with generate button, play/pause, loop, volume slider, BPM readout

- [ ] **Step 1: Create src/components/PlaybackControls.tsx**

```tsx
import { Play, Pause, Repeat, Sparkles, Volume2 } from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying:     boolean;
  isLooping:     boolean;
  isGenerating:  boolean;
  hasAudio:      boolean;
  tempo:         number;
  masterVolume:  number;
  onGenerate:    () => void;
  onPlayPause:   () => void;
  onToggleLoop:  () => void;
  onVolumeChange:(vol: number) => void;
  onTempoChange: (bpm: number) => void;
}

export function PlaybackControls({
  isPlaying, isLooping, isGenerating, hasAudio,
  tempo, masterVolume,
  onGenerate, onPlayPause, onToggleLoop,
  onVolumeChange, onTempoChange,
}: PlaybackControlsProps) {
  return (
    <div
      className="flex items-center gap-4 px-6 py-4 flex-wrap"
      style={{
        background:  'var(--bg)',
        borderTop:   '1px solid var(--border)',
      }}
    >
      {/* Generate */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-cinzel font-semibold text-sm tracking-widest transition-all"
        style={{
          background:  isGenerating
            ? 'var(--surface-2)'
            : 'linear-gradient(135deg, var(--gold), var(--cyan))',
          color:       isGenerating ? 'var(--muted)' : 'var(--bg)',
          cursor:      isGenerating ? 'wait' : 'pointer',
          boxShadow:   isGenerating ? 'none' : '0 0 16px rgba(201,162,74,0.35)',
          border:      '1px solid transparent',
        }}
      >
        <Sparkles size={15} />
        {isGenerating ? 'GENERATING…' : 'GENERATE VIBE'}
      </button>

      {/* Play / Pause — only when audio loaded */}
      {hasAudio && (
        <button
          onClick={onPlayPause}
          className="p-2.5 rounded-lg transition-all card-hud"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying
            ? <Pause size={16} style={{ color: 'var(--gold)' }} />
            : <Play  size={16} style={{ color: 'var(--gold)' }} />
          }
        </button>
      )}

      {/* Loop toggle */}
      {hasAudio && (
        <button
          onClick={onToggleLoop}
          className="p-2.5 rounded-lg transition-all"
          title={isLooping ? 'Disable loop' : 'Enable loop'}
          style={{
            background: isLooping ? 'rgba(201,162,74,0.15)' : 'var(--surface-2)',
            border:     `1px solid ${isLooping ? 'var(--gold)' : 'var(--border)'}`,
            color:      isLooping ? 'var(--gold)' : 'var(--muted)',
          }}
        >
          <Repeat size={16} />
        </button>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Volume */}
      <div className="flex items-center gap-2">
        <Volume2 size={14} style={{ color: 'var(--muted)' }} />
        <input
          type="range"
          min="0" max="1" step="0.01"
          value={masterVolume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="slider-hud w-20"
        />
        <span className="font-mono text-xs w-9 text-right"
              style={{ color: 'var(--muted)' }}>
          {Math.round(masterVolume * 100)}%
        </span>
      </div>

      {/* BPM */}
      <div className="flex items-center gap-2">
        <span className="eyebrow">BPM</span>
        <input
          type="range"
          min="60" max="180" step="1"
          value={tempo}
          onChange={(e) => onTempoChange(parseInt(e.target.value))}
          className="slider-hud w-20"
        />
        <span className="font-mono text-xs w-8 text-right"
              style={{ color: 'var(--gold)' }}>
          {tempo}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PlaybackControls.tsx
git commit -m "feat: PlaybackControls — generate, play/pause, loop, volume, BPM bar"
```

---

## Task 10: Restyle selectors

**Files:**
- Rewrite: `src/components/MoodSelector.tsx`
- Rewrite: `src/components/GenreSelector.tsx`
- Rewrite: `src/components/EnergySlider.tsx`

**Interfaces:**
- Props are unchanged — only visual treatment changes

- [ ] **Step 1: Rewrite MoodSelector.tsx**

```tsx
import { Mood, MOOD_CONFIG } from '../types';
import { getMoodEmoji } from '../utils/promptBuilder';

interface MoodSelectorProps {
  value:    Mood;
  onChange: (mood: Mood) => void;
}

const MOODS: Mood[] = ['chill', 'energetic', 'dark', 'uplifting'];

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="eyebrow">Mood</p>
      <div className="grid grid-cols-2 gap-2">
        {MOODS.map((mood) => {
          const isSelected = value === mood;
          const config     = MOOD_CONFIG[mood];
          return (
            <button
              key={mood}
              onClick={() => onChange(mood)}
              className="relative p-3 rounded-lg text-left transition-all"
              style={{
                background:  isSelected ? 'rgba(201,162,74,0.1)' : 'var(--surface-2)',
                border:      `1px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}`,
                boxShadow:   isSelected ? '0 0 12px rgba(201,162,74,0.2)' : 'none',
                color:       'var(--text)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{getMoodEmoji(mood)}</span>
                <div>
                  <div className="font-cinzel text-xs font-semibold tracking-wider capitalize"
                       style={{ color: isSelected ? 'var(--gold)' : 'var(--text)' }}>
                    {mood}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                    {config.prompt.split(',')[0]}
                  </div>
                </div>
              </div>
              {/* Color pip */}
              <div className="absolute top-2 right-2 flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full"
                     style={{ background: config.colors.primary }} />
                <div className="w-1.5 h-1.5 rounded-full"
                     style={{ background: config.colors.secondary }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite GenreSelector.tsx**

```tsx
import { Genre, GENRE_CONFIG } from '../types';
import { getGenreEmoji } from '../utils/promptBuilder';

interface GenreSelectorProps {
  value:    Genre;
  onChange: (genre: Genre) => void;
}

const GENRES: Genre[] = [
  'lofi', 'house', 'ambient', 'electronic', 'soul', 'funk',
  'dnb', 'vaporwave', 'trapsoul', 'westcoast',
];

export function GenreSelector({ value, onChange }: GenreSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="eyebrow">Genre</p>
      <div className="flex flex-wrap gap-1.5">
        {GENRES.map((genre) => {
          const isSelected = value === genre;
          const [minBpm, maxBpm] = GENRE_CONFIG[genre].bpmRange;
          return (
            <button
              key={genre}
              onClick={() => onChange(genre)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all"
              style={{
                background: isSelected ? 'rgba(77,217,255,0.1)' : 'var(--surface-2)',
                border:     `1px solid ${isSelected ? 'var(--cyan)' : 'var(--border)'}`,
                color:      isSelected ? 'var(--cyan)' : 'var(--muted)',
                boxShadow:  isSelected ? '0 0 8px rgba(77,217,255,0.2)' : 'none',
                fontFamily: 'Inter, sans-serif',
                fontWeight: isSelected ? 600 : 400,
              }}
            >
              <span>{getGenreEmoji(genre)}</span>
              <span className="uppercase tracking-wider" style={{ fontSize: 10 }}>
                {genre === 'trapsoul'  ? 'Trap Soul'  :
                 genre === 'westcoast' ? 'West Coast' :
                 genre === 'lofi'      ? 'Lo-Fi'      :
                 genre === 'dnb'       ? 'DNB'        :
                 genre.charAt(0).toUpperCase() + genre.slice(1)}
              </span>
              <span className="font-mono" style={{ fontSize: 9, color: 'var(--muted)', opacity: 0.7 }}>
                {minBpm}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Rewrite EnergySlider.tsx**

```tsx
import { EnergyLevel } from '../types';
import { getEnergyDescriptor } from '../utils/promptBuilder';

interface EnergySliderProps {
  value:    EnergyLevel;
  onChange: (energy: EnergyLevel) => void;
}

export function EnergySlider({ value, onChange }: EnergySliderProps) {
  const pct = ((value - 1) / 9) * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="eyebrow">Energy</p>
        <span className="font-mono text-xs" style={{ color: 'var(--gold)' }}>
          {getEnergyDescriptor(value)} · {value}/10
        </span>
      </div>

      {/* Custom track */}
      <div className="relative h-5 flex items-center">
        <div className="absolute w-full h-1 rounded-full" style={{ background: 'var(--border)' }} />
        <div
          className="absolute h-1 rounded-full transition-all duration-150"
          style={{
            width:      `${pct}%`,
            background: 'linear-gradient(90deg, var(--gold-dim), var(--gold), var(--cyan))',
            boxShadow:  `0 0 8px rgba(201,162,74,${pct / 100})`,
          }}
        />
        <input
          type="range"
          min="1" max="10"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) as EnergyLevel)}
          className="slider-hud absolute w-full"
          style={{ background: 'transparent', height: '100%' }}
        />
      </div>

      <div className="flex justify-between" style={{ fontSize: 10, color: 'var(--muted)' }}>
        <span className="eyebrow">Mellow</span>
        <span className="eyebrow">Balanced</span>
        <span className="eyebrow">Intense</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/MoodSelector.tsx src/components/GenreSelector.tsx src/components/EnergySlider.tsx
git commit -m "feat: restyle selectors — SLAM OG HUD aesthetic, gold/cyan active states"
```

---

## Task 11: App.tsx — full layout overhaul

**Files:**
- Rewrite: `src/App.tsx`

**Interfaces:**
- Consumes: All components + hooks created in Tasks 4–10
- Produces: Two-column layout — TV screen left, HUD control panel right, PlaybackControls bar bottom

- [ ] **Step 1: Rewrite src/App.tsx**

```tsx
import { useState, useCallback, useRef } from 'react';
import { VibeCanvas, VibeCanvasHandle } from './components/VibeCanvas';
import { MoodSelector }      from './components/MoodSelector';
import { EnergySlider }      from './components/EnergySlider';
import { GenreSelector }     from './components/GenreSelector';
import { GifPlayer }         from './components/GifPlayer';
import { TvScreen }          from './components/TvScreen';
import { PlaybackControls }  from './components/PlaybackControls';
import { useAudioEngine }    from './hooks/useAudioEngine';
import { useAudioAnalyzer }  from './hooks/useAudioAnalyzer';
import { useVideoExport }    from './hooks/useVideoExport';
import { generateAudio, getDemoAudio } from './services/elevenLabs';
import { getGif }            from './services/gifLibrary';
import { buildAudioPrompt, buildSimplePrompt } from './utils/promptBuilder';
import { Mood, Genre, EnergyLevel, GenerationState, GENRE_CONFIG } from './types';

function App() {
  const [mood,   setMood]   = useState<Mood>('chill');
  const [energy, setEnergy] = useState<EnergyLevel>(5);
  const [genre,  setGenre]  = useState<Genre>('lofi');
  const [state,  setState]  = useState<GenerationState>('idle');
  const [error,  setError]  = useState<string | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_ELEVENLABS_API_KEY || '');
  const [showKey, setShowKey] = useState(false);

  const canvasRef = useRef<VibeCanvasHandle>(null);

  const engine = useAudioEngine();
  const { analysis } = useAudioAnalyzer();
  const { startRecording, stopRecording, isRecording } = useVideoExport();

  const hasAudio = state !== 'idle';

  // Calculate BPM from genre + energy
  const [minBpm, maxBpm] = GENRE_CONFIG[genre].bpmRange;
  const derivedBpm = Math.round(minBpm + ((energy - 1) / 9) * (maxBpm - minBpm));

  const handleGenerate = useCallback(async () => {
    setError(null);
    setState('generating');
    try {
      const [audioResult, gifPath] = await Promise.all([
        apiKey
          ? generateAudio(apiKey, { prompt: buildAudioPrompt({ mood, energy, genre }), duration: 15 })
          : getDemoAudio(mood),
        getGif(mood, genre, energy),
      ]);
      setGifUrl(gifPath);
      await engine.loadAudio(audioResult.audioUrl);
      engine.play();
      setState('playing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setState('idle');
    }
  }, [mood, energy, genre, apiKey, engine]);

  const handlePlayPause = useCallback(() => {
    if (engine.isPlaying) engine.pause();
    else engine.play();
  }, [engine]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* ── Header ── */}
      <header className="px-6 pt-6 pb-4 flex items-end justify-between"
              style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <p className="eyebrow mb-1">Powered by ElevenLabs</p>
          <h1 className="font-cinzel text-3xl font-bold tracking-widest"
              style={{
                color: 'transparent',
                background: 'linear-gradient(135deg, var(--gold), var(--cyan))',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
              }}>
            VIBE CREATOR
          </h1>
        </div>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          Audio + Visuals in one click
        </p>
      </header>

      {/* ── Main grid ── */}
      <main className="flex-1 grid lg:grid-cols-2 gap-6 p-6">

        {/* Left: TV Screen */}
        <div className="flex flex-col gap-4">
          <TvScreen mood={mood} genre={genre} energy={energy} isPlaying={engine.isPlaying}>
            {/* Canvas behind — rendered in TvScreen children slot */}
            <div className="absolute inset-0 z-0" style={{ opacity: 0.18 }}>
              <VibeCanvas
                ref={canvasRef}
                mood={mood}
                energy={energy}
                analysis={analysis}
                isPlaying={engine.isPlaying}
              />
            </div>
            {/* GIF on top */}
            <div className="absolute inset-0 z-10">
              <GifPlayer gifUrl={gifUrl} isPlaying={engine.isPlaying} />
            </div>
          </TvScreen>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg text-sm text-center"
                 style={{
                   background: 'rgba(248,81,73,0.08)',
                   border:     '1px solid rgba(248,81,73,0.3)',
                   color:      '#f85149',
                 }}>
              {error}
            </div>
          )}

          {/* Prompt preview */}
          {state === 'idle' && (
            <div className="p-3 rounded-lg text-xs text-center app-hud"
                 style={{ color: 'var(--muted)' }}>
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
                style={{ color: 'var(--muted)' }}
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
              <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer"
                 style={{ color: 'var(--gold)' }} className="hover:underline">
                elevenlabs.io
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* ── Playback bar ── */}
      <PlaybackControls
        isPlaying={engine.isPlaying}
        isLooping={engine.isLooping}
        isGenerating={state === 'generating'}
        hasAudio={hasAudio}
        tempo={derivedBpm}
        masterVolume={engine.masterVolume}
        onGenerate={handleGenerate}
        onPlayPause={handlePlayPause}
        onToggleLoop={engine.toggleLoop}
        onVolumeChange={engine.setMasterVolume}
        onTempoChange={engine.setTempo}
      />

      {/* Footer */}
      <footer className="text-center py-3 text-xs" style={{ color: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
        Built for Patch Night ·{' '}
        <a href="https://zaylegend.com" target="_blank" rel="noopener noreferrer"
           style={{ color: 'var(--gold)' }} className="hover:underline">
          zaylegend.com
        </a>
      </footer>
    </div>
  );
}

export default App;
```

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: App.tsx full HUD layout — TV screen, SIGNAL/TRANSMIT panels, PlaybackControls bar"
```

---

## Task 12: Wire up VibeCanvas inside TvScreen + final integration

**Files:**
- Modify: `src/components/TvScreen.tsx` — the canvas + gif are children, update z-index handling
- Modify: `src/App.tsx` — verify `useAudioAnalyzer` feeds canvas `analysis` prop correctly

**Note:** In Task 11's `App.tsx`, `useAudioAnalyzer` is imported for canvas `analysis`. However, `useAudioEngine` is the audio source now. The canvas only needs the analysis for reactivity — `useAudioAnalyzer` should be replaced by connecting the audio engine's analyser node directly. Update this:

- [ ] **Step 1: Remove useAudioAnalyzer from App.tsx — use engine's analyser instead**

In `src/hooks/useAudioEngine.ts`, export `analysis` state by adding an animation loop (same pattern as the original `useAudioAnalyzer`):

Add to `useAudioEngine.ts` — after existing refs, add:

```ts
const animationFrameRef = useRef<number | null>(null);
const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null);
```

Add `analyseFrame` callback before the return:

```ts
const analyseFrame = useCallback(() => {
  if (!analyserRef.current) return;
  const analyser     = analyserRef.current;
  const bufLen       = analyser.frequencyBinCount;
  const freqData     = new Uint8Array(bufLen);
  const timeData     = new Uint8Array(bufLen);
  analyser.getByteFrequencyData(freqData);
  analyser.getByteTimeDomainData(timeData);

  const bassEnd = Math.floor(bufLen * 0.1);
  const midEnd  = Math.floor(bufLen * 0.5);
  let bassSum = 0, midSum = 0, highSum = 0;
  for (let i = 0; i < bufLen; i++) {
    if (i < bassEnd)      bassSum += freqData[i];
    else if (i < midEnd)  midSum  += freqData[i];
    else                  highSum += freqData[i];
  }
  let rmsSum = 0;
  for (let i = 0; i < bufLen; i++) {
    const s = (timeData[i] - 128) / 128;
    rmsSum += s * s;
  }
  setAnalysis({
    frequencyData:  freqData,
    timeDomainData: timeData,
    bass:  bassSum / (bassEnd * 255),
    mid:   midSum  / ((midEnd - bassEnd) * 255),
    high:  highSum / ((bufLen - midEnd) * 255),
    rms:   Math.sqrt(rmsSum / bufLen),
  });
  animationFrameRef.current = requestAnimationFrame(analyseFrame);
}, []);
```

Add effect to start/stop analysis loop:

```ts
useEffect(() => {
  if (isPlaying) {
    animationFrameRef.current = requestAnimationFrame(analyseFrame);
  }
  return () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };
}, [isPlaying, analyseFrame]);
```

Add `analysis` to the return object:

```ts
return {
  isPlaying, isLooping, tempo, masterVolume, analysis,
  loadAudio, play, pause, stop,
  toggleLoop, setTempo, setMasterVolume,
  getAudioContext, connectRecording,
};
```

Update the `UseAudioEngineReturn` interface to include `analysis`.

- [ ] **Step 2: Update App.tsx — remove useAudioAnalyzer import, use engine.analysis**

In `App.tsx`:
- Remove `import { useAudioAnalyzer }` line
- Remove `const { analysis } = useAudioAnalyzer();`
- Change `analysis={analysis}` on VibeCanvas to `analysis={engine.analysis}`

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAudioEngine.ts src/App.tsx
git commit -m "feat: wire engine analysis to VibeCanvas — remove redundant useAudioAnalyzer"
```

---

## Task 13: Build verification + push

**Files:** No code changes — verify and push

- [ ] **Step 1: Install dependencies and run build**

```bash
cd /c/Users/iyoungburke/Desktop/Projects/vibe-creator
npm install
npm run build
```

Expected: Build completes with no TypeScript errors. Output in `dist/`.

- [ ] **Step 2: Run dev server and smoke-test**

```bash
npm run dev
```

Open `http://localhost:5173/vibe-creator/` and verify:
1. Cinzel header renders, gold/cyan gradient visible
2. TV screen bezel shows with scan lines
3. "SIGNAL" and "TRANSMIT" panels render in grid-dot containers
4. All 10 genres appear in genre selector
5. Click "GENERATE VIBE" → loading state → GIF area shows "Awaiting signal" or placeholder → power dot turns cyan
6. PlaybackControls bar visible at bottom with BPM + volume sliders
7. No console errors about RAF or missing modules

- [ ] **Step 3: Push to GitHub**

```bash
cd /c/Users/iyoungburke/Desktop/Projects/vibe-creator
git push origin main
```

- [ ] **Step 4: Confirm GitHub Pages rebuild**

Visit `https://yetog.github.io/vibe-creator/` after ~2 minutes. Verify the new UI loads.
