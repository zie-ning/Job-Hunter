import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { mockResumeAdapter } from "../adapters/resumeAdapter";
import type { ResumeVersion } from "../adapters/types";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { DiffView } from "../components/DiffView";

export function ResumeVersionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [current, setCurrent] = useState<ResumeVersion | null>(null);
  const [previous, setPrevious] = useState<ResumeVersion | null>(null);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const all = await mockResumeAdapter.getVersions();
      const index = all.findIndex((v) => v.id === id);
      if (index === -1) return;
      setCurrent(all[index]);
      setPrevious(index > 0 ? all[index - 1] : null);
    })();
  }, [id]);

  if (!current) {
    return <Card>불러오는 중...</Card>;
  }

  return (
    <div className="version-detail-page">
      <Link to="/resumes">← 버전 목록으로</Link>
      <Card>
        <h2>{current.comment || "(코멘트 없음)"}</h2>
        <p className="version-meta">
          {new Date(current.createdAt).toLocaleString("ko-KR")}
        </p>
        {previous ? (
          <DiffView oldText={previous.content} newText={current.content} />
        ) : (
          <p>첫 번째 버전이라 비교할 이전 버전이 없습니다.</p>
        )}
      </Card>
      <div className="version-detail-actions">
        <Button variant="secondary" type="button" disabled>
          이 버전으로 브랜치 생성 (JD 매칭 화면에서 가능)
        </Button>
      </div>
    </div>
  );
}
