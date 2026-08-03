/**
 * FounderOS API Client & Backend Connection Service
 */

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  "https://founder-os-backend-hhwl.onrender.com/api";

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

async function request<T = any>(
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

  const url = `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

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
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Network error. Backend server is unreachable.",
    };
  }
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
    request(`mvp/${ventureId}`),

  generateMvpScope: (ventureId: string) =>
    request("mvp/generate", {
      method: "POST",
      body: JSON.stringify({ ventureId }),
    }),

  updateMvpScope: (ventureId: string, payload: { coreGoal?: string; features?: any[] }) =>
    request(`mvp/${ventureId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  generateMvpScopeModule: (payload: { ventureId?: string; ventureName?: string; idea?: string; targetUsers?: string; problem?: string }) =>
    request("mvp-scope/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMvpScopeHistory: (ventureId: string) =>
    request(`mvp-scope/${ventureId}`),

  // AI Build Roadmap Engine
  getRoadmap: (ventureId: string) =>
    request(`roadmap/${ventureId}`),

  generateRoadmap: (ventureId: string) =>
    request("roadmap/generate", {
      method: "POST",
      body: JSON.stringify({ ventureId }),
    }),

  updateRoadmap: (ventureId: string, payload: { phases?: any[] }) =>
    request(`roadmap/${ventureId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  generateBuildRoadmapModule: (payload: { ventureId?: string; ventureName?: string; startupIdea?: string; mvpScope?: string; users?: string; stack?: string }) =>
    request("build-roadmap/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getBuildRoadmapHistory: (ventureId: string) =>
    request(`build-roadmap/${ventureId}`),

  // AI Marketing Plan Engine
  getMarketingPlan: (ventureId: string) =>
    request(`marketing/${ventureId}`),

  generateMarketingPlan: (ventureId: string) =>
    request("marketing/generate", {
      method: "POST",
      body: JSON.stringify({ ventureId }),
    }),

  updateMarketingPlan: (ventureId: string, payload: any) =>
    request(`marketing/${ventureId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  generateMarketingPlanModule: (payload: { ventureId?: string; ventureName?: string; startupIdea?: string; mvpScope?: string; audience?: string; industry?: string; pricing?: string; goal?: string }) =>
    request("marketing-plan/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMarketingPlanHistory: (ventureId: string) =>
    request(`marketing-plan/${ventureId}`),

  // AI Launch Sprint Engine
  getLaunchSprint: (ventureId: string) =>
    request(`launch/${ventureId}`),

  generateLaunchSprint: (ventureId: string) =>
    request("launch/generate", {
      method: "POST",
      body: JSON.stringify({ ventureId }),
    }),

  updateLaunchSprint: (ventureId: string, payload: { checklist?: any[]; copyData?: any }) =>
    request(`launch/${ventureId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  generateLaunchSprintModule: (payload: { ventureId?: string; ventureName?: string; idea?: string; mvpScope?: string; marketingPlan?: string; launchDate?: string; launchGoal?: string; targetAudience?: string }) =>
    request("launch-sprint/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getLaunchSprintHistory: (ventureId: string) =>
    request(`launch-sprint/${ventureId}`),

  // AI Traction Dashboard Engine
  getTractionData: (ventureId: string) =>
    request(`traction/${ventureId}`),

  generateTractionData: (ventureId: string) =>
    request("traction/generate", {
      method: "POST",
      body: JSON.stringify({ ventureId }),
    }),

  updateTractionData: (ventureId: string, payload: any) =>
    request(`traction/${ventureId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  analyzeTractionModule: (payload: any) =>
    request("traction-analyzer/analyze", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getTractionHistoryModule: (ventureId: string) =>
    request(`traction-analyzer/history/${ventureId}`),

  // AI Investor Update Engine
  getInvestorUpdate: (ventureId: string) =>
    request(`investor/${ventureId}`),

  generateInvestorUpdate: (ventureId: string) =>
    request("investor/generate", {
      method: "POST",
      body: JSON.stringify({ ventureId }),
    }),

  updateInvestorUpdate: (ventureId: string, payload: { doc?: any }) =>
    request(`investor/${ventureId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  generateInvestorUpdateModule: (payload: any) =>
    request("investor-update/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getInvestorUpdateHistoryModule: (ventureId: string) =>
    request(`investor-update/history/${ventureId}`),

  // FounderOS AI Co-Founder Assistant
  chatWithFounderAIModule: (payload: { ventureId?: string; message: string }) =>
    request("founder-ai/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getFounderAIHistoryModule: (ventureId?: string) =>
    request(`founder-ai/history${ventureId ? `?ventureId=${ventureId}` : ""}`),

  // Venture Intelligence Command Center
  analyzeVentureIntelligenceModule: (payload: { ventureId?: string; ventureName?: string }) =>
    request("intelligence-command/analyze", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getIntelligenceHistoryModule: (ventureId: string) =>
    request(`intelligence-command/${ventureId}`),
};

export default api;
