import { useRef, useState, useCallback, useEffect } from 'react';
import { AudioAnalysis } from '../types';

interface UseAudioAnalyzerReturn {
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  analysis: AudioAnalysis | null;
  loadAudio: (url: string) => Promise<void>;
  play: () => void;
  pause: () => void;
  stop: () => void;
  getAnalysis: () => AudioAnalysis | null;
  getAudioContext: () => AudioContext | null;
  connectRecording: (destination: MediaStreamAudioDestinationNode) => void;
}

export function useAudioAnalyzer(): UseAudioAnalyzerReturn {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      analyserRef.current.connect(audioContextRef.current.destination);
    }
    return audioContextRef.current;
  }, []);

  // Load audio from URL
  const loadAudio = useCallback(async (url: string) => {
    const ctx = initAudioContext();

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    audioBufferRef.current = await ctx.decodeAudioData(arrayBuffer);
  }, [initAudioContext]);

  // Analyze current frame
  const analyzeFrame = useCallback(() => {
    if (!analyserRef.current || !isPlaying) return null;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const frequencyData = new Uint8Array(bufferLength);
    const timeDomainData = new Uint8Array(bufferLength);

    analyser.getByteFrequencyData(frequencyData);
    analyser.getByteTimeDomainData(timeDomainData);

    // Calculate frequency bands
    const bassEnd = Math.floor(bufferLength * 0.1);      // 0-10% = bass
    const midEnd = Math.floor(bufferLength * 0.5);       // 10-50% = mids
    // Rest = highs

    let bassSum = 0, midSum = 0, highSum = 0;

    for (let i = 0; i < bufferLength; i++) {
      if (i < bassEnd) {
        bassSum += frequencyData[i];
      } else if (i < midEnd) {
        midSum += frequencyData[i];
      } else {
        highSum += frequencyData[i];
      }
    }

    const bass = bassSum / (bassEnd * 255);
    const mid = midSum / ((midEnd - bassEnd) * 255);
    const high = highSum / ((bufferLength - midEnd) * 255);

    // Calculate RMS (volume)
    let rmsSum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const sample = (timeDomainData[i] - 128) / 128;
      rmsSum += sample * sample;
    }
    const rms = Math.sqrt(rmsSum / bufferLength);

    return {
      frequencyData,
      timeDomainData,
      bass,
      mid,
      high,
      rms,
    };
  }, [isPlaying]);

  // Animation loop for continuous analysis
  const updateAnalysis = useCallback(() => {
    if (isPlaying) {
      const currentAnalysis = analyzeFrame();
      if (currentAnalysis) {
        setAnalysis(currentAnalysis);
      }
      animationFrameRef.current = requestAnimationFrame(updateAnalysis);
    }
  }, [isPlaying, analyzeFrame]);

  // Start analysis loop when playing
  useEffect(() => {
    if (isPlaying) {
      updateAnalysis();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, updateAnalysis]);

  // Play audio
  const play = useCallback(() => {
    if (!audioContextRef.current || !audioBufferRef.current || !analyserRef.current) {
      console.error('Audio not loaded');
      return;
    }

    // Resume context if suspended
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    // Stop any existing playback
    if (sourceRef.current) {
      sourceRef.current.stop();
    }

    // Create new source
    sourceRef.current = audioContextRef.current.createBufferSource();
    sourceRef.current.buffer = audioBufferRef.current;
    sourceRef.current.connect(analyserRef.current);
    sourceRef.current.loop = true;
    sourceRef.current.start();

    setIsPlaying(true);
  }, []);

  // Pause audio
  const pause = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.suspend();
    }
    setIsPlaying(false);
  }, []);

  // Stop audio
  const stop = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    setIsPlaying(false);
    setAnalysis(null);
  }, []);

  // Get current analysis (for external use)
  const getAnalysis = useCallback(() => {
    return analyzeFrame();
  }, [analyzeFrame]);

  // Get audio context (for recording)
  const getAudioContext = useCallback(() => {
    return audioContextRef.current;
  }, []);

  // Connect to recording destination
  const connectRecording = useCallback((destination: MediaStreamAudioDestinationNode) => {
    if (analyserRef.current) {
      analyserRef.current.connect(destination);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      stop();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stop]);

  return {
    audioContext: audioContextRef.current,
    analyser: analyserRef.current,
    isPlaying,
    analysis,
    loadAudio,
    play,
    pause,
    stop,
    getAnalysis,
    getAudioContext,
    connectRecording,
  };
}
