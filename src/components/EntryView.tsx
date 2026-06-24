import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, Car, Bike, Truck, Check } from 'lucide-react';
import { Vehicle, VehicleType } from '../types';
import { api } from '../utils/api';
import { TicketPrint } from './TicketPrint';

interface EntryViewProps {
  fetchDashboardMetrics: () => void;
  fetchSlots: () => void;
  fetchFloors: () => void;
  syncAllData?: () => void;
}

export function EntryView({
  fetchDashboardMetrics,
  fetchSlots,
  fetchFloors,
  syncAllData
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
      if (syncAllData) {
        syncAllData();
      }
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
    <div className="p-6 max-w-xl mx-auto animate-fadeIn" id="entry-screen">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4 mb-6">
        <h2 className="text-xl font-sans font-extrabold text-slate-800 flex items-center gap-2">
          <LogIn className="text-indigo-600" /> Vehicle Check-In
        </h2>
        <p className="text-xs text-slate-500">Register incoming vehicle and allocate secure parking slot automatically</p>
      </div>

      {/* Message banners */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs font-mono rounded-xl mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-mono rounded-xl mb-4 flex items-center gap-2">
          <Check size={14} /> {success}
        </div>
      )}

      {/* Check-In Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
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
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-600 font-bold shadow-sm'
                      : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700'
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 font-mono font-bold tracking-widest focus:border-indigo-500 focus:bg-white outline-none uppercase transition-all"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 font-sans focus:border-indigo-500 focus:bg-white outline-none transition-all"
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          onClick={handleSubmitEntry}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 pt-3.5 cursor-pointer disabled:opacity-50"
        >
          <LogIn size={14} /> {loading ? 'Checking in...' : 'Allocate Slot & Create Ticket'}
        </button>
      </div>

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
