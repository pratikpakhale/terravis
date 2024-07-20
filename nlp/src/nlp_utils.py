from sentence_transformers import util
from .tools import tool_descriptions, layer_descriptions, Layer
from config import Config

def select_tool_and_layer(user_input, sentence_transformer):
    # Combine tool and layer descriptions
    all_descriptions = {**tool_descriptions, **layer_descriptions}
    
    # Encode all descriptions
    all_embeddings = {key: sentence_transformer.encode(desc) for key, desc in all_descriptions.items()}

    # Encode user input
    input_embedding = sentence_transformer.encode(user_input)

    # Calculate cosine similarity between user input and all descriptions
    similarities = {key: util.cos_sim(input_embedding, emb) for key, emb in all_embeddings.items()}

    # Filter out items with similarity below threshold
    similarities = {key: similarity for key, similarity in similarities.items() if similarity > Config.SIMILARITY_THRESHOLD}

    # If similarities is empty, return None
    if not similarities:
        return None, None

    # Get the key with highest similarity
    best_match = max(similarities, key=similarities.get)

    # Determine if it's a tool or a layer
    if best_match in tool_descriptions:
        return best_match, None
    else:
        return "show_layer" if "show" in user_input.lower() else "hide_layer", best_match

def extract_entities(text, nlp):
    doc = nlp(text)
    return [(ent.text, ent.label_) for ent in doc.ents]

def process_output(selected_tool, selected_layer, entities):
    
    output = {
        "tool": selected_tool,
        "layer": selected_layer,
        "entities": entities
    }
    return output
