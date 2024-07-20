import { useState, useEffect, useCallback } from 'react';
import { Map } from 'ol';
import BaseLayer from 'ol/layer/Base';
import Layer from 'ol/layer/Layer';

export const useMapLayers = (mapRef: React.MutableRefObject<Map | null>) => {
  const [mapLayers, setMapLayers] = useState<{
    [x: string]: BaseLayer;
  }>({});

  const updateLayers = useCallback(() => {
    if (mapRef.current) {
      const layers = mapRef.current.getLayers().getArray();
      const temp: {
        [x: string]: BaseLayer;
      } = {};
      layers.forEach(layer => {
        temp[layer.getProperties().name] = layer;
      });

      setMapLayers(temp);
    }
  }, [mapRef]);

  const toggleLayerVisibility = useCallback(
    (layer: BaseLayer) => {
      if (layer instanceof Layer) {
        layer.setVisible(!layer.getVisible());
        updateLayers();
      } else {
        console.warn('Layer does not support visibility toggling');
      }
    },
    [updateLayers]
  );

  const toggleLayerVisibilityByName = useCallback(
    (layerName: string, visibility: boolean) => {
      if (mapRef.current) {
        const layers = mapRef.current.getLayers().getArray();
        const layer = layers.find(l => l.get('name') === layerName);
        if (layer && layer instanceof Layer) {
          layer.setVisible(visibility ? visibility : !layer.getVisible());
          updateLayers();
        } else {
          console.warn(
            `Layer "${layerName}" not found or doesn't support visibility toggling`
          );
        }
      }
    },
    [updateLayers, mapLayers]
  );

  useEffect(() => {
    const setupListeners = () => {
      if (mapRef.current) {
        mapRef.current.getLayers().on('add', updateLayers);
        mapRef.current.getLayers().on('remove', updateLayers);
        mapRef.current.getLayers().on('change', updateLayers);
        updateLayers();
      }
    };

    if (mapRef.current) {
      setupListeners();
    } else {
      const checkInterval = setInterval(() => {
        if (mapRef.current) {
          clearInterval(checkInterval);
          setupListeners();
        }
      }, 100);

      return () => clearInterval(checkInterval);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.getLayers().un('add', updateLayers);
        mapRef.current.getLayers().un('remove', updateLayers);
        mapRef.current.getLayers().un('change', updateLayers);
      }
    };
  }, [mapRef, updateLayers]);

  return { mapLayers, toggleLayerVisibility, toggleLayerVisibilityByName };
};
