interface ScoreGaugeProps {
  score: number;
  size?: number;
}

/**
 * conic-gradient 링 게이지. 고득점(80 이상)은 --positive, 그 외는
 * --accent로 색을 나눠 데이터 강조를 준다 — 새 색을 추가하지 않고
 * 기존 시맨틱 토큰만 재사용한다 (docs/DESIGN.md 참고).
 * conic-gradient/mask는 Tailwind 유틸리티가 없는 효과라 링 자체에만
 * 인라인 style을 쓴다 (동적 값 예외, §5 금지 규칙).
 */
export function ScoreGauge({ score, size = 64 }: ScoreGaugeProps) {
  const tone = score >= 80 ? "var(--positive)" : "var(--accent)";
  return (
    <div
      className="relative grid shrink-0 place-items-center rounded-full"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${tone} ${score}%, var(--border) 0)`,
          mask: "radial-gradient(farthest-side, transparent 76%, #000 78%)",
          WebkitMask:
            "radial-gradient(farthest-side, transparent 76%, #000 78%)",
        }}
      />
      <div className="relative text-center leading-none">
        <div className="text-text-strong font-mono text-lg font-bold tabular-nums">
          {score}
        </div>
      </div>
    </div>
  );
}
