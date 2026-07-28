import { mockDelay, mockStore } from "./mockStore";
import type { JdMatch } from "./types";

export interface CreateMatchInput {
  company: string;
  title: string;
  applyUrl: string;
  /** ISO date. 비어있으면 2주 뒤로 기본 설정된다. */
  deadline: string;
  skills: string[];
}

export interface MatchAdapter {
  getMatches(): Promise<JdMatch[]>;
  createMatch(input: CreateMatchInput): Promise<JdMatch>;
}

export const mockMatchAdapter: MatchAdapter = {
  async getMatches() {
    const db = mockStore.getDb();
    return mockDelay(
      [...db.jdMatches].sort((a, b) => b.matchScore - a.matchScore),
    );
  },
  async createMatch(input) {
    const db = mockStore.getDb();
    const newMatch: JdMatch = {
      id: `jd-${Date.now()}`,
      company: input.company,
      title: input.title,
      skills: input.skills,
      matchScore: 0,
      source: "manual",
      deadline:
        input.deadline ||
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      applyUrl: input.applyUrl,
    };
    db.jdMatches.push(newMatch);
    mockStore.setDb(db);
    return mockDelay(newMatch);
  },
};
