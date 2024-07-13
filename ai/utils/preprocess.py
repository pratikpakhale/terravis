import json
import re

def extract_json(input_string):
    # If input is already a dictionary, return it as is
    if isinstance(input_string, dict):
        return input_string

    # Try to find a JSON object within the string, including those wrapped in code blocks
    json_pattern = r'```\s*\n?\s*({[\s\S]*?})\s*\n?\s*```|({[\s\S]*?})'
    json_matches = re.findall(json_pattern, input_string)

    for match in json_matches:
        # Check both capture groups
        for potential_json in match:
            if potential_json:
                try:
                    # Attempt to parse the matched string as JSON
                    parsed_json = json.loads(potential_json)
                    if isinstance(parsed_json, dict):
                        return parsed_json
                except json.JSONDecodeError:
                    continue  # If parsing fails, try the next match

    # If no valid JSON object is found, return None
    return None
