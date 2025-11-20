import React, { useEffect, useState } from 'react';

const SpeechToText = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  let recognition;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
  } else {
    alert('Speech Recognition not supported in this browser.');
  }

  const startListening = () => {
    if (!SpeechRecognition) return;
    setIsListening(true);
    recognition.start();
  };

  const stopListening = () => {
    if (!SpeechRecognition) return;
    setIsListening(false);
    recognition.stop();
    setTranscript(''); // Clear transcript when stopping
  };

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event) => {
      let current = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        current += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          // If result is final, clear it after showing briefly (optional)
          setTimeout(() => setTranscript(''), 2000); // Clear after 2 seconds
        }
      }
      setTranscript(current); // Only set the current live transcript
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };
  }, [recognition]);

  return (
    <div>
      <h2>Live Speech-to-Text</h2>
      <button onClick={startListening} disabled={isListening}>Start</button>
      <button onClick={stopListening} disabled={!isListening}>Stop</button>
      <p><strong>Current Speech:</strong> {transcript}</p>
    </div>
  );
};

export default SpeechToText;
