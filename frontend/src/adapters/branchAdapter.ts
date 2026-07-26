import { mockDelay, mockStore } from "./mockStore";
import type { Branch, GapAnalysisResult } from "./types";

export interface BranchAdapter {
  getBranches(): Promise<Branch[]>;
  getBranch(id: string): Promise<Branch>;
  findBranchByJdMatchId(jdMatchId: string): Promise<Branch | null>;
  createBranch(jdMatchId: string, baseVersionId: string): Promise<Branch>;
  getGapAnalysis(branchId: string): Promise<GapAnalysisResult | null>;
  requestGapAnalysis(branchId: string): Promise<GapAnalysisResult>;
}

export const mockBranchAdapter: BranchAdapter = {
  async getBranches() {
    const db = mockStore.getDb();
    return mockDelay([...db.branches]);
  },
  async getBranch(id) {
    const db = mockStore.getDb();
    const branch = db.branches.find((b) => b.id === id);
    if (!branch) {
      throw new Error("해당 브랜치를 찾을 수 없습니다.");
    }
    return mockDelay(branch);
  },
  async findBranchByJdMatchId(jdMatchId) {
    const db = mockStore.getDb();
    return mockDelay(
      db.branches.find((b) => b.jdMatchId === jdMatchId) ?? null,
    );
  },
  async createBranch(jdMatchId, baseVersionId) {
    const db = mockStore.getDb();
    const baseVersion = db.resumeVersions.find((v) => v.id === baseVersionId);
    if (!baseVersion) {
      throw new Error("선택한 이력서 버전을 찾을 수 없습니다.");
    }
    const newBranch: Branch = {
      id: `branch-${Date.now()}`,
      jdMatchId,
      status: "in_progress",
      baseVersionId,
      versions: [
        {
          id: `${baseVersionId}-branch-start-${Date.now()}`,
          content: baseVersion.content,
          comment: "브랜치 시작",
          createdAt: new Date().toISOString(),
        },
      ],
    };
    db.branches.push(newBranch);
    mockStore.setDb(db);
    return mockDelay(newBranch);
  },
  async getGapAnalysis(branchId) {
    const db = mockStore.getDb();
    return mockDelay(
      db.gapAnalyses.find((g) => g.branchId === branchId) ?? null,
    );
  },
  async requestGapAnalysis(branchId) {
    const db = mockStore.getDb();
    const result: GapAnalysisResult = {
      branchId,
      gaps: [
        "이 JD가 요구하는 핵심 기술스택 중 일부가 이력서에 구체적으로 드러나지 않습니다.",
        "관련 프로젝트의 정량적 성과(지표)가 부족합니다.",
      ],
      feedback:
        "이력서의 프로젝트 경험 섹션에 이 공고가 요구하는 기술스택을 사용한 구체적인 사례와 수치화된 성과를 추가하면 매칭도가 높아집니다.",
      generatedAt: new Date().toISOString(),
    };
    const existingIndex = db.gapAnalyses.findIndex(
      (g) => g.branchId === branchId,
    );
    if (existingIndex >= 0) {
      db.gapAnalyses[existingIndex] = result;
    } else {
      db.gapAnalyses.push(result);
    }
    mockStore.setDb(db);
    return mockDelay(result, 800);
  },
};
