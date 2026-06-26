/**
 * Vibe Creator — Cloudflare Worker API Proxy
 *
 * Keeps the ElevenLabs API key server-side.
 * Deploy: wrangler deploy
 * Set secret: wrangler secret put ELEVENLABS_API_KEY
 *
 * The React app should POST to this worker instead of calling
 * ElevenLabs directly. Update VITE_API_PROXY_URL in .env to point here.
 */

const ELEVENLABS_URL = 'https://api.elevenlabs.io/v1/sound-generation';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
    }

    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const { prompt, duration_seconds = 15 } = body;

    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    // Health check: verify key is set
    if (!env.ELEVENLABS_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured on server' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    // Forward to ElevenLabs
    const upstream = await fetch(ELEVENLABS_URL, {
      method: 'POST',
      headers: {
        'Accept':       'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key':   env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({ text: prompt, duration_seconds, prompt_influence: 0.3 }),
    });

    // Pass through specific error codes with friendly messages
    if (!upstream.ok) {
      const messages = {
        401: 'Invalid API key — check server configuration',
        402: 'ElevenLabs credits exhausted — top up your account',
        422: 'Prompt too long or invalid — try a shorter description',
        429: 'Rate limited — please wait a moment and try again',
      };
      const message = messages[upstream.status] ?? `ElevenLabs error: ${upstream.status}`;
      return new Response(JSON.stringify({ error: message, status: upstream.status }), {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    // Stream audio back to client
    const audioBuffer = await upstream.arrayBuffer();
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
        ...CORS_HEADERS,
      },
    });
  },
};
