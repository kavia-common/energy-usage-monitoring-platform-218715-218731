import React, { useEffect, useMemo, useState } from "react";
import { LoadingBlock } from "../components/LoadingBlock";
import { Notice } from "../components/Notice";
import { createAlert, deleteAlert, listAlerts, updateAlert } from "../services/alertService";

function normalizeAlerts(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.alerts)) return payload.alerts;
  return [];
}

// PUBLIC_INTERFACE
export function AlertsPage() {
  /** Alerts management page (create/update/delete rules). */
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const [mode, setMode] = useState("create");
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [thresholdWatts, setThresholdWatts] = useState("500");
  const [enabled, setEnabled] = useState(true);
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);

  const canSubmit = useMemo(() => {
    const thr = Number(thresholdWatts);
    return name.trim().length >= 2 && Number.isFinite(thr) && thr > 0 && !saving;
  }, [name, thresholdWatts, saving]);

  async function refresh() {
    setStatus("loading");
    setError(null);
    try {
      const payload = await listAlerts();
      setAlerts(normalizeAlerts(payload));
      setStatus("ready");
    } catch (e) {
      setError(e?.message || "Failed to load alerts.");
      setStatus("error");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function resetForm() {
    setMode("create");
    setEditingId(null);
    setName("");
    setThresholdWatts("500");
    setEnabled(true);
    setNotes("");
  }

  function startEdit(a) {
    setMode("edit");
    setEditingId(a.id || a.alert_id || a.alertId);
    setName(a.name || "");
    setThresholdWatts(String(a.threshold_watts ?? a.thresholdWatts ?? 500));
    setEnabled(Boolean(a.enabled ?? true));
    setNotes(a.notes || a.description || "");
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        threshold_watts: Number(thresholdWatts),
        enabled,
        notes: notes.trim(),
      };

      if (mode === "create") {
        await createAlert(payload);
      } else {
        await updateAlert(editingId, payload);
      }

      await refresh();
      resetForm();
    } catch (e2) {
      setError(e2?.message || "Save failed.");
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    setSaving(true);
    setError(null);
    try {
      await deleteAlert(id);
      await refresh();
      if (editingId === id) resetForm();
    } catch (e) {
      setError(e?.message || "Delete failed.");
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") return <LoadingBlock label="Loading alert rules…" />;

  return (
    <>
      {status === "error" && error ? (
        <Notice kind="error" title="Alerts error">
          {error}
          <div style={{ marginTop: 8 }}>
            Expected endpoints: <span className="mono">GET/POST /alerts</span>, <span className="mono">PUT/DELETE /alerts/:id</span>
          </div>
        </Notice>
      ) : null}

      <section className="grid grid2">
        <div className="card">
          <div className="cardHeader"><div className="cardTitle">{mode === "create" ? "Create Alert Rule" : "Edit Alert Rule"}</div></div>
          <div className="cardBody">
            <form className="form" onSubmit={onSubmit}>
              <div>
                <div className="label mono">Name</div>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="High Load" />
              </div>

              <div>
                <div className="label mono">Threshold (Watts)</div>
                <input
                  className="input"
                  value={thresholdWatts}
                  onChange={(e) => setThresholdWatts(e.target.value)}
                  inputMode="numeric"
                  placeholder="500"
                />
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  id="enabled"
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                />
                <label htmlFor="enabled" className="mono" style={{ fontWeight: 900 }}>
                  enabled
                </label>
              </div>

              <div>
                <div className="label mono">Notes</div>
                <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional routing / context…" />
              </div>

              <div className="helpRow">
                <span className="mono">{saving ? "writing…" : "ready"}</span>
                <span className="mono">{mode === "edit" ? `id: ${editingId || "—"}` : "new rule"}</span>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btnPrimary" type="submit" disabled={!canSubmit}>
                  {saving ? "Saving…" : mode === "create" ? "Create" : "Save"}
                </button>
                {mode === "edit" ? (
                  <button className="btn" type="button" onClick={resetForm} disabled={saving}>
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="cardHeader"><div className="cardTitle">Rules</div></div>
          <div className="cardBody">
            {alerts.length === 0 ? (
              <Notice title="No alert rules">
                Create a rule to monitor devices. When usage exceeds the threshold, the backend can trigger notifications.
              </Notice>
            ) : (
              <table className="table" aria-label="Alerts table">
                <thead>
                  <tr>
                    <th>name</th>
                    <th>threshold</th>
                    <th>enabled</th>
                    <th>actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((a, idx) => {
                    const id = a.id || a.alert_id || a.alertId || idx;
                    const thr = a.threshold_watts ?? a.thresholdWatts ?? "—";
                    return (
                      <tr key={id}>
                        <td style={{ fontWeight: 900 }}>{a.name || "—"}</td>
                        <td className="mono">{thr} W</td>
                        <td>
                          <span className="badge">
                            <span className={`dot ${a.enabled ? "dotOk" : "dotWarn"}`} />
                            <span className="mono">{a.enabled ? "yes" : "no"}</span>
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button className="btn btnSmall" type="button" onClick={() => startEdit(a)} disabled={saving}>
                              Edit
                            </button>
                            <button className="btn btnSmall btnDanger" type="button" onClick={() => onDelete(id)} disabled={saving}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            <div style={{ marginTop: 10 }}>
              <button className="btn btnSmall" type="button" onClick={refresh} disabled={saving}>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
