# Phase 2: UI/UX 틀 잡기 (mock 데이터) — 설계 문서

## 배경

[docs/ROADMAP.md](../../ROADMAP.md)의 Phase 2 목표: 실제 백엔드 연동 없이, 서비스의 전체 사용자 플로우(로그인 → 이력서 관리 → JD 매칭 → 브랜치 → 첨삭 결과)를 mock 데이터로 클릭만으로 시연할 수 있는 화면 틀을 만든다. 화면 컴포넌트는 데이터 소스를 어댑터(인터페이스 + mock 구현체) 뒤로 감춰 두어서, 이후 Phase들이 화면을 다시 만들지 않고 mock 구현체를 실제 API 호출로 교체하기만 하면 되도록 한다.

관련 PRD 섹션: 3.2(이력서 버전 관리 흐름), 3.3(JD별 브랜치 흐름), 4.1(기능 명세 — 화면 요구사항 전반).

Phase 2는 Phase 1(배포 파이프라인)까지 완료된 상태에서 시작한다. 현재 `frontend/`는 Vite 기본 템플릿(`App.tsx`가 카운터 데모) 그대로이며, `react-router-dom`은 설치돼 있으나 라우팅 설정은 없다. 스타일링은 `index.css`의 CSS 커스텀 프로퍼티(`--accent`, `--border`, `--shadow` 등) 기반이며 CSS 프레임워크는 없다.

## 아키텍처

**폴더 구조** (`frontend/src/` 확장):
```
src/
  routes/
    LoginPage.tsx
    SignupPage.tsx
    ResumePage.tsx              # 에디터 + 버전 목록
    ResumeVersionDetailPage.tsx # 버전 상세 (diff)
    MatchesPage.tsx             # JD 매칭 리스트
    BranchesPage.tsx            # 브랜치 목록
    BranchDetailPage.tsx        # 브랜치 상세 + 개선도 + 갭분석/첨삭 결과
  components/
    Button.tsx, Card.tsx, Badge.tsx, TextField.tsx, Textarea.tsx,
    ScoreDelta.tsx, DiffView.tsx, EmptyState.tsx, Header.tsx
  adapters/
    types.ts        # 도메인 타입
    mockStore.ts     # localStorage 기반 시드/영속 헬퍼
    authAdapter.ts, resumeAdapter.ts, matchAdapter.ts, branchAdapter.ts
  context/
    AuthContext.tsx  # mock 로그인 상태 전역 관리, 보호 라우트 가드
  App.tsx            # 라우터 + AppLayout(공통 헤더/네비게이션)
```

**핵심 설계 원칙**: 모든 화면 컴포넌트는 `adapters/`가 export하는 인터페이스 타입에만 의존한다. 예: `ResumeAdapter.getVersions(): Promise<ResumeVersion[]>`. 지금은 `mockResumeAdapter`가 `mockStore.ts`(localStorage 래퍼)를 읽고 쓰지만, 이후 Phase(4, 8, 11~14)에서 이 구현체만 실제 `fetch` 기반 어댑터로 교체하면 되고 화면 컴포넌트는 변경할 필요가 없다.

**라우팅**: `react-router-dom` 사용. `/login`, `/signup`은 공개 라우트. `/resumes`, `/resumes/versions/:id`, `/matches`, `/branches`, `/branches/:id`는 `AuthContext`가 감싸는 보호 라우트이며, 미로그인 상태로 접근 시 `/login`으로 리다이렉트한다. 로그인 성공 후 기본 진입 화면은 `/matches`(서비스의 핵심 가치인 JD 매칭을 바로 보여주기 위함).

**공통 레이아웃**: 보호 라우트 전체에 `AppLayout`을 적용한다. 상단 가로 네비게이션(이력서 관리 / JD 매칭 / 브랜치 3개 탭 + 로그아웃)을 포함한다.

## 디자인 시스템

**스타일링 방식**: 플레인 CSS. Tailwind나 CSS Modules 같은 새 의존성을 추가하지 않고, 현재 `index.css`의 CSS 커스텀 프로퍼티 패턴을 그대로 확장한다.

> **⚠️ Supersede (2026-07-28, UI/UX 전면 리뉴얼, 이슈 #8)**: 이 결정은 뒤집혔다. 무의존성 플레인 CSS는 토큰 이탈을 막을 문법적 장치가 없었고, 실제로 `components.css` 915줄에 px·hex 값이 하드코딩되며 무너졌다(웹폰트 미지정, elevation 토큰 정의만 되고 사용처 0건, radius 6종·font-size 5단계 난립, Vite 템플릿 컨테이너 잔재 등). Tailwind v4로 전환해 `frontend/src/styles/theme.css`의 `@theme` 블록에서 `--color-*`/`--font-*`/`--radius-*`/`--shadow-*` 기본 팔레트를 `initial`로 지우고 프로젝트 토큰만 남기는 방식을 택했다 — 설정이 CSS 안에 있어 토큰이 단일 소스로 유지되고, 유틸리티 클래스가 거기서 파생되므로 "무의존성"보다 "토큰 단일화 + 이탈 불가"가 이 프로젝트가 실제로 겪은 문제에 대한 해답이었다. 자세한 근거와 최종 토큰 값은 [docs/DESIGN.md](../../DESIGN.md) 참고.

**톤 방향**: 뉴트럴 그레이스케일 기반 + 절제된 포인트 컬러 1개("미니멀 전문가 톤"). 개발자 취업 준비자가 신뢰감을 느낄 수 있는 담담한 톤으로, 여백을 넓게 쓰는 데이터 중심 대시보드를 지향한다.

**포인트 컬러**: 비비드 바이올렛.
- `--accent: #7F77DD` (라이트) / `#AFA9EC` (다크)
- `--accent-bg: rgba(127,119,221,0.12)` (라이트) / `rgba(175,169,236,0.18)` (다크)
- `--accent-border: rgba(127,119,221,0.5)` (라이트) / `rgba(175,169,236,0.5)` (다크)

기존 Vite 기본값(`--accent: #aa3bff`)과 계열은 유지하되 채도·명도를 낮춰 톤을 다운시킨다.

**토큰 확장** (기존 `--text`/`--bg`/`--border`/`--shadow` 패턴 유지, 라이트/다크 모두 `@media (prefers-color-scheme: dark)`로 대응):
- 뉴트럴: `--text`, `--text-h`, `--bg`, `--surface`(카드 배경), `--border`
- 액센트: `--accent`, `--accent-bg`, `--accent-border` (위 확정값)
- 시맨틱: `--positive`(개선도 상승 / 지원완료), `--warning`(진행중), `--danger`(하락 / 에러), `--neutral-muted`(마감 / 비활성)

**컴포넌트 목록** (`src/components/`):

| 컴포넌트 | 용도 |
|---|---|
| `Button` | primary/secondary/ghost 변형, 로딩 상태 지원 |
| `Card` | 매칭/브랜치 리스트 아이템, 버전 카드 등 공통 컨테이너 |
| `Badge` | 브랜치 상태(진행중/지원완료/마감), JD 기술스택 태그 |
| `TextField` / `Textarea` | 로그인 폼, 버전 저장 시 코멘트 입력 |
| `ScoreDelta` | 개선도 표시(`+12.3%p` 형태), 양수/음수 색상 자동 구분 |
| `DiffView` | 버전 상세보기의 텍스트 diff(추가=`--positive`, 삭제=`--danger` 라인) |
| `EmptyState` | mock 데이터가 비었을 때(예: 아직 브랜치 없음) 안내 |
| `Header` | 상단 가로 네비 + 로그아웃 |

## 데이터 모델 & 어댑터 인터페이스

**도메인 타입** (`src/adapters/types.ts`):
```ts
type BranchStatus = "in_progress" | "applied" | "closed";

interface ResumeVersion {
  id: string;
  content: string;        // 구조화된 이력서 텍스트
  comment: string;        // 저장 시 코멘트 (빈 문자열 허용)
  createdAt: string;
}

interface JdMatch {
  id: string;
  company: string;
  title: string;
  skills: string[];
  matchScore: number;     // 0~100
  source: "wanted" | "worknet";
}

interface Branch {
  id: string;
  jdMatchId: string;
  status: BranchStatus;
  baseVersionId: string;
  versions: ResumeVersion[];   // 브랜치 내 버전 이력 (개선도 계산 근거)
}

interface GapAnalysisResult {
  branchId: string;
  gaps: string[];               // 부족한 역량 목록
  feedback: string;             // RAG 첨삭 피드백
  generatedAt: string;
}
```

**어댑터 인터페이스** (예: `resumeAdapter.ts`):
```ts
interface ResumeAdapter {
  getVersions(): Promise<ResumeVersion[]>;
  getVersion(id: string): Promise<ResumeVersion>;
  saveVersion(content: string, comment: string): Promise<ResumeVersion>;
}
```

`authAdapter`, `matchAdapter`, `branchAdapter`도 동일한 패턴(인터페이스 + `mockXxxAdapter` 구현체)을 따른다. 화면 컴포넌트는 인터페이스 타입만 import하므로, 이후 Phase에서 `fetchResumeAdapter` 같은 실제 구현체로 교체할 때 주입부(예: 최상위에서 `const resumeAdapter: ResumeAdapter = USE_MOCK ? mockResumeAdapter : fetchResumeAdapter`) 한 줄만 바뀌고 화면 코드는 변경되지 않는다.

**mock 데이터 지속성**: localStorage에 지속한다. 새로고침하거나 탭을 닫았다 열어도 로그인 상태, 이력서 버전, 브랜치 등이 유지되어 면접관이나 사용자가 실제 서비스처럼 체험할 수 있다.

**mock 로그인 동작**: 이메일/비밀번호 형식 검증만 하고, 입력값과 무관하게 제출 시 로그인 처리한다. 실제 인증은 Phase 3에서 구현되며 이 Phase의 목표는 플로우 시연이다.

**시드 데이터**: 앱 최초 로드 시 localStorage가 비어 있으면 `mockStore.ts`가 자동으로 시드를 채운다.
- 이력서 버전 2~3개
- JD 매칭 4~5개 (매칭 점수 다양하게 분포)
- 브랜치 2개 — 하나는 진행중 상태이며 버전 2개 이상으로 개선도(`ScoreDelta`)가 보이도록, 다른 하나는 지원완료 상태
- 브랜치 중 하나는 갭분석/첨삭 결과까지 미리 채워둠

별도 입력 없이 로그인만 하면 전체 플로우를 바로 시연할 수 있게 하기 위함이다.

## 화면별 상세

### 로그인/회원가입 (`/login`, `/signup`)
이메일·비밀번호 형식 검증만 하는 `TextField` 2개 + 제출 `Button`. 제출 시 `authAdapter.login()`이 성공 처리하고 `/matches`로 이동한다. 회원가입도 동일하게 동작하되, 완료 후 로그인 페이지로 안내한다.

### 이력서 관리 (`/resumes`)
- 버전이 하나도 없는 최초 상태에는 업로드 영역(파일 선택 `input[type=file]`, mock이므로 실제 PDF 파싱 없이 파일명만 확인)을 보여준다. 파일을 선택하면 `resumeAdapter.saveVersion()`이 미리 정의된 플레이스홀더 파싱 텍스트로 첫 버전을 생성하고, 곧바로 에디터 화면으로 전환된다. 실제 PDF→텍스트 파싱은 Phase 4에서 구현된다.
- 버전이 하나 이상 있으면: 이력서 에디터(`Textarea`, 최신 버전 내용으로 초기화) + 코멘트 입력(`TextField`, 빈 값 허용) + "저장" `Button` → 저장 시 새 `ResumeVersion` 생성. 에디터 상단에 "새 파일 업로드"로 처음부터 다시 시작하는 보조 링크도 제공한다.
- 하단: 버전 목록 — 각 항목에 코멘트, 생성일 표시. 매칭 점수 변화는 Phase 8/12에서 실제 매칭 로직이 연동되기 전이므로 이 Phase에서는 "—" 플레이스홀더로 표시하고, 향후 연동 예정임을 화면에 명시한다.
- 버전 클릭 시 `/resumes/versions/:id`로 이동 → 직전 버전과의 `DiffView` 표시

### JD 매칭 리스트 (`/matches`)
- `JdMatch` `Card` 그리드: 회사/직무/기술스택 `Badge`/매칭 점수. 매칭 점수 높은 순 정렬
- 카드마다 "지원 준비하기" `Button` → 클릭 시:
  - 해당 JD(`jdMatchId`)에 이미 브랜치가 있으면 base 버전 선택 없이 바로 그 브랜치로 이동
  - 없으면 base 버전 선택 모달(현재 이력서 버전 목록 중 선택) → 확정 시 `branchAdapter.createOrGetBranch()` 호출 후 새 브랜치로 이동

### 브랜치 목록/상세 (`/branches`, `/branches/:id`)
- 목록: 상태 필터(진행중/지원완료/마감) + `Badge`로 상태 표시. 카드 클릭 시 상세로 이동
- 상세: 브랜치가 겨냥한 JD 정보 + 버전 이력(각 버전의 `ScoreDelta`로 개선도 표시) + "첨삭하기/피드백 받기" `Button`
- 버튼 클릭 시 `GapAnalysisResult`를 조회하거나(이미 있으면) mock으로 즉시 생성하고, 같은 화면 하단에 갭 분석 목록 + RAG 첨삭 피드백 섹션을 표시한다.
- 로드맵 체크리스트의 "갭분석/첨삭 결과 표시 화면"은 별도 라우트가 아니라 이 브랜치 상세 화면 안의 독립된 컴포넌트(`GapAnalysisSection` 등)로 구현한다 — PRD 4.1이 "첨삭하기/피드백 받기" 버튼과 그 결과를 브랜치 화면에 두도록 명시하고 있기 때문이다.

## 에러 처리 & 검증

- mock 어댑터 호출마다 인위적 지연(200~400ms)을 주어 네트워크 호출을 흉내내고, 화면에 로딩 상태(스켈레톤 또는 스피너)를 표시한다. 이후 실제 API 연동 시에도 동일한 로딩 UX가 자연스럽게 이어지도록 하기 위함이다.
- 데이터가 비어 있는 상태(예: 아직 브랜치가 하나도 없음)는 `EmptyState` 컴포넌트로 처리한다.
- 이 Phase는 mock 화면 전용이므로 별도 자동화 테스트보다 수동 클릭 시연(완료 기준 충족 여부)으로 검증한다. `mockStore.ts`의 localStorage 직렬화/역직렬화처럼 순수 함수화 가능한 로직은 단위 테스트 후보로 남겨두되, 구현 중 필요성이 크면 추가한다.

## 완료 기준

[docs/ROADMAP.md](../../ROADMAP.md) Phase 2 완료 기준과 동일: 백엔드 연동 없이, mock 데이터로 채워진 전체 플로우(로그인 → 이력서 관리 → JD 매칭 → 브랜치 → 첨삭 결과)를 처음부터 끝까지 클릭으로 시연할 수 있다.
