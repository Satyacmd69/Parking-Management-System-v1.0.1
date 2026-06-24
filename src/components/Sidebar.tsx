import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Layers,
  Grid3X3,
  LogIn,
  LogOut,
  FileBarChart2,
  Users,
  Settings as SettingsIcon,
  ShieldAlert,
  Power,
  ChevronLeft,
  ChevronRight,
  ParkingCircle
} from 'lucide-react';

interface SidebarProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  user: { name: string; email: string; role: 'admin' | 'staff' } | null;
  onLogout: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({
  activeScreen,
  setActiveScreen,
  user,
  onLogout,
  isCollapsed,
  setIsCollapsed
}: SidebarProps) {
  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'staff'] },
    { id: 'entry', label: 'Vehicle Entry', icon: LogIn, roles: ['admin', 'staff'] },
    { id: 'exit', label: 'Vehicle Exit', icon: LogOut, roles: ['admin', 'staff'] },
    { id: 'floors', label: 'Parking Floors', icon: Layers, roles: ['admin', 'staff'] },
    { id: 'slots', label: 'Parking Slots', icon: Grid3X3, roles: ['admin', 'staff'] },
    { id: 'reports', label: 'Revenue Reports', icon: FileBarChart2, roles: ['admin', 'staff'] },
    { id: 'users', label: 'User Directory', icon: Users, roles: ['admin'] },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, roles: ['admin'] }
  ];

  const filteredMenu = menuItems.filter(item => user && item.roles.includes(user.role));

  return (
    <motion.aside
      id="sidebar-navigation"
      animate={{ width: isCollapsed ? '76px' : '260px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col h-screen bg-slate-950/80 backdrop-blur-md border-r border-white/5 text-slate-300 select-none overflow-hidden shrink-0 z-30"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-600/30">
            <ParkingCircle size={22} className="stroke-[2.5]" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col shrink-0"
            >
              <span className="font-sans font-bold text-white tracking-wide text-sm">SPARK OS</span>
              <span className="text-[10px] font-mono text-slate-500 font-bold tracking-widest">PARKING SYS</span>
            </motion.div>
          )}
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1 rounded bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Menu Navigation items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-none">
        {filteredMenu.map(item => {
          const isActive = activeScreen === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-200 group relative cursor-pointer ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500 font-semibold'
                  : 'hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon
                size={20}
                className={`transition-colors shrink-0 ${
                  isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs tracking-wide"
                >
                  {item.label}
                </motion.span>
              )}

              {/* Tooltip on collapse */}
              {isCollapsed && (
                <div className="absolute left-16 top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 bg-slate-900 border border-white/10 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-xl pointer-events-none transition-all duration-150 z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Section / Profile */}
      <div className="border-t border-white/5 p-3 shrink-0">
        {!isCollapsed ? (
          <div className="flex flex-col gap-3">
            {/* Profile badge */}
            <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white uppercase shrink-0 border border-white/10">
                {user?.name.substring(0, 2) || 'OP'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">{user?.name}</span>
                <span className="text-[10px] text-slate-500 truncate">{user?.email}</span>
                <span className="flex items-center gap-1 text-[9px] font-bold font-mono tracking-wider text-indigo-400 mt-0.5">
                  <ShieldAlert size={10} />
                  {user?.role.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-950/20 hover:bg-red-950/50 border border-red-500/10 hover:border-red-500/20 text-red-400 text-xs font-semibold transition-all cursor-pointer"
            >
              <Power size={14} /> Log Out System
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={onLogout}
              className="w-10 h-10 rounded-xl bg-red-950/20 hover:bg-red-950/50 border border-red-500/10 hover:border-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              title="Logout System"
            >
              <Power size={16} />
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
