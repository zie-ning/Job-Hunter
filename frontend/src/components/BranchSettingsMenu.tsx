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
  isDefault?: boolean;
  onToggleDefault?: () => void;
  isTogglingDefault?: boolean;
}

export function BranchSettingsMenu({
  status,
  onChangeStatus,
  isDefault,
  onToggleDefault,
  isTogglingDefault,
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
        className="text-text-muted hover:text-text-strong flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm transition-colors"
      >
        <GearIcon size={20} />
      </button>
      {open && (
        <div className="bg-surface shadow-e2 ring-border absolute top-9 right-0 z-10 flex w-48 flex-col gap-2 rounded-md p-3 ring-1">
          {onToggleDefault && (
            <button
              type="button"
              onClick={() => {
                onToggleDefault();
                setOpen(false);
              }}
              disabled={isTogglingDefault}
              className="hover:bg-surface-sunken text-text-strong flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-xs font-medium transition-colors"
            >
              <span>기본 브랜치</span>
              <span
                className={
                  isDefault ? "text-accent font-semibold" : "text-text-muted"
                }
              >
                {isDefault ? "설정됨 ✓" : "설정 안 됨"}
              </span>
            </button>
          )}

          <div
            className={
              onToggleDefault
                ? "border-border flex flex-col gap-1 border-t pt-2"
                : "flex flex-col gap-1"
            }
          >
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
              className="border-border bg-bg text-text-strong cursor-pointer rounded-sm border px-2.5 py-1.5 text-xs"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {BRANCH_STATUS_LABEL[option]}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
