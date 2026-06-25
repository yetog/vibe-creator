# Vibe Creator — Architecture & Technical Overview

> **Presentation doc for Zay + Aryan**  
> Stack · Components · Functions · User Journey · Roadmap

---

## What Is Vibe Creator?

A browser-only web app that combines AI-generated music with mood-matched visuals. A user picks a mood, genre, and energy level — one click generates audio via ElevenLabs and displays a matching GIF inside a retro-futuristic TV frame. No backend, no server, no account required.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | React 18 + TypeScript 5.6 | Component model, type safety |
| Build tool | Vite 5.4 | Fast HMR, tree-shaking, base-path config |
| Styling | Tailwind CSS 3.4 + custom CSS variables | Utility classes + design tokens |
| Audio | Web Audio API (browser native) | No library needed, low latency |
| AI audio | ElevenLabs Sound Generation API | Prompt-to-audio in 15s clips |
| Visuals | HTML5 Canvas API (browser native) | Frequency-reactive animation |
| GIFs | Giphy CDN → moving to custom S3 API | See roadmap section |
| Hosting | GitHub Pages | Free, deploys from `dist/` on push |
| Fonts | Cinzel (display) + Inter (body) | Futuristic / clean pairing |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                                                             │
│  ┌──────────┐    ┌─────────────────────────────────────┐   │
│  │  App.tsx │───▶│         useAudioEngine               │   │
│  │  (root)  │    │  AudioContext → Analyser             │   │
│  │          │    │  → Compressor → MasterGain → output  │   │
│  │          │    └──────────────┬──────────────────────-┘   │
│  │          │                   │ analysis (bass/mid/high)   │
│  │          │    ┌──────────────▼──────────┐                │
│  │          │───▶│      VibeCanvas          │                │
│  │          │    │  requestAnimationFrame   │                │
│  │          │    │  frequency-reactive draw │                │
│  │          │    └─────────────────────────┘                │
│  │          │                                               │
│  │          │    ┌─────────────────────────┐                │
│  │          │───▶│       TvScreen           │                │
│  │          │    │  scan lines, channel bar │                │
│  │          │    │  ┌───────────────────┐  │                │
│  │          │    │  │    GifPlayer       │  │                │
│  │          │    │  │  crossfade display │  │                │
│  │          │    │  └───────────────────┘  │                │
│  │          │    └─────────────────────────┘                │
│  │          │                                               │
│  │          │    ┌─────────────────────────┐                │
│  │          │───▶│   PlaybackControls       │                │
│  │          │    │  Generate / Play / Loop  │                │
│  │          │    │  Volume / BPM sliders    │                │
│  └──────────┘    └─────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
┌────────────────┐           ┌──────────────────┐
│  ElevenLabs    │           │   Giphy CDN       │
│  Sound API     │           │  (manifest.json   │
│  → audio blob  │           │   → GIF URL)      │
└────────────────┘           └──────────────────┘
```

---

## File Map

```
vibe-creator/
├── src/
│   ├── App.tsx                    ← Root: layout + state + orchestration
│   ├── types/index.ts             ← All TypeScript types + MOOD_CONFIG + GENRE_CONFIG
│   ├── hooks/
│   │   ├── useAudioEngine.ts      ← Web Audio API: play/pause/loop/analyse
│   │   └── useVideoExport.ts      ← MediaRecorder: canvas+audio → .webm download
│   ├── services/
│   │   ├── elevenLabs.ts          ← ElevenLabs API calls + demo fallback
│   │   └── gifLibrary.ts          ← Manifest fetch + mood/genre/energy matching
│   ├── components/
│   │   ├── TvScreen.tsx           ← TV frame wrapper (scan lines, channel bar)
│   │   ├── GifPlayer.tsx          ← GIF display with crossfade transition
│   │   ├── VibeCanvas.tsx         ← Frequency-reactive canvas animation
│   │   ├── PlaybackControls.tsx   ← Generate button + transport controls
│   │   ├── MoodSelector.tsx       ← 4-mood picker (chill/energetic/dark/uplifting)
│   │   ├── GenreSelector.tsx      ← 10-genre picker with BPM hint
│   │   └── EnergySlider.tsx       ← 1–10 energy slider with gradient fill
│   ├── utils/
│   │   └── promptBuilder.ts       ← Builds 11Labs prompts from user selections
│   └── index.css                  ← Design tokens + HUD classes + animations
├── public/
│   ├── vibes/
│   │   ├── manifest.json          ← GIF library index (45 entries, Giphy URLs)
│   │   └── fallback.gif           ← 1×1 black pixel safety net
│   └── samples/                   ← Demo audio files (mp3, per mood)
├── tailwind.config.js             ← Extended colors (gold/cyan/slam-bg) + fonts
├── vite.config.ts                 ← base: '/vibe-creator/' for GitHub Pages
├── DEVNOTES.md                    ← Testing checklist + next steps for team
└── ARCHITECTURE.md                ← This file
```

---

## All Functions Reference

### `src/types/index.ts`

| Export | Type | Description |
|--------|------|-------------|
| `Mood` | union type | `'chill' \| 'energetic' \| 'dark' \| 'uplifting'` |
| `Genre` | union type | 10 genres: lofi, house, ambient, electronic, soul, funk, dnb, vaporwave, trapsoul, westcoast |
| `EnergyLevel` | union type | Integers 1–10 |
| `MOOD_CONFIG` | const record | Per-mood color palette, prompt text, particle count, motion speed |
| `GENRE_CONFIG` | const record | Per-genre BPM range, prompt text, instrument list |
| `AudioAnalysis` | interface | `{ frequencyData, timeDomainData, bass, mid, high, rms }` |
| `GenerationState` | union type | `'idle' \| 'generating' \| 'playing' \| 'recording' \| 'complete'` |

---

### `src/hooks/useAudioEngine.ts`

Single hook that owns the entire Web Audio API graph. Returns all playback controls + live analysis data.

**Audio chain built on `initContext()`:**
```
AudioBufferSourceNode
  → AnalyserNode (fftSize 256, smoothing 0.8)
  → DynamicsCompressorNode (threshold -24dB, ratio 12:1)
  → GainNode (master volume)
  → AudioContext.destination (speakers)
```

| Function | What it does |
|----------|-------------|
| `initContext()` | Creates AudioContext + builds the node chain above. Called lazily on first use. |
| `loadAudio(url)` | Fetches audio URL, decodes to AudioBuffer, stores in ref. |
| `play()` | Creates a new BufferSource, connects it to analyser, starts playback. |
| `pause()` | Suspends the AudioContext (freezes all nodes). |
| `stop()` | Stops the source node and clears its ref. |
| `toggleLoop()` | Flips `isLooping` state and updates `source.loop` live. |
| `setTempo(bpm)` | Stores BPM state (display only — playbackRate sync is a P1 task). |
| `setMasterVolume(vol)` | Sets gain node value immediately, updates state. |
| `getAudioContext()` | Returns the AudioContext ref (used by video export). |
| `connectRecording(dest)` | Taps the analyser output into a MediaStreamDestinationNode for recording. |
| `analyseFrame()` | RAF callback: reads frequency + time-domain data, computes bass/mid/high/rms, calls `setAnalysis()`. |

---

### `src/services/elevenLabs.ts`

| Function | What it does |
|----------|-------------|
| `generateAudio(apiKey, { prompt, duration })` | POSTs to `api.elevenlabs.io/v1/sound-generation`. Returns `{ audioUrl, audioBlob }`. |
| `getDemoAudio(mood)` | Fetches a pre-recorded mp3 from `public/samples/{mood}-demo.mp3`. Falls back to `generateTone()` if file is missing. |
| `generateTone(frequency, duration)` | Pure browser fallback — synthesises a sine wave with FM modulation + amplitude envelope, encodes to WAV. |
| `audioBufferToWav(buffer)` | Converts a decoded AudioBuffer to a WAV Blob (PCM 16-bit). Used by `generateTone`. |
| `validateApiKey(apiKey)` | GETs `api.elevenlabs.io/v1/user` to check if a key is valid. |

---

### `src/services/gifLibrary.ts`

| Function | What it does |
|----------|-------------|
| `loadManifest()` | Fetches and caches `public/vibes/manifest.json`. Only one network request ever made. |
| `getGif(mood, genre, energy)` | 4-tier fallback: exact match (mood+genre+energy range) → mood+genre → mood only → any. Returns a URL. External `https://` URLs are returned as-is; local files get `BASE_URL` prefix. |

---

### `src/utils/promptBuilder.ts`

| Function | What it does |
|----------|-------------|
| `buildAudioPrompt(settings)` | Constructs a detailed text prompt for 11Labs from mood + genre + energy. Interpolates BPM within the genre's range. |
| `buildSimplePrompt(settings)` | Short one-liner preview shown in the UI before generating. |
| `getEnergyDescriptor(energy)` | Maps 1–10 to `'Low' \| 'Medium' \| 'High' \| 'Maximum'`. |
| `getMoodEmoji(mood)` | Returns emoji for each mood (😌 ⚡ 🌙 ✨). |
| `getGenreEmoji(genre)` | Returns emoji for each genre (🎧 🏠 🌊 🤖 💜 🕺 🥁 📼 🌃 🌴). |

---

### `src/hooks/useVideoExport.ts`

| Function | What it does |
|----------|-------------|
| `startRecording(canvas, audioContext, connectRecording)` | Captures canvas at 30fps + taps audio graph via `MediaStreamDestinationNode`. Combines both into a `MediaRecorder` (prefers VP9+Opus codec). |
| `stopRecording()` | Stops the MediaRecorder, assembles chunks into a Blob, triggers browser download as `vibe-{timestamp}.webm`. |

---

### Components

| Component | Props | What it renders |
|-----------|-------|----------------|
| `TvScreen` | mood, genre, energy, isPlaying, children | Retro-futuristic monitor frame. Top bar with title + frequency readout. Screen area with scan-line overlay. Channel bar with power dot + mood/genre label. |
| `GifPlayer` | gifUrl, isPlaying | Shows GIF at full size. Crossfades (300ms) when URL changes. Shows 📡 standby icon when no GIF loaded. |
| `VibeCanvas` | mood, energy, analysis, isPlaying | Canvas animation driven by `AudioAnalysis`. Runs a RAF loop; reads analysis from refs (not state) to avoid loop restarts. |
| `PlaybackControls` | isPlaying, isLooping, isGenerating, hasAudio, tempo, masterVolume + 5 callbacks | Bottom bar: Generate button, Play/Pause, Loop toggle, Volume slider, BPM slider. |
| `MoodSelector` | value, onChange | 2×2 grid of mood cards with color pips. Gold border when selected. |
| `GenreSelector` | value, onChange | Wrapped row of genre chips with BPM hint. Cyan border when selected. |
| `EnergySlider` | value, onChange | Range slider 1–10 with gold→cyan gradient fill track. |

---

## User Journey

```
1. USER OPENS APP
   └── App mounts, state initialised: mood=chill, genre=lofi, energy=5
   └── manifest.json fetched and cached in gifLibrary

2. USER MAKES SELECTIONS
   └── Picks mood from MoodSelector       → setMood()
   └── Picks genre from GenreSelector     → setGenre()
   └── Adjusts energy on EnergySlider     → setEnergy()
   └── BPM preview updates in real time   → derivedBpm = GENRE_CONFIG[genre].bpmRange interpolated by energy

3. USER CLICKS "GENERATE VIBE"
   └── handleGenerate() fires
   └── setState('generating')
   └── Promise.all([
         apiKey ? generateAudio(prompt)   → POST to ElevenLabs → audioBlob → object URL
                : getDemoAudio(mood)      → fetch /samples/mood-demo.mp3
         getGif(mood, genre, energy)      → manifest lookup → Giphy CDN URL
       ])
   └── setGifUrl(gifPath)                 → GifPlayer crossfades to new GIF
   └── engine.loadAudio(audioUrl)         → fetch + decode audio into AudioBuffer
   └── engine.play()                      → BufferSource starts, analysis RAF loop starts
   └── setState('playing')

4. AUDIO PLAYS + CANVAS ANIMATES
   └── analyseFrame() runs every RAF tick
   └── Reads 256-bin FFT data
   └── Computes bass (0–10% bins) / mid (10–50%) / high (50–100%)
   └── setAnalysis() updates React state
   └── VibeCanvas reads analysis via refs → draws reactive shapes/particles

5. USER CONTROLS PLAYBACK
   └── Play/Pause → engine.pause() suspends AudioContext / engine.play() resumes
   └── Loop toggle → updates source.loop flag
   └── Volume slider → masterGain.gain updated in real time
   └── BPM slider → stored (display only, playbackRate sync is P1)

6. USER GENERATES AGAIN
   └── New GIF crossfades (300ms opacity transition)
   └── New audio decoded + BufferSource replaced
   └── Canvas continues animating with new analysis data
```

---

## Design System

All visual tokens live in `src/index.css` as CSS variables:

| Token | Value | Used for |
|-------|-------|---------|
| `--bg` | `#020202` | Page background |
| `--surface` | `#151515` | Card/panel fills |
| `--surface-2` | `#1e1e1e` | Input/button fills |
| `--gold` | `#C9A24A` | Primary accent, selected states |
| `--cyan` | `#4dd9ff` | Secondary accent, genre selection |
| `--text` | `#F8F6F0` | Primary text |
| `--muted` | `#6b7280` | Secondary text, labels |
| `--border` | `#262626` | Borders, dividers |

Key CSS classes:
- `.app-hud` — panel with radial-gradient dot-grid background
- `.card-hud` — surface-2 card with border
- `.border-sweep` — 6s gold→cyan animated border
- `.scan-lines` — CRT scan-line overlay via `::after` pseudo
- `.tv-screen` — inset box-shadow that makes the screen look recessed
- `.input-hud` — dark input with gold focus ring
- `.slider-hud` — range input with gold thumb + track

---

## Data Flow Diagram

```
User Input
(mood + genre + energy)
        │
        ▼
  buildAudioPrompt()
        │
        ├──────────────────────────────┐
        ▼                              ▼
  generateAudio()                  getGif()
  (ElevenLabs API)                 (manifest lookup)
        │                              │
        ▼                              ▼
  audioBlob → objectURL          Giphy CDN URL
        │                              │
        ▼                              ▼
  loadAudio() → AudioBuffer      GifPlayer.gifUrl
  play() → BufferSource               │
        │                         crossfade → img.src
        ▼
  analyseFrame() → AudioAnalysis
        │
        ▼
  VibeCanvas draws reactive shapes
```

---

---

# Custom GIF API + S3 Roadmap

> Replace the Giphy CDN dependency with a team-owned API where Zay + Aryan can upload curated GIFs. GIFs live in AWS S3, the API serves them, the app calls the API.

---

## Why Build This

| Problem with Giphy CDN | Solution with custom API |
|----------------------|--------------------------|
| GIFs can be removed by Giphy at any time | We own the content |
| No control over quality or aesthetic | Team curates every GIF |
| Rate limits possible at scale | Our own S3, no rate limits |
| Giphy branding embedded in some URLs | Clean delivery from our CDN |
| Can't add team metadata (bpm, tags, vibe score) | Full metadata schema |

---

## Proposed Architecture

```
┌─────────────────────────┐
│     Vibe Creator App    │
│  (React, GitHub Pages)  │
└────────────┬────────────┘
             │  GET /vibes?mood=chill&genre=lofi&energy=5
             ▼
┌─────────────────────────┐
│    Vibe Creator API     │
│  (Node / Cloudflare     │
│   Workers)              │
│                         │
│  GET /vibes             │ ← query by mood + genre + energy
│  GET /vibes/random      │ ← random matching GIF
│  POST /vibes/upload     │ ← team uploads (auth required)
│  DELETE /vibes/:id      │ ← admin removes GIF
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│       AWS S3            │
│  vibe-creator-gifs/     │
│    gifs/                │
│      chill/lofi/        │
│        uuid1.gif        │
│        uuid2.gif        │
│      dark/trapsoul/     │
│        uuid3.gif        │
│    manifest.json        │ ← cached metadata index
└─────────────────────────┘
```

---

## API Endpoints

### `GET /vibes`
Returns a matching GIF for the given selection.

**Query params:**
- `mood` — chill | energetic | dark | uplifting
- `genre` — lofi | house | ambient | electronic | soul | funk | dnb | vaporwave | trapsoul | westcoast
- `energy` — 1–10

**Response:**
```json
{
  "id": "a3f9c2",
  "url": "https://cdn.vibecreator.io/gifs/chill/lofi/a3f9c2.gif",
  "mood": "chill",
  "genre": "lofi",
  "energyMin": 1,
  "energyMax": 5,
  "tags": ["rainy", "anime", "night"]
}
```

---

### `GET /vibes/all`
Returns the full manifest. The app can cache this and do local matching — one API call per session.

---

### `POST /vibes/upload`
Team upload. Requires `X-Team-Key` header.

**Body (multipart/form-data):**
```
file     → the .gif file
mood     → chill | energetic | dark | uplifting
genre    → lofi | house | ...
energyMin → 1
energyMax → 10
tags     → comma-separated (optional)
```

**Response:**
```json
{
  "id": "a3f9c2",
  "url": "https://cdn.vibecreator.io/gifs/chill/lofi/a3f9c2.gif",
  "uploaded": true
}
```

---

### `DELETE /vibes/:id`
Removes a GIF from S3 and the manifest. Requires `X-Team-Key` header.

---

## S3 Structure

```
vibe-creator-gifs/               ← S3 bucket (public read, private write)
  gifs/
    chill/
      lofi/        {uuid}.gif
      ambient/     {uuid}.gif
      vaporwave/   {uuid}.gif
      ...
    energetic/
      house/       {uuid}.gif
      dnb/         {uuid}.gif
      ...
    dark/
      trapsoul/    {uuid}.gif
      ...
    uplifting/
      soul/        {uuid}.gif
      westcoast/   {uuid}.gif
      ...
  manifest.json                   ← rebuilt on every upload/delete
```

---

## Recommended Tech Stack for the API

### Option A — Cloudflare Workers + R2 (Recommended for small team)

| Component | Service | Cost |
|-----------|---------|------|
| API | Cloudflare Workers | Free up to 100k req/day |
| Storage | Cloudflare R2 (S3-compatible) | Free up to 10GB |
| CDN | Included with R2 | Free |
| Deploy | `wrangler deploy` | Free |

Pros: zero infra to manage, edge-deployed (fast globally), R2 has no egress fees.  
Cons: Workers have a 10ms CPU limit per request (fine for this use case).

---

### Option B — AWS Lambda + API Gateway + S3

| Component | Service | Approx cost |
|-----------|---------|------------|
| API | AWS Lambda + API Gateway | ~$0 until 1M requests/month |
| Storage | AWS S3 | ~$0.023/GB/month |
| CDN | CloudFront (optional) | ~$0.0085/GB transfer |

Pros: standard AWS, easy IAM, familiar tooling, scales infinitely.  
Cons: more setup, egress fees if serving lots of GIFs without CloudFront.

---

## Team Upload Workflow (Day-to-Day)

Once the API is built, Zay + Aryan add GIFs like this:

```bash
# Upload a new GIF for chill lofi
curl -X POST https://api.vibecreator.io/vibes/upload \
  -H "X-Team-Key: YOUR_TEAM_KEY" \
  -F "file=@my-lofi-gif.gif" \
  -F "mood=chill" \
  -F "genre=lofi" \
  -F "energyMin=1" \
  -F "energyMax=5" \
  -F "tags=rain,night,anime"

# Response gives back the CDN URL immediately
```

Or via a minimal admin web UI (a future P2 feature).

---

## App Integration — What Changes

Only one file needs to change when the API is live:

**`src/services/gifLibrary.ts`** — swap the manifest fetch for an API call:

```ts
// Current (local manifest)
const res = await fetch(`${BASE_URL}vibes/manifest.json`);

// Future (custom API — full manifest cached client-side)
const res = await fetch('https://api.vibecreator.io/vibes/all');

// Or per-request mode (no local caching)
const res = await fetch(
  `https://api.vibecreator.io/vibes?mood=${mood}&genre=${genre}&energy=${energy}`
);
```

Everything else in the app stays the same.

---

## Implementation Order

1. **Set up S3 bucket** — create `vibe-creator-gifs`, enable public read, configure CORS for the app domain
2. **Write the API** — start with Cloudflare Workers (50 lines of JS), deploy to a `api.vibecreator.io` subdomain
3. **Upload the current Giphy GIFs** — download the 45 GIFs from Giphy, upload to S3 via the new API to migrate existing content
4. **Update `gifLibrary.ts`** — point to the new API endpoint
5. **Add admin upload UI** — a minimal form page protected by team key (P2)
