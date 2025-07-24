import { useState, useCallback, useRef } from "react";

export function useTTS() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  if (typeof window !== 'undefined' && !synthRef.current) {
    synthRef.current = window.speechSynthesis;
  }

  const speak = useCallback((text: string) => {
    if (!synthRef.current || !isEnabled) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = 0.8; // Slightly slower for better comprehension
    utterance.pitch = 1.1; // Slightly higher pitch for friendliness
    utterance.volume = 0.8;

    // Try to use a child-friendly voice if available
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Woman') ||
      voice.name.includes('Child')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, [isEnabled]);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const toggle = useCallback(() => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    
    if (!newState) {
      stop(); // Stop speaking when disabled
    }
    
    return newState;
  }, [isEnabled, stop]);

  return {
    isEnabled,
    isSpeaking,
    speak,
    stop,
    toggle
  };
}
