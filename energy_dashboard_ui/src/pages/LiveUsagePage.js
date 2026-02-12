import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Notice } from "../components/Notice";
import { LoadingBlock } from "../components/LoadingBlock";
import { listDevices } from "../services/deviceService";
import { getLiveUsage } from "../services/usageService";
import { useWebSocket } from "../hooks/useWebSocket";

function normalizeDevices(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.devices)) return payload.devices;
  return [];
}

function formatW(watts) {
  if (watts == null || Number.isNaN(Number(watts))) return "—";
  const w = Number(watts);
  if (w < 1000) return `${w.toFixed(0)} W`;
  return `${(w / 1000).toFixed(2)} kW`;
}

// PUBLIC_INTERFACE
export function LiveUsagePage() {
  /** Live usage view backed by WebSocket with REST fallback. */
  const [devStatus, setDevStatus] = useState("loading");
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("");

  const [snapshot, setSnapshot] = useState(null);
  const [snapStatus, setSnapStatus] = useState("idle");
  const [snapError, setSnapError] = useState(null);

  useEffect(() => {
    let alive = true;
    async function loadDevices() {
      setDevStatus("loading");
      try {
        const payload = await listDevices();
        if (!alive) return;
        const list = normalizeDevices(payload);
        setDevices(list);
        setDeviceId((list[0] && (list[0].id || list[0].device_id || list[0].deviceId)) || "");
        setDevStatus("ready");
      } catch (e) {
        if (!alive) return;
        setDevStatus("error");
      }
    }
    loadDevices();
    return () => {
      alive = false;
    };
  }, []);

  const onWsMessage = useCallback((msg) => {
    // Expect message shape like: { device_id, watts, kwh_total, ts }
    setSnapshot(msg);
  }, []);

  const wsPath = useMemo(() => "/ws/usage", []);
  const wsEnabled = Boolean(deviceId); // connect when device selected
  const ws = useWebSocket({ path: wsPath, enabled: wsEnabled, onMessage: onWsMessage });

  // REST fallback polling (only when WS is not open)
  useEffect(() => {
    if (!deviceId) return undefined;

    let timer = null;
    let alive = true;

    async function poll() {
      setSnapStatus("loading");
      setSnapError(null);
      try {
        const data = await getLiveUsage(deviceId);
        if (!alive) return;
        setSnapshot(data);
        setSnapStatus("ready");
      } catch (e) {
        if (!alive) return;
        setSnapError(e?.message || "Failed to fetch live usage.");
        setSnapStatus("error");
      }
    }

    if (ws.status !== "open") {
      poll();
      timer = window.setInterval(poll, 5000);
    }

    return () => {
      alive = false;
      if (timer) window.clearInterval(timer);
    };
  }, [deviceId, ws.status]);

  if (devStatus === "loading") return <LoadingBlock label="Loading devices for live usage…" />;

  if (devStatus === "error") {
    return (
      <Notice kind="error" title="Devices unavailable">
        Could not load devices. Live usage requires at least one device.
      </Notice>
    );
  }

  const watts = snapshot?.watts ?? snapshot?.power_watts ?? snapshot?.powerWatts ?? null;
  const totalKwh = snapshot?.kwh_total ?? snapshot?.total_kwh ?? snapshot?.totalKwh ?? null;
  const ts = snapshot?.ts || snapshot?.timestamp || null;

  return (
    <>
      <section className="card">
        <div className="cardHeader"><div className="cardTitle">Session</div></div>
        <div className="cardBody">
          <div className="grid grid2">
            <div>
              <div className="label mono">Device</div>
              <select className="select" value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
                {devices.map((d, idx) => {
                  const id = d.id || d.device_id || d.deviceId || String(idx);
                  return (
                    <option key={id} value={id}>
                      {d.name || id}
                    </option>
                  );
                })}
              </select>
              <div className="helpRow" style={{ marginTop: 8 }}>
                <span className="mono">websocket</span>
                <span className="mono">{ws.status}</span>
              </div>
            </div>

            <div>
              <div className="label mono">Fallback</div>
              <div className="badge" style={{ marginTop: 6 }}>
                <span className={`dot ${ws.status === "open" ? "dotOk" : ws.status === "error" ? "dotDanger" : "dotWarn"}`} />
                <span className="mono">{ws.status === "open" ? "streaming" : "polling"}</span>
              </div>
              <div className="helpRow" style={{ marginTop: 8 }}>
                <span className="mono">REST status</span>
                <span className="mono">{snapStatus}</span>
              </div>
            </div>
          </div>

          {snapStatus === "error" && snapError ? (
            <div style={{ marginTop: 12 }}>
              <Notice kind="error" title="Live usage error">
                {snapError}
                <div style={{ marginTop: 8 }}>
                  Expected endpoints: <span className="mono">GET /usage/live?device_id=...</span> and WS <span className="mono">/ws/usage</span>
                </div>
              </Notice>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid grid2">
        <div className="card">
          <div className="cardHeader"><div className="cardTitle">Power Draw</div></div>
          <div className="cardBody">
            <div className="kv">
              <div className="kvRow">
                <div className="kvKey mono">now</div>
                <div className="kvVal">{formatW(watts)}</div>
              </div>
              <div className="kvRow">
                <div className="kvKey mono">updated</div>
                <div className="kvVal mono">{ts ? String(ts) : "—"}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="cardHeader"><div className="cardTitle">Energy</div></div>
          <div className="cardBody">
            <div className="kv">
              <div className="kvRow">
                <div className="kvKey mono">total</div>
                <div className="kvVal">{totalKwh == null ? "—" : `${Number(totalKwh).toFixed(3)} kWh`}</div>
              </div>
              <div className="helpRow">
                <span className="mono">source</span>
                <span className="mono">{ws.status === "open" ? "WS" : "REST"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="cardHeader"><div className="cardTitle">Raw Packet</div></div>
        <div className="cardBody">
          <pre className="mono" style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {snapshot ? JSON.stringify(snapshot, null, 2) : "—"}
          </pre>
        </div>
      </section>
    </>
  );
}
