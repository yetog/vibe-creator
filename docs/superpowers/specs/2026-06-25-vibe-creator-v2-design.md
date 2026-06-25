# Vibe Creator 2.0 — Design Spec
**Date:** 2026-06-25  
**Status:** Approved  

---

## Overview

Vibe Creator 2.0 is a mood-driven audio + visual experience generator. The user selects a mood, genre, and energy level, then generates an ElevenLabs audio track paired with a curated looping GIF displayed inside a retro-futuristic TV screen frame. The aesthetic is a SLAM OG Studio-inspired HUD: ultra-dark background, Cinzel serif headers, gold + cyan accents, scan-line overlays, and grid-dot panel containers.

**Core output:** music plays + a mood-matched GIF loops inside a glowing TV screen frame.

---

## Goals

- Audio + GIF generate together in one click
- Works in demo mode (no API key) with a synthesized audio fallback
- UI feels like a broadcast terminal from 2030
- GIF library is maintainable — drop files in `public/vibes/`, update `manifest.json`
- Bugs from v1 fixed (canvas RAF loop, base URL, EnergyLevel type)
- Push-ready code on the existing `yetog/vibe-creator` repo

---

## Genre List (10 total)

| Key | Label | BPM Range | Character |
|---|---|---|---|
| `lofi` | Lo-Fi | 70–90 | Dusty, warm, vinyl crackle |
| `house` | House | 120–130 | Four-on-the-floor, groovy bassline |
| `ambient` | Ambient | 60–80 | Atmospheric pads, textures, space |
| `electronic` | Electronic | 128–140 | Modern synths, driving production |
| `soul` | Soul | 85–105 | Warm, organic groove |
| `funk` | Funk | 100–120 | Slap bass, rhythmic guitar, horns |
| `dnb` | DNB | 160–180 | Heavy bass, breakbeats, intensity |
| `vaporwave` | Vaporwave | 70–90 | Chopped samples, dreamy, nostalgic |
| `trapsoul` | Trap Soul | 65–75 | 808s, dark melodic, R&B influenced |
| `westcoast` | West Coast | 90–100 | G-funk, laid-back, west coast rap beat |

---

## Mood List (unchanged from v1)

`chill` · `energetic` · `dark` · `uplifting`

---

## Architecture

### Layers

```
┌─────────────────────────────────────────────┐
│  UI Layer                                   │
│  TV Screen frame · HUD panels · controls    │
├─────────────────────────────────────────────┤
│  Orchestration (App.tsx)                    │
│  Generate → load audio → load GIF → play   │
├──────────────────┬──────────────────────────┤
│  Audio Engine    │  GIF Library             │
│  useAudioEngine  │  gifLibrary.ts           │
│  (from chord-    │  manifest.json           │
│   genesis)       │  public/vibes/           │
├──────────────────┴──────────────────────────┤
│  elevenLabs.ts · Canvas (ambient bg)        │
└─────────────────────────────────────────────┘
```

### File Structure Changes

```
src/
  components/
    VibeCanvas.tsx        ← fixed RAF bug, dimmed to bg
    GifPlayer.tsx         ← NEW: loops GIF, crossfade on new generate
    TvScreen.tsx          ← NEW: monitor bezel frame + scan lines + channel HUD
    MoodSelector.tsx      ← restyled SLAM OG aesthetic
    GenreSelector.tsx     ← restyled + 4 new genres
    EnergySlider.tsx      ← restyled
    PlaybackControls.tsx  ← NEW: adapted from chord-genesis PlaybackBar
  hooks/
    useAudioAnalyzer.ts   ← kept for canvas analysis
    useAudioEngine.ts     ← NEW: from chord-genesis useAudioContext
    useVideoExport.ts     ← unchanged
  services/
    elevenLabs.ts         ← fixed BASE_URL prefix
    gifLibrary.ts         ← NEW: reads manifest, filters by mood/genre/energy
  types/
    index.ts              ← add new genres + EnergyLevel cast fix
  utils/
    promptBuilder.ts      ← add new genre prompts

public/
  vibes/
    manifest.json         ← GIF index with tags
    chill_lofi/           ← GIFs per mood_genre combo
    chill_ambient/
    chill_vaporwave/
    dark_dnb/
    dark_trapsoul/
    dark_electronic/
    energetic_house/
    energetic_dnb/
    energetic_funk/
    uplifting_soul/
    uplifting_westcoast/
    ... (full mood × genre matrix as GIFs are added)

docs/
  superpowers/
    specs/
      2026-06-25-vibe-creator-v2-design.md   ← this file
```

---

## GIF Library System

### manifest.json structure

```json
{
  "vibes": [
    {
      "id": "chill-lofi-1",
      "file": "chill_lofi/vibe1.gif",
      "mood": "chill",
      "genre": "lofi",
      "energyMin": 1,
      "energyMax": 5,
      "tags": ["night", "rain", "cozy"]
    },
    {
      "id": "dark-dnb-1",
      "file": "dark_dnb/vibe1.gif",
      "mood": "dark",
      "genre": "dnb",
      "energyMin": 6,
      "energyMax": 10,
      "tags": ["neon", "urban", "intensity"]
    }
  ]
}
```

### gifLibrary.ts logic

1. Filter by `mood` — exact match required
2. Filter by `genre` — exact match preferred, falls back to mood-only if no match
3. Filter by energy range (`energyMin ≤ energy ≤ energyMax`) — falls back to mood+genre if no range match
4. Pick randomly from remaining candidates
5. Return `{ file: string, id: string }` — caller prepends `import.meta.env.BASE_URL`

### Placeholder GIFs

Until real GIFs are collected, each mood gets a single placeholder GIF (sourced or generated). The manifest ships with one entry per mood so demo mode always shows something.

---

## Audio Engine

### useAudioEngine.ts (from chord-genesis)

Replaces the basic oscillator in vibe-creator with a proper audio chain:

```
AudioBufferSourceNode
  └→ AnalyserNode (for canvas reactivity)
  └→ DynamicsCompressorNode
       └→ GainNode (master volume)
            └→ destination
```

Key capabilities borrowed:
- `DynamicsCompressor` with tuned threshold/knee/ratio/attack/release
- `masterVolume` state with real-time gain updates
- `tempo` state wired to BPM display
- `isLooping` toggle
- Graceful oscillator cleanup on stop

The `generateTone` fallback in demo mode is upgraded: instead of a plain 440Hz sine, it generates a simple chord (root + fifth + octave) with the genre's BPM encoded as a subtle rhythm pulse.

---

## UI Design System

### Design Tokens

```css
--bg:           #020202;   /* ultra black */
--surface:      #151515;   /* panel surface */
--surface-2:    #1e1e1e;   /* elevated surface */
--gold:         #C9A24A;   /* primary accent */
--gold-dim:     #8a6e2f;   /* muted gold */
--cyan:         #4dd9ff;   /* secondary accent */
--cyan-dim:     #2a8fa8;   /* muted cyan */
--text:         #F8F6F0;   /* primary text */
--muted:        #6b7280;   /* secondary text */
--border:       #262626;   /* panel borders */
--grid-dot:     rgba(196,162,74,0.06);  /* hud grid dots */
```

### Typography

- **Display / Headers:** Cinzel (Google Fonts, inlined as base64 or system fallback `Georgia, serif`)
- **Body / UI:** Inter (system fallback `-apple-system, system-ui, sans-serif`)
- **Data / Readouts:** JetBrains Mono or `monospace`

### TV Screen Component

```
┌─────────────── bezel (gold border, border-sweep glow) ───────────────┐
│  ● PWR   VIBE CREATOR BROADCAST SYSTEM              FREQ: 88.4 FM    │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                                                                  │ │
│  │            [ GIF LOOPS HERE ]                                   │ │
│  │            scan-line overlay (CSS)                               │ │
│  │            VibeCanvas glows behind (ambient)                     │ │
│  │                                                                  │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│  CH 04 · CHILL · VAPORWAVE · E:7                [■■■■■■■░░░] 70%      │
└──────────────────────────────────────────────────────────────────────┘
```

- **Bezel:** `#151515` background, `2px solid var(--gold)` border, `border-radius: 12px`
- **Border sweep:** 6s animation cycling gold → cyan on active state
- **Scan lines:** CSS `repeating-linear-gradient` at 3% opacity, 4px spacing
- **Screen curve:** inset `box-shadow` to suggest slight CRT curvature
- **Channel bar:** bottom strip inside bezel, monospace readout of current state
- **Power dot:** cyan `●` pulses via keyframe when playing, static dim when paused
- **Canvas behind:** sits at z-index 0 behind the GIF at 15% opacity, reacts to audio bass

### HUD Panels (Controls)

Right column contains two sections in `.app-hud` containers (grid-dot background):

**SIGNAL panel** — mood, genre, energy  
**TRANSMIT panel** — 11Labs API key  

Panel treatment:
- `1px solid var(--border)` default border
- Gold left-accent bar on active/focused panel
- `.eyebrow` uppercase label above each section
- Inputs have `focus:border-color: var(--gold)`

### Playback Controls Bar

Full-width bottom bar, `#0d0d0d` background, `border-top: 1px solid var(--border)`:

```
[◀ PREV]  [▶ GENERATE]  [⏸ PAUSE]  [↺ LOOP]  ──  VOL: ██░░  BPM: 90
```

- Generate button: gold → cyan gradient, glow on hover, `cursor-wait` while generating
- Active states use cyan glow
- BPM display: monospace, updates live from `useAudioEngine` tempo state
- Volume: custom-styled range input with gold thumb

---

## Bug Fixes (v1 → v2)

| Bug | Fix |
|---|---|
| Canvas RAF loop restarts every frame | Move `analysis`/`energy`/mood into refs in `VibeCanvas`; stable `draw` callback |
| Demo sample paths miss `BASE_URL` | Prefix all `public/` asset fetches with `import.meta.env.BASE_URL` |
| `EnergyLevel` type mismatch | Cast slider output: `parseInt(e.target.value) as EnergyLevel` |
| No `.env.example` | Add `.env.example` with `VITE_ELEVENLABS_API_KEY=your_key_here` |
| Demo audio is 440Hz sine wave | Upgraded fallback: root+fifth+octave chord tone matching genre BPM |

---

## Data Flow

```
User selects mood / genre / energy
         ↓
handleGenerate()
  ├─ gifLibrary.getGif(mood, genre, energy)  → gifUrl
  ├─ generateAudio(apiKey, prompt)           → audioUrl  [11Labs or demo tone]
  │
  ↓
GifPlayer receives gifUrl → starts looping
useAudioEngine.loadAudio(audioUrl) → play()
VibeCanvas starts ambient animation (behind screen)
         ↓
PlaybackControls wire to: pause / loop / volume / BPM display
TvScreen channel bar updates: CH · mood · genre · energy
```

---

## Out of Scope (v2)

- Video export (keep button, mark as "coming soon")
- Chord progression generation (chord-genesis feature — not included)
- AI-generated GIFs (future phase)
- MIDI export
- Save/load sessions

---

## Success Criteria

1. Click "Generate Vibe" → GIF loops inside TV screen + audio plays within 3 seconds (demo mode)
2. All 10 genres render with correct prompts and BPM ranges
3. Canvas animation runs at smooth 60fps without stutter (RAF fix verified)
4. UI matches SLAM OG HUD aesthetic: Cinzel headers, gold/cyan palette, scan lines visible
5. Works on GitHub Pages (`/vibe-creator/` base path)
6. `.env.example` present at repo root
