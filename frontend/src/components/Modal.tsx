import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  title?: string;
  onClose: () => void;
  wide?: boolean;
  children: ReactNode;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * ForkPickerModal/NewBranchModal/NewJdBranchModal이 각자 복붙하던
 * .modal-overlay > .modal-content 마크업 + focus trap + Escape 닫기 +
 * 배경 스크롤 락을 이 컴포넌트 하나로 모은다.
 */
export function Modal({ title, onClose, wide = false, children }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const content = contentRef.current;
    const focusable =
      content?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    focusable?.[0]?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !content) return;
      const items = content.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    // modal-overlay/modal-content는 자체 스타일이 없는 구조적 훅이다 —
    // components.css의 .modal-content form / .modal-content > .fork-picker
    // 등 폼 레이아웃 규칙이 Step 6 전까지 이 이름으로 대상을 찾는다.
    <div
      className="modal-overlay animate-fade-in fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-6 pt-[10vh]"
      onClick={onClose}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={[
          "modal-content animate-fade-scale bg-surface shadow-e3 w-full rounded-lg p-6",
          wide ? "max-w-xl" : "max-w-md",
        ].join(" ")}
        onClick={(event) => event.stopPropagation()}
      >
        {title && (
          <h3 className="text-text-strong mb-4 text-lg font-semibold">
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
}
