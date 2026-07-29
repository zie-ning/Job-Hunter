import { useState } from "react";
import type { Branch, JdMatch } from "../adapters/types";
import { Button } from "./Button";
import { ChevronDownIcon } from "./icons";

export type ForkChoice =
  { type: "fresh" } | { type: "branch"; branchId: string };

export function resolveForkContent(
  choice: ForkChoice,
  branches: Branch[],
): string {
  if (choice.type === "branch") {
    const branch = branches.find((b) => b.id === choice.branchId);
    if (branch) return branch.versions[branch.versions.length - 1].content;
  }
  return "";
}

function lastModifiedAt(branch: Branch): string {
  return branch.versions[branch.versions.length - 1].createdAt;
}

function branchLabel(branch: Branch, matches: JdMatch[]): string {
  if (branch.kind === "general") return branch.name;
  const match = matches.find((m) => m.id === branch.jdMatchId);
  return match ? `${match.company} · ${match.title}` : "알 수 없는 공고";
}

interface BranchForkPickerProps {
  branches: Branch[];
  matches: JdMatch[];
  value: ForkChoice;
  onChange: (choice: ForkChoice) => void;
}

export function BranchForkPicker({
  branches,
  matches,
  value,
  onChange,
}: BranchForkPickerProps) {
  const [open, setOpen] = useState(false);

  const sortedBranches = [...branches].sort((a, b) => {
    if (!!a.isDefault !== !!b.isDefault) return a.isDefault ? -1 : 1;
    return lastModifiedAt(b).localeCompare(lastModifiedAt(a));
  });

  const selectedBranch =
    value.type === "branch"
      ? branches.find((b) => b.id === value.branchId)
      : undefined;
  const selectedLabel =
    value.type === "fresh"
      ? "새로 시작하기"
      : (selectedBranch && branchLabel(selectedBranch, matches)) ||
        "브랜치를 선택하세요";

  return (
    <div className="fork-picker">
      <span className="fork-picker-label">브랜치 선택</span>
      <button
        type="button"
        className="fork-picker-toggle"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{selectedLabel}</span>
        <ChevronDownIcon
          className={open ? "fork-picker-chevron open" : "fork-picker-chevron"}
        />
      </button>

      {open && (
        <ul className="fork-picker-list">
          {sortedBranches.length === 0 && (
            <li className="fork-picker-empty">
              선택할 수 있는 브랜치가 없습니다.
            </li>
          )}
          {sortedBranches.map((branch) => (
            <li key={branch.id}>
              <button
                type="button"
                className={
                  value.type === "branch" && value.branchId === branch.id
                    ? "fork-picker-item active"
                    : "fork-picker-item"
                }
                onClick={() => {
                  onChange({ type: "branch", branchId: branch.id });
                  setOpen(false);
                }}
              >
                <span>{branchLabel(branch, matches)}</span>
                <span className="version-meta">
                  최근 수정{" "}
                  <span className="font-mono">
                    {new Date(lastModifiedAt(branch)).toLocaleDateString(
                      "ko-KR",
                    )}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant={value.type === "fresh" ? "primary" : "secondary"}
        onClick={() => {
          onChange({ type: "fresh" });
          setOpen(false);
        }}
      >
        새로 시작하기
      </Button>
    </div>
  );
}
