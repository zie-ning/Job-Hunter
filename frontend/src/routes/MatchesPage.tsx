import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockMatchAdapter } from "../adapters/matchAdapter";
import { mockBranchAdapter } from "../adapters/branchAdapter";
import type { Branch, JdMatch } from "../adapters/types";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { ForkPickerModal } from "../components/ForkPickerModal";
import { Skeleton } from "../components/Skeleton";
import { ScoreGauge } from "../components/ScoreGauge";

function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR");
}

export function MatchesPage() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<JdMatch[] | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [modalJdMatchId, setModalJdMatchId] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      mockMatchAdapter.getMatches(),
      mockBranchAdapter.getBranches(),
    ]).then(([matchList, branchList]) => {
      setMatches(matchList);
      setBranches(branchList);
    });
  }, []);

  async function handlePrepareApply(jdMatchId: string) {
    const existing = await mockBranchAdapter.findBranchByJdMatchId(jdMatchId);
    if (existing) {
      navigate(`/branches/${existing.id}`);
      return;
    }
    setModalJdMatchId(jdMatchId);
  }

  async function handleConfirmFork(initialContent: string) {
    if (!modalJdMatchId) return;
    const branch = await mockBranchAdapter.createJdBranch(
      modalJdMatchId,
      initialContent,
    );
    setModalJdMatchId(null);
    navigate(`/branches/${branch.id}`);
  }

  if (matches === null) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="flex flex-col gap-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <EmptyState
        title="아직 매칭된 공고가 없습니다"
        description="새 공고가 수집되면 여기에 표시됩니다."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {matches.map((match, index) => (
        <Card
          key={match.id}
          style={{ animationDelay: `${index * 40}ms` }}
          className="animate-fade-up flex h-full flex-col gap-4 motion-reduce:animate-none"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-text-strong font-sans text-base font-bold">
                {match.company}
              </h3>
              <p className="text-text mt-0.5 text-sm">{match.title}</p>
            </div>
            <ScoreGauge score={match.matchScore} size={52} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {match.skills.map((skill) => (
              <Badge key={skill} tone="neutral">
                {skill}
              </Badge>
            ))}
          </div>
          <p className="text-text-muted mt-auto text-xs">
            마감{" "}
            <span className="text-warning font-mono font-semibold">
              {formatDeadline(match.deadline)}
            </span>
          </p>
          <Button type="button" onClick={() => handlePrepareApply(match.id)}>
            지원 준비하기
          </Button>
        </Card>
      ))}
      {modalJdMatchId && (
        <ForkPickerModal
          branches={branches}
          matches={matches}
          onConfirm={handleConfirmFork}
          onClose={() => setModalJdMatchId(null)}
        />
      )}
    </div>
  );
}
