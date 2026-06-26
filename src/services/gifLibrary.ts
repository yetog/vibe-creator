import { VisualSequenceEntry } from '../types';

interface GifEntry {
  id:        string;
  file:      string;
  mood:      string;
  genre:     string;
  energyMin: number;
  energyMax: number;
  _desc?:    string;
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
 * Returns a GIF sequence filtered to Aura Mode entries (mood === "aura").
 * Tries to match scene exactly, falls back to any aura entry.
 */
export async function getAuraSequence(
  scene:       string,
  powerLevel:  number,
  count:       number = 6,
  secondsEach: number = 4
): Promise<VisualSequenceEntry[]> {
  const base     = import.meta.env.BASE_URL;
  const manifest = await loadManifest();

  const energy = Math.round(1 + (powerLevel / 100) * 9) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  let pool = manifest.vibes.filter(
    (v) => v.mood === 'aura' && v.genre === scene && energy >= v.energyMin && energy <= v.energyMax
  );
  if (pool.length === 0) pool = manifest.vibes.filter((v) => v.mood === 'aura' && v.genre === scene);
  if (pool.length === 0) pool = manifest.vibes.filter((v) => v.mood === 'aura');

  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  return Array.from({ length: count }, (_, i) => {
    const entry = shuffled[i % Math.max(shuffled.length, 1)];
    return {
      gifUrl:      resolveUrl(entry, base),
      startSec:    i * secondsEach,
      durationSec: secondsEach,
      tags:        ['aura', scene, entry._desc?.toLowerCase() ?? ''],
    };
  });
}

function entryMatchesKeywords(entry: GifEntry, keywords: string[]): boolean {
  if (keywords.length === 0) return true;
  const haystack = [entry.id, entry.mood, entry.genre, entry._desc ?? '']
    .join(' ')
    .toLowerCase();
  return keywords.some((kw) => haystack.includes(kw.toLowerCase()));
}

/**
 * Returns a sequence of count unique GIFs for use as a visual playlist.
 * GIFs are timed sequentially, each playing for secondsEach seconds.
 * If the pool has fewer entries than count, entries are cycled.
 * Pass keywords to narrow the pool by visual tag (falls back to full pool if no matches).
 */
export async function getGifSequence(
  mood:        string,
  genre:       string,
  energy:      number,
  count:       number   = 4,
  secondsEach: number   = 4,
  keywords:    string[] = []
): Promise<VisualSequenceEntry[]> {
  const base     = import.meta.env.BASE_URL;
  const manifest = await loadManifest();

  let pool = manifest.vibes.filter(
    (v) => v.mood === mood && v.genre === genre && energy >= v.energyMin && energy <= v.energyMax
  );
  if (pool.length === 0) pool = manifest.vibes.filter((v) => v.mood === mood && v.genre === genre);
  if (pool.length === 0) pool = manifest.vibes.filter((v) => v.mood === mood);
  if (pool.length === 0) pool = manifest.vibes;

  // Narrow by keywords — fall back to original pool if nothing matches
  if (keywords.length > 0) {
    const filtered = pool.filter((v) => entryMatchesKeywords(v, keywords));
    if (filtered.length > 0) pool = filtered;
  }

  // Shuffle pool for variety
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  return Array.from({ length: count }, (_, i) => {
    const entry = shuffled[i % shuffled.length];
    return {
      gifUrl:      resolveUrl(entry, base),
      startSec:    i * secondsEach,
      durationSec: secondsEach,
      tags:        [entry.mood, entry.genre, ...(entry._desc?.toLowerCase().split(' ') ?? [])],
    };
  });
}
