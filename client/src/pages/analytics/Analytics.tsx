import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import {
  AnalyticsSummary,
  DailyTimelinePoint,
  DeviceBreakdownItem,
  CarbonAnalyticsPoint,
} from '../../types';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Leaf,
  Zap,
  IndianRupee,
  SunMedium,
  Download,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const Analytics: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [dailyTimeline, setDailyTimeline] = useState<DailyTimelinePoint[]>([]);
  const [devices, setDevices] = useState<DeviceBreakdownItem[]>([]);
  const [carbonData, setCarbonData] = useState<CarbonAnalyticsPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState<number>(30);
  const [metricView, setMetricView] = useState<'kwh' | 'cost'>('kwh');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sumRes, dailyRes, devRes, carbRes] = await Promise.all([
          apiClient.getAnalyticsSummary(),
          apiClient.getDailyAnalytics(daysFilter),
          apiClient.getDeviceAnalytics(),
          apiClient.getCarbonAnalytics(),
        ]);
        setSummary(sumRes.data.data);
        setDailyTimeline(dailyRes.data.data.timeline);
        setDevices(devRes.data.data.devices);
        setCarbonData(carbRes.data.data.carbon);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [daysFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-eco-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Crunching smart telemetry & carbon metrics...</p>
        </div>
      </div>
    );
  }

  // Derived metrics
  const avgDailyKwh =
    dailyTimeline.length > 0
      ? (dailyTimeline.reduce((sum, d) => sum + d.consumptionKwh, 0) / dailyTimeline.length).toFixed(1)
      : '0';

  const peakDay =
    dailyTimeline.length > 0
      ? dailyTimeline.reduce((prev, curr) => (curr.consumptionKwh > prev.consumptionKwh ? curr : prev))
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Energy & Carbon Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical consumption trends, appliance rankings, and clean renewable generation metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Days selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDaysFilter(d)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  daysFilter === d ? 'bg-eco-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>

          <button
            onClick={() => apiClient.exportCsvReport()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-eco-400" /> Avg Daily Consumption
          </span>
          <div className="text-2xl font-black text-white font-mono mt-1">{avgDailyKwh} kWh</div>
          <span className="text-[10px] text-slate-500">Over past {daysFilter} days</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-rose-400" /> Peak Day Usage
          </span>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">
            {peakDay ? `${peakDay.consumptionKwh.toFixed(1)} kWh` : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-500">
            {peakDay ? `On ${new Date(peakDay.date).toLocaleDateString()}` : 'No records'}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <SunMedium className="w-3.5 h-3.5 text-amber-400" /> Clean Energy Share
          </span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {summary?.monthly.renewablePercentage.toFixed(1) || 0}%
          </div>
          <span className="text-[10px] text-slate-500">Renewable self-sufficiency</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" /> Total CO₂ Avoided
          </span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {summary?.monthly.carbonReduction.toFixed(1) || 0} kg
          </div>
          <span className="text-[10px] text-slate-500">Via clean solar & wind offset</span>
        </div>
      </div>

      {/* Main Timeline Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-white">Daily Consumption & Generation Timeline</h2>
            <p className="text-xs text-slate-400">
              Comparative analysis of household power intake vs clean generation
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setMetricView('kwh')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                metricView === 'kwh' ? 'bg-eco-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Energy (kWh)
            </button>
            <button
              onClick={() => setMetricView('cost')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                metricView === 'cost' ? 'bg-eco-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cost (₹ INR)
            </button>
          </div>
        </div>

        <div className="h-80 w-full">
          {dailyTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaConsumption" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="areaRenewable" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [
                    metricView === 'kwh' ? `${Number(value).toFixed(2)} kWh` : `₹${Number(value).toFixed(2)}`,
                    '',
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {metricView === 'kwh' ? (
                  <>
                    <Area
                      type="monotone"
                      dataKey="consumptionKwh"
                      name="Consumption (kWh)"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#areaConsumption)"
                    />
                    <Area
                      type="monotone"
                      dataKey="renewableKwh"
                      name="Renewable Output (kWh)"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#areaRenewable)"
                    />
                  </>
                ) : (
                  <Area
                    type="monotone"
                    dataKey="cost"
                    name="Electricity Cost (₹)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={0.3}
                    fill="#f59e0b"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No historical data in this period
            </div>
          )}
        </div>
      </div>

      {/* Two Column Section: Device Breakdown & Carbon Avoidance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Power Ranking (Bar Chart) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white">Appliance Consumption Ranking</h2>
            <p className="text-xs text-slate-400">Total energy consumed by active registered devices</p>
          </div>

          <div className="h-64 w-full">
            {devices.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={devices} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" fontSize={11} unit=" kWh" />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${Number(val).toFixed(2)} kWh`, 'Usage']}
                  />
                  <Bar dataKey="consumptionKwh" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No device consumption logs recorded
              </div>
            )}
          </div>
        </div>

        {/* Carbon Footprint vs Offset Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white">Carbon Emissions vs Avoided Offset</h2>
            <p className="text-xs text-slate-400">Daily environmental impact in kilograms of CO₂</p>
          </div>

          <div className="h-64 w-full">
            {carbonData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={carbonData.slice(-14)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${Number(val).toFixed(2)} kg CO₂`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="gridEmissionsKg" name="Grid Emissions (kg)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avoidedEmissionsKg" name="Avoided Clean (kg)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No carbon data points available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
