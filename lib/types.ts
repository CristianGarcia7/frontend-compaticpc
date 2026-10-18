import type { Category } from "./categories";
export type User = { id: string; name: string; email: string; role: string };
export type Equipment = {
  id: string;
  brand: string;
  model: string;
  board: string;
  serial: string;
};
export type Component = {
  id: string;
  name: string;
  category: Category | string;
  specifications: string;
  source: string;
  /** Official manufacturer page. Absent on APIs older than the datasheet migration. */
  datasheetUrl?: string | null;
};
export type Verdict = "compatible" | "conditional" | "incompatible";
export type RuleStatus = "pass" | "fail" | "warn" | "unknown";
export type RuleCheck = {
  id: string;
  label: string;
  status: RuleStatus;
  detail: string;
  source?: string | null;
};
export type AnalysisResult = {
  verdict: Verdict;
  summary: string;
  checks: string[];
  risks: string[];
  alternatives: string[];
  /** Deterministic rule checks. Missing on analyses created before the rules engine. */
  rules?: RuleCheck[];
  /** Input that contradicts the catalog or the spec sheet. */
  warnings?: string[];
  /** Present when Gemini failed and the result comes only from the rules engine. */
  fallback?: { reason: string } | null;
};
export type Provider = "gemini" | "demo" | "rules";
export type Analysis = {
  id: string;
  equipment: Equipment;
  category: string;
  reference: string;
  specifications: string;
  provider: Provider | string;
  model: string;
  feedback: string | null;
  feedbackReason?: string | null;
  createdAt: string;
  result: AnalysisResult;
};
export type GeminiHealth = {
  /** "checking": cold start, probe still running; treated like unknown. */
  status: "ok" | "checking" | "unavailable" | "unconfigured";
  checkedAt?: string | null;
  detail?: string | null;
};
export type Config = {
  geminiConfigured: boolean;
  demoEnabled: boolean;
  model: string;
  gemini?: GeminiHealth;
};
export type Stats = { equipment: number; analyses: number; recent: Analysis[] };
