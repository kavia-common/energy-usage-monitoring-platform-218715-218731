import React from "react";

// PUBLIC_INTERFACE
export function LoadingBlock({ label = "Loading…" }) {
  /** A compact loading indicator with a retro shimmer bar. */
  return (
    <div className="card">
      <div className="cardBody">
        <div className="helpRow">
          <span className="mono">{label}</span>
          <span className="mono">CTRL+R to resync</span>
        </div>
        <div className="loadingBar" aria-label={label} role="status">
          <div />
        </div>
      </div>
    </div>
  );
}
