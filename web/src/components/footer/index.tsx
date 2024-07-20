import React, { useCallback, useEffect, useContext } from 'react';
import { Mic, Minus, Plus, Loader } from 'lucide-react';
import { useVoiceRecorder } from '../../hooks/voice';

import { SettingsContext } from '../../hooks/settings';

interface FooterProps {
  coordinates: { lat: number; lon: number };
  loadPercentage: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onTranscriptionComplete: (action: string, transcription: string) => void;
  mapContainerRef: React.RefObject<HTMLDivElement>;
  transcription: string;
  action: string;
}

const Footer: React.FC<FooterProps> = ({
  coordinates,
  loadPercentage,
  onZoomIn,
  onZoomOut,
  onTranscriptionComplete,
  mapContainerRef,
  transcription = 'Voice transcription will appear here',
  action = 'default',
}) => {
  const { settings } = useContext(SettingsContext);

  const { isRecording, startRecording, stopRecording } = useVoiceRecorder({
    onTranscriptionComplete,
    useSocketIO: settings.liveVoice,
    chunkInterval: 3000,
  });

  const handleMicClick = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        event.code === 'Space' &&
        document.activeElement === mapContainerRef.current
      ) {
        event.preventDefault();
        handleMicClick();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleMicClick, mapContainerRef]);

  return (
    <footer className='fixed bottom-0 left-0 right-0 flex flex-col items-end'>
      <div className='mb-2 mr-4 flex items-center space-x-2'>
        <button
          className='p-2 bg-white rounded-full shadow-md'
          onClick={onZoomOut}
        >
          <Minus size={20} />
        </button>
        <button
          className='p-2 bg-white rounded-full shadow-md'
          onClick={onZoomIn}
        >
          <Plus size={20} />
        </button>
        <button
          className={`p-3 bg-white rounded-full shadow-md ${
            isRecording ? 'animate-pulse' : ''
          }`}
          onClick={handleMicClick}
        >
          <Mic size={24} color={isRecording ? 'red' : 'black'} />
        </button>
      </div>
      <div className='w-full bg-gray-800 bg-opacity-70 text-white py-2 px-4 flex justify-between items-center text-sm'>
        <div className='flex items-center'>
          <p className=''>{loadPercentage}%</p>
          {loadPercentage < 100 && (
            <Loader className='animate-spin ml-2' size={16} />
          )}
          <p className='ml-5'>ASR: {transcription}</p>
        </div>
        <div className='flex'>
          <p className='mr-4'>Last Execution: {action}</p>
          <p>
            Lat: {coordinates.lat.toFixed(6)}, Lon: {coordinates.lon.toFixed(6)}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
