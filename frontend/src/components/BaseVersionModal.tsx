import { useEffect, useState } from "react";
import { mockResumeAdapter } from "../adapters/resumeAdapter";
import type { ResumeVersion } from "../adapters/types";
import { Button } from "./Button";

interface BaseVersionModalProps {
  onSelect: (versionId: string) => void;
  onClose: () => void;
}

export function BaseVersionModal({ onSelect, onClose }: BaseVersionModalProps) {
  const [versions, setVersions] = useState<ResumeVersion[] | null>(null);

  useEffect(() => {
    void mockResumeAdapter.getVersions().then(setVersions);
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>어떤 버전을 base로 브랜치를 시작할까요?</h3>
        {versions === null && <p>불러오는 중...</p>}
        {versions?.length === 0 && <p>먼저 이력서를 업로드해주세요.</p>}
        <ul className="modal-version-list">
          {versions
            ?.slice()
            .reverse()
            .map((version) => (
              <li key={version.id}>
                <button
                  type="button"
                  className="modal-version-item"
                  onClick={() => onSelect(version.id)}
                >
                  <span>{version.comment || "(코멘트 없음)"}</span>
                  <span className="version-meta">
                    {new Date(version.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </button>
              </li>
            ))}
        </ul>
        <Button variant="secondary" type="button" onClick={onClose}>
          취소
        </Button>
      </div>
    </div>
  );
}
