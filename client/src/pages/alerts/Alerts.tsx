import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { Alert } from '../../types';
import {
  BellRing,
  CheckCheck,
  Trash2,
  AlertTriangle,
  Zap,
  IndianRupee,
  SunMedium,
  CheckCircle,
  Clock,
  Filter,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const fetchAlerts = async () => {
    try {
      const res = await apiClient.getAlerts();
      setAlerts(res.data.data.alerts);
      setUnreadCount(res.data.data.unreadCount);
    } catch (err) {
      console.error('Failed to load alerts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.markAlertAsRead(id);
      fetchAlerts();
    } catch (err) {
      console.error('Failed to mark alert as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.markAllAlertsAsRead();
      fetchAlerts();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteAlert(id);
      fetchAlerts();
    } catch (err) {
      console.error('Failed to delete alert', err);
    }
  };

  const filtered = alerts.filter((a) => (filterUnreadOnly ? !a.isRead : true));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Alerts & Anomaly Notifications
            {unreadCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                {unreadCount} Unread
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated alerts triggered when daily consumption, monthly bills, or peak appliance draw breach your configured thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
            >
              <CheckCheck className="w-4 h-4 text-eco-400" />
              Mark All as Read
            </button>
          )}

          <Link
            to="/settings"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
          >
            Configure Thresholds
          </Link>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800 w-fit">
        <button
          onClick={() => setFilterUnreadOnly(false)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            !filterUnreadOnly ? 'bg-eco-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          All Alerts ({alerts.length})
        </button>
        <button
          onClick={() => setFilterUnreadOnly(true)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filterUnreadOnly ? 'bg-eco-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">Loading alerts...</div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((alert) => {
            const isHighCost = alert.type === 'HIGH_COST';
            const isHighConsumption = alert.type === 'HIGH_CONSUMPTION';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  alert.isRead
                    ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                    : 'bg-slate-900 border-slate-700 shadow-lg ring-1 ring-rose-500/20'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      alert.isRead
                        ? 'bg-slate-800 text-slate-500'
                        : isHighCost
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : isHighConsumption
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {isHighCost ? (
                      <IndianRupee className="w-5 h-5" />
                    ) : isHighConsumption ? (
                      <Zap className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm font-bold ${
                          alert.isRead ? 'text-slate-300' : 'text-white'
                        }`}
                      >
                        {alert.title}
                      </h3>
                      {!alert.isRead && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{alert.message}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                      {alert.threshold && (
                        <span>Threshold breached: {alert.threshold}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                  {!alert.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(alert.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Dismiss Alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900 border border-dashed border-slate-800 rounded-2xl">
          <CheckCircle className="w-10 h-10 text-eco-400 mx-auto mb-2 opacity-80" />
          <h3 className="text-sm font-bold text-white">No active alerts</h3>
          <p className="text-xs text-slate-400 mt-1">
            {filterUnreadOnly
              ? 'You have caught up with all active notifications!'
              : 'Your electricity consumption and bills are within configured target parameters.'}
          </p>
        </div>
      )}
    </div>
  );
};
