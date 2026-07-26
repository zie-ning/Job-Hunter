import type { TextareaHTMLAttributes } from "react";

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function Textarea({ label, id, ...rest }: TextareaFieldProps) {
  const inputId = id ?? label;
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <textarea id={inputId} {...rest} />
    </div>
  );
}
