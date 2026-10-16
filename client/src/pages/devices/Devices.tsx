import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { Device } from '../../types';
import {
  Cpu,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  Zap,
  Clock,
  Layers,
  Calculator,
  X,
  AlertCircle,
  Check,
} from 'lucide-react';

const CATEGORIES = [
  'HVAC',
  'Lighting',
  'Refrigeration',
  'Electronics',
  'Laundry',
  'Kitchen',
  'Water Heating',
  'Other',
];

export const Devices: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formPower, setFormPower] = useState<number>(1000);
  const [formQuantity, setFormQuantity] = useState<number>(1);
  const [formHours, setFormHours] = useState<number>(4);
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDevices = async () => {
    try {
      const res = await apiClient.getDevices();
      setDevices(res.data.data.devices);
    } catch (err) {
      console.error('Failed to fetch devices', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const openAddModal = () => {
    setEditingDevice(null);
    setFormName('');
    setFormCategory(CATEGORIES[0]);
    setFormPower(1000);
    setFormQuantity(1);
    setFormHours(4);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (device: Device) => {
    setEditingDevice(device);
    setFormName(device.name);
    setFormCategory(device.category);
    setFormPower(device.ratedPower);
    setFormQuantity(device.quantity);
    setFormHours(device.usageHoursPerDay);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);

    const payload = {
      name: formName.trim(),
      category: formCategory,
      ratedPower: Number(formPower),
      quantity: Number(formQuantity),
      usageHoursPerDay: Number(formHours),
    };

    try {
      if (editingDevice) {
        await apiClient.updateDevice(editingDevice.id, payload);
      } else {
        await apiClient.createDevice(payload);
      }
      setIsModalOpen(false);
      fetchDevices();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to save device');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from your active devices?`)) {
      return;
    }
    try {
      await apiClient.deleteDevice(id);
      fetchDevices();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete device');
    }
  };

  // Live Formula Calculation for Modal
  const calculatedDailyKwh = ((formPower / 1000) * formQuantity * formHours);
  const calculatedMonthlyCost = calculatedDailyKwh * 30 * 7.50; // Indian electricity tariff @ ₹7.50/kWh

  // Filtered devices
  const filtered = devices.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalConnectedPower = devices.reduce((sum, d) => sum + d.ratedPower * d.quantity, 0);
  const totalDailyKwh = devices.reduce((sum, d) => sum + d.dailyConsumptionKwh, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Device Management
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
              {devices.length} registered
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure appliances, rated wattages, operating schedules, and automated consumption formulas.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-eco-600 hover:bg-eco-500 shadow-lg shadow-eco-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Device
        </button>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-eco-500/10 text-eco-400 border border-eco-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Devices</span>
            <div className="text-xl font-black text-white">{devices.length} Units</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Rated Power</span>
            <div className="text-xl font-black text-white">{(totalConnectedPower / 1000).toFixed(2)} kW</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Est. Daily Baseline</span>
            <div className="text-xl font-black text-white">{totalDailyKwh.toFixed(2)} kWh/day</div>
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search devices by name or category..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-eco-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'ALL'
                ? 'bg-eco-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-850'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-eco-600 text-white'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-850'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Device Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading registered devices...</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((device) => (
            <div
              key={device.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-eco-400 uppercase tracking-wider bg-eco-500/10 px-2 py-0.5 rounded-md border border-eco-500/20">
                      {device.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{device.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(device)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Edit Device"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(device.id, device.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete Device"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Device Specifications */}
                <div className="space-y-2 mt-4 pt-3 border-t border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> Rated Power:
                    </span>
                    <span className="text-slate-200 font-mono font-semibold">
                      {device.ratedPower} W {device.quantity > 1 ? `(x${device.quantity})` : ''}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" /> Daily Run Time:
                    </span>
                    <span className="text-slate-200 font-mono font-semibold">
                      {device.usageHoursPerDay} hrs/day
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom calculated badge */}
              <div className="mt-5 p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">Daily Consumption</span>
                  <span className="text-sm font-black text-eco-400">
                    {device.dailyConsumptionKwh.toFixed(2)} kWh
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Est. 30d Cost</span>
                  <span className="text-sm font-black text-slate-200">
                    ₹{(device.dailyConsumptionKwh * 30 * 7.50).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900 border border-dashed border-slate-800 rounded-2xl">
          <Cpu className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No devices found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search || selectedCategory !== 'ALL'
              ? 'No appliances match your search criteria.'
              : 'Add devices like air conditioning, water heaters, and EV chargers to estimate automated power draw.'}
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-eco-600 hover:bg-eco-500 transition"
          >
            + Add First Device
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-eco-400" />
                {editingDevice ? 'Edit Device' : 'Register New Device'}
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

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Device Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Inverter AC (Living Room)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-eco-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-eco-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rated Power (W)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formPower}
                    onChange={(e) => setFormPower(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-eco-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-eco-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hours / Day</label>
                  <input
                    type="number"
                    required
                    min={0.1}
                    max={24}
                    step={0.1}
                    value={formHours}
                    onChange={(e) => setFormHours(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-eco-500 font-mono"
                  />
                </div>
              </div>

              {/* Dynamic Formula Calculation Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-eco-500/30">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-eco-400 mb-2">
                  <Calculator className="w-3.5 h-3.5" />
                  Formula Estimation Preview:
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  ({formPower}W / 1000) × {formQuantity} unit(s) × {formHours}h ={' '}
                  <span className="text-eco-300 font-bold">{calculatedDailyKwh.toFixed(2)} kWh / day</span>
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-1">
                  Est. 30-Day Cost (@ ₹7.50/kWh):{' '}
                  <span className="text-amber-400 font-bold">₹{calculatedMonthlyCost.toFixed(2)} / month</span>
                </p>
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
                  {submitting ? 'Saving...' : editingDevice ? 'Update Device' : 'Register Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
