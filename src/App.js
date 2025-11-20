import logo from './logo.svg';
import './App.css';
import TextToSpeech from './pages/TextToSpeech';
import SpeechToText from './pages/SpeechToText';
import SpeechToSpeech from './pages/SpeechTospeech';
import SpeechToSpeechAi from './pages/SpeechtoSpeechAi';
import SpeechToSpeechAiEffects from './pages/SpeechToSpeechAiEffects';
import VoiceAssistant from './pages/VoiceAssistant';
import PDFReader from './pages/PDFReader';
import YouTubeTracker from './pages/YouTubeTracker';
import YouTubeTracker2 from './pages/YouTubeTracker2';

function App() {

  

  return (
    <div className="App" style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Text to Speech Converter</h1>
     <SpeechToSpeechAiEffects/> 
      {/* <VoiceAssistant/> */}
       <h2 style={{ textAlign: 'center' }}>📄 Local PDF Viewer</h2>
      {/* <PDFReader fileUrl="/sample1.pdf" /> */}
       {/* <YouTubeTracker videoUrl="https://www.youtube.com/watch?v=A0pu92-pYhE&ab_channel=Telusko" /> */}
       {/* <YouTubeTracker2 videoUrl="https://www.youtube.com/watch?v=A0pu92-pYhE&ab_channel=Telusko" /> */}


    </div>
  );
}

export default App;
