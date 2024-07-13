import { useCallback } from 'react';
import XYZ from 'ol/source/XYZ';
import { MapState } from './types'; // Assuming you have a types file

const useLoadPercentage = (
  setMapState: React.Dispatch<React.SetStateAction<MapState>>
) => {
  const setupLoadPercentage = useCallback(
    (source: XYZ) => {
      let loadedTiles = 0;
      let totalTiles = 0;

      const updateLoadPercentage = () => {
        const percentage = Math.round((loadedTiles / totalTiles) * 100);
        setMapState(prev => ({ ...prev, loadPercentage: percentage }));
      };

      source.on('tileloadstart', () => {
        totalTiles++;
        updateLoadPercentage();
      });

      source.on('tileloadend', () => {
        loadedTiles++;
        updateLoadPercentage();
      });

      source.on('tileloaderror', () => {
        loadedTiles++;
        updateLoadPercentage();
      });
    },
    [setMapState]
  );

  return { setupLoadPercentage };
};

export default useLoadPercentage;
