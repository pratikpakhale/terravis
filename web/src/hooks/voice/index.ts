import { useState, useCallback, useRef, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { SettingsContext } from '../settings';

interface UseVoiceRecorderProps {
  onTranscriptionComplete: (transcription: string) => void;
  useSocketIO?: boolean;
  chunkInterval: number;
}

// Create a single socket instance outside of the component
const socket = io('http://localhost:3000', {
  withCredentials: true,
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Custom hook to manage socket connection
const useSocket = (onAction: (data: string) => void) => {
  useEffect(() => {
    const onConnect = () => console.log('Connected to server');
    const onConnectError = (error: Error) =>
      console.error('Connection error:', error);
    const onActionLocal = (data: { id: string; data: string }) => {
      console.log('Received action:', data.id, data.data);
      socket.emit('action_ack', data.id);
      onAction(data.data);
    };

    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);
    socket.on('action', onActionLocal);

    return () => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      socket.off('action', onActionLocal);
    };
  }, [onAction]);

  return socket;
};

export const useVoiceRecorder = ({
  onTranscriptionComplete,
  useSocketIO = true,
  chunkInterval = 3000,
}: UseVoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioChunksRef = useRef<Float32Array[]>([]);

  const socket = useSocket(onTranscriptionComplete);

  const { settings } = useContext(SettingsContext);

  const processAudioChunks = useCallback(() => {
    if (audioChunksRef.current.length > 0) {
      const audioBlob = exportWAV(audioChunksRef.current);
      if (useSocketIO) {
        sendAudioChunk(audioBlob, settings.ai);
      } else {
        sendAudioData(audioBlob, settings.ai);
      }
      audioChunksRef.current = [];
    }
  }, [useSocketIO, settings]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isRecording && useSocketIO) {
      intervalId = setInterval(processAudioChunks, chunkInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRecording, useSocketIO, chunkInterval, processAudioChunks]);

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

    if (!useSocketIO) {
      processAudioChunks();
    }
  }, [useSocketIO, processAudioChunks]);

  const sendAudioChunk = useCallback((blob: Blob, ai: 'LLM' | 'NLP') => {
    if (socket.connected) {
      socket.emit('audio', {
        blob,
        ai,
      });
    } else {
      console.error('Socket is not connected');
    }
  }, []);

  const sendAudioData = async (blob: Blob, ai: 'LLM' | 'NLP') => {
    const formData = new FormData();
    formData.append('audio', blob, 'recording.wav');
    formData.append('ai', ai);
    try {
      const response = await fetch('http://localhost:3000/transcribe', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log('Transcription:', data.transcription);
      console.log('Action:', data.action);
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
