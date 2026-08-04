/**
 * FounderOS API Client & Backend Connection Service
 */

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  "https://founder-os-backend-hhwl.onrender.com";

const API_BASE_URL = API_URL.endsWith("/api") ? API_URL : `${API_URL.replace(/\/$/, "")}/api`;

const TOKEN_KEY = "founderos.token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

async function fetchEndpoint<T = any>(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; status?: number }> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${baseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
  const response = await fetch(url, { ...options, headers });
  const status = response.status;
  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      success: false,
      error: json.message || `Request failed with status ${status}`,
      status,
      data: json,
    };
  }

  return {
    success: true,
    data: json,
    status,
  };
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; status?: number }> {
  try {
    return await fetchEndpoint<T>(API_BASE_URL, endpoint, options);
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Network error. Backend server is unreachable.",
    };
  }
}

async function requestWithFallback<T = any>(
  primaryEndpoint: string,
  fallbackEndpoints: string[],
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; status?: number }> {
  const primaryRes = await request<T>(primaryEndpoint, options);
  if (primaryRes.status !== 404) {
    return primaryRes;
  }
  for (const fallback of fallbackEndpoints) {
    const fbRes = await request<T>(fallback, options);
    if (fbRes.status !== 404) {
      return fbRes;
    }
  }
  return primaryRes;
}

export const api = {
  // Health Check
  getHealth: () => request("health"),

  // Authentication
  register: (payload: { name: string; email: string; password?: string }) =>
    request("auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password?: string }) =>
    request("auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: () =>
    request("auth/logout", {
      method: "POST",
    }),

  getMe: () => request("auth/me"),

  // Ventures
  createVenture: (payload: { ventureName: string }) =>
    request("ventures", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getVentures: () => request("ventures"),

  getVentureById: (ventureId: string) => request(`ventures/${ventureId}`),

  updateVenture: (ventureId: string, payload: { ventureName: string }) =>
    request(`ventures/${ventureId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteVenture: (ventureId: string) =>
    request(`ventures/${ventureId}`, {
      method: "DELETE",
    }),

  // Idea Validation - Brief
  saveVentureBrief: (ventureId: string, payload: any) =>
    request(`ventures/${ventureId}/idea-validation/venture-brief`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getVentureBrief: (ventureId: string) =>
    request(`ventures/${ventureId}/idea-validation/venture-brief`),

  // Customer Validation - Interviews
  createInterview: (ventureId: string, payload: any) =>
    request(`ventures/${ventureId}/interviews`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getInterviews: (ventureId: string) =>
    request(`ventures/${ventureId}/interviews`),

  updateInterview: (ventureId: string, interviewId: string, payload: any) =>
    request(`ventures/${ventureId}/interviews/${interviewId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteInterview: (ventureId: string, interviewId: string) =>
    request(`ventures/${ventureId}/interviews/${interviewId}`, {
      method: "DELETE",
    }),

  // Validation Insights
  analyzeInterviews: (ventureId: string) =>
    request(`ventures/${ventureId}/analyze`, {
      method: "POST",
    }),

  // Founder Notes
  saveFounderNotes: (ventureId: string, text: string) =>
    request(`ventures/${ventureId}/founder-notes`, {
      method: "PUT",
      body: JSON.stringify({ text }),
    }),

  getFounderNotes: (ventureId: string) =>
    request(`ventures/${ventureId}/founder-notes`),

  // Progress
  getProgress: (ventureId: string) =>
    request(`ventures/${ventureId}/progress`),

  // MVP Scope
  getMvpScope: (ventureId: string) =>
    request(`ventures/${ventureId}/mvp-scope`),

  saveMvpScope: (ventureId: string, payload: any) =>
    request(`ventures/${ventureId}/mvp-scope`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Build Roadmap
  getRoadmap: (ventureId: string) =>
    request(`ventures/${ventureId}/roadmap`),

  saveRoadmap: (ventureId: string, payload: any) =>
    request(`ventures/${ventureId}/roadmap`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Marketing Plan
  getMarketingPlan: (ventureId: string) =>
    request(`ventures/${ventureId}/marketing-plan`),

  saveMarketingPlan: (ventureId: string, payload: any) =>
    request(`ventures/${ventureId}/marketing-plan`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Launch Sprint
  getLaunchSprint: (ventureId: string) =>
    request(`ventures/${ventureId}/launch-sprint`),

  saveLaunchSprint: (ventureId: string, payload: any) =>
    request(`ventures/${ventureId}/launch-sprint`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  addTask: (ventureId: string, payload: { day: number; text: string; notes?: string }) =>
    request(`ventures/${ventureId}/launch-sprint/tasks`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateTask: (ventureId: string, taskId: string, payload: any) =>
    request(`ventures/${ventureId}/launch-sprint/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteTask: (ventureId: string, taskId: string) =>
    request(`ventures/${ventureId}/launch-sprint/tasks/${taskId}`, {
      method: "DELETE",
    }),

  // Traction Dashboard
  getTraction: (ventureId: string) =>
    request(`ventures/${ventureId}/traction`),

  saveTraction: (ventureId: string, payload: any) =>
    request(`ventures/${ventureId}/traction`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getTractionHistory: (ventureId: string) =>
    request(`ventures/${ventureId}/traction/history`),

  // Investor Update
  getInvestorUpdate: (ventureId: string) =>
    request(`ventures/${ventureId}/investor-update`),

  createInvestorUpdate: (ventureId: string, payload?: any) =>
    request(`ventures/${ventureId}/investor-update`, {
      method: "POST",
      body: JSON.stringify(payload || {}),
    }),

  updateInvestorUpdate: (ventureId: string, payload: any) =>
    request(`ventures/${ventureId}/investor-update`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  getInvestorUpdateText: (ventureId: string) =>
    request(`ventures/${ventureId}/investor-update/text`),

  getInvestorUpdateSummary: (ventureId: string) =>
    request(`ventures/${ventureId}/investor-update/summary`),

  // AI Chat Assistant
  sendChatMessage: (payload: { ventureId: string; workspace?: string; message: string }) =>
    request("chat/message", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getChatHistory: (ventureId: string) =>
    request(`chat/${ventureId}`),

  clearChatHistory: (ventureId: string) =>
    request(`chat/${ventureId}`, {
      method: "DELETE",
    }),

  // Gemini AI Founder Coach
  aiChat: (payload: { ventureId?: string; message: string; history?: { role: string; content: string; id?: string; createdAt?: string }[] }) =>
    request("ai/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // AI Reports Engine
  getReports: (ventureId: string) =>
    request(`reports/${ventureId}`),

  getReportHistory: (ventureId: string, type: string) =>
    request(`reports/${ventureId}/type/${type}`),

  generateReports: (ventureId: string) =>
    request(`reports/${ventureId}/generate`, {
      method: "POST",
    }),

  // AI Execution OS
  getKanbanTasks: (ventureId: string) =>
    request(`execution/${ventureId}/kanban`),

  updateTaskStatus: (taskId: string, status: string) =>
    request(`execution/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  getSprint: (ventureId: string) =>
    request(`execution/${ventureId}/sprint`),

  updateSprintGoal: (sprintId: string, weeklyGoal: string) =>
    request(`execution/sprints/${sprintId}/goal`, {
      method: "PATCH",
      body: JSON.stringify({ weeklyGoal }),
    }),

  getMilestones: (ventureId: string) =>
    request(`execution/${ventureId}/milestones`),

  getPillarProgress: (ventureId: string) =>
    request(`execution/${ventureId}/progress`),

  getWeeklyReview: (ventureId: string) =>
    request(`execution/${ventureId}/review`),

  generateWeeklyReview: (ventureId: string) =>
    request(`execution/${ventureId}/review/generate`, {
      method: "POST",
    }),

  // FounderOS Growth OS
  getGrowthData: (ventureId: string) =>
    request(`growth/${ventureId}`),

  updateGrowthMetrics: (ventureId: string, metrics: Record<string, number>) =>
    request(`growth/${ventureId}/metrics`, {
      method: "POST",
      body: JSON.stringify({ metrics }),
    }),

  submitCustomerFeedback: (ventureId: string, payload: { rawText: string; customerSegment?: string }) =>
    request(`growth/${ventureId}/feedback`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  generateGrowthContent: (ventureId: string, contentType: string) =>
    request(`growth/${ventureId}/content`, {
      method: "POST",
      body: JSON.stringify({ contentType }),
    }),

  // AI MVP Scope Engine
  getMvpScope: (ventureId: string) =>
    requestWithFallback(`ventures/${ventureId}/mvp-scope`, [`mvp/${ventureId}`, `mvp-scope/${ventureId}`]),

  generateMvpScope: (ventureId: string) =>
    requestWithFallback(`ventures/${ventureId}/mvp-scope`, ["mvp/generate", "mvp-scope/generate"], {
      method: "POST",
      body: JSON.stringify({ ventureId }),
    }),

  updateMvpScope: (ventureId: string, payload: { coreGoal?: string; features?: any[] }) =>
    requestWithFallback(`ventures/${ventureId}/mvp-scope`, [`mvp/${ventureId}`, `mvp-scope/${ventureId}`], {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  generateMvpScopeModule: (payload: { ventureId?: string; ventureName?: string; idea?: string; targetUsers?: string; problem?: string }) => {
    const opts = { method: "POST", body: JSON.stringify(payload) };
    if (payload.ventureId) {
      return requestWithFallback(`ventures/${payload.ventureId}/mvp-scope`, ["mvp-scope/generate", "mvp/generate"], opts);
    }
    return requestWithFallback("mvp-scope/generate", ["mvp/generate"], opts);
  },

  getMvpScopeHistory: (ventureId: string) =>
    requestWithFallback(`ventures/${ventureId}/mvp-scope`, [`mvp-scope/${ventureId}`, `mvp/${ventureId}`]),

  // AI Build Roadmap Engine
  getRoadmap: (ventureId: string) =>
    requestWithFallback(`ventures/${ventureId}/roadmap`, [`roadmap/${ventureId}`, `build-roadmap/${ventureId}`]),

  generateRoadmap: (ventureId: string) =>
    requestWithFallback(`ventures/${ventureId}/roadmap`, ["roadmap/generate", "build-roadmap/generate"], {
      method: "POST",
      body: JSON.stringify({ ventureId }),
    }),

  updateRoadmap: (ventureId: string, payload: { phases?: any[] }) =>
    requestWithFallback(`ventures/${ventureId}/roadmap`, [`roadmap/${ventureId}`, `build-roadmap/${ventureId}`], {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  generateBuildRoadmapModule: (payload: { ventureId?: string; ventureName?: string; startupIdea?: string; mvpScope?: string; users?: string; stack?: string }) => {
    const opts = { method: "POST", body: JSON.stringify(payload) };
    if (payload.ventureId) {
      return requestWithFallback(`ventures/${payload.ventureId}/roadmap`, ["build-roadmap/generate", "roadmap/generate"], opts);
    }
    return requestWithFallback("build-roadmap/generate", ["roadmap/generate"], opts);
  },

  getBuildRoadmapHistory: (ventureId: string) =>
    requestWithFallback(`ventures/${ventureId}/roadmap`, [`build-roadmap/${ventureId}`, `roadmap/${ventureId}`]),

  // AI Marketing Plan Engine
  getMarketingPlan: (ventureId: string) =>
    requestWithFallback(`ventures/${ventureId}/marketing-plan`, [`marketing/${ventureId}`, `marketing-plan/${ventureId}`]),

  generateMarketingPlan: (ventureId: string) =>
    requestWithFallback(`ventures/${ventureId}/marketing-plan`, ["marketing/generate", "marketing-plan/generate"], {
      method: "POST",
      body: JSON.stringify({ ventureId }),
    }),

  updateMarketingPlan: (ventureId: string, payload: any) =>
    requestWithFallback(`ventures/${ventureId}/marketing-plan`, [`marketing/${ventureId}`, `marketing-plan/${ventureId}`], {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  generateMarketingPlanModule: (payload: { ventureId?: string; ventureName?: string; startupIdea?: string; mvpScope?: string; audience?: string; industry?: string; pricing?: string; goal?: string }) => {
    const opts = { method: "POST", body: JSON.stringify(payload) };
    if (payload.ventureId) {
      return requestWithFallback(`ventures/${payload.ventureId}/marketing-plan`, ["marketing-plan/generate", "marketing/generate"], opts);
    }
    return requestWithFallback("marketing-plan/generate", ["marketing/generate"], opts);
  },

  getMarketingPlanHistory: (ventureId: string) =>
    requestWithFallback(`ventures/${ventureId}/marketing-plan`, [`marketing-plan/${ventureId}`, `marketing/${ventureId}`]),

  // AI Launch Sprint Engine
  getLaunchSprint: (ventureId: string) =>
    requestWithFallback(`ventures/${ventureId}/launch-sprint`, [`launch/${ventureId}`, `launch-sprint/${ventureId}`]),

  generateLaunchSprint: (ventureId: string) =>
    requestWithFallback(`ventures/${ventureId}/launch-sprint`, ["launch/generate", "launch-sprint/generate"], {
      method: "POST",
      body: JSON.stringify({ ventureId }),
    }),

  updateLaunchSprint: (ventureId: string, payload: { checklist?: any[]; copyData?: any }) =>
    requestWithFallback(`ventures/${ventureId}/launch-sprint`, [`launch/${ventureId}`, `launch-sprint/${ventureId}`], {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  generateLaunchSprintModule: (payload: { ventureId?: string; ventureName?: string; idea?: string; mvpScope?: string; marketingPlan?: string; launchDate?: string; launchGoal?: string; targetAudience?: string }) => {
    const opts = { method: "POST", body: JSON.stringify(payload) };
    if (payload.ventureId) {
      return requestWithFallback(`ventures/${payload.ventureId}/launch-sprint`, ["launch-sprint/generate", "launch/generate"], opts);
    }
    return requestWithFallback("launch-sprint/generate", ["launch/generate"], opts);
  },

  getLaunchSprintHistory: (ventureId: string) =>
    requestWithFallback(`ventures/${ventureId}/launch-sprint`, [`launch-sprint/${ventureId}`, `launch/${ventureId}`]),

  // AI Traction Dashboard Engine
  getTractionData: (ventureId: string) =>
    requestWithFallback(`ventures/${ventureId}/traction`, [`traction/${ventureId}`, `traction-analyzer/history/${ventureId}`]),

  generateTractionData: (ventureId: string) =>
    requestWithFallback(`ventures/${ventureId}/traction`, ["traction/generate", "traction-analyzer/analyze"], {
      method: "POST",
      body: JSON.stringify({ ventureId }),
    }),

  updateTractionData: (ventureId: string, payload: any) =>
    requestWithFallback(`ventures/${ventureId}/traction`, [`traction/${ventureId}`, `traction-analyzer/${ventureId}`], {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  analyzeTractionModule: (payload: any) => {
    const opts = { method: "POST", body: JSON.stringify(payload) };
    if (payload.ventureId) {
      return requestWithFallback(`ventures/${payload.ventureId}/traction`, ["traction-analyzer/analyze", "traction/generate"], opts);
    }
    return requestWithFallback("traction-analyzer/analyze", ["traction/generate"], opts);
  },

  getTractionHistoryModule: (ventureId: string) =>
    requestWithFallback(`ventures/${ventureId}/traction`, [`traction-analyzer/history/${ventureId}`, `traction/${ventureId}`]),

  // AI Investor Update Engine
  getInvestorUpdate: (ventureId: string) =>
    requestWithFallback(`ventures/${ventureId}/investor-update`, [`investor/${ventureId}`, `investor-update/history/${ventureId}`]),

  generateInvestorUpdate: (ventureId: string) =>
    requestWithFallback(`ventures/${ventureId}/investor-update`, ["investor/generate", "investor-update/generate"], {
      method: "POST",
      body: JSON.stringify({ ventureId }),
    }),

  updateInvestorUpdate: (ventureId: string, payload: { doc?: any }) =>
    requestWithFallback(`ventures/${ventureId}/investor-update`, [`investor/${ventureId}`, `investor-update/${ventureId}`], {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  generateInvestorUpdateModule: (payload: any) => {
    const opts = { method: "POST", body: JSON.stringify(payload) };
    if (payload.ventureId) {
      return requestWithFallback(`ventures/${payload.ventureId}/investor-update`, ["investor-update/generate", "investor/generate"], opts);
    }
    return requestWithFallback("investor-update/generate", ["investor/generate"], opts);
  },

  getInvestorUpdateHistoryModule: (ventureId: string) =>
    requestWithFallback(`ventures/${ventureId}/investor-update`, [`investor-update/history/${ventureId}`, `investor/${ventureId}`]),

  // FounderOS AI Co-Founder Assistant
  chatWithFounderAIModule: (payload: { ventureId?: string; message: string }) =>
    requestWithFallback("founder-ai/chat", [], {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getFounderAIHistoryModule: (ventureId?: string) =>
    requestWithFallback(`founder-ai/history${ventureId ? `?ventureId=${ventureId}` : ""}`, []),

  // Venture Intelligence Command Center
  analyzeVentureIntelligenceModule: (payload: { ventureId?: string; ventureName?: string }) =>
    requestWithFallback("intelligence-command/analyze", ["intelligence/analyze"], {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getIntelligenceHistoryModule: (ventureId: string) =>
    requestWithFallback(`intelligence-command/${ventureId}`, [`intelligence/${ventureId}`]),
};

export default api;
