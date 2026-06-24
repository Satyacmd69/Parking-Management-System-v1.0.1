import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ParkingCircle, Mail, Key, User, Shield, Check, LogIn, UserPlus } from 'lucide-react';
import { api } from '../utils/api';

interface AuthScreenProps {
  onAuthSuccess: (token: string, user: { name: string; email: string; role: 'admin' | 'staff' }) => void;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'staff'>('staff');
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { email, password }
        : { name, email, password, role };

      const response = await api.post(endpoint, payload);

      setSuccess(isLogin ? 'Logged in successfully!' : 'Account registered successfully!');
      
      if (rememberMe) {
        localStorage.setItem('parking_remember_email', email);
      } else {
        localStorage.removeItem('parking_remember_email');
      }

      // Short delay for visual transition
      setTimeout(() => {
        onAuthSuccess(response.token, response.user);
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill logins helper
  const handleQuickLogin = (roleType: 'admin' | 'staff') => {
    if (roleType === 'admin') {
      setEmail('admin@parking.com');
      setPassword('admin123');
    } else {
      setEmail('staff@parking.com');
      setPassword('staff123');
    }
    setIsLogin(true);
  };

  return (
    <div
      className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden"
      id="auth-screen-container"
    >
      {/* Dynamic background orbits */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none select-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none select-none" />

      {/* Auth Card wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-slate-900/60 border border-white/5 backdrop-blur-md rounded-2xl p-6 shadow-2xl relative z-10 space-y-6"
      >
        {/* Brand identity header */}
        <div className="flex flex-col items-center text-center gap-1.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
            <ParkingCircle size={26} className="stroke-[2.5]" />
          </div>
          <h1 className="font-sans font-extrabold text-white text-lg tracking-wide mt-2">
            SMART PARKING MANAGEMENT
          </h1>
          <p className="text-[10px] font-mono text-slate-500 font-bold tracking-widest uppercase">
            Spark OS Central Ingress
          </p>
        </div>

        {/* Message indicators */}
        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-xl flex items-center gap-2">
            <Check size={14} /> {success}
          </div>
        )}

        {/* Toggle tabs */}
        <div className="grid grid-cols-2 bg-slate-950/80 p-1 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            className={`py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
              isLogin ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In Account
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
            className={`py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
              !isLogin ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Staff Profile
          </button>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sign Up Fields */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400">OPERATOR FULL NAME</label>
              <div className="relative">
                <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-700 focus:border-indigo-500 outline-none"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-slate-400 font-semibold">EMAIL CORRESPONDENCE</label>
            <div className="relative">
              <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                type="email"
                placeholder="e.g. staff@parking.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-700 focus:border-indigo-500 outline-none font-mono"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-slate-400 font-semibold">SECURITY PASSCODE</label>
            <div className="relative">
              <Key size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                type="password"
                placeholder="Password (e.g. staff123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-700 focus:border-indigo-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Role selector (Sign up only) */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400">ASSIGNED ROLE TYPE</label>
              <div className="relative">
                <Shield size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'staff')}
                  className="w-full bg-slate-950 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-300 focus:border-indigo-500 outline-none"
                >
                  <option value="staff">Staff Operator (Limited access)</option>
                  <option value="admin">Admin Manager (Full structural access)</option>
                </select>
              </div>
            </div>
          )}

          {/* Remember me block */}
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 pt-1">
            <div className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/10 bg-slate-950 text-indigo-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="remember" className="cursor-pointer select-none">Remember Me</label>
            </div>
            {isLogin && (
              <button
                type="button"
                onClick={() => alert('Demo Feature: Please use seed credentials provided in quick shortcuts below.')}
                className="hover:text-indigo-400 transition-colors"
              >
                Forgot Password?
              </button>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-1.5 pt-3 cursor-pointer"
          >
            {isLogin ? <LogIn size={13} /> : <UserPlus size={13} />}
            {loading ? 'Authenticating...' : isLogin ? 'Access System Dashboard' : 'Register Operator'}
          </button>
        </form>

        {/* Quick seeds shortcuts */}
        <div className="border-t border-white/5 pt-4">
          <p className="text-[10px] font-mono text-slate-500 text-center font-bold uppercase tracking-wider mb-2">
            System Seed Accounts (Quick shortcuts)
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => handleQuickLogin('staff')}
              className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[10px] font-semibold text-slate-300 hover:bg-white/10 text-center transition-all cursor-pointer flex flex-col items-center"
            >
              <span className="font-bold text-indigo-400">STAFF LOGIN</span>
              <span className="text-[8px] font-mono opacity-50">staff123</span>
            </button>
            <button
              onClick={() => handleQuickLogin('admin')}
              className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[10px] font-semibold text-slate-300 hover:bg-white/10 text-center transition-all cursor-pointer flex flex-col items-center"
            >
              <span className="font-bold text-purple-400">ADMIN LOGIN</span>
              <span className="text-[8px] font-mono opacity-50">admin123</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
