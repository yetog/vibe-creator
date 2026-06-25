# Vibe Creator - Session Notes

**Date:** June 25, 2026
**Event:** Patch Night (Philadelphia)
**Collaborator:** Aryan

---

## Project Origin

Built for **Patch Night** - an event where three Philly scenes (sound, visuals, code) come together. Teams of 3 build live audio-reactive experiences in 90 minutes.

### Your Role
**Creative Technical Producer — Sound Lead and Product Integrator**
- Lead musical direction
- Determine which audio features drive visuals
- Communicate between coder and visual designer
- Manage scope
- Shape final presentation

---

## Strategic Decision: Two Tracks

We identified two possible directions:

### Track A: "Vibe Creator" (CHOSEN)
Simple, focused, shareable.
- User selects: Mood → Energy → Genre
- System generates: Audio clip via 11Labs
- System creates: Matching visual loop
- Output: Downloadable video (shareable on social)

**Why Track A:**
- Achievable in 90 minutes
- Clear demo: "Watch me make a vibe in 30 seconds"
- Lower technical risk
- Shareable output

### Track B: "Gesture Visualizer" (Future)
Complex, higher impact.
- Camera tracks hand positions (MediaPipe)
- Hand controls audio effects (filter, reverb)
- Visuals react to hands + audio
- Performance mode

**Why not Track B for now:**
- Compute heavy
- More failure points
- Requires good lighting
- Riskier for demo night

### Hybrid Approach (Recommended)
Build Track A as base, add ONE Track B feature later:
- Core: Generate audio + visual loop (reliable)
- Magic moment: Raise hand to add reverb/echo
- Fallback: If gesture fails, vibe creator still works

---

## MVP Functions Built

| Module | Function | Status |
|--------|----------|--------|
| **UI** | `MoodSelector` | ✅ 4 moods with color palettes |
| **UI** | `EnergySlider` | ✅ 1-10 intensity |
| **UI** | `GenreSelector` | ✅ 6 genres with BPM ranges |
| **Audio** | `buildAudioPrompt()` | ✅ Settings → 11Labs prompt |
| **Audio** | `generateAudio()` | ✅ 11Labs API call |
| **Audio** | `useAudioAnalyzer` | ✅ FFT analysis hook |
| **Visual** | `VibeCanvas` | ✅ Canvas with particles/rings |
| **Visual** | Mood → Colors | ✅ 4 color palettes |
| **Visual** | Energy → Motion | ✅ Particle speed scaling |
| **Export** | Video capture | 🔜 MediaRecorder |

---

## Technical Architecture

```
User Input (Mood/Energy/Genre)
        ↓
    buildAudioPrompt()
        ↓
    generateAudio() → 11Labs API
        ↓
    loadAudio() → Web Audio API
        ↓
    useAudioAnalyzer() → FFT Analysis
        ↓
    VibeCanvas → Render Frame
        │
        ├── Bass → Pulse size, ring scale
        ├── Mid → Rotation, movement
        ├── High → Particles, sparkle
        └── RMS → Overall intensity
```

---

## Mood Configurations

| Mood | Colors | Particles | Speed |
|------|--------|-----------|-------|
| Chill | Blue/Indigo/Violet | 50 | 0.5x |
| Energetic | Orange/Red/Amber | 200 | 2.0x |
| Dark | Indigo/Violet/Purple | 80 | 0.8x |
| Uplifting | Emerald/Green/Yellow | 150 | 1.2x |

---

## Genre BPM Ranges

| Genre | BPM Range | Vibe |
|-------|-----------|------|
| Lo-fi | 70-90 | Relaxed, vinyl crackle |
| House | 120-130 | Four-on-the-floor groove |
| Ambient | 60-80 | Atmospheric pads |
| Electronic | 128-140 | Modern synths |
| Soul | 85-105 | Warm, groovy |
| Funk | 100-120 | Slap bass, rhythmic |

---

## Next Steps

### Before Patch Night
- [ ] Push to GitHub: `yetog/vibe-creator`
- [ ] Deploy to zaylegend.com/vibe-creator
- [ ] Add sample audio files for demo mode
- [ ] Test with real 11Labs API key
- [ ] Create 5-slide presentation deck

### At Patch Night
- [ ] Demo the working prototype
- [ ] Let trio add features (export, gesture)
- [ ] Capture 60-second showcase video

### Future Enhancements
- [ ] Export as video (MediaRecorder)
- [ ] Hand gesture control (MediaPipe)
- [ ] More visual modes (waveform, spectrum)
- [ ] Save/load vibes
- [ ] Share to social media

---

## Key Insight

> "You arrive as someone who understands the handoff between all three."

Your biggest contribution isn't being the best at every individual craft. It's recognizing how to turn three crafts (sound, visuals, code) into one coherent experience.

---

## Links

- **Live App:** https://zaylegend.com/vibe-creator
- **Chord Genesis:** https://zaylegend.com/chord-genesis
- **DJ Visualizer:** https://zaylegend.com/dj-visualizer
- **Portfolio:** https://zaylegend.com

---

## Chat Session Summary

**What we discussed:**
1. Patch Night strategy and your unique position
2. Track A vs Track B decision
3. Hybrid approach recommendation
4. MVP function breakdown
5. Built the complete Vibe Creator app

**What we built:**
- Full React + TypeScript app with Vite
- 4 UI components (Mood, Energy, Genre, Canvas)
- Audio analyzer hook with FFT
- 11Labs integration with demo fallback
- Canvas-based visualizer with particles
- Mood-based color systems
- Genre-based BPM configurations

**Files created:** 22 files, ~4,000 lines of code

---

*Session notes saved for future reference.*
