import { useState, type FormEvent } from "react";
import type { Branch, JdMatch } from "../adapters/types";
import { Button } from "./Button";
import { Modal } from "./Modal";
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
    <Modal title="범용 브랜치 새로 만들기" onClose={onClose}>
      <form onSubmit={handleSubmit}>
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
    </Modal>
  );
}
