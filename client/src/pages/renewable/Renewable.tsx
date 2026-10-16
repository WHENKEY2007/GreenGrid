import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { RenewableGeneration, RenewableSource } from '../../types';
import {
  SunMedium,
  Wind,
  Plus,
  Trash2,
  Leaf,
  IndianRupee,
  TrendingUp,
  X,
  AlertCircle,
  Check,
  Zap,
} from 'lucide-react';

export const Renewable: React.FC = () => {
  const [records, setRecords] = useState<RenewableGeneration[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSource, setFormSource] = useState<RenewableSource>('SOLAR');
  const [formGeneration, setFormGeneration] = useState<number>(12);
  const [formCapacity, setFormCapacity] = useState<number>(5.0);
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRenewables = async () => {
    try {
      const res = await apiClient.getRenewables();
      setRecords(res.data.data.records);
    } catch (err) {
      console.error('Failed to load renewable records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenewables();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);

    try {
      await apiClient.createRenewable({
        source: formSource,
        generationKwh: Number(formGeneration),
        capacityKw: Number(formCapacity),
        date: formDate,
      });
      setIsModalOpen(false);
      fetchRenewables();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to record renewable generation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this renewable generation log?')) return;
    try {
      await apiClient.deleteRenewable(id);
      fetchRenewables();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete record');
    }
  };

  const totalRenewableKwh = records.reduce((sum, r) => sum + r.generationKwh, 0);
  const totalOffsetCost = totalRenewableKwh * 7.50; // @ ₹7.50/kWh avoided
  const totalCarbonAvoidedKg = totalRenewableKwh * 0.45; // 0.45 kg CO2 per kWh

  // Preview for modal
  const previewAvoidedCarbon = (formGeneration * 0.45).toFixed(2);
  const previewSavings = (formGeneration * 7.50).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Renewable Energy Tracking
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
              CLEAN GENERATION
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor rooftop photovoltaic solar arrays, micro-wind turbines, and clean grid carbon avoidance.
          </p>
        </div>

        <button
          onClick={() => {
            setModalError(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-eco-600 hover:bg-eco-500 shadow-lg shadow-eco-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Log Renewable Output
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <SunMedium className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Clean Energy</span>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {totalRenewableKwh.toFixed(1)} kWh
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Recorded generation</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Carbon Abatement</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {totalCarbonAvoidedKg.toFixed(1)} kg CO₂
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Direct emissions offset</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Grid Cost Avoided</span>
            <div className="text-2xl font-black text-blue-400 font-mono">
              ₹{totalOffsetCost.toFixed(2)} INR
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Estimated utility savings</span>
          </div>
        </div>
      </div>

      {/* Generation Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Capacity (kW)</th>
                <th className="py-3 px-4">Generation (kWh)</th>
                <th className="py-3 px-4">CO₂ Offset</th>
                <th className="py-3 px-4">Value (₹)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading clean energy data...
                  </td>
                </tr>
              ) : records.length > 0 ? (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-white">
                      {new Date(r.date).toISOString().split('T')[0]}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {r.source === 'SOLAR' ? (
                          <SunMedium className="w-4 h-4 text-amber-400" />
                        ) : r.source === 'WIND' ? (
                          <Wind className="w-4 h-4 text-teal-400" />
                        ) : (
                          <Zap className="w-4 h-4 text-eco-400" />
                        )}
                        <span className="font-semibold text-slate-200">{r.source}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {r.capacityKw.toFixed(1)} kW
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-400 font-mono">
                      {r.generationKwh.toFixed(2)} kWh
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-400 font-mono">
                      {(r.generationKwh * 0.45).toFixed(2)} kg
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-blue-400 font-mono">
                      ₹{(r.generationKwh * 7.50).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No renewable generation logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Renewable Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <SunMedium className="w-4 h-4 text-amber-400" />
                Log Renewable Generation
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Energy Source</label>
                <select
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value as RenewableSource)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-eco-500"
                >
                  <option value="SOLAR">Solar Photovoltaic (Rooftop / Array)</option>
                  <option value="WIND">Micro-Wind Turbine</option>
                  <option value="OTHER">Hydro / Biomass / Other Clean Source</option>
                </select>
              </div>

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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Output Generated (kWh)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min={0.1}
                    value={formGeneration}
                    onChange={(e) => setFormGeneration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-eco-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    System Capacity (kW)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min={0.1}
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-eco-500 font-mono"
                  />
                </div>
              </div>

              {/* Instant Eco Impact Box */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/20 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Carbon Offset:</span>
                  <span className="font-bold text-emerald-400 font-mono">+{previewAvoidedCarbon} kg CO₂</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Grid Bill Saved:</span>
                  <span className="font-bold text-blue-400 font-mono">₹{previewSavings} INR</span>
                </div>
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
                  {submitting ? 'Recording...' : 'Record Generation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
