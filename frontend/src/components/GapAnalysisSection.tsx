import { useState } from "react";
import { mockBranchAdapter } from "../adapters/branchAdapter";
import type { GapAnalysisResult } from "../adapters/types";
import { Button } from "./Button";

interface GapAnalysisSectionProps {
  branchId: string;
  initialResult: GapAnalysisResult | null;
}

export function GapAnalysisSection({
  branchId,
  initialResult,
}: GapAnalysisSectionProps) {
  const [result, setResult] = useState(initialResult);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRequest() {
    setIsLoading(true);
    try {
      const newResult = await mockBranchAdapter.requestGapAnalysis(branchId);
      setResult(newResult);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="gap-analysis">
      <div className="gap-analysis-header">
        <h3>갭분석 · 첨삭 피드백</h3>
        <Button type="button" onClick={handleRequest} isLoading={isLoading}>
          {result ? "다시 첨삭받기" : "첨삭하기/피드백 받기"}
        </Button>
      </div>
      {result && (
        <div className="gap-analysis-result">
          <div>
            <h4>부족한 부분</h4>
            <ul>
              {result.gaps.map((gap) => (
                <li key={gap}>{gap}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>첨삭 피드백</h4>
            <p>{result.feedback}</p>
          </div>
          <p className="gap-analysis-meta">
            {new Date(result.generatedAt).toLocaleString("ko-KR")} 기준
          </p>
        </div>
      )}
    </div>
  );
}
