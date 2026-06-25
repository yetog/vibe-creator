/**
 * 11Labs Audio Generation Service
 *
 * Uses backend proxy to keep API key secure (never exposed to frontend)
 */

// Backend proxy URL - API key is stored server-side
const PROXY_URL = 'https://zaylegend.com/api/elevenlabs';

interface GenerateOptions {
  prompt: string;
  duration?: number;  // seconds
}

interface GenerateResult {
  audioUrl: string;
  audioBlob: Blob;
}

/**
 * Generate audio using backend proxy (API key stays server-side)
 */
export async function generateAudio(
  _apiKey: string,  // Ignored - key is on server
  options: GenerateOptions
): Promise<GenerateResult> {
  const { prompt, duration = 15 } = options;

  try {
    const response = await fetch(`${PROXY_URL}/generate-sound`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: prompt,
        duration_seconds: duration,
        prompt_influence: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `API error: ${response.status}`);
    }

    const data = await response.json();

    // Convert hex-encoded audio back to blob
    const bytes = new Uint8Array(
      data.audio.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16))
    );
    const audioBlob = new Blob([bytes], { type: data.content_type || 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);

    return { audioUrl, audioBlob };
  } catch (error) {
    console.error('Audio generation failed:', error);
    throw error;
  }
}

/**
 * Demo mode: Return a sample audio file
 * This is used when no API key is configured on server
 */
export async function getDemoAudio(mood: string): Promise<GenerateResult> {
  const base = import.meta.env.BASE_URL;
  const demoSamples: Record<string, string> = {
    chill:     `${base}samples/chill-demo.mp3`,
    energetic: `${base}samples/energetic-demo.mp3`,
    dark:      `${base}samples/dark-demo.mp3`,
    uplifting: `${base}samples/uplifting-demo.mp3`,
  };

  const sampleUrl = demoSamples[mood] || demoSamples.chill;

  try {
    const response = await fetch(sampleUrl);
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    return { audioUrl, audioBlob };
  } catch {
    // Generate a simple tone as fallback
    return generateTone(440, 15);
  }
}

/**
 * Check if API key is configured on server
 */
export async function checkServerStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${PROXY_URL}/status`);
    const data = await response.json();
    return data.configured === true;
  } catch {
    return false;
  }
}

/**
 * Generate a simple sine wave tone (fallback)
 */
function generateTone(frequency: number, duration: number): Promise<GenerateResult> {
  return new Promise((resolve) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const samples = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, samples, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate a simple evolving tone
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      // Frequency modulation for movement
      const freqMod = Math.sin(t * 0.5) * 50;
      // Amplitude envelope
      const envelope = Math.min(t * 2, 1) * Math.min((duration - t) * 2, 1);
      data[i] = Math.sin(2 * Math.PI * (frequency + freqMod) * t) * envelope * 0.3;
    }

    // Convert to WAV blob
    const wavBlob = audioBufferToWav(buffer);
    const audioUrl = URL.createObjectURL(wavBlob);

    audioContext.close();
    resolve({ audioUrl, audioBlob: wavBlob });
  });
}

/**
 * Convert AudioBuffer to WAV Blob
 */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = buffer.length * blockAlign;
  const bufferSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, bufferSize - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Audio data
  const channelData = buffer.getChannelData(0);
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Legacy: Validate API key (deprecated - key is now server-side)
 */
export async function validateApiKey(_apiKey: string): Promise<boolean> {
  return checkServerStatus();
}
