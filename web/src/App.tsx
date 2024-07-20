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
    toggleMarkerAddition,
    isAddingMarkers,
    removeLastMarker,
    clearAllMarkers,
  } = useMap();

  const [transcription, setTranscription] = React.useState<string>(
    'voice transcription will be displayed here.'
  );
  const [action, setAction] = React.useState<string>('start');

  const handleTranscriptionComplete = (
    action: string,
    transcription: string
  ) => {
    dispatchMapAction(actionParser(action));
    try {
      setAction(JSON.parse(action)?.tool);
    } catch (e) {
      /// do nothing
    }
    setTranscription(transcription);
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
        toggleMarkerAddition={toggleMarkerAddition}
        isAddingMarkers={isAddingMarkers}
        removeLastMarker={removeLastMarker}
        clearAllMarkers={clearAllMarkers}
      />

      <div className='flex-grow w-full' ref={mapRef} tabIndex={0}>
        {!mapInstance && <p>Loading map...</p>}
      </div>
      <Footer
        coordinates={mapState.coordinates}
        loadPercentage={mapState.loadPercentage}
        onZoomIn={() => dispatchMapAction({ type: 'ZOOM_IN' })}
        onZoomOut={() => dispatchMapAction({ type: 'ZOOM_OUT' })}
        onTranscriptionComplete={handleTranscriptionComplete}
        mapContainerRef={mapRef}
        action={action}
        transcription={transcription}
      />
    </main>
  );
};

export default App;
