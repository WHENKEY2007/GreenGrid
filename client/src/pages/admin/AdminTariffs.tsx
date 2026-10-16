import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { EnergyTariff } from '../../types';
import {
  Layers,
  Plus,
  IndianRupee,
  Calendar,
  CheckCircle,
  XCircle,
  X,
  AlertCircle,
  Check,
} from 'lucide-react';

export const AdminTariffs: React.FC = () => {
  const [tariffs, setTariffs] = useState<EnergyTariff[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formRate, setFormRate] = useState<number>(7.50);
  const [formFixed, setFormFixed] = useState<number>(125.0);
  const [formFrom, setFormFrom] = useState(() => new Date().toISOString().split('T')[0]);
  const [formIsActive, setFormIsActive] = useState(true);
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTariffs = async () => {
    try {
      const res = await apiClient.getAdminTariffs();
      setTariffs(res.data.data.tariffs);
    } catch (err) {
      console.error('Failed to load tariffs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTariffs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);

    try {
      await apiClient.createAdminTariff({
        name: formName.trim(),
        ratePerKwh: Number(formRate),
        fixedCharge: Number(formFixed),
        effectiveFrom: formFrom,
        isActive: formIsActive,
      });
      setIsModalOpen(false);
      fetchTariffs();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to create tariff rate');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Electricity Tariff Structures
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure unit electricity pricing ($/kWh), base metering charges, and active utility schedules used across the platform.
          </p>
        </div>

        <button
          onClick={() => {
            setFormName('');
            setFormRate(7.50);
            setFormFixed(125.0);
            setFormIsActive(true);
            setModalError(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Tariff Plan
        </button>
      </div>

      {/* Tariffs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-16 text-slate-400 text-xs">
            Loading utility tariff models...
          </div>
        ) : tariffs.map((t) => (
          <div
            key={t.id}
            className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
              t.isActive
                ? 'bg-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/20'
                : 'bg-slate-900/60 border-slate-800 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-base font-bold text-white">{t.name}</h3>
                {t.isActive ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    ACTIVE TARIFF
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                    LEGACY
                  </span>
                )}
              </div>

              <div className="space-y-2 mt-4 pt-3 border-t border-slate-800 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Unit Rate:</span>
                  <span className="text-white font-mono font-bold text-sm">
                    ₹{t.ratePerKwh.toFixed(2)} / kWh
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Fixed Monthly Charge:</span>
                  <span className="text-slate-200 font-mono font-semibold">
                    ₹{t.fixedCharge.toFixed(2)} / mo
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Effective From:</span>
                  <span className="text-slate-300 font-mono">
                    {new Date(t.effectiveFrom).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
              {t.isActive ? (
                <span className="text-eco-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Applied to all new meter calculations
                </span>
              ) : (
                <span>Archived schedule</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Tariff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Configure New Tariff
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tariff Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Standard Peak Residential 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rate (₹ / kWh)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min={0.1}
                    value={formRate}
                    onChange={(e) => setFormRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Fixed Base (₹ / mo)
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    min={0}
                    value={formFixed}
                    onChange={(e) => setFormFixed(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Effective Date</label>
                <input
                  type="date"
                  required
                  value={formFrom}
                  onChange={(e) => setFormFrom(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-800"
                />
                <label htmlFor="isActiveCheck" className="text-xs text-slate-300 cursor-pointer">
                  Set as Active System Tariff (supersedes existing active tariffs)
                </label>
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
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition flex items-center gap-1.5 shadow-md shadow-amber-600/30 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {submitting ? 'Creating...' : 'Create Tariff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
