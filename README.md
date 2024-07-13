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
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp
bash ./models/download-ggml-model.sh base.en
make
(cd examples/addon.node && npm install)
# go to server root (cd server/)
npx cmake-js compile -T addon.node -B Release
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
