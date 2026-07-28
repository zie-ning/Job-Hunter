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
    return <Card>불러오는 중...</Card>;
  }

  return (
    <div className="branches-page">
      <div className="branch-section">
        <div className="branch-section-header">
          <h3>범용 브랜치</h3>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsCreatingGeneral(true)}
          >
            + 새 브랜치 만들기
          </Button>
        </div>

        {orderedGeneralBranches.length === 0 ? (
          <p className="branch-section-empty">
            아직 범용 브랜치가 없습니다. "새 브랜치 만들기"로 마스터 이력서를
            만들어보세요.
          </p>
        ) : (
          <div className="branch-general-strip">
            {orderedGeneralBranches.map((branch) => (
              <Link
                key={branch.id}
                to={`/branches/${branch.id}`}
                className={
                  branch.isDefault ? "branch-chip default" : "branch-chip"
                }
              >
                <span className="branch-chip-name">{branch.name}</span>
                <span className="branch-chip-meta">
                  최근 수정 {lastModified(branch)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="branch-section">
        <div className="branch-section-header">
          <h3>공고 브랜치</h3>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsCreatingJd(true)}
          >
            + 새 브랜치 만들기
          </Button>
        </div>
        <div className="branch-toolbar">
          <TextField
            label="검색"
            placeholder="회사명 또는 기술스택으로 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select
            label="정렬"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="recent">최근 수정순</option>
            <option value="deadline">마감일 순</option>
          </Select>
          <div className="branch-filter">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                type="button"
                className={
                  filter === status
                    ? "branch-filter-btn active"
                    : "branch-filter-btn"
                }
                onClick={() => setFilter(status)}
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
          <div className="branch-list">
            {filteredJdBranches.map(({ branch, match }) => (
              <Link
                key={branch.id}
                to={`/branches/${branch.id}`}
                className="branch-card-link"
              >
                <Card className="branch-card">
                  <div className="match-card-header">
                    <div>
                      <h3>{match?.company ?? "알 수 없는 공고"}</h3>
                      <p className="match-title">{match?.title}</p>
                    </div>
                    <Badge tone={BRANCH_STATUS_TONE[branch.status]}>
                      {BRANCH_STATUS_LABEL[branch.status]}
                    </Badge>
                  </div>
                  {match && match.skills.length > 0 && (
                    <div className="match-skills">
                      {match.skills.map((skill) => (
                        <Badge key={skill} tone="neutral">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="branch-card-meta">
                    {match && (
                      <span className="match-score">{match.matchScore}점</span>
                    )}
                    <span>최근 수정 {lastModified(branch)}</span>
                    {match && <span>마감 {formatDate(match.deadline)}</span>}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

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
