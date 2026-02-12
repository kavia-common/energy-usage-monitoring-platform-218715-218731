import React, { useEffect, useMemo, useState } from "react";
import { LoadingBlock } from "../components/LoadingBlock";
import { Notice } from "../components/Notice";
import { createDevice, deleteDevice, listDevices, updateDevice } from "../services/deviceService";

function normalizeDevices(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.devices)) return payload.devices;
  return [];
}

// PUBLIC_INTERFACE
export function DevicesPage() {
  /** Device management page (CRUD). */
  const [status, setStatus] = useState("loading"); // loading|ready|error
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);

  const [mode, setMode] = useState("create"); // create|edit
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [deviceType, setDeviceType] = useState("smart_plug");

  const [saving, setSaving] = useState(false);

  const canSubmit = useMemo(() => {
    return name.trim().length >= 2 && !saving;
  }, [name, saving]);

  async function refresh() {
    setStatus("loading");
    setError(null);
    try {
      const payload = await listDevices();
      setDevices(normalizeDevices(payload));
      setStatus("ready");
    } catch (e) {
      setError(e?.message || "Failed to load devices.");
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
    setLocation("");
    setDeviceType("smart_plug");
  }

  function startEdit(d) {
    setMode("edit");
    setEditingId(d.id || d.device_id || d.deviceId);
    setName(d.name || "");
    setLocation(d.location || "");
    setDeviceType(d.type || d.device_type || "smart_plug");
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    try {
      if (mode === "create") {
        await createDevice({ name: name.trim(), location: location.trim(), type: deviceType });
      } else {
        await updateDevice(editingId, { name: name.trim(), location: location.trim(), type: deviceType });
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
    try {
      await deleteDevice(id);
      await refresh();
      if (editingId === id) resetForm();
    } catch (e) {
      setError(e?.message || "Delete failed.");
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") return <LoadingBlock label="Loading devices…" />;

  return (
    <>
      {status === "error" && error ? (
        <Notice kind="error" title="Devices error">
          {error}
          <div style={{ marginTop: 8 }}>
            Expected endpoints: <span className="mono">GET/POST /devices</span>, <span className="mono">PUT/DELETE /devices/:id</span>
          </div>
        </Notice>
      ) : null}

      <section className="grid grid2">
        <div className="card">
          <div className="cardHeader">
            <div className="cardTitle">{mode === "create" ? "Register Device" : "Edit Device"}</div>
          </div>
          <div className="cardBody">
            <form className="form" onSubmit={onSubmit}>
              <div>
                <div className="label mono">Name</div>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Kitchen Plug" />
              </div>
              <div>
                <div className="label mono">Location</div>
                <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Kitchen" />
              </div>
              <div>
                <div className="label mono">Type</div>
                <select className="select" value={deviceType} onChange={(e) => setDeviceType(e.target.value)}>
                  <option value="smart_plug">smart_plug</option>
                  <option value="energy_meter">energy_meter</option>
                  <option value="other">other</option>
                </select>
              </div>

              <div className="helpRow">
                <span className="mono">{saving ? "writing…" : "ready"}</span>
                <span className="mono">{mode === "edit" ? `id: ${editingId || "—"}` : "new record"}</span>
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
          <div className="cardHeader"><div className="cardTitle">Inventory</div></div>
          <div className="cardBody">
            {devices.length === 0 ? (
              <Notice title="No devices">
                Register a device to start collecting usage. Devices will appear here once created.
              </Notice>
            ) : (
              <table className="table" aria-label="Devices table">
                <thead>
                  <tr>
                    <th>name</th>
                    <th>location</th>
                    <th>type</th>
                    <th>actions</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((d, idx) => {
                    const id = d.id || d.device_id || d.deviceId || idx;
                    return (
                      <tr key={id}>
                        <td style={{ fontWeight: 900 }}>{d.name || "—"}</td>
                        <td className="mono">{d.location || "—"}</td>
                        <td className="mono">{d.type || d.device_type || "—"}</td>
                        <td>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button className="btn btnSmall" type="button" onClick={() => startEdit(d)} disabled={saving}>
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
