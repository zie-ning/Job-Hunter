import { mockDelay, mockStore } from "./mockStore";
import type { ResumeVersion } from "./types";

export interface ResumeAdapter {
  getVersions(): Promise<ResumeVersion[]>;
  getVersion(id: string): Promise<ResumeVersion>;
  saveVersion(content: string, comment: string): Promise<ResumeVersion>;
}

export const mockResumeAdapter: ResumeAdapter = {
  async getVersions() {
    const db = mockStore.getDb();
    return mockDelay(
      [...db.resumeVersions].sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      ),
    );
  },
  async getVersion(id) {
    const db = mockStore.getDb();
    const version = db.resumeVersions.find((v) => v.id === id);
    if (!version) {
      throw new Error("해당 버전을 찾을 수 없습니다.");
    }
    return mockDelay(version);
  },
  async saveVersion(content, comment) {
    const db = mockStore.getDb();
    const newVersion: ResumeVersion = {
      id: `resume-v${db.resumeVersions.length + 1}-${Date.now()}`,
      content,
      comment,
      createdAt: new Date().toISOString(),
    };
    db.resumeVersions.push(newVersion);
    mockStore.setDb(db);
    return mockDelay(newVersion);
  },
};
