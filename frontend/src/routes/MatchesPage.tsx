import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockMatchAdapter } from "../adapters/matchAdapter";
import { mockBranchAdapter } from "../adapters/branchAdapter";
import type { JdMatch } from "../adapters/types";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { BaseVersionModal } from "../components/BaseVersionModal";

export function MatchesPage() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<JdMatch[] | null>(null);
  const [modalJdMatchId, setModalJdMatchId] = useState<string | null>(null);

  useEffect(() => {
    void mockMatchAdapter.getMatches().then(setMatches);
  }, []);

  async function handlePrepareApply(jdMatchId: string) {
    const existing = await mockBranchAdapter.findBranchByJdMatchId(jdMatchId);
    if (existing) {
      navigate(`/branches/${existing.id}`);
      return;
    }
    setModalJdMatchId(jdMatchId);
  }

  async function handleSelectBaseVersion(versionId: string) {
    if (!modalJdMatchId) return;
    const branch = await mockBranchAdapter.createBranch(
      modalJdMatchId,
      versionId,
    );
    setModalJdMatchId(null);
    navigate(`/branches/${branch.id}`);
  }

  if (matches === null) {
    return <Card>불러오는 중...</Card>;
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
    <div className="match-grid">
      {matches.map((match) => (
        <Card key={match.id} className="match-card">
          <div className="match-card-header">
            <div>
              <h3>{match.company}</h3>
              <p className="match-title">{match.title}</p>
            </div>
            <span className="match-score">{match.matchScore}점</span>
          </div>
          <div className="match-skills">
            {match.skills.map((skill) => (
              <Badge key={skill} tone="neutral">
                {skill}
              </Badge>
            ))}
          </div>
          <Button type="button" onClick={() => handlePrepareApply(match.id)}>
            지원 준비하기
          </Button>
        </Card>
      ))}
      {modalJdMatchId && (
        <BaseVersionModal
          onSelect={handleSelectBaseVersion}
          onClose={() => setModalJdMatchId(null)}
        />
      )}
    </div>
  );
}
