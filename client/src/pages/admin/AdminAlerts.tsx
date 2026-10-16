import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { AlertTriangle, Clock, Zap, IndianRupee, Bell, ShieldAlert } from 'lucide-react';

export const AdminAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminAlerts = async () => {
      try {
        const res = await apiClient.getAdminAlerts();
        setAlerts(res.data.data.alerts);
      } catch (err) {
        console.error('Failed to load system alerts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminAlerts();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          Platform-Wide Alert Telemetry
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor threshold alerts, device overuse notifications, and anomalies triggered across all user accounts.
        </p>
      </div>

      {/* Alerts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Alert Type</th>
                <th className="py-3 px-4">Title & Description</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Triggered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading platform alerts...
                  </td>
                </tr>
              ) : alerts.length > 0 ? (
                alerts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-850/50">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-white block">{a.user?.name || 'Unknown'}</span>
                        <span className="text-[11px] font-mono text-slate-400">{a.user?.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {a.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-white">{a.title}</div>
                      <div className="text-slate-400 text-[11px] truncate">{a.message}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-400">
                      {a.threshold ? a.threshold : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          a.isRead
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {a.isRead ? 'Read' : 'Active Unread'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {new Date(a.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No platform alerts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
