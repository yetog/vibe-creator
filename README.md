# Vibe Creator

Generate audio + matching visuals in one click. Built for Patch Night.

## Features

- **Mood Selection**: Chill, Energetic, Dark, Uplifting
- **Energy Control**: 1-10 intensity slider
- **Genre Picker**: Lo-fi, House, Ambient, Electronic, Soul, Funk
- **Audio Generation**: 11Labs API integration (or demo mode)
- **Visual Canvas**: Real-time audio-reactive visuals
- **Export**: Coming soon - download as video

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Web Audio API (frequency analysis)
- Canvas API (2D visuals)
- 11Labs API (audio generation)

## Usage

1. Select a **Mood** (affects colors and visual style)
2. Adjust **Energy** (affects tempo and particle speed)
3. Pick a **Genre** (affects BPM range and prompt)
4. Click **Generate Vibe**
5. Watch the audio-reactive visuals

### Demo Mode

Without an API key, the app uses generated sine wave tones.
For full audio generation, add your 11Labs API key.

## Architecture

```
src/
├── components/
│   ├── VibeCanvas.tsx       # WebGL/Canvas visualizer
│   ├── MoodSelector.tsx     # Mood selection grid
│   ├── EnergySlider.tsx     # Energy level slider
│   └── GenreSelector.tsx    # Genre picker buttons
├── hooks/
│   └── useAudioAnalyzer.ts  # Web Audio API analysis
├── services/
│   └── elevenLabs.ts        # 11Labs API integration
├── types/
│   └── index.ts             # TypeScript types + configs
├── utils/
│   └── promptBuilder.ts     # Prompt generation utilities
└── App.tsx                  # Main application
```

## MVP Functions

| Module | Function | Status |
|--------|----------|--------|
| UI | Mood selector | ✅ |
| UI | Energy slider | ✅ |
| UI | Genre picker | ✅ |
| Audio | 11Labs integration | ✅ |
| Audio | Frequency analysis | ✅ |
| Visual | Canvas renderer | ✅ |
| Visual | Particle system | ✅ |
| Export | Video capture | 🔜 |

## Patch Night

This app was built for [Patch Night](https://philaconvalley.com) - where sound, visuals, and code come together.

**Team Role**: Sound Lead + Product Integrator

## License

MIT

---

Built by [Zay Legend](https://zaylegend.com)
