import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LogOut, Search, Car, Clock, IndianRupee, CreditCard, ChevronRight, Check } from 'lucide-react';
import { Vehicle, Transaction } from '../types';
import { api } from '../utils/api';
import { ReceiptPrint } from './ReceiptPrint';

interface ExitViewProps {
  activeVehicles: Vehicle[];
  fetchActiveVehicles: () => void;
  fetchDashboardMetrics: () => void;
  fetchSlots: () => void;
  fetchFloors: () => void;
  selectedVehicleFromOutside: Vehicle | null;
  clearOutsideVehicleSelection: () => void;
}

export function ExitView({
  activeVehicles,
  fetchActiveVehicles,
  fetchDashboardMetrics,
  fetchSlots,
  fetchFloors,
  selectedVehicleFromOutside,
  clearOutsideVehicleSelection
}: ExitViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [billingDetails, setBillingDetails] = useState<{ durationMins: number; amount: number } | null>(null);

  const [loadingBill, setLoadingBill] = useState(false);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkoutReceipt, setCheckoutReceipt] = useState<{ vehicle: Vehicle; transaction: Transaction } | null>(null);

  // If a vehicle was selected from the Dashboard, auto-select it here
  useEffect(() => {
    if (selectedVehicleFromOutside) {
      handleSelectVehicle(selectedVehicleFromOutside);
      clearOutsideVehicleSelection();
    }
  }, [selectedVehicleFromOutside]);

  const handleSelectVehicle = async (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setBillingDetails(null);
    setError('');
    setLoadingBill(true);

    try {
      const bill = await api.get(`/api/parking/vehicles/calculate-charges/${vehicle._id}`);
      setBillingDetails(bill);
    } catch (err: any) {
      setError(err.message || 'Error calculating charges');
    } finally {
      setLoadingBill(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedVehicle || !billingDetails) return;
    setError('');
    setProcessingCheckout(true);

    try {
      const response = await api.post(`/api/parking/vehicles/checkout/${selectedVehicle._id}`, {
        amount: billingDetails.amount,
        durationMins: billingDetails.durationMins,
        paymentStatus: 'paid'
      });

      setSuccess(`Vehicle ${selectedVehicle.vehicleNumber} checked out successfully!`);
      setCheckoutReceipt({
        vehicle: response.vehicle,
        transaction: response.transaction
      });

      // Clear current state
      setSelectedVehicle(null);
      setBillingDetails(null);

      // Refresh data
      fetchActiveVehicles();
      fetchDashboardMetrics();
      fetchSlots();
      fetchFloors();
    } catch (err: any) {
      setError(err.message || 'Error checking out vehicle');
    } finally {
      setProcessingCheckout(false);
    }
  };

  const filteredVehicles = activeVehicles.filter(v =>
    v.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.assignedSlot.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6" id="exit-screen">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4 mb-4">
        <h2 className="text-xl font-sans font-extrabold text-white flex items-center gap-2">
          <LogOut className="text-indigo-500" /> Vehicle Check-Out & Bill
        </h2>
        <p className="text-xs text-slate-400">Process checkout bills, inspect tariff factors, and generate invoices</p>
      </div>

      {/* Message banners */}
      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-xl">
          {success}
        </div>
      )}

      {/* Main Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Select Active Vehicle */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Parked Vehicles ({filteredVehicles.length})</h3>
            <div className="relative w-48">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0c0c0e] border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-[11px] text-white placeholder-slate-700 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {filteredVehicles.length === 0 ? (
              <div className="text-center py-12 text-slate-600 font-mono text-xs">
                No active parkings found inside the garage.
              </div>
            ) : (
              filteredVehicles.map((v) => {
                const isSelected = selectedVehicle?._id === v._id;
                const hrs = Math.ceil((new Date().getTime() - new Date(v.entryTime).getTime()) / (60 * 60 * 1000));
                
                return (
                  <div
                    key={v._id}
                    onClick={() => handleSelectVehicle(v)}
                    className={`p-3 rounded-xl border flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400 font-bold'
                        : 'bg-transparent border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5 border border-slate-800 text-slate-300 shrink-0">
                        <Car size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold font-mono tracking-wider text-white">
                          {v.vehicleNumber}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {v.ownerName} · <span className="capitalize">{v.vehicleType}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div className="hidden sm:block font-mono text-[10px] text-slate-500">
                        <div>SLOT</div>
                        <div className="text-indigo-400 font-bold text-xs">{v.assignedSlot}</div>
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">
                        <div>ELAPSED</div>
                        <div className="text-white font-bold">{hrs} Hr(s)</div>
                      </div>
                      <ChevronRight size={14} className="text-slate-600 shrink-0" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Bill calculation & checkout confirmation panel */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4 relative">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">Checkout Bill</h3>

          {selectedVehicle ? (
            <div className="space-y-4">
              {/* Selected Vehicle Info */}
              <div className="bg-white/5 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono font-bold text-indigo-400 tracking-wider">SELECTED VEHICLE</div>
                <div className="text-sm font-bold text-white font-mono tracking-wide">{selectedVehicle.vehicleNumber}</div>
                <div className="text-[10px] text-slate-400">
                  Slot: <span className="font-bold text-indigo-300 font-mono">{selectedVehicle.assignedSlot}</span>
                </div>
              </div>

              {/* Loader */}
              {loadingBill ? (
                <div className="flex items-center justify-center py-8 text-slate-500 font-mono text-xs">
                  Calculating charges...
                </div>
              ) : billingDetails ? (
                <div className="space-y-4">
                  {/* Calculations details */}
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between border-b border-slate-800 pb-1 text-slate-400">
                      <span>Tariff duration</span>
                      <span className="text-white font-bold">{Math.round(billingDetails.durationMins)} Min</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1 text-slate-400">
                      <span>Category Factor</span>
                      <span className="text-white font-bold capitalize">{selectedVehicle.vehicleType}</span>
                    </div>
                    <div className="flex justify-between text-indigo-400 font-bold border-b border-slate-800 pb-1.5 pt-1">
                      <span>Total Parking Fee</span>
                      <span className="text-lg text-emerald-400">₹{billingDetails.amount}</span>
                    </div>
                  </div>

                  {/* Pricing logic helper card */}
                  <div className="bg-white/5 border border-slate-800 p-2 rounded-lg text-[9px] font-mono text-slate-500 leading-normal">
                    * TARIEF: First hour = ₹20. Next hour = ₹10. Bike category enjoys a 50% discount. Trucks have a 2x surcharge.
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={processingCheckout}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Check size={14} /> {processingCheckout ? 'Processing Checkout...' : 'Record Payment & Free Slot'}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 font-mono text-xs">
              Select an active parked vehicle on the left to compute current dues.
            </div>
          )}
        </div>
      </div>

      {/* Receipts print modal */}
      {checkoutReceipt && (
        <ReceiptPrint
          vehicle={checkoutReceipt.vehicle}
          transaction={checkoutReceipt.transaction}
          onClose={() => setCheckoutReceipt(null)}
        />
      )}
    </div>
  );
}
