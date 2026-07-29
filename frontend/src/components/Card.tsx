import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md";
  elevation?: "flat" | "raised";
}

const PADDING_CLASSES: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "p-3.5",
  md: "p-5",
};

const ELEVATION_CLASSES: Record<NonNullable<CardProps["elevation"]>, string> = {
  flat: "shadow-e1",
  raised: "shadow-e2",
};

/**
 * "card" 클래스는 자체 스타일을 갖지 않는 구조적 훅이다 — Step 6에서
 * 아직 재단하지 않은 .branch-main .card 같은 페이지 레벨 복합
 * 선택자가 이 이름으로 대상을 찾는다. 실제 배경·테두리·radius는
 * Tailwind 유틸리티로 이 엘리먼트에 직접 적용한다.
 */
export function Card({
  padding = "md",
  elevation = "flat",
  className,
  ...rest
}: CardProps) {
  const classes = [
    "card",
    "bg-surface rounded-lg ring-1 ring-border",
    PADDING_CLASSES[padding],
    ELEVATION_CLASSES[elevation],
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <div className={classes} {...rest} />;
}

export function CardHeader({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["border-border mb-3 border-b pb-3", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}

export function CardFooter({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["border-border mt-3 border-t pt-3", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}
