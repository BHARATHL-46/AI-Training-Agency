import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, GripVertical, Save, Globe, Lock, Percent, FileUp, ChevronDown, Check, Sparkles, Loader2, RefreshCw, Languages } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useModuleStore } from '../store/globalStore';
import { generateModuleContentStream, generateHeadingSuggestions, translateModuleContent } from '../services/geminiService';

export const AdminModuleEditor = () => {
  const { modules, setModules, updateModule } = useModuleStore();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [moduleId] = useState(id || Math.random().toString(36).substr(2, 9));

  const [title, setTitle] = useState('');
  const [headings, setHeadings] = useState<string[]>(['Introduction']);
  const [objectives, setObjectives] = useState<string[]>(['']);
  const [passingScore, setPassingScore] = useState(70);
  const [ragEnabled, setRagEnabled] = useState(false);
  const [published, setPublished] = useState(false);
  const [unlockAfter, setUnlockAfter] = useState<string | null>(null);
  const [content, setContent] = useState<{ [lang: string]: any }>({});
  const [genLanguage, setGenLanguage] = useState('en');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // AI Heading Suggestions State
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // RAG State
  const [ragDocuments, setRagDocuments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ chunks?: number, filename?: string } | null>(null);

  useEffect(() => {
    if (isEditMode) {
      const module = modules.find(m => m.id === id);
      if (module) {
        setTitle(module.title);
        setHeadings(module.headings || ['Introduction']);
        setObjectives(module.objectives || ['']);
        setPassingScore(module.passingScore || 70);
        setRagEnabled(module.ragEnabled || false);
        setPublished(module.published || false);
        setUnlockAfter(module.unlockAfter || null);
        setContent(module.content || {});
        
        // Fetch existing RAG documents
        fetchRagDocuments(moduleId);
      }
    }
  }, [id, isEditMode, modules, moduleId]);

  const fetchRagDocuments = async (mId: string) => {
    try {
      const response = await axios.get(`/api/modules/${mId}/rag/documents`);
      setRagDocuments(response.data.documents);
    } catch (error) {
      console.error('Failed to fetch RAG documents:', error);
    }
  };

  const handleRemoveDoc = async (filename: string) => {
    try {
      await axios.delete(`/api/modules/${moduleId}/rag/documents/${encodeURIComponent(filename)}`);
      fetchRagDocuments(moduleId);
    } catch (error) {
      console.error('Failed to remove document:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`/api/modules/${moduleId}/rag/upload`, formData);
      setUploadStatus({
        chunks: response.data.chunksCreated,
        filename: response.data.filename
      });
      fetchRagDocuments(moduleId);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload document. Make sure the server is running.');
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger suggestions when title changes
  useEffect(() => {
    if (title.trim().length > 3) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        fetchSuggestions();
      }, 1000);
    }
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [title]);

  const fetchSuggestions = async () => {
    if (!title.trim()) return;
    setIsSuggesting(true);
    setAiError(null);
    try {
      const results = await generateHeadingSuggestions(title, headings);
      // Filter out any that are already in headings
      const filtered = results.filter((s: string) => !headings.includes(s));
      setSuggestions(filtered);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      try {
        const msg = (error as any)?.message || JSON.stringify(error);
        setAiError(msg);
        alert('Failed to fetch AI suggestions: ' + msg);
      } catch (e) {
        setAiError('Failed to fetch AI suggestions');
      }
    } finally {
      setIsSuggesting(false);
    }
  };

  const addHeading = (text: string = '') => {
    setHeadings([...headings, text]);
    // If it was a suggestion, remove it
    if (text) {
      setSuggestions(prev => prev.filter(s => s !== text));
    }
  };
  const removeHeading = (i: number) => setHeadings(headings.filter((_, idx) => idx !== i));
  
  const addObjective = () => setObjectives([...objectives, '']);
  const removeObjective = (i: number) => setObjectives(objectives.filter((_, idx) => idx !== i));

  const handleGenerateContent = async () => {
    if (!title.trim()) return;
    setIsGenerating(true);
    try {
      let ragContext = '';
      if (ragEnabled) {
        // Search RAG for context
        const searchResponse = await axios.post(`/api/modules/${moduleId}/rag/search`, {
          query: `${title} ${headings.join(' ')}`,
          limit: 5
        });
        const results = searchResponse.data.results;
        if (results && results.length > 0) {
          ragContext = results.map((r: any) => r.text).join('\n\n---\n\n');
        }
      }

      const data = await generateModuleContentStream(
        title,
        genLanguage,
        headings,
        () => {},
        ragContext
      );
      if (data) {
        setContent({
          ...content,
          [genLanguage]: data
        });
      }
    } catch (error) {
      console.error('Failed to generate content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTranslate = async () => {
    if (!content['en']) return;
    setIsGenerating(true);
    try {
      const translated = await translateModuleContent(content['en'], genLanguage);
      if (translated) {
        setContent({
          ...content,
          [genLanguage]: translated
        });
      }
    } catch (error) {
      console.error('Failed to translate content:', error);
      alert('Translation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;
    
    const moduleData = {
      title,
      headings,
      objectives,
      passingScore,
      ragEnabled,
      published,
      unlockAfter,
      content,
      description: `Learn about ${title}`,
      duration: '45m',
      xp: 100
    };

    if (isEditMode) {
      updateModule(id, moduleData);
    } else {
      const newModule = {
        ...moduleData,
        id: moduleId,
        order: modules.length + 1,
        difficulty: 'Intermediate',
      } as any;
      setModules([...modules, newModule]);
    }
    navigate('/admin/modules');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{isEditMode ? 'Edit Module' : 'Create New Module'}</h1>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
        >
          <Save size={18} /> {isEditMode ? 'Update Module' : 'Save Module'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Module Information</h3>
              <div className="flex items-center gap-3">
                <select
                  value={genLanguage}
                  onChange={(e) => setGenLanguage(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white/80 focus:ring-1 focus:ring-indigo-500/50 cursor-pointer appearance-none"
                >
                  <option value="en" className="bg-[#1a1a1a] text-white">English</option>
                  <option value="ta" className="bg-[#1a1a1a] text-white">Tamil</option>
                </select>
                <button
                  onClick={handleGenerateContent}
                  disabled={isGenerating || !title.trim()}
                  className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                  {content[genLanguage] ? 'Refine Content' : 'Generate'}
                </button>
                {genLanguage !== 'en' && content['en'] && !content[genLanguage] && (
                  <button
                    onClick={handleTranslate}
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-purple-500/20 disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Languages size={14} />}
                    Translate from EN
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Module Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Advanced Prompt Engineering"
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-white/60">Side Headings (Structure)</label>
                <button onClick={() => addHeading('')} className="text-indigo-400 text-xs font-bold flex items-center gap-1 hover:text-indigo-300">
                  <Plus size={14} /> Add Heading
                </button>
              </div>
              <div className="space-y-3">
                {headings.map((h, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={h}
                      onChange={(e) => {
                        const next = [...headings];
                        next[i] = e.target.value;
                        setHeadings(next);
                      }}
                      className="flex-1 px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button onClick={() => removeHeading(i)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {/* AI Suggestions */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Sparkles size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">AI Suggested Headings</span>
                  </div>
                  <button 
                    onClick={fetchSuggestions}
                    disabled={isSuggesting || !title.trim()}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={isSuggesting ? 'animate-spin' : ''} />
                  </button>
                </div>

                {aiError && (
                  <div className="mt-2 p-3 bg-red-600/10 border border-red-600/20 rounded-lg text-sm text-red-300">
                    <div className="flex items-center justify-between">
                      <span>AI service error: {aiError}</span>
                      <button onClick={() => setAiError(null)} className="text-xs underline">Dismiss</button>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <AnimatePresence mode="popLayout">
                    {isSuggesting && suggestions.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-[10px] text-white/20 italic"
                      >
                        <Loader2 size={12} className="animate-spin" />
                        Generating suggestions...
                      </motion.div>
                    )}
                    {suggestions.map((s, i) => (
                      <motion.button
                        key={s}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => addHeading(s)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all group"
                      >
                        <Plus size={12} className="group-hover:rotate-90 transition-transform" />
                        {s}
                      </motion.button>
                    ))}
                    {!isSuggesting && suggestions.length === 0 && title.trim().length > 3 && (
                      <span className="text-[10px] text-white/20 italic">No more suggestions</span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Content Preview */}
          {content[genLanguage] && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Content Preview ({genLanguage.toUpperCase()})</h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg font-black uppercase tracking-widest border border-emerald-500/20">AI Generated</span>
              </div>
              <div className="space-y-6">
                {content[genLanguage].sections?.map((section: any, i: number) => (
                  <div key={i} className="p-6 bg-black/20 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="font-bold text-indigo-400">{section.heading}</h4>
                    <p className="text-sm text-white/60 leading-relaxed">{section.content}</p>
                    {section.key_points && (
                      <div className="flex flex-wrap gap-2">
                        {section.key_points.map((p: string, idx: number) => (
                          <span key={idx} className="text-[10px] bg-white/5 px-2 py-1 rounded-md text-white/40">{p}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Objectives */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-white/60">Learning Objectives</label>
              <button onClick={addObjective} className="text-indigo-400 text-xs font-bold flex items-center gap-1 hover:text-indigo-300">
                <Plus size={14} /> Add Objective
              </button>
            </div>
            <div className="space-y-3">
              {objectives.map((obj, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={obj}
                    onChange={(e) => {
                      const next = [...objectives];
                      next[i] = e.target.value;
                      setObjectives(next);
                    }}
                    placeholder={`Objective ${i + 1}`}
                    className="flex-1 px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button onClick={() => removeObjective(i)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Settings */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-widest text-white/40">Module Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 relative">
                <div className="flex items-center gap-3">
                  <Lock size={18} className="text-indigo-400" />
                  <span className="text-sm font-medium">Unlock After</span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
                  >
                    {unlockAfter ? modules.find(m => m.id === unlockAfter)?.title : 'None'}
                    <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setIsDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute right-0 mt-2 w-56 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl z-20 py-2 overflow-hidden"
                        >
                          <button
                            onClick={() => {
                              setUnlockAfter(null);
                              setIsDropdownOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left text-xs text-white/60 hover:text-white hover:bg-white/5 flex items-center justify-between transition-all"
                          >
                            None
                            {!unlockAfter && <Check size={12} className="text-indigo-400" />}
                          </button>
                          <div className="h-px bg-white/5 my-1" />
                          <div className="max-h-48 overflow-y-auto custom-scrollbar">
                            {modules.filter(m => m.id !== id).map(m => (
                              <button
                                key={m.id}
                                onClick={() => {
                                  setUnlockAfter(m.id);
                                  setIsDropdownOpen(false);
                                }}
                                className="w-full px-4 py-2 text-left text-xs text-white/60 hover:text-white hover:bg-white/5 flex items-center justify-between transition-all"
                              >
                                <span className="truncate">{m.title}</span>
                                {unlockAfter === m.id && <Check size={12} className="text-indigo-400" />}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Percent size={18} className="text-indigo-400" />
                  <span className="text-sm font-medium">Passing Score</span>
                </div>
                <input 
                  type="number" 
                  value={passingScore}
                  onChange={(e) => setPassingScore(parseInt(e.target.value))}
                  className="w-12 bg-transparent text-right text-sm border-none focus:ring-0" 
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <FileUp size={18} className="text-indigo-400" />
                  <span className="text-sm font-medium">Enable RAG</span>
                </div>
                <button 
                  onClick={() => setRagEnabled(!ragEnabled)}
                  className={`w-10 h-5 rounded-full transition-all relative ${ragEnabled ? 'bg-indigo-600' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${ragEnabled ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-indigo-400" />
                  <span className="text-sm font-medium">Published</span>
                </div>
                <button 
                  onClick={() => setPublished(!published)}
                  className={`w-10 h-5 rounded-full transition-all relative ${published ? 'bg-emerald-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${published ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* RAG Upload */}
          {ragEnabled && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm">RAG Knowledge Base</h4>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-lg font-black uppercase tracking-widest border border-indigo-500/20">
                  {ragDocuments.length} Documents
                </span>
              </div>

              {ragDocuments.length > 0 && (
                <div className="space-y-2">
                  {ragDocuments.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 text-xs group/doc">
                      <div className="flex items-center gap-2 text-white/60">
                        <Check size={14} className="text-emerald-400" />
                        <span className="truncate max-w-[150px]">{doc}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-white/20 uppercase font-bold group-hover/doc:hidden">Indexed</span>
                        <button 
                          onClick={() => handleRemoveDoc(doc)}
                          className="hidden group-hover/doc:block p-1 text-white/20 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <label className="block border-2 border-dashed border-indigo-500/30 rounded-2xl p-8 text-center hover:border-indigo-500/50 transition-all cursor-pointer group relative overflow-hidden">
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                {isUploading ? (
                  <div className="space-y-2">
                    <Loader2 className="mx-auto text-indigo-400 animate-spin" size={32} />
                    <p className="text-xs text-white/60">Processing document...</p>
                  </div>
                ) : (
                  <>
                    <FileUp className="mx-auto text-indigo-400 mb-2 group-hover:scale-110 transition-transform" size={32} />
                    <p className="text-xs text-white/60">Upload PDF, TXT or DOCX for module context</p>
                  </>
                )}
              </label>

              {uploadStatus && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-1"
                >
                  <p className="text-xs font-bold text-emerald-400">Upload Successful!</p>
                  <p className="text-[10px] text-white/40">
                    {uploadStatus.filename} indexed into {uploadStatus.chunks} chunks.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
