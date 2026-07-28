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
    <div className="version-detail-page">
      <Link to={`/branches/${branchId}`}>← 브랜치로 돌아가기</Link>
      <Card>
        <h2>{current.comment || "(커밋 메시지 없음)"}</h2>
        <p className="version-meta">
          {new Date(current.createdAt).toLocaleString("ko-KR")}
        </p>
        {previous ? (
          <DiffView oldText={previous.content} newText={current.content} />
        ) : (
          <p>첫 번째 버전이라 비교할 이전 버전이 없습니다.</p>
        )}
      </Card>
    </div>
  );
}
