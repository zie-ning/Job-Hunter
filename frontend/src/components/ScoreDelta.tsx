import { ScoreUpIcon, ScoreDownIcon, ScoreFlatIcon } from "./icons";

interface ScoreDeltaProps {
  before: number;
  after: number;
}

const TONE_CLASSES = {
  up: "text-positive",
  down: "text-danger",
  flat: "text-neutral",
} as const;

const ICONS = {
  up: ScoreUpIcon,
  down: ScoreDownIcon,
  flat: ScoreFlatIcon,
} as const;

export function ScoreDelta({ before, after }: ScoreDeltaProps) {
  const delta = after - before;
  const direction = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const sign = delta > 0 ? "+" : "";
  const Icon = ICONS[direction];
  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-semibold tabular-nums ${TONE_CLASSES[direction]}`}
    >
      <Icon />
      {sign}
      {delta.toFixed(1)}%p
    </span>
  );
}
