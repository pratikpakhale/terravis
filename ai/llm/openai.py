import os
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())

from utils.config import config

from langchain_openai import  ChatOpenAI


OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

if config['ai']['openai_model']:
  MODEL = config['ai']['openai_model']
else:
  MODEL = 'gpt-4o'

def OpenAILLM():
  llm = ChatOpenAI(model=MODEL, api_key=OPENAI_API_KEY  )
  return llm