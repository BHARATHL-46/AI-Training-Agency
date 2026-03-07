import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, CheckCircle2, XCircle, ChevronRight, RotateCcw, Award } from 'lucide-react';
import { generateQuiz } from '../services/geminiService';
import { useLanguageStore, useModuleStore } from '../store/globalStore';

export const QuizPage = () => {
  const { id } = useParams();
  const { language } = useLanguageStore();
  const { completeModule, modules } = useModuleStore();
  const navigate = useNavigate();

  const module = modules.find(m => m.id === id);
  const nextModule = modules.find(m => m.unlockAfter === id);
  const passingScore = module?.passingScore || 70;

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        // Force language to 'en' for quizzes as per user request
        const data = await generateQuiz(module?.title || `Module ${id}`, 'en', module?.headings);
        setQuestions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, language, module?.title]);

  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setShowResult(true);
    }
  }, [timeLeft, showResult]);

  const handleAnswer = (optionIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = optionIdx;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    return Math.round((correct / questions.length) * 100);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIdx];

  useEffect(() => {
    if (showResult) {
      const score = calculateScore();
      const passed = score >= passingScore;

      if (passed && id) {
        completeModule(id);
      }
    }
  }, [showResult, id, passingScore]);

  if (loading || !currentQ) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-white/60 animate-pulse">Generating AI Quiz Questions...</p>
      </div>
    );
  }

  if (showResult) {
    const score = calculateScore();
    const passed = score >= passingScore;

    return (
      <div className="max-w-2xl mx-auto mt-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center"
        >
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
            passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {passed ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
          </div>
          <h2 className="text-4xl font-bold mb-2">{passed ? 'Congratulations!' : 'Keep Practicing'}</h2>
          <p className="text-white/60 mb-8">You scored {score}% in the quiz. (Passing: {passingScore}%)</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <span className="block text-xs text-white/40 uppercase mb-1">Status</span>
              <span className={`font-bold ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
                {passed ? 'PASSED' : 'FAILED'}
              </span>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <span className="block text-xs text-white/40 uppercase mb-1">Next Module</span>
              <span className="font-bold text-white">
                {passed ? 'UNLOCKED' : 'LOCKED'}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/student/modules')}
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-semibold transition-all"
            >
              Back to Modules
            </button>
            {!passed && (
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} /> Retry Quiz
              </button>
            )}
            {passed && nextModule && (
              <button
                onClick={() => navigate(`/student/modules/${nextModule.id}`)}
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                Next Module <ChevronRight size={18} />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 font-bold">
            {currentIdx + 1}/{questions.length}
          </div>
          <div>
            <h2 className="font-bold">Progress</h2>
            <div className="w-48 h-2 bg-white/5 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300" 
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
          <Timer size={18} className="text-indigo-400" />
          <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-8"
        >
          <h3 className="text-2xl font-bold mb-8 leading-tight">
            {currentQ.question}
          </h3>

          <div className="space-y-4">
            {currentQ.options.map((option: string, i: number) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className={`w-full p-5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between group ${
                  answers[currentIdx] === i
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <span className="font-medium">{option}</span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  answers[currentIdx] === i
                    ? 'border-white bg-white text-indigo-600'
                    : 'border-white/20 group-hover:border-white/40'
                }`}>
                  {answers[currentIdx] === i && <div className="w-2 h-2 bg-indigo-600 rounded-full" />}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-12 flex justify-end">
            <button
              onClick={nextQuestion}
              disabled={answers[currentIdx] === undefined}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {currentIdx === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
