import { useSyncExternalStore } from "react";
import { api, ApiError, errorMessage } from "./api";
import type {
  Analysis,
  Component,
  Config,
  Equipment,
  Stats,
  User,
} from "./types";

/**
 * Client-side session cache shared by every route. Each App Router page
 * remounts the workspace, so state lives at module level: config, the
 * current user and the workspace data load once per browser session, and
 * concurrent callers (including StrictMode double effects) share one
 * in-flight request.
 */
export type SessionState = {
  loading: boolean;
  sessionError: string;
  config: Config;
  user: User | null;
  dataLoaded: boolean;
  equipment: Equipment[];
  components: Component[];
  analyses: Analysis[];
  stats: Stats;
  details: Record<string, Analysis>;
  /** One-shot message shown on the login page (e.g. session expired). */
  flash: string;
};

const initial: SessionState = {
  loading: true,
  sessionError: "",
  config: { geminiConfigured: false, demoEnabled: false, model: "" },
  user: null,
  dataLoaded: false,
  equipment: [],
  components: [],
  analyses: [],
  stats: { equipment: 0, analyses: 0, recent: [] },
  details: {},
  flash: "",
};

let state = initial;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function setSession(
  update: Partial<SessionState> | ((s: SessionState) => Partial<SessionState>),
) {
  state = {
    ...state,
    ...(typeof update === "function" ? update(state) : update),
  };
  listeners.forEach((l) => l());
}
export const getSession = () => state;
export function useSession() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => initial,
  );
}

let sessionPromise: Promise<void> | null = null;
/** Loads /config and /auth/me once; failed loads can be retried. */
export function ensureSession(): Promise<void> {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      setSession({ loading: true, sessionError: "" });
      try {
        const [config, user] = await Promise.all([
          api<Config>("/config").catch(() => state.config),
          api<User>("/auth/me").catch((e) => {
            if (e instanceof ApiError && e.kind === "auth") return null;
            throw e;
          }),
        ]);
        setSession({ config, user, loading: false });
      } catch (e) {
        sessionPromise = null;
        setSession({ loading: false, sessionError: errorMessage(e) });
      }
    })();
  }
  return sessionPromise;
}
export function retrySession() {
  sessionPromise = null;
  return ensureSession();
}

let dataPromise: Promise<void> | null = null;
/** Loads the four workspace resources once per signed-in user. */
export function ensureData(force = false): Promise<void> {
  if (force) dataPromise = null;
  if (!dataPromise) {
    dataPromise = Promise.all([
      api<Equipment[]>("/equipment"),
      api<Component[]>("/components"),
      api<Analysis[]>("/analyses"),
      api<Stats>("/dashboard"),
    ]).then(
      ([equipment, components, analyses, stats]) =>
        setSession({
          equipment,
          components,
          analyses,
          stats,
          dataLoaded: true,
        }),
      (e) => {
        dataPromise = null;
        throw e;
      },
    );
  }
  return dataPromise;
}

const detailRequests = new Map<string, Promise<Analysis>>();
/** Returns a cached analysis or fetches it once. */
export function loadAnalysis(id: string): Promise<Analysis> {
  const cached =
    state.details[id] ||
    state.analyses.find((a) => a.id === id) ||
    state.stats.recent.find((a) => a.id === id);
  if (cached) return Promise.resolve(cached);
  let request = detailRequests.get(id);
  if (!request) {
    request = api<Analysis>(`/analyses/${id}`)
      .then((row) => {
        rememberAnalysis(row);
        return row;
      })
      .finally(() => detailRequests.delete(id));
    detailRequests.set(id, request);
  }
  return request;
}

/** Stores or replaces an analysis everywhere it is listed. */
export function rememberAnalysis(row: Analysis) {
  const swap = (list: Analysis[]) =>
    list.map((a) => (a.id === row.id ? row : a));
  setSession((s) => ({
    details: { ...s.details, [row.id]: row },
    analyses: swap(s.analyses),
    stats: { ...s.stats, recent: swap(s.stats.recent) },
  }));
}

export function addAnalysis(row: Analysis) {
  setSession((s) => ({
    details: { ...s.details, [row.id]: row },
    analyses: [row, ...s.analyses],
    stats: {
      ...s.stats,
      analyses: s.stats.analyses + 1,
      recent: [row, ...s.stats.recent].slice(0, 5),
    },
  }));
}

export function signedIn(user: User) {
  dataPromise = null;
  setSession({ ...initial, config: state.config, loading: false, user });
}
export function signedOut(flash = "") {
  dataPromise = null;
  detailRequests.clear();
  setSession({ ...initial, config: state.config, loading: false, flash });
}
