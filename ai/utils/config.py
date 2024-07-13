import os
import json

with open(os.path.abspath(os.getcwd() + '/config.json'), 'r') as f:
  config = json.load(f)