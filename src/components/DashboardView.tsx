import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ParkingCircle,
  TrendingUp,
  Activity,
  DollarSign,
  Car,
  Clock,
  ArrowUpRight,
  Eye,
  RefreshCw
} from 'lucide-react';
import { DashboardMetrics, Vehicle } from '../types';
import { RevenueAreaChart, VehicleTypeRadialRings, FloorOccupancyBarChart } from './CustomCharts';

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  onRefresh: () => void;
  onSelectVehicle: (v: Vehicle) => void;
  setActiveScreen: (screen: string) => void;
}

export function DashboardView({
  metrics,
  onRefresh,
  onSelectVehicle,
  setActiveScreen
}: DashboardViewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="animate-spin text-indigo-500" size={24} />
          <p className="text-xs font-mono">Compiling metrics...</p>
        </div>
      </div>
    );
  }

  // Cards layout
  const statCards = [
    {
      title: 'TOTAL SLOTS',
      value: metrics.totalSlots,
      icon: ParkingCircle,
      sub: `${metrics.availableSlots} available, ${metrics.occupiedSlots} occupied`,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/10'
    },
    {
      title: 'OCCUPIED SLOTS',
      value: metrics.occupiedSlots,
      icon: Activity,
      sub: `${Math.round((metrics.occupiedSlots / (metrics.totalSlots || 1)) * 100)}% utilization rate`,
      color: 'from-orange-500/20 to-red-500/20 text-orange-400 border-orange-500/10'
    },
    {
      title: 'TOTAL REVENUE',
      value: `₹${metrics.totalRevenue}`,
      icon: DollarSign,
      sub: 'All completed transactions',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/10'
    },
    {
      title: 'ACTIVE PARKED',
      value: metrics.activeParkings,
      icon: Car,
      sub: `${metrics.totalVehiclesToday} checked in today`,
      color: 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/10'
    }
  ];

  return (
    <div className="p-6 space-y-6" id="dashboard-screen">
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-sans font-extrabold text-white">Metrics Overview</h2>
          <p className="text-xs text-slate-400">Real-time status monitor of your commercial garage</p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all text-xs font-semibold cursor-pointer"
        >
          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Syncing...' : 'Sync Live'}
        </button>
      </div>

      {/* Numerical Stats Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={`bg-gradient-to-br ${card.color} border p-5 rounded-2xl flex flex-col justify-between h-36 relative overflow-hidden group hover:scale-[1.02] hover:shadow-xl transition-all`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold tracking-wider opacity-80">{card.title}</span>
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                  <Icon size={16} />
                </div>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-2xl font-sans font-extrabold text-white leading-none tracking-tight">
                  {card.value}
                </span>
                <span className="text-[10px] text-slate-400 font-medium truncate">{card.sub}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Advanced Visual Charts Grid (Bento style) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Curved area chart for 7 day revenue history */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 backdrop-blur-md rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">7-Day Revenue Timeline</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
              Live Feed
            </span>
          </div>
          <div className="h-56">
            <RevenueAreaChart data={metrics.revenueTimeline} />
          </div>
        </div>

        {/* Ring chart for Category breakdown */}
        <div className="bg-slate-900/40 border border-white/5 backdrop-blur-md rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Car size={16} className="text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Vehicle Type Analytics</h3>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <VehicleTypeRadialRings data={metrics.vehicleTypeAnalytics} />
          </div>
        </div>
      </div>

      {/* Floor utilization bars & recent active check-ins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Floor occupancy list */}
        <div className="bg-slate-900/40 border border-white/5 backdrop-blur-md rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Floor Occupancy Tracking</h3>
            <span className="text-[9px] font-mono text-slate-500 font-semibold">FLOOR-WISE</span>
          </div>
          <FloorOccupancyBarChart data={metrics.floorOccupancy} />
        </div>

        {/* Live checked in tickers / recent entries list */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 backdrop-blur-md rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-indigo-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Live Entries</h3>
            </div>
            <button
              onClick={() => setActiveScreen('exit')}
              className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
            >
              Check out vehicle <ArrowUpRight size={10} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-white/5 pb-2">
                  <th className="font-mono font-bold pb-2">VEHICLE NO</th>
                  <th className="font-mono font-bold pb-2">OWNER NAME</th>
                  <th className="font-mono font-bold pb-2">TYPE</th>
                  <th className="font-mono font-bold pb-2">SLOT</th>
                  <th className="font-mono font-bold pb-2">ENTRY TIME</th>
                  <th className="font-mono font-bold pb-2 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {metrics.recentEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-500 font-mono">
                      No recent entries registered.
                    </td>
                  </tr>
                ) : (
                  metrics.recentEntries.map((vehicle) => {
                    const entry = new Date(vehicle.entryTime);
                    const isCheckout = vehicle.exitTime !== null;
                    return (
                      <tr key={vehicle._id} className="group hover:bg-white/5 transition-colors">
                        <td className="py-2.5 font-bold text-slate-200 font-mono tracking-wider">
                          {vehicle.vehicleNumber}
                        </td>
                        <td className="py-2.5 text-slate-300 font-medium">{vehicle.ownerName}</td>
                        <td className="py-2.5 capitalize font-semibold">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              vehicle.vehicleType === 'car'
                                ? 'bg-blue-500/10 text-blue-400'
                                : vehicle.vehicleType === 'bike'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {vehicle.vehicleType}
                          </span>
                        </td>
                        <td className="py-2.5 font-bold text-indigo-400 font-mono">{vehicle.assignedSlot}</td>
                        <td className="py-2.5 text-slate-400 font-mono">
                          {entry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2.5 text-right">
                          {isCheckout ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-500 font-bold uppercase">
                              OUT
                            </span>
                          ) : (
                            <button
                              onClick={() => onSelectVehicle(vehicle)}
                              className="px-2.5 py-1 rounded bg-indigo-600/15 text-indigo-400 hover:bg-indigo-600 hover:text-white text-[10px] font-bold transition-all flex items-center gap-1 ml-auto cursor-pointer"
                            >
                              <Eye size={10} /> Billing
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
