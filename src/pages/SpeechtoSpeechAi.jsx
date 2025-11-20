import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const SpeechToSpeechAi = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let current = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        current += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          sendToBackend(current);         // Send final result to backend
          setTranscript(current);         // Display the final transcript
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      // Restart on network or no-speech errors
      if (event.error === 'no-speech' || event.error === 'network') {
        recognition.stop();
        if (isListening) recognition.start();
      }
    };

    recognition.onend = () => {
      // Resume recognition if still listening
      if (isListening && !isSpeaking) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
  }, [isListening, isSpeaking]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setTranscript('');
    }
  };

  const stopSpeaking = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakText = (text) => {
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (isListening && recognitionRef.current) {
        recognitionRef.current.start();
      }
    };

    // Stop recognition while speaking to avoid conflicts
    if (recognitionRef.current) recognitionRef.current.stop();

    speechSynthesis.speak(utterance);
  };

  const sendToBackend = async (text) => {
    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:8080/api/ai/ask', text, {
        headers: {
          'Content-Type': 'text/plain',
        },
      });

      const aiReply = response.data;
      speakText(aiReply);
    } catch (error) {
      console.error('Error sending to backend:', error);
      speakText('Sorry, I could not get a response.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>🗣️ Speak to AI</h2>

      <button onClick={startListening} disabled={isListening || isLoading}>
        ▶️ Start Listening
      </button>
      <button onClick={stopListening} disabled={!isListening}>
        ⏹ Stop Listening
      </button>
      <button onClick={stopSpeaking} disabled={!isSpeaking}>
        🔇 Stop Speaking
      </button>

      <p><strong>Transcript:</strong> {transcript}</p>
      {isLoading && <p>🤖 Waiting for AI response...</p>}
    </div>
  );
};

export default SpeechToSpeechAi;
