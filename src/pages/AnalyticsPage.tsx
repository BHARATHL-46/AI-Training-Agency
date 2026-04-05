import React from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Target, Zap, TrendingUp, Award, Users, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../lib/api';

const studentData = [
  { name: 'Mon', score: 65, accuracy: 70 },
  { name: 'Tue', score: 72, accuracy: 75 },
  { name: 'Wed', score: 68, accuracy: 72 },
  { name: 'Thu', score: 85, accuracy: 88 },
  { name: 'Fri', score: 90, accuracy: 92 },
  { name: 'Sat', score: 88, accuracy: 90 },
  { name: 'Sun', score: 95, accuracy: 96 },
];

const adminGlobalData = [
  { name: 'Jan', completion: 450, active: 1200 },
  { name: 'Feb', completion: 520, active: 1350 },
  { name: 'Mar', completion: 610, active: 1500 },
  { name: 'Apr', completion: 780, active: 1800 },
  { name: 'May', completion: 950, active: 2100 },
];

export const AnalyticsPage = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{isAdmin ? 'Global Analytics' : 'My Learning Analytics'}</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">Last 7 Days</button>
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">Last 30 Days</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin ? (
          <>
            {[
              { label: 'Total Active Students', value: '2,100', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
              { label: 'Avg. Completion Rate', value: '72%', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              { label: 'New Enrollments', value: '+124', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
              { label: 'Certificates Issued', value: '1,420', icon: Award, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-4`}><stat.icon className={stat.color} size={24} /></div>
                <span className="text-white/40 text-sm font-medium">{stat.label}</span>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </motion.div>
            ))}
          </>
        ) : (
          <>
            {[
              { label: 'Avg. Accuracy', value: '84%', icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              { label: 'Learning Velocity', value: '1.2x', icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
              { label: 'Current Streak', value: '12 Days', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
              { label: 'Total Modules', value: '24', icon: Award, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-4`}><stat.icon className={stat.color} size={24} /></div>
                <span className="text-white/40 text-sm font-medium">{stat.label}</span>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </motion.div>
            ))}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-8">{isAdmin ? 'Student Activity Growth' : 'Performance Trends'}</h3>
          <div className="h-[300px] w-full relative min-h-[300px] min-w-0 overflow-hidden" style={{ minWidth: 0, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
              {isAdmin ? (
                <BarChart data={adminGlobalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                  <Bar dataKey="active" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="completion" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={studentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} dot={{ r: 4, fill: '#818cf8' }} />
                  <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-8">{isAdmin ? 'Module Popularity' : 'Topic Mastery'}</h3>
          <div className="h-[300px] w-full relative min-h-[300px] min-w-0 overflow-hidden" style={{ minWidth: 0, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
              <BarChart data={isAdmin ? [
                { name: 'Intro AI', value: 980 },
                { name: 'Prompting', value: 850 },
                { name: 'Agents', value: 620 },
                { name: 'Fine-tune', value: 410 },
              ] : [
                { topic: 'Neural Nets', score: 85 },
                { topic: 'CV', score: 62 },
                { topic: 'NLP', score: 94 },
                { topic: 'RL', score: 45 },
              ]} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey={isAdmin ? "name" : "topic"} type="category" stroke="#ffffff40" fontSize={10} width={100} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                <Bar dataKey={isAdmin ? "value" : "score"} radius={[0, 8, 8, 0]}>
                  {studentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#818cf8' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
