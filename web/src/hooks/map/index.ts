import { useState, useEffect, useRef, useCallback } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat, toLonLat } from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import { defaults as defaultControls } from 'ol/control';
import useMeasurement from './useMeasurement';
import useMapActions from './useMapActions';
import useLoadPercentage from './useLoadPercentage';
import { useMapLayers } from './useMapLayers';
import { MapState } from './types';
import useMarker from './useMarker';

const initialMapState: MapState = {
  zoom: 5,
  coordinates: { lat: 22.5937, lon: 78.9629 },
  loadPercentage: 0,
};

const useMap = () => {
  const [mapState, setMapState] = useState<MapState>(initialMapState);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Map | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);

  const {
    toggleMeasurement,
    removeMeasurement,
    clearAllMeasurements,
    isMeasuring: isRulerMeasuring,
    startMeasuring,
    stopMeasuring,
  } = useMeasurement(mapInstance);
  const {
    toggleMarkerAddition,
    isAddingMarkers,
    removeLastMarker,
    clearAllMarkers,
    addMarker,
    startMarking,
    stopMarking,
  } = useMarker(mapInstance);
  const { mapLayers, toggleLayerVisibility, toggleLayerVisibilityByName } =
    useMapLayers(mapInstance);
  const { dispatchMapAction } = useMapActions(
    mapInstance,

    toggleMeasurement,
    setIsMeasuring,
    clearAllMeasurements,
    removeMeasurement,

    removeLastMarker,
    clearAllMarkers,
    startMeasuring,
    stopMeasuring,
    startMarking,
    stopMarking,
    toggleLayerVisibilityByName
  );
  const { setupLoadPercentage } = useLoadPercentage(setMapState);

  const updateMapState = useCallback((view: View) => {
    const zoom = Math.round(view.getZoom() || 0);
    const center = view.getCenter();
    if (center) {
      const [lon, lat] = toLonLat(center);
      setMapState(prev => ({ ...prev, zoom, coordinates: { lat, lon } }));
    }
  }, []);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || mapInstance.current) return;

    const source = new XYZ({
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    });

    const layer = new TileLayer({
      source,
      properties: {
        name: 'OpenStreetMap',
      },
    });

    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [layer],
      view: new View({
        center: fromLonLat([
          initialMapState.coordinates.lon,
          initialMapState.coordinates.lat,
        ]),
        zoom: initialMapState.zoom,
      }),
      controls: defaultControls({
        zoom: false,
        rotate: false,
        attribution: false,
      }),
    });

    const view = mapInstance.current.getView();
    view.on('change', () => updateMapState(view));
    mapInstance.current.on('pointermove', event => {
      const [lon, lat] = toLonLat(event.coordinate);
      setMapState(prev => ({ ...prev, coordinates: { lat, lon } }));
    });

    setupLoadPercentage(source);
  }, [updateMapState, setupLoadPercentage]);

  useEffect(() => {
    console.log('useEffect in useMap');
    initializeMap();
    return () => {
      console.log('Cleanup in useMap');
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
      }
    };
  }, [initializeMap]);

  return {
    mapRef,
    mapState,
    dispatchMapAction,
    isMeasuring,
    mapInstance,
    mapLayers,
    toggleLayerVisibility,
    removeMeasurement,
    clearAllMeasurements,
    isRulerMeasuring,
    toggleMarkerAddition,
    isAddingMarkers,
    removeLastMarker,
    clearAllMarkers,
    addMarker,
  };
};

export default useMap;
