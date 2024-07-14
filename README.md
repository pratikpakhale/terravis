Follow these steps to setup the project (Linux). For windows, figure it out yourself.

## WEB

```bash
cd web
npm ci
npm run dev
```

## Server

```bash
cd server
git submodule init && git submodule update --recursive  # clone the submodules
# if the above command doesn't work then do this - `git clone https://github.com/ggerganov/whisper.cpp`
cd whisper.cpp
bash ./models/download-ggml-model.sh tiny.en
make
cd examples/addon.node && npm install
# go to server root (cd server/)
npx cmake-js compile -T addon.node -B Release
# if you have gpu then, npx cmake-js compile --GGML_CUDA=1 -T whisper-addon -B Release
npm ci
node --watch app.js
```

## AI

```bash
cd ai
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
# rename env.template as .env and add groq api key
python3 app.py
```
