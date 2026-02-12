import { useEffect, useMemo, useRef, useState } from "react";
import { getAuthToken } from "../services/apiClient";

const DEFAULT_WS_BASE_URL = "ws://localhost:3001";

function getWsBaseUrl() {
  return process.env.REACT_APP_WS_BASE_URL || DEFAULT_WS_BASE_URL;
}

// PUBLIC_INTERFACE
export function useWebSocket({ path, enabled, onMessage }) {
  /** Manage a WebSocket connection and expose connection status and last message. */
  const [status, setStatus] = useState("idle"); // idle | connecting | open | closed | error
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);

  const url = useMemo(() => {
    const base = getWsBaseUrl();
    const token = getAuthToken();
    const tokenParam = token ? `?token=${encodeURIComponent(token)}` : "";
    return `${base}${path.startsWith("/") ? path : `/${path}`}${tokenParam}`;
  }, [path]);

  useEffect(() => {
    if (!enabled) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setStatus("idle");
      return undefined;
    }

    let ws;
    try {
      setStatus("connecting");
      ws = new WebSocket(url);
      wsRef.current = ws;
    } catch {
      setStatus("error");
      return undefined;
    }

    ws.onopen = () => setStatus("open");
    ws.onerror = () => setStatus("error");
    ws.onclose = () => setStatus("closed");
    ws.onmessage = (evt) => {
      let data = evt.data;
      try {
        data = JSON.parse(evt.data);
      } catch {
        // keep raw string
      }
      setLastMessage(data);
      if (onMessage) onMessage(data);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [enabled, url, onMessage]);

  return { status, lastMessage };
}
