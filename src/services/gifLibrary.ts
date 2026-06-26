import { VisualSequenceEntry } from '../types';

interface GifEntry {
  id:        string;
  file:      string;
  mood:      string;
  genre:     string;
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
  mood:   string,
  genre:  string,
  energy: number
): Promise<string> {
  const base     = import.meta.env.BASE_URL;
  const manifest = await loadManifest();

  // 1. Exact: mood + genre + energy in range
  let candidates = manifest.vibes.filter(
    (v) => v.mood === mood && v.genre === genre && energy >= v.energyMin && energy <= v.energyMax
  );

  // 2. mood + genre (any energy)
  if (candidates.length === 0) {
    candidates = manifest.vibes.filter((v) => v.mood === mood && v.genre === genre);
  }

  // 3. mood only
  if (candidates.length === 0) {
    candidates = manifest.vibes.filter((v) => v.mood === mood);
  }

  // 4. Any entry
  if (candidates.length === 0) {
    candidates = manifest.vibes;
  }

  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  // External URLs (Giphy, Tenor, etc.) are used as-is; local files get the base prefix.
  if (pick.file.startsWith('http')) return pick.file;
  return `${base}vibes/${pick.file}`;
}

function resolveUrl(entry: GifEntry, base: string): string {
  if (entry.file.startsWith('http')) return entry.file;
  return `${base}vibes/${entry.file}`;
}

/**
 * Returns a sequence of count unique GIFs for use as a visual playlist.
 * GIFs are timed sequentially, each playing for secondsEach seconds.
 * If the pool has fewer entries than count, entries are cycled.
 */
export async function getGifSequence(
  mood:        string,
  genre:       string,
  energy:      number,
  count:       number = 4,
  secondsEach: number = 4
): Promise<VisualSequenceEntry[]> {
  const base     = import.meta.env.BASE_URL;
  const manifest = await loadManifest();

  let pool = manifest.vibes.filter(
    (v) => v.mood === mood && v.genre === genre && energy >= v.energyMin && energy <= v.energyMax
  );
  if (pool.length === 0) pool = manifest.vibes.filter((v) => v.mood === mood && v.genre === genre);
  if (pool.length === 0) pool = manifest.vibes.filter((v) => v.mood === mood);
  if (pool.length === 0) pool = manifest.vibes;

  // Shuffle pool for variety
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  return Array.from({ length: count }, (_, i) => {
    const entry = shuffled[i % shuffled.length];
    return {
      gifUrl:      resolveUrl(entry, base),
      startSec:    i * secondsEach,
      durationSec: secondsEach,
      tags:        [entry.mood, entry.genre],
    };
  });
}
