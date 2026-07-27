import type {
  Branch,
  GapAnalysisResult,
  JdMatch,
  ResumeVersion,
} from "./types";

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
