import { mockDelay, mockStore } from "./mockStore";

export interface AuthAdapter {
  isAuthenticated(): boolean;
  login(email: string, password: string): Promise<void>;
  signup(email: string, password: string): Promise<void>;
  logout(): void;
}

function assertValidCredentials(email: string, password: string): void {
  const isValidEmail = /\S+@\S+\.\S+/.test(email);
  if (!isValidEmail || password.length < 4) {
    throw new Error("이메일 형식과 4자 이상 비밀번호를 입력해주세요.");
  }
}

export const mockAuthAdapter: AuthAdapter = {
  isAuthenticated() {
    return mockStore.getDb().isAuthenticated;
  },
  async login(email, password) {
    assertValidCredentials(email, password);
    await mockDelay(undefined);
    const db = mockStore.getDb();
    db.isAuthenticated = true;
    mockStore.setDb(db);
  },
  async signup(email, password) {
    assertValidCredentials(email, password);
    await mockDelay(undefined);
  },
  logout() {
    const db = mockStore.getDb();
    db.isAuthenticated = false;
    mockStore.setDb(db);
  },
};
