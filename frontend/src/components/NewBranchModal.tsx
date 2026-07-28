import { useState, type FormEvent } from "react";
import type { Branch, JdMatch } from "../adapters/types";
import { Button } from "./Button";
import { TextField } from "./TextField";
import {
  BranchForkPicker,
  resolveForkContent,
  type ForkChoice,
} from "./BranchForkPicker";

interface NewBranchModalProps {
  branches: Branch[];
  matches: JdMatch[];
  onCreate: (name: string, initialContent: string) => void;
  onClose: () => void;
}

export function NewBranchModal({
  branches,
  matches,
  onCreate,
  onClose,
}: NewBranchModalProps) {
  const [name, setName] = useState("");
  const [fork, setFork] = useState<ForkChoice>({ type: "fresh" });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), resolveForkContent(fork, branches));
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <h3>범용 브랜치 새로 만들기</h3>
          <TextField
            label="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 제조 IT 마스터 이력서"
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
            <Button type="submit" disabled={!name.trim()}>
              만들기
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
