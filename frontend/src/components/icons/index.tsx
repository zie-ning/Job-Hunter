import type { SVGProps } from "react";

/**
 * 예전에는 ChevronIcon(BranchForkPicker.tsx), GearIcon(BranchSettingsMenu.tsx),
 * GapAnalysisIcon/ReviewIcon/CloseIcon(FeedbackHistoryPanel.tsx)이 각 컴포넌트
 * 파일 안에 따로 정의돼 stroke-width가 1.6~1.8로 제각각이었다. 여기서
 * 한 곳에 모으고 stroke-width 기본값을 1.75로 통일한다. 경로(path) 자체는
 * 기존 아이콘과 동일하게 유지해 시각적 변화를 만들지 않는다.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function IconBase({ size = 18, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <IconBase size={16} {...props}>
      <path d="M6 9l6 6 6-6" />
    </IconBase>
  );
}

export function GearIcon(props: IconProps) {
  return (
    <IconBase size={18} {...props}>
      <circle cx="12" cy="12" r="7.5" strokeDasharray="2.2 3.4" />
      <circle cx="12" cy="12" r="2.75" />
    </IconBase>
  );
}

export function GapAnalysisIcon(props: IconProps) {
  return (
    <IconBase size={20} {...props}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h4" />
      <path d="M9.5 16l1.5 1.5L14.5 14" />
    </IconBase>
  );
}

export function ReviewIcon(props: IconProps) {
  return (
    <IconBase size={20} {...props}>
      <path d="M4 20l1-4.2L15.8 5a1.5 1.5 0 0 1 2.1 0l1.1 1.1a1.5 1.5 0 0 1 0 2.1L8.2 19 4 20Z" />
      <path d="M13.5 6.5l4 4" />
    </IconBase>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <IconBase size={16} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </IconBase>
  );
}

export function ScoreUpIcon(props: IconProps) {
  return (
    <IconBase size={14} {...props}>
      <path d="M6 15l6-6 6 6" />
    </IconBase>
  );
}

export function ScoreDownIcon(props: IconProps) {
  return (
    <IconBase size={14} {...props}>
      <path d="M6 9l6 6 6-6" />
    </IconBase>
  );
}

export function ScoreFlatIcon(props: IconProps) {
  return (
    <IconBase size={14} {...props}>
      <path d="M5 12h14" />
    </IconBase>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <IconBase size={15} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.6-3.6" />
    </IconBase>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <IconBase size={13} fill="currentColor" stroke="none" {...props}>
      <path d="M12 2l2.9 6.3 6.9.8-5 4.7 1.3 6.8-6.1-3.4-6.1 3.4L7.2 13.8l-5-4.7 6.9-.8z" />
    </IconBase>
  );
}

export function KakaoIcon(props: IconProps) {
  return (
    <svg
      width={props.size || 18}
      height={props.size || 18}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3C6.477 3 2 6.477 2 10.765c0 2.766 1.83 5.19 4.606 6.586-.201.751-.726 2.721-.832 3.14-.132.525.193.518.406.377.168-.112 2.678-1.82 3.766-2.556.671.096 1.36.147 2.054.147 5.523 0 10-3.477 10-7.765C22 6.477 17.523 3 12 3z" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg
      width={props.size || 15}
      height={props.size || 15}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6h2v-6h5v-2l-2-2z" />
    </svg>
  );
}
