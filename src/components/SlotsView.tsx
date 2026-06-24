import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, Trash2, ShieldAlert, Check, X, Filter, Grid3X3 } from 'lucide-react';
import { Slot, Floor, VehicleType } from '../types';
import { api } from '../utils/api';

interface SlotsViewProps {
  slots: Slot[];
  floors: Floor[];
  fetchSlots: () => void;
  userRole: 'admin' | 'staff';
}

export function SlotsView({ slots, floors, fetchSlots, userRole }: SlotsViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [slotNumber, setSlotNumber] = useState('');
  const [floorId, setFloorId] = useState('');
  const [slotType, setSlotType] = useState('car');

  const isAdmin = userRole === 'admin';

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!slotNumber || !floorId || !slotType) {
      setError('All fields are required');
      return;
    }

    try {
      await api.post('/api/parking/slots', {
        slotNumber: slotNumber.toUpperCase(),
        floorId,
        slotType
      });
      setSuccess(`Slot ${slotNumber.toUpperCase()} added successfully!`);
      setSlotNumber('');
      setShowAddModal(false);
      fetchSlots();
    } catch (err: any) {
      setError(err.message || 'Error adding slot');
    }
  };

  const handleDeleteSlot = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete slot ${name}?`)) return;
    setError('');
    setSuccess('');

    try {
      await api.delete(`/api/parking/slots/${id}`);
      setSuccess(`Slot ${name} deleted.`);
      fetchSlots();
    } catch (err: any) {
      setError(err.message || 'Error deleting slot');
    }
  };

  const toggleSlotStatus = async (slot: Slot) => {
    const newStatus = slot.status === 'available' ? 'occupied' : 'available';
    try {
      await api.put(`/api/parking/slots/${slot._id}`, { status: newStatus });
      fetchSlots();
    } catch (err: any) {
      setError(err.message || 'Error toggling slot status');
    }
  };

  // Filter slots
  const filteredSlots = slots.filter((slot) => {
    const matchesSearch = slot.slotNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFloor = selectedFloor === 'all' || slot.floorId === selectedFloor;
    const matchesType = selectedType === 'all' || slot.slotType === selectedType;
    const matchesStatus = selectedStatus === 'all' || slot.status === selectedStatus;
    return matchesSearch && matchesFloor && matchesType && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6" id="slots-screen">
      {/* Title Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-sans font-extrabold text-white">Parking Slots</h2>
          <p className="text-xs text-slate-400">Configure layout grids and review real-time occupancy indicators</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              if (floors.length === 0) {
                setError('You must create a floor first before adding slots.');
                return;
              }
              setFloorId(floors[0]._id);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all text-xs font-semibold cursor-pointer"
          >
            <Plus size={16} /> Add Slot
          </button>
        )}
      </div>

      {/* Message banners */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-xl">
          {success}
        </div>
      )}

      {/* Filters Panel bar */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search slot number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0c0c0e] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Floor selector */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <Filter size={11} className="text-indigo-400 shrink-0" />
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="bg-[#0c0c0e] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-indigo-500 outline-none w-full sm:w-auto"
          >
            <option value="all">All Floors</option>
            {floors.map((f) => (
              <option key={f._id} value={f._id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type selector */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-[#0c0c0e] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-indigo-500 outline-none w-full sm:w-auto"
        >
          <option value="all">All Vehicle Types</option>
          <option value="car">Cars Only</option>
          <option value="bike">Bikes Only</option>
          <option value="truck">Trucks Only</option>
        </select>

        {/* Status selector */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-[#0c0c0e] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-indigo-500 outline-none w-full sm:w-auto"
        >
          <option value="all">All Statuses</option>
          <option value="available">Available Only</option>
          <option value="occupied">Occupied Only</option>
        </select>
      </div>

      {/* Grid of Slots (interactive cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {filteredSlots.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 font-mono text-xs">
            No parking slots match the selected criteria.
          </div>
        ) : (
          filteredSlots.map((slot) => {
            const isOccupied = slot.status === 'occupied';
            const fName = floors.find((f) => f._id === slot.floorId)?.name || 'Ground';

            return (
              <motion.div
                key={slot._id}
                whileHover={{ scale: 1.03 }}
                className={`relative border p-3.5 rounded-xl flex flex-col items-center justify-between h-24 select-none group transition-all shadow-md ${
                  isOccupied
                    ? 'bg-red-500/5 border-red-500/10 text-red-400'
                    : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400 hover:border-emerald-500/30'
                }`}
              >
                {/* Micro Floor code badge */}
                <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-500 truncate max-w-full">
                  {fName.substring(0, 8)}
                </span>

                {/* Big Slot Label */}
                <span className="text-sm font-sans font-extrabold text-white leading-none">
                  {slot.slotNumber}
                </span>

                {/* Type & Manual toggle icon */}
                <div className="flex items-center gap-1.5 w-full justify-between mt-1">
                  <span className="text-[9px] font-mono font-semibold uppercase px-1 rounded bg-white/5 text-slate-400">
                    {slot.slotType}
                  </span>

                  <button
                    onClick={() => toggleSlotStatus(slot)}
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                      isOccupied ? 'border-red-500 bg-red-500 text-white' : 'border-emerald-500 bg-transparent text-transparent'
                    }`}
                    title={isOccupied ? 'Set Available' : 'Set Occupied'}
                  >
                    <Check size={8} strokeWidth={3} />
                  </button>
                </div>

                {/* Hover Admin Delete Action */}
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSlot(slot._id, slot.slotNumber);
                    }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-950 border border-red-500/20 text-red-400 flex items-center justify-center scale-0 group-hover:scale-100 transition-transform shadow-lg cursor-pointer hover:bg-red-900 hover:text-white"
                  >
                    <X size={10} />
                  </button>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add Slot Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#09090b]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0c0c0e] border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="font-sans font-bold text-white text-sm">Add Parking Slot</span>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400">SLOT NUMBER / CODE</label>
                <input
                  type="text"
                  placeholder="e.g. G-C06"
                  value={slotNumber}
                  onChange={(e) => setSlotNumber(e.target.value)}
                  className="w-full bg-[#09090b] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400">ASSIGNED FLOOR</label>
                <select
                  value={floorId}
                  onChange={(e) => setFloorId(e.target.value)}
                  className="w-full bg-[#09090b] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-indigo-500 outline-none"
                  required
                >
                  {floors.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} (Level {f.floorNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400">SLOT CATEGORY TYPE</label>
                <select
                  value={slotType}
                  onChange={(e) => setSlotType(e.target.value)}
                  className="w-full bg-[#09090b] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-indigo-500 outline-none"
                  required
                >
                  <option value="car">Car (Standard)</option>
                  <option value="bike">Bike (50% Tariff Off)</option>
                  <option value="truck">Truck (2x Tariff Surcharge)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all pt-3 cursor-pointer"
              >
                Assemble Slot
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
