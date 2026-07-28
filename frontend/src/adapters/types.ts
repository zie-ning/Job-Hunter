export type BranchStatus = "undecided" | "in_progress" | "applied" | "closed";

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
  source: "wanted" | "worknet" | "manual";
  /** 지원 마감일 (ISO date) */
  deadline: string;
  /** 원본 공고 링크 */
  applyUrl: string;
}

interface BranchCommon {
  id: string;
  status: BranchStatus;
  versions: ResumeVersion[];
  /** 여러 브랜치 중 하나만 선택적으로 기본 브랜치로 지정할 수 있다. */
  isDefault?: boolean;
}

export interface JdBranch extends BranchCommon {
  kind: "jd";
  jdMatchId: string;
}

export interface GeneralBranch extends BranchCommon {
  kind: "general";
  /** 특정 공고에 매이지 않는 범용 브랜치의 이름 (예: "서비스 기업 마스터 이력서") */
  name: string;
}

export type Branch = JdBranch | GeneralBranch;

export interface GapAnalysisResult {
  id: string;
  branchId: string;
  gaps: string[];
  feedback: string;
  generatedAt: string;
}
