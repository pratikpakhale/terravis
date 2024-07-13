const path = require('path');
const { whisper } = require(path.join(
  __dirname,
  '../whisper.cpp/build/Release/addon.node'
));
const { promisify } = require('util');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const whisperAsync = promisify(whisper);

const whisperParams = {
  language: 'en',
  model: path.join(__dirname, '../whisper.cpp/models/ggml-base.en.bin'),
  use_gpu: true,
  flash_attn: false,
  no_prints: true,
  comma_in_time: false,
  translate: true,
  no_timestamps: false,
  audio_ctx: 0,
};

async function transcribe(audioBuffer) {
  const inputPath = path.join(__dirname, `temp_input_${uuidv4()}.wav`);
  const outputPath = path.join(__dirname, `temp_output_${uuidv4()}.wav`);

  fs.writeFileSync(inputPath, audioBuffer);

  try {
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions('-ar 16000')
        .outputOptions('-ac 1')
        .outputOptions('-c:a pcm_s16le')
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  } catch (e) {
    console.log(e);
  }

  whisperParams.fname_inp = outputPath;

  const result = await whisperAsync(whisperParams);

  let text = result.map(element => element[element.length - 1]).join('');

  fs.unlinkSync(inputPath);
  fs.unlinkSync(outputPath);

  return text;
}

module.exports = { transcribe };
