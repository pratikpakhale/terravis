import { MapAction } from '../map/mapActions';

function speakWithIndianAccent(text: string) {
  const speech = new SpeechSynthesisUtterance(text);

  const voices = window.speechSynthesis.getVoices();

  const indianVoice = voices.find(
    voice => voice.lang === 'hi-IN' || voice.lang === 'en-IN'
  );

  if (indianVoice) {
    speech.voice = indianVoice;
  } else {
    speech.lang = 'en-GB'; // British English as a fallback
  }

  speech.rate = 1.2;
  speech.pitch = 1;

  window.speechSynthesis.speak(speech);
}

export function dispatcherTTS(action: MapAction) {
  switch (action.type) {
    case 'ZOOM_IN':
      // speakWithIndianAccent('Zooming in');
      break;
    case 'ZOOM_OUT':
      // speakWithIndianAccent('Zooming out');
      break;
    case 'START_MEASURE':
      speakWithIndianAccent('Measurement Started');
      break;
    case 'STOP_MEASURE':
      // speakWithIndianAccent('Stopping measurement');
      break;
    case 'CLEAR_MEASUREMENTS':
      speakWithIndianAccent('measurements cleared');
      break;
    case 'UNDO_MEASUREMENT':
      speakWithIndianAccent('Undoing measurement');
      break;
    case 'SEARCH_LOCATION':
      speakWithIndianAccent('Searching for ' + action.payload);
      break;
    default:
    // speakWithIndianAccent('Unknown action');
  }
}
