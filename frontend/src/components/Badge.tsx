interface BadgeProps {
  tone: "positive" | "warning" | "danger" | "neutral";
  children: React.ReactNode;
}

export function Badge({ tone, children }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
