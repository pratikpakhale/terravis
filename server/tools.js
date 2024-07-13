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
  show_layers: {
    id: 'show_layers',
    description: 'show all the layers on the map',
    input: {},
  },
  hide_layers: {
    id: 'hide_layers',
    description: 'hide all the layers on the map',
    input: {},
  },
  hide_specific_layer: {
    id: 'hide_specific_layer',
    description: 'hide a specific layer on the map',
    input: {
      layer: {
        type: 'string',
        description: 'The layer to hide',
        enum: ['measurement'],
      },
    },
  },
};
