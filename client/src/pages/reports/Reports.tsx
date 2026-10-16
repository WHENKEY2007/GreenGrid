import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Zap,
  IndianRupee,
  SunMedium,
  Leaf,
  Cpu,
  RefreshCw,
} from 'lucide-react';

export const Reports: React.FC = () => {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getEnergyReport({ startDate, endDate });
      setReport(res.data.data);
    } catch (err) {
      console.error('Failed to load energy report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      await apiClient.exportCsvReport({ startDate, endDate });
    } catch (err) {
      console.error('Failed to export CSV report', err);
      alert('Failed to export CSV. Please check that records exist for this period.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Energy & Sustainability Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregate consumption metrics, cost summaries, and environmental carbon balance sheets.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={exporting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-eco-600 hover:bg-eco-500 shadow-lg shadow-eco-600/30 transition disabled:opacity-50 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Generating CSV...' : 'Download Full CSV Audit'}
        </button>
      </div>

      {/* Date Range Selector Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-eco-400" /> Select Reporting Period
        </h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-eco-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-eco-500"
            />
          </div>

          <button
            onClick={fetchReport}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Run Report
          </button>
        </div>
      </div>

      {/* Report Summary Data */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">Generating report data...</div>
      ) : report ? (
        <div className="space-y-6">
          {/* Key Totals Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-eco-400" /> Total Energy Consumed
              </span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {Number(report.summary?.totalConsumptionKwh || 0).toFixed(1)} kWh
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-blue-400" /> Total Incurred Cost
              </span>
              <div className="text-2xl font-black text-blue-400 font-mono mt-1">
                ₹{Number(report.summary?.totalCost || 0).toFixed(2)} INR
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <SunMedium className="w-3.5 h-3.5 text-amber-400" /> Renewable Generated
              </span>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                {Number(report.summary?.totalRenewableKwh || 0).toFixed(1)} kWh
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" /> Net Carbon Impact
              </span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                {Number(report.summary?.netCarbonKg || 0).toFixed(1)} kg CO₂
              </div>
            </div>
          </div>

          {/* Device Usage Distribution */}
          {report.deviceBreakdown && report.deviceBreakdown.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-eco-400" /> Device Energy Breakdown in Period
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Device</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4">Consumption (kWh)</th>
                      <th className="py-2.5 px-4">Cost (₹)</th>
                      <th className="py-2.5 px-4">% Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {report.deviceBreakdown.map((d: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-850/50">
                        <td className="py-2.5 px-4 font-semibold text-white">{d.name}</td>
                        <td className="py-2.5 px-4 text-slate-400">{d.category}</td>
                        <td className="py-2.5 px-4 font-mono text-eco-400">
                          {Number(d.consumptionKwh).toFixed(2)} kWh
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-200">
                          ₹{Number(d.cost).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-400">{d.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
          <FileSpreadsheet className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No data found</h3>
          <p className="text-xs text-slate-400 mt-1">Select a wider date range to produce the energy report.</p>
        </div>
      )}
    </div>
  );
};
