import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Plus, Search, Filter, Edit, Trash2, Globe, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModuleStore } from '../store/globalStore';

export const AdminModulesPage = () => {
  const { modules, deleteModule } = useModuleStore();
  const navigate = useNavigate();

  const handleDelete = (id: string) => {
    deleteModule(id);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Modules</h1>
          <p className="text-white/60">Manage your agency's learning content and curriculum.</p>
        </div>
        <button
          onClick={() => navigate('/admin/create')}
          className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus size={18} /> Create Module
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input
            type="text"
            placeholder="Search modules..."
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
          <Filter size={18} /> Filter
        </button>
      </div>

      {/* Modules List */}
      <div className="grid grid-cols-1 gap-4">
        {modules.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="text-white/20" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">No modules found</h3>
            <p className="text-white/40 mb-6">Start by creating your first learning module.</p>
            <button
              onClick={() => navigate('/admin/create')}
              className="text-indigo-400 font-bold hover:underline"
            >
              Create Module
            </button>
          </div>
        ) : (
          modules.map((module, i) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between group hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{module.title}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      {module.published ? <Globe size={12} className="text-emerald-400" /> : <Lock size={12} />}
                      {module.published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs text-white/40">•</span>
                    <span className="text-xs text-white/40">{module.headings?.length || 0} Sections</span>
                    <span className="text-xs text-white/40">•</span>
                    <span className="text-xs text-white/40">{module.passingScore}% Passing Score</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate(`/admin/edit/${module.id}`)}
                  className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  title="Edit Module"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(module.id)}
                  className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  title="Delete Module"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
