import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
  Paper,
  Stack,
  Avatar,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

import Lottie from 'lottie-react';
import aiSpeakingAnimation from '../animations/ai-speaking.json'; // adjust path if needed

import './SpeechToSpeechAi.css';

const SpeechToSpeechAiEffects = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

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
          sendToBackend(current);
          setTranscript(current);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech' || event.error === 'network') {
        recognition.stop();
        if (isListening) recognition.start();
      }
    };

    recognition.onend = () => {
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

    if (recognitionRef.current) recognitionRef.current.stop();

    speechSynthesis.speak(utterance);
  };

  const sendToBackend = async (text) => {
    try {
      setIsLoading(true);
      setAiResponse('');
      const response = await axios.post('http://localhost:8080/api/ai/ask', text, {
        headers: { 'Content-Type': 'text/plain' },
      });

      const aiReply = response.data;
      setAiResponse(aiReply);
      speakText(aiReply);
    } catch (error) {
      console.error('Error sending to backend:', error);
      const fallback = 'Sorry, I could not get a response.';
      setAiResponse(fallback);
      speakText(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 4, color: '#102a43' }}>
        🎤 Talk to Your AI Assistant
      </Typography>

      <Box textAlign="center" mb={4}>
        <Avatar
          sx={{
            bgcolor: isListening ? '#e94f37' : '#627d98',
            width: 80,
            height: 80,
            margin: 'auto',
            animation: isListening ? 'pulse 1.2s infinite' : 'none',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          }}
        >
          <MicIcon fontSize="large" />
        </Avatar>
      </Box>

      <Stack direction="row" spacing={2} justifyContent="center" mb={5}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<MicIcon />}
          onClick={startListening}
          disabled={isListening || isLoading}
          sx={{ fontWeight: '600' }}
        >
          Start
        </Button>
        <Button
          variant="contained"
          color="warning"
          startIcon={<StopIcon />}
          onClick={stopListening}
          disabled={!isListening}
          sx={{ fontWeight: '600' }}
        >
          Stop
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<VolumeOffIcon />}
          onClick={stopSpeaking}
          disabled={!isSpeaking}
          sx={{ fontWeight: '600' }}
        >
          Mute
        </Button>
      </Stack>

      <Paper
        elevation={6}
        className="glass-card"
        sx={{
          position: 'relative',
          p: 4,
          minHeight: 220,
          color: '#102a43',
          backdropFilter: 'blur(12px)',
          borderRadius: 3,
          border: '1px solid rgba(255 255 255 / 0.15)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
        }}
      >
        <Typography variant="subtitle1" gutterBottom>
          You said:
        </Typography>
        <Typography variant="body1" sx={{ minHeight: 40, mb: 3, fontSize: '1.1rem', fontWeight: 500 }}>
          {transcript || '...'}
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          AI says:
        </Typography>
        <Typography variant="body1" sx={{ minHeight: 60, fontSize: '1.2rem', fontWeight: 600 }}>
          {isLoading ? '🤖 Thinking...' : aiResponse || '...'}
        </Typography>

       {isSpeaking && !isLoading && (
  <Box
    className="ai-speaking-glass-card"
    sx={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 300,
      height: 300,
      zIndex: 999,
      borderRadius: '20px',
      overflow: 'hidden',
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      animation: 'fadeInScale 0.4s ease-in-out',
    }}
  >
    <Lottie animationData={aiSpeakingAnimation} loop={true} style={{ width: 220, height: 220 }} />
  </Box>
)}

      </Paper>

      {isLoading && (
        <Box mt={4} textAlign="center">
          <CircularProgress color="primary" />
        </Box>
      )}
    </Container>
  );
};

export default SpeechToSpeechAiEffects;
