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
import { GapAnalysisSection } from "../components/GapAnalysisSection";
import { FeedbackHistoryPanel } from "../components/FeedbackHistoryPanel";
import { BranchSettingsMenu } from "../components/BranchSettingsMenu";

const PLACEHOLDER_PARSED_TEXT =
  "업로드한 파일에서 파싱된 이력서 내용입니다.\n\n실제 PDF 텍스트 추출은 Phase 4에서 구현됩니다.";

export function BranchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [match, setMatch] = useState<JdMatch | null>(null);
  // undefined: 아직 조회 전, [] : 조회 완료했으나 내역 없음.
  const [gapHistory, setGapHistory] = useState<
    GapAnalysisResult[] | undefined
  >(undefined);
  const [content, setContent] = useState("");
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingDefault, setIsTogglingDefault] = useState(false);
  const [isRequestingFeedback, setIsRequestingFeedback] = useState(false);

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
    setContent(
      branchResult.versions[branchResult.versions.length - 1].content,
    );
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
      const history = await mockBranchAdapter.getGapAnalysisHistory(
        branch.id,
      );
      setGapHistory(history);
    } finally {
      setIsRequestingFeedback(false);
    }
  }

  if (!branch) {
    return <Card>불러오는 중...</Card>;
  }

  if (branch.kind === "jd") {
    return (
      <div className="branch-detail-jd-layout">
        <FeedbackHistoryPanel
          history={gapHistory ?? []}
          isLoading={isRequestingFeedback}
          onRequest={handleRequestFeedback}
        />

        <div className="branch-main">
          <Card className="branch-meta-header">
            <div className="branch-meta-header-top">
              <div>
                <h2>{match?.company ?? "알 수 없는 공고"}</h2>
                <Badge tone={BRANCH_STATUS_TONE[branch.status]}>
                  {BRANCH_STATUS_LABEL[branch.status]}
                </Badge>
              </div>
              <BranchSettingsMenu
                status={branch.status}
                onChangeStatus={handleChangeStatus}
              />
            </div>
            <dl className="branch-meta-fields">
              <div className="branch-meta-row">
                <dt>직무</dt>
                <dd>{match?.title ?? "-"}</dd>
              </div>
              <div className="branch-meta-row">
                <dt>기술 스택</dt>
                <dd className="match-skills">
                  {match && match.skills.length > 0
                    ? match.skills.map((skill) => (
                        <Badge key={skill} tone="neutral">
                          {skill}
                        </Badge>
                      ))
                    : "-"}
                </dd>
              </div>
              <div className="branch-meta-row">
                <dt>공고 링크</dt>
                <dd>
                  {match?.applyUrl ? (
                    <a
                      href={match.applyUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      공고 보기 ↗
                    </a>
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div className="branch-meta-row">
                <dt>마감일</dt>
                <dd>
                  {match
                    ? new Date(match.deadline).toLocaleDateString("ko-KR")
                    : "-"}
                </dd>
              </div>
              <div className="branch-meta-row">
                <dt>매칭점수</dt>
                <dd className="match-score">
                  {match ? `${match.matchScore}점` : "-"}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <div className="branch-editor-header">
              <h3>이력서 편집</h3>
              <label className="branch-reupload">
                새 파일 업로드
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleUpload}
                  hidden
                />
              </label>
            </div>
            <form onSubmit={handleSave} className="branch-editor-form">
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
              <Button type="submit" isLoading={isSaving}>
                저장하고 새 버전 만들기
              </Button>
            </form>
          </Card>

          <Card>
            <h3>버전 이력 (커밋 로그)</h3>
            <ul className="branch-version-list">
              {[...branch.versions].reverse().map((version) => {
                const index = branch.versions.findIndex(
                  (v) => v.id === version.id,
                );
                const baseScore = match?.matchScore ?? 0;
                const before =
                  index === 0 ? baseScore : baseScore + index * 2 - 2;
                const after = baseScore + index * 2;
                return (
                  <li key={version.id} className="branch-version-item">
                    <Link
                      to={`/branches/${branch.id}/versions/${version.id}`}
                      className="branch-version-link"
                    >
                      <span>{version.comment || "(커밋 메시지 없음)"}</span>
                      <span className="version-meta">
                        {new Date(version.createdAt).toLocaleString("ko-KR")}
                      </span>
                    </Link>
                    {match && <ScoreDelta before={before} after={after} />}
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="branch-detail-page">
      <Card>
        <div className="branch-detail-header">
          <div>
            <h2>{branch.name}</h2>
            <p className="match-title">범용 브랜치</p>
          </div>
          <div className="branch-detail-badges">
            {branch.isDefault && <Badge tone="neutral">기본</Badge>}
            <Badge tone={BRANCH_STATUS_TONE[branch.status]}>
              {BRANCH_STATUS_LABEL[branch.status]}
            </Badge>
          </div>
        </div>
        <Button
          variant="secondary"
          type="button"
          onClick={handleToggleDefault}
          isLoading={isTogglingDefault}
        >
          {branch.isDefault ? "기본 브랜치 해제" : "기본 브랜치로 설정"}
        </Button>
      </Card>

      <Card>
        <div className="branch-editor-header">
          <h3>이력서 편집</h3>
          <label className="branch-reupload">
            새 파일 업로드
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleUpload}
              hidden
            />
          </label>
        </div>
        <form onSubmit={handleSave} className="branch-editor-form">
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
          <Button type="submit" isLoading={isSaving}>
            저장하고 새 버전 만들기
          </Button>
        </form>
      </Card>

      <Card>
        <h3>버전 이력 (커밋 로그)</h3>
        <ul className="branch-version-list">
          {[...branch.versions].reverse().map((version) => (
            <li key={version.id} className="branch-version-item">
              <Link
                to={`/branches/${branch.id}/versions/${version.id}`}
                className="branch-version-link"
              >
                <span>{version.comment || "(커밋 메시지 없음)"}</span>
                <span className="version-meta">
                  {new Date(version.createdAt).toLocaleString("ko-KR")}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {gapHistory !== undefined && (
          <GapAnalysisSection
            branchId={branch.id}
            initialResult={gapHistory[0] ?? null}
          />
        )}
      </Card>
    </div>
  );
}
