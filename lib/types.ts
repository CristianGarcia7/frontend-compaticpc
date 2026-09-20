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
  category: string;
  specifications: string;
  source: string;
};
export type Analysis = {
  id: string;
  equipment: Equipment;
  category: string;
  reference: string;
  specifications: string;
  provider: string;
  model: string;
  feedback: string | null;
  createdAt: string;
  result: {
    verdict: "compatible" | "conditional" | "incompatible";
    summary: string;
    checks: string[];
    risks: string[];
    alternatives: string[];
  };
};
export type Config = {
  geminiConfigured: boolean;
  demoEnabled: boolean;
  model: string;
};
