import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot, User, Sparkles, Loader2, Mic, MicOff } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  moduleTitle: string;
  moduleContent: string;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ isOpen, onClose, moduleTitle, moduleContent }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Hi! I'm your AI learning assistant. I've analyzed the module "${moduleTitle}". How can I help you understand it better?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
        setInterimTranscript(currentInterim);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'network') {
          setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble with the microphone connection. Please check your internet or try typing instead." }]);
        }
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInterimTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, apiVersion: "v1beta" });
      const modelName = "gemini-2.5-flash-lite";
      
      const chat = ai.chats.create({
        model: modelName,
        config: {
          systemInstruction: `You are a helpful AI tutor for a learning platform. 
          The student is currently learning about "${moduleTitle}".
          Here is the module content for context:
          ${moduleContent}
          
          Answer the student's questions clearly and concisely. If they ask something outside the scope of the module, try to relate it back or explain you're focused on this topic. Use markdown for formatting.`,
        },
      });

      // We'll send the whole history for context
      const response = await chat.sendMessage({ 
        message: userMessage 
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting to my brain right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0A0A0A] border-l border-white/10 z-[101] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Bot size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">AI Learning Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-white/10' : 'bg-indigo-600/20 text-indigo-400'
                    }`}>
                      {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white/5 border border-white/10 text-white/80 rounded-tl-none'
                    }`}>
                      <div className="markdown-body">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <Loader2 size={16} className="animate-spin" />
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-white/10 bg-white/5 relative">
              <AnimatePresence>
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 right-0 p-4 bg-indigo-600/90 backdrop-blur-md border-t border-white/20 z-10"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ height: [4, 12, 4] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                            className="w-1 bg-white rounded-full"
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Listening...</span>
                    </div>
                    <p className="text-sm text-white font-medium italic">
                      {interimTranscript || 'Say something...'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask a question about this module..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-4 pr-12 py-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                  <button
                    onClick={toggleListening}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                      isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                    title={isListening ? 'Stop Listening' : 'Start Voice Input'}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-xl transition-all text-white shadow-lg shadow-indigo-500/20"
                >
                  <Send size={20} />
                </button>
              </div>
              <p className="text-[10px] text-white/20 text-center mt-4 uppercase tracking-widest font-bold">
                Powered by Gemini AI
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
