# Vibe Creator — Developer Handoff Notes

**Project:** Vibe Creator v2  
**Live URL:** https://yetog.github.io/vibe-creator/  
**Repo:** https://github.com/yetog/vibe-creator  
**Devs:** Zay + Aryan

---

## What's Been Built

A full-screen futuristic web app that generates AI music (via ElevenLabs) and plays a matching GIF inside a retro-futuristic TV screen frame. Stack: React 18 + TypeScript + Vite + Tailwind + Web Audio API.

### Key files to know
| File | What it does |
|------|-------------|
| `src/App.tsx` | Root layout — two-column HUD grid |
| `src/hooks/useAudioEngine.ts` | All audio: Web Audio API chain, compressor, analysis loop |
| `src/components/TvScreen.tsx` | The TV frame component (scan lines, channel bar, power dot) |
| `src/components/GifPlayer.tsx` | Crossfade GIF display with standby state |
| `src/components/VibeCanvas.tsx` | Frequency-reactive canvas animation (runs behind the GIF) |
| `src/services/gifLibrary.ts` | Picks a GIF from the manifest based on mood/genre/energy |
| `src/services/elevenLabs.ts` | Calls the ElevenLabs API or falls back to demo samples |
| `public/vibes/manifest.json` | GIF library index — **this is where you add GIFs** |
| `public/vibes/fallback.gif` | 1×1 black pixel — safety net when no GIF matches |
| `public/samples/` | Demo audio files (used when no API key is set) |

---

## Adding GIFs — Your First Task

The manifest (`public/vibes/manifest.json`) is fully wired for all 40 combos (10 genres × 4 moods). Every entry currently falls back to `fallback.gif` because the named files don't exist yet. Here's how to fill them in.

### Option A — Local files (recommended for production)

1. Find a GIF that fits the vibe (see sourcing guide below)
2. Save it to `public/vibes/` using the filename from the manifest  
   e.g., `public/vibes/chill-lofi-low.gif`
3. That's it — the app will pick it up automatically

### Option B — External URLs (fastest way to test)

The manifest supports direct Giphy or Tenor URLs. Just swap the `file` value:

```json
{
  "id": "chill-lofi-low",
  "file": "https://media.giphy.com/media/YOUR_GIPHY_ID/giphy.gif",
  "mood": "chill",
  "genre": "lofi",
  "energyMin": 1,
  "energyMax": 4
}
```

The service detects `https://` and skips the local base prefix automatically.

### Recommended GIF sources

| Source | Link | License |
|--------|------|---------|
| Giphy | https://giphy.com | Free to embed (check ToS for distribution) |
| Tenor | https://tenor.com | Free to embed |
| Ezgif | https://ezgif.com | Great for converting/optimizing |
| Loopdesk | https://loopdesk.net | Creative commons loops |

### What to search for — per genre

| Genre | Search terms |
|-------|-------------|
| **Lo-Fi** | "lo fi aesthetic", "lo fi room night", "study rain window", "anime chill" |
| **House** | "club lights", "rave visual", "dj booth", "disco ball loop" |
| **Ambient** | "space nebula loop", "slow clouds", "nature calm", "abstract flow" |
| **Electronic** | "neon synth", "laser grid", "circuit board", "glitch art" |
| **Soul** | "vinyl record spin", "soul singer", "warm light bokeh", "cassette tape" |
| **Funk** | "disco groove", "funky colors", "retro party", "70s dance" |
| **DNB** | "drum machine", "city speed", "fast city timelapse", "rave strobes" |
| **Vaporwave** | "vaporwave aesthetic", "retro computer", "sunset 80s", "synthwave grid" |
| **Trap Soul** | "night city rain", "moody neon", "city lights slow", "dark r&b aesthetic" |
| **West Coast** | "sunset palm trees", "california highway", "golden hour", "beach loop" |

### GIF size guidelines

Keep each GIF under **3 MB** — the app streams them over GitHub Pages. Optimize with:
```
ezgif.com/optimize  →  set quality to 70–80%
```

---

## What Needs Testing

Work through this checklist before calling v2 shipped:

### Core flow
- [ ] Click **GENERATE VIBE** with no API key → demo audio plays, GIF loads
- [ ] Click **GENERATE VIBE** with a valid ElevenLabs API key → real audio plays
- [ ] Audio loops when loop is on; stops cleanly when loop is off and track ends
- [ ] Play / Pause toggles audio without restarting the track
- [ ] Volume slider adjusts output level in real time
- [ ] BPM slider updates the displayed value (note: this is display-only right now — see Next Steps)

### TV Screen + GIF
- [ ] GIF crossfades (300ms) when a new vibe is generated without page flash
- [ ] When no GIF is loaded, the 📡 standby icon shows correctly
- [ ] Power dot (bottom-left of TV frame) pulses cyan when playing, goes grey when paused
- [ ] Channel bar updates correctly when mood or genre changes
- [ ] Scan-line overlay is visible on the screen area

### Genre / Mood selectors
- [ ] All 10 genres are selectable; selected state shows cyan border
- [ ] All 4 moods are selectable; selected state shows gold border
- [ ] Energy slider updates the gradient fill and label text
- [ ] BPM preview in the playback bar updates as genre + energy changes

### GIF fallback logic
- [ ] Pick a mood/genre combo that has no GIF file yet → `fallback.gif` loads, no console error
- [ ] Open DevTools → Network tab → verify manifest.json loads once (cached after first call)

### Responsive layout
- [ ] On a wide screen (≥1024px): two-column layout, TV on left, controls on right
- [ ] On mobile / narrow: single column, TV stacks above controls
- [ ] PlaybackControls bar wraps cleanly on narrow screens without overflow

### Edge cases
- [ ] Generate → pause → generate again → audio restarts cleanly, no ghost playback
- [ ] Enter a bad API key → error message appears below the TV screen
- [ ] Leave API key blank → demo mode works with no visible errors

---

## Next Steps

### P0 — Needs to work before sharing publicly

1. **Add real GIFs** (see guide above)  
   Priority order: `chill-lofi`, `chill-vaporwave`, `dark-trapsoul`, `energetic-dnb`, `uplifting-westcoast` — those five cover the most likely user paths.

2. **Add demo audio samples**  
   `public/samples/` needs files for each mood. Currently the app tries to load:
   - `{BASE_URL}samples/chill-demo.mp3`
   - `{BASE_URL}samples/energetic-demo.mp3`
   - `{BASE_URL}samples/dark-demo.mp3`
   - `{BASE_URL}samples/uplifting-demo.mp3`  
   Drop any ~30-second royalty-free loops there. Source: https://freemusicarchive.org or https://pixabay.com/music/

3. **GitHub Pages deployment**  
   The build is already configured for `/vibe-creator/` base path. To deploy:
   ```bash
   npm run build
   # then push — or set up GitHub Actions (see P1 below)
   ```

### P1 — Quality of life

4. **BPM-sync the audio engine**  
   `setTempo()` in `useAudioEngine` stores the BPM state but doesn't yet sync the `AudioBufferSourceNode.playbackRate` to it. Wire this up to actually tempo-shift the loaded audio:
   ```ts
   // in play(), after source.connect():
   source.playbackRate.value = tempo / baselineTempo; // where baselineTempo = genre default
   ```

5. **GitHub Actions auto-deploy**  
   Create `.github/workflows/deploy.yml` to build + push to `gh-pages` on every push to `main`. Vite already outputs to `dist/` with the correct base path.

6. **GIF preloading**  
   Right now GIFs load on demand. For a smoother experience, preload the top 5 most common combos on app mount using `new Image().src = url`.

7. **Multiple GIFs per slot**  
   The manifest schema supports multiple entries for the same mood+genre (just add `-2`, `-3` IDs). The service already randomly picks from all matching candidates — so adding more GIFs per slot automatically gives variety.

### P2 — Features to consider

8. **Social share** — Add a "Share Vibe" button that generates a URL with the mood/genre/energy encoded as query params so anyone can open the same vibe.

9. **Record + export** — The `useVideoExport` hook is already wired in App.tsx (hidden behind `handleExport`). Uncomment and add a record button to let users capture a clip of the GIF + audio together.

10. **Giphy API integration** — Instead of a static manifest, query the Giphy Search API at generate time using the genre + mood as the query. This would give infinite variety without managing files. Requires a free Giphy developer key.

11. **Mobile audio unlock** — iOS requires a user gesture to resume `AudioContext`. Add an `onClick` on the Generate button to call `audioContext.resume()` before the async generate call (it already does this in `loadAudio`, but iOS sometimes needs it earlier in the call stack).

---

## Local Dev Setup

```bash
git clone https://github.com/yetog/vibe-creator.git
cd vibe-creator
npm install
npm run dev          # http://localhost:5173/vibe-creator/
```

To use a real ElevenLabs key locally:
```bash
cp .env.example .env
# edit .env → add your VITE_ELEVENLABS_API_KEY
```

Build for production:
```bash
npm run build        # outputs to dist/
```

---

## Architecture Notes

- **No backend** — everything runs in the browser. Audio is generated by ElevenLabs and played via Web Audio API. GIFs are static files.
- **Base path** — the app is deployed at `/vibe-creator/` (not root). All asset fetches use `import.meta.env.BASE_URL`. Don't hardcode `/vibes/...` paths — always prefix with `BASE_URL`.
- **Audio chain** — Source → AnalyserNode → DynamicsCompressor → MasterGain → destination. The analyser feeds the canvas; the compressor prevents clipping on generated audio.
- **Canvas vs GIF** — The canvas runs at low opacity (18%) as an ambient glow layer. The GIF is the hero. Both are absolutely positioned inside the TvScreen. If you want to show only canvas (no GIF loaded), the canvas becomes more visible at full opacity through `GifPlayer`'s standby state.
