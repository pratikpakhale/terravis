/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useRef } from 'react';

interface UseVoiceRecorderProps {
  onTranscriptionComplete: (transcription: string) => void;
}

export const useVoiceRecorder = ({
  onTranscriptionComplete,
}: UseVoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        sendAudioData(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

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

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
};
