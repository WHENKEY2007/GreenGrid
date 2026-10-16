import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  AnalyticsSummary,
  DailyTimelinePoint,
  DeviceBreakdownItem,
  Alert,
  Recommendation,
} from '../../types';
import {
  Zap,
  SunMedium,
  IndianRupee,
  Leaf,
  AlertTriangle,
  ArrowUpRight,
  PlusCircle,
  Download,
  TrendingDown,
  TrendingUp,
  Cpu,
  RefreshCw,
  Lightbulb,
  ShieldCheck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const PIE_COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [timeline, setTimeline] = useState<DailyTimelinePoint[]>([]);
  const [devices, setDevices] = useState<DeviceBreakdownItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<number>(14);

  const fetchData = async () => {
    try {
      const [sumRes, timeRes, devRes, alertRes, recRes] = await Promise.all([
        apiClient.getAnalyticsSummary(),
        apiClient.getDailyAnalytics(timeRange),
        apiClient.getDeviceAnalytics(),
        apiClient.getAlerts(),
        apiClient.getRecommendations(),
      ]);

      setSummary(sumRes.data.data);
      setTimeline(timeRes.data.data.timeline);
      setDevices(devRes.data.data.devices);
      setAlerts(alertRes.data.data.alerts.slice(0, 4));
      setRecommendations(recRes.data.data.recommendations.slice(0, 3));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-eco-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading Green Grid live metrics...</p>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const todayKwh = summary?.today.consumptionKwh || 0;
  const todayLimit = summary?.settings.dailyConsumptionLimit || 25;
  const todayPct = Math.min(Math.round((todayKwh / todayLimit) * 100), 100);

  const monthlyKwh = summary?.monthly.consumptionKwh || 0;
  const monthlyCost = summary?.monthly.cost || 0;
  const monthlyRenewable = summary?.monthly.renewableKwh || 0;
  const greenMixPct = summary?.monthly.renewablePercentage || 0;
  const netEmissions = Math.max(0, (summary?.monthly.carbonEmissions || 0) - (summary?.monthly.carbonReduction || 0));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Welcome back, <span className="text-eco-400">{user?.name}</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-eco-500/10 text-eco-400 border border-eco-500/20">
              LIVE MONITORING
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time energy efficiency, generation mix, and environmental carbon telemetry.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-eco-400' : ''}`} />
          </button>

          <Link
            to="/consumption"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-eco-600 hover:bg-eco-500 shadow-md shadow-eco-600/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Log Usage
          </Link>

          <Link
            to="/renewable"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
          >
            <SunMedium className="w-4 h-4 text-amber-400" />
            Log Solar/Wind
          </Link>

          <button
            onClick={() => apiClient.exportCsvReport()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
            title="Quick CSV Export"
          >
            <Download className="w-4 h-4 text-slate-400" />
            CSV
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Consumption */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Today's Consumption</span>
            <div className="p-2 rounded-xl bg-eco-500/10 text-eco-400 border border-eco-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{todayKwh.toFixed(1)}</span>
            <span className="text-xs text-slate-400 font-medium">kWh</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Daily Target ({todayLimit} kWh)</span>
              <span className={todayKwh > todayLimit ? 'text-rose-400 font-bold' : 'text-eco-400 font-semibold'}>
                {todayPct}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  todayKwh > todayLimit ? 'bg-rose-500' : 'bg-eco-500'
                }`}
                style={{ width: `${Math.min(todayPct, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Monthly Energy Cost */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Monthly Projected Cost</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">₹{monthlyCost.toFixed(2)}</span>
            <span className="text-xs text-slate-400 font-medium">INR</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
            <span className="font-semibold text-slate-300">{monthlyKwh.toFixed(1)} kWh</span> consumed this month
          </p>
        </div>

        {/* Card 3: Renewable Generation Mix */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Renewable Mix</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <SunMedium className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{greenMixPct.toFixed(1)}%</span>
            <span className="text-xs text-slate-400 font-medium">Clean</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
            <span className="font-semibold text-amber-300">{monthlyRenewable.toFixed(1)} kWh</span> clean generated
          </p>
        </div>

        {/* Card 4: Net Carbon Footprint */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Net Carbon Footprint</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{netEmissions.toFixed(1)}</span>
            <span className="text-xs text-slate-400 font-medium">kg CO₂</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
            <span className="font-semibold text-emerald-300">
              -{(summary?.monthly.carbonReduction || 0).toFixed(1)} kg
            </span>{' '}
            avoided via solar/wind
          </p>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Trend Area Chart (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-sm font-bold text-white">Daily Consumption vs Clean Generation</h2>
              <p className="text-xs text-slate-400">Trendline of electricity consumed vs solar/wind produced</p>
            </div>
            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setTimeRange(days)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    timeRange === days
                      ? 'bg-eco-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            {timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorRenewable" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(str) => {
                      const d = new Date(str);
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
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="consumptionKwh"
                    name="Consumption (kWh)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorConsumption)"
                  />
                  <Area
                    type="monotone"
                    dataKey="renewableKwh"
                    name="Renewable (kWh)"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRenewable)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No consumption records logged yet. Start by logging energy usage.
              </div>
            )}
          </div>
        </div>

        {/* Device Breakdown Pie Chart (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Device Breakdown</h2>
              <p className="text-xs text-slate-400">Share of monthly power usage</p>
            </div>
            <Link to="/devices" className="text-xs text-eco-400 hover:underline flex items-center gap-0.5">
              Manage <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 min-h-[220px]">
            {devices.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={devices}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="consumptionKwh"
                    nameKey="name"
                  >
                    {devices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`${Number(value).toFixed(1)} kWh`, 'Usage']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Cpu className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs text-slate-400">No device logs available</p>
                <Link
                  to="/devices"
                  className="mt-2 text-xs font-semibold text-eco-400 hover:text-eco-300"
                >
                  + Add Your First Device
                </Link>
              </div>
            )}
          </div>

          {/* List breakdown summary */}
          {devices.length > 0 && (
            <div className="space-y-1.5 mt-2 max-h-36 overflow-y-auto pr-1">
              {devices.slice(0, 4).map((dev, idx) => (
                <div key={dev.deviceId || idx} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="text-slate-300 font-medium truncate">{dev.name}</span>
                  </div>
                  <span className="text-slate-400 font-mono shrink-0 ml-2">
                    {dev.percentage}% ({dev.consumptionKwh.toFixed(1)} kWh)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lower Dashboard Section: Recommendations & Active Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Recommendations Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Smart Optimization Insights</h2>
                <p className="text-xs text-slate-400">Automated recommendations based on your usage</p>
              </div>
            </div>
            <Link to="/recommendations" className="text-xs text-eco-400 hover:underline flex items-center gap-0.5">
              All ({recommendations.length}) <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recommendations.length > 0 ? (
              recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">{rec.title}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-eco-500/10 text-eco-400 border border-eco-500/20">
                      {rec.potentialSavings}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{rec.description}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">
                System is analyzing patterns. Recommendations will appear shortly.
              </p>
            )}
          </div>
        </div>

        {/* Real-Time Threshold Alerts Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Threshold Alerts</h2>
                <p className="text-xs text-slate-400">Consumption limits & anomaly notifications</p>
              </div>
            </div>
            <Link to="/alerts" className="text-xs text-eco-400 hover:underline flex items-center gap-0.5">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition ${
                    alert.isRead
                      ? 'bg-slate-950 border-slate-850 opacity-70'
                      : 'bg-rose-500/5 border-rose-500/20 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <div>
                        <h3 className="text-xs font-bold text-white">{alert.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{alert.message}</p>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                          {new Date(alert.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <ShieldCheck className="w-8 h-8 text-eco-400 mx-auto mb-2 opacity-80" />
                <p className="text-xs text-slate-300 font-semibold">Everything is running smoothly!</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  No active consumption or cost threshold alerts.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
