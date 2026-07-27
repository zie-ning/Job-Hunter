import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { mockBranchAdapter } from "../adapters/branchAdapter";
import { mockMatchAdapter } from "../adapters/matchAdapter";
import type { Branch, GapAnalysisResult, JdMatch } from "../adapters/types";
import { BRANCH_STATUS_LABEL, BRANCH_STATUS_TONE } from "../lib/branchStatus";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { ScoreDelta } from "../components/ScoreDelta";
import { GapAnalysisSection } from "../components/GapAnalysisSection";

export function BranchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [match, setMatch] = useState<JdMatch | null>(null);
  // undefined: 아직 조회 전, null: 조회 완료했으나 결과 없음.
  // GapAnalysisSection은 마운트 시점의 initialResult로 내부 state를 초기화하므로,
  // 조회가 끝나기 전에 미리 마운트되면 이후 상태 갱신이 반영되지 않는다.
  // 따라서 조회가 끝날 때까지(undefined인 동안) 렌더링 자체를 미룬다.
  const [gapAnalysis, setGapAnalysis] = useState<
    GapAnalysisResult | null | undefined
  >(undefined);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const [branchResult, matches] = await Promise.all([
        mockBranchAdapter.getBranch(id),
        mockMatchAdapter.getMatches(),
      ]);
      setBranch(branchResult);
      setMatch(matches.find((m) => m.id === branchResult.jdMatchId) ?? null);
      const gap = await mockBranchAdapter.getGapAnalysis(id);
      setGapAnalysis(gap);
    })();
  }, [id]);

  if (!branch) {
    return <Card>불러오는 중...</Card>;
  }

  return (
    <div className="branch-detail-page">
      <Card>
        <div className="branch-detail-header">
          <div>
            <h2>{match?.company ?? "알 수 없는 공고"}</h2>
            <p className="match-title">{match?.title}</p>
          </div>
          <Badge tone={BRANCH_STATUS_TONE[branch.status]}>
            {BRANCH_STATUS_LABEL[branch.status]}
          </Badge>
        </div>

        <h3>버전 이력 (개선도)</h3>
        <ul className="branch-version-list">
          {branch.versions.map((version, index) => {
            const baseScore = match?.matchScore ?? 0;
            const before = index === 0 ? baseScore : baseScore + index * 2 - 2;
            const after = baseScore + index * 2;
            return (
              <li key={version.id} className="branch-version-item">
                <span>{version.comment}</span>
                <ScoreDelta before={before} after={after} />
              </li>
            );
          })}
        </ul>

        {gapAnalysis !== undefined && (
          <GapAnalysisSection
            branchId={branch.id}
            initialResult={gapAnalysis}
          />
        )}
      </Card>
    </div>
  );
}
