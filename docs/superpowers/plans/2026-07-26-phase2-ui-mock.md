# Phase 2: UI/UX 틀 잡기 (mock 데이터) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `frontend/`에 로그인 → 이력서 관리 → JD 매칭 → 브랜치 → 갭분석/첨삭까지 전체 플로우를 mock 데이터(localStorage)로 클릭 시연할 수 있는 화면 틀을 만든다.

**Architecture:** 화면 컴포넌트는 `adapters/`가 export하는 인터페이스 타입에만 의존한다. `mockXxxAdapter`가 `mockStore.ts`(localStorage 래퍼)를 읽고 쓰며, 이후 Phase에서 이 구현체만 실제 `fetch` 기반으로 교체하면 화면 코드는 변경 없이 재사용된다. 라우팅은 `react-router-dom`, 상단 가로 네비게이션을 가진 `AppLayout`이 보호 라우트를 감싼다.

**Tech Stack:** React 19 + Vite + TypeScript, react-router-dom v7, 플레인 CSS(CSS 커스텀 프로퍼티). 새 의존성 추가 없음.

## Global Constraints

- 스펙 문서: [docs/superpowers/specs/2026-07-26-phase2-ui-mock-design.md](../specs/2026-07-26-phase2-ui-mock-design.md) — 모든 작업은 이 문서와 일치해야 한다.
- 이 Phase는 자동화 테스트 대신 수동 브라우저 시연으로 검증한다(스펙의 "에러 처리 & 검증" 절에서 승인된 결정). 프로젝트에 테스트 러너가 설치되어 있지 않으므로 각 작업의 "테스트" 단계는 `npm run build`(tsc 타입체크 포함) 통과 + 개발 서버에서 브라우저로 실제 클릭 확인으로 구성한다.
- 각 작업 마무리 시점에 [.claude/CLAUDE.md](../../../.claude/CLAUDE.md) 체크리스트대로 `npm run lint`, `npm run format:check`, `npm run build`를 실행하고, 실패 시 `npm run lint -- --fix`(가능한 경우) / `npm run format`으로 자동 수정 후 재검증한다.
- 포인트 컬러는 `#7F77DD`(라이트) / `#AFA9EC`(다크)로 확정됨. 임의로 다른 색을 쓰지 않는다.
- 새 npm 의존성을 추가하지 않는다(Tailwind, 상태관리 라이브러리, 테스트 러너 등 도입 금지 — YAGNI).
- 커밋 메시지는 [.claude/rules/commit.md](../../../.claude/rules/commit.md) 형식(`<타입>: <설명>`, 본문은 `-` bullet)을 따른다.

---

## Task 1: 도메인 타입 + mockStore(localStorage 헬퍼 + 시드 데이터)

**Files:**
- Create: `frontend/src/adapters/types.ts`
- Create: `frontend/src/adapters/mockStore.ts`

**Interfaces:**
- Produces: `ResumeVersion`, `JdMatch`, `Branch`, `BranchStatus`, `GapAnalysisResult` 타입(`types.ts`). `mockStore.getDb(): MockDb`, `mockStore.setDb(db: MockDb): void`, `mockDelay<T>(value: T, ms?: number): Promise<T>` (`mockStore.ts`). 이후 모든 어댑터 작업(Task 4, 5, 7, 8)이 이 함수들을 사용한다.

- [ ] **Step 1: `types.ts` 작성**

```ts
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
```

- [ ] **Step 2: `mockStore.ts` 작성**

```ts
import type { Branch, GapAnalysisResult, JdMatch, ResumeVersion } from "./types";

interface MockDb {
  isAuthenticated: boolean;
  resumeVersions: ResumeVersion[];
  jdMatches: JdMatch[];
  branches: Branch[];
  gapAnalyses: GapAnalysisResult[];
}

const STORAGE_KEY = "job-hunting-assistant:mock-db";

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function seedDb(): MockDb {
  const resumeVersions: ResumeVersion[] = [
    {
      id: "resume-v1",
      content:
        "백엔드 개발자 이력서\n\n- Python/FastAPI 3년\n- PostgreSQL 실무 경험",
      comment: "초기 업로드",
      createdAt: daysAgo(10),
    },
    {
      id: "resume-v2",
      content:
        "백엔드 개발자 이력서\n\n- Python/FastAPI 3년, pgvector 기반 벡터 검색 프로젝트 경험 추가\n- PostgreSQL 실무 경험",
      comment: "프로젝트 경험 보강",
      createdAt: daysAgo(5),
    },
  ];

  const jdMatches: JdMatch[] = [
    {
      id: "jd-1",
      company: "원티드랩",
      title: "백엔드 엔지니어",
      skills: ["Python", "FastAPI", "PostgreSQL"],
      matchScore: 92,
      source: "wanted",
    },
    {
      id: "jd-2",
      company: "토스",
      title: "서버 개발자",
      skills: ["Kotlin", "Spring", "MySQL"],
      matchScore: 74,
      source: "wanted",
    },
    {
      id: "jd-3",
      company: "당근마켓",
      title: "백엔드 개발자",
      skills: ["Python", "Django", "Redis"],
      matchScore: 81,
      source: "worknet",
    },
    {
      id: "jd-4",
      company: "카카오엔터프라이즈",
      title: "데이터 엔지니어",
      skills: ["Python", "Airflow", "Spark"],
      matchScore: 63,
      source: "worknet",
    },
  ];

  const branches: Branch[] = [
    {
      id: "branch-1",
      jdMatchId: "jd-1",
      status: "in_progress",
      baseVersionId: "resume-v1",
      versions: [
        {
          id: "branch-1-v1",
          content: resumeVersions[0].content,
          comment: "브랜치 시작",
          createdAt: daysAgo(4),
        },
        {
          id: "branch-1-v2",
          content:
            resumeVersions[1].content +
            "\n- 원티드랩 JD의 pgvector 요구사항에 맞춰 프로젝트 설명 구체화",
          comment: "JD 요구 기술스택 강조",
          createdAt: daysAgo(1),
        },
      ],
    },
    {
      id: "branch-2",
      jdMatchId: "jd-3",
      status: "applied",
      baseVersionId: "resume-v2",
      versions: [
        {
          id: "branch-2-v1",
          content: resumeVersions[1].content,
          comment: "브랜치 시작",
          createdAt: daysAgo(7),
        },
      ],
    },
  ];

  const gapAnalyses: GapAnalysisResult[] = [
    {
      branchId: "branch-1",
      gaps: [
        "pgvector 등 벡터 검색 실무 경험 명시 부족",
        "대용량 트래픽 처리 경험 미기재",
      ],
      feedback:
        "원티드랩 공고는 pgvector 기반 유사도 검색 경험을 우대사항으로 명시하고 있습니다. 최근 프로젝트에서 임베딩 생성과 코사인 유사도 쿼리를 직접 구현한 경험을 정량적 지표(응답시간, 처리량)와 함께 기술하면 매칭도가 높아집니다.",
      generatedAt: daysAgo(0.5),
    },
  ];

  return {
    isAuthenticated: false,
    resumeVersions,
    jdMatches,
    branches,
    gapAnalyses,
  };
}

function readDb(): MockDb {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedDb();
    writeDb(seeded);
    return seeded;
  }
  return JSON.parse(raw) as MockDb;
}

function writeDb(db: MockDb): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export const mockStore = {
  getDb: readDb,
  setDb: writeDb,
};

export function mockDelay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
```

- [ ] **Step 3: 타입체크 확인**

Run: `cd frontend && npm run build`
Expected: 에러 없이 성공(아직 아무 컴포넌트도 이 파일들을 참조하지 않으므로 미사용 경고는 없음).

- [ ] **Step 4: lint/format 확인**

Run: `cd frontend && npm run lint && npm run format:check`
Expected: 통과. 실패 시 `npm run format`으로 자동 수정 후 재확인.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/adapters/types.ts frontend/src/adapters/mockStore.ts
git commit -m "$(cat <<'EOF'
feat: 이력서/JD/브랜치 도메인 타입과 mock 스토어 추가

- localStorage 기반 mock DB 읽기/쓰기 헬퍼(mockStore)와 시드 데이터 정의
- 이후 어댑터들이 공통으로 사용할 도메인 타입(ResumeVersion, JdMatch, Branch, GapAnalysisResult) 정의
EOF
)"
```

---

## Task 2: 디자인 토큰 확장 + 디자인 시스템 컴포넌트 라이브러리

**Files:**
- Modify: `frontend/src/index.css`
- Create: `frontend/src/components/components.css`
- Create: `frontend/src/components/Button.tsx`
- Create: `frontend/src/components/TextField.tsx`
- Create: `frontend/src/components/Textarea.tsx`
- Create: `frontend/src/components/Card.tsx`
- Create: `frontend/src/components/Badge.tsx`
- Create: `frontend/src/components/EmptyState.tsx`
- Create: `frontend/src/components/ScoreDelta.tsx`
- Create: `frontend/src/components/DiffView.tsx`

**Interfaces:**
- Consumes: 없음(순수 프레젠테이션 컴포넌트, 도메인 타입에 의존하지 않음).
- Produces: `Button`, `TextField`, `Textarea`, `Card`, `Badge`(`tone: "positive" | "warning" | "danger" | "neutral"`), `EmptyState`, `ScoreDelta`(`before: number, after: number`), `DiffView`(`oldText: string, newText: string`). Task 3의 `AppLayout`/`Header`와 이후 모든 라우트 작업이 이 컴포넌트들을 사용한다.

- [ ] **Step 1: `index.css`의 액센트 토큰 교체 + 시맨틱 토큰 추가**

`frontend/src/index.css`의 `:root` 블록에서 `--accent`, `--accent-bg`, `--accent-border` 값을 교체하고 시맨틱 토큰을 추가한다:

```css
  --accent: #7f77dd;
  --accent-bg: rgba(127, 119, 221, 0.12);
  --accent-border: rgba(127, 119, 221, 0.5);
  --surface: #f9f9fb;
  --positive: #0f6e56;
  --positive-bg: rgba(15, 110, 86, 0.1);
  --warning: #854f0b;
  --warning-bg: rgba(133, 79, 11, 0.1);
  --danger: #a32d2d;
  --danger-bg: rgba(163, 45, 45, 0.1);
  --neutral-muted: #888780;
```

다크 모드 블록(`@media (prefers-color-scheme: dark)` 안의 `:root`)에는 다음을 추가한다:

```css
    --accent: #afa9ec;
    --accent-bg: rgba(175, 169, 236, 0.18);
    --accent-border: rgba(175, 169, 236, 0.5);
    --surface: #1c1d24;
    --positive: #5dcaa5;
    --positive-bg: rgba(93, 202, 165, 0.15);
    --warning: #fac775;
    --warning-bg: rgba(250, 199, 117, 0.15);
    --danger: #f09595;
    --danger-bg: rgba(240, 149, 149, 0.15);
    --neutral-muted: #888780;
```

- [ ] **Step 2: `components.css` 작성**

```css
.btn {
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  padding: 10px 18px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    opacity 0.15s;
}
.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.btn-primary {
  background: var(--accent);
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
  border-color: var(--accent-border);
}
.btn-secondary {
  background: transparent;
  border-color: var(--border);
  color: var(--text-h);
}
.btn-secondary:hover:not(:disabled) {
  border-color: var(--accent-border);
}
.btn-ghost {
  background: transparent;
  color: var(--text);
}
.btn-ghost:hover:not(:disabled) {
  background: var(--accent-bg);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}
.field label {
  font-size: 13px;
  color: var(--text);
}
.field input,
.field textarea {
  font: inherit;
  font-size: 15px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-h);
}
.field input:focus-visible,
.field textarea:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}
.field textarea {
  resize: vertical;
  min-height: 160px;
  font-family: var(--mono);
  font-size: 14px;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  text-align: left;
}

.badge {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 999px;
}
.badge-positive {
  background: var(--positive-bg);
  color: var(--positive);
}
.badge-warning {
  background: var(--warning-bg);
  color: var(--warning);
}
.badge-danger {
  background: var(--danger-bg);
  color: var(--danger);
}
.badge-neutral {
  background: var(--code-bg);
  color: var(--neutral-muted);
}

.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: var(--text);
}
.empty-state h3 {
  font-size: 18px;
  color: var(--text-h);
  margin: 0 0 8px;
}

.score-delta {
  font-weight: 500;
  font-size: 14px;
}
.score-delta-up {
  color: var(--positive);
}
.score-delta-down {
  color: var(--danger);
}
.score-delta-flat {
  color: var(--neutral-muted);
}

.diff-view {
  font-family: var(--mono);
  font-size: 13px;
  line-height: 160%;
  text-align: left;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.diff-line {
  padding: 2px 12px;
  white-space: pre-wrap;
}
.diff-line-added {
  background: var(--positive-bg);
  color: var(--positive);
}
.diff-line-removed {
  background: var(--danger-bg);
  color: var(--danger);
}
```

- [ ] **Step 3: `Button.tsx` 작성**

```tsx
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  isLoading = false,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  const classes = ["btn", `btn-${variant}`, className].filter(Boolean).join(" ");
  return (
    <button className={classes} disabled={disabled || isLoading} {...rest}>
      {isLoading ? "처리 중..." : children}
    </button>
  );
}
```

- [ ] **Step 4: `TextField.tsx`, `Textarea.tsx` 작성**

`frontend/src/components/TextField.tsx`:

```tsx
import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function TextField({ label, id, ...rest }: TextFieldProps) {
  const inputId = id ?? label;
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} {...rest} />
    </div>
  );
}
```

`frontend/src/components/Textarea.tsx`:

```tsx
import type { TextareaHTMLAttributes } from "react";

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function Textarea({ label, id, ...rest }: TextareaFieldProps) {
  const inputId = id ?? label;
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <textarea id={inputId} {...rest} />
    </div>
  );
}
```

- [ ] **Step 5: `Card.tsx`, `Badge.tsx`, `EmptyState.tsx` 작성**

`frontend/src/components/Card.tsx`:

```tsx
import type { HTMLAttributes } from "react";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={["card", className].filter(Boolean).join(" ")} {...rest} />;
}
```

`frontend/src/components/Badge.tsx`:

```tsx
interface BadgeProps {
  tone: "positive" | "warning" | "danger" | "neutral";
  children: React.ReactNode;
}

export function Badge({ tone, children }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
```

`frontend/src/components/EmptyState.tsx`:

```tsx
interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
```

- [ ] **Step 6: `ScoreDelta.tsx`, `DiffView.tsx` 작성**

`frontend/src/components/ScoreDelta.tsx`:

```tsx
interface ScoreDeltaProps {
  before: number;
  after: number;
}

export function ScoreDelta({ before, after }: ScoreDeltaProps) {
  const delta = after - before;
  const direction = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const sign = delta > 0 ? "+" : "";
  return (
    <span className={`score-delta score-delta-${direction}`}>
      {sign}
      {delta.toFixed(1)}%p
    </span>
  );
}
```

`frontend/src/components/DiffView.tsx`은 라인 단위 최장공통부분수열(LCS) 기반 diff를 순수 함수로 구현한다:

```tsx
interface DiffViewProps {
  oldText: string;
  newText: string;
}

type DiffLine = { text: string; type: "added" | "removed" | "unchanged" };

function computeLineDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const m = oldLines.length;
  const n = newLines.length;

  const lcs: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      lcs[i][j] =
        oldLines[i] === newLines[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (oldLines[i] === newLines[j]) {
      result.push({ text: oldLines[i], type: "unchanged" });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      result.push({ text: oldLines[i], type: "removed" });
      i++;
    } else {
      result.push({ text: newLines[j], type: "added" });
      j++;
    }
  }
  while (i < m) {
    result.push({ text: oldLines[i], type: "removed" });
    i++;
  }
  while (j < n) {
    result.push({ text: newLines[j], type: "added" });
    j++;
  }
  return result;
}

export function DiffView({ oldText, newText }: DiffViewProps) {
  const lines = computeLineDiff(oldText, newText);
  return (
    <div className="diff-view">
      {lines.map((line, index) => (
        <div
          key={index}
          className={
            line.type === "unchanged" ? "diff-line" : `diff-line diff-line-${line.type}`
          }
        >
          {line.type === "added" ? "+ " : line.type === "removed" ? "- " : "  "}
          {line.text}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: `main.tsx`에 `components.css` import 추가**

`frontend/src/main.tsx`의 import 목록에 다음 줄을 `index.css` 다음에 추가한다:

```ts
import "./components/components.css";
```

- [ ] **Step 8: 빌드 확인**

Run: `cd frontend && npm run build`
Expected: 통과. (이 시점엔 아직 App.tsx가 새 컴포넌트를 쓰지 않으므로 미사용 관련 오류는 없음 — 각 컴포넌트 파일 자체의 타입 오류만 잡힌다.)

- [ ] **Step 9: lint/format 확인**

Run: `cd frontend && npm run lint && npm run format:check`
Expected: 통과. 실패 시 자동 수정 후 재확인.

- [ ] **Step 10: Commit**

```bash
git add frontend/src/index.css frontend/src/main.tsx frontend/src/components
git commit -m "$(cat <<'EOF'
feat: 디자인 토큰 확장 및 기초 디자인 시스템 컴포넌트 추가

- 포인트 컬러를 비비드 바이올렛(#7F77DD/#AFA9EC)으로 교체하고 시맨틱 컬러 토큰 추가
- Button/TextField/Textarea/Card/Badge/EmptyState/ScoreDelta/DiffView 컴포넌트 구현
EOF
)"
```

---

## Task 3: 라우팅/레이아웃 구조 (인증 컨텍스트 + AppLayout + 라우터)

**Files:**
- Create: `frontend/src/adapters/authAdapter.ts`
- Create: `frontend/src/context/AuthContext.tsx`
- Create: `frontend/src/layout/AppLayout.tsx`
- Create: `frontend/src/components/Header.tsx`
- Modify: `frontend/src/App.tsx` (전체 재작성)
- Modify: `frontend/src/main.tsx` (`BrowserRouter`, `AuthProvider` 래핑)
- Delete: `frontend/src/App.css`
- Delete: `frontend/src/assets/react.svg`, `frontend/src/assets/vite.svg`, `frontend/src/assets/hero.png`

**Interfaces:**
- Consumes: `mockStore`, `mockDelay`(Task 1), `Button`(Task 2).
- Produces: `AuthAdapter` 인터페이스와 `mockAuthAdapter` 구현체(`isAuthenticated(): boolean`, `login(email, password): Promise<void>`, `signup(email, password): Promise<void>`, `logout(): void`). `useAuth(): { isAuthenticated: boolean; login; logout }` 훅.이후 Task 4(로그인 화면)가 이 훅과 `mockAuthAdapter.signup`을 사용하고, Task 5~10의 모든 라우트가 `AppLayout`으로 감싸진다.

- [ ] **Step 1: `authAdapter.ts` 작성**

```ts
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
```

- [ ] **Step 2: `AuthContext.tsx` 작성**

```tsx
import { createContext, useContext, useState, type ReactNode } from "react";
import { mockAuthAdapter } from "../adapters/authAdapter";

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(mockAuthAdapter.isAuthenticated());

  async function login(email: string, password: string) {
    await mockAuthAdapter.login(email, password);
    setIsAuthenticated(true);
  }

  function logout() {
    mockAuthAdapter.logout();
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}
```

- [ ] **Step 3: `Header.tsx` 작성**

```tsx
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./Button";

const NAV_ITEMS = [
  { to: "/resumes", label: "이력서 관리" },
  { to: "/matches", label: "JD 매칭" },
  { to: "/branches", label: "브랜치" },
];

export function Header() {
  const { logout } = useAuth();
  return (
    <header className="app-header">
      <span className="app-header-logo">채용지원 어시스턴트</span>
      <nav className="app-header-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? "app-header-link active" : "app-header-link")}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <Button variant="ghost" onClick={logout}>
        로그아웃
      </Button>
    </header>
  );
}
```

`components.css`(Task 2 파일)에 헤더 스타일을 추가한다:

```css
.app-header {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
}
.app-header-logo {
  font-weight: 500;
  color: var(--text-h);
}
.app-header-nav {
  display: flex;
  gap: 20px;
  flex: 1;
}
.app-header-link {
  color: var(--text);
  text-decoration: none;
  font-size: 15px;
  padding: 6px 0;
  border-bottom: 2px solid transparent;
}
.app-header-link.active {
  color: var(--text-h);
  border-bottom-color: var(--accent);
}
```

- [ ] **Step 4: `AppLayout.tsx` 작성**

```tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Header } from "../components/Header";

export function AppLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
```

`components.css`에 레이아웃 스타일을 추가한다:

```css
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100svh;
}
.app-main {
  flex: 1;
  padding: 32px 24px;
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}
```

- [ ] **Step 5: `App.tsx` 재작성 (임시 placeholder 라우트 포함)**

이 단계에서는 아직 실제 화면(Task 4~10)이 없으므로, 각 보호 라우트에 `Card` + `EmptyState`로 구성된 placeholder를 배치해 라우팅/레이아웃을 눈으로 확인할 수 있게 한다. 이후 Task들이 해당 placeholder를 실제 화면으로 교체한다.

```tsx
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { Card } from "./components/Card";
import { EmptyState } from "./components/EmptyState";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <Card>
      <EmptyState title={title} description="이 화면은 다음 작업에서 구현됩니다." />
    </Card>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<PlaceholderPage title="로그인" />} />
      <Route path="/signup" element={<PlaceholderPage title="회원가입" />} />
      <Route element={<AppLayout />}>
        <Route path="/resumes" element={<PlaceholderPage title="이력서 관리" />} />
        <Route
          path="/resumes/versions/:id"
          element={<PlaceholderPage title="버전 상세" />}
        />
        <Route path="/matches" element={<PlaceholderPage title="JD 매칭" />} />
        <Route path="/branches" element={<PlaceholderPage title="브랜치 목록" />} />
        <Route path="/branches/:id" element={<PlaceholderPage title="브랜치 상세" />} />
        <Route index element={<Navigate to="/matches" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/matches" replace />} />
    </Routes>
  );
}

export default App;
```

- [ ] **Step 6: `main.tsx`에 `BrowserRouter` + `AuthProvider` 래핑**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./components/components.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
```

- [ ] **Step 7: 사용하지 않게 된 데모 파일 삭제**

```bash
cd frontend
rm src/App.css src/assets/react.svg src/assets/vite.svg src/assets/hero.png
```

- [ ] **Step 8: 빌드 확인**

Run: `cd frontend && npm run build`
Expected: 통과.

- [ ] **Step 9: 브라우저 확인**

Run: `cd frontend && npm run dev`

브라우저에서 `http://localhost:5173`으로 접속해:
1. 미로그인 상태이므로 `/login` placeholder로 리다이렉트되는지 확인
2. 주소창에 `http://localhost:5173/matches`를 직접 입력해도 `/login`으로 리다이렉트되는지 확인 (보호 라우트 가드 동작 확인)

dev 서버는 다음 작업에서도 계속 사용하므로 이 단계에서 종료하지 않아도 된다.

- [ ] **Step 10: lint/format 확인**

Run: `cd frontend && npm run lint && npm run format:check`
Expected: 통과. 실패 시 자동 수정 후 재확인.

- [ ] **Step 11: Commit**

```bash
git add -A frontend/src
git commit -m "$(cat <<'EOF'
feat: 인증 컨텍스트와 보호 라우트를 가진 앱 레이아웃 구성

- mock authAdapter + AuthContext로 로그인 상태 관리
- 상단 가로 네비게이션(Header)을 가진 AppLayout으로 보호 라우트 구성
- Vite 기본 데모 화면/에셋 제거, 라우트 placeholder로 대체
EOF
)"
```

---

## Task 4: 로그인/회원가입 화면

**Files:**
- Create: `frontend/src/routes/LoginPage.tsx`
- Create: `frontend/src/routes/SignupPage.tsx`
- Modify: `frontend/src/App.tsx` (`/login`, `/signup` placeholder를 실제 화면으로 교체)

**Interfaces:**
- Consumes: `useAuth()`(Task 3), `mockAuthAdapter.signup`(Task 3), `TextField`, `Button`, `Card`(Task 2).
- Produces: 없음(터미널 화면).

- [ ] **Step 1: `LoginPage.tsx` 작성**

```tsx
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/Card";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/matches");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <Card>
        <h1>로그인</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <TextField
            label="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
          />
          <TextField
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="auth-error">{error}</p>}
          <Button type="submit" isLoading={isSubmitting}>
            로그인
          </Button>
        </form>
        <p className="auth-switch">
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: `SignupPage.tsx` 작성**

```tsx
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mockAuthAdapter } from "../adapters/authAdapter";
import { Card } from "../components/Card";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";

export function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await mockAuthAdapter.signup(email, password);
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <Card>
        <h1>회원가입</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <TextField
            label="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
          />
          <TextField
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="auth-error">{error}</p>}
          <Button type="submit" isLoading={isSubmitting}>
            회원가입
          </Button>
        </form>
        <p className="auth-switch">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </Card>
    </div>
  );
}
```

`components.css`에 인증 화면 스타일을 추가한다:

```css
.auth-page {
  display: flex;
  justify-content: center;
  padding: 64px 20px;
}
.auth-page .card {
  width: 360px;
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}
.auth-error {
  color: var(--danger);
  font-size: 13px;
  margin: 0;
}
.auth-switch {
  margin-top: 16px;
  font-size: 14px;
  text-align: center;
}
```

- [ ] **Step 3: `App.tsx`에서 `/login`, `/signup` placeholder 교체**

```tsx
import { LoginPage } from "./routes/LoginPage";
import { SignupPage } from "./routes/SignupPage";
```

`<Route path="/login" element={<PlaceholderPage title="로그인" />} />`를 `<Route path="/login" element={<LoginPage />} />`로, `/signup`도 동일하게 `<SignupPage />`로 교체한다.

- [ ] **Step 4: 빌드 확인**

Run: `cd frontend && npm run build`
Expected: 통과.

- [ ] **Step 5: 브라우저 확인**

`npm run dev`가 실행 중인 상태에서:
1. `/login`에서 임의의 이메일/비밀번호(예: `test@example.com` / `1234`)로 로그인 → `/matches` placeholder로 이동하는지 확인
2. 로그아웃 버튼 클릭 → `/login`으로 돌아가는지 확인
3. `/signup`에서 회원가입 → `/login`으로 이동하는지 확인
4. 형식에 맞지 않는 이메일(예: `abc`) 입력 시 에러 메시지가 표시되는지 확인

- [ ] **Step 6: lint/format 확인**

Run: `cd frontend && npm run lint && npm run format:check`

- [ ] **Step 7: Commit**

```bash
git add frontend/src
git commit -m "$(cat <<'EOF'
feat: mock 로그인/회원가입 화면 추가

- 입력값 형식 검증 후 제출 시 무조건 성공 처리(실제 인증은 Phase 3에서 구현)
- 로그인 성공 시 JD 매칭 화면으로 이동
EOF
)"
```

---

## Task 5: 이력서 관리 화면 (업로드/에디터/버전 목록)

**Files:**
- Create: `frontend/src/adapters/resumeAdapter.ts`
- Create: `frontend/src/routes/ResumePage.tsx`
- Modify: `frontend/src/App.tsx` (`/resumes` placeholder 교체)

**Interfaces:**
- Consumes: `mockStore`, `mockDelay`(Task 1), `Card`, `Button`, `TextField`, `Textarea`, `EmptyState`(Task 2).
- Produces: `ResumeAdapter` 인터페이스와 `mockResumeAdapter`(`getVersions(): Promise<ResumeVersion[]>`, `getVersion(id: string): Promise<ResumeVersion>`, `saveVersion(content: string, comment: string): Promise<ResumeVersion>`). Task 6(버전 상세)이 `getVersion`/`getVersions`를 사용하고, Task 8(base 버전 선택)이 `getVersions`를 사용한다.

- [ ] **Step 1: `resumeAdapter.ts` 작성**

```ts
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
    return mockDelay([...db.resumeVersions].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
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
```

- [ ] **Step 2: `ResumePage.tsx` 작성**

```tsx
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { mockResumeAdapter } from "../adapters/resumeAdapter";
import type { ResumeVersion } from "../adapters/types";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { Textarea } from "../components/Textarea";

const PLACEHOLDER_PARSED_TEXT =
  "업로드한 파일에서 파싱된 이력서 내용입니다.\n\n실제 PDF 텍스트 추출은 Phase 4에서 구현됩니다.";

export function ResumePage() {
  const [versions, setVersions] = useState<ResumeVersion[] | null>(null);
  const [content, setContent] = useState("");
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void loadVersions();
  }, []);

  async function loadVersions() {
    const result = await mockResumeAdapter.getVersions();
    setVersions(result);
    if (result.length > 0) {
      setContent(result[result.length - 1].content);
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await mockResumeAdapter.saveVersion(PLACEHOLDER_PARSED_TEXT, `${file.name} 업로드`);
    await loadVersions();
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await mockResumeAdapter.saveVersion(content, comment);
      setComment("");
      await loadVersions();
    } finally {
      setIsSaving(false);
    }
  }

  if (versions === null) {
    return <Card>불러오는 중...</Card>;
  }

  if (versions.length === 0) {
    return (
      <Card>
        <h2>이력서를 업로드해주세요</h2>
        <p>PDF 또는 문서 파일을 업로드하면 텍스트로 파싱되어 에디터에서 편집할 수 있습니다.</p>
        <input type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} />
      </Card>
    );
  }

  return (
    <div className="resume-page">
      <Card>
        <div className="resume-editor-header">
          <h2>이력서 에디터</h2>
          <label className="resume-reupload">
            새 파일 업로드
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} hidden />
          </label>
        </div>
        <form onSubmit={handleSave} className="resume-editor-form">
          <Textarea
            label="이력서 내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <TextField
            label="코멘트 (선택)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="이번에 무엇을 바꿨는지 짧게 남겨보세요"
          />
          <Button type="submit" isLoading={isSaving}>
            저장하고 새 버전 만들기
          </Button>
        </form>
      </Card>

      <Card>
        <h2>버전 목록</h2>
        <ul className="version-list">
          {[...versions].reverse().map((version) => (
            <li key={version.id}>
              <Link to={`/resumes/versions/${version.id}`} className="version-item">
                <span className="version-comment">{version.comment || "(코멘트 없음)"}</span>
                <span className="version-meta">
                  {new Date(version.createdAt).toLocaleDateString("ko-KR")} · 매칭 점수 변화 —
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
```

`components.css`에 이력서 화면 스타일을 추가한다:

```css
.resume-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.resume-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.resume-reupload {
  font-size: 13px;
  color: var(--accent);
  cursor: pointer;
}
.resume-editor-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}
.version-list {
  list-style: none;
  padding: 0;
  margin: 16px 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.version-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-h);
}
.version-item:hover {
  border-color: var(--accent-border);
}
.version-meta {
  color: var(--text);
  font-size: 13px;
}
```

- [ ] **Step 3: `App.tsx`에서 `/resumes` placeholder 교체**

```tsx
import { ResumePage } from "./routes/ResumePage";
```

`<Route path="/resumes" element={<PlaceholderPage title="이력서 관리" />} />`를 `<Route path="/resumes" element={<ResumePage />} />`로 교체한다.

- [ ] **Step 4: 빌드 확인**

Run: `cd frontend && npm run build`

- [ ] **Step 5: 브라우저 확인**

로그인 후 `/resumes`로 이동해:
1. 시드 데이터로 채워진 버전 목록과 최신 버전 내용이 에디터에 로드되는지 확인
2. 코멘트를 입력하고 저장 → 버전 목록에 새 항목이 즉시 추가되는지 확인
3. 브라우저를 새로고침해도 방금 저장한 버전이 유지되는지 확인(localStorage 지속성)
4. localStorage를 개발자도구에서 초기화한 뒤 새로고침 → 업로드 화면이 뜨는지, 파일 선택 시 버전이 생성되고 에디터로 전환되는지 확인 후 다시 페이지를 새로고침해 시드가 복원되는지 확인

- [ ] **Step 6: lint/format 확인**

Run: `cd frontend && npm run lint && npm run format:check`

- [ ] **Step 7: Commit**

```bash
git add frontend/src
git commit -m "$(cat <<'EOF'
feat: 이력서 업로드/에디터/버전 목록 화면 추가

- mock resumeAdapter로 버전 목록 조회, 단건 조회, 저장 기능 구현
- 최초 상태(버전 없음)에는 업로드 UI, 이후에는 에디터+버전 목록을 표시
EOF
)"
```

---

## Task 6: 이력서 버전 상세 화면 (diff)

**Files:**
- Create: `frontend/src/routes/ResumeVersionDetailPage.tsx`
- Modify: `frontend/src/App.tsx` (`/resumes/versions/:id` placeholder 교체)

**Interfaces:**
- Consumes: `mockResumeAdapter.getVersions()`, `getVersion()`(Task 5), `DiffView`, `Card`, `Button`(Task 2).
- Produces: 없음(터미널 화면).

- [ ] **Step 1: `ResumeVersionDetailPage.tsx` 작성**

```tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { mockResumeAdapter } from "../adapters/resumeAdapter";
import type { ResumeVersion } from "../adapters/types";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { DiffView } from "../components/DiffView";

export function ResumeVersionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [current, setCurrent] = useState<ResumeVersion | null>(null);
  const [previous, setPrevious] = useState<ResumeVersion | null>(null);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const all = await mockResumeAdapter.getVersions();
      const index = all.findIndex((v) => v.id === id);
      if (index === -1) return;
      setCurrent(all[index]);
      setPrevious(index > 0 ? all[index - 1] : null);
    })();
  }, [id]);

  if (!current) {
    return <Card>불러오는 중...</Card>;
  }

  return (
    <div className="version-detail-page">
      <Link to="/resumes">← 버전 목록으로</Link>
      <Card>
        <h2>{current.comment || "(코멘트 없음)"}</h2>
        <p className="version-meta">{new Date(current.createdAt).toLocaleString("ko-KR")}</p>
        {previous ? (
          <DiffView oldText={previous.content} newText={current.content} />
        ) : (
          <p>첫 번째 버전이라 비교할 이전 버전이 없습니다.</p>
        )}
      </Card>
      <div className="version-detail-actions">
        <Button variant="secondary" type="button" disabled>
          이 버전으로 브랜치 생성 (JD 매칭 화면에서 가능)
        </Button>
      </div>
    </div>
  );
}
```

`components.css`에 다음을 추가한다:

```css
.version-detail-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.version-detail-actions {
  display: flex;
  justify-content: flex-end;
}
```

- [ ] **Step 2: `App.tsx`에서 `/resumes/versions/:id` placeholder 교체**

```tsx
import { ResumeVersionDetailPage } from "./routes/ResumeVersionDetailPage";
```

`<Route path="/resumes/versions/:id" element={<PlaceholderPage title="버전 상세" />} />`를 `<Route path="/resumes/versions/:id" element={<ResumeVersionDetailPage />} />`로 교체한다.

- [ ] **Step 3: 빌드 확인**

Run: `cd frontend && npm run build`

- [ ] **Step 4: 브라우저 확인**

`/resumes`에서 두 번째 버전을 클릭해:
1. 이전 버전과의 diff가 추가/삭제 라인 색상 구분과 함께 표시되는지 확인
2. 첫 번째 버전을 클릭하면 "비교할 이전 버전이 없습니다" 메시지가 뜨는지 확인

- [ ] **Step 5: lint/format 확인**

Run: `cd frontend && npm run lint && npm run format:check`

- [ ] **Step 6: Commit**

```bash
git add frontend/src
git commit -m "feat: 이력서 버전 상세(diff) 화면 추가"
```

---

## Task 7: JD 매칭 리스트 화면

**Files:**
- Create: `frontend/src/adapters/matchAdapter.ts`
- Create: `frontend/src/routes/MatchesPage.tsx`
- Modify: `frontend/src/App.tsx` (`/matches` placeholder 교체)

**Interfaces:**
- Consumes: `mockStore`, `mockDelay`(Task 1), `Card`, `Badge`, `Button`, `EmptyState`(Task 2).
- Produces: `MatchAdapter` 인터페이스와 `mockMatchAdapter`(`getMatches(): Promise<JdMatch[]>`). Task 8(base 버전 선택/브랜치 생성 흐름)이 이 화면 안에서 동작한다.

- [ ] **Step 1: `matchAdapter.ts` 작성**

```ts
import { mockDelay, mockStore } from "./mockStore";
import type { JdMatch } from "./types";

export interface MatchAdapter {
  getMatches(): Promise<JdMatch[]>;
}

export const mockMatchAdapter: MatchAdapter = {
  async getMatches() {
    const db = mockStore.getDb();
    return mockDelay([...db.jdMatches].sort((a, b) => b.matchScore - a.matchScore));
  },
};
```

- [ ] **Step 2: `MatchesPage.tsx` 작성 (base 버전 선택은 Task 8에서 연결)**

```tsx
import { useEffect, useState } from "react";
import { mockMatchAdapter } from "../adapters/matchAdapter";
import type { JdMatch } from "../adapters/types";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";

export function MatchesPage() {
  const [matches, setMatches] = useState<JdMatch[] | null>(null);

  useEffect(() => {
    void mockMatchAdapter.getMatches().then(setMatches);
  }, []);

  if (matches === null) {
    return <Card>불러오는 중...</Card>;
  }

  if (matches.length === 0) {
    return (
      <EmptyState title="아직 매칭된 공고가 없습니다" description="새 공고가 수집되면 여기에 표시됩니다." />
    );
  }

  return (
    <div className="match-grid">
      {matches.map((match) => (
        <Card key={match.id} className="match-card">
          <div className="match-card-header">
            <div>
              <h3>{match.company}</h3>
              <p className="match-title">{match.title}</p>
            </div>
            <span className="match-score">{match.matchScore}점</span>
          </div>
          <div className="match-skills">
            {match.skills.map((skill) => (
              <Badge key={skill} tone="neutral">
                {skill}
              </Badge>
            ))}
          </div>
          <Button type="button" disabled>
            지원 준비하기 (Task 8에서 연결)
          </Button>
        </Card>
      ))}
    </div>
  );
}
```

`components.css`에 다음을 추가한다:

```css
.match-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.match-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.match-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.match-title {
  color: var(--text);
  font-size: 14px;
  margin: 4px 0 0;
}
.match-score {
  font-weight: 500;
  color: var(--accent);
}
.match-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
```

- [ ] **Step 3: `App.tsx`에서 `/matches` placeholder 교체**

```tsx
import { MatchesPage } from "./routes/MatchesPage";
```

`<Route path="/matches" element={<PlaceholderPage title="JD 매칭" />} />`를 `<Route path="/matches" element={<MatchesPage />} />`로 교체한다.

- [ ] **Step 4: 빌드 확인**

Run: `cd frontend && npm run build`

- [ ] **Step 5: 브라우저 확인**

로그인 후 `/matches`에서 시드된 4개 JD 카드가 매칭 점수 내림차순으로 정렬되어 표시되는지, 기술스택 배지가 보이는지 확인한다. "지원 준비하기" 버튼은 이 단계에서는 비활성 상태인 것이 정상이다(Task 8에서 연결).

- [ ] **Step 6: lint/format 확인**

Run: `cd frontend && npm run lint && npm run format:check`

- [ ] **Step 7: Commit**

```bash
git add frontend/src
git commit -m "feat: JD 매칭 리스트 화면 추가"
```

---

## Task 8: base 버전 선택 → 브랜치 생성/이동 흐름

**Files:**
- Create: `frontend/src/adapters/branchAdapter.ts`
- Create: `frontend/src/components/BaseVersionModal.tsx`
- Modify: `frontend/src/routes/MatchesPage.tsx` ("지원 준비하기" 버튼 활성화 및 모달 연결)

**Interfaces:**
- Consumes: `mockResumeAdapter.getVersions()`(Task 5), `mockStore`, `mockDelay`(Task 1), `Button`(Task 2).
- Produces: `BranchAdapter` 인터페이스 중 `getBranches(): Promise<Branch[]>`, `getBranch(id): Promise<Branch>`, `findBranchByJdMatchId(jdMatchId): Promise<Branch | null>`, `createBranch(jdMatchId, baseVersionId): Promise<Branch>`. Task 9(브랜치 목록), Task 10(브랜치 상세)이 이 어댑터를 계속 사용/확장한다.

- [ ] **Step 1: `branchAdapter.ts` 작성**

```ts
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
    return mockDelay(db.branches.find((b) => b.jdMatchId === jdMatchId) ?? null);
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
```

- [ ] **Step 2: `BaseVersionModal.tsx` 작성**

```tsx
import { useEffect, useState } from "react";
import { mockResumeAdapter } from "../adapters/resumeAdapter";
import type { ResumeVersion } from "../adapters/types";
import { Button } from "./Button";

interface BaseVersionModalProps {
  onSelect: (versionId: string) => void;
  onClose: () => void;
}

export function BaseVersionModal({ onSelect, onClose }: BaseVersionModalProps) {
  const [versions, setVersions] = useState<ResumeVersion[] | null>(null);

  useEffect(() => {
    void mockResumeAdapter.getVersions().then(setVersions);
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>어떤 버전을 base로 브랜치를 시작할까요?</h3>
        {versions === null && <p>불러오는 중...</p>}
        {versions?.length === 0 && <p>먼저 이력서를 업로드해주세요.</p>}
        <ul className="modal-version-list">
          {versions
            ?.slice()
            .reverse()
            .map((version) => (
              <li key={version.id}>
                <button type="button" className="modal-version-item" onClick={() => onSelect(version.id)}>
                  <span>{version.comment || "(코멘트 없음)"}</span>
                  <span className="version-meta">
                    {new Date(version.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </button>
              </li>
            ))}
        </ul>
        <Button variant="secondary" type="button" onClick={onClose}>
          취소
        </Button>
      </div>
    </div>
  );
}
```

`components.css`에 다음을 추가한다:

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.modal-content {
  background: var(--surface);
  border-radius: 12px;
  padding: 24px;
  width: 360px;
  max-height: 80vh;
  overflow-y: auto;
}
.modal-version-list {
  list-style: none;
  padding: 0;
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.modal-version-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  cursor: pointer;
  font: inherit;
  color: var(--text-h);
}
.modal-version-item:hover {
  border-color: var(--accent-border);
}
```

- [ ] **Step 3: `MatchesPage.tsx`에서 "지원 준비하기" 버튼 연결**

`MatchesPage.tsx`를 다음과 같이 수정한다: 상태로 `activeMatchId`(모달을 연 매칭 id)를 두고, 버튼 클릭 시 기존 브랜치 유무를 먼저 확인해 있으면 바로 이동, 없으면 모달을 연다.

```tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockMatchAdapter } from "../adapters/matchAdapter";
import { mockBranchAdapter } from "../adapters/branchAdapter";
import type { JdMatch } from "../adapters/types";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { BaseVersionModal } from "../components/BaseVersionModal";

export function MatchesPage() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<JdMatch[] | null>(null);
  const [modalJdMatchId, setModalJdMatchId] = useState<string | null>(null);

  useEffect(() => {
    void mockMatchAdapter.getMatches().then(setMatches);
  }, []);

  async function handlePrepareApply(jdMatchId: string) {
    const existing = await mockBranchAdapter.findBranchByJdMatchId(jdMatchId);
    if (existing) {
      navigate(`/branches/${existing.id}`);
      return;
    }
    setModalJdMatchId(jdMatchId);
  }

  async function handleSelectBaseVersion(versionId: string) {
    if (!modalJdMatchId) return;
    const branch = await mockBranchAdapter.createBranch(modalJdMatchId, versionId);
    setModalJdMatchId(null);
    navigate(`/branches/${branch.id}`);
  }

  if (matches === null) {
    return <Card>불러오는 중...</Card>;
  }

  if (matches.length === 0) {
    return (
      <EmptyState title="아직 매칭된 공고가 없습니다" description="새 공고가 수집되면 여기에 표시됩니다." />
    );
  }

  return (
    <div className="match-grid">
      {matches.map((match) => (
        <Card key={match.id} className="match-card">
          <div className="match-card-header">
            <div>
              <h3>{match.company}</h3>
              <p className="match-title">{match.title}</p>
            </div>
            <span className="match-score">{match.matchScore}점</span>
          </div>
          <div className="match-skills">
            {match.skills.map((skill) => (
              <Badge key={skill} tone="neutral">
                {skill}
              </Badge>
            ))}
          </div>
          <Button type="button" onClick={() => handlePrepareApply(match.id)}>
            지원 준비하기
          </Button>
        </Card>
      ))}
      {modalJdMatchId && (
        <BaseVersionModal
          onSelect={handleSelectBaseVersion}
          onClose={() => setModalJdMatchId(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: 빌드 확인**

Run: `cd frontend && npm run build`
Expected: 아직 `/branches/:id` 실제 화면이 없어(Task 10에서 구현) 이동 후에는 Task 3의 placeholder가 보인다 — 정상이다.

- [ ] **Step 5: 브라우저 확인**

1. 아직 브랜치가 없는 JD(`jd-2` 토스 또는 `jd-4` 카카오엔터프라이즈) 카드에서 "지원 준비하기" 클릭 → base 버전 선택 모달이 뜨는지 확인
2. 버전을 선택하면 새 브랜치가 생성되고 `/branches/:id`(placeholder)로 이동하는지 확인
3. 이미 브랜치가 있는 JD(`jd-1` 원티드랩)에서 "지원 준비하기" 클릭 → 모달 없이 바로 기존 브랜치(`branch-1`)로 이동하는지 확인

- [ ] **Step 6: lint/format 확인**

Run: `cd frontend && npm run lint && npm run format:check`

- [ ] **Step 7: Commit**

```bash
git add frontend/src
git commit -m "$(cat <<'EOF'
feat: JD 매칭에서 브랜치 생성/이동 흐름 연결

- mock branchAdapter로 브랜치 조회/생성 구현
- "지원 준비하기" 클릭 시 base 버전 선택 모달 → 브랜치 생성, 기존 브랜치가 있으면 즉시 이동
EOF
)"
```

---

## Task 9: 브랜치 목록 화면

**Files:**
- Create: `frontend/src/routes/BranchesPage.tsx`
- Modify: `frontend/src/App.tsx` (`/branches` placeholder 교체)

**Interfaces:**
- Consumes: `mockBranchAdapter.getBranches()`(Task 8), `mockMatchAdapter.getMatches()`(Task 7), `Card`, `Badge`, `EmptyState`(Task 2).
- Produces: 없음(터미널 화면).

- [ ] **Step 1: `BranchesPage.tsx` 작성**

브랜치는 JD 정보를 직접 갖지 않으므로(스펙의 `jdMatchId` 참조 구조) 매칭 목록과 조인해서 회사/직무명을 표시한다.

```tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mockBranchAdapter } from "../adapters/branchAdapter";
import { mockMatchAdapter } from "../adapters/matchAdapter";
import type { Branch, BranchStatus, JdMatch } from "../adapters/types";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { EmptyState } from "../components/EmptyState";

const STATUS_LABEL: Record<BranchStatus, string> = {
  in_progress: "진행중",
  applied: "지원완료",
  closed: "마감",
};

const STATUS_TONE: Record<BranchStatus, "warning" | "positive" | "neutral"> = {
  in_progress: "warning",
  applied: "positive",
  closed: "neutral",
};

const STATUS_FILTERS: Array<BranchStatus | "all"> = ["all", "in_progress", "applied", "closed"];

export function BranchesPage() {
  const [branches, setBranches] = useState<Branch[] | null>(null);
  const [matches, setMatches] = useState<JdMatch[]>([]);
  const [filter, setFilter] = useState<BranchStatus | "all">("all");

  useEffect(() => {
    void Promise.all([mockBranchAdapter.getBranches(), mockMatchAdapter.getMatches()]).then(
      ([branchList, matchList]) => {
        setBranches(branchList);
        setMatches(matchList);
      },
    );
  }, []);

  if (branches === null) {
    return <Card>불러오는 중...</Card>;
  }

  if (branches.length === 0) {
    return (
      <EmptyState
        title="아직 브랜치가 없습니다"
        description="JD 매칭 화면에서 '지원 준비하기'를 누르면 브랜치가 생성됩니다."
      />
    );
  }

  const filtered = filter === "all" ? branches : branches.filter((b) => b.status === filter);

  return (
    <div className="branches-page">
      <div className="branch-filter">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            className={filter === status ? "branch-filter-btn active" : "branch-filter-btn"}
            onClick={() => setFilter(status)}
          >
            {status === "all" ? "전체" : STATUS_LABEL[status]}
          </button>
        ))}
      </div>
      <div className="branch-list">
        {filtered.map((branch) => {
          const match = matches.find((m) => m.id === branch.jdMatchId);
          return (
            <Link key={branch.id} to={`/branches/${branch.id}`}>
              <Card className="branch-card">
                <div>
                  <h3>{match?.company ?? "알 수 없는 공고"}</h3>
                  <p className="match-title">{match?.title}</p>
                </div>
                <Badge tone={STATUS_TONE[branch.status]}>{STATUS_LABEL[branch.status]}</Badge>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

`components.css`에 다음을 추가한다:

```css
.branches-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.branch-filter {
  display: flex;
  gap: 8px;
}
.branch-filter-btn {
  font: inherit;
  font-size: 13px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  cursor: pointer;
}
.branch-filter-btn.active {
  background: var(--accent-bg);
  border-color: var(--accent-border);
  color: var(--text-h);
}
.branch-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.branch-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

- [ ] **Step 2: `App.tsx`에서 `/branches` placeholder 교체**

```tsx
import { BranchesPage } from "./routes/BranchesPage";
```

`<Route path="/branches" element={<PlaceholderPage title="브랜치 목록" />} />`를 `<Route path="/branches" element={<BranchesPage />} />`로 교체한다.

- [ ] **Step 3: 빌드 확인**

Run: `cd frontend && npm run build`

- [ ] **Step 4: 브라우저 확인**

`/branches`에서:
1. 시드된 2개 브랜치(원티드랩=진행중, 당근마켓=지원완료)가 목록에 보이는지 확인
2. 상태 필터 버튼을 클릭해 목록이 필터링되는지 확인
3. Task 8에서 새로 만든 브랜치도 목록에 나타나는지 확인

- [ ] **Step 5: lint/format 확인**

Run: `cd frontend && npm run lint && npm run format:check`

- [ ] **Step 6: Commit**

```bash
git add frontend/src
git commit -m "feat: 브랜치 목록 화면(상태 필터) 추가"
```

---

## Task 10: 브랜치 상세 화면 (개선도 + 갭분석/첨삭 결과)

**Files:**
- Modify: `frontend/src/adapters/branchAdapter.ts` (갭분석 관련 메서드 추가)
- Create: `frontend/src/components/GapAnalysisSection.tsx`
- Create: `frontend/src/routes/BranchDetailPage.tsx`
- Modify: `frontend/src/App.tsx` (`/branches/:id` placeholder 교체)

**Interfaces:**
- Consumes: `mockBranchAdapter.getBranch()`(Task 8), `mockMatchAdapter.getMatches()`(Task 7), `ScoreDelta`, `Badge`, `Card`, `Button`(Task 2).
- Produces: `BranchAdapter`에 `getGapAnalysis(branchId): Promise<GapAnalysisResult | null>`, `requestGapAnalysis(branchId): Promise<GapAnalysisResult>` 추가. 이 Task로 로드맵 Phase 2의 마지막 화면 항목이 완성된다.

- [ ] **Step 1: `branchAdapter.ts`에 갭분석 메서드 추가**

`BranchAdapter` 인터페이스에 두 메서드를 추가한다:

```ts
export interface BranchAdapter {
  getBranches(): Promise<Branch[]>;
  getBranch(id: string): Promise<Branch>;
  findBranchByJdMatchId(jdMatchId: string): Promise<Branch | null>;
  createBranch(jdMatchId: string, baseVersionId: string): Promise<Branch>;
  getGapAnalysis(branchId: string): Promise<GapAnalysisResult | null>;
  requestGapAnalysis(branchId: string): Promise<GapAnalysisResult>;
}
```

`import` 목록에 `GapAnalysisResult`를 추가하고, `mockBranchAdapter` 객체에 다음 두 메서드를 추가한다:

```ts
  async getGapAnalysis(branchId) {
    const db = mockStore.getDb();
    return mockDelay(db.gapAnalyses.find((g) => g.branchId === branchId) ?? null);
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
    const existingIndex = db.gapAnalyses.findIndex((g) => g.branchId === branchId);
    if (existingIndex >= 0) {
      db.gapAnalyses[existingIndex] = result;
    } else {
      db.gapAnalyses.push(result);
    }
    mockStore.setDb(db);
    return mockDelay(result, 800);
  },
```

- [ ] **Step 2: `GapAnalysisSection.tsx` 작성**

```tsx
import { useState } from "react";
import { mockBranchAdapter } from "../adapters/branchAdapter";
import type { GapAnalysisResult } from "../adapters/types";
import { Button } from "./Button";

interface GapAnalysisSectionProps {
  branchId: string;
  initialResult: GapAnalysisResult | null;
}

export function GapAnalysisSection({ branchId, initialResult }: GapAnalysisSectionProps) {
  const [result, setResult] = useState(initialResult);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRequest() {
    setIsLoading(true);
    try {
      const newResult = await mockBranchAdapter.requestGapAnalysis(branchId);
      setResult(newResult);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="gap-analysis">
      <div className="gap-analysis-header">
        <h3>갭분석 · 첨삭 피드백</h3>
        <Button type="button" onClick={handleRequest} isLoading={isLoading}>
          {result ? "다시 첨삭받기" : "첨삭하기/피드백 받기"}
        </Button>
      </div>
      {result && (
        <div className="gap-analysis-result">
          <div>
            <h4>부족한 부분</h4>
            <ul>
              {result.gaps.map((gap) => (
                <li key={gap}>{gap}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>첨삭 피드백</h4>
            <p>{result.feedback}</p>
          </div>
          <p className="gap-analysis-meta">
            {new Date(result.generatedAt).toLocaleString("ko-KR")} 기준
          </p>
        </div>
      )}
    </div>
  );
}
```

`components.css`에 다음을 추가한다:

```css
.gap-analysis {
  margin-top: 24px;
  border-top: 1px solid var(--border);
  padding-top: 20px;
}
.gap-analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.gap-analysis-result {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.gap-analysis-meta {
  color: var(--text);
  font-size: 12px;
}
```

- [ ] **Step 3: `BranchDetailPage.tsx` 작성**

```tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { mockBranchAdapter } from "../adapters/branchAdapter";
import { mockMatchAdapter } from "../adapters/matchAdapter";
import type { Branch, BranchStatus, GapAnalysisResult, JdMatch } from "../adapters/types";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { ScoreDelta } from "../components/ScoreDelta";
import { GapAnalysisSection } from "../components/GapAnalysisSection";

const STATUS_LABEL: Record<BranchStatus, string> = {
  in_progress: "진행중",
  applied: "지원완료",
  closed: "마감",
};

const STATUS_TONE: Record<BranchStatus, "warning" | "positive" | "neutral"> = {
  in_progress: "warning",
  applied: "positive",
  closed: "neutral",
};

export function BranchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [match, setMatch] = useState<JdMatch | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysisResult | null>(null);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const branchResult = await mockBranchAdapter.getBranch(id);
      setBranch(branchResult);
      const matches = await mockMatchAdapter.getMatches();
      setMatch(matches.find((m) => m.id === branchResult.jdMatchId) ?? null);
      const gap = await mockBranchAdapter.getGapAnalysis(id);
      setGapAnalysis(gap);
    })();
  }, [id]);

  if (!branch) {
    return <Card>불러오는 중...</Card>;
  }

  return (
    <div className="branch-detail-page">
      <Card>
        <div className="branch-detail-header">
          <div>
            <h2>{match?.company ?? "알 수 없는 공고"}</h2>
            <p className="match-title">{match?.title}</p>
          </div>
          <Badge tone={STATUS_TONE[branch.status]}>{STATUS_LABEL[branch.status]}</Badge>
        </div>

        <h3>버전 이력 (개선도)</h3>
        <ul className="branch-version-list">
          {branch.versions.map((version, index) => {
            const baseScore = match?.matchScore ?? 0;
            const before = index === 0 ? baseScore : baseScore + index * 2 - 2;
            const after = baseScore + index * 2;
            return (
              <li key={version.id} className="branch-version-item">
                <span>{version.comment}</span>
                <ScoreDelta before={before} after={after} />
              </li>
            );
          })}
        </ul>

        <GapAnalysisSection branchId={branch.id} initialResult={gapAnalysis} />
      </Card>
    </div>
  );
}
```

`components.css`에 다음을 추가한다:

```css
.branch-detail-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.branch-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.branch-version-list {
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.branch-version-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
}
```

**참고**: `ScoreDelta`의 `before`/`after` 계산은 실제 매칭 재계산 로직이 아니라 개선도가 시각적으로 우상향한다는 것을 보여주기 위한 mock 근사치다. 실제 점수 히스토리는 Phase 12(브랜치 내 매칭 재계산)에서 각 `ResumeVersion`에 점수 필드가 추가되며 대체된다.

- [ ] **Step 4: `App.tsx` 최종본으로 교체**

이 시점에 모든 라우트가 실제 화면으로 채워지므로 `PlaceholderPage`와 그 전용 import(`Card`, `EmptyState`)를 제거하고, `App.tsx` 전체를 다음 최종본으로 교체한다:

```tsx
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { LoginPage } from "./routes/LoginPage";
import { SignupPage } from "./routes/SignupPage";
import { ResumePage } from "./routes/ResumePage";
import { ResumeVersionDetailPage } from "./routes/ResumeVersionDetailPage";
import { MatchesPage } from "./routes/MatchesPage";
import { BranchesPage } from "./routes/BranchesPage";
import { BranchDetailPage } from "./routes/BranchDetailPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<AppLayout />}>
        <Route path="/resumes" element={<ResumePage />} />
        <Route path="/resumes/versions/:id" element={<ResumeVersionDetailPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/branches" element={<BranchesPage />} />
        <Route path="/branches/:id" element={<BranchDetailPage />} />
        <Route index element={<Navigate to="/matches" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/matches" replace />} />
    </Routes>
  );
}

export default App;
```

- [ ] **Step 5: 빌드 확인**

Run: `cd frontend && npm run build`

- [ ] **Step 6: 브라우저 확인**

1. `/branches`에서 원티드랩 브랜치(`branch-1`) 클릭 → 버전 2개의 개선도(`ScoreDelta`)가 양수로 표시되는지 확인
2. 이미 갭분석 결과가 시드되어 있으므로 "부족한 부분"/"첨삭 피드백"이 바로 보이는지 확인
3. "다시 첨삭받기" 클릭 → 로딩 상태 후 새 결과로 갱신되는지 확인
4. 당근마켓 브랜치(`branch-2`, 갭분석 없음) 클릭 → "첨삭하기/피드백 받기" 버튼만 보이다가 클릭 시 결과가 나타나는지 확인

- [ ] **Step 7: lint/format 확인**

Run: `cd frontend && npm run lint && npm run format:check`

- [ ] **Step 8: Commit**

```bash
git add frontend/src
git commit -m "$(cat <<'EOF'
feat: 브랜치 상세 화면에 개선도와 갭분석/첨삭 결과 추가

- 브랜치 내 버전별 매칭 점수 변화를 ScoreDelta로 표시
- "첨삭하기/피드백 받기" 클릭 시 mock 갭분석·RAG 첨삭 결과를 생성/표시
EOF
)"
```

---

## Task 11: 전체 플로우 통합 점검 + 로드맵 갱신

**Files:**
- Modify: `docs/ROADMAP.md` (Phase 2 체크리스트)

**Interfaces:**
- Consumes: Task 1~10에서 완성된 전체 애플리케이션.
- Produces: 없음(검증 및 문서 갱신 작업).

- [ ] **Step 1: localStorage 초기화 후 전체 플로우 수동 시연**

Run: `cd frontend && npm run dev`

브라우저 개발자도구에서 `localStorage.clear()`로 초기화한 뒤 새로고침하고, 다음 흐름을 처음부터 끝까지 클릭으로 진행한다:
1. `/login`에서 회원가입 → 로그인
2. `/matches`에서 브랜치가 없는 JD의 "지원 준비하기" 클릭 → base 버전 선택 모달에서 이력서가 없으므로 안내 문구 확인
3. `/resumes`로 이동해 파일 업로드(mock) → 버전 생성 확인
4. 코멘트와 함께 이력서 내용을 수정해 저장 → 새 버전 생성 확인
5. 버전 상세에서 diff 확인
6. `/matches`로 돌아가 "지원 준비하기" 클릭 → base 버전 선택 → 브랜치 생성 확인
7. `/branches`에서 방금 만든 브랜치가 목록/필터에 나타나는지 확인
8. 브랜치 상세에서 "첨삭하기/피드백 받기" 클릭 → 갭분석/첨삭 결과 확인
9. 로그아웃 → 다시 로그인 → 위 데이터가 모두 유지되는지(localStorage 지속성) 확인

발견된 문제가 있다면 해당 Task로 돌아가 수정한다.

- [ ] **Step 2: 최종 빌드/린트/포맷 확인**

Run: `cd frontend && npm run lint && npm run format:check && npm run build`
Expected: 모두 통과.

- [ ] **Step 3: `docs/ROADMAP.md`의 Phase 2 체크리스트 갱신**

[.claude/CLAUDE.md](../../../.claude/CLAUDE.md)의 "로드맵 진행 상황 반영" 지침에 따라, Step 1의 수동 시연으로 완료 기준(mock 데이터로 전체 플로우를 클릭으로 시연 가능)을 실제로 확인했으므로 Phase 2의 8개 세부 작업 체크박스를 모두 `- [x]`로 변경한다:

```markdown
- [x] 라우팅/레이아웃 구조 설계 (페이지 라우트, 공통 헤더/네비게이션)
- [x] 디자인 시스템 기초 (버튼/카드/폼/배지 등 공통 컴포넌트)
- [x] 데이터 어댑터 인터페이스 정의 (화면이 의존하는 타입 + mock 구현체, 이후 실제 API 구현체로 교체 가능한 구조)
- [x] 로그인/회원가입 화면 (mock)
- [x] 이력서 업로드/에디터 + 버전 목록/diff 화면 (mock)
- [x] JD 매칭 리스트 화면 (mock)
- [x] JD별 브랜치 목록/상세 화면 — 상태 필터, 개선도 표시 (mock)
- [x] 갭분석/첨삭 결과 표시 화면 (mock)
```

- [ ] **Step 4: Commit**

```bash
git add docs/ROADMAP.md
git commit -m "$(cat <<'EOF'
docs: Phase 2 로드맵 체크리스트 완료 반영

- mock 데이터로 로그인→이력서→JD매칭→브랜치→갭분석/첨삭 전체 플로우를 클릭으로 시연 가능함을 확인
EOF
)"
```
