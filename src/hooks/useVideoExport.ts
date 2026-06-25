import { useRef, useState, useCallback } from 'react';

interface UseVideoExportReturn {
  isRecording: boolean;
  recordingTime: number;
  startRecording: (
    canvas: HTMLCanvasElement,
    audioContext: AudioContext,
    connectRecording: (dest: MediaStreamAudioDestinationNode) => void
  ) => void;
  stopRecording: () => void;
}

export function useVideoExport(): UseVideoExportReturn {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const startRecording = useCallback((
    canvas: HTMLCanvasElement,
    audioContext: AudioContext,
    connectRecording: (dest: MediaStreamAudioDestinationNode) => void
  ) => {
    try {
      // Get video stream from canvas at 30 FPS
      const canvasStream = canvas.captureStream(30);

      // Create audio destination for recording
      const audioDestination = audioContext.createMediaStreamDestination();
      audioDestRef.current = audioDestination;

      // Connect the existing audio analyser to the recording destination
      connectRecording(audioDestination);

      // Combine video and audio streams
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioDestination.stream.getAudioTracks(),
      ]);

      // Create MediaRecorder with best available codec
      let mediaRecorder: MediaRecorder;
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4',
      ];

      let selectedMime = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      if (selectedMime) {
        mediaRecorder = new MediaRecorder(combinedStream, { mimeType: selectedMime });
      } else {
        mediaRecorder = new MediaRecorder(combinedStream);
      }

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: selectedMime || 'video/webm' });
        const url = URL.createObjectURL(blob);

        // Create timestamp for filename
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);

        // Trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `vibe-${timestamp}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100);
        chunksRef.current = [];
      };

      // Start recording - collect data every 100ms
      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer for UI feedback
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      console.log('Recording started with codec:', selectedMime || 'default');

    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Recording failed. This feature may not be supported in your browser.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      console.log('Recording stopped');
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRecording(false);
    setRecordingTime(0);
  }, []);

  return {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
  };
}
