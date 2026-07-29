interface DiffViewProps {
  oldText: string;
  newText: string;
}

type DiffLine = { text: string; type: "added" | "removed" | "unchanged" };

function computeLineDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const m = oldLines.length;
  const n = newLines.length;

  const lcs: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  );
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      lcs[i][j] =
        oldLines[i] === newLines[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (oldLines[i] === newLines[j]) {
      result.push({ text: oldLines[i], type: "unchanged" });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      result.push({ text: oldLines[i], type: "removed" });
      i++;
    } else {
      result.push({ text: newLines[j], type: "added" });
      j++;
    }
  }
  while (i < m) {
    result.push({ text: oldLines[i], type: "removed" });
    i++;
  }
  while (j < n) {
    result.push({ text: newLines[j], type: "added" });
    j++;
  }
  return result;
}

const ROW_CLASSES: Record<DiffLine["type"], string> = {
  unchanged: "text-text",
  added: "bg-positive-soft text-positive",
  removed: "bg-danger-soft text-danger",
};

export function DiffView({ oldText, newText }: DiffViewProps) {
  const lines = computeLineDiff(oldText, newText);
  let oldNo = 0;
  let newNo = 0;

  return (
    <div className="border-border overflow-hidden rounded-lg border font-mono text-sm">
      {lines.map((line, index) => {
        if (line.type !== "added") oldNo++;
        if (line.type !== "removed") newNo++;
        return (
          <div
            key={index}
            className={`flex gap-3 px-1 whitespace-pre-wrap ${ROW_CLASSES[line.type]}`}
          >
            <span className="text-text-muted w-5 shrink-0 text-right tabular-nums select-none">
              {line.type !== "added" ? oldNo : ""}
            </span>
            <span className="text-text-muted w-5 shrink-0 text-right tabular-nums select-none">
              {line.type !== "removed" ? newNo : ""}
            </span>
            <span className="select-none">
              {line.type === "added"
                ? "+"
                : line.type === "removed"
                  ? "-"
                  : " "}
            </span>
            <span>{line.text}</span>
          </div>
        );
      })}
    </div>
  );
}
