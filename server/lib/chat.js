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

async function generateNLPResponse(prompt) {
  try {
    const response = await axios.post('http://localhost:5000/process', {
      user_input: prompt,
    });

    let data = response.data;

    let nlpResponse = {
      tool: data.tool,
    };

    if (data?.entities && data.entities.length > 0) {
      nlpResponse.inputs = {
        location: data.entities[0][0],
      };
      nlpResponse.tool =
        nlpResponse.tool === 'search' ? 'search' : 'zoom_in_location';
    }

    return nlpResponse;
  } catch (error) {
    console.error('Error in NLP Model');
  }
}

module.exports = { generateResponse, generateNLPResponse };
