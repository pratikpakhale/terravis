const schema = `{
  "tool": {
    "type": "string",
    "value": "the ID of the selected tool"
  },
  "inputs": {
    "type": "object",
    "value": "the values for the selected tool (if any) and in the same input format of the tool"
  }
}`;

function generatePrompt(userInput, tools) {
  const toolDescriptions = Object.values(tools)
    .map(
      tool => `
    ID: ${tool.id}
    Description: ${tool.description}
    Input: ${JSON.stringify(tool.input)}
  `
    )
    .join('\n');

  return `
    Select the most appropriate tool for this task based on the user input and provide the necessary inputs.

    User Input: ${userInput}

    Available Tools:
    ${toolDescriptions}
    

    Strictly respond in JSON only and in the given schema instructions -

  `;
}

module.exports = { schema, generatePrompt };
