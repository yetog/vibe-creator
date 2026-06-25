import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { AudioAnalysis, MOOD_CONFIG, Mood } from '../types';

interface VibeCanvasProps {
  mood:      Mood;
  energy:    number;
  analysis:  AudioAnalysis | null;
  isPlaying: boolean;
}

export interface VibeCanvasHandle {
  getCanvas: () => HTMLCanvasElement | null;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; alpha: number; color: string;
}

export const VibeCanvas = forwardRef<VibeCanvasHandle, VibeCanvasProps>(
  function VibeCanvas({ mood, energy, analysis, isPlaying }, ref) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const timeRef      = useRef(0);

  // Refs for reactive values — keeps draw() stable (empty deps)
  const analysisRef = useRef<AudioAnalysis | null>(analysis);
  const energyRef   = useRef<number>(energy);
  const moodRef     = useRef<Mood>(mood);

  useImperativeHandle(ref, () => ({ getCanvas: () => canvasRef.current }), []);

  // Keep refs in sync on every render
  useEffect(() => { analysisRef.current = analysis; }, [analysis]);
  useEffect(() => { energyRef.current   = energy;   }, [energy]);
  useEffect(() => { moodRef.current     = mood;     }, [mood]);

  const initParticles = useCallback((count: number) => {
    const cfg    = MOOD_CONFIG[moodRef.current];
    const colors = cfg.colors;
    const opts   = [colors.primary, colors.secondary, colors.accent];
    particlesRef.current = Array.from({ length: count }, () => ({
      x:     Math.random() * 400,
      y:     Math.random() * 400,
      vx:    (Math.random() - 0.5) * 2,
      vy:    (Math.random() - 0.5) * 2,
      size:  Math.random() * 4 + 2,
      alpha: Math.random() * 0.5 + 0.3,
      color: opts[Math.floor(Math.random() * opts.length)],
    }));
  }, []);

  // Stable draw — reads live values from refs, no deps needed
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentMood = moodRef.current;
    const cfg         = MOOD_CONFIG[currentMood];
    const colors      = cfg.colors;
    const analysis    = analysisRef.current;
    const energy      = energyRef.current;

    const width = canvas.width, height = canvas.height;
    const cx    = width / 2,    cy     = height / 2;

    timeRef.current += 0.016;
    const t = timeRef.current;

    const bass = analysis?.bass ?? 0.5;
    const mid  = analysis?.mid  ?? 0.5;
    const high = analysis?.high ?? 0.5;
    const rms  = analysis?.rms  ?? 0.3;

    // Fade clear
    ctx.fillStyle = `${colors.background}cc`;
    ctx.fillRect(0, 0, width, height);

    // Background pulse
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 100 + bass * 150);
    grad.addColorStop(0, `${colors.primary}40`);
    grad.addColorStop(0.5, `${colors.secondary}20`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Rotating rings
    for (let r = 0; r < 3; r++) {
      const radius   = 60 + r * 40 + mid * 30;
      const rotation = t * (0.5 + r * 0.2) * cfg.motionSpeed;
      const segments = 12 + r * 4;
      ctx.strokeStyle = `${colors.accent}${Math.floor(50 + high * 50).toString(16).padStart(2, '0')}`;
      ctx.lineWidth   = 2 + bass * 2;
      ctx.beginPath();
      for (let i = 0; i < segments; i++) {
        const angle  = (i / segments) * Math.PI * 2 + rotation;
        const wobble = Math.sin(t * 3 + i) * 5 * mid;
        const x = cx + Math.cos(angle) * (radius + wobble);
        const y = cy + Math.sin(angle) * (radius + wobble);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Center orb
    const orbR  = 30 + bass * 40 + rms * 20;
    const orbG  = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbR);
    orbG.addColorStop(0, colors.primary);
    orbG.addColorStop(0.5, colors.secondary);
    orbG.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, orbR, 0, Math.PI * 2);
    ctx.fillStyle = orbG;
    ctx.fill();

    // Particles
    const speed = cfg.motionSpeed * (0.5 + energy / 10);
    particlesRef.current.forEach((p) => {
      p.x += p.vx * speed * (1 + bass);
      p.y += p.vy * speed * (1 + bass);
      if (p.x < 0)      p.x = width;
      if (p.x > width)  p.x = 0;
      if (p.y < 0)      p.y = height;
      if (p.y > height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 + high * 2), 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.floor(p.alpha * 255 * (0.5 + rms)).toString(16).padStart(2, '0');
      ctx.fill();
    });

    // Frequency bars
    if (analysis?.frequencyData) {
      const barW = width / 32;
      for (let i = 0; i < 32; i++) {
        const h = (analysis.frequencyData[i * 4] / 255) * 50;
        ctx.fillStyle = `${colors.accent}30`;
        ctx.fillRect(i * barW, height - h, barW - 2, h);
      }
    }

    animationRef.current = requestAnimationFrame(draw);
  }, []); // stable — refs provide live values

  // Init particles on mount only
  useEffect(() => {
    initParticles(MOOD_CONFIG[mood].particleCount);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Start / stop loop on isPlaying change
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(draw);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, draw]);

  // Idle static frame
  useEffect(() => {
    if (isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cfg    = MOOD_CONFIG[mood];
    const colors = cfg.colors;
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const g = ctx.createRadialGradient(200, 200, 0, 200, 200, 150);
    g.addColorStop(0, `${colors.primary}40`);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(200, 200, 50, 0, Math.PI * 2);
    const og = ctx.createRadialGradient(200, 200, 0, 200, 200, 50);
    og.addColorStop(0, colors.primary);
    og.addColorStop(1, colors.secondary);
    ctx.fillStyle = og;
    ctx.fill();
  }, [isPlaying, mood]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="w-full h-full"
    />
  );
});
