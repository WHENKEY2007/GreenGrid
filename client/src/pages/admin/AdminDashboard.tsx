import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Cpu,
  Zap,
  SunMedium,
  IndianRupee,
  Layers,
  ArrowUpRight,
  UserCheck,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await apiClient.getAdminDashboard();
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load admin telemetry', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-xs text-slate-400">Loading system admin telemetry...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">System Administration Cockpit</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              SUPERUSER PRIVILEGES
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Macro platform telemetry, user account enforcement, and utility tariff rate configurations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/users"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-850 border border-slate-800 transition"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/tariffs"
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition shadow-lg shadow-amber-600/30"
          >
            Configure Tariffs
          </Link>
        </div>
      </div>

      {/* Macro System Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Registered Users</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{stats?.usersCount || 0}</div>
          <span className="text-[10px] text-slate-500">Across enterprise & individual accounts</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Monitored Devices</span>
            <div className="p-2 rounded-xl bg-eco-500/10 text-eco-400 border border-eco-500/20">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{stats?.devicesCount || 0}</div>
          <span className="text-[10px] text-slate-500">Active appliances in grid registry</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Platform Energy Intake</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {Number(stats?.totalConsumptionKwh || 0).toFixed(1)} kWh
          </div>
          <span className="text-[10px] text-slate-500">Total power logged platform-wide</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Clean Energy Generated</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <SunMedium className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {Number(stats?.totalRenewableKwh || 0).toFixed(1)} kWh
          </div>
          <span className="text-[10px] text-slate-500">Total solar & wind produced</span>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white">Recently Enrolled Accounts</h2>
            <p className="text-xs text-slate-400">Latest active users on Green Grid platform</p>
          </div>
          <Link to="/admin/users" className="text-xs text-amber-400 hover:underline flex items-center gap-0.5">
            Full Directory <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {stats?.recentUsers?.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-850/50">
                  <td className="py-3 px-4 font-semibold text-white">{u.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-eco-500/10 text-eco-400 border border-eco-500/20'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {u.isActive ? (
                      <span className="flex items-center gap-1 text-eco-400 text-[11px] font-semibold">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400 text-[11px] font-semibold">
                        <XCircle className="w-3 h-3" /> Suspended
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
