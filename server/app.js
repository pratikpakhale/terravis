const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

const { transcribe } = require('./lib/transcribe');
const { generateResponse } = require('./lib/chat');
const { schema, generatePrompt } = require('./utils/chat');
const { tools } = require('./tools');

const app = express();
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
  res.sendFile(path.join(__dirname, 'test.html'));
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

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
