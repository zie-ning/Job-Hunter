import type { SelectHTMLAttributes } from "react";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

export function Select({ label, id, children, ...rest }: SelectFieldProps) {
  const inputId = id ?? label;
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <select id={inputId} {...rest}>
        {children}
      </select>
    </div>
  );
}
