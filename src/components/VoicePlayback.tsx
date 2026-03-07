import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { generateSpeech } from '../services/ttsService';

interface VoicePlaybackProps {
  text: string;
  language?: string;
}

export const VoicePlayback: React.FC<VoicePlaybackProps> = ({ text, language = 'en' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (language !== 'ta') {
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, [language]);

  useEffect(() => {
    if (!text) return;

    if (language === 'ta') {
      // For Tamil, we will generate audio via API when play is clicked
      // to avoid unnecessary API calls on every text change
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    } else {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const targetLang = language === 'hi' ? 'hi-IN' : language === 'es' ? 'es-ES' : 'en-US';
      u.lang = targetLang;
      u.rate = speed;
      
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang === targetLang) || voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
      if (voice) u.voice = voice;

      u.onend = () => setIsPlaying(false);
      u.onerror = (event) => {
        console.error("SpeechSynthesisUtterance error", event);
        setIsPlaying(false);
      };
      setUtterance(u);
    }

    return () => {
      window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [text, language, speed]);

  const togglePlay = async () => {
    if (isPlaying) {
      if (language === 'ta' && audioRef.current) {
        audioRef.current.pause();
      } else {
        window.speechSynthesis.pause();
      }
      setIsPlaying(false);
      return;
    }

    if (language === 'ta') {
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        setIsLoading(true);
        const audioUrl = await generateSpeech(text, 'ta');
        setIsLoading(false);
        
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          audio.playbackRate = speed;
          audio.onended = () => setIsPlaying(false);
          audio.onerror = () => {
            setIsPlaying(false);
            URL.revokeObjectURL(audioUrl);
          };
          audioRef.current = audio;
          audio.play();
          setIsPlaying(true);
        }
      }
    } else {
      if (window.speechSynthesis.paused && utterance) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else if (utterance) {
        window.speechSynthesis.cancel();
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
          setIsPlaying(true);
        }, 50);
      }
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  return (
    <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded-full px-4">
      <button
        onClick={togglePlay}
        disabled={isLoading}
        className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 transition-colors relative disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : isPlaying ? (
          <Pause size={18} />
        ) : (
          <Play size={18} />
        )}
        {isPlaying && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute inset-0 bg-indigo-500 rounded-full -z-10"
          />
        )}
      </button>
      
      {isPlaying && (
        <div className="flex items-center gap-1 h-3">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{ height: [4, 12, 4] }}
              transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
              className="w-0.5 bg-indigo-400 rounded-full"
            />
          ))}
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <Volume2 size={16} className="text-white/60" />
        <select
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="bg-transparent text-xs border-none focus:ring-0 cursor-pointer"
        >
          <option value="0.5">0.5x</option>
          <option value="1">1.0x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2.0x</option>
        </select>
      </div>
    </div>
  );
};
