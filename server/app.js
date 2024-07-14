const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const { transcribe } = require('./lib/transcribe');
const { generateResponse } = require('./lib/chat');
const { schema, generatePrompt } = require('./utils/chat');
const { tools } = require('./tools');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = 3000;

app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  },
});

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.redirect('/ws');
});

app.get('/http', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'http_client.html'));
});

app.get('/ws', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'websocket_client.html'));
});

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No audio file uploaded');
  }
  let t = Date.now();
  try {
    const text = await transcribe(req.file.buffer);
    console.log('Transcription Time: ', Date.now() - t);
    const response = await generateResponse(
      generatePrompt(text, tools),
      schema
    );
    console.log('LLM Response Time: ', Date.now() - t);
    res.json({ action: JSON.stringify(response), transription: text });
  } catch (error) {
    console.error('Error during transcription:', error);
    res.status(500).send('Error during transcription');
  }
});

// WebSocket integration
const MAX_RETRIES = 3;

wss.on('connection', ws => {
  // console.log('Client connected');
  let audioBuffer = Buffer.alloc(0);
  const chunkSize = 32000;
  let accumulatedText = '';

  ws.on('message', async message => {
    if (message instanceof Buffer) {
      audioBuffer = Buffer.concat([audioBuffer, message]);

      if (audioBuffer.length >= chunkSize) {
        const audioToProcess = audioBuffer;
        audioBuffer = Buffer.alloc(0);

        let retries = 0;
        while (retries < MAX_RETRIES) {
          try {
            console.log('Processing audio chunk...');
            const text = await transcribe(audioToProcess);

            if (text?.trim()) {
              accumulatedText += text + ' ';

              if (accumulatedText.match(/[.!?]\s*$/)) {
                console.log(
                  'Making LLM request for accumulated text:',
                  accumulatedText
                );
                const response = await generateResponse(
                  generatePrompt(accumulatedText.trim(), tools),
                  schema
                );
                console.log('LLM Response:', response);
                ws.send(
                  JSON.stringify({
                    type: 'action',
                    data: JSON.stringify(response),
                  })
                );
                accumulatedText = '';
              }
            }
            break; // Success, exit the retry loop
          } catch (error) {
            console.error(
              `Transcription attempt ${retries + 1} failed:`,
              error
            );
            retries++;
            if (retries >= MAX_RETRIES) {
              console.error('Max retries reached. Skipping this audio chunk.');
            }
          }
        }
      }
    }
  });

  ws.on('close', () => {
    // console.log('Client disconnected');
    // Process any remaining accumulated text when the connection closes
    if (accumulatedText.trim()) {
      generateResponse(generatePrompt(accumulatedText.trim(), tools), schema)
        .then(response => {
          console.log('Final LLM Response:', response);
          ws.send(JSON.stringify({ type: 'action', data: response }));
        })
        .catch(error => {
          console.error('Error during final LLM response:', error);
        });
    }
  });
});

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
