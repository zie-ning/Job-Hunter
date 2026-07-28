import type { SelectHTMLAttributes } from "react";
import { Field, FIELD_INPUT_CLASSES } from "./Field";
import { ChevronDownIcon } from "./icons";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  helperText?: string;
  error?: string;
}

export function Select({
  label,
  helperText,
  error,
  id,
  className,
  children,
  ...rest
}: SelectFieldProps) {
  return (
    <Field
      label={label}
      helperText={helperText}
      error={error}
      id={id}
      className={className}
    >
      {(inputId) => (
        <div className="relative">
          <select
            id={inputId}
            className={[FIELD_INPUT_CLASSES, "cursor-pointer appearance-none pr-8"].join(
              " ",
            )}
            {...rest}
          >
            {children}
          </select>
          <ChevronDownIcon className="text-text-muted pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2" />
        </div>
      )}
    </Field>
  );
}
