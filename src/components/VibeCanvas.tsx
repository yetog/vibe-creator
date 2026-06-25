import { useRef, useEffect, useCallback } from 'react';
import { AudioAnalysis, MOOD_CONFIG, Mood } from '../types';

interface VibeCanvasProps {
  mood: Mood;
  energy: number;
  analysis: AudioAnalysis | null;
  isPlaying: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export function VibeCanvas({ mood, energy, analysis, isPlaying }: VibeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  const config = MOOD_CONFIG[mood];
  const colors = config.colors;

  // Initialize particles
  const initParticles = useCallback((count: number) => {
    const particles: Particle[] = [];
    const colorOptions = [colors.primary, colors.secondary, colors.accent];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * 400,
        y: Math.random() * 400,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 4 + 2,
        alpha: Math.random() * 0.5 + 0.3,
        color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
      });
    }

    particlesRef.current = particles;
  }, [colors]);

  // Draw frame
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Time progression
    timeRef.current += 0.016;
    const time = timeRef.current;

    // Audio reactivity values
    const bass = analysis?.bass ?? 0.5;
    const mid = analysis?.mid ?? 0.5;
    const high = analysis?.high ?? 0.5;
    const rms = analysis?.rms ?? 0.3;

    // Clear with fade effect
    ctx.fillStyle = `${colors.background}cc`;
    ctx.fillRect(0, 0, width, height);

    // Background pulse
    const pulseSize = 100 + bass * 150;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize);
    gradient.addColorStop(0, `${colors.primary}40`);
    gradient.addColorStop(0.5, `${colors.secondary}20`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Rotating rings
    const ringCount = 3;
    for (let r = 0; r < ringCount; r++) {
      const ringRadius = 60 + r * 40 + mid * 30;
      const rotation = time * (0.5 + r * 0.2) * config.motionSpeed;
      const segments = 12 + r * 4;

      ctx.strokeStyle = `${colors.accent}${Math.floor(50 + high * 50).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 2 + bass * 2;

      ctx.beginPath();
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2 + rotation;
        const wobble = Math.sin(time * 3 + i) * 5 * mid;
        const x = centerX + Math.cos(angle) * (ringRadius + wobble);
        const y = centerY + Math.sin(angle) * (ringRadius + wobble);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Center orb
    const orbSize = 30 + bass * 40 + rms * 20;
    const orbGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbSize);
    orbGradient.addColorStop(0, colors.primary);
    orbGradient.addColorStop(0.5, colors.secondary);
    orbGradient.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(centerX, centerY, orbSize, 0, Math.PI * 2);
    ctx.fillStyle = orbGradient;
    ctx.fill();

    // Particles
    const speedMultiplier = config.motionSpeed * (0.5 + energy / 10);

    particlesRef.current.forEach((particle) => {
      // Update position
      particle.x += particle.vx * speedMultiplier * (1 + bass);
      particle.y += particle.vy * speedMultiplier * (1 + bass);

      // Wrap around
      if (particle.x < 0) particle.x = width;
      if (particle.x > width) particle.x = 0;
      if (particle.y < 0) particle.y = height;
      if (particle.y > height) particle.y = 0;

      // Draw particle
      const particleSize = particle.size * (1 + high * 2);
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particleSize, 0, Math.PI * 2);
      ctx.fillStyle = particle.color + Math.floor(particle.alpha * 255 * (0.5 + rms)).toString(16).padStart(2, '0');
      ctx.fill();
    });

    // Frequency bars (subtle)
    if (analysis?.frequencyData) {
      const barCount = 32;
      const barWidth = width / barCount;

      for (let i = 0; i < barCount; i++) {
        const value = analysis.frequencyData[i * 4] / 255;
        const barHeight = value * 50;

        ctx.fillStyle = `${colors.accent}30`;
        ctx.fillRect(
          i * barWidth,
          height - barHeight,
          barWidth - 2,
          barHeight
        );
      }
    }

    // Continue animation
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(draw);
    }
  }, [analysis, colors, config.motionSpeed, energy, isPlaying]);

  // Initialize and start animation
  useEffect(() => {
    initParticles(config.particleCount);
  }, [initParticles, config.particleCount]);

  useEffect(() => {
    if (isPlaying) {
      draw();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, draw]);

  // Draw idle state
  useEffect(() => {
    if (!isPlaying) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw static preview
      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createRadialGradient(200, 200, 0, 200, 200, 150);
      gradient.addColorStop(0, `${colors.primary}40`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center orb
      ctx.beginPath();
      ctx.arc(200, 200, 50, 0, Math.PI * 2);
      const orbGradient = ctx.createRadialGradient(200, 200, 0, 200, 200, 50);
      orbGradient.addColorStop(0, colors.primary);
      orbGradient.addColorStop(1, colors.secondary);
      ctx.fillStyle = orbGradient;
      ctx.fill();
    }
  }, [isPlaying, colors]);

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="w-full h-full"
      />
    </div>
  );
}
