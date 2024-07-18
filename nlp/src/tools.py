# tools.py

tool_descriptions = {
    "zoom_in": "This tool zooms in on the map",
    "zoom_out": "This tool zooms out on the map",
    "zoom_in_location": "This tool zooms in on the map to a specific location",
    "start_measuring": "Start the measuring scale on the map which measures distance between two points",
    "stop_measuring": "Stop the measuring scale on the map",
    "undo_measurement": "Undo the last measurement",
    "clear_measurement": "Clear all measurements",
    "search": "This tool searches for a specific location on the map"
}

# Additional metadata for tools that require input
tool_inputs = {
    "zoom_in_location": {
        "location": {
            "type": "string",
            "description": "The location (place) to zoom in on"
        }
    },
    "search": {
        "location": {
            "type": "string",
            "description": "The location (place) to search for"
        }
    }
}
