import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function getTitleFromPath(pathname) {
  if (pathname.startsWith("/devices")) return { title: "Devices", subtitle: "Manage smart plugs/meters and metadata." };
  if (pathname.startsWith("/live")) return { title: "Live Usage", subtitle: "Real-time power draw stream (WS + fallback polling)." };
  if (pathname.startsWith("/analytics")) return { title: "Analytics", subtitle: "Insights, anomalies, and efficiency hints." };
  if (pathname.startsWith("/alerts")) return { title: "Alerts", subtitle: "Threshold rules and notification routing." };
  return { title: "Overview", subtitle: "At-a-glance system status and key metrics." };
}

// PUBLIC_INTERFACE
export function AppShell({ children }) {
  /** Main authenticated layout with sidebar navigation. */
  const { user, logout } = useAuth();
  const loc = useLocation();
  const { title, subtitle } = getTitleFromPath(loc.pathname);

  return (
    <div className="appShell">
      <aside className="sidebar" aria-label="Sidebar navigation">
        <div className="brand">
          <div className="brandMark" aria-hidden="true" />
          <div className="brandText">
            <h1>Energy Console</h1>
            <p className="mono">retro-dashboard v0.1</p>
          </div>
        </div>

        <nav className="nav" aria-label="Primary">
          <NavLink to="/app" end className={({ isActive }) => (isActive ? "navItem navItemActive" : "navItem")}>
            <span className="mono">01</span> Overview
          </NavLink>
          <NavLink to="/app/devices" className={({ isActive }) => (isActive ? "navItem navItemActive" : "navItem")}>
            <span className="mono">02</span> Devices
          </NavLink>
          <NavLink to="/app/live" className={({ isActive }) => (isActive ? "navItem navItemActive" : "navItem")}>
            <span className="mono">03</span> Live Usage
          </NavLink>
          <NavLink to="/app/analytics" className={({ isActive }) => (isActive ? "navItem navItemActive" : "navItem")}>
            <span className="mono">04</span> Analytics
          </NavLink>
          <NavLink to="/app/alerts" className={({ isActive }) => (isActive ? "navItem navItemActive" : "navItem")}>
            <span className="mono">05</span> Alerts
          </NavLink>
        </nav>

        <div className="sidebarFooter">
          <div style={{ display: "grid", gap: 10 }}>
            <div className="mono">
              signed-in: <span style={{ color: "var(--text)" }}>{user?.email || "unknown"}</span>
            </div>
            <button className="btn btnSmall" onClick={logout} type="button">
              Logout
            </button>
            <div>
              <div className="mono">Tip:</div>
              <div>Set <span className="mono">REACT_APP_API_BASE_URL</span> and <span className="mono">REACT_APP_WS_BASE_URL</span>.</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbarLeft">
            <h2 className="pageTitle">{title}</h2>
            <p className="pageSubtitle">{subtitle}</p>
          </div>
          <div className="topbarRight">
            <span className="pill mono">{new Date().toLocaleString()}</span>
          </div>
        </header>

        <div className="grid">{children}</div>
      </main>
    </div>
  );
}
