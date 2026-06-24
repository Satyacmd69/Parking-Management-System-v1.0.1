import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, ShieldAlert, Key, Save, DollarSign, BellRing, Eye } from 'lucide-react';

export function SettingsView() {
  const [success, setSuccess] = useState('');
  
  // Local Config values
  const [baseFee, setBaseFee] = useState('20');
  const [hourlyFee, setHourlyFee] = useState('10');
  const [gracePeriod, setGracePeriod] = useState('15');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('Tariff and configuration rules updated successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6" id="settings-screen">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-sans font-extrabold text-white flex items-center gap-2">
          <Settings className="text-indigo-500" /> Tariff & System Settings
        </h2>
        <p className="text-xs text-slate-400">Configure global garage pricing structures and alerts triggers</p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-xl">
          {success}
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
        {/* Tariff section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <DollarSign size={14} className="text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Hourly Parking Tariffs (INR)</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* First Hour Base */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400">BASE TARIFF (FIRST HOUR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600">₹</span>
                <input
                  type="number"
                  value={baseFee}
                  onChange={(e) => setBaseFee(e.target.value)}
                  className="w-full bg-[#09090b] border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs font-bold text-white focus:border-indigo-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Next Hour Increment */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400">ADDITIONAL HOURLY RATE</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600">₹</span>
                <input
                  type="number"
                  value={hourlyFee}
                  onChange={(e) => setHourlyFee(e.target.value)}
                  className="w-full bg-[#09090b] border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs font-bold text-white focus:border-indigo-500 outline-none"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Categories tariff multipliers notice */}
        <div className="p-3 bg-white/5 rounded-xl border border-slate-800 space-y-2">
          <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest">Pricing Class Multipliers</span>
          <div className="grid grid-cols-3 gap-2 font-mono text-[9px] text-slate-400 text-center">
            <div className="p-1.5 rounded bg-[#09090b] border border-slate-800">
              <div className="font-bold text-white">BIKE CLASS</div>
              <div className="text-emerald-400 font-semibold mt-0.5">50% DISCOUNT</div>
            </div>
            <div className="p-1.5 rounded bg-[#09090b] border border-slate-800">
              <div className="font-bold text-white">CAR CLASS</div>
              <div className="text-slate-400 font-semibold mt-0.5">NORMAL (1.0x)</div>
            </div>
            <div className="p-1.5 rounded bg-[#09090b] border border-slate-800">
              <div className="font-bold text-white">TRUCK CLASS</div>
              <div className="text-amber-500 font-semibold mt-0.5">2.0x SURCHARGE</div>
            </div>
          </div>
        </div>

        {/* Grace period setting */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <BellRing size={14} className="text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Check-out Grace Settings</h3>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-slate-400">UNPAID GRACE PERIOD (MINUTES)</label>
            <input
              type="number"
              value={gracePeriod}
              onChange={(e) => setGracePeriod(e.target.value)}
              className="w-full bg-[#09090b] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
              required
            />
            <p className="text-[9px] text-slate-500 font-medium">Allows operators to check out vehicles within this threshold buffer without triggering next hour costs.</p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-1.5 pt-3 cursor-pointer"
        >
          <Save size={14} /> Commit Changes
        </button>
      </form>
    </div>
  );
}
