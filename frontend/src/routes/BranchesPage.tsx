import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mockBranchAdapter } from "../adapters/branchAdapter";
import { mockMatchAdapter } from "../adapters/matchAdapter";
import type { CreateMatchInput } from "../adapters/matchAdapter";
import type {
  Branch,
  BranchStatus,
  GeneralBranch,
  JdBranch,
  JdMatch,
} from "../adapters/types";
import { BRANCH_STATUS_LABEL, BRANCH_STATUS_TONE } from "../lib/branchStatus";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { Select } from "../components/Select";
import { EmptyState } from "../components/EmptyState";
import { NewBranchModal } from "../components/NewBranchModal";
import { NewJdBranchModal } from "../components/NewJdBranchModal";
import { Skeleton } from "../components/Skeleton";
import { ScoreGauge } from "../components/ScoreGauge";
import { PinIcon } from "../components/icons";

const STATUS_FILTERS: Array<BranchStatus | "all"> = [
  "all",
  "undecided",
  "in_progress",
  "applied",
  "closed",
];

type SortOption = "recent" | "deadline";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR");
}

function lastModifiedAt(branch: Branch): string {
  return branch.versions[branch.versions.length - 1].createdAt;
}

function lastModified(branch: Branch): string {
  return formatDate(lastModifiedAt(branch));
}

/**
 * 섹션 제목. div + role="heading"을 쓴다 — <h2>/<h3> 태그는 index.css의
 * 레거시 블랭킷 규칙과 충돌한다(docs/DESIGN.md §4 "알려진 한계" 참고).
 */
function SectionHeading({
  children,
  count,
}: {
  children: React.ReactNode;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        role="heading"
        aria-level={2}
        className="text-text-strong font-sans text-lg font-bold"
      >
        {children}
      </div>
      <span className="bg-neutral-soft text-text rounded-sm px-1.5 py-0.5 font-mono text-xs">
        {count}
      </span>
    </div>
  );
}

export function BranchesPage() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<Branch[] | null>(null);
  const [matches, setMatches] = useState<JdMatch[]>([]);
  const [filter, setFilter] = useState<BranchStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [isCreatingGeneral, setIsCreatingGeneral] = useState(false);
  const [isCreatingJd, setIsCreatingJd] = useState(false);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    const [branchList, matchList] = await Promise.all([
      mockBranchAdapter.getBranches(),
      mockMatchAdapter.getMatches(),
    ]);
    setBranches(branchList);
    setMatches(matchList);
  }

  const generalBranches = useMemo(
    () =>
      (branches ?? []).filter((b): b is GeneralBranch => b.kind === "general"),
    [branches],
  );
  const defaultBranch = generalBranches.find((b) => b.isDefault) ?? null;
  const orderedGeneralBranches = defaultBranch
    ? [defaultBranch, ...generalBranches.filter((b) => !b.isDefault)]
    : generalBranches;

  const jdBranchesWithMatch = useMemo(
    () =>
      (branches ?? [])
        .filter((b): b is JdBranch => b.kind === "jd")
        .map((branch) => ({
          branch,
          match: matches.find((m) => m.id === branch.jdMatchId),
        })),
    [branches, matches],
  );

  const filteredJdBranches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = jdBranchesWithMatch.filter(({ branch, match }) => {
      if (filter !== "all" && branch.status !== filter) return false;
      if (!q) return true;
      const haystack = [match?.company, ...(match?.skills ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
    return result.sort((a, b) => {
      if (sortBy === "deadline") {
        const aDeadline = a.match?.deadline;
        const bDeadline = b.match?.deadline;
        if (!aDeadline && !bDeadline) return 0;
        if (!aDeadline) return 1;
        if (!bDeadline) return -1;
        return aDeadline.localeCompare(bDeadline);
      }
      return lastModifiedAt(b.branch).localeCompare(lastModifiedAt(a.branch));
    });
  }, [jdBranchesWithMatch, filter, query, sortBy]);

  async function handleCreateGeneralBranch(
    name: string,
    initialContent: string,
  ) {
    const branch = await mockBranchAdapter.createGeneralBranch(
      name,
      initialContent,
      false,
    );
    setIsCreatingGeneral(false);
    navigate(`/branches/${branch.id}`);
  }

  async function handleCreateJdBranch(
    input: CreateMatchInput,
    initialContent: string,
  ) {
    const match = await mockMatchAdapter.createMatch(input);
    const branch = await mockBranchAdapter.createJdBranch(
      match.id,
      initialContent,
    );
    setIsCreatingJd(false);
    navigate(`/branches/${branch.id}`);
  }

  if (branches === null) {
    return (
      <div className="flex flex-col gap-3">
        <Card className="flex flex-col gap-3">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-16 w-full" />
        </Card>
        <Card className="flex flex-col gap-3">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-24 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <SectionHeading count={orderedGeneralBranches.length}>
            범용 브랜치
          </SectionHeading>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsCreatingGeneral(true)}
          >
            + 새 브랜치 만들기
          </Button>
        </div>

        {orderedGeneralBranches.length === 0 ? (
          <p className="text-text text-sm">
            아직 범용 브랜치가 없습니다. "새 브랜치 만들기"로 마스터 이력서를
            만들어보세요.
          </p>
        ) : (
          <div className="flex gap-3 overflow-x-auto px-1 py-2">
            {orderedGeneralBranches.map((branch, index) => (
              <Link
                key={branch.id}
                to={`/branches/${branch.id}`}
                // 리스트 진입 stagger reveal — 항목별 지연은 Tailwind로
                // 표현할 수 없는 동적 값이라 인라인 style로 전달한다
                // (ScoreGauge와 동일한 예외, docs/DESIGN.md §5)
                style={{ animationDelay: `${index * 40}ms` }}
                className={[
                  "bg-surface shadow-e1 hover:shadow-e2 animate-fade-up min-w-60 shrink-0 rounded-md p-4 transition-[box-shadow,transform] hover:-translate-y-0.5 motion-reduce:animate-none motion-reduce:hover:translate-y-0",
                  branch.isDefault
                    ? "border-accent border-2"
                    : "border-border border",
                ].join(" ")}
              >
                <div className="flex items-center gap-1.5">
                  {branch.isDefault && (
                    <PinIcon size={15} className="text-accent shrink-0" />
                  )}
                  <span className="text-text-strong truncate font-sans text-sm font-semibold">
                    {branch.name}
                  </span>
                </div>
                <span className="text-text-muted mt-0.5 block font-mono text-xs">
                  최근 수정 {lastModified(branch)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <SectionHeading count={jdBranchesWithMatch.length}>
            공고 브랜치
          </SectionHeading>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsCreatingJd(true)}
          >
            + 새 브랜치 만들기
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <TextField
            placeholder="회사명 또는 기술스택으로 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-56 flex-1"
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="min-w-36"
          >
            <option value="recent">최근 수정순</option>
            <option value="deadline">마감일 순</option>
          </Select>
          <div className="border-border bg-surface flex gap-0.5 rounded-sm border p-0.5">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={[
                  "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                  filter === status
                    ? "bg-surface-sunken text-text-strong shadow-e1 font-semibold"
                    : "text-text hover:bg-surface-sunken hover:text-text-strong",
                ].join(" ")}
              >
                {status === "all" ? "전체" : BRANCH_STATUS_LABEL[status]}
              </button>
            ))}
          </div>
        </div>

        {jdBranchesWithMatch.length === 0 ? (
          <EmptyState
            title="아직 공고 브랜치가 없습니다"
            description="매칭 공고 화면에서 '지원 준비하기'를 누르거나, 위의 '새 브랜치 만들기'로 만들어보세요."
          />
        ) : filteredJdBranches.length === 0 ? (
          <EmptyState
            title="조건에 맞는 브랜치가 없습니다"
            description="필터나 검색어를 조정해보세요."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {filteredJdBranches.map(({ branch, match }, index) => (
              <Link key={branch.id} to={`/branches/${branch.id}`}>
                <Card
                  elevation="flat"
                  style={{ animationDelay: `${index * 40}ms` }}
                  className="hover:shadow-e2 animate-fade-up flex items-center gap-5 transition-[box-shadow,transform] hover:-translate-y-0.5 motion-reduce:animate-none motion-reduce:hover:translate-y-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="text-text-strong font-sans text-base font-bold">
                          {match?.company ?? "알 수 없는 공고"}
                        </span>
                        <span className="bg-border h-3 w-px shrink-0" />
                        <span className="text-text truncate text-sm">
                          {match?.title}
                        </span>
                      </div>
                      <Badge
                        tone={BRANCH_STATUS_TONE[branch.status]}
                        className="shrink-0"
                      >
                        {BRANCH_STATUS_LABEL[branch.status]}
                      </Badge>
                    </div>
                    {match && match.skills.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {match.skills.map((skill) => (
                          <span
                            key={skill}
                            className="border-border bg-surface-sunken text-text rounded-sm border px-2 py-0.5 font-mono text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-text-muted mt-2.5 flex gap-4 text-xs">
                      <span>
                        최근 수정{" "}
                        <span className="font-mono">
                          {lastModified(branch)}
                        </span>
                      </span>
                      {match && (
                        <span className="text-warning font-semibold">
                          마감{" "}
                          <span className="font-mono">
                            {formatDate(match.deadline)}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  {match && <ScoreGauge score={match.matchScore} />}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {isCreatingGeneral && (
        <NewBranchModal
          branches={branches ?? []}
          matches={matches}
          onCreate={handleCreateGeneralBranch}
          onClose={() => setIsCreatingGeneral(false)}
        />
      )}

      {isCreatingJd && (
        <NewJdBranchModal
          branches={branches ?? []}
          matches={matches}
          onCreate={handleCreateJdBranch}
          onClose={() => setIsCreatingJd(false)}
        />
      )}
    </div>
  );
}
