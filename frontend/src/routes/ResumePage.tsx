import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { mockResumeAdapter } from "../adapters/resumeAdapter";
import type { ResumeVersion } from "../adapters/types";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { Textarea } from "../components/Textarea";

const PLACEHOLDER_PARSED_TEXT =
  "업로드한 파일에서 파싱된 이력서 내용입니다.\n\n실제 PDF 텍스트 추출은 Phase 4에서 구현됩니다.";

export function ResumePage() {
  const [versions, setVersions] = useState<ResumeVersion[] | null>(null);
  const [content, setContent] = useState("");
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void loadVersions();
  }, []);

  async function loadVersions() {
    const result = await mockResumeAdapter.getVersions();
    setVersions(result);
    if (result.length > 0) {
      setContent(result[result.length - 1].content);
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await mockResumeAdapter.saveVersion(
      PLACEHOLDER_PARSED_TEXT,
      `${file.name} 업로드`,
    );
    await loadVersions();
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await mockResumeAdapter.saveVersion(content, comment);
      setComment("");
      await loadVersions();
    } finally {
      setIsSaving(false);
    }
  }

  if (versions === null) {
    return <Card>불러오는 중...</Card>;
  }

  if (versions.length === 0) {
    return (
      <Card>
        <h2>이력서를 업로드해주세요</h2>
        <p>
          PDF 또는 문서 파일을 업로드하면 텍스트로 파싱되어 에디터에서 편집할 수
          있습니다.
        </p>
        <input type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} />
      </Card>
    );
  }

  return (
    <div className="resume-page">
      <Card>
        <div className="resume-editor-header">
          <h2>이력서 에디터</h2>
          <label className="resume-reupload">
            새 파일 업로드
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleUpload}
              hidden
            />
          </label>
        </div>
        <form onSubmit={handleSave} className="resume-editor-form">
          <Textarea
            label="이력서 내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <TextField
            label="코멘트 (선택)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="이번에 무엇을 바꿨는지 짧게 남겨보세요"
          />
          <Button type="submit" isLoading={isSaving}>
            저장하고 새 버전 만들기
          </Button>
        </form>
      </Card>

      <Card>
        <h2>버전 목록</h2>
        <ul className="version-list">
          {[...versions].reverse().map((version) => (
            <li key={version.id}>
              <Link
                to={`/resumes/versions/${version.id}`}
                className="version-item"
              >
                <span className="version-comment">
                  {version.comment || "(코멘트 없음)"}
                </span>
                <span className="version-meta">
                  {new Date(version.createdAt).toLocaleDateString("ko-KR")} ·
                  매칭 점수 변화 —
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
