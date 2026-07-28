import { mockDelay, mockStore } from "./mockStore";
import type { Branch, BranchStatus, GapAnalysisResult } from "./types";

export interface BranchAdapter {
  getBranches(): Promise<Branch[]>;
  getBranch(id: string): Promise<Branch>;
  findBranchByJdMatchId(jdMatchId: string): Promise<Branch | null>;
  getDefaultBranch(): Promise<Branch | null>;
  createJdBranch(jdMatchId: string, initialContent: string): Promise<Branch>;
  createGeneralBranch(
    name: string,
    initialContent: string,
    isDefault: boolean,
  ): Promise<Branch>;
  addVersion(
    branchId: string,
    content: string,
    comment: string,
  ): Promise<Branch>;
  setDefaultBranch(branchId: string, isDefault: boolean): Promise<Branch>;
  updateStatus(branchId: string, status: BranchStatus): Promise<Branch>;
  /** 해당 브랜치의 갭분석·첨삭 피드백 내역 전체 (최신순) */
  getGapAnalysisHistory(branchId: string): Promise<GapAnalysisResult[]>;
  /** 새 갭분석·첨삭 피드백 쌍을 생성해 내역에 추가한다. */
  requestGapAnalysis(branchId: string): Promise<GapAnalysisResult>;
}

function getBranchOrThrow(
  db: ReturnType<typeof mockStore.getDb>,
  id: string,
): Branch {
  const branch = db.branches.find((b) => b.id === id);
  if (!branch) {
    throw new Error("해당 브랜치를 찾을 수 없습니다.");
  }
  return branch;
}

export const mockBranchAdapter: BranchAdapter = {
  async getBranches() {
    const db = mockStore.getDb();
    return mockDelay([...db.branches]);
  },
  async getBranch(id) {
    const db = mockStore.getDb();
    return mockDelay(getBranchOrThrow(db, id));
  },
  async findBranchByJdMatchId(jdMatchId) {
    const db = mockStore.getDb();
    return mockDelay(
      db.branches.find((b) => b.kind === "jd" && b.jdMatchId === jdMatchId) ??
        null,
    );
  },
  async getDefaultBranch() {
    const db = mockStore.getDb();
    return mockDelay(db.branches.find((b) => b.isDefault) ?? null);
  },
  async createJdBranch(jdMatchId, initialContent) {
    const db = mockStore.getDb();
    const newBranch: Branch = {
      id: `branch-${Date.now()}`,
      kind: "jd",
      jdMatchId,
      status: "undecided",
      versions: [
        {
          id: `version-${Date.now()}`,
          content: initialContent,
          comment: "브랜치 시작",
          createdAt: new Date().toISOString(),
        },
      ],
    };
    db.branches.push(newBranch);
    mockStore.setDb(db);
    return mockDelay(newBranch);
  },
  async createGeneralBranch(name, initialContent, isDefault) {
    const db = mockStore.getDb();
    if (isDefault) {
      db.branches.forEach((b) => {
        b.isDefault = false;
      });
    }
    const newBranch: Branch = {
      id: `branch-${Date.now()}`,
      kind: "general",
      name,
      status: "in_progress",
      isDefault,
      versions: [
        {
          id: `version-${Date.now()}`,
          content: initialContent,
          comment: "브랜치 시작",
          createdAt: new Date().toISOString(),
        },
      ],
    };
    db.branches.push(newBranch);
    mockStore.setDb(db);
    return mockDelay(newBranch);
  },
  async addVersion(branchId, content, comment) {
    const db = mockStore.getDb();
    const branch = getBranchOrThrow(db, branchId);
    branch.versions.push({
      id: `version-${Date.now()}`,
      content,
      comment,
      createdAt: new Date().toISOString(),
    });
    mockStore.setDb(db);
    return mockDelay(branch);
  },
  async setDefaultBranch(branchId, isDefault) {
    const db = mockStore.getDb();
    const branch = getBranchOrThrow(db, branchId);
    if (isDefault) {
      db.branches.forEach((b) => {
        b.isDefault = false;
      });
    }
    branch.isDefault = isDefault;
    mockStore.setDb(db);
    return mockDelay(branch);
  },
  async updateStatus(branchId, status) {
    const db = mockStore.getDb();
    const branch = getBranchOrThrow(db, branchId);
    branch.status = status;
    mockStore.setDb(db);
    return mockDelay(branch);
  },
  async getGapAnalysisHistory(branchId) {
    const db = mockStore.getDb();
    return mockDelay(
      db.gapAnalyses
        .filter((g) => g.branchId === branchId)
        .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt)),
    );
  },
  async requestGapAnalysis(branchId) {
    const db = mockStore.getDb();
    const result: GapAnalysisResult = {
      id: `gap-${branchId}-${Date.now()}`,
      branchId,
      gaps: [
        "이 JD가 요구하는 핵심 기술스택 중 일부가 이력서에 구체적으로 드러나지 않습니다.",
        "관련 프로젝트의 정량적 성과(지표)가 부족합니다.",
      ],
      feedback:
        "이력서의 프로젝트 경험 섹션에 이 공고가 요구하는 기술스택을 사용한 구체적인 사례와 수치화된 성과를 추가하면 매칭도가 높아집니다.",
      generatedAt: new Date().toISOString(),
    };
    db.gapAnalyses.push(result);
    mockStore.setDb(db);
    return mockDelay(result, 800);
  },
};
