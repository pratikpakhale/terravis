from sentence_transformers import util
from .tools import tool_descriptions
from config import Config

def select_tool(user_input, sentence_transformer):
    # Encode tool descriptions
    tool_embeddings = {tool: sentence_transformer.encode(desc) for tool, desc in tool_descriptions.items()}

    # Encode user input
    input_embedding = sentence_transformer.encode(user_input)

    # Calculate cosine similarity between user input and tool descriptions
    similarities = {tool: util.cos_sim(input_embedding, tool_emb) for tool, tool_emb in tool_embeddings.items()}

    # Filter out tools with similarity below threshold
    similarities = {tool: similarity for tool, similarity in similarities.items() if similarity > Config.SIMILARITY_THRESHOLD}

    # if similarities is empty, return None
    if not similarities:
        return None

    # Return tool with highest similarity
    return max(similarities, key=similarities.get)

def extract_entities(text, nlp):
    doc = nlp(text)
    return [(ent.text, ent.label_) for ent in doc.ents]

def process_output(selected_tool, entities):
    output = {
        "tool": selected_tool,
        "entities": entities
    }
    return output
