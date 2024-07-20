/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useCallback, useState } from 'react';
import Map from 'ol/Map';
import Draw from 'ol/interaction/Draw';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { getLength } from 'ol/sphere';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Overlay from 'ol/Overlay';
import Feature from 'ol/Feature';
import { unByKey } from 'ol/Observable';

const MEASUREMENT_COLOR = 'rgba(255, 165, 0, 0.7)';

const useMeasurement = (mapInstance: React.MutableRefObject<Map | null>) => {
  const measureLayer = useRef<any>(null);
  const draw = useRef<Draw | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const tooltips = useRef<Overlay[]>([]);
  const features = useRef<Feature[]>([]);

  const createTooltip = () => {
    const element = document.createElement('div');
    element.className = 'ol-tooltip ol-tooltip-measure';
    const tooltip = new Overlay({
      element: element,
      offset: [0, -15],
      positioning: 'bottom-center',
    });
    tooltips.current.push(tooltip);
    return tooltip;
  };

  const setupMeasurement = useCallback(() => {
    if (!mapInstance.current) return;

    const source = new VectorSource();
    measureLayer.current = new VectorLayer({
      source: source,
      style: new Style({
        stroke: new Stroke({ color: MEASUREMENT_COLOR, width: 3 }),
        image: new Circle({
          radius: 7,
          fill: new Fill({ color: MEASUREMENT_COLOR }),
        }),
      }),
      properties: {
        name: 'Measures',
      },
    });

    const originalSetVisible = measureLayer.current.setVisible;
    measureLayer.current.setVisible = function (visible: boolean) {
      originalSetVisible.call(this, visible);
      tooltips.current.forEach(tooltip => {
        const element = tooltip.getElement();
        if (element) {
          element.style.display = visible ? 'block' : 'none';
        }
      });
    };

    mapInstance.current.addLayer(measureLayer.current);

    draw.current = new Draw({
      source: source,
      type: 'LineString',
      style: new Style({
        stroke: new Stroke({ color: MEASUREMENT_COLOR, width: 3 }),
        image: new Circle({
          radius: 7,
          fill: new Fill({ color: MEASUREMENT_COLOR }),
        }),
      }),
    });

    draw.current.on('drawstart', (event: { feature: Feature }) => {
      const tooltipOverlay = createTooltip();
      mapInstance.current!.addOverlay(tooltipOverlay);

      const listener = event.feature
        .getGeometry()!
        .on('change', (evt: { target: any }) => {
          const geom = evt.target;
          const length = getLength(geom);
          const output = `${(length / 1000).toFixed(2)} km`;
          tooltipOverlay.getElement()!.innerHTML = output;
          tooltipOverlay.setPosition(geom.getLastCoordinate());
        });

      event.feature.set('tooltip', tooltipOverlay);
      event.feature.set('listener', listener);
    });

    draw.current.on('drawend', (event: { feature: Feature }) => {
      const tooltipOverlay = event.feature.get('tooltip');
      if (tooltipOverlay && tooltipOverlay.getElement()) {
        tooltipOverlay.getElement()!.className = 'ol-tooltip ol-tooltip-static';
        tooltipOverlay.setOffset([0, -7]);
      }
      unByKey(event.feature.get('listener'));
      features.current.push(event.feature);
      // Continue measuring by not removing the interaction
    });
  }, [mapInstance]);

  const startMeasuring = useCallback(() => {
    if (!mapInstance.current) return;
    if (!measureLayer.current) {
      setupMeasurement();
    }

    mapInstance.current!.addInteraction(draw.current!);
    mapInstance.current!.getViewport().style.cursor = `none`;
    setIsMeasuring(true);
  }, [mapInstance, setupMeasurement]);

  const stopMeasuring = useCallback(() => {
    if (!mapInstance.current) return;
    if (!measureLayer.current) return;

    mapInstance.current!.removeInteraction(draw.current!);
    mapInstance.current!.getViewport().style.cursor = 'default';
    setIsMeasuring(false);
  }, [mapInstance]);

  const toggleMeasurement = useCallback(() => {
    if (!mapInstance.current) return;
    if (!measureLayer.current) {
      setupMeasurement();
    }

    setIsMeasuring(prev => {
      if (prev) {
        mapInstance.current!.removeInteraction(draw.current!);
        mapInstance.current!.getViewport().style.cursor = 'default';
      } else {
        mapInstance.current!.addInteraction(draw.current!);
        // mapInstance.current!.getViewport().style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="7" fill="${encodeURIComponent(
        //   MEASUREMENT_COLOR
        // )}"/></svg>') 10 10, auto`;
        mapInstance.current!.getViewport().style.cursor = `none`;
      }
      return !prev;
    });
  }, [mapInstance, setupMeasurement]);

  const removeMeasurement = useCallback(() => {
    if (measureLayer.current && mapInstance.current) {
      if (features.current.length > 0) {
        const lastFeature = features.current.pop();
        measureLayer.current.getSource()?.removeFeature(lastFeature!);

        const lastTooltip = tooltips.current.pop();
        if (lastTooltip) {
          mapInstance.current.removeOverlay(lastTooltip);
        }
      }
    }
  }, [mapInstance]);

  const clearAllMeasurements = useCallback(() => {
    if (measureLayer.current && mapInstance.current) {
      measureLayer.current.getSource()?.clear();
      tooltips.current.forEach(tooltip => {
        mapInstance.current!.removeOverlay(tooltip);
      });
      tooltips.current = [];
      features.current = [];
    }
  }, [mapInstance]);

  return {
    toggleMeasurement,
    isMeasuring,
    removeMeasurement,
    clearAllMeasurements,
    startMeasuring,
    stopMeasuring,
  };
};

export default useMeasurement;
