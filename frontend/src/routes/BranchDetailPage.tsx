import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { mockBranchAdapter } from "../adapters/branchAdapter";
import { mockMatchAdapter } from "../adapters/matchAdapter";
import type {
  Branch,
  BranchStatus,
  GapAnalysisResult,
  JdMatch,
} from "../adapters/types";
import { BRANCH_STATUS_LABEL, BRANCH_STATUS_TONE } from "../lib/branchStatus";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { Textarea } from "../components/Textarea";
import { ScoreDelta } from "../components/ScoreDelta";
import { FeedbackHistoryPanel } from "../components/FeedbackHistoryPanel";
import { BranchSettingsMenu } from "../components/BranchSettingsMenu";
import { Skeleton } from "../components/Skeleton";

const PLACEHOLDER_PARSED_TEXT =
  "업로드한 파일에서 파싱된 이력서 내용입니다.\n\n실제 PDF 텍스트 추출은 Phase 4에서 구현됩니다.";

/** div + role="heading" — <h2>/<h3> 태그는 index.css의 레거시 블랭킷
 * 규칙과 충돌한다(docs/DESIGN.md §4 "알려진 한계" 참고) */
function Heading({
  level,
  className,
  children,
}: {
  level: 2 | 3;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="heading"
      aria-level={level}
      className={["text-text-strong font-sans font-bold", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

function ReuploadLink({
  onUpload,
}: {
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="text-accent hover:text-accent-hover cursor-pointer text-sm font-medium">
      새 파일 업로드
      <input type="file" accept=".pdf,.doc,.docx" onChange={onUpload} hidden />
    </label>
  );
}

function VersionList({
  branch,
  match,
}: {
  branch: Branch;
  match: JdMatch | null;
}) {
  return (
    <ul className="mt-3 flex flex-col gap-2">
      {[...branch.versions].reverse().map((version) => {
        const index = branch.versions.findIndex((v) => v.id === version.id);
        const baseScore = match?.matchScore ?? 0;
        const before = index === 0 ? baseScore : baseScore + index * 2 - 2;
        const after = baseScore + index * 2;
        return (
          <li
            key={version.id}
            className="border-border flex items-center justify-between gap-3 rounded-sm border px-3 py-2.5"
          >
            <Link
              to={`/branches/${branch.id}/versions/${version.id}`}
              className="text-text-strong hover:text-accent flex min-w-0 flex-1 flex-col gap-0.5"
            >
              <span className="truncate text-sm">
                {version.comment || "(커밋 메시지 없음)"}
              </span>
              <span className="text-text-muted font-mono text-xs">
                {new Date(version.createdAt).toLocaleString("ko-KR")}
              </span>
            </Link>
            {match && <ScoreDelta before={before} after={after} />}
          </li>
        );
      })}
    </ul>
  );
}

export function BranchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [match, setMatch] = useState<JdMatch | null>(null);
  // undefined: 아직 조회 전, [] : 조회 완료했으나 내역 없음.
  const [gapHistory, setGapHistory] = useState<GapAnalysisResult[] | undefined>(
    undefined,
  );
  const [content, setContent] = useState("");
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingDefault, setIsTogglingDefault] = useState(false);
  const [isRequestingFeedback, setIsRequestingFeedback] = useState(false);

  const [isPanelOpen, setIsPanelOpen] = useState(true);

  useEffect(() => {
    if (!id) return;
    void loadBranch(id);
  }, [id]);

  async function loadBranch(branchId: string) {
    const [branchResult, matches, history] = await Promise.all([
      mockBranchAdapter.getBranch(branchId),
      mockMatchAdapter.getMatches(),
      mockBranchAdapter.getGapAnalysisHistory(branchId),
    ]);
    setBranch(branchResult);
    setMatch(
      branchResult.kind === "jd"
        ? (matches.find((m) => m.id === branchResult.jdMatchId) ?? null)
        : null,
    );
    setContent(branchResult.versions[branchResult.versions.length - 1].content);
    setGapHistory(history);
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!branch || !file) return;
    await mockBranchAdapter.addVersion(
      branch.id,
      PLACEHOLDER_PARSED_TEXT,
      `${file.name} 업로드`,
    );
    await loadBranch(branch.id);
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!branch) return;
    setIsSaving(true);
    try {
      await mockBranchAdapter.addVersion(branch.id, content, comment);
      setComment("");
      await loadBranch(branch.id);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleDefault() {
    if (!branch) return;
    setIsTogglingDefault(true);
    try {
      const updated = await mockBranchAdapter.setDefaultBranch(
        branch.id,
        !branch.isDefault,
      );
      setBranch(updated);
    } finally {
      setIsTogglingDefault(false);
    }
  }

  async function handleChangeStatus(status: BranchStatus) {
    if (!branch) return;
    const updated = await mockBranchAdapter.updateStatus(branch.id, status);
    setBranch(updated);
  }

  async function handleRequestFeedback() {
    if (!branch) return;
    setIsRequestingFeedback(true);
    try {
      await mockBranchAdapter.requestGapAnalysis(branch.id);
      const history = await mockBranchAdapter.getGapAnalysisHistory(branch.id);
      setGapHistory(history);
    } finally {
      setIsRequestingFeedback(false);
    }
  }

  if (!branch) {
    return (
      <Card className="flex flex-col gap-3">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-32 w-full" />
      </Card>
    );
  }

  if (branch.kind === "jd") {
    return (
      <div
        className={[
          "branch-detail-jd-layout",
          isPanelOpen ? "panel-open" : "panel-closed",
        ].join(" ")}
      >
        <FeedbackHistoryPanel
          history={gapHistory ?? []}
          isLoading={isRequestingFeedback}
          onRequest={handleRequestFeedback}
          isOpen={isPanelOpen}
          onToggleOpen={setIsPanelOpen}
        />

        <div className="branch-main">
          <Card>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <Heading level={2} className="mb-1.5 text-lg">
                  {match?.company ?? "알 수 없는 공고"}
                </Heading>
                <Badge tone={BRANCH_STATUS_TONE[branch.status]}>
                  {BRANCH_STATUS_LABEL[branch.status]}
                </Badge>
              </div>
              <BranchSettingsMenu
                status={branch.status}
                onChangeStatus={handleChangeStatus}
                isDefault={branch.isDefault}
                onToggleDefault={handleToggleDefault}
                isTogglingDefault={isTogglingDefault}
              />
            </div>
            {/* branch-meta-fields는 84px/1fr 2열 grid 구조만 담당하는
                CSS 훅이다 — 대괄호 임의값(grid-cols-[84px_1fr]) 대신
                재사용되지 않는 이 한 번뿐인 레이아웃은 작은 구조적
                클래스로 유지한다(docs/DESIGN.md §5 금지 규칙) */}
            <dl className="branch-meta-fields">
              <div className="contents">
                <dt className="text-text text-sm">직무</dt>
                <dd className="text-text-strong m-0 flex flex-wrap items-center gap-1.5 text-sm">
                  {match?.title ?? "-"}
                </dd>
              </div>
              <div className="contents">
                <dt className="text-text text-sm">기술 스택</dt>
                <dd className="text-text-strong m-0 flex flex-wrap items-center gap-1.5 text-sm">
                  {match && match.skills.length > 0
                    ? match.skills.map((skill) => (
                        <Badge key={skill} tone="neutral">
                          {skill}
                        </Badge>
                      ))
                    : "-"}
                </dd>
              </div>
              <div className="contents">
                <dt className="text-text text-sm">공고 링크</dt>
                <dd className="text-text-strong m-0 flex flex-wrap items-center gap-1.5 text-sm">
                  {match?.applyUrl ? (
                    <a
                      href={match.applyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:text-accent-hover"
                    >
                      공고 보기 ↗
                    </a>
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div className="contents">
                <dt className="text-text text-sm">마감일</dt>
                <dd className="text-text-strong m-0 flex flex-wrap items-center gap-1.5 text-sm">
                  {match
                    ? new Date(match.deadline).toLocaleDateString("ko-KR")
                    : "-"}
                </dd>
              </div>
              <div className="contents">
                <dt className="text-text text-sm">매칭점수</dt>
                <dd className="text-accent m-0 flex flex-wrap items-center gap-1.5 font-mono text-sm font-bold">
                  {match ? `${match.matchScore}점` : "-"}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <Heading level={3} className="text-base">
                이력서 편집
              </Heading>
              <ReuploadLink onUpload={handleUpload} />
            </div>
            <form onSubmit={handleSave} className="mt-4 flex flex-col gap-4">
              <Textarea
                label="이력서 내용"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <TextField
                label="커밋 메시지 (선택)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="이번에 무엇을 바꿨는지 짧게 남겨보세요"
              />
              <Button type="submit" isLoading={isSaving} className="self-start">
                저장하고 새 버전 만들기
              </Button>
            </form>
          </Card>

          <Card>
            <Heading level={3} className="text-base">
              버전 이력 (커밋 로그)
            </Heading>
            <VersionList branch={branch} match={match} />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "branch-detail-jd-layout",
        isPanelOpen ? "panel-open" : "panel-closed",
      ].join(" ")}
    >
      <FeedbackHistoryPanel
        history={gapHistory ?? []}
        isLoading={isRequestingFeedback}
        onRequest={handleRequestFeedback}
        isOpen={isPanelOpen}
        onToggleOpen={setIsPanelOpen}
        hideGapTab
      />

      <div className="branch-main">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <Heading level={2} className="mb-1 text-lg">
                {branch.name}
              </Heading>
              <p className="text-text text-sm">범용 브랜치</p>
            </div>
            <BranchSettingsMenu
              status={branch.status}
              onChangeStatus={handleChangeStatus}
              isDefault={branch.isDefault}
              onToggleDefault={handleToggleDefault}
              isTogglingDefault={isTogglingDefault}
            />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <Heading level={3} className="text-base">
              이력서 편집
            </Heading>
            <ReuploadLink onUpload={handleUpload} />
          </div>
          <form onSubmit={handleSave} className="mt-4 flex flex-col gap-4">
            <Textarea
              label="이력서 내용"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <TextField
              label="커밋 메시지 (선택)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="이번에 무엇을 바꿨는지 짧게 남겨보세요"
            />
            <Button type="submit" isLoading={isSaving} className="self-start">
              저장하고 새 버전 만들기
            </Button>
          </form>
        </Card>

        <Card>
          <Heading level={3} className="text-base">
            버전 이력 (커밋 로그)
          </Heading>
          <VersionList branch={branch} match={null} />
        </Card>
      </div>
    </div>
  );
}
