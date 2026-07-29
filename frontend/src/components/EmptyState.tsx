import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
      {icon && <div className="text-text-muted">{icon}</div>}
      <h3 className="text-text-strong text-lg font-semibold">{title}</h3>
      <p className="text-text -mt-1">{description}</p>
      {action}
    </div>
  );
}
