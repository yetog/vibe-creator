import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioAnalysis } from '../types';

export interface UseAudioEngineReturn {
  isPlaying:        boolean;
  isLooping:        boolean;
  tempo:            number;
  masterVolume:     number;
  analysis:         AudioAnalysis | null;
  loadAudio:        (url: string) => Promise<void>;
  play:             () => void;
  pause:            () => void;
  stop:             () => void;
  toggleLoop:       () => void;
  setTempo:         (bpm: number) => void;
  setMasterVolume:  (vol: number) => void;
  getAudioContext:  () => AudioContext | null;
  connectRecording: (dest: MediaStreamAudioDestinationNode) => void;
}

export function useAudioEngine(): UseAudioEngineReturn {
  const audioContextRef   = useRef<AudioContext | null>(null);
  const analyserRef       = useRef<AnalyserNode | null>(null);
  const compressorRef     = useRef<DynamicsCompressorNode | null>(null);
  const masterGainRef     = useRef<GainNode | null>(null);
  const sourceRef         = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef    = useRef<AudioBuffer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isPlaying,    setIsPlaying]   = useState(false);
  const [isLooping,    setIsLooping]   = useState(true);
  const [tempo,        setTempoState]  = useState(90);
  const [masterVolume, setVolumeState] = useState(0.8);
  const [analysis,     setAnalysis]    = useState<AudioAnalysis | null>(null);

  const initContext = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Analyser for canvas reactivity
    analyserRef.current                         = ctx.createAnalyser();
    analyserRef.current.fftSize                 = 256;
    analyserRef.current.smoothingTimeConstant   = 0.8;

    // Compressor chain — tuned from chord-genesis
    compressorRef.current = ctx.createDynamicsCompressor();
    compressorRef.current.threshold.setValueAtTime(-24, ctx.currentTime);
    compressorRef.current.knee.setValueAtTime(30,       ctx.currentTime);
    compressorRef.current.ratio.setValueAtTime(12,      ctx.currentTime);
    compressorRef.current.attack.setValueAtTime(0.003,  ctx.currentTime);
    compressorRef.current.release.setValueAtTime(0.25,  ctx.currentTime);

    // Master gain
    masterGainRef.current = ctx.createGain();
    masterGainRef.current.gain.setValueAtTime(0.8, ctx.currentTime);

    // Chain: analyser → compressor → masterGain → destination
    analyserRef.current.connect(compressorRef.current);
    compressorRef.current.connect(masterGainRef.current);
    masterGainRef.current.connect(ctx.destination);

    audioContextRef.current = ctx;
    return ctx;
  }, []);

  const loadAudio = useCallback(async (url: string) => {
    const ctx = initContext();
    if (ctx.state === 'suspended') await ctx.resume();
    const response    = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    audioBufferRef.current = await ctx.decodeAudioData(arrayBuffer);
  }, [initContext]);

  const play = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx || !audioBufferRef.current || !analyserRef.current) {
      console.error('Audio not loaded');
      return;
    }
    if (ctx.state === 'suspended') ctx.resume();
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch (_) { /* already stopped */ }
    }
    const source  = ctx.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.loop   = isLooping;
    source.connect(analyserRef.current);
    source.start();
    sourceRef.current  = source;
    source.onended = () => { if (!source.loop) setIsPlaying(false); };
    setIsPlaying(true);
  }, [isLooping]);

  const pause = useCallback(() => {
    audioContextRef.current?.suspend();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch (_) { /* already stopped */ }
      sourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const toggleLoop = useCallback(() => {
    setIsLooping((prev) => {
      if (sourceRef.current) sourceRef.current.loop = !prev;
      return !prev;
    });
  }, []);

  const setTempo = useCallback((bpm: number) => setTempoState(bpm), []);

  const setMasterVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (masterGainRef.current) {
      masterGainRef.current.gain.setValueAtTime(vol, masterGainRef.current.context.currentTime);
    }
  }, []);

  const getAudioContext  = useCallback(() => audioContextRef.current, []);
  const connectRecording = useCallback((dest: MediaStreamAudioDestinationNode) => {
    analyserRef.current?.connect(dest);
  }, []);

  // Analysis loop — runs while playing
  const analyseFrame = useCallback(() => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const bufLen   = analyser.frequencyBinCount;
    const freqData = new Uint8Array(bufLen);
    const timeData = new Uint8Array(bufLen);
    analyser.getByteFrequencyData(freqData);
    analyser.getByteTimeDomainData(timeData);

    const bassEnd = Math.floor(bufLen * 0.1);
    const midEnd  = Math.floor(bufLen * 0.5);
    let bassSum = 0, midSum = 0, highSum = 0;
    for (let i = 0; i < bufLen; i++) {
      if (i < bassEnd)     bassSum += freqData[i];
      else if (i < midEnd) midSum  += freqData[i];
      else                 highSum += freqData[i];
    }
    let rmsSum = 0;
    for (let i = 0; i < bufLen; i++) {
      const s = (timeData[i] - 128) / 128;
      rmsSum += s * s;
    }

    setAnalysis({
      frequencyData:  freqData,
      timeDomainData: timeData,
      bass:  bassSum / (bassEnd * 255),
      mid:   midSum  / ((midEnd - bassEnd) * 255),
      high:  highSum / ((bufLen - midEnd) * 255),
      rms:   Math.sqrt(rmsSum / bufLen),
    });

    animationFrameRef.current = requestAnimationFrame(analyseFrame);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(analyseFrame);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying, analyseFrame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      audioContextRef.current?.close();
    };
  }, [stop]);

  return {
    isPlaying, isLooping, tempo, masterVolume, analysis,
    loadAudio, play, pause, stop,
    toggleLoop, setTempo, setMasterVolume,
    getAudioContext, connectRecording,
  };
}
