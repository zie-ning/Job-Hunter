# Task 001: mock 데이터 기반 서비스 플로우 구현

## 개요
- **목표**: 실제 백엔드 연동 없이, 서비스의 전체 사용자 플로우(로그인 → 이력서 관리 → JD 매칭 → 브랜치 → 첨삭 결과)를 mock 데이터로 클릭만으로 시연할 수 있는 화면 틀을 만든다.
- **관련 Phase**: Phase 2 (UI/UX 틀 잡기)
- **관련 PRD 섹션**: 3.2(이력서 버전 관리 흐름), 3.3(JD별 브랜치 흐름), 4.1(기능 명세 — 화면 요구사항 전반)
- **선행 Task**: 없음 (Phase 1 배포 파이프라인 완료 후 착수)

## 배경 및 핵심 설계 원칙

화면 컴포넌트는 데이터 소스를 어댑터(인터페이스 + mock 구현체) 뒤로 감춰 두어서, 이후 Phase들이 화면을 다시 만들지 않고 mock 구현체를 실제 API 호출로 교체하기만 하면 되도록 한다. 예: `ResumeAdapter.getVersions(): Promise<ResumeVersion[]>` — 지금은 `mockResumeAdapter`가 localStorage 래퍼(`mockStore.ts`)를 읽고 쓰지만, 이후 Phase(4, 8, 11~14)에서 이 구현체만 실제 `fetch` 기반 어댑터로 교체하면 되고 화면 컴포넌트는 변경할 필요가 없다. 이 원칙은 지금도 유효한 아키텍처 기준이다.

**mock 데이터 지속성**: localStorage에 지속한다. 새로고침하거나 탭을 닫았다 열어도 로그인 상태, 이력서 버전, 브랜치 등이 유지되어 면접관이나 사용자가 실제 서비스처럼 체험할 수 있다. 앱 최초 로드 시 localStorage가 비어 있으면 자동으로 시드 데이터를 채워, 별도 입력 없이 로그인만 하면 전체 플로우를 바로 시연할 수 있다.

> **참고**: 착수 시점의 원래 설계(데이터 모델·화면별 상세)는 구현 과정에서 크게 진화했다 — 특히 브랜치는 단일 타입에서 범용/공고 두 종류로 분리됐고, 공고 달력 화면이 새로 추가됐다. 최종 데이터 모델과 화면 스펙은 이 문서가 아니라 [docs/PRD.md](../PRD.md) 3.3·4.1을 기준으로 삼는다 — 이 문서는 착수 배경과 세부 작업 이력만 담는다.

## 세부 작업
- [x] 라우팅/레이아웃 구조 설계 (페이지 라우트, 공통 헤더/네비게이션)
- [x] 디자인 시스템 기초 (버튼/카드/폼/배지 등 공통 컴포넌트)
- [x] 데이터 어댑터 인터페이스 정의 (화면이 의존하는 타입 + mock 구현체, 이후 실제 API 구현체로 교체 가능한 구조)
- [x] 로그인/회원가입 화면 (mock)
- [x] 이력서 업로드/에디터 + 버전 목록/diff 화면 (mock)
- [x] JD 매칭 리스트 화면 (mock)
- [x] JD별 브랜치 목록/상세 화면 — 상태 필터, 개선도 표시 (mock)
- [x] 갭분석/첨삭 결과 표시 화면 (mock)
- [x] 서비스 로고/브랜딩 적용 (헤더, 파비콘)
- [x] 브랜치 목록 화면을 범용 브랜치(가로 스크롤, 기본 브랜치 고정)/공고 브랜치(검색·정렬·상태 필터) 두 섹션으로 재설계
- [x] 공고 브랜치 상세 화면을 갭분석·첨삭 히스토리 패널 + 공고 메타정보 + 편집기 + 커밋 로그 레이아웃으로 고도화, 상태 변경 UI 포함
- [x] 공고 달력 화면 신규 추가 (매칭 마감일 표시, 클릭 시 해당 브랜치로 이동)
- [x] 브랜치 생성 3갈래(지원 준비하기/범용 브랜치 새로 만들기/공고 브랜치 새로 만들기) 흐름 mock 구현

## 완료 기준
백엔드 연동 없이, mock 데이터로 채워진 전체 플로우(로그인 → 이력서 관리 → JD 매칭 → 브랜치 → 첨삭 결과)를 처음부터 끝까지 클릭으로 시연할 수 있다.

## 검증
- [x] 수동 클릭 시연으로 전체 플로우 확인 (mock 화면 전용이라 별도 자동화 테스트 대신 완료 기준 충족 여부로 검증)
- [x] `CLAUDE.md` 개발 체크리스트(oxlint/format/build) 통과

## 관련 파일
- `frontend/src/routes/` — LoginPage, SignupPage, MatchesPage, BranchesPage, BranchDetailPage, CalendarPage, BranchVersionDetailPage
- `frontend/src/adapters/` — types.ts, mockStore.ts, authAdapter.ts, resumeAdapter.ts, matchAdapter.ts, branchAdapter.ts
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/App.tsx`, `frontend/src/layout/AppLayout.tsx`

**관련 PR**: #6, #7
