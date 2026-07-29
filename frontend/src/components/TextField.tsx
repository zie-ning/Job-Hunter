import type { InputHTMLAttributes } from "react";
import { Field, FIELD_INPUT_CLASSES } from "./Field";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export function TextField({
  label,
  helperText,
  error,
  id,
  className,
  ...rest
}: TextFieldProps) {
  return (
    <Field
      label={label}
      helperText={helperText}
      error={error}
      id={id}
      className={className}
    >
      {(inputId) => (
        <input id={inputId} className={FIELD_INPUT_CLASSES} {...rest} />
      )}
    </Field>
  );
}
