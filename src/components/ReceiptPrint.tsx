import { motion } from 'motion/react';
import { Printer, X, CreditCard, Download, CheckCircle2 } from 'lucide-react';
import { Vehicle, Transaction } from '../types';

interface ReceiptPrintProps {
  vehicle: Vehicle;
  transaction: Transaction;
  onClose: () => void;
}

export function ReceiptPrint({ vehicle, transaction, onClose }: ReceiptPrintProps) {
  const handlePrint = () => {
    const printContent = document.getElementById('receipt-print-content');
    if (!printContent) return;

    const printWindow = window.open('', '', 'height=600,width=500');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print Tax Invoice Receipt</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
        body { font-family: 'Courier New', Courier, monospace; color: #000; padding: 25px; line-height: 1.5; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .divider { border-top: 1px dashed #000; margin: 12px 0; }
        .double-divider { border-top: 3px double #000; margin: 12px 0; }
        .invoice-title { font-size: 18px; font-weight: bold; letter-spacing: 1px; }
        .flex { display: flex; justify-content: space-between; }
        .items { font-size: 13px; margin: 15px 0; }
        .totals { font-size: 14px; font-weight: bold; }
      `);
      printWindow.document.write('</style></head><body>');
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const entryDate = new Date(vehicle.entryTime);
  const exitDate = vehicle.exitTime ? new Date(vehicle.exitTime) : new Date();

  // Calculate detailed items for explanation
  const mins = transaction.duration;
  const hours = Math.ceil(mins / 60);
  const baseRate = 20;
  const additionalHours = Math.max(0, hours - 1);
  const additionalCost = additionalHours * 10;
  const subtotal = baseRate + additionalCost;

  let multiplierText = "Normal (1x)";
  if (vehicle.vehicleType === 'bike') multiplierText = "Bike Discount (0.5x)";
  if (vehicle.vehicleType === 'truck') multiplierText = "Truck Surcharge (2.0x)";

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" id="receipt-print-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        {/* Success Icon */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="font-sans font-bold text-white text-lg">Checkout Completed</h3>
          <p className="text-xs text-slate-400 text-center">Receipt and Transaction registered successfully.</p>
        </div>

        {/* Paper visual wrapper */}
        <div className="bg-slate-950 p-4 rounded-xl border border-white/5 mb-6">
          <div
            id="receipt-print-content"
            className="bg-white text-slate-900 p-6 rounded shadow-inner font-mono text-xs"
          >
            <div className="text-center">
              <div className="invoice-title font-bold text-slate-950 uppercase text-sm">SMART PARKING SOLUTIONS</div>
              <div className="text-[9px] text-slate-500">TAX INVOICE / PARKING RECEIPT</div>
              <div className="text-[9px] text-slate-500">GSTIN: 29AAAAA1111A1Z1</div>
            </div>

            <div className="divider border-t border-dashed border-slate-300 my-3" />

            {/* Receipt Info */}
            <div className="space-y-1.5 text-[11px] text-slate-800">
              <div className="flex">
                <span>INVOICE NO:</span>
                <span className="font-bold">INV-{transaction._id.substring(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex">
                <span>DATE/TIME:</span>
                <span>{exitDate.toLocaleDateString()} {exitDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex">
                <span>VEHICLE NO:</span>
                <span className="font-bold">{vehicle.vehicleNumber}</span>
              </div>
              <div className="flex">
                <span>CATEGORY:</span>
                <span className="capitalize">{vehicle.vehicleType}</span>
              </div>
              <div className="flex">
                <span>PARKING SLOT:</span>
                <span className="font-bold text-indigo-600">{vehicle.assignedSlot}</span>
              </div>
            </div>

            <div className="divider border-t border-dashed border-slate-300 my-3" />

            {/* Timings */}
            <div className="space-y-1 text-[10px] text-slate-700 bg-slate-50 p-2 rounded">
              <div className="flex">
                <span>ENTRY TIME:</span>
                <span>{entryDate.toLocaleDateString()} {entryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex">
                <span>EXIT TIME:</span>
                <span>{exitDate.toLocaleDateString()} {exitDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex border-t border-slate-200 mt-1 pt-1 font-semibold text-slate-900">
                <span>TOTAL DURATION:</span>
                <span>{hours} Hour(s) ({mins} Min)</span>
              </div>
            </div>

            <div className="divider border-t border-dashed border-slate-300 my-3" />

            {/* Charges Breakdown */}
            <div className="items space-y-1.5 text-[11px] text-slate-800">
              <div className="flex">
                <span>First 1 Hour (Base):</span>
                <span>₹{baseRate}.00</span>
              </div>
              {additionalHours > 0 && (
                <div className="flex">
                  <span>Next {additionalHours} Hr(s) (₹10/hr):</span>
                  <span>₹{additionalCost}.00</span>
                </div>
              )}
              <div className="flex font-semibold text-slate-900 pt-1">
                <span>Subtotal:</span>
                <span>₹{subtotal}.00</span>
              </div>
              <div className="flex text-slate-500 italic text-[10px]">
                <span>Category Factor:</span>
                <span>{multiplierText}</span>
              </div>
            </div>

            <div className="double-divider border-t-4 border-double border-slate-400 my-3" />

            {/* Total */}
            <div className="totals flex text-sm text-slate-950 font-bold">
              <span>TOTAL CHARGE:</span>
              <span className="text-base text-indigo-700">₹{transaction.amount}.00</span>
            </div>

            <div className="flex text-[10px] text-slate-600 mt-1 font-semibold">
              <span>PAYMENT STATUS:</span>
              <span className="text-emerald-600 uppercase font-bold tracking-wider">{transaction.paymentStatus}</span>
            </div>
            <div className="flex text-[10px] text-slate-600">
              <span>PAID VIA:</span>
              <span className="font-semibold">CASH / UPI ONLINE</span>
            </div>

            <div className="divider border-t border-dashed border-slate-300 my-3" />

            <div className="text-center text-[10px] text-slate-500">
              <p>HASSLE FREE PARKING SOLUTIONS</p>
              <p className="text-[8px] mt-0.5 text-slate-400">OPERATED BY SMART-PARK ENGINE v2.0</p>
            </div>
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold"
          >
            Done & Return
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all text-xs font-semibold"
          >
            <Printer size={14} /> Print Receipt
          </button>
        </div>
      </motion.div>
    </div>
  );
}
