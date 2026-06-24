import { motion } from 'motion/react';
import { Printer, X, Check, QrCode } from 'lucide-react';
import { Vehicle } from '../types';

interface TicketPrintProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export function TicketPrint({ vehicle, onClose }: TicketPrintProps) {
  if (!vehicle) return null;

  const qrData = `VEHICLE:${vehicle.vehicleNumber}|SLOT:${vehicle.assignedSlot}|TIME:${vehicle.entryTime}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=0f172a&data=${encodeURIComponent(qrData)}`;

  const handlePrint = () => {
    const printContent = document.getElementById('thermal-ticket-print');
    if (!printContent) return;
    
    const originalContent = document.body.innerHTML;
    const printWindow = window.open('', '', 'height=600,width=400');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print Parking Ticket</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
        body { font-family: 'Courier New', Courier, monospace; color: #000; padding: 20px; text-align: center; }
        .divider { border-top: 1px dashed #000; margin: 10px 0; }
        .ticket-title { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
        .fields { text-align: left; font-size: 14px; margin-left: 10px; line-height: 1.6; }
        .qr { margin: 15px auto; width: 120px; height: 120px; }
      `);
      printWindow.document.write('</style></head><body>');
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      // Wait for image to load to ensure QR is printed
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" id="ticket-print-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-sans font-semibold text-white">Entry Ticket Generated</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Paper Mockup Container */}
        <div className="bg-slate-950 p-4 rounded-xl border border-white/5 mb-6 flex justify-center">
          {/* Thermal Ticket visual */}
          <div
            id="thermal-ticket-print"
            className="bg-white text-slate-900 p-6 shadow-inner w-full max-w-[260px] relative font-mono text-xs text-center border-t-8 border-indigo-400"
          >
            {/* Ticket jagged effect placeholder */}
            <div className="absolute -top-3 left-0 right-0 h-1 flex justify-between">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="w-2.5 h-1.5 bg-slate-900 rounded-b-full transform -translate-y-0.5" />
              ))}
            </div>

            <div className="ticket-title uppercase font-extrabold tracking-wider text-base text-indigo-950">
              SMART PARKING
            </div>
            <p className="text-[9px] text-slate-500">123 SaaS High Street, Tech Hub</p>
            <p className="text-[9px] text-slate-500">PH: +91 98765 43210</p>

            <div className="divider border-t border-dashed border-slate-300 my-3" />

            <div className="fields space-y-2 text-left text-[11px] font-semibold text-slate-800">
              <div className="flex justify-between">
                <span>TICKET ID:</span>
                <span className="font-bold text-slate-950">PRK-{vehicle._id.substring(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>VEHICLE:</span>
                <span className="font-bold text-slate-950">{vehicle.vehicleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>TYPE:</span>
                <span className="font-bold uppercase text-slate-950">{vehicle.vehicleType}</span>
              </div>
              <div className="flex justify-between">
                <span>OWNER:</span>
                <span className="text-slate-950">{vehicle.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span>ENTRY TIME:</span>
                <span className="text-slate-950">
                  {new Date(vehicle.entryTime).toLocaleDateString()} {new Date(vehicle.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between items-center border border-slate-300 p-1 bg-slate-50 rounded mt-2">
                <span className="font-bold text-[10px]">ASSIGNED SLOT:</span>
                <span className="font-extrabold text-indigo-600 text-sm">{vehicle.assignedSlot}</span>
              </div>
            </div>

            <div className="divider border-t border-dashed border-slate-300 my-3" />

            {/* QR Code Graphic */}
            <div className="my-4 flex flex-col items-center justify-center">
              <img
                src={qrUrl}
                alt="QR Ticket Code"
                className="w-28 h-28 border border-slate-200 p-1 bg-white rounded"
                referrerPolicy="no-referrer"
              />
              <span className="text-[8px] text-slate-400 mt-1 uppercase tracking-widest">SCAN AT CHECK-OUT</span>
            </div>

            <div className="divider border-t border-dashed border-slate-300 my-3" />

            <p className="text-[10px] italic text-slate-600">Thank you for parking with us!</p>
            <p className="text-[9px] text-slate-400 mt-1">Please keep this ticket safe.</p>

            {/* Jagged bottom effect placeholder */}
            <div className="absolute -bottom-1 left-0 right-0 h-1 flex justify-between overflow-hidden">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="w-2.5 h-1.5 bg-slate-900 rounded-t-full transform translate-y-0.5" />
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold"
          >
            <Check size={14} /> Okay, Done
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all text-xs font-semibold"
          >
            <Printer size={14} /> Print Ticket
          </button>
        </div>
      </motion.div>
    </div>
  );
}
