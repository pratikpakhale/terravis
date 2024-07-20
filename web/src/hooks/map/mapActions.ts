export type MapActionType =
  | 'ZOOM_IN'
  | 'ZOOM_OUT'
  | 'SET_CENTER'
  | 'SET_ZOOM'
  | 'TOGGLE_MEASURE'
  | 'START_MEASURE'
  | 'STOP_MEASURE'
  | 'CLEAR_MEASUREMENTS'
  | 'UNDO_MEASUREMENT'
  | 'SEARCH_LOCATION'
  | 'UNKNOWN_ACTION'
  | 'START_MARKER_ADDITION'
  | 'STOP_MARKER_ADDITION'
  | 'CLEAR_MARKERS'
  | 'UNDO_MARKERS'
  | 'SHOW_LAYER'
  | 'HIDE_LAYER';

export interface MapAction {
  type: MapActionType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}

export const setCenter = (lat: number, lon: number): MapAction => ({
  type: 'SET_CENTER',
  payload: { lat, lon },
});
export const setZoom = (zoom: number): MapAction => ({
  type: 'SET_ZOOM',
  payload: zoom,
});

export const searchLocation = (query: string): MapAction => ({
  type: 'SEARCH_LOCATION',
  payload: query,
});
