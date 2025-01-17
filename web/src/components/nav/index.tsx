import React, { useState, KeyboardEvent } from 'react';
import {
  Search,
  Layers,
  Ruler,
  Trash2,
  RotateCcw,
  Settings,
  MapPin,
} from 'lucide-react';
import { MapAction, searchLocation } from '../../hooks/map/mapActions';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import BaseLayer from 'ol/layer/Base';
import { SettingsComponent } from '../../hooks/settings';

interface NavbarProps {
  dispatchMapAction: (action: MapAction) => void;
  isMeasuring: boolean;
  mapLayers: {
    [x: string]: BaseLayer;
  };
  toggleLayerVisibility: (layer: BaseLayer) => void;
  removeMeasurement: () => void;
  clearAllMeasurements: () => void;
  toggleMarkerAddition: () => void;
  isAddingMarkers: boolean;
  removeLastMarker: () => void;
  clearAllMarkers: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  dispatchMapAction,
  mapLayers,
  toggleLayerVisibility,
  removeMeasurement,
  clearAllMeasurements,
  isMeasuring,
  toggleMarkerAddition,
  isAddingMarkers,
  removeLastMarker,
  clearAllMarkers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && searchQuery.trim() !== '') {
      dispatchMapAction(searchLocation(searchQuery.trim()));
      setSearchQuery('');
    }
  };

  return (
    <nav className='fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-gray-800 bg-opacity-70 hover:bg-opacity-90 transition-all duration-300'>
      <div className='flex items-center'>
        {/* Search input */}
        <div className='flex items-center bg-gray-700 bg-opacity-50 rounded-full px-3 py-1 mr-4 hover:bg-opacity-70 transition-all duration-300'>
          <Search className='text-gray-300 mr-2' size={18} />
          <input
            type='text'
            placeholder='Search Terravis'
            className='bg-transparent border-none outline-none text-gray-300 placeholder-gray-400 focus:placeholder-gray-200'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyPress={handleSearch}
          />
        </div>

        {/* Tools */}
        <div className='flex space-x-4 justify-center items-center'>
          {/* Layers popover */}
          <Popover>
            <PopoverTrigger>
              <Layers
                className='text-gray-300 hover:text-white cursor-pointer transition-colors duration-300 hover:bg-gray-700 rounded-full ml-1.5'
                size={20}
              />
            </PopoverTrigger>
            <PopoverContent className='mt-3 bg-gray-800 text-white rounded-lg shadow-lg p-4 w-64'>
              <h3 className='text-lg font-semibold mb-3'>
                Map Layers ({Object.keys(mapLayers).length})
              </h3>
              {Object.keys(mapLayers).length === 0 ? (
                <p>No layers available</p>
              ) : (
                <ul className='space-y-2'>
                  {Object.entries(mapLayers).map(([key, layer]) => (
                    <li key={key} className='flex items-center'>
                      <input
                        type='checkbox'
                        id={`layer-${key}`}
                        checked={layer.getVisible()}
                        onChange={() => toggleLayerVisibility(layer)}
                        className='mr-2 form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500'
                      />
                      <label
                        htmlFor={`layer-${key}`}
                        className='cursor-pointer'
                      >
                        {layer.get('name') || key}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </PopoverContent>
          </Popover>

          {/* Measure tool */}
          <div
            className={`flex items-center transition-all duration-300 ${
              isMeasuring
                ? 'bg-blue-600 rounded-full px-3 py-1.5 space-x-3'
                : 'hover:bg-gray-700 rounded-full p-1.5'
            }`}
          >
            <Ruler
              className={`${
                isMeasuring ? 'text-white' : 'text-gray-300'
              } hover:text-white cursor-pointer transition-colors duration-300`}
              size={22}
              onClick={() =>
                dispatchMapAction({
                  type: 'TOGGLE_MEASURE',
                })
              }
            />
            {isMeasuring && (
              <>
                <RotateCcw
                  className='text-white hover:text-gray-200 cursor-pointer'
                  size={18}
                  onClick={removeMeasurement}
                />
                <Trash2
                  className='text-white hover:text-gray-200 cursor-pointer'
                  size={18}
                  onClick={clearAllMeasurements}
                />
              </>
            )}
          </div>

          {/* Marker tool */}
          <div
            className={`flex items-center transition-all duration-300 ${
              isAddingMarkers
                ? 'bg-green-600 rounded-full px-3 py-1.5 space-x-3'
                : 'hover:bg-gray-700 rounded-full p-1.5'
            }`}
          >
            <MapPin
              className={`${
                isAddingMarkers ? 'text-white' : 'text-gray-300'
              } hover:text-white cursor-pointer transition-colors duration-300`}
              size={22}
              onClick={toggleMarkerAddition}
            />
            {isAddingMarkers && (
              <>
                <RotateCcw
                  className='text-white hover:text-gray-200 cursor-pointer'
                  size={18}
                  onClick={removeLastMarker}
                />
                <Trash2
                  className='text-white hover:text-gray-200 cursor-pointer'
                  size={18}
                  onClick={clearAllMarkers}
                />
              </>
            )}
          </div>
        </div>
      </div>
      <div>
        <Popover>
          <PopoverTrigger>
            <Settings
              className='text-gray-100 hover:text-white cursor-pointer transition-colors duration-300'
              size={25}
            />
          </PopoverTrigger>
          <PopoverContent className='m-2'>
            <SettingsComponent />
          </PopoverContent>
        </Popover>
      </div>
    </nav>
  );
};

export default Navbar;
