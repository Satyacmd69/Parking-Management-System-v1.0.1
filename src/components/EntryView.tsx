import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, Car, Bike, Truck, Check, QrCode } from 'lucide-react';
import { Vehicle, VehicleType } from '../types';
import { api } from '../utils/api';
import { TicketPrint } from './TicketPrint';

interface EntryViewProps {
  fetchDashboardMetrics: () => void;
  fetchSlots: () => void;
  fetchFloors: () => void;
}

export function EntryView({
  fetchDashboardMetrics,
  fetchSlots,
  fetchFloors
}: EntryViewProps) {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ticketVehicle, setTicketVehicle] = useState<Vehicle | null>(null);

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!vehicleNumber) {
      setError('Vehicle registration number is required');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/parking/vehicles/checkin', {
        vehicleNumber: vehicleNumber.toUpperCase().trim(),
        ownerName: ownerName.trim() || 'Guest Operator',
        vehicleType
      });

      setSuccess(`Vehicle ${response.vehicleNumber} checked in successfully!`);
      setTicketVehicle(response); // Mount the Ticket Print modal!
      
      // Reset Form fields
      setVehicleNumber('');
      setOwnerName('');
      setVehicleType('car');

      // Refresh data
      fetchDashboardMetrics();
      fetchSlots();
      fetchFloors();
    } catch (err: any) {
      setError(err.message || 'No slots available or error checking in vehicle');
    } finally {
      setLoading(false);
    }
  };

  const types = [
    { id: 'car' as const, label: 'Car / Sedan', icon: Car, rate: '₹20/hr base' },
    { id: 'bike' as const, label: 'Bike / Scooter', icon: Bike, rate: '50% tariff discount' },
    { id: 'truck' as const, label: 'Truck / Heavy', icon: Truck, rate: '2x tariff surcharge' }
  ];

  return (
    <div className="p-6 max-w-xl mx-auto" id="entry-screen">
      {/* Title */}
      <div className="border-b border-white/5 pb-4 mb-6">
        <h2 className="text-xl font-sans font-extrabold text-white flex items-center gap-2">
          <LogIn className="text-indigo-500" /> Vehicle Check-In
        </h2>
        <p className="text-xs text-slate-400">Register incoming vehicle and generate safe-entry parking tickets</p>
      </div>

      {/* Message banners */}
      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-xl mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-xl mb-4 flex items-center gap-2">
          <Check size={14} /> {success}
        </div>
      )}

      {/* Glassmorphic Check-In Form */}
      <form onSubmit={handleSubmitEntry} className="bg-slate-900/40 border border-white/5 backdrop-blur-md rounded-2xl p-6 space-y-6 shadow-xl">
        {/* Category select block */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">VEHICLE CATEGORY</label>
          <div className="grid grid-cols-3 gap-3">
            {types.map((t) => {
              const Icon = t.icon;
              const isSelected = vehicleType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setVehicleType(t.id)}
                  className={`border rounded-xl p-3.5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400 font-bold shadow-md shadow-indigo-600/5'
                      : 'bg-transparent border-white/5 text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <div className="text-center">
                    <div className="text-[10px] uppercase font-sans tracking-wider">{t.id}</div>
                    <div className="text-[8px] font-mono opacity-60 mt-0.5">{t.rate}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          {/* Vehicle Number */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">
              VEHICLE REGISTRATION NUMBER (REQUIRED)
            </label>
            <input
              type="text"
              placeholder="e.g. KA-51-MD-9090"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-700 font-mono font-bold tracking-widest focus:border-indigo-500 outline-none uppercase"
              required
            />
          </div>

          {/* Owner Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">
              OWNER NAME (OPTIONAL)
            </label>
            <input
              type="text"
              placeholder="e.g. Rajesh Kumar"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 font-sans focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 pt-3.5 cursor-pointer disabled:opacity-50"
        >
          <LogIn size={14} /> {loading ? 'Checking in...' : 'Allocate Slot & Create Ticket'}
        </button>
      </form>

      {/* Ticket printing modal overlay */}
      {ticketVehicle && (
        <TicketPrint
          vehicle={ticketVehicle}
          onClose={() => setTicketVehicle(null)}
        />
      )}
    </div>
  );
}
