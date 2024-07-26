from langchain_ollama import ChatOllama

from utils.config import config
MODEL = config['ai']['ollama_model']


def OllamaLLM():
  llm = ChatOllama(model=MODEL)

  return llm
