# 디자인 시스템

이 문서는 프론트엔드 UI를 새로 작성하거나 수정할 때 참고하는 단일 기준이다. 목표는 "이 문서만 읽고도 기존 화면과 일관된 새 화면을 만들 수 있는가"이다.

관련 이슈: [#8 refactor: UI 디자인 전면 리뉴얼 및 디자인 시스템 재정비](https://github.com/zie-ning/Job-Hunter/issues/8)

---

## 1. 디자인 원칙

### 배경

Phase 2에서 만든 초기 화면은 웹폰트 미지정, elevation 토큰 미사용(정의만 있고 사용처 0건), spacing·radius·font-size 하드코딩(radius 6종, font-size 11~15px 5단계), Vite 템플릿 컨테이너 잔재(`#root`의 `width:1126px`) 등으로 "AI가 만든 티"가 나는 상태였다. 근본 원인은 토큰 규칙이 설계 문서에만 있고 이를 강제하는 장치가 없었다는 것이다.

### 방향 선택 과정

frontend-slides 스킬의 "Show, Don't Tell" 방식으로 브랜치 목록 화면(`/branches`)을 소재로 자기완결 HTML 프리뷰를 만들어 비교했다.

- **A. Soft Periwinkle** — 사용자가 첨부한 레퍼런스에 충실. 연보라 배경 bloom, 흰 카드 + 다층 섀도 elevation, 필(pill) 형태 컴포넌트
- **B. Editorial Console** — 따뜻한 종이 지면 + 세리프 제목 + 모노스페이스 수치. 그라데이션 0개로 레퍼런스와 가장 먼 방향
- **C. Deep Slate** — 다크 우선. conic-gradient 링 게이지, 세그먼트 필터, 도트 그리드 텍스처

세 안 모두 라이트/다크 변형을 브라우저에서 실제 렌더링해 비교한 결과, **"전체적인 느낌은 A, 컴포넌트 구조와 형식은 C"** 조합(D. Periwinkle Console)으로 확정했다.

**A에서 가져온 것 (무드)**: 배경 밖에서 번져 들어오는 연보라 bloom, 흰 카드 + 그림자 기반 elevation(테두리 아님), 바이올렛 액센트(`#6b5ce7`), Pretendard + Plus Jakarta Sans 폰트 조합

**C에서 가져온 것 (컴포넌트 구조)**:
- 카드는 세로로 쌓인 블록이 아니라 **가로 flex 행**(좌측 텍스트 + 우측 데이터 시각화)
- 점수는 큰 숫자가 아니라 **conic-gradient 링 게이지**
- 상태 필터는 낱개 pill 버튼이 아니라 **하나의 테두리 컨테이너 안에서 눌리는 세그먼트 컨트롤**
- 배지·태그·인풋은 필(pill)이 아니라 **각진 사각형**(radius 5~7px)
- 수치(날짜·버전·점수)는 **모노스페이스 + tabular-nums**

### 조합 과정에서 내린 설계 판단

1. **링 게이지 색상**: C 원안은 "고득점=민트, 그 외=바이올렛" 2액센트 구조였다. 새 색을 추가하는 대신 A에 이미 존재하는 `--positive`(청록)와 `--accent`(바이올렛)를 그대로 이 역할에 매핑했다 — 팔레트를 늘리지 않고 C의 구조적 의도만 가져오기 위함이다.
2. **Elevation 기법**: C 원안은 다크 표면에서 위쪽 광원을 표현하는 `inset top-light`를 썼지만, 라이트 배경에서는 이 기법이 잘 드러나지 않아 A의 그림자 elevation 사다리(`--e1`~`--e3`)를 그대로 채택했다.

### 프리뷰 제작 중 발견해 적용한 교정 2건

1. **한글 + 라틴 모노스페이스 폰트 조합 버그**: 라벨·배지·버튼에 JetBrains Mono/IBM Plex Mono를 한글 텍스트에 적용하면 한글 완성형 글리프가 없어 자모가 분해되어 깨진다("로그아웃" → "ㄹㄱㅇㅇ"). **→ 금지 규칙 #6 참고.**
2. **WCAG 대비 미달**: 눈대중으로 정한 `--text-muted` 계열이 실측 결과 라이트 2.7~3.0:1, 다크 3.5~4.2:1로 4.5:1 기준에 미달했다. 특히 다크 우선으로 설계한 값을 라이트로 단순 반전하면 대비가 무너지는 함정이 있었다. 모든 muted 텍스트 토큰은 실제 배경색 대비 4.5:1 이상을 계산으로 확인 후 확정했다 (아래 §2 토큰값 참고).

### 하지 말 것 (AI 티 방지 규칙)

1. 그라데이션을 버튼/카드의 **fill로 쓰지 않는다** — 배경 분위기 레이어 전용
2. 시스템 폰트(`system-ui`)를 그대로 쓰지 않는다 — Pretendard + Plus Jakarta Sans 셀프호스팅 필수
3. `#6366f1` 계열 제네릭 인디고, 순백 배경 + 보라 그라데이션의 timid한 조합 지양
4. 카드 계층을 테두리만으로 표현하지 않는다 — elevation 사다리 사용
5. 모든 텍스트/UI 요소를 중앙 정렬하지 않는다
6. **한글 텍스트에 모노스페이스 폰트를 적용하지 않는다** — 라틴·숫자 전용
7. 색 토큰은 반드시 실제 배경 대비 4.5:1 이상 확인 후 확정한다 (WCAG AA)

---

## 2. 토큰 레퍼런스

아래는 Step 0에서 확정된 D안의 원시값이며, `frontend/src/styles/theme.css`의 `@theme` 블록과 1:1 대응한다. 값을 바꿀 때는 두 곳을 함께 갱신한다.

### 색상 (라이트)

| 토큰 | 값 | 용도 | 대비(배경 대비) |
|---|---|---|---|
| `--bg` | `#fbfafd` | 페이지 배경 | — |
| `--surface` | `#ffffff` | 카드/입력 배경 | — |
| `--surface-sunken` | `#f4f2f9` | 태그/보조 배경 | — |
| `--text` | `#57536b` | 본문 | 7.36:1 (on 흰 카드) |
| `--text-strong` | `#16132b` | 제목/강조 | — |
| `--text-muted` | `#77738d` | 보조 텍스트 | 4.54:1 (on 흰 카드) |
| `--hairline` | `#e7e5ee` | 카드 테두리 | — |
| `--accent` | `#6b5ce7` | 브랜드/기본 액션/링 게이지(일반) | — |
| `--accent-hover` | `#5a4bd4` | 액센트 hover | — |
| `--positive` | `#0f7a5f` | 상승/지원완료/링 게이지(고득점) | — |
| `--warning` | `#9a5b06` | 진행중/마감 임박 | — |
| `--neutral` | `#6f6b82` | 마감/비활성 | — |

### 색상 (다크 — `prefers-color-scheme: dark`)

| 토큰 | 값 | 대비 |
|---|---|---|
| `--bg` | `#0f0e17` | — |
| `--surface` | `#181725` | — |
| `--text` | `#a09cb8` | 7.12:1 |
| `--text-strong` | `#f2f0f9` | — |
| `--text-muted` | `#8681a0` | 4.95:1 (on surface) |
| `--accent` | `#a99bff` | — |
| `--positive` | `#4ecfa4` | — |

### Elevation

| 토큰 | 값 |
|---|---|
| `--e1` | `0 1px 2px rgba(22,19,43,.04), 0 1px 3px rgba(22,19,43,.03)` |
| `--e2` | `0 1px 2px rgba(22,19,43,.04), 0 8px 24px -10px rgba(22,19,43,.14)` |
| `--e3` | `0 2px 4px rgba(22,19,43,.05), 0 16px 40px -12px rgba(22,19,43,.2)` |

### Radius

| 토큰 | 값 | 비고 |
|---|---|---|
| `--r-sm` | `7px` | 버튼/인풋/필터 |
| `--r-md` | `11px` | 범용 브랜치 카드 |
| `--r-lg` | `15px` | 공고 브랜치 카드 |

C 구조 채택에 따라 pill(999px) 대신 각진 스케일을 쓴다.

### 타이포그래피

| 토큰 | 값 | 용도 |
|---|---|---|
| `--font-sans` | Pretendard Variable | 본문, 한글 UI 텍스트 전반 |
| `--font-display` | Plus Jakarta Sans | 제목, 브랜드 워드마크(라틴 전용 — 한글에는 Pretendard로 자동 폴백) |
| `--font-mono` | 시스템 모노스페이스 폴백만 (자체 호스팅 안 함) | 숫자 정렬은 `--font-sans` + `tabular-nums`로 구현 |

**폰트 셀프호스팅 (Step 2 실측 결과)**:
- `PretendardVariable.woff2` — 2,057,688 bytes(약 2.0MB). 출처: jsDelivr(npm `pretendard@1.3.9`, 원저작자 공식 배포). 가변폭 1개 파일로 굵기 45~920 전체 커버
- `PlusJakartaSans-Bold.woff2` — 27,348 bytes(약 27KB). 출처: Google Fonts, latin subset. 700/800 두 굵기를 요청했으나 동일 정적 파일로 귀결되어 파일 1개만 사용(`font-weight: 700 800`으로 매핑)
- D안 프리뷰가 썼던 IBM Plex Mono는 **셀프호스팅하지 않는다** — Step 2에서 승인받은 다운로드 범위는 Pretendard·Plus Jakarta Sans 2개뿐이었고, 원래 계획도 숫자 정렬을 별도 웹폰트가 아니라 `font-variant-numeric: tabular-nums`로 구현하도록 되어 있었다. `--font-mono`는 순수 시스템 폴백 스택으로만 유지한다
- 두 파일 모두 `frontend/public/fonts/`에 위치하며 `index.html`에서 Pretendard만 `<link rel="preload">` — 실제 쓰임이 큰 폰트만 우선 로드해 FOUT을 최소화한다

### 모션 (Step 7)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | 진입 계열 애니메이션의 공통 이징 |
| `--animate-fade-in` | `fade-in 0.15s ease-out both` | 모달 오버레이, 피드백 flyout 패널 진입 |
| `--animate-fade-scale` | `fade-scale 0.18s var(--ease-out-expo) both` | 모달 콘텐츠 진입(fade + scale) |
| `--animate-fade-up` | `fade-up 0.4s var(--ease-out-expo) both` | 리스트 항목 stagger reveal(아래에서 살짝 떠오르며 등장) |
| `--animate-shimmer` | `shimmer 1.6s ease-in-out infinite` | `Skeleton`의 좌우 하이라이트 스침 |

**리스트 stagger reveal**: 항목별 진입 지연(`animation-delay`)은 인덱스에 따라 달라지는 동적 값이라 Tailwind 클래스로 표현할 수 없다 — `ScoreGauge`의 `conic-gradient`와 동일한 예외로, `index * 40`ms를 `style={{ animationDelay }}`로 전달하고 `animate-fade-up`과 함께 쓴다(`BranchesPage`/`MatchesPage` 참고). 40ms 간격은 카드 6~8개 기준 마지막 항목이 300ms 안팎에 들어오도록 잡은 값이다 — 리스트가 훨씬 길어지면 간격을 줄이는 것을 고려한다.

**카드 hover lift**: 클릭 가능한 카드(브랜치 목록의 두 카드 유형)는 `hover:shadow-e2`(elevation 상승)에 `hover:-translate-y-0.5`(2px 부상)를 함께 준다 — 그림자만으로는 피드백이 약해 실제로 뜨는 느낌을 더한다. 카드 내부에 자체 인터랙션(버튼)이 있는 경우(`MatchesPage`의 매칭 카드)는 카드 전체 lift를 주지 않는다 — 버튼 자체의 hover와 겹쳐 이중 피드백이 되는 것을 피한다.

**`prefers-reduced-motion` 대응 필수**: 새로 추가하는 모든 `animate-*`/`hover:-translate-y-*`에는 반드시 `motion-reduce:animate-none` 또는 `motion-reduce:hover:translate-y-0`을 짝지어 붙인다. `Button`이 이 패턴의 기준 예시다.

---

## 3. 컴포넌트 카탈로그

모든 컴포넌트는 Tailwind 유틸리티로 직접 스타일링한다. 단, 특정 클래스명이 여러 컴포넌트/페이지에 걸친 구조적 훅으로 쓰이는 경우(`card`, `field`, `modal-overlay`, `modal-content`) 해당 클래스명은 자체 스타일 없이 훅으로만 유지한다 — 각 컴포넌트 파일 상단 주석에 근거를 남겼다. Step 6(페이지 재단)가 모두 끝난 지금도 이 훅들은 임시가 아니라 계속 남는 구조다(아래 "알려진 예외" 참고).

| 컴포넌트 | variant / size | 비고 |
|---|---|---|
| `Button` | variant: primary/secondary/ghost/danger · size: sm/md/lg | `isLoading`이 라벨을 지우지 않고 `Spinner`를 라벨 앞에 표시(예전엔 `"처리 중..."`으로 교체해 레이아웃이 흔들렸음). `icon` 슬롯 지원 |
| `Card` / `CardHeader` / `CardFooter` | padding: none/sm/md · elevation: flat/raised | `"card"`는 구조적 훅(위 참고) |
| `Badge` | tone: positive/warning/danger/neutral · size: sm/md | C안 구조에 따라 필(pill) 대신 각진 사각형(`rounded-sm`) |
| `Field` (공통) + `TextField`/`Textarea`/`Select` | — | `useId()`로 id 생성 — 예전엔 `id ?? label` 폴백으로 한글 label 문자열이 그대로 DOM id가 되는 버그가 있었다. `helperText`/`error`/`required` 지원. `Select`는 `appearance-none` + `ChevronDownIcon` 커스텀 화살표 |
| `Modal` | `wide?: boolean` | `ForkPickerModal`/`NewBranchModal`/`NewJdBranchModal`의 3중 복붙 제거. focus trap(Tab 순환) + Escape 닫기 + body 스크롤 락 + fade/scale 진입 애니메이션(`--animate-fade-scale`, `motion-reduce:animate-none`) |
| `Skeleton` | — | `불러오는 중...` 텍스트 4곳(MatchesPage/BranchesPage/BranchDetailPage/BranchVersionDetailPage) 전부 교체 완료. 좌우로 스치는 shimmer(`--animate-shimmer` + `.skeleton-shimmer-bg` 그라디언트 훅) |
| `Spinner` | `size?` | Button의 `isLoading`, 필요 시 단독 사용 |
| `components/icons/` | `ChevronDownIcon`/`GearIcon`/`GapAnalysisIcon`/`ReviewIcon`/`CloseIcon`/`ScoreUpIcon`/`ScoreDownIcon`/`ScoreFlatIcon` | 5개 컴포넌트에 흩어져 있던 인라인 SVG를 통합, `stroke-width` 1.6~1.8 제각각이던 걸 1.75로 통일 |
| `EmptyState` | `icon?` 슬롯 | |
| `ScoreDelta` | — | `tabular-nums` + 방향 아이콘(`ScoreUpIcon` 등) |
| `DiffView` | — | 좌측에 구/신 라인 번호 2열 추가 |

### 알려진 예외 — 페이지 레벨 CSS 훅

Step 6(페이지 재단) 완료 후 확정된 상태 — 아래 두 가지는 임시가 아니라 계속 유지되는 구조적 훅이다.

- `"field"` — 모달 계열은 아직 Tailwind로 옮기지 않았다: `NewJdBranchModal`의 `.jd-import-row .field`가 레이아웃(flex-basis)을 조정한다. `BranchesPage` 등 Step 6에서 재단된 페이지는 이제 이 훅을 쓰지 않고 `TextField`/`Select`의 `className` prop으로 직접 레이아웃을 지정한다
- `"card"` — `BranchDetailPage`(공고 브랜치 상세)의 `.branch-main .card`가 패딩을 제거해 오버라이드한다. 이 카드는 내부에서 상단 메타정보 섹션과 편집기 섹션을 시각적으로 하나의 연속된 면처럼 이어붙이는 레이아웃이라 기본 카드 패딩과 충돌한다 — 구조적으로 계속 필요하다(`.auth-page .card`는 LoginPage/SignupPage 재단으로 이미 제거됨)
- `"modal-overlay"`/`"modal-content"` — `.modal-content > form`, `.modal-content form`, `.modal-content > .fork-picker`, `.jd-import-row`, `.modal-divider-label` 등 모달 내부 폼 레이아웃이 이 이름을 훅으로 계속 사용한다. `Modal` 컴포넌트 자체의 배경·테두리·radius·모션은 전부 Tailwind로 직접 적용되어 있다

## 4. 레이아웃 규칙

### 컨테이너 3종

| 토큰 | 값 | 적용 대상 |
|---|---|---|
| `--container-auth` | 416px | 로그인/회원가입 (`LoginPage`/`SignupPage`의 `Card` `max-w-(--container-auth)`) |
| `--container-app` | 960px | `.app-main` — 대부분의 페이지가 이 기본값을 그대로 상속 |
| `--container-wide` | 1152px | 공고 브랜치 상세(JD 레이아웃)의 목표 폭 — 현재는 아직 직접 연결되지 않음(아래 참고) |

### 루트 font-size는 16px — rem 토큰의 기준

작업 중 실측으로 발견한 버그: 예전 `:root`에 `font: 18px/145% var(--sans)`가 있어 브라우저 루트 font-size가 18px이었다. `theme.css`의 `--container-*`/`--text-*` 등 rem 기반 토큰은 전부 "1rem = 16px"를 전제로 만들었기 때문에, 이 상태에서는 `--container-app: 60rem`이 960px가 아니라 1080px(60×18)로 조용히 렌더링되고 있었다 — 실제로 `.app-main`의 렌더링 폭을 재서 발견했다. 본문을 18px로 보여주려던 원래 의도는 유지하되, 이제는 `body`의 `font-size: 1.125rem`(16px 기준 18px)로 옮기고 `html` 루트는 표준 16px로 되돌렸다. `rem`을 쓰는 곳이 index.css/components.css에는 이 두 줄 외에 없었어서(레거시 스타일은 전부 px) 영향 범위가 딱 이 버그에 한정됐다.

### 배경 분위기 레이어 — `body::before` 한 곳뿐

`index.css`의 `body::before`가 앱 전체에서 배경 bloom을 그리는 유일한 곳이다(`--bloom-1`/`--bloom-2` 토큰, `theme.css`). `position:fixed`라 스크롤과 무관하게 항상 화면에 고정된다. 화면 밖에서 번져 들어오도록 배치해 "그라데이션 배너"처럼 보이지 않게 한다 — 카드·버튼 등 컴포넌트 fill에는 이 토큰을 쓰지 않는다(§1 하지 말 것 1번). `#root`는 `z-index:1`로 이 레이어 위에 뜬다.

### `#root`는 폭을 강제하지 않는다

과거 Vite 템플릿 잔재로 `#root { width: 1126px; text-align: center; border-inline: 1px solid ... }`가 남아 있었다. 이로 인해 `.field`/`.card`/`.diff-view` 등 여러 컴포넌트가 `text-align: left`로 이를 되돌리는 패턴이 반복됐다. `#root`는 이제 `min-height`/`flex` 레이아웃 역할만 하고, 폭은 각 페이지가 자신의 컨테이너로 선언한다. 되돌리기용 `text-align: left`는 모두 제거했다 — 단, `.calendar-event`처럼 `<button>` 요소 자체의 기본 중앙 정렬을 상쇄하기 위한 `text-align: left`는 `#root`와 무관한 정당한 스타일이므로 남겨뒀다.

### 알려진 한계 — 공고 브랜치 상세의 와이드 레이아웃

공고 브랜치 상세(`.branch-detail-jd-layout`)는 겨냥 JD 정보 레일과 본문이 나란히 붙어 `--container-app`보다 넓은 공간이 필요하다. 이 페이지가 렌더링하는 레이아웃(범용 vs 공고 브랜치)은 mock 데이터로 렌더 시점에 결정되므로, 앱 셸(`AppLayout`)이 라우트 경로만으로는 미리 알 수 없다 — 즉 셸 레벨에서 "이 라우트는 wide 컨테이너"라고 미리 지정할 수 없다.

그래서 현재는 뷰포트 기준 풀블리드 기법(`width: 100vw; margin-left/right: calc(50% - 50vw)`)을 그대로 쓴다. `--container-wide`로 상한을 씌우는 시도를 해봤으나, `margin-left`/`margin-right`가 둘 다 고정값인 상태에서 `width`만 캡으로 줄이면 CSS 과제약(over-constrained) 규칙에 따라 `margin-right`가 무시되고 재계산되어 **초광폭 화면에서 콘텐츠가 왼쪽으로 쏠리는 회귀**가 생긴다(1600px 뷰포트·1152px 캡 기준 계산으로 확인: 우측에 448px가 몰림). 무리하게 지금 봉합하기보다, Step 6에서 페이지가 이 컨테이너를 직접 제어하는 구조로 재설계할 때 함께 해결한다.

### (해결됨) `<h1>`/`<h2>` 태그와 Tailwind 유틸리티 충돌

Step 6 진행 중에는 `index.css`에 `h1, h2 { font-family: var(--heading); font-weight: 500; color: var(--text-h); }` + `h1{font-size:56px;...}` + `h2{font-size:24px;...}` 블랭킷 규칙이 남아 있었다. 이 규칙은 언레이어드 plain CSS라 Tailwind 유틸리티 클래스(`text-3xl`, `font-bold` 등)를 **명시도와 무관하게** 이겨버렸다 — `/design` 페이지 제작 중 `<h1 className="text-text-strong text-3xl font-bold">`가 옛 스타일 그대로 나오는 것으로 발견했다.

**시도했지만 실패한 방법**: 이 규칙을 `@layer legacy { ... }`로 감싸 우선순위를 낮추면 Tailwind 유틸리티가 이길 것이라 예상했으나, Tailwind Preflight 자체가 이미 `h1,h2{font-size:inherit;font-weight:inherit}` 리셋을 `base` 레이어에 깔아두고 있어서, 레이어로 감싸는 즉시 **Tailwind 유틸리티를 전혀 쓰지 않는 미전환 페이지에서도** 제목이 `body` 상속값(18px)으로 무너지는 회귀가 실제로 발생했다(로그인 화면에서 확인 후 되돌림).

**채택한 해결책**: 과도기 동안 Tailwind 타이포그래피가 필요한 화면은 `<h1>`/`<h2>` 태그 대신 `<div role="heading" aria-level={1|2}>`를 썼다. 접근성 트리에는 실제 heading과 동일하게 노출되면서, 레거시 태그 선택자와 아예 충돌하지 않는다.

**Step 6 전체 페이지 전환 완료 후**: 앱 전체에서 `<h1>`/`<h2>` 태그를 쓰는 곳이 0건이 되어, `index.css`의 레거시 블랭킷 규칙과 `--heading` 변수를 완전히 삭제했다(더 이상 충돌할 대상 자체가 없다). `<div role="heading" aria-level={n}>` 패턴은 실제 태그로 되돌리지 않고 그대로 유지한다 — 지금 와서 일부만 되돌리면 두 가지 패턴이 혼재해 오히려 일관성이 떨어지고, 되돌릴 기능적 실익도 없다(접근성 트리 노출은 이미 동일). **새 화면도 이 패턴을 계속 쓴다.**

## 5. 금지 규칙

§1의 "하지 말 것" 참고. 추가 규칙:

- Tailwind 대괄호 이스케이프(`p-[13px]`) 금지 — 필요하면 `theme.css`에 토큰 추가
- 인라인 `style` 속성 금지 (동적 값 예외: `ScoreGauge`의 `conic-gradient`/`mask`, 리스트 stagger의 `animationDelay`처럼 인스턴스마다 달라지는 값이라 Tailwind 클래스로 표현 자체가 불가능한 경우만. 정적으로 표현 가능한 값을 인라인 style로 쓰는 것은 여전히 금지)
- `theme.css` 밖에서 리터럴 색상값/px 값 선언 금지
- `!important` 금지
- 제목은 `<h1>`/`<h2>` 대신 `<div role="heading" aria-level={n}>` 사용 (§4 "(해결됨)" 항목 참고 — 원래는 레거시 CSS와의 충돌을 피하기 위한 과도기 조치였으나, 그 레거시 규칙 자체를 삭제한 뒤에도 일관성을 위해 계속 이 패턴을 표준으로 쓴다)

## 6. 신규 화면 체크리스트

새 페이지·컴포넌트를 만들 때 확인한다.

- [ ] 색상은 `theme.css`의 `--color-*` 토큰(Tailwind `bg-*`/`text-*`/`border-*` 클래스)만 사용했는가 — 리터럴 hex/rgb 없음
- [ ] spacing/폭은 Tailwind 기본 스케일 또는 `--container-*` 토큰만 사용했는가 — `p-[13px]` 같은 대괄호 이스케이프 없음
- [ ] radius는 `rounded-sm`/`rounded-md`/`rounded-lg`(각진 스케일) 중 하나인가 — pill(`rounded-full`)은 원형 요소(게이지·아바타) 전용
- [ ] elevation이 필요하면 `border` 대신 `shadow-e1`/`e2`/`e3`를 썼는가
- [ ] 한글 텍스트에 `font-mono`/모노스페이스를 걸지 않았는가 (§1 금지 규칙 6 — 자모 분해 버그)
- [ ] `<h1>`/`<h2>`에 Tailwind 유틸리티가 필요하면 `role="heading"` div로 작성했는가 (§4/§5 참고)
- [ ] 로딩 상태는 `불러오는 중...` 텍스트가 아니라 `Skeleton`/`Spinner`를 쓰는가
- [ ] 모달이 필요하면 새로 만들지 않고 `Modal` 컴포넌트를 재사용하는가
- [ ] 리스트 진입에 `animate-fade-up` stagger reveal을 적용했는가, 새 `animate-*`/`hover:-translate-y-*`마다 `motion-reduce:` 짝을 붙였는가 (§2 "모션" 참고)
- [ ] `/design` 페이지에 새 컴포넌트의 모든 variant·상태를 추가했는가
- [ ] `npm run lint && npm run format:check && npm run build` 통과했는가
