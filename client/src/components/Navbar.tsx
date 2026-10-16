import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, ShieldCheck, Sun, Zap, CheckCircle } from 'lucide-react';
import { apiClient } from '../api/client';
import { Alert } from '../types';

export const Navbar: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [unreadAlerts, setUnreadAlerts] = useState<Alert[]>([]);
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    if (user) {
      apiClient.getAlerts().then((res) => {
        setUnreadAlerts(res.data.data.alerts.filter((a) => !a.isRead));
      }).catch(() => {});
    }
  }, [user]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient.markAlertAsRead(id);
      setUnreadAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {}
  };

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      {/* Mobile toggle button */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/60"
          aria-label="Toggle Navigation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/40 border border-slate-700/50 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-eco-500 animate-pulse"></span>
          <span>Grid Status: Optimal (100% Online)</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Alerts Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowAlertMenu(!showAlertMenu);
              setShowProfileMenu(false);
            }}
            className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full flex items-center justify-center animate-bounce">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showAlertMenu && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-850">
                <span className="font-semibold text-sm text-slate-200 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-eco-400" /> Notifications & Alerts
                </span>
                <Link
                  to="/alerts"
                  onClick={() => setShowAlertMenu(false)}
                  className="text-xs text-eco-400 hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {unreadAlerts.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                    <CheckCircle className="w-8 h-8 text-eco-500" />
                    <span>No active threshold breaches. All energy metrics are normal.</span>
                  </div>
                ) : (
                  unreadAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        setShowAlertMenu(false);
                        navigate('/alerts');
                      }}
                      className="p-3 hover:bg-slate-800/60 transition cursor-pointer flex gap-3 text-left"
                    >
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 h-fit">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-200">{alert.title}</p>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{alert.message}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleMarkAsRead(alert.id, e)}
                        className="text-[10px] text-slate-500 hover:text-eco-400 self-center"
                        title="Mark as read"
                      >
                        Dismiss
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowAlertMenu(false);
            }}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-eco-600 to-teal-400 flex items-center justify-center font-bold text-white text-xs shadow-md">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                {isAdmin ? (
                  <span className="text-amber-400 font-medium flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> Admin
                  </span>
                ) : (
                  'Eco Prosumer'
                )}
              </p>
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-800">
                <p className="text-xs font-medium text-slate-300">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 transition"
              >
                <User className="w-4 h-4 text-slate-400" /> Account Settings
              </Link>

              <Link
                to="/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 transition"
              >
                <Zap className="w-4 h-4 text-slate-400" /> Energy Thresholds
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-amber-400 hover:bg-slate-800 transition"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" /> Admin Cockpit
                </Link>
              )}

              <div className="border-t border-slate-800 my-1"></div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-slate-800 transition"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
