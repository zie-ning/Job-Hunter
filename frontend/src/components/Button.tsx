import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  isLoading = false,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  const classes = ["btn", `btn-${variant}`, className]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={classes} disabled={disabled || isLoading} {...rest}>
      {isLoading ? "처리 중..." : children}
    </button>
  );
}
