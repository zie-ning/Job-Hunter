import { useState } from "react";
import type { GapAnalysisResult } from "../adapters/types";
import { Button } from "./Button";

type FeedbackTab = "gap" | "review";

function GapAnalysisIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h4" />
      <path d="M9.5 16l1.5 1.5L14.5 14" />
    </svg>
  );
}

function ReviewIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 20l1-4.2L15.8 5a1.5 1.5 0 0 1 2.1 0l1.1 1.1a1.5 1.5 0 0 1 0 2.1L8.2 19 4 20Z" />
      <path d="M13.5 6.5l4 4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

interface FeedbackHistoryPanelProps {
  history: GapAnalysisResult[];
  isLoading: boolean;
  onRequest: () => void;
}

export function FeedbackHistoryPanel({
  history,
  isLoading,
  onRequest,
}: FeedbackHistoryPanelProps) {
  const [tab, setTab] = useState<FeedbackTab>("gap");
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  function openTab(nextTab: FeedbackTab) {
    setTab(nextTab);
    setIsPanelOpen(true);
  }

  return (
    <>
      <div className="feedback-rail">
        <button
          type="button"
          className={
            isPanelOpen && tab === "gap"
              ? "feedback-rail-btn active"
              : "feedback-rail-btn"
          }
          onClick={() => openTab("gap")}
        >
          <GapAnalysisIcon />
          <span>공고 분석</span>
        </button>
        <button
          type="button"
          className={
            isPanelOpen && tab === "review"
              ? "feedback-rail-btn active"
              : "feedback-rail-btn"
          }
          onClick={() => openTab("review")}
        >
          <ReviewIcon />
          <span>이력서 리뷰</span>
        </button>
      </div>

      {isPanelOpen && (
        <div className="feedback-panel-flyout">
          <button
            type="button"
            className="feedback-panel-close"
            aria-label="닫기"
            onClick={() => setIsPanelOpen(false)}
          >
            <CloseIcon />
          </button>

          <div className="feedback-panel-header">
            <Button type="button" onClick={onRequest} isLoading={isLoading}>
              {history.length > 0 ? "다시 첨삭받기" : "첨삭하기/피드백 받기"}
            </Button>
          </div>

          <div className="feedback-panel-scroll">
            {history.length === 0 ? (
              <p className="feedback-empty">아직 분석 내역이 없습니다.</p>
            ) : (
              <ul className="feedback-entry-list">
                {history.map((entry) => (
                  <li key={entry.id} className="feedback-entry">
                    {tab === "gap" ? (
                      <ul className="feedback-gap-list">
                        {entry.gaps.map((gap) => (
                          <li key={gap}>{gap}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{entry.feedback}</p>
                    )}
                    <p className="feedback-entry-meta">
                      {new Date(entry.generatedAt).toLocaleString("ko-KR")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
