import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Cpu,
  Zap,
  SunMedium,
  BarChart3,
  Lightbulb,
  BellRing,
  FileSpreadsheet,
  Settings,
  UserCheck,
  ShieldAlert,
  Users,
  Layers,
  Leaf,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Devices', path: '/devices', icon: Cpu },
    { name: 'Consumption', path: '/consumption', icon: Zap },
    { name: 'Renewables', path: '/renewable', icon: SunMedium },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Recommendations', path: '/recommendations', icon: Lightbulb },
    { name: 'Alerts', path: '/alerts', icon: BellRing },
    { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
    { name: 'Energy Limits', path: '/settings', icon: Settings },
    { name: 'My Profile', path: '/profile', icon: UserCheck },
  ];

  const adminItems = [
    { name: 'Admin Dashboard', path: '/admin', icon: ShieldAlert },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Tariff Config', path: '/admin/tariffs', icon: Layers },
    { name: 'Platform Alerts', path: '/admin/alerts', icon: BellRing },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-eco-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-eco-500/20">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
                GREEN <span className="text-eco-400">GRID</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono block -mt-1">SMART ENERGY</span>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {/* Main User Navigation */}
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Energy Controls
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? 'bg-eco-600 text-white shadow-md shadow-eco-600/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Admin Navigation Section */}
          {isAdmin && (
            <div>
              <p className="px-3 text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> System Admin
              </p>
              <nav className="space-y-1">
                {adminItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-semibold'
                          : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>

        {/* Eco Badge Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-850/80 border border-slate-800 text-center">
            <span className="text-[11px] text-eco-400 font-semibold flex items-center justify-center gap-1">
              <SunMedium className="w-3.5 h-3.5" /> 100% Green Certified
            </span>
            <p className="text-[10px] text-slate-500 mt-1">Smart Carbon Tracking v1.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};
