import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockMatchAdapter } from "../adapters/matchAdapter";
import { mockBranchAdapter } from "../adapters/branchAdapter";
import type { Branch, JdMatch } from "../adapters/types";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";

interface DeadlineEvent {
  matchId: string;
  branchId: string;
  company: string;
  date: Date;
}

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export function CalendarPage() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<JdMatch[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [viewDate, setViewDate] = useState(() => new Date());

  useEffect(() => {
    void Promise.all([
      mockMatchAdapter.getMatches(),
      mockBranchAdapter.getBranches(),
    ]).then(([matchList, branchList]) => {
      setMatches(matchList);
      setBranches(branchList);
    });
  }, []);

  const events = useMemo<DeadlineEvent[]>(() => {
    return matches
      .map((match) => {
        const branch = branches.find(
          (b) => b.kind === "jd" && b.jdMatchId === match.id,
        );
        if (!branch) return null;
        return {
          matchId: match.id,
          branchId: branch.id,
          company: match.company,
          date: new Date(match.deadline),
        };
      })
      .filter((event): event is DeadlineEvent => event !== null);
  }, [matches, branches]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ day: number | null; events: DeadlineEvent[] }> = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ day: null, events: [] });
  }
  for (let day = 1; day <= totalDays; day++) {
    cells.push({
      day,
      events: events.filter(
        (event) =>
          event.date.getFullYear() === year &&
          event.date.getMonth() === month &&
          event.date.getDate() === day,
      ),
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
          >
            ← 이전 달
          </Button>
          {/* h2 태그는 index.css의 레거시 규칙과 충돌한다
              (docs/DESIGN.md §4 "알려진 한계" 참고) */}
          <div
            role="heading"
            aria-level={2}
            className="text-text-strong font-sans text-lg font-bold"
          >
            {year}년 {month + 1}월
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
          >
            다음 달 →
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="text-text-muted pb-2 text-center text-xs font-semibold"
            >
              {label}
            </div>
          ))}
          {cells.map((cell, index) => (
            <div
              key={index}
              className={[
                "flex min-h-22 flex-col gap-1 rounded-sm p-1.5",
                cell.day === null
                  ? "border border-transparent"
                  : "border-border bg-surface border",
              ].join(" ")}
            >
              {cell.day !== null && (
                <>
                  <span className="text-text-muted font-mono text-xs">
                    {cell.day}
                  </span>
                  {cell.events.map((event) => (
                    <button
                      key={event.matchId}
                      type="button"
                      title={event.company}
                      onClick={() => navigate(`/branches/${event.branchId}`)}
                      className="bg-accent-soft text-accent hover:bg-accent hover:text-accent-on truncate rounded-sm px-1.5 py-0.5 text-left text-xs font-medium transition-colors"
                    >
                      {event.company}
                    </button>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      </Card>

      {events.length === 0 && (
        <EmptyState
          title="표시할 마감일이 없습니다"
          description="브랜치를 만든 공고의 지원 마감일만 캘린더에 표시됩니다."
        />
      )}
    </div>
  );
}
