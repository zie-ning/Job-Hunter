import { useId, type ReactNode } from "react";

interface FieldProps {
  label: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  id?: string;
  /** 래퍼(구조적 훅 "field" div)에 적용된다 — flex-1, min-w-56,
   * col-span-2 같은 레이아웃 합성용. 입력 요소 자체 스타일은
   * FIELD_INPUT_CLASSES를 쓰는 각 컴포넌트가 별도로 관리한다 */
  className?: string;
  children: (inputId: string) => ReactNode;
}

export const FIELD_INPUT_CLASSES =
  "w-full rounded-sm border border-border bg-bg text-text-strong px-3 py-2.5 text-base " +
  "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1";

/**
 * TextField/Textarea/Select의 공통 래퍼. "field" 클래스는 자체 스타일이
 * 없는 구조적 훅이다 — NewJdBranchModal의 `.jd-import-row .field`가
 * 아직 이 이름으로 레이아웃(flex-basis)을 조정한다. 실제 입력 요소
 * 스타일은 FIELD_INPUT_CLASSES를 각 컴포넌트가 자신의
 * input/select/textarea에 직접 적용한다.
 *
 * className은 이 래퍼 div에 적용한다 — 입력 요소에 적용하면 flex-1/
 * min-w-*처럼 "이 필드가 부모 레이아웃에서 얼마나 차지할지"를 정하는
 * 유틸리티가 무의미해진다(입력 요소는 flex/grid item이 아니라 래퍼의
 * 자식일 뿐이라 부모 flex 컨테이너의 크기 계산에 참여하지 못한다).
 * 실제로 BranchesPage의 검색 필드에서 flex-1이 적용되지 않아
 * min-w-56(224px) 그대로 잘리는 것으로 발견했다.
 *
 * id는 useId()로 생성한다 — 예전에는 `id ?? label`로 폴백해 한글
 * label 문자열이 그대로 DOM id가 되는 문제가 있었다.
 */
export function Field({
  label,
  helperText,
  error,
  required,
  id,
  className,
  children,
}: FieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div
      className={["field flex flex-col gap-1.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <label htmlFor={inputId} className="text-text text-sm font-medium">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children(inputId)}
      {helperText && !error && (
        <p id={helperId} className="text-text-muted text-xs">
          {helperText}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-danger text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
