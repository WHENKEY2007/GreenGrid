import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// User Pages
import { Dashboard } from './pages/dashboard/Dashboard';
import { Devices } from './pages/devices/Devices';
import { Consumption } from './pages/consumption/Consumption';
import { Renewable } from './pages/renewable/Renewable';
import { Analytics } from './pages/analytics/Analytics';
import { Recommendations } from './pages/recommendations/Recommendations';
import { Alerts } from './pages/alerts/Alerts';
import { Reports } from './pages/reports/Reports';
import { Settings } from './pages/settings/Settings';
import { Profile } from './pages/profile/Profile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminTariffs } from './pages/admin/AdminTariffs';
import { AdminAlerts } from './pages/admin/AdminAlerts';

// Common Pages
import { About } from './pages/common/About';
import { NotFound } from './pages/common/NotFound';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />

          {/* Authenticated Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/devices" element={<Devices />} />
              <Route path="/consumption" element={<Consumption />} />
              <Route path="/renewable" element={<Renewable />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />

              {/* Admin-Only Sub-Routes */}
              <Route element={<ProtectedRoute requireAdmin />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/tariffs" element={<AdminTariffs />} />
                <Route path="/admin/alerts" element={<AdminAlerts />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
