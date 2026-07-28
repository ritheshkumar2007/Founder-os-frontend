import { useCallback, useSyncExternalStore } from "react";
import type { AppState, FounderUser, SprintDay, Venture } from "./types";

const KEY = "founderos.state.v2";

export const uid = () => Math.random().toString(36).slice(2, 10);

const defaultSprint = (): SprintDay[] =>
  [
    "Finalize the MVP and landing page",
    "Create the first outreach list",
    "Contact 10 potential users",
    "Post in one relevant community",
    "Demo the product to early users",
    "Collect feedback",
    "Review results and decide the next step",
  ].map((title, i) => ({
    day: i + 1,
    title,
    notes: "",
    tasks: [{ id: uid(), title, done: false }],
  }));

export function createVenture(name: string): Venture {
  return {
    id: uid(),
    name,
    createdAt: new Date().toISOString(),
    brief: {
      building: "",
      audience: "",
      problem: "",
      workaround: "",
      outcome: "",
      saved: false,
    },
    interviews: [],
    summaryNotes: "",
    analyzed: false,
    mvp: {
      coreProblem: "",
      job: "",
      promise: "",
      outcome: "",
      buildNow: [],
      later: [],
      target: "Two weeks",
    },
    milestones: [
      "Design the core user flow",
      "Build the smallest usable MVP",
      "Test the MVP with early users",
    ].map((title) => ({ id: uid(), title, tasks: [] })),
    marketing: {
      idealCustomer: "",
      positioning: "",
      message: "",
      headline: "",
      cta: "",
      channels: ["", "", ""],
      outreach: "",
      communityPost: "",
      referral: "",
      contentIdeas: ["", "", ""],
      firstHundred: "",
    },
    sprint: defaultSprint(),
    traction: {
      contacted: 0,
      interviews: 0,
      waitlist: 0,
      tried: 0,
      active: 0,
      paying: 0,
      revenue: 0,
      history: [],
    },
    investor: {
      company: name,
      problem: "",
      solution: "",
      customer: "",
      validation: "",
      mvp: "",
      marketing: "",
      traction: "",
      learnings: "",
      nextMilestone: "",
      ask: "",
    },
    chat: [],
  };
}

const empty: AppState = { user: null, ventures: [], activeId: null };

let state: AppState = empty;
let hydrated = false;
const listeners = new Set<() => void>();

function read(): AppState {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...(JSON.parse(raw) as AppState) };
  } catch {
    return empty;
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  state = read();
}

function emit() {
  listeners.forEach((l) => l());
}

function write(next: AppState) {
  state = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }
  emit();
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): AppState {
  hydrate();
  return state;
}

function getServerSnapshot(): AppState {
  return empty;
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function signIn(user: FounderUser) {
  const current = getSnapshot();
  let next: AppState = { ...current, user };
  if (next.ventures.length === 0) {
    const v = createVenture("Untitled Venture");
    next = { ...next, ventures: [v], activeId: v.id };
  }
  if (!next.activeId) next = { ...next, activeId: next.ventures[0].id };
  write(next);
}

export function signOut() {
  write({ ...getSnapshot(), user: null });
}

export function addVenture(name: string) {
  const current = getSnapshot();
  const v = createVenture(name || "Untitled Venture");
  write({ ...current, ventures: [...current.ventures, v], activeId: v.id });
  return v.id;
}

export function setActiveVenture(id: string) {
  write({ ...getSnapshot(), activeId: id });
}

export function updateVenture(id: string, updater: (v: Venture) => Venture) {
  const current = getSnapshot();
  write({
    ...current,
    ventures: current.ventures.map((v) => (v.id === id ? updater(v) : v)),
  });
}

export function useActiveVenture() {
  const app = useAppState();
  const venture = app.ventures.find((v) => v.id === app.activeId) ?? null;
  const update = useCallback(
    (updater: (v: Venture) => Venture) => {
      if (venture) updateVenture(venture.id, updater);
    },
    [venture?.id], // eslint-disable-line react-hooks/exhaustive-deps
  );
  return { app, venture, update };
}