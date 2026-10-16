import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-eco-500/10 border border-eco-500/20 text-eco-400 flex items-center justify-center mb-6">
        <Leaf className="w-8 h-8" />
      </div>
      <h1 className="text-6xl font-black text-white font-mono">404</h1>
      <h2 className="text-xl font-bold text-white mt-2">Grid Coordinate Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm mt-2">
        The energy telemetry path or dashboard view you requested does not exist or has been relocated.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-eco-600 hover:bg-eco-500 transition shadow-lg shadow-eco-600/30"
        >
          <Home className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
