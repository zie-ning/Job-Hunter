import { useEffect, useRef, useState } from "react";
import type { BranchStatus } from "../adapters/types";
import { BRANCH_STATUS_LABEL } from "../lib/branchStatus";

const STATUS_OPTIONS: BranchStatus[] = [
  "undecided",
  "in_progress",
  "applied",
  "closed",
];

function GearIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="7.5" strokeDasharray="2.2 3.4" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}

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
    <div className="branch-settings" ref={rootRef}>
      <button
        type="button"
        className="branch-settings-trigger"
        aria-label="브랜치 설정"
        onClick={() => setOpen((v) => !v)}
      >
        <GearIcon />
      </button>
      {open && (
        <div className="branch-settings-popover">
          <label htmlFor="branch-status-select">진행 상태</label>
          <select
            id="branch-status-select"
            value={status}
            onChange={(e) => {
              onChangeStatus(e.target.value as BranchStatus);
              setOpen(false);
            }}
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
