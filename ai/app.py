from flask import Flask, jsonify, request
from chat import generate
from retrieval import get_context
from utils.config import config

app = Flask(__name__)

@app.route('/generate_response', methods=['POST'])
def generate_response():
    data = request.json
    
    prompt=data['prompt'] 
    schema = data['schema']
    
    response = generate(query = prompt, schema=schema )

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, port=config['ai']['port'], host="0.0.0.0")
