import React from "react";

// PUBLIC_INTERFACE
export function Notice({ kind = "info", title, children }) {
  /** Render an informational/warning/error notice. kind: info|warn|error */
  const cls =
    kind === "error"
      ? "notice noticeError"
      : kind === "warn"
        ? "notice noticeWarn"
        : "notice";

  return (
    <div className={cls} role={kind === "error" ? "alert" : "status"}>
      {title ? <div style={{ fontWeight: 900, marginBottom: 6 }}>{title}</div> : null}
      <div style={{ color: "var(--muted)", lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}
