import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Video, Calendar, Clock, Trash2, Edit, X, Link as LinkIcon, Settings, Shield, Zap, ChevronDown, Save } from 'lucide-react';
import { useLiveSessionStore, getSessionStatus, LiveSession, useModuleStore } from '../store/globalStore';

export const AdminLiveSessions = () => {
  const { sessions, addSession, deleteSession, updateSession } = useLiveSessionStore();
  const { modules } = useModuleStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    meetingLink: '',
    courseId: '',
    maxSeats: 50,
    priority: 'Optional',
    autoSeatScaling: false,
    waitlistManagement: true,
    autoCancelThreshold: 5,
    autoClosePercent: 90,
  });

  const handleOpenModal = (session?: LiveSession) => {
    if (session) {
      setEditingSession(session);
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      setFormData({
        title: session.title,
        description: session.description,
        date: start.toISOString().split('T')[0],
        startTime: start.toTimeString().slice(0, 5),
        endTime: end.toTimeString().slice(0, 5),
        meetingLink: session.meetingLink,
        courseId: session.courseId || '',
        maxSeats: session.maxSeats || 50,
        priority: session.priority || 'Optional',
        autoSeatScaling: session.autoSeatScaling || false,
        waitlistManagement: session.waitlistManagement ?? true,
        autoCancelThreshold: session.autoCancelThreshold || 5,
        autoClosePercent: session.autoClosePercent || 90,
      });
    } else {
      setEditingSession(null);
      setFormData({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:00',
        meetingLink: '',
        courseId: '',
        maxSeats: 50,
        priority: 'Optional',
        autoSeatScaling: false,
        waitlistManagement: true,
        autoCancelThreshold: 5,
        autoClosePercent: 90,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

    if (startDateTime >= endDateTime) {
      alert('Start time must be before end time');
      return;
    }

    const sessionData = {
      title: formData.title,
      description: formData.description,
      meetingLink: formData.meetingLink,
      courseId: formData.courseId,
      maxSeats: formData.maxSeats,
      priority: formData.priority,
      autoSeatScaling: formData.autoSeatScaling,
      waitlistManagement: formData.waitlistManagement,
      autoCancelThreshold: formData.autoCancelThreshold,
      autoClosePercent: formData.autoClosePercent,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    };

    if (editingSession) {
      updateSession(editingSession.id, sessionData);
    } else {
      addSession({
        ...sessionData,
        id: Math.random().toString(36).substr(2, 9),
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Sessions</h1>
          <p className="text-white/60">Schedule and manage your live training sessions.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus size={18} /> Schedule Session
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => {
          const status = getSessionStatus(session.startTime, session.endTime);
          const statusColors = {
            Live: 'bg-red-500/20 text-red-400 border-red-500/20',
            Upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
            Completed: 'bg-white/5 text-white/40 border-white/10',
          };

          return (
            <motion.div
              key={session.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col group hover:bg-white/10 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[status as keyof typeof statusColors]}`}>
                  {status}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal(session)}
                    className="p-2 text-white/40 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-all"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => deleteSession(session.id)}
                    className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{session.title}</h3>
              <p className="text-white/40 text-sm mb-6 line-clamp-2 flex-grow">{session.description}</p>

              <div className="space-y-3 pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <Calendar size={16} className="text-indigo-400" />
                  {new Date(session.startTime).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <Clock size={16} className="text-indigo-400" />
                  {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center gap-3 text-sm text-white/60 truncate">
                  <LinkIcon size={16} className="text-indigo-400 shrink-0" />
                  <span className="truncate">{session.meetingLink}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-3xl font-bold">Schedule Session</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-white/40 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              <p className="text-white/40 text-sm mb-10">Configure advanced session settings and automation.</p>

              <form onSubmit={handleSave} className="space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Left Column: Basic Configuration */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest mb-4">
                      <Settings size={14} />
                      BASIC CONFIGURATION
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-white/60 mb-2">Module Selection</label>
                        <div className="relative">
                          <select
                            value={formData.courseId}
                            onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none text-sm"
                          >
                            <option value="" className="bg-[#0A0A0A]">Select a module</option>
                            {modules.map(m => (
                              <option key={m.id} value={m.id} className="bg-[#0A0A0A]">{m.title}</option>
                            ))}
                          </select>
                          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/60 mb-2">Session Title</label>
                        <input
                          required
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                          placeholder="e.g., Advanced LLM Workshop"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/60 mb-2">Description</label>
                        <textarea
                          required
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-28 resize-none text-sm"
                          placeholder="What will this session cover?"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-2">Date</label>
                          <input
                            required
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-2">Start</label>
                          <input
                            required
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-2">End</label>
                          <input
                            required
                            type="time"
                            value={formData.endTime}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/60 mb-2">Meeting Link</label>
                        <input
                          required
                          type="url"
                          value={formData.meetingLink}
                          onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                          placeholder="https://zoom.us/j/..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Advanced Controls */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-4">
                      <Shield size={14} />
                      ADVANCED CONTROLS
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-2">Max Seats</label>
                          <input
                            type="number"
                            value={formData.maxSeats}
                            onChange={(e) => setFormData({ ...formData, maxSeats: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-2">Priority</label>
                          <div className="relative">
                            <select
                              value={formData.priority}
                              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none text-sm"
                            >
                              <option value="Optional" className="bg-[#0A0A0A]">Optional</option>
                              <option value="High" className="bg-[#0A0A0A]">High</option>
                              <option value="Critical" className="bg-[#0A0A0A]">Critical</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <div>
                          <div className="text-sm font-bold">Auto-Seat Scaling</div>
                          <div className="text-[10px] text-white/40">Increase seats if demand is high</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, autoSeatScaling: !formData.autoSeatScaling })}
                          className={`w-10 h-5 rounded-full transition-all relative ${formData.autoSeatScaling ? 'bg-indigo-600' : 'bg-white/10'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.autoSeatScaling ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <div>
                          <div className="text-sm font-bold">Waitlist Management</div>
                          <div className="text-[10px] text-white/40">Enable auto-conversion for waitlist</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, waitlistManagement: !formData.waitlistManagement })}
                          className={`w-10 h-5 rounded-full transition-all relative ${formData.waitlistManagement ? 'bg-indigo-600' : 'bg-white/10'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.waitlistManagement ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>

                      {/* Automation Rules Nested Card */}
                      <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-3xl p-6 space-y-6">
                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-widest">
                          <Zap size={12} />
                          AUTOMATION RULES
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-2">AUTO-CANCEL THRESHOLD</label>
                            <input
                              type="number"
                              value={formData.autoCancelThreshold}
                              onChange={(e) => setFormData({ ...formData, autoCancelThreshold: parseInt(e.target.value) })}
                              className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-white/40 uppercase mb-2">AUTO-CLOSE %</label>
                            <input
                              type="number"
                              value={formData.autoClosePercent}
                              onChange={(e) => setFormData({ ...formData, autoClosePercent: parseInt(e.target.value) })}
                              className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all text-sm flex items-center gap-2"
                    >
                      <Save size={18} /> Save as Template
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="px-10 py-3 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 text-sm"
                  >
                    Schedule Session
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
