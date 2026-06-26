# Vibe Creator v0.2 — Product Spec

> Synthesised from: QA report (ChatGPT review, June 26 2026), product voice notes (Zay), and chord-genesis gap analysis.

**Goal:** Evolve "generate a vibe" into "compose a full audiovisual identity."  
**Principle:** Keep the home screen one click. Let users unlock depth when they want it.

---

## QA Scores — Baseline for v0.2

| Dimension | v0.1 Score | v0.2 Target |
|-----------|-----------|-------------|
| Innovation | 9.5 / 10 | Maintain |
| UX | 8.5 / 10 | 9.5 |
| Visual Design | 8.0 / 10 | 9.0 |
| Technical Architecture | 8.5 / 10 | 9.5 |
| Reliability | 6.5 / 10 | 9.0 |
| Scalability | 8.0 / 10 | 9.0 |

**Reliability is the weakest dimension.** Sprint 1 is entirely reliability.

---

## Critical Issues to Fix First (Sprint 1)

### CRIT-001 — API Key Security
- All ElevenLabs requests must go server-side (Lambda or Cloudflare Worker)
- Rotate the exposed key immediately
- Add usage monitoring + credit exhaustion error state
- Add provider health check before generation attempt

### CRIT-002 — Mobile Playback
- Web Audio API needs a user gesture to start on iOS/Safari
- `AudioContext.resume()` must be called inside the Generate button's `onClick` handler synchronously, before the async generate chain
- Test: Chrome Android, Safari iOS, Firefox Mobile

### CRIT-003 — Error States
- Current: API failure = blank screen or unhandled error
- Add: retry logic (3 attempts, exponential backoff)
- Add: "Credits exhausted" specific error state
- Add: fallback to demo audio when API fails

---

## Feature Spec — v0.2

### Feature 1: Basic vs Advanced Generation Modes

**Concept:** One magic button stays. Advanced mode is a "creative control room" that layers on top.

**Basic Mode (unchanged)**
- Current mood + genre + energy controls
- Single "GENERATE VIBE" button
- 15-second loop (current default)
- Prompt built by `buildAudioPrompt()`

**Advanced Mode**
- Toggled via "Advanced" switch or expandable panel — does NOT replace Basic
- Additional controls (all ported from chord-genesis architecture):

| Control | Options | Default |
|---------|---------|---------|
| Key | C, C#, D, D#, E, F, F#, G, G#, A, A#, B | C |
| Scale | Major, Minor, Dorian, Phrygian, Lydian, Mixolydian, Pentatonic Major/Minor, Blues, Harmonic Minor | Minor |
| Chord Template | I-V-vi-IV (Pop), vi-IV-I-V (Emotional), ii-V-I (Jazz), I-vi-IV-V (Soul), I-IV-V-I (Blues), i-VI-VII-i (Dark), I-bVII-IV-I (Modal) | i-VI-VII-i |
| Loop Length | 16 bars / 32 bars | 16 bars |
| 7th/9th Extensions | Toggle on/off | Off |
| Use Case | Study, Workout, Chill, Creative, Gaming, Meditation | Chill |
| Visual Keywords | Free text input | Empty |

**Advanced prompt format** (built by `buildAdvancedPrompt()`):
```
[genre], [mood], [bpm] BPM, key of [key] [scale],
[chord template] chord progression with maj7/min7 extensions,
[instruments], no vocals,
[N]-bar loop ([duration] seconds),
use case: [useCase],
emotional feel: [moodPrompt],
style: [genrePrompt],
visual atmosphere: [visualKeywords]
```

**Duration calculation:**
```
durationSec = Math.round((loopBars × 4 beats) / (bpm / 60))
// 16-bar at 90 BPM = 42.7s → 43s
// 32-bar at 120 BPM = 64s
```

**ElevenLabs API change:** Pass computed `durationSec` instead of hardcoded `15`.

---

### Feature 2: GIF Sequencing — Visual Playlist

Replace the single GIF with a timed sequence of 3–8 GIFs that rotate during playback.

**Schema** (already in `src/types/index.ts`):
```ts
interface VisualSequenceEntry {
  gifUrl:      string;   // resolved URL
  startSec:    number;   // when to show this GIF
  durationSec: number;   // how long to show it
  tags:        string[]; // mood + genre + freeform
}
```

**`getGifSequence(mood, genre, energy, count, secondsEach)`** is already implemented in `gifLibrary.ts`. Returns shuffled, deduplicated entries timed sequentially.

**GifPlayer update needed:**
- Accept `sequence: VisualSequenceEntry[]` instead of `gifUrl: string | null`
- Use `currentTime` from `useAudioEngine` to determine which entry is active
- Crossfade (300ms) between entries on time boundary

**Beat-sync stretch goal:**
- Use `analysis.bass` spike detection in `useAudioEngine` to trigger GIF advances on detected beats instead of fixed time boundaries

---

### Feature 3: Loop Length Options

**Controls added to PlaybackControls (or Advanced panel):**

| Option | Label | Duration at 90 BPM | Duration at 120 BPM |
|--------|-------|-------------------|---------------------|
| 16 bars | "16-Bar Loop" | ~43s | ~32s |
| 32 bars | "32-Bar Loop" | ~85s | ~64s |

`loopBars` lives in `AdvancedSettings`. Basic mode defaults to 16 bars.

---

### Feature 4: Aura Mode (Theme Pack)

**Working title:** AURA MODE  
**Purpose:** Anime-inspired audiovisual loops for "aura farming" — dramatic, stylish, high-energy moments.

**Separate experience from main app** — accessed via a dedicated route or mode toggle.

**Controls:**
- Anime Style: Shonen / Cyberpunk / Samurai / Mecha / Slice of Life / Fantasy
- Power Level: 1–10 (maps to energy)
- Scene Type: Training Arc / Villain Arc / Final Boss / Calm Before Storm / Power Up / Rain Battle
- Color Palette: Blue Flame / Red Aura / Gold / Dark / Neon / Monochrome
- Genre: same 10 genres
- BPM: manual override
- Visual Keywords: free text (e.g. "blue flame samurai", "cyberpunk rooftop")

**GIF strategy for Aura Mode:**
- Separate manifest section: `"mode": "aura"` tag on entries
- Source: anime-inspired motion loops (NOT copyrighted characters — use style tags like "cyberpunk warrior", "glowing aura loop", "rain silhouette")
- Search terms: samurai, cyberpunk, shonen battle, villain walk, golden aura, final boss, night city, power up, melancholy hero, blue flame

**Prompt addition for Aura Mode:**
```
anime-inspired, [genre], [mood], [bpm] BPM, cinematic,
epic battle theme, orchestral elements, [sceneType] arc energy,
[powerLevel]/10 intensity, [colorPalette] visual mood,
no vocals, [loopBars]-bar loop
```

**Important:** Do not use specific character names (Naruto, Gojo, Goku). Use style/vibe descriptors only.

---

### Feature 5: Visual Keyword Search

**A single optional text input** that influences GIF selection independently of the music generation.

**Location:** Below EnergySlider, above the TRANSMIT panel (or inside the TV frame area).

**Label:** `Describe the visual vibe (optional)`

**Examples shown as placeholder rotation:**
- "blue flame samurai"
- "cyberpunk city rain"
- "lonely hero rooftop"
- "golden aura"
- "peaceful anime sunset"

**How it works:**
1. Keywords are split on spaces/commas
2. `getGifSequence()` gets a candidate pool, then filters/re-ranks by tag overlap with the keywords
3. If no matches, falls back to mood+genre match (current behavior)

**This text also feeds into `buildAdvancedPrompt()`** as the `visualKeywords` field — so it influences music generation AND visual selection.

---

### Feature 6: Generation History

**What it solves:** "Generation disappears" — QA HIGH-002.

**Storage:** `localStorage` — no backend needed for v0.2.

**Schema:**
```ts
interface HistoryEntry {
  id:           string;          // uuid
  audioUrl:     string;          // object URL (will expire on tab close)
  visualSequence: VisualSequenceEntry[];
  settings:     VibeSettings;
  advancedSettings?: AdvancedSettings;
  createdAt:    string;          // ISO string
  label:        string;          // auto-generated: "Chill Lo-Fi · 85 BPM"
}
```

**UI:** Horizontal scrolling row below the TV screen. Click entry to restore it. Max 10 entries.

---

## Sprint Plan

### Sprint 1 — Reliability + Architecture (Do First)

- [ ] Move ElevenLabs API calls to a Cloudflare Worker proxy
- [ ] Add retry logic + credit exhaustion error state
- [ ] Fix mobile audio unlock (iOS `AudioContext.resume()` on gesture)
- [ ] Add loading state animation ("Creating composition... Selecting visuals...")
- [ ] Write a proper error boundary component

### Sprint 2 — Advanced Mode + Loop Length

- [ ] Add `AdvancedSettings` UI panel (collapsible) in right column
- [ ] Wire `buildAdvancedPrompt()` when Advanced is toggled
- [ ] Pass computed `durationSec` to ElevenLabs `duration_seconds` param
- [ ] Add 16/32-bar loop selector to PlaybackControls
- [ ] TypeScript already has all types — just need the UI components

### Sprint 3 — GIF Sequencing

- [ ] Update `GifPlayer` to accept `sequence: VisualSequenceEntry[]`
- [ ] Add time-based GIF switching using `audioContext.currentTime`
- [ ] Add crossfade between sequence entries
- [ ] Wire `getGifSequence()` in `handleGenerate` (already implemented)

### Sprint 4 — Visual Keywords + History

- [ ] Add visual keyword input to SIGNAL panel
- [ ] Wire keywords to `getGifSequence()` tag filtering
- [ ] Wire keywords to `buildAdvancedPrompt()` visualKeywords field
- [ ] Implement `useHistory` hook with localStorage persistence
- [ ] Add history row to App.tsx layout

### Sprint 5 — Aura Mode

- [ ] New route `/aura` or modal mode toggle
- [ ] Aura-specific controls (Anime Style, Power Level, Scene Type, Color Palette)
- [ ] Separate Aura GIF manifest section with anime-inspired loops
- [ ] Aura-specific prompt builder function

---

## What Stays Simple

The home screen must never show more than:
- Mood selector
- Genre selector
- Energy slider
- One big Generate button

Everything else is behind "Advanced" or a separate mode. The magic button is the product. The control room is optional depth.

---

## Competitive Context — chord-genesis Gap Analysis

chord-genesis shows why Vibe Creator's audio output currently feels less sophisticated:

| Capability | chord-genesis | Vibe Creator v0.1 | Vibe Creator v0.2 |
|-----------|--------------|-------------------|-------------------|
| Music key | ✅ 12 keys | ❌ | ✅ Advanced mode |
| Scale type | ✅ 12 scales | ❌ | ✅ Advanced mode |
| Chord progression | ✅ 17 templates | ❌ | ✅ 7 templates |
| Loop length | ✅ bar-based | ❌ hardcoded 15s | ✅ 16 or 32 bars |
| Extensions (maj7, 9th) | ✅ toggle | ❌ | ✅ toggle |
| Melody generation | ✅ | ❌ | ❌ (v0.4) |
| MIDI export | ✅ | ❌ | ❌ (v0.3) |
| Prompt sophistication | Music theory objects | String concat | Music theory strings |

The main difference: chord-genesis builds prompts from **computed music theory** (actual chord objects with MIDI notes). Vibe Creator v0.2 bridges most of this gap by passing music theory language as text — which ElevenLabs Sound Generation responds to well. Full chord object computation (for MIDI export) is a v0.3 task.
