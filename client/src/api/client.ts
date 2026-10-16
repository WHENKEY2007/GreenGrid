import axios from 'axios';
import {
  User,
  Device,
  EnergyConsumption,
  RenewableGeneration,
  Alert,
  EnergySettings,
  Recommendation,
  AnalyticsSummary,
  DailyTimelinePoint,
  DeviceBreakdownItem,
  CarbonAnalyticsPoint,
  EnergyTariff,
} from '../types';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('greengrid_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('greengrid_token');
      localStorage.removeItem('greengrid_user');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export const apiClient = {
  // Auth
  register: (data: any) => api.post<{ success: boolean; data: { user: User; token: string } }>('/auth/register', data),
  login: (data: any) => api.post<{ success: boolean; data: { user: User; token: string } }>('/auth/login', data),
  me: () => api.get<{ success: boolean; data: { user: User } }>('/auth/me'),

  // Profile
  getProfile: () => api.get<{ success: boolean; data: { user: User } }>('/users/me'),
  updateProfile: (data: { name?: string; phone?: string }) =>
    api.put<{ success: boolean; data: { user: User } }>('/users/me', data),
  changePassword: (data: any) => api.put<{ success: boolean; message: string }>('/users/me/password', data),

  // Devices
  getDevices: () => api.get<{ success: boolean; data: { devices: Device[] } }>('/devices'),
  getDeviceById: (id: string) => api.get<{ success: boolean; data: { device: Device } }>(`/devices/${id}`),
  createDevice: (data: any) => api.post<{ success: boolean; data: { device: Device } }>('/devices', data),
  updateDevice: (id: string, data: any) => api.put<{ success: boolean; data: { device: Device } }>(`/devices/${id}`, data),
  deleteDevice: (id: string) => api.delete<{ success: boolean; message: string }>(`/devices/${id}`),

  // Consumption
  getConsumptions: (params?: any) =>
    api.get<{
      success: boolean;
      data: { records: EnergyConsumption[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
    }>('/consumption', { params }),
  createConsumption: (data: any) =>
    api.post<{ success: boolean; data: { record: EnergyConsumption } }>('/consumption', data),
  updateConsumption: (id: string, data: any) =>
    api.put<{ success: boolean; data: { record: EnergyConsumption } }>(`/consumption/${id}`, data),
  deleteConsumption: (id: string) => api.delete<{ success: boolean; message: string }>(`/consumption/${id}`),

  // Renewable
  getRenewables: () => api.get<{ success: boolean; data: { records: RenewableGeneration[] } }>('/renewable'),
  createRenewable: (data: any) =>
    api.post<{ success: boolean; data: { record: RenewableGeneration } }>('/renewable', data),
  updateRenewable: (id: string, data: any) =>
    api.put<{ success: boolean; data: { record: RenewableGeneration } }>(`/renewable/${id}`, data),
  deleteRenewable: (id: string) => api.delete<{ success: boolean; message: string }>(`/renewable/${id}`),

  // Analytics
  getAnalyticsSummary: () => api.get<{ success: boolean; data: AnalyticsSummary }>('/analytics/summary'),
  getDailyAnalytics: (days = 30) =>
    api.get<{ success: boolean; data: { timeline: DailyTimelinePoint[] } }>('/analytics/daily', { params: { days } }),
  getDeviceAnalytics: () => api.get<{ success: boolean; data: { devices: DeviceBreakdownItem[] } }>('/analytics/devices'),
  getCarbonAnalytics: () =>
    api.get<{ success: boolean; data: { carbon: CarbonAnalyticsPoint[] } }>('/analytics/carbon'),

  // Recommendations
  getRecommendations: () =>
    api.get<{ success: boolean; data: { recommendations: Recommendation[] } }>('/recommendations'),

  // Alerts
  getAlerts: () => api.get<{ success: boolean; data: { alerts: Alert[]; unreadCount: number } }>('/alerts'),
  markAlertAsRead: (id: string) => api.put<{ success: boolean; data: { alert: Alert } }>(`/alerts/${id}/read`),
  markAllAlertsAsRead: () => api.put<{ success: boolean; message: string }>('/alerts/read-all'),
  deleteAlert: (id: string) => api.delete<{ success: boolean; message: string }>(`/alerts/${id}`),

  // Settings
  getSettings: () => api.get<{ success: boolean; data: { settings: EnergySettings } }>('/settings'),
  updateSettings: (data: any) => api.put<{ success: boolean; data: { settings: EnergySettings } }>('/settings', data),

  // Reports
  getEnergyReport: (params?: { startDate?: string; endDate?: string }) =>
    api.get<{ success: boolean; data: any }>('/reports/energy', { params }),
  exportCsvReport: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get('/reports/energy/export', {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `green-grid-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Admin
  getAdminDashboard: () => api.get<{ success: boolean; data: any }>('/admin/dashboard'),
  getAdminUsers: (params?: { search?: string; page?: number; limit?: number }) =>
    api.get<{ success: boolean; data: any }>('/admin/users', { params }),
  getAdminUserDetails: (id: string) => api.get<{ success: boolean; data: any }>(`/admin/users/${id}`),
  updateAdminUserStatus: (id: string, isActive: boolean) =>
    api.put<{ success: boolean; data: any }>(`/admin/users/${id}/status`, { isActive }),
  getAdminAnalytics: () => api.get<{ success: boolean; data: any }>('/admin/analytics'),
  getAdminAlerts: () => api.get<{ success: boolean; data: any }>('/admin/alerts'),
  getAdminTariffs: () => api.get<{ success: boolean; data: { tariffs: EnergyTariff[] } }>('/admin/tariffs'),
  createAdminTariff: (data: any) => api.post<{ success: boolean; data: { tariff: EnergyTariff } }>('/admin/tariffs', data),
};

export default api;
