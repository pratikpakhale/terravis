import { useCallback } from 'react';
import Map from 'ol/Map';
import { fromLonLat } from 'ol/proj';
import { MapAction } from './mapActions';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { getCenter } from 'ol/extent';

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

      // Remove existing search results layer if it exists
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

      // Zoom to the extent of the search results with a slower animation
      const extent = vectorSource.getExtent();
      const view = mapInstance.current.getView();
      const size = mapInstance.current.getSize();

      if (size) {
        const newCenter = getCenter(extent);
        const newResolution = view.getResolutionForExtent(extent, size);

        view.animate(
          {
            center: view.getCenter(),
            resolution: view.getResolution(),
            duration: 0,
          },
          {
            center: newCenter,
            resolution: newResolution,
            duration: 1000, // Increased duration for slower animation
            easing: t => t * (2 - t), // Use an easing function for smoother animation
          }
        );
      }
    } catch (error) {
      console.error('Error searching for location:', error);
    }
  };

  return { dispatchMapAction };
};

export default useMapActions;
