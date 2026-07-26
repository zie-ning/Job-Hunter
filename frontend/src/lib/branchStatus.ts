import type { BranchStatus } from "../adapters/types";

export const BRANCH_STATUS_LABEL: Record<BranchStatus, string> = {
  in_progress: "진행중",
  applied: "지원완료",
  closed: "마감",
};

export const BRANCH_STATUS_TONE: Record<
  BranchStatus,
  "warning" | "positive" | "neutral"
> = {
  in_progress: "warning",
  applied: "positive",
  closed: "neutral",
};
