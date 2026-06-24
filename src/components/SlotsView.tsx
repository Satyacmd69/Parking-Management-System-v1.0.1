import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Plus,
  Trash2,
  ShieldAlert,
  Check,
  X,
  Filter,
  Car,
  Bike,
  Truck,
  User,
  Clock,
  Calendar,
  CreditCard,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Slot, Floor, Vehicle, VehicleType } from '../types';
import { api } from '../utils/api';

interface SlotsViewProps {
  slots: Slot[];
  floors: Floor[];
  fetchSlots: () => void;
  userRole: 'admin' | 'staff';
  activeVehicles?: Vehicle[];
  syncAllData?: () => void;
  onSelectVehicle?: (vehicle: Vehicle) => void;
}

export function SlotsView({
  slots,
  floors,
  fetchSlots,
  userRole,
  activeVehicles = [],
  syncAllData,
  onSelectVehicle
}: SlotsViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  
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
      if (syncAllData) syncAllData();
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
      if (syncAllData) syncAllData();
    } catch (err: any) {
      setError(err.message || 'Error deleting slot');
    }
  };

  const toggleSlotStatus = async (slot: Slot) => {
    const newStatus = slot.status === 'available' ? 'occupied' : 'available';
    try {
      await api.put(`/api/parking/slots/${slot._id}`, { status: newStatus });
      fetchSlots();
      if (syncAllData) syncAllData();
      
      // Keep selected slot state updated in UI if it's currently open
      if (selectedSlot && selectedSlot._id === slot._id) {
        setSelectedSlot({ ...selectedSlot, status: newStatus });
      }
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

  // Calculate duration elapsed for a vehicle
  const formatElapsed = (entryTimeString: string) => {
    const entry = new Date(entryTimeString);
    const now = new Date();
    const diffMs = now.getTime() - entry.getTime();
    if (diffMs < 0) return 'Just checked in';
    
    const diffMins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    if (hrs === 0) return `${mins} mins`;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="p-6 space-y-6" id="slots-screen">
      {/* Title Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-sans font-extrabold text-slate-800">Parking Slots Map</h2>
          <p className="text-xs text-slate-500">Configure layouts, inspect parked vehicle credentials, and toggle status</p>
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md transition-all text-xs font-semibold cursor-pointer shadow-sm"
          >
            <Plus size={16} /> Add Slot
          </button>
        )}
      </div>

      {/* Message banners */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-mono rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-mono rounded-xl">
          {success}
        </div>
      )}

      {/* Filters Panel bar */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search slot number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        {/* Floor selector */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <Filter size={11} className="text-indigo-600 shrink-0" />
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 outline-none w-full sm:w-auto"
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
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 outline-none w-full sm:w-auto"
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
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 outline-none w-full sm:w-auto"
        >
          <option value="all">All Statuses</option>
          <option value="available">Available Only</option>
          <option value="occupied">Occupied Only</option>
        </select>
      </div>

      {/* Grid of Slots (interactive cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {filteredSlots.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 font-mono text-xs bg-white border border-slate-200 rounded-2xl">
            No parking slots match the selected criteria.
          </div>
        ) : (
          filteredSlots.map((slot) => {
            const isOccupied = slot.status === 'occupied';
            const fName = floors.find((f) => f._id === slot.floorId)?.name || 'Ground';

            // Find matching vehicle parked here (matched by Slot ID or Slot Number)
            const parkedVehicle = activeVehicles.find(
              (v) => v.assignedSlot === slot._id || v.assignedSlot === slot.slotNumber
            );

            return (
              <motion.div
                key={slot._id}
                whileHover={{ scale: 1.03 }}
                onClick={() => setSelectedSlot(slot)}
                className={`relative border p-3.5 rounded-xl flex flex-col items-center justify-between h-24 select-none group transition-all shadow-sm cursor-pointer ${
                  isOccupied
                    ? 'bg-red-50/70 border-red-200 text-red-700 hover:border-red-300'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-700 hover:border-emerald-300'
                }`}
              >
                {/* Micro Floor code badge */}
                <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-400 truncate max-w-full">
                  {fName.substring(0, 10)}
                </span>

                {/* Big Slot Label */}
                <span className="text-sm font-sans font-extrabold text-slate-800 leading-none">
                  {slot.slotNumber}
                </span>

                {/* Type & Manual toggle icon */}
                <div className="flex items-center gap-1.5 w-full justify-between mt-1">
                  <span className="text-[9px] font-mono font-bold uppercase px-1 rounded bg-white border border-slate-200 text-slate-500">
                    {slot.slotType}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Avoid opening the detail dialog
                      toggleSlotStatus(slot);
                    }}
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                      isOccupied ? 'border-red-500 bg-red-500 text-white' : 'border-emerald-500 bg-transparent text-transparent hover:text-emerald-500'
                    }`}
                    title={isOccupied ? 'Set Available' : 'Set Occupied'}
                  >
                    <Check size={8} strokeWidth={3} />
                  </button>
                </div>

                {/* Occupied Visual indicator dot */}
                {isOccupied && parkedVehicle && (
                  <div className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </div>
                )}

                {/* Hover Admin Delete Action */}
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Avoid opening dialog
                      handleDeleteSlot(slot._id, slot.slotNumber);
                    }}
                    className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-white border border-slate-200 text-red-500 flex items-center justify-center scale-0 group-hover:scale-100 transition-all shadow-md cursor-pointer hover:bg-red-50"
                  >
                    <X size={10} />
                  </button>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Interactive Slot Detail Drawer / Modal Panel */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-sans font-extrabold text-slate-800 text-base">Slot {selectedSlot.slotNumber} Info</span>
                <span className={`text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-full font-bold ${
                  selectedSlot.status === 'occupied'
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  {selectedSlot.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedSlot(null)}
                className="p-1.5 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer border border-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Core Slot specs */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-5 text-xs">
              <div>
                <div className="text-[10px] text-slate-400 font-mono uppercase">Assigned Floor</div>
                <div className="font-bold text-slate-800 mt-0.5">
                  {floors.find((f) => f._id === selectedSlot.floorId)?.name || 'Ground Level'}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-mono uppercase">Category Allowed</div>
                <div className="font-bold text-slate-800 mt-0.5 flex items-center gap-1.5 capitalize">
                  {selectedSlot.slotType === 'car' && <Car size={13} className="text-blue-500" />}
                  {selectedSlot.slotType === 'bike' && <Bike size={13} className="text-emerald-500" />}
                  {selectedSlot.slotType === 'truck' && <Truck size={13} className="text-amber-500" />}
                  {selectedSlot.slotType}
                </div>
              </div>
            </div>

            {/* Parked Car & Owner details section */}
            {selectedSlot.status === 'occupied' ? (
              (() => {
                const vehicle = activeVehicles.find(
                  (v) => v.assignedSlot === selectedSlot._id || v.assignedSlot === selectedSlot.slotNumber
                );

                if (!vehicle) {
                  return (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center">
                      <p className="font-bold">Occupancy state discrepancy</p>
                      <p className="opacity-80 mt-1">Slot is toggled to Occupied, but no live vehicle is currently assigned.</p>
                      <button
                        onClick={() => toggleSlotStatus(selectedSlot)}
                        className="mt-3.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                      >
                        Reset Slot to Available
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="border border-slate-100 rounded-xl p-4 space-y-3.5 bg-white shadow-sm">
                      <div className="text-[10px] text-indigo-600 font-mono font-bold uppercase tracking-wider">Parked Vehicle Credentials</div>
                      
                      {/* Plate number */}
                      <div className="flex items-center gap-3 border-b border-slate-50 pb-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 border border-slate-200">
                          {vehicle.vehicleType === 'car' && <Car size={18} />}
                          {vehicle.vehicleType === 'bike' && <Bike size={18} />}
                          {vehicle.vehicleType === 'truck' && <Truck size={18} />}
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-400 font-mono">REGISTRATION PLATE</div>
                          <div className="text-base font-extrabold text-slate-900 font-mono tracking-wider uppercase">
                            {vehicle.vehicleNumber}
                          </div>
                        </div>
                      </div>

                      {/* Owner Info */}
                      <div className="flex items-center gap-3 border-b border-slate-50 pb-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 border border-slate-200">
                          <User size={18} />
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-400 font-mono">OWNER / OPERATOR</div>
                          <div className="text-sm font-bold text-slate-800">
                            {vehicle.ownerName || 'Guest Driver'}
                          </div>
                        </div>
                      </div>

                      {/* Time info */}
                      <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-400 font-mono block">CHECKED IN</span>
                          <div className="font-bold text-slate-700 flex items-center gap-1">
                            <Clock size={12} className="text-slate-400" />
                            {new Date(vehicle.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-400 font-mono block">ELAPSED TIME</span>
                          <div className="font-extrabold text-indigo-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse shrink-0"></span>
                            {formatElapsed(vehicle.entryTime)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100">
                      {onSelectVehicle && (
                        <button
                          onClick={() => {
                            setSelectedSlot(null);
                            onSelectVehicle(vehicle);
                          }}
                          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 pt-3.5 cursor-pointer"
                        >
                          <CreditCard size={14} /> Process Billing & Checkout <ArrowRight size={14} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => toggleSlotStatus(selectedSlot)}
                        className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Reset Slot to Vacant Manually
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="space-y-4">
                <div className="border border-slate-100 rounded-xl p-6 text-center space-y-2 bg-slate-50/50">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                    <Check size={20} />
                  </div>
                  <p className="text-xs font-bold text-slate-700">Slot Vacant & Clean</p>
                  <p className="text-[11px] text-slate-500">Ready to accommodate incoming {selectedSlot.slotType} parking requests.</p>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => toggleSlotStatus(selectedSlot)}
                    className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer border border-indigo-100"
                  >
                    Toggle Slot to Occupied Manually
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Add Slot Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <span className="font-sans font-bold text-slate-900 text-sm">Add Parking Slot</span>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border border-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-500">SLOT NUMBER / CODE</label>
                <input
                  type="text"
                  placeholder="e.g. G-C06"
                  value={slotNumber}
                  onChange={(e) => setSlotNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-850 placeholder-slate-400 focus:border-indigo-500 outline-none uppercase"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-500">ASSIGNED FLOOR</label>
                <select
                  value={floorId}
                  onChange={(e) => setFloorId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 outline-none"
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
                <label className="text-[10px] font-mono font-bold text-slate-500">SLOT CATEGORY TYPE</label>
                <select
                  value={slotType}
                  onChange={(e) => setSlotType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 outline-none"
                  required
                >
                  <option value="car">Car (Standard)</option>
                  <option value="bike">Bike (50% Tariff Off)</option>
                  <option value="truck">Truck (2x Tariff Surcharge)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all pt-3 cursor-pointer"
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
