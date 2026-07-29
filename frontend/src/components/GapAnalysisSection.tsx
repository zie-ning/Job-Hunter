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
    <div className="border-border mt-6 border-t pt-5">
      <div className="flex items-center justify-between">
        <div
          role="heading"
          aria-level={3}
          className="text-text-strong font-sans text-base font-bold"
        >
          갭분석 · 첨삭 피드백
        </div>
        <Button type="button" onClick={handleRequest} isLoading={isLoading}>
          {result ? "다시 첨삭받기" : "첨삭하기/피드백 받기"}
        </Button>
      </div>
      {result && (
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <div
              role="heading"
              aria-level={4}
              className="text-text-strong mb-1.5 font-sans text-sm font-semibold"
            >
              부족한 부분
            </div>
            <ul className="text-text list-disc space-y-1 pl-5 text-sm">
              {result.gaps.map((gap) => (
                <li key={gap}>{gap}</li>
              ))}
            </ul>
          </div>
          <div>
            <div
              role="heading"
              aria-level={4}
              className="text-text-strong mb-1.5 font-sans text-sm font-semibold"
            >
              첨삭 피드백
            </div>
            <p className="text-text text-sm">{result.feedback}</p>
          </div>
          <p className="text-text-muted font-mono text-xs">
            {new Date(result.generatedAt).toLocaleString("ko-KR")} 기준
          </p>
        </div>
      )}
    </div>
  );
}
