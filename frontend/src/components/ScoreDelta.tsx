interface ScoreDeltaProps {
  before: number;
  after: number;
}

export function ScoreDelta({ before, after }: ScoreDeltaProps) {
  const delta = after - before;
  const direction = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const sign = delta > 0 ? "+" : "";
  return (
    <span className={`score-delta score-delta-${direction}`}>
      {sign}
      {delta.toFixed(1)}%p
    </span>
  );
}
