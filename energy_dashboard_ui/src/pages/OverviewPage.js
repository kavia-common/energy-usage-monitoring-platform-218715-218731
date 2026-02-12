import React, { useEffect, useState } from "react";
import { LoadingBlock } from "../components/LoadingBlock";
import { Notice } from "../components/Notice";
import { getOverview } from "../services/usageService";

// PUBLIC_INTERFACE
export function OverviewPage() {
  /** Overview dashboard showing key metrics. */
  const [state, setState] = useState({ status: "loading", data: null, error: null });

  useEffect(() => {
    let alive = true;
    async function run() {
      setState({ status: "loading", data: null, error: null });
      try {
        const data = await getOverview();
        if (!alive) return;
        setState({ status: "ready", data, error: null });
      } catch (e) {
        if (!alive) return;
        setState({ status: "error", data: null, error: e?.message || "Failed to load overview." });
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, []);

  if (state.status === "loading") return <LoadingBlock label="Loading overview…" />;

  if (state.status === "error") {
    return (
      <Notice kind="error" title="Overview unavailable">
        {state.error}
        <div style={{ marginTop: 8 }}>
          Expected endpoint: <span className="mono">GET /dashboard/overview</span>
        </div>
      </Notice>
    );
  }

  const d = state.data || {};
  const metrics = d.metrics || d;

  const todayKwh = metrics.today_kwh ?? metrics.todayKwh ?? null;
  const activeDevices = metrics.active_devices ?? metrics.activeDevices ?? null;
  const alertsActive = metrics.alerts_active ?? metrics.alertsActive ?? null;

  return (
    <>
      <section className="grid grid3">
        <div className="card">
          <div className="cardHeader"><div className="cardTitle">Today Usage</div></div>
          <div className="cardBody">
            <div className="kv">
              <div className="kvRow">
                <div className="kvKey mono">kWh</div>
                <div className="kvVal">{todayKwh == null ? "—" : Number(todayKwh).toFixed(2)}</div>
              </div>
              <div className="helpRow">
                <span className="mono">range</span>
                <span className="mono">00:00 → now</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="cardHeader"><div className="cardTitle">Devices</div></div>
          <div className="cardBody">
            <div className="kv">
              <div className="kvRow">
                <div className="kvKey mono">active</div>
                <div className="kvVal">{activeDevices == null ? "—" : activeDevices}</div>
              </div>
              <div className="helpRow">
                <span className="mono">status</span>
                <span className="mono">polled</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="cardHeader"><div className="cardTitle">Alerts</div></div>
          <div className="cardBody">
            <div className="kv">
              <div className="kvRow">
                <div className="kvKey mono">enabled</div>
                <div className="kvVal">{alertsActive == null ? "—" : alertsActive}</div>
              </div>
              <div className="helpRow">
                <span className="mono">engine</span>
                <span className="mono">rules</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="cardHeader"><div className="cardTitle">System Feed</div></div>
        <div className="cardBody">
          {Array.isArray(d.feed) && d.feed.length > 0 ? (
            <table className="table" aria-label="System feed">
              <thead>
                <tr>
                  <th>time</th>
                  <th>type</th>
                  <th>message</th>
                </tr>
              </thead>
              <tbody>
                {d.feed.map((it, idx) => (
                  <tr key={it.id || idx}>
                    <td className="mono">{it.time || it.timestamp || "—"}</td>
                    <td>
                      <span className="badge">
                        <span className={`dot ${it.level === "error" ? "dotDanger" : it.level === "warn" ? "dotWarn" : "dotOk"}`} />
                        <span className="mono">{it.level || "info"}</span>
                      </span>
                    </td>
                    <td>{it.message || JSON.stringify(it)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Notice title="No feed events">
              The system feed is empty. Once devices post usage data and alerts trigger, events will appear here.
            </Notice>
          )}
        </div>
      </section>
    </>
  );
}
