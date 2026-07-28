import type { HTMLAttributes } from "react";

/**
 * "불러오는 중..." 텍스트 대신 쓰는 로딩 플레이스홀더.
 * 너비/높이는 className으로 지정한다 (예: className="h-4 w-32").
 */
export function Skeleton({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["bg-surface-sunken animate-pulse rounded-sm", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}
