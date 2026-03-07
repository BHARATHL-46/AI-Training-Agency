import React from 'react';
import { motion } from 'motion/react';
import { Users, BookOpen, CheckCircle2, Trophy, ArrowUpRight, TrendingUp, UserCheck, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';

const stats = [
  { label: 'Total Students', value: '1,284', icon: Users, trend: '+12%', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { label: 'Active Modules', value: '42', icon: BookOpen, trend: '+4', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  { label: 'Completion Rate', value: '78.5%', icon: CheckCircle2, trend: '+5.2%', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { label: 'Certificates Issued', value: '856', icon: Trophy, trend: '+82', color: 'text-amber-400', bg: 'bg-amber-400/10' },
];

const enrollmentData = [
  { name: 'Jan', students: 400 },
  { name: 'Feb', students: 600 },
  { name: 'Mar', students: 800 },
  { name: 'Apr', students: 1100 },
  { name: 'May', students: 1284 },
];

const modulePerformance = [
  { name: 'Intro to AI', completion: 95 },
  { name: 'Prompt Eng', completion: 82 },
  { name: 'NLP Basics', completion: 64 },
  { name: 'Computer Vision', completion: 48 },
  { name: 'Fine-tuning', completion: 32 },
];

export const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-white/60">Global overview of agency performance and student engagement.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
          <TrendingUp size={18} /> Export Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight size={16} className="text-white/20" />
            </div>
            <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-white/40 text-sm font-medium">{stat.label}</span>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <span className="text-emerald-400 text-xs font-bold">{stat.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enrollment Chart */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-8">Student Enrollment Growth</h3>
          <div className="h-[300px] w-full relative min-h-[300px] min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
              <AreaChart data={enrollmentData}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="students" stroke="#6366f1" fillOpacity={1} fill="url(#colorStudents)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-6">Recent Alerts</h3>
          <div className="space-y-4">
            {[
              { icon: UserCheck, text: 'New admin account created: Sarah J.', time: '2h ago', color: 'text-blue-400' },
              { icon: AlertCircle, text: 'Module "Fine-tuning" has low pass rate', time: '5h ago', color: 'text-red-400' },
              { icon: CheckCircle2, text: 'System backup completed successfully', time: '12h ago', color: 'text-emerald-400' },
              { icon: Trophy, text: 'New leaderboard season started', time: '1d ago', color: 'text-amber-400' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors group">
                <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 ${item.color}`}>
                  <item.icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white/80 line-clamp-1">{item.text}</p>
                  <span className="text-[10px] text-white/40 uppercase font-bold">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all">
            View All Logs
          </button>
        </div>
      </div>

      {/* Module Performance */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
        <h3 className="text-xl font-bold mb-8">Module Completion Rates</h3>
        <div className="h-[250px] w-full relative min-h-[250px] min-w-0 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
            <BarChart data={modulePerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '12px' }}
              />
              <Bar dataKey="completion" radius={[8, 8, 0, 0]}>
                {modulePerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.completion > 80 ? '#10b981' : entry.completion > 50 ? '#6366f1' : '#f87171'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
