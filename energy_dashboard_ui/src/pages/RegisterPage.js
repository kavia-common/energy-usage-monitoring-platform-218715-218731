import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Notice } from "../components/Notice";

// PUBLIC_INTERFACE
export function RegisterPage() {
  /** Registration screen for the app. */
  const nav = useNavigate();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);

    if (!email || !password) {
      setErr("Please enter email and password.");
      return;
    }
    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await register({ email, password });
      nav("/app", { replace: true });
    } catch (error) {
      setErr(error?.message || "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="authShell">
      <div className="authCard">
        <section className="authHero">
          <h2>NEW OPERATOR</h2>
          <p className="mono">
            &gt; Create an account to bind devices and receive alerts.
            <br />
            &gt; Hint: use a strong password.
          </p>
        </section>

        <section className="authPanel" aria-label="Register form">
          <h3 className="mono" style={{ marginTop: 0 }}>REGISTER</h3>

          {err ? <Notice kind="error" title="Registration error">{err}</Notice> : null}

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
                autoComplete="new-password"
                placeholder="min 8 chars"
              />
            </div>
            <div>
              <div className="label mono">Confirm</div>
              <input
                className="input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                type="password"
                autoComplete="new-password"
                placeholder="repeat"
              />
            </div>

            <div className="helpRow">
              <span className="mono">{busy ? "provisioning…" : "ready"}</span>
              <span className="mono">
                have account? <Link to="/login">login</Link>
              </span>
            </div>

            <button className="btn btnPrimary" type="submit" disabled={busy}>
              {busy ? "Creating…" : "Create account"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
