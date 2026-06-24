import { useState, useEffect } from 'react';
import { Bell, Search, Clock, Trash2, Calendar } from 'lucide-react';
import { AppNotification } from '../types';
import { api } from '../utils/api';

interface HeaderProps {
  user: { name: string; role: string } | null;
  notifications: AppNotification[];
  fetchNotifications: () => void;
  onSearchQuery?: (query: string) => void;
  onToggleSidebar?: () => void;
}

export function Header({
  user,
  notifications,
  fetchNotifications,
  onSearchQuery
}: HeaderProps) {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [time, setTime] = useState(new Date());

  // Live Clock Tick
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.post('/api/parking/notifications/read', {});
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearNotif = async () => {
    try {
      await api.delete('/api/parking/notifications');
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <header
      id="top-dashboard-header"
      className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 relative z-20 shadow-sm"
    >
      {/* Title & Greeting */}
      <div className="flex flex-col">
        <span className="text-[10px] font-mono text-indigo-600 font-bold tracking-wider uppercase">OPERATOR DASHBOARD</span>
        <h1 className="text-sm font-sans font-bold text-slate-800 leading-tight">
          Welcome back, <span className="text-indigo-600 font-extrabold">{user?.name || 'Operator'}</span>
        </h1>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-6">
        {/* Live Clock / Calendar */}
        <div className="hidden sm:flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-xs select-none">
          <div className="flex items-center gap-1.5 text-indigo-600">
            <Calendar size={13} />
            <span className="text-slate-700 font-semibold">{formatDate(time)}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 text-emerald-600">
            <Clock size={13} className="animate-spin-slow" />
            <span className="text-slate-900 font-bold">{formatTime(time)}</span>
          </div>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm transition-all relative cursor-pointer"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotifMenu && (
            <>
              {/* Backing screen close dismiss */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifMenu(false)}
              />

              {/* Notification Menu Container */}
              <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
                  <span className="text-xs font-bold text-slate-950 flex items-center gap-2">
                    System Alerts
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-indigo-600 text-white font-bold font-mono px-1.5 py-0.5 rounded-full">
                        {unreadCount} NEW
                      </span>
                    )}
                  </span>
                  <div className="flex gap-2">
                    {notifications.length > 0 && (
                      <>
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                        >
                          Mark all read
                        </button>
                        <span className="text-slate-300 text-xs">·</span>
                        <button
                          onClick={handleClearNotif}
                          className="text-[10px] font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 size={10} /> Clear
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-xs text-slate-400">No active alerts</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      // Styling per type
                      let indicatorColor = 'bg-blue-500';
                      if (n.type === 'warning') indicatorColor = 'bg-amber-500';
                      if (n.type === 'success') indicatorColor = 'bg-emerald-500';

                      return (
                        <div
                          key={n._id}
                          className={`p-2.5 rounded-xl border transition-all ${
                            n.read
                              ? 'bg-transparent border-transparent opacity-60'
                              : 'bg-slate-50 border-slate-100'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${indicatorColor}`} />
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <p className="text-xs font-medium text-slate-700 leading-snug break-words">
                                {n.message}
                              </p>
                              <span className="text-[9px] font-mono text-slate-400">
                                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
