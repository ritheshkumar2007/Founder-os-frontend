import { useCallback, useSyncExternalStore } from "react";
import type { AppState, FounderUser, SprintDay, Venture } from "./types";
import api, { getAuthToken } from "../api";

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

export function normalizeVenture(v: any): Venture {
  const name = v?.name || v?.ventureName || "Untitled Venture";
  const id = v?.id || v?._id?.toString?.() || v?._id || uid();

  // Interviews translation
  let interviews: any[] = [];
  if (Array.isArray(v?.interviews) && v.interviews.length > 0) {
    interviews = v.interviews;
  } else if (Array.isArray(v?.ideaValidation?.customerValidation?.interviews)) {
    interviews = v.ideaValidation.customerValidation.interviews.map((i: any) => ({
      id: i._id?.toString?.() || i.id || uid(),
      name: i.personName || i.name || "Anonymous",
      role: i.role || "",
      quote: i.quote || "",
      pain: i.pain || (i.painLevel === "HIGH" ? "High" : i.painLevel === "LOW" ? "Low" : "Medium"),
      pay: i.pay || (i.wouldPay === "YES" ? "Yes" : i.wouldPay === "NO" ? "No" : "Maybe"),
    }));
  }

  // Milestones translation
  let milestones = Array.isArray(v?.milestones) && v.milestones.length > 0
    ? v.milestones
    : Array.isArray(v?.roadmap?.milestones) && v.roadmap.milestones.length > 0
    ? v.roadmap.milestones.map((m: any) => ({
        id: m._id?.toString?.() || m.id || uid(),
        title: m.title || "Milestone",
        tasks: Array.isArray(m.tasks)
          ? m.tasks.map((t: any) => (typeof t === "string" ? { id: uid(), title: t, done: false } : t))
          : [],
      }))
    : [
        "Design the core user flow",
        "Build the smallest usable MVP",
        "Test the MVP with early users",
      ].map((title) => ({ id: uid(), title, tasks: [] }));

  // Sprint translation
  let sprint = Array.isArray(v?.sprint) && v.sprint.length > 0
    ? v.sprint
    : Array.isArray(v?.launchSprint?.days) && v.launchSprint.days.length > 0
    ? v.launchSprint.days.map((d: any) => ({
        day: d.day,
        title: d.title || `Day ${d.day}`,
        notes: d.notes || "",
        tasks: Array.isArray(d.tasks)
          ? d.tasks.map((t: any) => ({
              id: t._id?.toString?.() || t.id || uid(),
              title: t.text || t.title || "",
              done: Boolean(t.completed || t.done),
            }))
          : [],
      }))
    : defaultSprint();

  return {
    id,
    name,
    createdAt: v?.createdAt || new Date().toISOString(),
    brief: {
      building: v?.brief?.building || v?.ideaValidation?.ventureBrief?.building || "",
      audience: v?.brief?.audience || v?.ideaValidation?.ventureBrief?.targetCustomer || "",
      problem: v?.brief?.problem || v?.ideaValidation?.ventureBrief?.problem || "",
      workaround: v?.brief?.workaround || v?.ideaValidation?.ventureBrief?.currentWorkaround || "",
      outcome: v?.brief?.outcome || v?.ideaValidation?.ventureBrief?.desiredOutcome || "",
      saved: Boolean(v?.brief?.saved || v?.ideaValidation?.ventureBrief?.building),
    },
    interviews,
    summaryNotes: v?.summaryNotes || v?.ideaValidation?.founderNotes?.text || "",
    analyzed: Boolean(v?.analyzed || v?.ideaValidation?.validationInsights?.lastAnalyzedAt),
    mvp: {
      coreProblem: v?.mvp?.coreProblem || v?.mvpScope?.coreCustomerProblem || "",
      job: v?.mvp?.job || v?.mvpScope?.mainCustomerJob || "",
      promise: v?.mvp?.promise || v?.mvpScope?.mvpPromise || "",
      outcome: v?.mvp?.outcome || v?.mvpScope?.desiredOutcome || "",
      buildNow: Array.isArray(v?.mvp?.buildNow)
        ? v.mvp.buildNow
        : Array.isArray(v?.mvpScope?.buildNow)
        ? v.mvpScope.buildNow
        : Array.isArray(v?.mvpScope?.mustHaveFeatures)
        ? v.mvpScope.mustHaveFeatures
        : [],
      later: Array.isArray(v?.mvp?.later)
        ? v.mvp.later
        : Array.isArray(v?.mvpScope?.buildLater)
        ? v.mvpScope.buildLater
        : Array.isArray(v?.mvpScope?.excludedFeatures)
        ? v.mvpScope.excludedFeatures
        : [],
      target: v?.mvp?.target || v?.mvpScope?.buildTarget || "Two weeks",
    },
    milestones,
    marketing: {
      idealCustomer: v?.marketing?.idealCustomer || v?.marketingPlan?.idealCustomerProfile || "",
      positioning: v?.marketing?.positioning || v?.marketingPlan?.positioningStatement || "",
      message: v?.marketing?.message || v?.marketingPlan?.marketingMessage || "",
      headline: v?.marketing?.headline || v?.marketingPlan?.landingPageHeadline || "",
      cta: v?.marketing?.cta || v?.marketingPlan?.callToAction || "",
      channels: Array.isArray(v?.marketing?.channels)
        ? v.marketing.channels
        : Array.isArray(v?.marketingPlan?.launchChannels)
        ? v.marketingPlan.launchChannels
        : ["", "", ""],
      outreach: v?.marketing?.outreach || v?.marketingPlan?.directOutreachMessage || "",
      communityPost: v?.marketing?.communityPost || v?.marketingPlan?.communityPostTemplate || "",
      referral: v?.marketing?.referral || v?.marketingPlan?.referralIdea || "",
      contentIdeas: Array.isArray(v?.marketing?.contentIdeas)
        ? v.marketing.contentIdeas
        : Array.isArray(v?.marketingPlan?.contentIdeas)
        ? v.marketingPlan.contentIdeas
        : ["", "", ""],
      firstHundred: v?.marketing?.firstHundred || v?.marketingPlan?.first100UsersStrategy || "",
    },
    sprint,
    traction: {
      contacted: v?.traction?.contacted ?? v?.traction?.peopleContacted ?? 0,
      interviews: v?.traction?.interviews ?? v?.traction?.customerInterviews ?? 0,
      waitlist: v?.traction?.waitlist ?? v?.traction?.waitlistSignups ?? 0,
      tried: v?.traction?.tried ?? v?.traction?.mvpUsers ?? 0,
      active: v?.traction?.active ?? v?.traction?.activeUsers ?? 0,
      paying: v?.traction?.paying ?? v?.traction?.payingUsers ?? 0,
      revenue: v?.traction?.revenue ?? v?.traction?.monthlyRevenue ?? 0,
      history: Array.isArray(v?.traction?.history) ? v.traction.history : [],
    },
    investor: {
      company: v?.investor?.company || v?.investorUpdate?.companyName || name,
      problem: v?.investor?.problem || v?.investorUpdate?.problem || "",
      solution: v?.investor?.solution || v?.investorUpdate?.solution || "",
      customer: v?.investor?.customer || v?.investorUpdate?.targetCustomer || "",
      validation: v?.investor?.validation || v?.investorUpdate?.validationEvidence || "",
      mvp: v?.investor?.mvp || v?.investorUpdate?.mvpProgress || "",
      marketing: v?.investor?.marketing || v?.investorUpdate?.marketingProgress || "",
      traction: v?.investor?.traction || v?.investorUpdate?.tractionSummary || "",
      learnings: v?.investor?.learnings || v?.investorUpdate?.keyLearnings || "",
      nextMilestone: v?.investor?.nextMilestone || v?.investorUpdate?.nextMilestone || "",
      ask: v?.investor?.ask || v?.investorUpdate?.fundingNeeded || "",
    },
    chat: Array.isArray(v?.chat) ? v.chat : [],
  };
}

const empty: AppState = { user: null, ventures: [], activeId: null, saveStatus: "saved", users: {} };

let state: AppState = empty;
let hydrated = false;
let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function read(): AppState {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const users = parsed.users ?? {};

    // Normalize ventures in users object
    Object.keys(users).forEach((email) => {
      if (users[email]) {
        users[email].ventures = (users[email].ventures || []).map((v) => normalizeVenture(v));
      }
    });

    // Backward compatibility: If legacy user exists but not in users map, migrate legacy user data
    if (parsed.user && parsed.user.email) {
      const email = parsed.user.email.toLowerCase().trim();
      if (!users[email]) {
        users[email] = {
          user: parsed.user,
          ventures: (parsed.ventures ?? []).map((v) => normalizeVenture(v)),
          activeId: parsed.activeId ?? null,
        };
      }
    }

    let activeUser = parsed.user ?? null;
    let ventures: Venture[] = [];
    let activeId: string | null = null;

    if (activeUser && activeUser.email) {
      const email = activeUser.email.toLowerCase().trim();
      const record = users[email];
      if (record) {
        activeUser = record.user;
        ventures = record.ventures;
        activeId = record.activeId;
      }
    } else {
      ventures = (parsed.ventures ?? []).map((v) => normalizeVenture(v));
      activeId = parsed.activeId ?? null;
    }

    return {
      user: activeUser,
      ventures,
      activeId,
      saveStatus: "saved",
      users,
    };
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

function syncUserRecord(current: AppState, user: FounderUser, ventures: Venture[], activeId: string | null, lastRoute?: string): AppState {
  const email = user.email.toLowerCase().trim();
  const users = { ...current.users };
  const existingRecord = users[email];
  const normalizedVentures = (ventures || []).map((v) => normalizeVenture(v));
  users[email] = {
    user: { ...user, email },
    ventures: normalizedVentures,
    activeId,
    lastRoute: lastRoute ?? existingRecord?.lastRoute,
  };
  return {
    ...current,
    user: { ...user, email },
    ventures: normalizedVentures,
    activeId,
    users,
  };
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

// Asynchronous Backend MongoDB Sync Helper
export async function syncVentureToBackend(v: Venture) {
  if (!getAuthToken()) return;
  try {
    // 1. Brief
    await api.saveVentureBrief(v.id, {
      ventureName: v.name,
      building: v.brief.building,
      targetCustomer: v.brief.audience,
      problem: v.brief.problem,
      currentWorkaround: v.brief.workaround,
      desiredOutcome: v.brief.outcome,
    });

    // 2. MVP Scope
    await api.saveMvpScope(v.id, {
      coreCustomerProblem: v.mvp.coreProblem,
      mainCustomerJob: v.mvp.job,
      mvpPromise: v.mvp.promise,
      desiredOutcome: v.mvp.outcome,
      buildNow: v.mvp.buildNow,
      buildLater: v.mvp.later,
      buildTarget: v.mvp.target,
    });

    // 3. Marketing Plan
    await api.saveMarketingPlan(v.id, {
      idealCustomerProfile: v.marketing.idealCustomer,
      positioningStatement: v.marketing.positioning,
      marketingMessage: v.marketing.message,
      landingPageHeadline: v.marketing.headline,
      callToAction: v.marketing.cta,
      launchChannels: v.marketing.channels,
      directOutreachMessage: v.marketing.outreach,
      communityPostTemplate: v.marketing.communityPost,
      referralIdea: v.marketing.referral,
      contentIdeas: v.marketing.contentIdeas,
      first100UsersStrategy: v.marketing.firstHundred,
    });

    // 4. Traction
    await api.saveTraction(v.id, {
      peopleContacted: v.traction.contacted,
      customerInterviews: v.traction.interviews,
      waitlistSignups: v.traction.waitlist,
      mvpUsers: v.traction.tried,
      activeUsers: v.traction.active,
      payingUsers: v.traction.paying,
      monthlyRevenue: v.traction.revenue,
    });

    // 5. Investor Update
    await api.updateInvestorUpdate(v.id, {
      companyName: v.investor.company || v.name,
      problem: v.investor.problem,
      solution: v.investor.solution,
      targetCustomer: v.investor.customer,
      validationEvidence: v.investor.validation,
      mvpProgress: v.investor.mvp,
      marketingProgress: v.investor.marketing,
      tractionSummary: v.investor.traction,
      keyLearnings: v.investor.learnings,
      nextMilestone: v.investor.nextMilestone,
      fundingNeeded: v.investor.ask,
    });
  } catch (err) {
    console.warn("Backend sync notice:", err);
  }
}

export async function fetchUserVenturesFromBackend() {
  if (!getAuthToken()) return;
  try {
    const res = await api.getVentures();
    if (res.success && Array.isArray(res.data?.ventures) && res.data.ventures.length > 0) {
      const current = getSnapshot();
      const loadedVentures = res.data.ventures.map((v: any) => normalizeVenture(v));
      const activeId = loadedVentures[0]?.id || current.activeId;
      if (current.user) {
        const nextState = syncUserRecord(current, current.user, loadedVentures, activeId);
        write(nextState);
      }
    }
  } catch (err) {
    console.warn("Backend fetch notice:", err);
  }
}

export function signIn(user: FounderUser, options?: { lastRoute?: string }) {
  const current = getSnapshot();
  const email = user.email.toLowerCase().trim();
  const normalizedUser: FounderUser = { ...user, email };

  const existingRecord = current.users[email];
  let ventures: Venture[] = existingRecord?.ventures ?? [];
  let activeId: string | null = existingRecord?.activeId ?? null;

  // If user has no ventures, automatically create a new empty venture and set active venture
  if (ventures.length === 0) {
    const v = createVenture("Untitled Venture");
    ventures = [v];
    activeId = v.id;
  } else if (!activeId || !ventures.some((v) => v.id === activeId)) {
    activeId = ventures[0].id;
  }

  const nextState = syncUserRecord(
    current,
    normalizedUser,
    ventures,
    activeId,
    options?.lastRoute ?? existingRecord?.lastRoute
  );
  write(nextState);

  // Fetch real MongoDB ventures asynchronously
  fetchUserVenturesFromBackend();

  return { user: normalizedUser, activeVentureId: activeId, lastRoute: existingRecord?.lastRoute };
}

export function signOut() {
  const current = getSnapshot();
  let nextUsers = { ...current.users };
  if (current.user) {
    const email = current.user.email.toLowerCase().trim();
    nextUsers[email] = {
      ...nextUsers[email],
      user: current.user,
      ventures: current.ventures,
      activeId: current.activeId,
    };
  }
  const next: AppState = {
    user: null,
    ventures: [],
    activeId: null,
    saveStatus: "saved",
    users: nextUsers,
  };
  write(next);
}

export function addVenture(name: string): string {
  const current = getSnapshot();
  const v = createVenture(name || "Untitled Venture");
  const nextVentures = [...current.ventures, v];
  const nextActiveId = v.id;

  if (current.user) {
    const nextState = syncUserRecord(current, current.user, nextVentures, nextActiveId);
    write(nextState);
  } else {
    write({ ...current, ventures: nextVentures, activeId: nextActiveId });
  }

  // Create on MongoDB backend
  if (getAuthToken()) {
    api.createVenture({ ventureName: name || "Untitled Venture" }).then((res) => {
      if (res.success && res.data?.venture?._id) {
        const mongoId = res.data.venture._id.toString();
        updateVenture(v.id, (oldV) => ({ ...oldV, id: mongoId }));
        setActiveVenture(mongoId);
      }
    });
  }

  return v.id;
}

export function setActiveVenture(id: string) {
  const current = getSnapshot();
  if (current.user) {
    const nextState = syncUserRecord(current, current.user, current.ventures, id);
    write(nextState);
  } else {
    write({ ...current, activeId: id });
  }
}

export function updateVenture(id: string, updater: (v: Venture) => Venture) {
  const current = getSnapshot();
  let updatedVentureObj: Venture | null = null;
  const nextVentures = current.ventures.map((v) => {
    if (v.id === id) {
      updatedVentureObj = updater(v);
      return updatedVentureObj;
    }
    return v;
  });

  let nextState: AppState = {
    ...current,
    ventures: nextVentures,
    saveStatus: "saving",
  };

  if (current.user) {
    nextState = syncUserRecord(nextState, current.user, nextVentures, current.activeId);
  }

  write(nextState);

  // Debounced auto-save indicator transition from "saving" to "saved" & API backend sync
  if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(() => {
    const stateSnapshot = getSnapshot();
    if (stateSnapshot.saveStatus === "saving") {
      write({ ...stateSnapshot, saveStatus: "saved" });
    }
    if (updatedVentureObj) {
      syncVentureToBackend(updatedVentureObj);
    }
  }, 600);
}

export function setLastRoute(route: string) {
  const current = getSnapshot();
  if (current.user) {
    const email = current.user.email.toLowerCase().trim();
    const existingRecord = current.users[email];
    if (existingRecord?.lastRoute === route) return;
    const nextState = syncUserRecord(current, current.user, current.ventures, current.activeId, route);
    write(nextState);
  }
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