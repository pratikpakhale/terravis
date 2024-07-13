import React from 'react';
import Navbar from './components/nav';
import Footer from './components/footer';
import useMap from './hooks/map';

import actionParser from './lib/actionParser';

const App: React.FC = () => {
  const {
    mapRef,
    mapState,
    dispatchMapAction,
    mapInstance,
    mapLayers,
    toggleLayerVisibility,
    removeMeasurement,
    clearAllMeasurements,
    isRulerMeasuring,
  } = useMap();

  const handleTranscriptionComplete = (action: string) => {
    dispatchMapAction(actionParser(action));
  };

  return (
    <main className='h-screen w-full flex flex-col relative'>
      <Navbar
        dispatchMapAction={dispatchMapAction}
        isMeasuring={isRulerMeasuring}
        mapLayers={mapLayers}
        toggleLayerVisibility={toggleLayerVisibility}
        removeMeasurement={removeMeasurement}
        clearAllMeasurements={clearAllMeasurements}
      />

      <div className='flex-grow w-full' ref={mapRef}>
        {!mapInstance && <p>Loading map...</p>}
      </div>
      <Footer
        coordinates={mapState.coordinates}
        loadPercentage={mapState.loadPercentage}
        onZoomIn={() => dispatchMapAction({ type: 'ZOOM_IN' })}
        onZoomOut={() => dispatchMapAction({ type: 'ZOOM_OUT' })}
        onTranscriptionComplete={handleTranscriptionComplete}
      />
    </main>
  );
};

export default App;
