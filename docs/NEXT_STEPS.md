# Vibe Creator - Next Steps

## Immediate (Before Patch Night)

### 1. Add Export Functionality
**Priority:** High
**File:** `src/hooks/useVideoExport.ts`

```typescript
// MediaRecorder to capture canvas + audio
// Output: WebM video file
// Duration: Match audio length (15-30 sec)
```

### 2. Add Sample Audio Files
**Priority:** High
**Location:** `public/samples/`

Need 4 sample audio files for demo mode (when no API key):
- `chill-demo.mp3` - Lo-fi beat, 70 BPM
- `energetic-demo.mp3` - House beat, 128 BPM
- `dark-demo.mp3` - Ambient pad, 80 BPM
- `uplifting-demo.mp3` - Feel-good groove, 100 BPM

### 3. Test 11Labs Integration
**Priority:** High

- Get 11Labs API key
- Test sound generation endpoint
- Adjust prompt templates if needed
- Handle rate limits gracefully

### 4. Create Presentation Deck
**Priority:** Medium
**Slides:**
1. The Goal - Live audio-reactive visual
2. Our Edge - We already have a working visualizer
3. How It Works - Audio → FFT → Visual mapping
4. Build Plan - Strip it down, polish
5. Showcase Angle - "A visual instrument controlled by sound"

---

## During Patch Night

### Quick Wins (If time permits)
- [ ] Add waveform visualization mode
- [ ] Add spectrum analyzer view
- [ ] Improve particle effects
- [ ] Add beat detection flash

### Trio Collaboration
- **Sound (You):** Provide audio direction, test with real music
- **Code (Aryan + trio):** Add export, improve visualizer
- **Visuals (trio):** Design better particle systems, color schemes

---

## Post-Event Enhancements

### Track B: Gesture Control
**File:** `src/hooks/useHandTracking.ts`

```typescript
// MediaPipe Hands integration
// Map hand position to audio effects
// Left hand Y → Filter cutoff
// Right hand Y → Reverb mix
// Distance → Delay amount
```

### Additional Visual Modes
- Circular spectrum
- 3D waveform (Three.js)
- Kaleidoscope effect
- Particle trails

### Social Features
- Share generated vibes
- Save favorite combinations
- Community gallery
- Remix others' vibes

### Audio Enhancements
- Multiple audio sources
- Live microphone input
- MIDI controller support
- Effect chain (reverb, delay, filter)

---

## Technical Debt

### Performance
- [ ] Optimize particle system for mobile
- [ ] Add WebGL renderer option
- [ ] Lazy load 11Labs service
- [ ] Cache generated audio

### Code Quality
- [ ] Add unit tests
- [ ] Add E2E tests
- [ ] Set up CI/CD
- [ ] Add error boundaries

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Reduced motion option
- [ ] High contrast mode

---

## Deployment Checklist

- [x] Build passes
- [x] Git repo initialized
- [ ] Push to GitHub
- [ ] Deploy to zaylegend.com/vibe-creator
- [ ] Add to portfolio apps list
- [ ] Test on mobile
- [ ] Test with real API key

---

## Resources

### APIs
- [11Labs Sound Generation](https://elevenlabs.io/docs/api-reference/sound-generation)
- [MediaPipe Hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

### Inspiration
- [Chord Genesis](https://zaylegend.com/chord-genesis)
- [DJ Visualizer](https://zaylegend.com/dj-visualizer)
- [Patch Night](https://philaconvalley.com)

---

*Last updated: June 25, 2026*
