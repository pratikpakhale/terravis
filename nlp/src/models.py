from sentence_transformers import SentenceTransformer
import spacy
from config import Config

class NLPModels:
    def __init__(self):
        self.sentence_transformer = SentenceTransformer(Config.SENTENCE_TRANSFORMER_MODEL)
        self.nlp = spacy.load(Config.SPACY_MODEL)
