# Task 002: 디자인 시스템 전면 리뉴얼

## 개요
- **목표**: Task 001에서 만든 mock 화면이 "AI가 만든 티"가 나는 문제(웹폰트 미지정, elevation 토큰 미사용, spacing·radius·font-size 하드코딩, Vite 템플릿 컨테이너 잔재 등)를 근본 원인부터 해결하고, 토큰 이탈이 문법적으로 불가능한 구조로 재설계한다.
- **관련 Phase**: Phase 2 (UI/UX 틀 잡기)
- **관련 PRD 섹션**: 3.2, 3.3, 4.1 (화면 요구사항 전반)
- **선행 Task**: Task 001 (mock 데이터 기반 서비스 플로우 구현)
- **관련 이슈**: [#8 refactor: UI 디자인 전면 리뉴얼 및 디자인 시스템 재정비](https://github.com/zie-ning/Job-Hunter/issues/8)

## 결정 변경: "새 의존성 미도입" → Tailwind v4 도입

Task 001 착수 시점에는 "Tailwind나 CSS Modules 같은 새 의존성을 추가하지 않고, `index.css`의 CSS 커스텀 프로퍼티 패턴을 그대로 확장한다"고 결정했었다. 이번 Task에서 이 결정을 뒤집었다.

> **뒤집은 근거**: 무의존성 플레인 CSS는 토큰 이탈을 막을 문법적 장치가 없었고, 실제로 `components.css` 915줄에 px·hex 값이 하드코딩되며 무너졌다(웹폰트 미지정, elevation 토큰 정의만 되고 사용처 0건, radius 6종·font-size 5단계 난립, Vite 템플릿 컨테이너 잔재 등). Tailwind v4로 전환해 `frontend/src/styles/theme.css`의 `@theme` 블록에서 `--color-*`/`--font-*`/`--radius-*`/`--shadow-*` 기본 팔레트를 `initial`로 지우고 프로젝트 토큰만 남기는 방식을 택했다 — 설정이 CSS 안에 있어 토큰이 단일 소스로 유지되고, 유틸리티 클래스가 거기서 파생되므로 "무의존성"보다 "토큰 단일화 + 이탈 불가"가 이 프로젝트가 실제로 겪은 문제에 대한 해답이었다.

자세한 토큰 값·컴포넌트 카탈로그·금지 규칙은 [docs/DESIGN.md](../DESIGN.md) 참고.

## 세부 작업
- [x] 디자인 방향 확정 (프리뷰 3안 비교 후 선택) — 브랜치 목록 화면을 소재로 자기완결 HTML 3안(Soft Periwinkle/Editorial Console/Deep Slate)을 만들어 라이트·다크 양쪽을 실제 렌더링해 비교. "무드는 A, 컴포넌트 구조는 C"로 조합한 D안(Periwinkle Console)으로 확정
- [x] Tailwind v4 도입 + 기본 팔레트 제거로 디자인 토큰 단일화
- [x] Pretendard 셀프호스팅 + 디스플레이 서체 적용 — Pretendard Variable(약 2.0MB) + Plus Jakarta Sans Bold(약 27KB) woff2를 `frontend/public/fonts/`에 자체 호스팅, `tabular-nums`로 숫자 정렬, 로고 워드마크를 SVG `<text>` 대신 실제 웹폰트로 렌더링하도록 분리
- [x] 앱 셸/컨테이너 폭 체계 재구성 — Vite 템플릿 잔재(`#root`의 `width:1126px`/`text-align:center`) 제거, 컨테이너 3종(`--container-auth`/`app`/`wide`) 도입, 배경 분위기 레이어를 `body::before` 한 곳으로 통합
- [x] 공통 컴포넌트 재설계 — Button/Card/Badge/Field 계열을 Tailwind로 재작성하고 `Modal`/`Skeleton`/`Spinner`/`components/icons/`를 신설해 3중 복붙 모달과 산재한 인라인 SVG, `불러오는 중...` 텍스트 로딩 상태를 제거
- [x] `/design` 플레이그라운드 페이지 — `import.meta.env.DEV`에서만 마운트. 색 토큰·타입 스케일·spacing/radius/elevation·모션·모든 컴포넌트의 variant/상태를 한 페이지에서 스크린샷 1장으로 검증 가능
- [x] 로그인/회원가입/브랜치 목록·상세/JD 매칭/공고 달력/버전 상세 7개 라우트를 새 디자인 시스템으로 재단 — 라이트·다크·1440px·375px 전 조합과 실제 인터랙션(로그인, 브랜치 생성/저장, 갭분석 요청, fork 모달, 캘린더 이벤트 클릭)을 playwright로 확인
- [x] 모션 레이어 — 리스트 진입 stagger reveal(`--animate-fade-up`), 카드 hover lift, 스켈레톤 shimmer(`--animate-shimmer`), 모달 fade+scale. 전부 `motion-reduce:` 짝을 붙여 `prefers-reduced-motion` 대응 확인
- [x] `docs/DESIGN.md` 작성 — 디자인 원칙(AI 티 방지 규칙 7개)·토큰 레퍼런스·컴포넌트 카탈로그·레이아웃 규칙·금지 규칙·신규 화면 체크리스트를 `theme.css`와 1:1 대응시켜 문서화

## 완료 기준
7개 라우트 전부가 새 디자인 시스템(Tailwind 토큰, 셀프호스팅 폰트, elevation 기반 카드, 모션 레이어)으로 렌더링되고, 라이트/다크·데스크톱/모바일 전 조합에서 시각적 결함이나 콘솔 에러 없이 동작하며, `docs/DESIGN.md`만으로 이후 새 화면을 일관되게 작성할 수 있다.

## 검증
[docs/DESIGN.md](../DESIGN.md)와 [PR #9](https://github.com/zie-ning/Job-Hunter/pull/9) 본문에 라이트/다크/1440px/375px 스크린샷 기반 검증 근거와 lint/build 결과가 이미 상세히 기록되어 있어 중복 서술하지 않는다.

## 관련 파일
- `frontend/src/styles/theme.css`, `frontend/src/styles/fonts.css`, `frontend/src/index.css`
- `frontend/src/components/` — Button, Card, Badge, Field, Modal, Skeleton, Spinner, icons/
- `frontend/src/routes/DesignPlaygroundPage.tsx`
- `docs/DESIGN.md`

**관련 PR**: #9
