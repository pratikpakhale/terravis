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
    case 'start_marker_addition':
      return {
        type: 'START_MARKER_ADDITION',
      };
    case 'stop_marker_addition':
      return {
        type: 'STOP_MARKER_ADDITION',
      };
    case 'clear_markers':
      return {
        type: 'CLEAR_MARKERS',
      };
    case 'undo_marker':
      return {
        type: 'UNDO_MARKERS',
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

    case 'show_layer':
      return {
        type: 'SHOW_LAYER',
        payload: parsedAction?.inputs?.layer,
      };
    case 'hide_layer':
      return {
        type: 'HIDE_LAYER',
        payload: parsedAction?.inputs?.layer,
      };
    case 'unknown':
      return {
        type: 'UNKNOWN_ACTION',
      };
  }
  return {
    type: 'UNKNOWN_ACTION',
  };
};

export default actionParser;
