# Task 파일 규칙

이 문서는 Antigravity Agent가 이 저장소에서 `docs/tasks/` 아래 Task 파일을 만들고 갱신할 때 참고하는 규칙이다. `docs/ROADMAP.md`는 Phase 단위 상위 체크리스트만 유지하고, Phase의 세부 작업은 이 규칙에 따라 Task 파일로 분리해 관리한다.

## 왜 나누는가

Phase 하나가 실제로 구현되면서 세부 작업이 계속 늘어나면 `ROADMAP.md`가 스크롤 없이 훑어볼 수 없는 길이가 된다. Task 파일로 분리하면 `ROADMAP.md`는 "무엇이 끝났는가"를 한눈에 보여주는 목록으로 남고, "어떻게·왜 했는가"는 Task 파일에서 필요할 때만 펼쳐본다.

## 파일명

- 위치: `docs/tasks/`
- 형식: `TASK-XXX.md` (3자리, 0으로 시작 패딩). 작업명 슬러그는 파일명에 넣지 않는다 — 작업명은 파일 내부 H1 제목에만 쓴다
- 번호: Phase와 무관하게 프로젝트 전체에서 순차 증가(Phase 3의 첫 Task가 002 다음 번호를 잇는 식)

## 생성 시점

Phase에 착수하는 시점에, 세부 작업이 확정되는 대로 바로 Task 파일부터 만든다. `ROADMAP.md`의 해당 Phase에는 처음부터 세부 항목을 나열하지 않고 Task 파일 링크만 남긴다. 이미 짧은(항목 몇 개뿐인) Phase까지 억지로 Task 파일로 쪼갤 필요는 없다 — 위 "왜 나누는가"의 근거 자체가 "길어질 때만 분리"이므로, 짧은 Phase는 인라인 체크리스트로 남겨도 된다.

## 작업 진행 방식

- Task 파일의 "세부 작업" 체크리스트는 항목 하나씩 순서대로 구현한다.
- 항목 하나를 완료하면 그 즉시 Task 파일의 체크박스를 `[x]`로 갱신한다 — 여러 항목을 끝낸 뒤 한꺼번에 갱신하지 않는다.
- **각 항목을 완료한 뒤에는 작업을 멈추고 사용자의 추가 지시를 기다린다.** 다음 항목으로 이어서 진행하지 않는다.

## Task 파일 템플릿

```markdown
# Task XXX: [작업명]

## 개요
- **목표**: [작업의 핵심 목표]
- **관련 Phase**: [Phase N]
- **관련 PRD 섹션**: [PRD.md 섹션 번호]
- **선행 Task**: [의존하는 이전 Task, 없으면 "없음"]

## 세부 작업
- [ ] 세부 항목 1
- [ ] 세부 항목 2

## 완료 기준
- [측정 가능한 완료 조건]

## 검증
- [ ] (프론트엔드 변경 시) 브라우저에서 라이트/다크·데스크톱/모바일 실제 렌더링 확인
- [ ] (API/비즈니스 로직 작업 시) Playwright MCP로 테스트 시나리오 작성 및 실행 — 필수
- [ ] 아래 "개발 체크리스트" 통과

## 관련 파일
- [경로]
```

## 개발 체크리스트

CI([.github/workflows/backend-ci.yml](../../.github/workflows/backend-ci.yml), [.github/workflows/frontend-ci.yml](../../.github/workflows/frontend-ci.yml))가 검증하는 빌드·린트·포맷을 로컬에서 미리 재현해 CI 실패를 사전에 방지한다.

**실행 시점**: 세부 작업 항목을 하나 완료할 때마다 매번 돌리지 않는다. 아래 두 조건을 모두 만족할 때만 실행한다.
- `backend/` 또는 `frontend/`의 실제 코드를 수정했다 (문서·설정 전용 변경 제외)
- 하나의 세부 작업 항목 구현을 마무리하는 시점이다

수정 범위에 맞는 쪽만 실행한다 — `backend/`만 고쳤으면 백엔드만, `frontend/`만 고쳤으면 프론트엔드만, 둘 다 고쳤으면 둘 다.

### 백엔드 (`backend/` 변경 시)
로컬 가상환경에 `requirements-dev.txt`가 설치되어 있어야 한다.
```bash
cd backend
ruff check .
ruff format --check .
python -c "from app.main import app"
```

### 프론트엔드 (`frontend/` 변경 시)
```bash
cd frontend
npm run lint
npm run format:check
npm run build
```

검증 실패 시 자동 수정 가능한 것(`ruff check --fix`, `ruff format`, `npm run format`)은 적용 후 재검증하고, 그 외 오류는 코드를 고쳐 재검증한다.

## `ROADMAP.md`와의 연결

- `ROADMAP.md`의 Phase "세부 작업"란에는 Task 파일 링크를 Task 파일의 H1 제목과 동일한 문구로 남긴다:
  ```markdown
  - [x] [Task 001: 작업명](tasks/TASK-001.md)
  ```
- 체크(`[x]`)는 Task 파일의 "세부 작업" 체크리스트와 `ROADMAP.md`의 Task 링크 줄, 양쪽에서 동기화한다. 세부 항목 일부만 끝났다면 Task 파일 안의 체크리스트만 부분적으로 채우고, `ROADMAP.md` 쪽 Task 링크 줄은 Task 전체가 끝났을 때만 체크한다.
- 진행 상황을 갱신하는 시점과 근거 확인 규칙은 `GEMINI.md`의 "개발 워크플로우" 절을 따른다.
