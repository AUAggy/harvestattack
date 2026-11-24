/**
 * The session provider. It owns the reducer state, restores an opt-in saved
 * session on mount, and persists on every change while saving is enabled.
 * It lives apart from session.tsx so that module exports no components.
 */
import { useEffect, useMemo, useReducer, type ReactNode } from "react";
import { SessionContext, initialState, sessionReducer, type SessionState } from "./session";

const SESSION_STORAGE_KEY = "harvestattack-session-v1";

function loadSavedState(): SessionState | null {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionState;
    // Minimal shape validation. An incompatible record is ignored, not reinterpreted.
    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray(parsed.flows) &&
      Array.isArray(parsed.signingAssets) &&
      Array.isArray(parsed.pkiReviews) &&
      Array.isArray(parsed.actions) &&
      parsed.scenario
    ) {
      return { ...initialState, ...parsed, saveOnThisDevice: true };
    }
    return null;
  } catch {
    return null;
  }
}

function persistState(state: SessionState): void {
  try {
    if (state.saveOnThisDevice) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
    } else {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // Storage denial must not block the session. Saving stays unavailable.
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState, (init) => loadSavedState() ?? init);

  useEffect(() => {
    persistState(state);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
