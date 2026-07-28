import type { Branch, GapAnalysisResult, JdMatch } from "./types";

interface MockDb {
  isAuthenticated: boolean;
  jdMatches: JdMatch[];
  branches: Branch[];
  gapAnalyses: GapAnalysisResult[];
}

const STORAGE_KEY = "job-hunting-assistant:mock-db:v3";

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function seedDb(): MockDb {
  const jdMatches: JdMatch[] = [
    {
      id: "jd-1",
      company: "원티드랩",
      title: "백엔드 엔지니어",
      skills: ["Python", "FastAPI", "PostgreSQL"],
      matchScore: 92,
      source: "wanted",
      deadline: daysFromNow(5),
      applyUrl: "https://www.wanted.co.kr/wd/1",
    },
    {
      id: "jd-2",
      company: "토스",
      title: "서버 개발자",
      skills: ["Kotlin", "Spring", "MySQL"],
      matchScore: 74,
      source: "wanted",
      deadline: daysFromNow(12),
      applyUrl: "https://www.wanted.co.kr/wd/2",
    },
    {
      id: "jd-3",
      company: "당근마켓",
      title: "백엔드 개발자",
      skills: ["Python", "Django", "Redis"],
      matchScore: 81,
      source: "worknet",
      deadline: daysFromNow(9),
      applyUrl: "https://www.work24.go.kr/wk/a/b/1200/retriveDtlEmpSrchList.do?jobId=3",
    },
    {
      id: "jd-4",
      company: "카카오엔터프라이즈",
      title: "데이터 엔지니어",
      skills: ["Python", "Airflow", "Spark"],
      matchScore: 63,
      source: "worknet",
      deadline: daysFromNow(20),
      applyUrl: "https://www.work24.go.kr/wk/a/b/1200/retriveDtlEmpSrchList.do?jobId=4",
    },
  ];

  const branches: Branch[] = [
    {
      id: "branch-master",
      kind: "general",
      name: "서비스 기업 마스터 이력서",
      status: "in_progress",
      isDefault: true,
      versions: [
        {
          id: "branch-master-v1",
          content:
            "백엔드 개발자 이력서\n\n- Python/FastAPI 3년\n- PostgreSQL 실무 경험",
          comment: "초기 업로드",
          createdAt: daysAgo(10),
        },
        {
          id: "branch-master-v2",
          content:
            "백엔드 개발자 이력서\n\n- Python/FastAPI 3년, pgvector 기반 벡터 검색 프로젝트 경험 추가\n- PostgreSQL 실무 경험",
          comment: "프로젝트 경험 보강",
          createdAt: daysAgo(5),
        },
      ],
    },
    {
      id: "branch-manufacturing",
      kind: "general",
      name: "제조 IT 마스터 이력서",
      status: "in_progress",
      versions: [
        {
          id: "branch-manufacturing-v1",
          content:
            "백엔드 개발자 이력서 (제조업 도메인 특화)\n\n- MES/ERP 연동 백엔드 개발 경험 강조\n- Python/FastAPI 3년",
          comment: "제조 IT 직군용으로 도메인 경험 재구성",
          createdAt: daysAgo(3),
        },
      ],
    },
    {
      id: "branch-1",
      kind: "jd",
      jdMatchId: "jd-1",
      status: "in_progress",
      versions: [
        {
          id: "branch-1-v1",
          content:
            "백엔드 개발자 이력서\n\n- Python/FastAPI 3년, pgvector 기반 벡터 검색 프로젝트 경험 추가\n- PostgreSQL 실무 경험",
          comment: "브랜치 시작",
          createdAt: daysAgo(4),
        },
        {
          id: "branch-1-v2",
          content:
            "백엔드 개발자 이력서\n\n- Python/FastAPI 3년, pgvector 기반 벡터 검색 프로젝트 경험 추가\n- PostgreSQL 실무 경험\n- 원티드랩 JD의 pgvector 요구사항에 맞춰 프로젝트 설명 구체화",
          comment: "JD 요구 기술스택 강조",
          createdAt: daysAgo(1),
        },
      ],
    },
    {
      id: "branch-2",
      kind: "jd",
      jdMatchId: "jd-3",
      status: "applied",
      versions: [
        {
          id: "branch-2-v1",
          content:
            "백엔드 개발자 이력서\n\n- Python/FastAPI 3년, pgvector 기반 벡터 검색 프로젝트 경험 추가\n- PostgreSQL 실무 경험",
          comment: "브랜치 시작",
          createdAt: daysAgo(7),
        },
      ],
    },
  ];

  const gapAnalyses: GapAnalysisResult[] = [
    {
      id: "gap-branch-1-1",
      branchId: "branch-1",
      gaps: ["pgvector 등 벡터 검색 실무 경험 명시 부족", "우대사항 관련 경험 전반 미기재"],
      feedback:
        "원티드랩 공고는 pgvector 기반 유사도 검색 경험을 우대사항으로 명시하고 있습니다. 관련 프로젝트 경험이 있다면 구체적으로 추가해보세요.",
      generatedAt: daysAgo(4),
    },
    {
      id: "gap-branch-1-2",
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
