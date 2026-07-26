export type BranchStatus = "in_progress" | "applied" | "closed";

export interface ResumeVersion {
  id: string;
  content: string;
  comment: string;
  createdAt: string;
}

export interface JdMatch {
  id: string;
  company: string;
  title: string;
  skills: string[];
  matchScore: number;
  source: "wanted" | "worknet";
}

export interface Branch {
  id: string;
  jdMatchId: string;
  status: BranchStatus;
  baseVersionId: string;
  versions: ResumeVersion[];
}

export interface GapAnalysisResult {
  branchId: string;
  gaps: string[];
  feedback: string;
  generatedAt: string;
}
