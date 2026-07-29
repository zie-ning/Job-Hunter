import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { mockBranchAdapter } from "../adapters/branchAdapter";
import type { ResumeVersion } from "../adapters/types";
import { Card } from "../components/Card";
import { DiffView } from "../components/DiffView";
import { Skeleton } from "../components/Skeleton";

export function BranchVersionDetailPage() {
  const { branchId, versionId } = useParams<{
    branchId: string;
    versionId: string;
  }>();
  const [current, setCurrent] = useState<ResumeVersion | null>(null);
  const [previous, setPrevious] = useState<ResumeVersion | null>(null);

  useEffect(() => {
    if (!branchId || !versionId) return;
    void (async () => {
      const branch = await mockBranchAdapter.getBranch(branchId);
      const index = branch.versions.findIndex((v) => v.id === versionId);
      if (index === -1) return;
      setCurrent(branch.versions[index]);
      setPrevious(index > 0 ? branch.versions[index - 1] : null);
    })();
  }, [branchId, versionId]);

  if (!current || !branchId) {
    return (
      <Card className="flex flex-col gap-3">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        to={`/branches/${branchId}`}
        className="text-accent hover:text-accent-hover w-fit text-sm font-medium"
      >
        ← 브랜치로 돌아가기
      </Link>
      <Card>
        {/* h2 태그는 index.css의 레거시 규칙과 충돌한다
            (docs/DESIGN.md §4 "알려진 한계" 참고) */}
        <div
          role="heading"
          aria-level={2}
          className="text-text-strong font-sans text-lg font-bold"
        >
          {current.comment || "(커밋 메시지 없음)"}
        </div>
        <p className="text-text-muted mt-1 font-mono text-xs">
          {new Date(current.createdAt).toLocaleString("ko-KR")}
        </p>
        <div className="mt-4">
          {previous ? (
            <DiffView oldText={previous.content} newText={current.content} />
          ) : (
            <p className="text-text text-sm">
              첫 번째 버전이라 비교할 이전 버전이 없습니다.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
