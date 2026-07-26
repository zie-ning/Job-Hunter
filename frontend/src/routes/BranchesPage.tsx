import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mockBranchAdapter } from "../adapters/branchAdapter";
import { mockMatchAdapter } from "../adapters/matchAdapter";
import type { Branch, BranchStatus, JdMatch } from "../adapters/types";
import { BRANCH_STATUS_LABEL, BRANCH_STATUS_TONE } from "../lib/branchStatus";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { EmptyState } from "../components/EmptyState";

const STATUS_FILTERS: Array<BranchStatus | "all"> = [
  "all",
  "in_progress",
  "applied",
  "closed",
];

export function BranchesPage() {
  const [branches, setBranches] = useState<Branch[] | null>(null);
  const [matches, setMatches] = useState<JdMatch[]>([]);
  const [filter, setFilter] = useState<BranchStatus | "all">("all");

  useEffect(() => {
    void Promise.all([
      mockBranchAdapter.getBranches(),
      mockMatchAdapter.getMatches(),
    ]).then(([branchList, matchList]) => {
      setBranches(branchList);
      setMatches(matchList);
    });
  }, []);

  if (branches === null) {
    return <Card>불러오는 중...</Card>;
  }

  if (branches.length === 0) {
    return (
      <EmptyState
        title="아직 브랜치가 없습니다"
        description="JD 매칭 화면에서 '지원 준비하기'를 누르면 브랜치가 생성됩니다."
      />
    );
  }

  const filtered =
    filter === "all" ? branches : branches.filter((b) => b.status === filter);

  return (
    <div className="branches-page">
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
      <div className="branch-list">
        {filtered.map((branch) => {
          const match = matches.find((m) => m.id === branch.jdMatchId);
          return (
            <Link key={branch.id} to={`/branches/${branch.id}`}>
              <Card className="branch-card">
                <div>
                  <h3>{match?.company ?? "알 수 없는 공고"}</h3>
                  <p className="match-title">{match?.title}</p>
                </div>
                <Badge tone={BRANCH_STATUS_TONE[branch.status]}>
                  {BRANCH_STATUS_LABEL[branch.status]}
                </Badge>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
