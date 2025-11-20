import React, { useState, useEffect } from 'react';

const TextToSpeech = () => {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);

  // Load voices when component mounts
  useEffect(() => {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0]);
      }
    };

    loadVoices();

    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = () => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <textarea
        rows="5"
        cols="60"
        placeholder="Enter text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ marginBottom: '10px', padding: '10px' }}
      />
      <br />

      <label>
        <strong>Voice:</strong>
        <select
          onChange={(e) => setSelectedVoice(voices[e.target.value])}
          style={{ marginLeft: '10px' }}
        >
          {voices.map((voice, index) => (
            <option key={index} value={index}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </label>

      <br /><br />

      <label>
        <strong>Rate:</strong> {rate}
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          style={{ width: '100%' }}
        />
      </label>

      <label>
        <strong>Pitch:</strong> {pitch}
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={pitch}
          onChange={(e) => setPitch(e.target.value)}
          style={{ width: '100%' }}
        />
      </label>

      <br />

      <button onClick={speak} style={{ marginTop: '10px', padding: '10px 20px' }}>
        🔊 Speak
      </button>
    </div>
  );
};

export default TextToSpeech;
