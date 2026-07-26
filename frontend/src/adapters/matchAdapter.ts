import { mockDelay, mockStore } from "./mockStore";
import type { JdMatch } from "./types";

export interface MatchAdapter {
  getMatches(): Promise<JdMatch[]>;
}

export const mockMatchAdapter: MatchAdapter = {
  async getMatches() {
    const db = mockStore.getDb();
    return mockDelay(
      [...db.jdMatches].sort((a, b) => b.matchScore - a.matchScore),
    );
  },
};
