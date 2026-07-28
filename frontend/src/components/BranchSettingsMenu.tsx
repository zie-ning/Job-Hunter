import { useEffect, useRef, useState } from "react";
import type { BranchStatus } from "../adapters/types";
import { BRANCH_STATUS_LABEL } from "../lib/branchStatus";
import { GearIcon } from "./icons";

const STATUS_OPTIONS: BranchStatus[] = [
  "undecided",
  "in_progress",
  "applied",
  "closed",
];

interface BranchSettingsMenuProps {
  status: BranchStatus;
  onChangeStatus: (status: BranchStatus) => void;
}

export function BranchSettingsMenu({
  status,
  onChangeStatus,
}: BranchSettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-label="브랜치 설정"
        onClick={() => setOpen((v) => !v)}
        className="border-border text-text hover:border-accent hover:text-text-strong flex h-8 w-8 items-center justify-center rounded-sm border transition-colors"
      >
        <GearIcon />
      </button>
      {open && (
        <div className="bg-surface shadow-e2 ring-border absolute top-9 right-0 z-10 flex w-45 flex-col gap-1.5 rounded-md p-3 ring-1">
          <label
            htmlFor="branch-status-select"
            className="text-text text-xs font-medium"
          >
            진행 상태
          </label>
          <select
            id="branch-status-select"
            value={status}
            onChange={(e) => {
              onChangeStatus(e.target.value as BranchStatus);
              setOpen(false);
            }}
            className="border-border bg-bg text-text-strong rounded-sm border px-2.5 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {BRANCH_STATUS_LABEL[option]}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
