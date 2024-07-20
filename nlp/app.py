# app.py

from flask import Flask, request, jsonify
from src.models import NLPModels
from src.nlp_utils import select_tool, extract_entities, process_output

app = Flask(__name__)
nlp_models = NLPModels()

@app.route('/process', methods=['POST'])
def process_input():
    user_input = request.json.get('user_input')
    if not user_input:
        return jsonify({"error": "No user input provided"}), 400

    selected_tool = select_tool(user_input, nlp_models.sentence_transformer)
    if not selected_tool:
        selected_tool = "unknown"
    entities = extract_entities(user_input, nlp_models.nlp)
    output = process_output(selected_tool, entities)

    return jsonify(output)

if __name__ == '__main__':
    app.run(debug=True)
