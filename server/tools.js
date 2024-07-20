exports.tools = {
  zoom_in: {
    id: 'zoom_in',
    description: 'This tool zooms in on the map',
    input: {},
  },
  zoom_out: {
    id: 'zoom_out',
    description: 'This tool zooms out on the map',
    input: {},
  },
  zoom_in_location: {
    id: 'zoom_in_location',
    description: 'This tool zooms in on the map to a specific location',
    input: {
      location: {
        type: 'string',
        description: 'The location (place) to zoom in on',
      },
    },
  },
  start_measuring: {
    id: 'start_measuring',
    description:
      'start the measuring scale on the map which measures distance between two points',
    input: {},
  },
  stop_measuring: {
    id: 'stop_measuring',
    description: 'stop the measuring scale on the map',
    input: {},
  },
  undo_measurement: {
    id: 'undo_measurement',
    description: 'undo the last measurement',
    input: {},
  },
  clear_measurement: {
    id: 'clear_measurement',
    description: 'clear all measurements',
    input: {},
  },
  start_marker_addition: {
    id: 'start_marker_addition',
    description: 'start adding markers to the map',
    input: {},
  },
  stop_marker_addition: {
    id: 'stop_marker_addition',
    description: 'stop adding markers to the map',
    input: {},
  },
  undo_marker: {
    id: 'undo_marker',
    description: 'undo the last marker addition',
    input: {},
  },
  clear_markers: {
    id: 'clear_markers',
    description: 'clear all markers',
    input: {},
  },
  search: {
    id: 'search',
    description: 'This tool searches for a specific location on the map',
    input: {
      location: {
        type: 'string',
        description: 'The location (place) to search for',
      },
    },
  },
  show_layer: {
    id: 'show_layers',
    description: 'show layers on the map',
    input: {
      layer: {
        type: 'string',
        description:
          'The layer to show enum - `OpenStreetMap|Search Results|Measures|Markers`',
      },
    },
  },
  hide_layer: {
    id: 'hide_layer',
    description: 'hide layers on the map',
    input: {
      layer: {
        type: 'string',
        description:
          'The layer to hide enum - `OpenStreetMap|Search Results|Measures|Markers`',
      },
    },
  },
};
