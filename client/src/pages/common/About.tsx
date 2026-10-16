import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Zap, SunMedium, ShieldCheck, ArrowRight, BarChart3, BellRing, Cpu } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 py-20 text-center relative">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-eco-600 to-teal-500 text-white shadow-xl shadow-eco-500/20 mb-6">
          <Leaf className="w-10 h-10" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          GREEN <span className="text-eco-400">GRID</span>
        </h1>
        <p className="text-lg text-slate-400 mt-4 max-w-2xl mx-auto">
          A production-grade Smart Energy Management and Sustainability Platform. Monitor electric consumption, track renewable generation, eliminate phantom loads, and cut emissions.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-eco-600 hover:bg-eco-500 shadow-lg shadow-eco-600/30 transition flex items-center gap-2"
          >
            Launch Platform Cockpit <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="http://localhost:5000/api/docs"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-xl font-bold text-xs text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
          >
            Swagger API Docs
          </a>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="p-3 rounded-xl bg-eco-500/10 text-eco-400 border border-eco-500/20 w-fit mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Automated Power Estimation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Formula-based power tracking using appliance wattages, hours of daily operation, and utility tariffs to compute daily and monthly kWh usage.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit mb-4">
              <SunMedium className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Renewable Energy Tracking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Log rooftop solar and micro-wind turbine generation. Calculate clean energy self-sufficiency percentages and avoided utility costs.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit mb-4">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Carbon Avoidance Ledger</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Translates clean renewable generation into real-time kilograms of avoided CO₂ emissions using regional grid emission factors.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Interactive Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Built with Recharts, rendering daily timeline trendlines, appliance power rankings, and environmental carbon balance sheets.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 w-fit mb-4">
              <BellRing className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Threshold Anomaly Alerts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated monitors notify you whenever daily consumption, monthly bills, or appliance duty cycles exceed your customized targets.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 w-fit mb-4">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Role-Based Admin Cockpit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Administrative suite allowing operators to manage users, configure dynamic electricity tariffs, and audit macro energy telemetries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
