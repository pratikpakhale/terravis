const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const { transcribe } = require('./lib/transcribe');
const { generateResponse, generateNLPResponse } = require('./lib/chat');
const { schema, generatePrompt } = require('./utils/chat');
const { tools } = require('./tools');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Replace with your client's origin
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: '*',
  },
});
const port = 3000;

app.use(
  cors({
    origin: 'http://localhost:5173', // Replace with your client's origin

    credentials: true,
  })
);

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
  res.redirect('/socket');
});

app.get('/http', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'http_client.html'));
});

app.get('/socket', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'socket_client.html'));
});

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No audio file uploaded');
  }
  let t = Date.now();
  try {
    const text = await transcribe(req.file.buffer);
    const ai = req.body.ai;
    console.log('Transcription Time: ', Date.now() - t);
    console.log(ai, text);
    const response =
      ai === 'NLP'
        ? await generateNLPResponse(text)
        : await generateResponse(generatePrompt(text, tools), schema);

    console.log(JSON.stringify(response));
    console.log(`${ai} Response Time: `, Date.now() - t);
    res.json({ action: JSON.stringify(response), transription: text });
  } catch (error) {
    console.error('Error during transcription:', error);
    res.status(500).send('Error during transcription');
  }
});

// Socket.IO integration
const RESEND_TIMEOUT = 650; // 250ms timeout for resending actions
const MAX_RETRIES = 3;

io.on('connection', socket => {
  let audioBuffer = Buffer.alloc(0);
  const chunkSize = 32000;
  let accumulatedText = '';
  const pendingActions = new Map(); // Map to store pending actions

  const sendAction = (action, retries = 0) => {
    const actionId = Date.now().toString(); // Use timestamp as a simple unique ID
    pendingActions.set(actionId, { action, retries });

    socket.emit('action', { id: actionId, data: JSON.stringify(action) });

    // Set up resend timeout
    setTimeout(() => {
      if (pendingActions.has(actionId)) {
        if (retries < MAX_RETRIES) {
          console.log(`Resending action ${actionId}, attempt ${retries + 1}`);
          sendAction(action, retries + 1);
        } else {
          console.error(`Max retries reached for action ${actionId}`);
          pendingActions.delete(actionId);
        }
      }
    }, RESEND_TIMEOUT);
  };

  socket.on('action_ack', actionId => {
    if (pendingActions.has(actionId)) {
      console.log(`Action ${actionId} acknowledged`);
      pendingActions.delete(actionId);
    }
  });

  socket.on('audio', async ({ blob, ai }) => {
    if (blob instanceof Buffer) {
      audioBuffer = Buffer.concat([audioBuffer, blob]);

      if (audioBuffer.length >= chunkSize) {
        const audioToProcess = audioBuffer;
        audioBuffer = Buffer.alloc(0);

        let retries = 0;
        while (retries < MAX_RETRIES) {
          try {
            // console.log('Processing audio chunk...');
            const text = await transcribe(audioToProcess);

            if (text?.trim()) {
              accumulatedText += text + ' ';

              if (accumulatedText.match(/[.!?]\s*$/)) {
                console.log(
                  `Making ${ai} request for accumulated text:`,
                  accumulatedText
                );
                const response =
                  ai === 'LLM'
                    ? await generateResponse(
                        generatePrompt(accumulatedText.trim(), tools),
                        schema
                      )
                    : await generateNLPResponse(accumulatedText.trim());
                console.log(response);
                console.log(`${ai} Response:`, response);
                sendAction(response);
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

  socket.on('disconnect', () => {
    // console.log('Client disconnected');
    // Process any remaining accumulated text when the connection closes
    if (accumulatedText.trim()) {
      generateResponse(generatePrompt(accumulatedText.trim(), tools), schema)
        .then(response => {
          console.log('Final LLM Response:', response);
          socket.emit('action', JSON.stringify(response));
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
