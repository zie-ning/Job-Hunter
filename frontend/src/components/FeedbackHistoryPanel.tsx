import { useState } from "react";
import type { GapAnalysisResult } from "../adapters/types";
import { Button } from "./Button";
import { GapAnalysisIcon, ReviewIcon, CloseIcon } from "./icons";

type FeedbackTab = "gap" | "review";

interface FeedbackHistoryPanelProps {
  history: GapAnalysisResult[];
  isLoading: boolean;
  onRequest: () => void;
  isOpen: boolean;
  onToggleOpen: (isOpen: boolean) => void;
  hideGapTab?: boolean;
}

const RAIL_BTN_BASE =
  "flex w-full flex-col items-center gap-1 rounded-sm px-1 py-2.5 text-center text-xs leading-tight transition-colors";

export function FeedbackHistoryPanel({
  history,
  isLoading,
  onRequest,
  isOpen,
  onToggleOpen,
  hideGapTab = false,
}: FeedbackHistoryPanelProps) {
  const [tab, setTab] = useState<FeedbackTab>(hideGapTab ? "review" : "gap");

  function openTab(nextTab: FeedbackTab) {
    if (tab === nextTab && isOpen) {
      onToggleOpen(false);
    } else {
      setTab(nextTab);
      onToggleOpen(true);
    }
  }

  return (
    <div className="feedback-sidebar-container">
      {/* feedback-rail은 position:sticky + 반응형(1024px 이하 가로 배치)
          레이아웃 훅으로 유지한다 — Tailwind 유틸리티만으로 이 구조적
          패턴을 옮기면 미디어쿼리 중복이 커진다 */}
      <div className="feedback-rail">
        {!hideGapTab && (
          <button
            type="button"
            onClick={() => openTab("gap")}
            className={[
              RAIL_BTN_BASE,
              isOpen && tab === "gap"
                ? "bg-accent-soft text-accent font-semibold"
                : "text-text hover:bg-surface-sunken hover:text-text-strong",
            ].join(" ")}
          >
            <GapAnalysisIcon />
            <span>공고 분석</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => openTab("review")}
          className={[
            RAIL_BTN_BASE,
            isOpen && tab === "review"
              ? "bg-accent-soft text-accent font-semibold"
              : "text-text hover:bg-surface-sunken hover:text-text-strong",
          ].join(" ")}
        >
          <ReviewIcon />
          <span>이력서 리뷰</span>
        </button>
      </div>

      {isOpen && (
        <div className="feedback-panel-flyout bg-surface shadow-e2 animate-fade-in rounded-lg p-4 motion-reduce:animate-none">
          <button
            type="button"
            aria-label="닫기"
            onClick={() => onToggleOpen(false)}
            className="text-text hover:bg-surface-sunken hover:text-text-strong absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-sm"
          >
            <CloseIcon />
          </button>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {history.length === 0 ? (
              <p className="text-text py-4 text-center text-sm">
                아직 분석 내역이 없습니다.
              </p>
            ) : (
              <ul className="flex flex-col gap-4">
                {history.map((entry, index) => (
                  <li
                    key={entry.id}
                    className={
                      index === 0
                        ? "flex flex-col gap-2"
                        : "border-border flex flex-col gap-2 border-t pt-3"
                    }
                  >
                    {tab === "gap" ? (
                      <ul className="text-text list-disc space-y-1 pl-4.5 text-sm">
                        {entry.gaps.map((gap, i) => (
                          <li key={`${gap}-${i}`}>{gap}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-text text-sm whitespace-pre-line">
                        {entry.feedback}
                      </p>
                    )}
                    <p className="text-text-muted font-mono text-xs">
                      {new Date(entry.generatedAt).toLocaleString("ko-KR")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-3 shrink-0 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onRequest}
              isLoading={isLoading}
              className="text-accent hover:border-accent w-full justify-center rounded-lg py-2.5 font-semibold"
            >
              {tab === "gap" ? "공고 다시 분석하기" : "이력서 리뷰 다시 받기"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
