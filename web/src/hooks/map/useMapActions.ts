import { useCallback } from 'react';
import Map from 'ol/Map';
import { fromLonLat } from 'ol/proj';
import { MapAction } from './mapActions';
import VectorLayer from 'ol/layer/Vector';
import TileLayer from 'ol/layer/Tile';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { getCenter } from 'ol/extent';

import { dispatcherTTS } from '../voice/synthesize';

const useMapActions = (
  mapInstance: React.MutableRefObject<Map | null>,
  isMeasuring: boolean,
  toggleMeasurement: () => void,
  setIsMeasuring: React.Dispatch<React.SetStateAction<boolean>>,
  clearMeasurements: () => void,
  undoMeasurement: () => void
) => {
  const dispatchMapAction = useCallback(
    (action: MapAction) => {
      if (!mapInstance.current) return;

      dispatcherTTS(action);

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

        case 'START_MEASURE':
          if (!isMeasuring) {
            toggleMeasurement();
          }
          break;
        case 'STOP_MEASURE':
          if (isMeasuring) {
            toggleMeasurement();
          }
          break;
        case 'CLEAR_MEASUREMENTS':
          clearMeasurements();
          break;
        case 'UNDO_MEASUREMENT':
          undoMeasurement();
          break;
        case 'SEARCH_LOCATION':
          if (typeof action.payload === 'string') {
            searchAndHighlight(action.payload);
          }
          break;

        default:
          console.error(`Unknown map action: ${action.type}`);
      }
    },
    [mapInstance, toggleMeasurement, setIsMeasuring]
  );

  const searchAndHighlight = async (query: string) => {
    if (!mapInstance.current) return;

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=geojson`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      // Remove existing search results layer
      const existingLayer = mapInstance.current
        .getLayers()
        .getArray()
        .find(layer => layer.get('name') === 'searchResults');
      if (existingLayer) {
        mapInstance.current.removeLayer(existingLayer);
      }

      // Create a new vector layer for search results
      const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(data, {
          featureProjection: 'EPSG:3857',
        }),
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({ color: 'red' }),
            stroke: new Stroke({ color: 'white', width: 2 }),
          }),
        }),
      });

      vectorLayer.set('name', 'searchResults');
      mapInstance.current.addLayer(vectorLayer);

      const view = mapInstance.current.getView();
      const size = mapInstance.current.getSize();

      if (size) {
        const extent = vectorSource.getExtent();
        const newCenter = getCenter(extent);
        const newResolution = view.getResolutionForExtent(extent, size);

        // Zoom out to level 4
        view.animate(
          {
            zoom: 5,
            duration: 1000,
            easing: t => Math.pow(t, 1.5),
          },
          () => {
            // Zoom in to the search results
            view.animate({
              center: newCenter,
              resolution: newResolution,
              duration: 1500,
              easing: t => Math.pow(t, 1.5),
            });
          }
        );

        // Ensure tiles are loaded
        const tileLoadStart = Date.now();
        const checkTileLoading = () => {
          const allTilesLoaded = mapInstance.current
            ?.getLayers()
            .getArray()
            .every(layer => {
              if (layer instanceof TileLayer) {
                return layer.getSource().getTileLoadFunction() === null;
              }
              return true;
            });

          if (allTilesLoaded) {
            // All tiles loaded, proceed with zoom
            view.setCenter(newCenter);
            view.setResolution(newResolution);
          } else if (Date.now() - tileLoadStart < 5000) {
            // Check again in 100ms, up to 5 seconds
            setTimeout(checkTileLoading, 100);
          } else {
            // Timeout after 5 seconds, proceed anyway
            view.setCenter(newCenter);
            view.setResolution(newResolution);
          }
        };

        checkTileLoading();
      }
    } catch (error) {
      console.error('Error searching for location:', error);
    }
  };

  return { dispatchMapAction };
};

export default useMapActions;
