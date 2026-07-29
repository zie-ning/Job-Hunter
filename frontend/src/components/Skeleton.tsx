import type { HTMLAttributes } from "react";

/**
 * "불러오는 중..." 텍스트 대신 쓰는 로딩 플레이스홀더.
 * 너비/높이는 className으로 지정한다 (예: className="h-4 w-32").
 * 하이라이트 밴드가 좌우로 스치는 shimmer 애니메이션 — prefers-reduced-motion
 * 환경에서는 애니메이션 없이 정적 그라디언트만 보인다.
 */
export function Skeleton({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "skeleton-shimmer-bg animate-shimmer motion-reduce:animate-none rounded-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}
