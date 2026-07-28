import { useState, type FormEvent } from "react";
import type { Branch, JdMatch } from "../adapters/types";
import type { CreateMatchInput } from "../adapters/matchAdapter";
import { Button } from "./Button";
import { TextField } from "./TextField";
import {
  BranchForkPicker,
  resolveForkContent,
  type ForkChoice,
} from "./BranchForkPicker";

interface NewJdBranchModalProps {
  branches: Branch[];
  matches: JdMatch[];
  onCreate: (input: CreateMatchInput, initialContent: string) => void;
  onClose: () => void;
}

export function NewJdBranchModal({
  branches,
  matches,
  onCreate,
  onClose,
}: NewJdBranchModalProps) {
  const [importUrl, setImportUrl] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [deadline, setDeadline] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [fork, setFork] = useState<ForkChoice>({ type: "fresh" });

  function handleImport() {
    const url = importUrl.trim();
    if (!url) return;
    setApplyUrl(url);
    setCompany((prev) => prev || "가져온 회사명 (확인 후 수정해주세요)");
    setTitle((prev) => prev || "가져온 직무 (확인 후 수정해주세요)");
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!company.trim() || !title.trim()) return;
    onCreate(
      {
        company: company.trim(),
        title: title.trim(),
        applyUrl: applyUrl.trim(),
        deadline: deadline ? new Date(deadline).toISOString() : "",
        skills: skillsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      },
      resolveForkContent(fork, branches),
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content-wide"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <h3>공고 브랜치 새로 만들기</h3>

          <div className="jd-import-row">
            <TextField
              label="공고 링크로 가져오기"
              placeholder="https://..."
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleImport}
              disabled={!importUrl.trim()}
            >
              가져오기
            </Button>
          </div>

          <p className="modal-divider-label">또는 직접 입력</p>

          <TextField
            label="회사명"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="예: 원티드랩"
          />
          <TextField
            label="직무"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 백엔드 엔지니어"
          />
          <TextField
            label="공고 링크"
            value={applyUrl}
            onChange={(e) => setApplyUrl(e.target.value)}
            placeholder="https://..."
          />
          <TextField
            label="마감일"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <TextField
            label="기술 스택 (쉼표로 구분)"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="예: Python, FastAPI, PostgreSQL"
          />

          <BranchForkPicker
            branches={branches}
            matches={matches}
            value={fork}
            onChange={setFork}
          />

          <div className="modal-actions">
            <Button variant="secondary" type="button" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={!company.trim() || !title.trim()}>
              만들기
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
