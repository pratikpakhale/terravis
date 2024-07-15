import { MapAction } from '../hooks/map/mapActions';

/* eslint-disable @typescript-eslint/no-explicit-any */
const actionParser = (action: any): MapAction => {
  let parsedAction;

  try {
    parsedAction = JSON.parse(action);
  } catch (e) {
    console.error('Error parsing transcription:', e);
  }

  switch (parsedAction?.tool) {
    case 'zoom_in':
      return {
        type: 'ZOOM_IN',
      };
    case 'zoom_out':
      return {
        type: 'ZOOM_OUT',
      };
    case 'start_measuring':
      return {
        type: 'START_MEASURE',
      };
    case 'stop_measuring':
      return {
        type: 'STOP_MEASURE',
      };
    case 'clear_measurement':
      return {
        type: 'CLEAR_MEASUREMENTS',
      };
    case 'undo_measurement':
      return {
        type: 'UNDO_MEASUREMENT',
      };
    case 'search':
      return {
        type: 'SEARCH_LOCATION',
        payload: parsedAction?.inputs?.location,
      };
    case 'zoom_in_location':
      return {
        type: 'SEARCH_LOCATION',
        payload: parsedAction?.inputs?.location,
      };
    // case 'show_layers':
    //   return {
    //     type: 'SHOW_LAYERS',
    //   };
    // case 'hide_layers':
    //   return {
    //     type: 'HIDE_LAYERS',
    //   };
    // default:
    //   return {
    //     type: 'UNKNOWN_ACTION',
    //   };
  }
  return {
    type: 'UNKNOWN_ACTION',
  };
};

export default actionParser;
