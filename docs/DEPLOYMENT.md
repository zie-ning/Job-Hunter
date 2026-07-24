# 배포 가이드

이 문서는 로컬 `.env`에 있는 시크릿을 배포 환경(Render, Vercel, GitHub Actions)으로 확장하는 방법을 정리한다. 배포 설정 파일 자체는 [render.yaml](../render.yaml), [frontend/vercel.json](../frontend/vercel.json)을 참고하고, 전체 로드맵 맥락은 [ROADMAP.md](ROADMAP.md) Phase 1을 참고한다.

## 최초 연동 (계정 생성 및 저장소 연결)

계정 생성과 GitHub 저장소 연동은 각 플랫폼 대시보드에서 소유자가 직접 로그인해 수행해야 하는 단계라 자동화 대상이 아니다.

1. **Render**: [render.com](https://render.com)에서 GitHub 계정으로 가입 → "New +" → "Blueprint" → 이 저장소(`zie-ning/Job-Hunter`) 선택 → 저장소 루트의 `render.yaml`을 자동으로 인식해 서비스 생성 화면이 뜬다 → "백엔드 — Render" 표의 시크릿 값을 입력 후 배포.
2. **Vercel**: [vercel.com](https://vercel.com)에서 GitHub 계정으로 가입 → "Add New" → "Project" → 이 저장소 선택 → Root Directory를 `frontend`로 지정(모노레포이므로 필수) → "프론트엔드 — Vercel" 표의 환경변수 입력 후 배포.
3. 이후 `main` 브랜치에 push될 때마다 두 플랫폼 모두 GitHub 연동을 통해 자동으로 재배포한다 (별도 GitHub Actions 배포 스텝 불필요).

## 원칙

- 시크릿 값은 어떤 형태로도 저장소에 커밋하지 않는다. `.env`, `.env.local` 등은 이미 `.gitignore`에 포함되어 있다.
- 각 플랫폼은 자체 환경변수 저장소를 제공하므로, 값은 해당 플랫폼 대시보드에서 직접 입력한다.
- 이 프로젝트는 백엔드(Render)와 프론트엔드(Vercel)가 물리적으로 분리된 SPA 구조이므로, 두 플랫폼의 환경변수는 서로 겹치지 않는다.

## 백엔드 — Render

`render.yaml`의 Blueprint 정의를 기준으로 Render가 서비스를 생성한다. `sync: false`로 표시된 항목은 값이 저장소에 없으므로 Render 대시보드 → 서비스 → **Environment** 탭에서 직접 입력해야 한다.

| 변수 | 값 | 비고 |
|---|---|---|
| `DATABASE_URL` | Supabase connection string | `postgresql+asyncpg://user:password@host:5432/dbname` 형식. Supabase 프로젝트 설정 → Database → Connection string에서 확인 |
| `OPENAI_API_KEY` | OpenAI API 키 | [platform.openai.com](https://platform.openai.com/api-keys)에서 발급 |
| `CORS_ORIGINS` | 프론트엔드 배포 URL 목록 (예: `["https://job-hunter.vercel.app"]`) | Vercel 배포가 먼저 끝나 URL이 확정된 후 입력 |
| `SECRET_KEY` | (자동 생성) | `generateValue: true`로 Render가 자동 생성하므로 별도 입력 불필요 |

## 프론트엔드 — Vercel

Vercel 프로젝트 설정 → **Environment Variables**에서 입력한다.

| 변수 | 값 | 비고 |
|---|---|---|
| `VITE_API_BASE_URL` | Render 백엔드 배포 URL (예: `https://job-hunter-backend.onrender.com`) | 백엔드 배포가 먼저 끝나 URL이 확정된 후 입력 |

Vite 환경변수는 `VITE_` 접두사가 붙은 것만 빌드 결과물에 포함되므로, 그 외 이름으로는 클라이언트 코드에서 접근할 수 없다.

## GitHub Actions Secrets

현재 CI 워크플로우([backend-ci.yml](../.github/workflows/backend-ci.yml), [frontend-ci.yml](../.github/workflows/frontend-ci.yml))는 임포트 검증·린트·빌드만 수행하며 실제 배포는 Render/Vercel이 각자의 GitHub 연동을 통해 자동으로 수행하므로(GitHub Actions에서 별도 배포 스텝을 실행하지 않음), 현재 시점에는 GitHub Actions Secrets 등록이 필요 없다.

향후 CI에서 실제 DB나 OpenAI API를 사용하는 통합 테스트를 추가하게 되면(Phase 3 이후), 그때 `Settings` → `Secrets and variables` → `Actions`에 해당 키를 등록한다.

## 배포 순서 (닭과 달걀 문제)

백엔드는 프론트엔드 URL을(`CORS_ORIGINS`), 프론트엔드는 백엔드 URL을(`VITE_API_BASE_URL`) 서로 필요로 한다. 아래 순서로 진행하면 순환 의존을 피할 수 있다.

1. 백엔드를 Render에 먼저 배포한다 (`CORS_ORIGINS`는 임시로 `["http://localhost:5173"]` 등으로 비워둔 채 배포).
2. 발급된 Render URL을 프론트엔드 Vercel 환경변수(`VITE_API_BASE_URL`)에 입력하고 프론트엔드를 배포한다.
3. 발급된 Vercel URL을 백엔드 Render 환경변수(`CORS_ORIGINS`)에 입력하고 백엔드를 재배포(Render는 환경변수 변경 시 자동 재배포)한다.
