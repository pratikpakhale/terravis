const axios = require('axios');

async function generateResponse(prompt, schema) {
  try {
    const response = await axios.post(
      'http://localhost:8000/generate_response',
      {
        prompt: prompt,
        schema: schema,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error in LLM');
  }
}

module.exports = { generateResponse };
