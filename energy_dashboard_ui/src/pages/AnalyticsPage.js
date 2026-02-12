import React, { useEffect, useState } from "react";
import { LoadingBlock } from "../components/LoadingBlock";
import { Notice } from "../components/Notice";
import { getInsights } from "../services/analyticsService";

function normalizeInsights(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.insights)) return payload.insights;
  return [];
}

// PUBLIC_INTERFACE
export function AnalyticsPage() {
  /** Analytics/insights page. */
  const [range, setRange] = useState("7d");
  const [state, setState] = useState({ status: "loading", data: null, error: null });

  useEffect(() => {
    let alive = true;
    async function run() {
      setState({ status: "loading", data: null, error: null });
      try {
        const data = await getInsights({ range });
        if (!alive) return;
        setState({ status: "ready", data, error: null });
      } catch (e) {
        if (!alive) return;
        setState({ status: "error", data: null, error: e?.message || "Failed to load insights." });
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [range]);

  if (state.status === "loading") return <LoadingBlock label="Computing insights…" />;

  if (state.status === "error") {
    return (
      <Notice kind="error" title="Analytics unavailable">
        {state.error}
        <div style={{ marginTop: 8 }}>
          Expected endpoint: <span className="mono">GET /analytics/insights?range=...</span>
        </div>
      </Notice>
    );
  }

  const insights = normalizeInsights(state.data);

  return (
    <>
      <section className="card">
        <div className="cardHeader"><div className="cardTitle">Controls</div></div>
        <div className="cardBody">
          <div className="grid grid2">
            <div>
              <div className="label mono">Range</div>
              <select className="select" value={range} onChange={(e) => setRange(e.target.value)}>
                <option value="24h">24h</option>
                <option value="7d">7d</option>
                <option value="30d">30d</option>
              </select>
              <div className="helpRow" style={{ marginTop: 8 }}>
                <span className="mono">mode</span>
                <span className="mono">insights</span>
              </div>
            </div>
            <div>
              <div className="label mono">Summary</div>
              <div className="notice" style={{ marginTop: 6 }}>
                <div className="mono">Rules-of-thumb</div>
                <div style={{ color: "var(--muted)", marginTop: 6 }}>
                  Look for spikes, long steady loads, and devices with unusual duty cycles.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="cardHeader"><div className="cardTitle">Insights</div></div>
        <div className="cardBody">
          {insights.length === 0 ? (
            <Notice title="No insights yet">
              Once usage series data exists, the analytics engine will emit insights here.
            </Notice>
          ) : (
            <table className="table" aria-label="Insights table">
              <thead>
                <tr>
                  <th>type</th>
                  <th>severity</th>
                  <th>message</th>
                </tr>
              </thead>
              <tbody>
                {insights.map((it, idx) => (
                  <tr key={it.id || idx}>
                    <td className="mono">{it.type || "insight"}</td>
                    <td>
                      <span className="badge">
                        <span className={`dot ${it.severity === "high" ? "dotDanger" : it.severity === "medium" ? "dotWarn" : "dotOk"}`} />
                        <span className="mono">{it.severity || "low"}</span>
                      </span>
                    </td>
                    <td>{it.message || it.text || JSON.stringify(it)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}
