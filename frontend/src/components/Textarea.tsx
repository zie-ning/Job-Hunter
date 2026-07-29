import type { TextareaHTMLAttributes } from "react";
import { Field, FIELD_INPUT_CLASSES } from "./Field";

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helperText?: string;
  error?: string;
}

export function Textarea({
  label,
  helperText,
  error,
  id,
  className,
  ...rest
}: TextareaFieldProps) {
  return (
    <Field
      label={label}
      helperText={helperText}
      error={error}
      id={id}
      className={className}
    >
      {(inputId) => (
        <textarea
          id={inputId}
          className={[
            FIELD_INPUT_CLASSES,
            "min-h-40 resize-y font-mono text-sm",
          ].join(" ")}
          {...rest}
        />
      )}
    </Field>
  );
}
