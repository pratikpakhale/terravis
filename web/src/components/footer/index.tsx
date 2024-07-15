import React, { useCallback, useEffect } from 'react';
import { Mic, Minus, Plus, Loader } from 'lucide-react';
import { useVoiceRecorder } from '../../hooks/voice';

interface FooterProps {
  coordinates: { lat: number; lon: number };
  loadPercentage: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onTranscriptionComplete: (transcription: string) => void;
  mapContainerRef: React.RefObject<HTMLDivElement>;
}

const Footer: React.FC<FooterProps> = ({
  coordinates,
  loadPercentage,
  onZoomIn,
  onZoomOut,
  onTranscriptionComplete,
  mapContainerRef,
}) => {
  const { isRecording, startRecording, stopRecording } = useVoiceRecorder({
    onTranscriptionComplete,
    useSocketIO: true,
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
      <div className='w-full bg-gray-800 bg-opacity-70 text-white py-2 px-4 flex justify-between items-center'>
        <div className='flex items-center'>
          <p className='text-sm'>{loadPercentage}%</p>
          {loadPercentage < 100 && (
            <Loader className='animate-spin ml-2' size={16} />
          )}
        </div>
        <p className='text-sm'>
          Lat: {coordinates.lat.toFixed(6)}, Lon: {coordinates.lon.toFixed(6)}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
