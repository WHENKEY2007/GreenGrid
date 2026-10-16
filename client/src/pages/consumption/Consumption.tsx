import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { EnergyConsumption, Device, ConsumptionSource } from '../../types';
import {
  Zap,
  Plus,
  Trash2,
  Calendar,
  IndianRupee,
  Cpu,
  Filter,
  X,
  AlertCircle,
  Check,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const Consumption: React.FC = () => {
  const [records, setRecords] = useState<EnergyConsumption[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formKwh, setFormKwh] = useState<number>(10);
  const [formDeviceId, setFormDeviceId] = useState<string>('');
  const [formSource, setFormSource] = useState<ConsumptionSource>('MANUAL');
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchConsumptions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getConsumptions({
        page,
        limit: 10,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        deviceId: selectedDevice || undefined,
      });
      setRecords(res.data.data.records);
      setTotalPages(res.data.data.pagination.totalPages);
      setTotalCount(res.data.data.pagination.total);
    } catch (err) {
      console.error('Failed to load consumption history', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await apiClient.getDevices();
      setDevices(res.data.data.devices);
    } catch (err) {
      console.error('Failed to load devices', err);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    fetchConsumptions();
  }, [page, startDate, endDate, selectedDevice]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);

    try {
      await apiClient.createConsumption({
        date: formDate,
        energyKwh: Number(formKwh),
        deviceId: formDeviceId ? formDeviceId : undefined,
        source: formSource,
      });
      setIsModalOpen(false);
      setPage(1);
      fetchConsumptions();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to record consumption entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this consumption record?')) return;
    try {
      await apiClient.deleteConsumption(id);
      fetchConsumptions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete record');
    }
  };

  // Preview estimated cost based on standard rate (₹7.50/unit)
  const estimatedCost = formKwh * 7.50;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Energy Consumption Log
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
              {totalCount} Total Records
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, filter, and record daily meter readings, device usages, and utility billing costs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => apiClient.exportCsvReport({ startDate, endDate })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>

          <button
            onClick={() => {
              setModalError(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-eco-600 hover:bg-eco-500 shadow-lg shadow-eco-600/30 transition"
          >
            <Plus className="w-4 h-4" /> Log Consumption
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Filter className="w-4 h-4 text-eco-400" />
          <span className="font-semibold text-slate-300">Filters:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-eco-500"
              title="Start Date"
            />
          </div>

          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-eco-500"
              title="End Date"
            />
          </div>

          <div>
            <select
              value={selectedDevice}
              onChange={(e) => {
                setSelectedDevice(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-eco-500"
            >
              <option value="">All Devices (Grid Meter)</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {(startDate || endDate || selectedDevice) && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setSelectedDevice('');
              setPage(1);
            }}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 transition"
          >
            Reset
          </button>
        )}
      </div>

      {/* Consumption Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Device / Source</th>
                <th className="py-3 px-4">Energy (kWh)</th>
                <th className="py-3 px-4">Calculated Cost</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading consumption records...
                  </td>
                </tr>
              ) : records.length > 0 ? (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-white">
                      {new Date(r.date).toISOString().split('T')[0]}
                    </td>
                    <td className="py-3.5 px-4">
                      {r.device ? (
                        <div className="flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-eco-400" />
                          <span className="font-semibold text-slate-200">{r.device.name}</span>
                          <span className="text-[10px] text-slate-500">({r.device.category})</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Entire Household / Main Meter</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-eco-400 font-mono">
                      {r.energyKwh.toFixed(2)} kWh
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200 font-mono">
                      ₹{r.cost.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.source === 'SMART_METER'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : r.source === 'ESTIMATED'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {r.source}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No consumption records matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Log Consumption Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-eco-400" />
                Log Energy Consumption
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-eco-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Energy Consumed (kWh)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min={0.01}
                  value={formKwh}
                  onChange={(e) => setFormKwh(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-eco-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Associated Device (Optional)</label>
                <select
                  value={formDeviceId}
                  onChange={(e) => setFormDeviceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-eco-500"
                >
                  <option value="">Main Household Grid Meter</option>
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.category} - {d.ratedPower}W)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Data Source</label>
                <select
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value as ConsumptionSource)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-eco-500"
                >
                  <option value="MANUAL">Manual Utility Meter Reading</option>
                  <option value="SMART_METER">Smart Meter (IoT)</option>
                  <option value="ESTIMATED">Estimated Usage</option>
                </select>
              </div>

              {/* Dynamic Tariff Cost Preview */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Estimated Tariff Billing:</span>
                <span className="font-bold text-eco-400 font-mono">
                  ₹{estimatedCost.toFixed(2)} INR (@ ~₹7.50/kWh)
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-eco-600 hover:bg-eco-500 transition flex items-center gap-1.5 shadow-md shadow-eco-600/30 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {submitting ? 'Recording...' : 'Record Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
