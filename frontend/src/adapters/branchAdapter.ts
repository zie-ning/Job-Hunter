import { mockDelay, mockStore } from "./mockStore";
import type { Branch } from "./types";

export interface BranchAdapter {
  getBranches(): Promise<Branch[]>;
  getBranch(id: string): Promise<Branch>;
  findBranchByJdMatchId(jdMatchId: string): Promise<Branch | null>;
  createBranch(jdMatchId: string, baseVersionId: string): Promise<Branch>;
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
};
