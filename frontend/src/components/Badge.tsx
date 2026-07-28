interface BadgeProps {
  tone: "positive" | "warning" | "danger" | "neutral";
  size?: "sm" | "md";
  children: React.ReactNode;
}

const TONE_CLASSES: Record<BadgeProps["tone"], string> = {
  positive: "bg-positive-soft text-positive",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-neutral-soft text-neutral",
};

const SIZE_CLASSES: Record<NonNullable<BadgeProps["size"]>, string> = {
  sm: "px-1.5 py-px text-2xs",
  md: "px-2 py-0.5 text-xs",
};

export function Badge({ tone, size = "md", children }: BadgeProps) {
  const classes = [
    "inline-flex items-center rounded-sm font-semibold",
    TONE_CLASSES[tone],
    SIZE_CLASSES[size],
  ].join(" ");
  return <span className={classes}>{children}</span>;
}
