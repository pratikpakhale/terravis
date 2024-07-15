import json
import re

def extract_json(input_string):
    # If input is already a dictionary, return it as is
    if isinstance(input_string, dict):
        return input_string

    # Pattern to match text including and inside curly braces
    json_pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'
    json_matches = re.findall(json_pattern, input_string)

    for potential_json in json_matches:
        try:
            # Attempt to parse the matched string as JSON
            parsed_json = json.loads(potential_json)
            if isinstance(parsed_json, dict):
                return parsed_json
        except json.JSONDecodeError:
            continue  # If parsing fails, try the next match

    # If no valid JSON object is found, return None
    return None
