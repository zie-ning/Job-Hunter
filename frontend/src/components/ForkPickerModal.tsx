import { useState } from "react";
import type { Branch, JdMatch } from "../adapters/types";
import { Button } from "./Button";
import { Modal } from "./Modal";
import {
  BranchForkPicker,
  resolveForkContent,
  type ForkChoice,
} from "./BranchForkPicker";

interface ForkPickerModalProps {
  branches: Branch[];
  matches: JdMatch[];
  onConfirm: (initialContent: string) => void;
  onClose: () => void;
}

export function ForkPickerModal({
  branches,
  matches,
  onConfirm,
  onClose,
}: ForkPickerModalProps) {
  const [fork, setFork] = useState<ForkChoice>({ type: "fresh" });

  return (
    <Modal title="어떤 이력서로 브랜치를 시작할까요?" onClose={onClose}>
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
        <Button
          type="button"
          onClick={() => onConfirm(resolveForkContent(fork, branches))}
        >
          브랜치 만들기
        </Button>
      </div>
    </Modal>
  );
}
