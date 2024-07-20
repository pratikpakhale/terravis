# tools.py

from enum import Enum

class Layer(Enum):
    OPENSTREETMAP = "OpenStreetMap"
    MEASURES = "Measures"
    MARKERS = "Markers"
    SEARCH = "Search Results"

tool_descriptions = {
    "zoom_in": "Zoom In - Increase map magnification, show more detail",
    "zoom_out": "Zoom Out - Decrease map magnification, show wider area",
    "zoom_in_location": "Zoom on Location - Focus and magnify specific location on map",
    "start_measuring": "Start measuring - Begin drawing lines to measure distances on map",
    "stop_measuring": "Stop / End distance measurement, return to normal map interaction",
    "undo_measurement": "Undo Measurement - Remove last segment of current distance measurement",
    "clear_measurement": "Clear Measurements - Remove all distance measurements from map",
    "search": "Search - Find and highlight specific location or point of interest",
    "start_marker_addition": "Start Marker Addition - Begin adding location markers to map",
    "stop_marker_addition": "Stop Marker Addition - End marker addition process",
    "undo_marker": "Undo Marker - Remove most recently added location marker",
    "clear_markers": "Clear Markers -  Remove all user-added location markers from map",
    "show_layer": "Show Layer - Display a specific map layer",
    "hide_layer": "Hide Layer - Hide a specific map layer"
}

layer_descriptions = {layer.value: f"show hide {layer.value} layer" for layer in Layer}
