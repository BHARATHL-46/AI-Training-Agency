import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../lib/i18n';

interface LanguageState {
  language: string;
  setLanguage: (lang: string) => void;
}

export const useLanguageStore = create<LanguageState>((set) => {
  const initialLang = localStorage.getItem('language') || 'en';
  i18n.changeLanguage(initialLang);
  
  return {
    language: initialLang,
    setLanguage: (lang) => {
      localStorage.setItem('language', lang);
      set({ language: lang });
    },
  };
});

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  xp: number;
  published: boolean;
  passingScore: number;
  headings: string[];
  objectives?: string[];
  ragEnabled?: boolean;
  difficulty: string;
  unlockAfter: string | null;
  order: number;
  content?: { [lang: string]: any };
}

interface ModuleStore {
  modules: Module[];
  setModules: (modules: Module[]) => void;
  deleteModule: (id: string) => void;
  updateModule: (id: string, module: Partial<Module>) => void;
  completedModules: string[];
  completeModule: (id: string) => void;
  isModuleUnlocked: (id: string) => boolean;
  streak: number;
  weeklyGoal: number;
  xp: number;
  rank: number;
  badges: { id: string; name: string; icon: string; date: string }[];
}

export const useModuleStore = create<ModuleStore>()(
  persist(
    (set, get) => ({
      modules: [
        { 
          id: '1', 
          title: 'Introduction to Generative AI', 
          description: 'Master the fundamentals of LLMs and diffusion models.', 
          duration: '45m', 
          xp: 100, 
          published: true, 
          passingScore: 70, 
          headings: ['Introduction', 'History', 'Core Concepts'], 
          difficulty: 'Beginner', 
          unlockAfter: null, 
          order: 1,
          content: {
            en: {
              module_title: "Introduction to Generative AI",
              objectives_summary: "By the end of this module, you will understand the core principles of Generative AI and its historical evolution.",
              sections: [
                {
                  heading: "Introduction",
                  content: "Generative AI refers to a category of artificial intelligence that can create new content, such as text, images, or audio, based on patterns learned from existing data.",
                  key_points: ["Creative AI", "Pattern Recognition", "Content Generation"],
                  example: "ChatGPT generating a poem or DALL-E creating an image from a text prompt."
                },
                {
                  heading: "History",
                  content: "The journey of Generative AI began with simple rule-based systems and evolved through neural networks, GANs, and eventually the Transformer architecture that powers today's LLMs.",
                  key_points: ["Neural Networks", "GANs (2014)", "Transformers (2017)"],
                  example: "The 'Attention is All You Need' paper revolutionized the field in 2017."
                },
                {
                  heading: "Core Concepts",
                  content: "At its heart, Generative AI uses probability distributions to predict the next most likely element in a sequence, whether it's a word in a sentence or a pixel in an image.",
                  key_points: ["Probability Distributions", "Tokenization", "Latent Space"],
                  example: "Predicting the next word: 'The cat sat on the [mat]'."
                }
              ]
            }
          }
        },
        { id: '2', title: 'Prompt Engineering Mastery', description: 'Learn advanced techniques for high-quality AI outputs.', duration: '60m', xp: 150, published: true, passingScore: 75, headings: ['Zero-shot', 'Few-shot', 'Chain of Thought'], difficulty: 'Intermediate', unlockAfter: '1', order: 2 },
        { id: '3', title: 'AI Agents & Workflows', description: 'Build autonomous systems using LangChain and AutoGPT.', duration: '90m', xp: 200, published: true, passingScore: 80, headings: ['Planning', 'Memory', 'Tools'], difficulty: 'Advanced', unlockAfter: '2', order: 3 },
        { id: '4', title: 'Fine-tuning Custom Models', description: 'Optimize open-source models for specific business needs.', duration: '120m', xp: 300, published: true, passingScore: 85, headings: ['Dataset Prep', 'Training', 'Evaluation'], difficulty: 'Advanced', unlockAfter: '3', order: 4 },
      ],
      setModules: (modules) => set({ modules }),
      deleteModule: (id) => set((state) => ({ 
        modules: state.modules.filter(m => m.id !== id) 
      })),
      updateModule: (id, updatedModule) => set((state) => ({
        modules: state.modules.map(m => m.id === id ? { ...m, ...updatedModule } : m)
      })),
      completedModules: JSON.parse(localStorage.getItem('completedModules') || '[]'),
      completeModule: (id) => {
        const newCompleted = [...new Set([...get().completedModules, id])];
        localStorage.setItem('completedModules', JSON.stringify(newCompleted));
        set({ completedModules: newCompleted });
      },
      isModuleUnlocked: (id) => {
        const module = get().modules.find(m => m.id === id);
        if (!module) return false;
        if (module.unlockAfter === null) return true;
        return get().completedModules.includes(module.unlockAfter);
      },
      streak: 5,
      weeklyGoal: 75,
      xp: 1420,
      rank: 12,
      badges: [
        { id: '1', name: 'Early Adopter', icon: '🚀', date: '2024-01-15' },
        { id: '2', name: 'Fast Learner', icon: '⚡', date: '2024-02-10' },
        { id: '3', name: 'Quiz Master', icon: '🧠', date: '2024-02-28' },
      ],
    }),
    {
      name: 'module-storage',
    }
  )
);

export interface LiveSession {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  meetingLink: string;
  courseId?: string;
  maxSeats?: number;
  priority?: string;
  autoSeatScaling?: boolean;
  waitlistManagement?: boolean;
  autoCancelThreshold?: number;
  autoClosePercent?: number;
  instructorName?: string;
  type?: 'Live' | 'Workshop' | 'Q&A';
}

interface LiveSessionStore {
  sessions: LiveSession[];
  addSession: (session: LiveSession) => void;
  updateSession: (id: string, session: Partial<LiveSession>) => void;
  deleteSession: (id: string) => void;
}

export const useLiveSessionStore = create<LiveSessionStore>((set) => ({
  sessions: [
    {
      id: '1',
      title: 'Generative AI Deep Dive',
      description: 'Join us for an interactive session on the latest trends in GenAI and LLMs.',
      startTime: new Date(new Date().getTime() + 1000 * 60 * 30).toISOString(), // Starts in 30 mins
      endTime: new Date(new Date().getTime() + 1000 * 60 * 90).toISOString(),
      meetingLink: 'https://zoom.us/j/123456789',
      instructorName: 'Dr. Sarah Chen',
      type: 'Workshop',
    },
    {
      id: '2',
      title: 'Prompt Engineering Workshop',
      description: 'Hands-on workshop for mastering advanced prompting techniques.',
      startTime: new Date(new Date().getTime() - 1000 * 60 * 120).toISOString(), // Ended 2 hours ago
      endTime: new Date(new Date().getTime() - 1000 * 60 * 60).toISOString(),
      meetingLink: 'https://zoom.us/j/987654321',
      instructorName: 'Alex Rivera',
      type: 'Live',
    }
  ],
  addSession: (session) => set((state) => ({ sessions: [...state.sessions, session] })),
  updateSession: (id, updatedSession) => set((state) => ({
    sessions: state.sessions.map(s => s.id === id ? { ...s, ...updatedSession } : s)
  })),
  deleteSession: (id) => set((state) => ({
    sessions: state.sessions.filter(s => s.id !== id)
  })),
}));

export const getSessionStatus = (start: string, end: string) => {
  const now = new Date();
  if (now < new Date(start)) return "Upcoming";
  if (now >= new Date(start) && now <= new Date(end)) return "Live";
  return "Completed";
};
