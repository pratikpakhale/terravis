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
  | 'UNKNOWN_ACTION';

export interface MapAction {
  type: MapActionType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}

export const zoomIn = (): MapAction => ({ type: 'ZOOM_IN' });
export const zoomOut = (): MapAction => ({ type: 'ZOOM_OUT' });
export const setCenter = (lat: number, lon: number): MapAction => ({
  type: 'SET_CENTER',
  payload: { lat, lon },
});
export const setZoom = (zoom: number): MapAction => ({
  type: 'SET_ZOOM',
  payload: zoom,
});

export const toggleMeasure = (): MapAction => ({ type: 'TOGGLE_MEASURE' });

export const searchLocation = (query: string): MapAction => ({
  type: 'SEARCH_LOCATION',
  payload: query,
});
