import { useCallback } from 'react';
import Map from 'ol/Map';
import { fromLonLat } from 'ol/proj';
import { MapAction } from './mapActions';

const useMapActions = (
  mapInstance: React.MutableRefObject<Map | null>,
  toggleMeasurement: () => void,
  setIsMeasuring: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const dispatchMapAction = useCallback(
    (action: MapAction) => {
      if (!mapInstance.current) return;

      const view = mapInstance.current.getView();

      switch (action.type) {
        case 'ZOOM_IN':
          view.animate({ zoom: view.getZoom()! + 1, duration: 250 });
          break;
        case 'ZOOM_OUT':
          view.animate({ zoom: view.getZoom()! - 1, duration: 250 });
          break;
        case 'SET_CENTER':
          if (
            action.payload &&
            typeof action.payload.lat === 'number' &&
            typeof action.payload.lon === 'number'
          ) {
            view.animate({
              center: fromLonLat([action.payload.lon, action.payload.lat]),
              duration: 250,
            });
          }
          break;
        case 'SET_ZOOM':
          if (typeof action.payload === 'number') {
            view.animate({ zoom: action.payload, duration: 250 });
          }
          break;

        case 'TOGGLE_MEASURE':
          toggleMeasurement();
          setIsMeasuring(prev => !prev);
          break;
        default:
          console.error(`Unknown map action: ${action.type}`);
      }
    },
    [mapInstance, toggleMeasurement, setIsMeasuring]
  );

  return { dispatchMapAction };
};

export default useMapActions;
