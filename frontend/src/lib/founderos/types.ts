export type PainLevel = "Low" | "Medium" | "High";
export type WouldPay = "Yes" | "Maybe" | "No";
export type TaskStatus = "Not Started" | "In Progress" | "Done";

export interface Interview {
  id: string;
  name: string;
  role: string;
  quote: string;
  pain: PainLevel;
  pay: WouldPay;
  createdAt: string;
}

export interface Brief {
  building: string;
  audience: string;
  problem: string;
  workaround: string;
  outcome: string;
  saved: boolean;
}

export interface Task {
  id: string;
  title: string;
  owner: string;
  status: TaskStatus;
  due: string;
  done: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  tasks: Task[];
}

export interface SprintDay {
  day: number;
  title: string;
  notes: string;
  tasks: { id: string; title: string; done: boolean }[];
}

export interface MvpScope {
  coreProblem: string;
  job: string;
  promise: string;
  outcome: string;
  buildNow: string[];
  later: string[];
  target: string;
}

export interface MarketingPlan {
  idealCustomer: string;
  positioning: string;
  message: string;
  headline: string;
  cta: string;
  channels: string[];
  outreach: string;
  communityPost: string;
  referral: string;
  contentIdeas: string[];
  firstHundred: string;
}

export interface Traction {
  contacted: number;
  interviews: number;
  waitlist: number;
  tried: number;
  active: number;
  paying: number;
  revenue: number;
  history: { date: string; active: number; waitlist: number; revenue: number }[];
}

export interface InvestorUpdate {
  company: string;
  problem: string;
  solution: string;
  customer: string;
  validation: string;
  mvp: string;
  marketing: string;
  traction: string;
  learnings: string;
  nextMilestone: string;
  ask: string;
}

export interface ScorePillar {
  score: number;
  max: number;
  reasoning: string;
}

export type ScoreTier = "Exceptional" | "Promising" | "Early Stage" | "High Risk" | "Unrated";

export interface IdeaScore {
  overallScore: number;
  tier: ScoreTier;
  pillars: {
    problemSeverity: ScorePillar;
    willingnessToPay: ScorePillar;
    distribution: ScorePillar;
    unfairAdvantage: ScorePillar;
    executionSpeed: ScorePillar;
  };
  strengths: string[];
  risks: string[];
  recommendations: string[];
  interviewMultiplier: number;
  lastCalculatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Venture {
  id: string;
  name: string;
  createdAt: string;
  brief: Brief;
  interviews: Interview[];
  summaryNotes: string;
  analyzed: boolean;
  ideaScore?: IdeaScore;
  mvp: MvpScope;
  milestones: Milestone[];
  marketing: MarketingPlan;
  sprint: SprintDay[];
  traction: Traction;
  investor: InvestorUpdate;
  chat: ChatMessage[];
}

export interface FounderUser {
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface UserRecord {
  user: FounderUser;
  ventures: Venture[];
  activeId: string | null;
  lastRoute?: string;
}

export interface AppState {
  user: FounderUser | null;
  ventures: Venture[];
  activeId: string | null;
  saveStatus: "saved" | "saving";
  users: Record<string, UserRecord>;
}