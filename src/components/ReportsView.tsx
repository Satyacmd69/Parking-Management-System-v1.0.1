import { useState } from 'react';
import { motion } from 'motion/react';
import { FileBarChart2, Download, Search, Table, RefreshCw, Layers, ShieldCheck, Filter } from 'lucide-react';
import { Transaction, AuditLog } from '../types';

interface ReportsViewProps {
  transactions: Transaction[];
  auditLogs: AuditLog[];
  onRefresh: () => void;
  userRole: 'admin' | 'staff';
}

export function ReportsView({
  transactions,
  auditLogs,
  onRefresh,
  userRole
}: ReportsViewProps) {
  const [activeTab, setActiveTab] = useState<'transactions' | 'audit'>('transactions');
  const [txSearch, setTxSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState('all');

  const isAdmin = userRole === 'admin';

  // Total completed figures
  const totalCompletedCount = transactions.length;
  const totalCompletedRev = transactions.reduce((sum, t) => sum + t.amount, 0);
  const avgTicketVal = totalCompletedCount > 0 ? Math.round(totalCompletedRev / totalCompletedCount) : 0;

  // Search transactions
  const filteredTransactions = transactions.filter(t =>
    t.vehicleNumber.toLowerCase().includes(txSearch.toLowerCase()) ||
    t._id.toLowerCase().includes(txSearch.toLowerCase()) ||
    t.paymentStatus.toLowerCase().includes(txSearch.toLowerCase())
  );

  // Filter audit logs
  const filteredAudits = auditLogs.filter(log =>
    auditFilter === 'all' || log.type === auditFilter
  );

  // Dynamic CSV Export Helper
  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    
    // Construct CSV Header and rows
    const headers = ['Transaction ID', 'Vehicle Number', 'Duration (Mins)', 'Collected Amount (₹)', 'Payment Status', 'Timestamp'];
    const rows = transactions.map(t => [
      t._id,
      t.vehicleNumber,
      t.duration,
      t.amount,
      t.paymentStatus,
      t.timestamp
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Spark_Parking_Revenue_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6" id="reports-screen">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-sans font-extrabold text-white">Revenue Reports & Audit Logs</h2>
          <p className="text-xs text-slate-400">Inspect historical transactions, log actions, and export metrics</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            className="p-2 bg-white/5 border border-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Reload Data"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Numerical aggregate widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[9px] font-mono font-bold text-slate-500">COLLECTED TOTALS</span>
          <span className="text-xl font-bold text-emerald-400 font-sans mt-1">₹{totalCompletedRev}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Across all parking durations</span>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[9px] font-mono font-bold text-slate-500">TRANSACTIONS COUNT</span>
          <span className="text-xl font-bold text-white font-sans mt-1">{totalCompletedCount} TX</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Checked out vehicles</span>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[9px] font-mono font-bold text-slate-500">AVERAGE TICKET FEE</span>
          <span className="text-xl font-bold text-indigo-400 font-sans mt-1">₹{avgTicketVal}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Avg collected per vehicle</span>
        </div>
      </div>

      {/* Tabs list */}
      <div className="border-b border-white/5 flex gap-4">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'transactions' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Revenue Transactions
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'audit' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Security Audit Logs
        </button>
      </div>

      {/* Content panes */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 shadow-xl">
        {activeTab === 'transactions' ? (
          <div className="space-y-4">
            {/* Filter */}
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white">Completed Bills History</span>
              <div className="relative w-48">
                <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter Vehicle..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-lg pl-7 pr-3 py-1 text-[11px] text-white placeholder-slate-700 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-white/5 pb-2">
                    <th className="font-mono font-bold pb-2">TRANSACTION ID</th>
                    <th className="font-mono font-bold pb-2">VEHICLE NO</th>
                    <th className="font-mono font-bold pb-2">DURATION</th>
                    <th className="font-mono font-bold pb-2">DUES</th>
                    <th className="font-mono font-bold pb-2">STATUS</th>
                    <th className="font-mono font-bold pb-2 text-right">DATE TIME</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-600 font-mono">
                        No transactions registered.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(t => (
                      <tr key={t._id} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 font-mono text-slate-500">TX-{t._id.substring(0, 8).toUpperCase()}</td>
                        <td className="py-2.5 font-bold font-mono tracking-wider text-slate-200">{t.vehicleNumber}</td>
                        <td className="py-2.5 font-mono text-slate-400">{t.duration} Mins</td>
                        <td className="py-2.5 font-bold text-emerald-400 font-mono">₹{t.amount}</td>
                        <td className="py-2.5 font-bold uppercase text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                            {t.paymentStatus}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-mono text-slate-400">
                          {new Date(t.timestamp).toLocaleDateString()} {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Filter and settings */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-white">System Events Track</span>
              <div className="flex items-center gap-1.5">
                <Filter size={11} className="text-indigo-400 shrink-0" />
                <select
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  className="bg-slate-950 border border-white/5 rounded-lg px-2.5 py-1 text-[11px] text-slate-400 outline-none focus:border-indigo-500"
                >
                  <option value="all">All Events</option>
                  <option value="auth">Authentications</option>
                  <option value="vehicle">Vehicles Checkin</option>
                  <option value="billing">Billings / Checkouts</option>
                  <option value="slot">Slots Modify</option>
                  <option value="floor">Floors Modify</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
              {filteredAudits.length === 0 ? (
                <div className="text-center py-8 text-slate-600 font-mono text-xs">
                  No system trace logs captured.
                </div>
              ) : (
                filteredAudits.map(log => {
                  let badgeColor = "bg-blue-500/10 text-blue-400";
                  if (log.type === 'auth') badgeColor = "bg-purple-500/10 text-purple-400";
                  if (log.type === 'billing') badgeColor = "bg-emerald-500/10 text-emerald-400";
                  if (log.type === 'vehicle') badgeColor = "bg-orange-500/10 text-orange-400";

                  return (
                    <div key={log._id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col sm:flex-row justify-between gap-2 text-xs">
                      <div className="flex items-start gap-2.5">
                        <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider shrink-0 mt-0.5 ${badgeColor}`}>
                          {log.type}
                        </span>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <p className="text-slate-200 font-medium break-words leading-relaxed">{log.message}</p>
                          <span className="text-[10px] text-slate-500 font-bold font-mono">Operator: {log.user}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono tracking-wider sm:text-right shrink-0">
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
