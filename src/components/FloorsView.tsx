import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Layers, Plus, Trash2, Edit2, Check, X, ShieldAlert, CircleDot } from 'lucide-react';
import { Floor } from '../types';
import { api } from '../utils/api';

interface FloorsViewProps {
  floors: (Floor & { occupiedSlots?: number; availableSlots?: number; totalSlots?: number })[];
  fetchFloors: () => void;
  userRole: 'admin' | 'staff';
}

export function FloorsView({ floors, fetchFloors, userRole }: FloorsViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFloor, setEditingFloor] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [floorNumber, setFloorNumber] = useState('');
  const [floorName, setFloorName] = useState('');
  const [autoCreateSlots, setAutoCreateSlots] = useState(true);
  const [editName, setEditName] = useState('');

  const isAdmin = userRole === 'admin';

  const handleAddFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (floorNumber === '' || !floorName) {
      setError('All fields are required');
      return;
    }

    try {
      await api.post('/api/parking/floors', {
        floorNumber: Number(floorNumber),
        name: floorName,
        autoCreateSlots
      });
      setSuccess('Floor created successfully!');
      setFloorNumber('');
      setFloorName('');
      setShowAddModal(false);
      fetchFloors();
    } catch (err: any) {
      setError(err.message || 'Error creating floor');
    }
  };

  const handleDeleteFloor = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this floor? All associated slots and active parkings will be cascade-deleted!')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/api/parking/floors/${id}`);
      setSuccess('Floor and associated slots deleted successfully!');
      fetchFloors();
    } catch (err: any) {
      setError(err.message || 'Error deleting floor');
    }
  };

  const handleSaveEdit = async (id: string) => {
    setError('');
    setSuccess('');
    try {
      await api.put(`/api/parking/floors/${id}`, { name: editName });
      setSuccess('Floor updated successfully');
      setEditingFloor(null);
      fetchFloors();
    } catch (err: any) {
      setError(err.message || 'Error updating floor');
    }
  };

  return (
    <div className="p-6 space-y-6" id="floors-screen">
      {/* Title Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-sans font-extrabold text-white">Parking Floors</h2>
          <p className="text-xs text-slate-400">Configure layout floors and inspect level-by-level capacity</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all text-xs font-semibold cursor-pointer"
          >
            <Plus size={16} /> Create Floor
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

      {/* Floors grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {floors.map((floor) => {
          const total = floor.totalSlots || 0;
          const occupied = floor.occupiedSlots || 0;
          const available = floor.availableSlots || 0;
          const percentage = total > 0 ? Math.round((occupied / total) * 100) : 0;

          const isEditing = editingFloor === floor._id;

          return (
            <motion.div
              key={floor._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/40 border border-white/5 backdrop-blur-md rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden"
            >
              {/* Floor identity header */}
              <div className="flex items-start justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400 border border-white/5">
                    <Layers size={18} />
                  </div>
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-slate-950 border border-white/10 rounded px-2 py-0.5 text-xs font-bold text-white max-w-40"
                      />
                    ) : (
                      <h3 className="font-sans font-bold text-white text-sm">{floor.name}</h3>
                    )}
                    <span className="text-[10px] font-mono text-slate-500 font-bold tracking-wider">
                      LEVEL 0{floor.floorNumber}
                    </span>
                  </div>
                </div>

                {/* Edit Actions for Admin */}
                {isAdmin && (
                  <div className="flex gap-1.5">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(floor._id)}
                          className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                          title="Save Changes"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={() => setEditingFloor(null)}
                          className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors"
                          title="Cancel"
                        >
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingFloor(floor._id);
                            setEditName(floor.name);
                          }}
                          className="p-1 rounded bg-white/5 text-slate-400 hover:text-white transition-colors"
                          title="Edit Name"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteFloor(floor._id)}
                          className="p-1 rounded bg-red-950/40 text-red-400 hover:bg-red-950/80 transition-colors"
                          title="Delete Floor"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Progress and indicators */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Occupancy Rate:</span>
                  <span className="font-mono font-bold text-white">{percentage}%</span>
                </div>

                {/* Simulated Glass track Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-950 border border-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentage >= 80 ? 'bg-red-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Counter blocks */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[10px] font-mono">
                  <div className="bg-white/5 border border-white/5 p-2 rounded-xl">
                    <div className="text-slate-400 font-bold mb-0.5">TOTAL</div>
                    <div className="text-xs text-white font-extrabold">{total}</div>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/10 p-2 rounded-xl text-red-400">
                    <div className="font-bold mb-0.5">PARKED</div>
                    <div className="text-xs font-extrabold">{occupied}</div>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-xl text-emerald-400">
                    <div className="font-bold mb-0.5">FREE</div>
                    <div className="text-xs font-extrabold">{available}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create floor modal overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <span className="font-sans font-bold text-white text-sm">Add Layout Floor</span>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddFloor} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400">FLOOR NUMBER</label>
                <input
                  type="number"
                  placeholder="e.g. 3"
                  value={floorNumber}
                  onChange={(e) => setFloorNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400">FLOOR NAME / LABEL</label>
                <input
                  type="text"
                  placeholder="e.g. Third Floor"
                  value={floorName}
                  onChange={(e) => setFloorName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="autoCreate"
                  checked={autoCreateSlots}
                  onChange={(e) => setAutoCreateSlots(e.target.checked)}
                  className="rounded border-white/10 bg-slate-950 text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="autoCreate" className="text-[10px] font-semibold text-slate-300 cursor-pointer select-none">
                  Auto-create 7 standard slots (Car/Bike/Truck)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all pt-3 cursor-pointer"
              >
                Assemble Floor
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
