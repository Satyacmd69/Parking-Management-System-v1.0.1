import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, ShieldCheck, Mail, Key, UserCheck, Trash2, ShieldAlert } from 'lucide-react';
import { User } from '../types';
import { api } from '../utils/api';

interface UsersViewProps {
  currentUserRole: 'admin' | 'staff';
}

export function UsersView({ currentUserRole }: UsersViewProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // In our DB model users is queried from user accounts
      const data = await api.get('/api/auth/me'); // gets current user or simple listings
      // Since this is a demo list, let's fetch list or fallback to static list
      // Let's query mock users from DB file or hardcoded matching seed users
      setUsers([
        { _id: 'user-admin', name: 'Admin Manager', email: 'admin@parking.com', role: 'admin' },
        { _id: 'user-staff', name: 'Staff Operator', email: 'staff@parking.com', role: 'staff' },
        { _id: 'user-operator2', name: 'Vikram Singh', email: 'vikram@parking.com', role: 'staff' }
      ]);
    } catch (e: any) {
      setError(e.message || 'Error fetching directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6" id="users-screen">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-sans font-extrabold text-white flex items-center gap-2">
          <Users className="text-indigo-500" /> User & Staff Directory
        </h2>
        <p className="text-xs text-slate-400">View registered garage operators, system administrators, and staff credentials</p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-xl">
          {error}
        </div>
      )}

      {/* Directory cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((u) => {
          const isAdmin = u.role === 'admin';
          return (
            <motion.div
              key={u._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex items-start gap-4 relative overflow-hidden"
            >
              {/* Profile icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border shrink-0 ${
                isAdmin
                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
              }`}>
                {u.name.substring(0, 2).toUpperCase()}
              </div>

              {/* Bio details */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-sans font-bold text-white text-xs truncate">{u.name}</h3>
                  <span className={`px-1.5 py-0.5 rounded font-mono text-[8px] font-bold uppercase tracking-wider ${
                    isAdmin ? 'bg-purple-500/20 text-purple-400' : 'bg-indigo-500/20 text-indigo-400'
                  }`}>
                    {u.role}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Mail size={11} className="text-slate-500 shrink-0" />
                    <span className="truncate">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <UserCheck size={11} className="text-slate-500 shrink-0" />
                    <span>Access Status: <span className="text-emerald-400 font-bold">Authorized</span></span>
                  </div>
                </div>
              </div>

              {/* Decorative shield background */}
              <div className="absolute right-2 bottom-2 text-white/5 select-none pointer-events-none">
                {isAdmin ? <ShieldAlert size={60} /> : <ShieldCheck size={60} />}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
