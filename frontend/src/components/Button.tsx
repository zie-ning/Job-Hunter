import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "./Spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: ReactNode;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-accent text-accent-on shadow-e1 hover:bg-accent-hover hover:shadow-e2 hover:-translate-y-px",
  secondary:
    "bg-surface text-text-strong shadow-e1 ring-1 ring-border hover:shadow-e2 hover:-translate-y-px",
  ghost: "bg-transparent text-text hover:bg-surface-sunken",
  danger:
    "bg-danger text-accent-on shadow-e1 hover:brightness-95 hover:shadow-e2 hover:-translate-y-px",
};

const SIZE_CLASSES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-3.5 py-2 text-sm gap-2",
  lg: "px-4 py-2.5 text-base gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center rounded-sm font-semibold",
    "transition-[background-color,box-shadow,transform] duration-150",
    "disabled:pointer-events-none disabled:opacity-50",
    "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={disabled || isLoading} {...rest}>
      {isLoading ? <Spinner size={size === "sm" ? 13 : 15} /> : icon}
      {children}
    </button>
  );
}
