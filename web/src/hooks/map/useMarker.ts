/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useCallback, useState } from 'react';
import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';

const iconSvg =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='red' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-map-pin'><path d='M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z'/><circle cx='12' cy='10' r='3'/></svg>";

const iconStyle = new Style({
  image: new Icon({
    src: iconSvg,
    anchor: [0.5, 1],
    scale: 1, // Adjust this if needed
  }),
});

const useMarker = (mapInstance: React.MutableRefObject<Map | null>) => {
  const markerLayer = useRef<any>(null);
  const [isAddingMarkers, setIsAddingMarkers] = useState(false);
  const markers = useRef<Feature[]>([]);

  const setupMarkerLayer = useCallback(() => {
    if (!mapInstance.current) return;

    const source = new VectorSource();
    markerLayer.current = new VectorLayer({
      source: source,
      style: iconStyle,
      properties: {
        name: 'Markers',
      },
    });

    mapInstance.current.addLayer(markerLayer.current);
  }, [mapInstance]);

  const addMarker = useCallback((coordinate: number[]) => {
    if (!markerLayer.current) {
      console.error('Marker layer not initialized');
      return;
    }

    const feature = new Feature({
      geometry: new Point(coordinate),
    });

    markerLayer.current.getSource()?.addFeature(feature);
    markers.current.push(feature);
  }, []);

  const handleMapClick = useCallback(
    (event: any) => {
      const coordinate = event.coordinate; // Use event.coordinate directly
      addMarker(coordinate);
    },
    [addMarker]
  );

  const startMarking = useCallback(() => {
    if (!mapInstance.current) return;
    if (!markerLayer.current) {
      setupMarkerLayer();
    }

    setIsAddingMarkers(true);
    mapInstance.current.getViewport().style.cursor = 'crosshair';
    mapInstance.current.on('click', handleMapClick);
  }, [mapInstance, setupMarkerLayer, handleMapClick]);

  const stopMarking = useCallback(() => {
    if (!mapInstance.current) return;
    if (!markerLayer.current) return;

    setIsAddingMarkers(false);
    mapInstance.current.getViewport().style.cursor = 'default';
    mapInstance.current.un('click', handleMapClick);
  }, [mapInstance, handleMapClick]);

  const toggleMarkerAddition = useCallback(() => {
    if (!mapInstance.current) return;
    if (!markerLayer.current) {
      setupMarkerLayer();
    }

    setIsAddingMarkers(prev => {
      if (prev) {
        mapInstance.current!.getViewport().style.cursor = 'default';
        mapInstance.current!.un('click', handleMapClick); // Remove the event listener
      } else {
        mapInstance.current!.getViewport().style.cursor = 'crosshair';
        mapInstance.current!.on('click', handleMapClick);
      }
      return !prev;
    });
  }, [mapInstance, setupMarkerLayer, handleMapClick]); // Add handleMapClick to dependencies

  const removeLastMarker = useCallback(() => {
    if (markerLayer.current && markers.current.length > 0) {
      const lastMarker = markers.current.pop();
      if (lastMarker) {
        markerLayer.current.getSource()?.removeFeature(lastMarker);
      }
    }
  }, []);

  const clearAllMarkers = useCallback(() => {
    if (markerLayer.current) {
      markerLayer.current.getSource()?.clear();
      markers.current = [];
    }
  }, []);

  return {
    toggleMarkerAddition,
    isAddingMarkers,
    removeLastMarker,
    clearAllMarkers,
    addMarker,
    startMarking,
    stopMarking,
  };
};

export default useMarker;
