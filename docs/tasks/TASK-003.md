# Task 003: /login 페이지 카카오 소셜 전용 로그인 및 보라색 그라데이션 배경 구현

## 개요
- **목표**: /login 페이지를 카카오 소셜 로그인 전용(서비스 로고 + 카카오 로그인 버튼)으로 개편하고, 배경 하단에 레퍼런스 스타일의 보라색 그라데이션 앰비언트 글로우 효과를 적용한다.
- **관련 Phase**: Phase 2 (UI/UX 틀 잡기), Phase 3 (인증)
- **관련 PRD 섹션**: 6번(인증), 4.1(화면 요구사항)
- **선행 Task**: Task 002 (디자인 시스템 전면 리뉴얼)

## 세부 작업
- [x] /login 페이지(`LoginPage.tsx`)에서 이메일/비밀번호 폼 및 회원가입 링크 제거
- [x] 서비스 로고(LogoSymbol + Job Hunter 워드마크) 및 카카오 소셜 로그인 버튼 구현
- [x] /login 페이지 배경 하단 보라색 그라데이션 앰비언트 글로우(Mixpanel 스타일) 레이어 적용
- [x] 개발 체크리스트(`oxlint`, `npm run format:check`, `npm run build`) 통과 및 브라우저 검증

## 완료 기준
/login 페이지 접속 시 서비스 로고와 카카오 로그인 버튼만 표시되며, 클릭 시 로그인 처리가 완료되고, 배경 하단에 보라색 그라데이션 효과가 렌더링된다.

## 검증
- [x] 브라우저에서 /login 페이지 접속하여 로고 및 카카오 로그인 버튼 인터랙션 확인
- [x] 개발 체크리스트(oxlint / format:check / build) 통과

## 관련 파일
- `frontend/src/routes/LoginPage.tsx`
- `frontend/src/components/Header.tsx`
- `frontend/src/components/icons/index.tsx`
- `frontend/src/App.tsx`
- `docs/tasks/TASK-003.md`
