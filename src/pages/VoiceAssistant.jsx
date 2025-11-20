import React, { useEffect, useRef, useState } from 'react';

const VoiceAssistant = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const commandActions = {
    start: () => alert("🟢 Starting process..."),
    stop: () => alert("🔴 Stopping process..."),
    openai: () => alert("🤖 OpenAI command triggered!"),
    hello: () => alert("👋 Hello there!"),
    // Add more commands here...
  };

  const initRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const heard = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log("Heard:", heard);
      setTranscript(heard);

      // Trigger actions for any matching command word
      Object.keys(commandActions).forEach(cmd => {
        if (heard.includes(cmd)) {
          commandActions[cmd]();
        }
      });
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
    };

    recognition.onend = () => {
      if (listening) recognition.start(); // restart if still supposed to be listening
    };

    return recognition;
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
    }

    const recognition = recognitionRef.current;

    if (!listening) {
      recognition.start();
      setListening(true);
    } else {
      recognition.stop();
      setListening(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>🎙️ Voice Assistant</h2>
      <button onClick={toggleListening} style={styles.button}>
        {listening ? "🛑 Stop Listening" : "▶️ Start Listening"}
      </button>

      <div style={styles.transcriptBox}>
        <strong>Heard:</strong> {transcript || <em>Nothing yet...</em>}
      </div>

      <div style={styles.commandsList}>
        <h4>Try saying:</h4>
        <ul>
          {Object.keys(commandActions).map(cmd => (
            <li key={cmd}><code>{cmd}</code></li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    padding: 20,
    maxWidth: 500,
    margin: 'auto',
    border: '1px solid #ccc',
    borderRadius: 10,
    backgroundColor: '#f9f9f9'
  },
  button: {
    fontSize: 16,
    padding: '10px 20px',
    margin: '10px 0',
    cursor: 'pointer'
  },
  transcriptBox: {
    marginTop: 20,
    padding: 10,
    border: '1px dashed #aaa',
    borderRadius: 5,
    backgroundColor: '#fff'
  },
  commandsList: {
    textAlign: 'left',
    marginTop: 20
  }
};

export default VoiceAssistant;
