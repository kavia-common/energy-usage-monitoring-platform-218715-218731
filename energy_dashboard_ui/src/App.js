import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppShell } from "./components/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { OverviewPage } from "./pages/OverviewPage";
import { DevicesPage } from "./pages/DevicesPage";
import { LiveUsagePage } from "./pages/LiveUsagePage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AlertsPage } from "./pages/AlertsPage";

// PUBLIC_INTERFACE
function App() {
  /** App entry component defining routes for auth and the main dashboard. */
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppShell>
                  <OverviewPage />
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/app/devices"
            element={
              <ProtectedRoute>
                <AppShell>
                  <DevicesPage />
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/app/live"
            element={
              <ProtectedRoute>
                <AppShell>
                  <LiveUsagePage />
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/app/analytics"
            element={
              <ProtectedRoute>
                <AppShell>
                  <AnalyticsPage />
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/app/alerts"
            element={
              <ProtectedRoute>
                <AppShell>
                  <AlertsPage />
                </AppShell>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
