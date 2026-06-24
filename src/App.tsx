import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { FloorsView } from './components/FloorsView';
import { SlotsView } from './components/SlotsView';
import { EntryView } from './components/EntryView';
import { ExitView } from './components/ExitView';
import { ReportsView } from './components/ReportsView';
import { UsersView } from './components/UsersView';
import { SettingsView } from './components/SettingsView';
import { AuthScreen } from './components/AuthScreen';
import { api } from './utils/api';
import { Floor, Slot, Vehicle, Transaction, AuditLog, AppNotification, DashboardMetrics } from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('parking_token'));
  const [user, setUser] = useState<{ name: string; email: string; role: 'admin' | 'staff' } | null>(
    localStorage.getItem('parking_user') ? JSON.parse(localStorage.getItem('parking_user')!) : null
  );

  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Collections data state
  const [floors, setFloors] = useState<Floor[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [activeVehicles, setActiveVehicles] = useState<Vehicle[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  // Cross-view selections
  const [selectedVehicleFromOutside, setSelectedVehicleFromOutside] = useState<Vehicle | null>(null);

  // Global trigger for data fetchers
  const fetchFloors = async () => {
    try {
      const data = await api.get('/api/parking/floors');
      setFloors(data);
    } catch (e) {
      console.error('Error fetching floors', e);
    }
  };

  const fetchSlots = async () => {
    try {
      const data = await api.get('/api/parking/slots');
      setSlots(data);
    } catch (e) {
      console.error('Error fetching slots', e);
    }
  };

  const fetchActiveVehicles = async () => {
    try {
      const data = await api.get('/api/parking/vehicles/active');
      setActiveVehicles(data);
    } catch (e) {
      console.error('Error fetching active vehicles', e);
    }
  };

  const fetchTransactions = async () => {
    try {
      const data = await api.get('/api/parking/transactions');
      setTransactions(data);
    } catch (e) {
      console.error('Error fetching transactions', e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const data = await api.get('/api/parking/audit-logs');
      setAuditLogs(data);
    } catch (e) {
      console.error('Error fetching audit logs', e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await api.get('/api/parking/notifications');
      setNotifications(data);
    } catch (e) {
      console.error('Error fetching notifications', e);
    }
  };

  const fetchDashboardMetrics = async () => {
    try {
      const data = await api.get('/api/dashboard/metrics');
      setMetrics(data);
    } catch (e) {
      console.error('Error fetching metrics', e);
    }
  };

  // Synchronous sync trigger
  const syncAllData = () => {
    if (!token) return;
    fetchDashboardMetrics();
    fetchFloors();
    fetchSlots();
    fetchActiveVehicles();
    fetchTransactions();
    fetchAuditLogs();
    fetchNotifications();
  };

  // Sync data on startup or state logins change
  useEffect(() => {
    if (token) {
      syncAllData();
      // Periodic poll notifications
      const notifInterval = setInterval(() => {
        fetchNotifications();
        fetchDashboardMetrics();
      }, 10000); // 10 seconds poll interval
      return () => clearInterval(notifInterval);
    }
  }, [token]);

  // Auth Handler Success
  const handleAuthSuccess = (newToken: string, newUser: { name: string; email: string; role: 'admin' | 'staff' }) => {
    localStorage.setItem('parking_token', newToken);
    localStorage.setItem('parking_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setActiveScreen('dashboard');
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('parking_token');
    localStorage.removeItem('parking_user');
    setToken(null);
    setUser(null);
    setMetrics(null);
  };

  // Navigate directly to billing checker from clicking vehicle view
  const handleSelectVehicleForBilling = (vehicle: Vehicle) => {
    setSelectedVehicleFromOutside(vehicle);
    setActiveScreen('exit');
  };

  if (!token || !user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Active view renderer selector
  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return (
          <DashboardView
            metrics={metrics}
            onRefresh={syncAllData}
            onSelectVehicle={handleSelectVehicleForBilling}
            setActiveScreen={setActiveScreen}
          />
        );
      case 'floors':
        return (
          <FloorsView
            floors={floors}
            fetchFloors={fetchFloors}
            userRole={user.role}
          />
        );
      case 'slots':
        return (
          <SlotsView
            slots={slots}
            floors={floors}
            fetchSlots={fetchSlots}
            userRole={user.role}
            activeVehicles={activeVehicles}
            syncAllData={syncAllData}
            onSelectVehicle={handleSelectVehicleForBilling}
          />
        );
      case 'entry':
        return (
          <EntryView
            fetchDashboardMetrics={fetchDashboardMetrics}
            fetchSlots={fetchSlots}
            fetchFloors={fetchFloors}
            syncAllData={syncAllData}
          />
        );
      case 'exit':
        return (
          <ExitView
            activeVehicles={activeVehicles}
            fetchActiveVehicles={fetchActiveVehicles}
            fetchDashboardMetrics={fetchDashboardMetrics}
            fetchSlots={fetchSlots}
            fetchFloors={fetchFloors}
            selectedVehicleFromOutside={selectedVehicleFromOutside}
            clearOutsideVehicleSelection={() => setSelectedVehicleFromOutside(null)}
            syncAllData={syncAllData}
          />
        );
      case 'reports':
        return (
          <ReportsView
            transactions={transactions}
            auditLogs={auditLogs}
            onRefresh={syncAllData}
            userRole={user.role}
          />
        );
      case 'users':
        return <UsersView currentUserRole={user.role} />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <div className="p-6 text-slate-400 font-mono text-xs">
            Module under active assembly.
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 font-sans" id="spark-system-layout">
      {/* Dynamic backdrop glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none select-none z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none select-none z-10" />

      {/* Floating Modern Sidebar */}
      <Sidebar
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        user={user}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Central Screen Body */}
      <div className="flex flex-col flex-1 h-screen min-w-0 bg-white/40 z-20 relative">
        <Header
          user={user}
          notifications={notifications}
          fetchNotifications={fetchNotifications}
        />

        {/* Scrolling Screen Workspace */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScreen}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="h-full"
            >
              {renderActiveScreen()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
