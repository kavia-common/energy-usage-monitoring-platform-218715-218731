import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Notice } from "../components/Notice";

// PUBLIC_INTERFACE
export function LoginPage() {
  /** Login screen for the app. */
  const nav = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);

    if (!email || !password) {
      setErr("Please enter email and password.");
      return;
    }

    setBusy(true);
    try {
      await login({ email, password });
      nav("/app", { replace: true });
    } catch (error) {
      setErr(error?.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="authShell">
      <div className="authCard">
        <section className="authHero">
          <h2>ENERGY CONSOLE</h2>
          <p className="mono">
            &gt; Authenticate to access devices, live telemetry, analytics, and alert rules.
            <br />
            &gt; Retro UI. Real-time data.
          </p>
          <div className="grid" style={{ marginTop: 12 }}>
            <div className="card">
              <div className="cardHeader">
                <div className="cardTitle">Connection</div>
              </div>
              <div className="cardBody">
                <div className="kv">
                  <div className="kvRow">
                    <div className="kvKey mono">REST</div>
                    <div className="kvVal">{process.env.REACT_APP_API_BASE_URL || "http://localhost:3001"}</div>
                  </div>
                  <div className="kvRow">
                    <div className="kvKey mono">WS</div>
                    <div className="kvVal">{process.env.REACT_APP_WS_BASE_URL || "ws://localhost:3001"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="authPanel" aria-label="Login form">
          <h3 className="mono" style={{ marginTop: 0 }}>LOGIN</h3>

          {err ? <Notice kind="error" title="Auth error">{err}</Notice> : null}

          <form className="form" onSubmit={onSubmit}>
            <div>
              <div className="label mono">Email</div>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="you@domain.com"
              />
            </div>
            <div>
              <div className="label mono">Password</div>
              <input
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>

            <div className="helpRow">
              <span className="mono">{busy ? "authenticating…" : "ready"}</span>
              <span className="mono">
                no account? <Link to="/register">register</Link>
              </span>
            </div>

            <button className="btn btnPrimary" type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div style={{ marginTop: 10 }}>
            <Notice kind="warn" title="Backend note">
              The backend OpenAPI currently only exposes a health endpoint. This UI expects auth endpoints like{" "}
              <span className="mono">/auth/login</span> and will show errors until the backend implements them.
            </Notice>
          </div>
        </section>
      </div>
    </div>
  );
}
