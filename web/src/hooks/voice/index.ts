import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVoiceRecorderProps {
  onTranscriptionComplete: (transcription: string) => void;
  useWebSocket?: boolean;
  chunkInterval: number;
}

export const useVoiceRecorder = ({
  onTranscriptionComplete,
  useWebSocket = false,
  chunkInterval = 3000,
}: UseVoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioChunksRef = useRef<Float32Array[]>([]);
  const sendChunkRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (useWebSocket) {
      wsRef.current = new WebSocket('ws://localhost:3000');
      wsRef.current.onmessage = event => {
        const data = JSON.parse(event.data);
        if (data.type === 'action') {
          onTranscriptionComplete(data.data);
        }
      };
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [useWebSocket, onTranscriptionComplete]);

  useEffect(() => {
    sendChunkRef.current = () => {
      if (audioChunksRef.current.length > 0) {
        const audioBlob = exportWAV(audioChunksRef.current);
        sendAudioChunk(audioBlob);
        audioChunksRef.current = [];
      }
    };
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isRecording && useWebSocket) {
      intervalId = setInterval(() => {
        sendChunkRef.current();
      }, chunkInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRecording, useWebSocket, chunkInterval]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = audioContextRef.current.createScriptProcessor(
        4096,
        1,
        1
      );

      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      processorRef.current.onaudioprocess = e => {
        const inputData = e.inputBuffer.getChannelData(0);
        audioChunksRef.current.push(new Float32Array(inputData));
      };

      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsRecording(false);

    if (!useWebSocket) {
      const audioBlob = exportWAV(audioChunksRef.current);
      sendAudioData(audioBlob);
    }

    audioChunksRef.current = [];
  }, [useWebSocket]);

  const sendAudioChunk = (blob: Blob) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(blob);
    }
  };

  const sendAudioData = async (blob: Blob) => {
    const formData = new FormData();
    formData.append('audio', blob, 'recording.wav');

    try {
      const response = await fetch('http://localhost:3000/transcribe', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log('Transcription: ', data.transcription);
      console.log('Action: ', data.action);
      onTranscriptionComplete(data.action);
    } catch (error) {
      console.error('Error during transcription:', error);
    }
  };

  const exportWAV = (audioChunks: Float32Array[]): Blob => {
    const bufferLength = audioChunks.reduce(
      (acc, chunk) => acc + chunk.length,
      0
    );
    const buffer = new Float32Array(bufferLength);
    let offset = 0;

    for (const chunk of audioChunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }

    const wav = encodeWAV(buffer);
    return new Blob([wav], { type: 'audio/wav' });
  };

  const encodeWAV = (samples: Float32Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, audioContextRef.current?.sampleRate || 44100, true);
    view.setUint32(
      28,
      (audioContextRef.current?.sampleRate || 44100) * 2,
      true
    );
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    floatTo16BitPCM(view, 44, samples);

    return buffer;
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const floatTo16BitPCM = (
    output: DataView,
    offset: number,
    input: Float32Array
  ) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
};
