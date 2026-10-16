import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { EnergySettings } from '../../types';
import {
  Settings as SettingsIcon,
  Zap,
  IndianRupee,
  Leaf,
  Bell,
  Check,
  AlertCircle,
  Save,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<EnergySettings | null>(null);
  const [dailyLimit, setDailyLimit] = useState<number>(25);
  const [monthlyLimit, setMonthlyLimit] = useState<number>(600);
  const [costLimit, setCostLimit] = useState<number>(5000);
  const [carbonFactor, setCarbonFactor] = useState<number>(0.45);
  const [alertEnabled, setAlertEnabled] = useState<boolean>(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiClient.getSettings();
        const s = res.data.data.settings;
        setSettings(s);
        setDailyLimit(s.dailyConsumptionLimit);
        setMonthlyLimit(s.monthlyConsumptionLimit);
        setCostLimit(s.monthlyCostLimit);
        setCarbonFactor(s.carbonFactor);
        setAlertEnabled(s.alertEnabled);
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await apiClient.updateSettings({
        dailyConsumptionLimit: Number(dailyLimit),
        monthlyConsumptionLimit: Number(monthlyLimit),
        monthlyCostLimit: Number(costLimit),
        carbonFactor: Number(carbonFactor),
        alertEnabled,
      });
      setSettings(res.data.data.settings);
      setSuccessMsg('Energy thresholds updated successfully! Alert monitors are recalibrated.');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update energy parameters');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-400 text-xs">Loading energy configuration...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          Energy Limits & Alert Thresholds
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Tune your household targets, carbon conversion parameters, and proactive anomaly alert triggers.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-eco-500/10 border border-eco-500/30 flex items-center gap-2 text-xs text-eco-400 font-semibold">
          <Check className="w-4 h-4 text-eco-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-400 font-semibold">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        {/* Daily & Monthly kWh Targets */}
        <div>
          <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <Zap className="w-4 h-4 text-eco-400" /> Consumption Targets
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Receive automated notifications when single-day or monthly aggregated consumption exceeds these values.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Daily Consumption Limit (kWh)
              </label>
              <input
                type="number"
                step="0.5"
                min={1}
                required
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-eco-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: 25.0 kWh / day</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monthly Consumption Limit (kWh)
              </label>
              <input
                type="number"
                step="5"
                min={10}
                required
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-eco-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: 600.0 kWh / month</span>
            </div>
          </div>
        </div>

        {/* Cost Budget & Carbon Factor */}
        <div className="pt-6 border-t border-slate-800">
          <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-blue-400" /> Cost & Carbon Metrics
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Manage your monthly utility budget and local regional carbon emission intensity factor.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monthly Cost Budget (₹ INR)
              </label>
              <input
                type="number"
                step="100"
                min={100}
                required
                value={costLimit}
                onChange={(e) => setCostLimit(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-eco-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Triggers high cost alert when breached (e.g. ₹5,000)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Carbon Intensity Factor (kg CO₂ / kWh)
              </label>
              <input
                type="number"
                step="0.01"
                min={0.01}
                max={2.0}
                required
                value={carbonFactor}
                onChange={(e) => setCarbonFactor(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-eco-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">US Grid average: 0.45 kg CO₂/kWh</span>
            </div>
          </div>
        </div>

        {/* Notifications Toggle */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" /> Threshold Anomaly Alerts
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              Allow the system to automatically flag high consumption anomalies and cost alerts.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={alertEnabled}
              onChange={(e) => setAlertEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-eco-600"></div>
          </label>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-eco-600 hover:bg-eco-500 shadow-lg shadow-eco-600/30 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};
