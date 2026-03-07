import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-12 text-center"
      >
        <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <ShieldAlert className="text-red-400" size={40} />
        </div>
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-white/60 mb-8 leading-relaxed">
          You do not have the necessary permissions to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
        >
          <Home size={18} /> Back to Home
        </button>
      </motion.div>
    </div>
  );
};
