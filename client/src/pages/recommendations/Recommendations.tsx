import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { Recommendation } from '../../types';
import {
  Lightbulb,
  Zap,
  TrendingDown,
  SunMedium,
  CheckCircle2,
  Filter,
  Sparkles,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Recommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await apiClient.getRecommendations();
        setRecommendations(res.data.data.recommendations);
      } catch (err) {
        console.error('Failed to load recommendations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  const categories = ['ALL', 'HVAC', 'LIGHTING', 'RENEWABLE', 'APPLIANCE', 'GENERAL'];

  const filtered = recommendations.filter((r) => {
    if (filter === 'ALL') return true;
    return r.category === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Smart Energy Recommendations
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-eco-500/10 text-eco-400 border border-eco-500/20 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI-Rule Assisted
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tailored actionable guidance computed directly from your active appliances, peak load times, and clean energy mix.
          </p>
        </div>

        <Link
          to="/settings"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition self-start sm:self-auto"
        >
          Adjust Target Limits <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-slate-900 p-2.5 rounded-2xl border border-slate-800">
        <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filter === c
                ? 'bg-eco-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-850'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Recommendations Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">Analyzing telemetry for recommendations...</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((rec) => {
            const isHigh = rec.impact === 'HIGH';
            const isMedium = rec.impact === 'MEDIUM';

            return (
              <div
                key={rec.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {rec.category}
                        </span>
                        <h3 className="text-sm font-bold text-white">{rec.title}</h3>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border ${
                        isHigh
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : isMedium
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}
                    >
                      {rec.impact} IMPACT
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mt-3">
                    {rec.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-eco-400 font-semibold">
                    <TrendingDown className="w-4 h-4" />
                    <span>Est. Savings: {rec.potentialSavings}</span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium">
                    Verified Green Strategy
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900 border border-dashed border-slate-800 rounded-2xl">
          <Lightbulb className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No recommendations in this category</h3>
          <p className="text-xs text-slate-400 mt-1">Check back as your daily consumption profile expands.</p>
        </div>
      )}
    </div>
  );
};
