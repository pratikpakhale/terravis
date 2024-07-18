# nlp_utils.py

from sentence_transformers import util
from .tools import tool_descriptions

def select_tool(user_input, sentence_transformer):
    tool_embeddings = {tool: sentence_transformer.encode(desc) for tool, desc in tool_descriptions.items()}
    input_embedding = sentence_transformer.encode(user_input)
    similarities = {tool: util.cos_sim(input_embedding, tool_emb) for tool, tool_emb in tool_embeddings.items()}
    return max(similarities, key=similarities.get)

def extract_entities(text, nlp):
    doc = nlp(text)
    return [(ent.text, ent.label_) for ent in doc.ents ]

def process_output(selected_tool, entities):
    output = {
        "tool": selected_tool,
        "entities": entities
    }
    return output
