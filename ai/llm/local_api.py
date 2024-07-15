import requests

class LocalLLM:
    def __init__(self):
        self.url = "http://127.0.0.1:8080/completion"

    def invoke(self, prompt: str) -> str:
        """
        Makes a synchronous API call to generate text based on the given prompt.
        
        Args:
        prompt (str): The input prompt for text generation.
        
        Returns:
        str: The generated content from the API response.
        """
        payload = {
            "prompt": prompt,
            "n_predict": 512
        }
        
        response = requests.post(self.url, json=payload)
        
        if response.status_code == 200:
            return response.json()['content']
        else:
            return f"Error: {response.status_code}"
