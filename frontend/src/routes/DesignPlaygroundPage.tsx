import { useState } from "react";
import { Button } from "../components/Button";
import { Card, CardHeader, CardFooter } from "../components/Card";
import { Badge } from "../components/Badge";
import { TextField } from "../components/TextField";
import { Textarea } from "../components/Textarea";
import { Select } from "../components/Select";
import { Modal } from "../components/Modal";
import { Skeleton } from "../components/Skeleton";
import { Spinner } from "../components/Spinner";
import { EmptyState } from "../components/EmptyState";
import { ScoreDelta } from "../components/ScoreDelta";
import { DiffView } from "../components/DiffView";
import {
  GapAnalysisIcon,
  GearIcon,
  ChevronDownIcon,
} from "../components/icons";

/**
 * 개발 전용 디자인 시스템 검증 페이지. App.tsx에서 import.meta.env.DEV일
 * 때만 마운트되어 프로덕션 번들에는 포함되지 않는다.
 *
 * 목적: 7개 라우트를 일일이 돌아다니지 않고 스크린샷 1장으로 토큰·
 * 컴포넌트 전체 상태를 검증한다. docs/DESIGN.md와 함께 갱신한다.
 */

const COLOR_TOKENS: Array<{ label: string; className: string }> = [
  { label: "bg", className: "bg-bg" },
  { label: "surface", className: "bg-surface" },
  { label: "surface-sunken", className: "bg-surface-sunken" },
  { label: "border", className: "bg-border" },
  { label: "accent", className: "bg-accent" },
  { label: "accent-hover", className: "bg-accent-hover" },
  { label: "accent-soft", className: "bg-accent-soft" },
  { label: "positive", className: "bg-positive" },
  { label: "positive-soft", className: "bg-positive-soft" },
  { label: "warning", className: "bg-warning" },
  { label: "warning-soft", className: "bg-warning-soft" },
  { label: "danger", className: "bg-danger" },
  { label: "danger-soft", className: "bg-danger-soft" },
  { label: "neutral", className: "bg-neutral" },
  { label: "neutral-soft", className: "bg-neutral-soft" },
];

const TEXT_TOKENS: Array<{ label: string; className: string; px: string }> = [
  { label: "text-2xs", className: "text-2xs", px: "11px" },
  { label: "text-xs", className: "text-xs", px: "12px" },
  { label: "text-sm", className: "text-sm", px: "13px" },
  { label: "text-base", className: "text-base", px: "15px" },
  { label: "text-md", className: "text-md", px: "16px" },
  { label: "text-lg", className: "text-lg", px: "18px" },
  { label: "text-xl", className: "text-xl", px: "21px" },
  { label: "text-2xl", className: "text-2xl", px: "25px" },
  { label: "text-3xl", className: "text-3xl", px: "32px" },
];

const RADIUS_TOKENS = [
  { label: "radius-sm", className: "rounded-sm" },
  { label: "radius-md", className: "rounded-md" },
  { label: "radius-lg", className: "rounded-lg" },
];

const SHADOW_TOKENS = [
  { label: "shadow-e1", className: "shadow-e1" },
  { label: "shadow-e2", className: "shadow-e2" },
  { label: "shadow-e3", className: "shadow-e3" },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      {/* div + role="heading"을 쓴다 — <h2> 태그는 index.css의 레거시
          블랭킷 규칙(font-size:24px 등, Step 6 전까지 다른 미전환
          페이지가 의존해 삭제 불가) 대상이라 Tailwind 유틸리티와
          충돌한다. 접근성 트리에는 동일하게 heading level 2로 노출된다 */}
      <div
        role="heading"
        aria-level={2}
        className="text-text-strong border-border border-b pb-2 font-sans text-xl font-bold"
      >
        {title}
      </div>
      {children}
    </section>
  );
}

export function DesignPlaygroundPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [motionKey, setMotionKey] = useState(0);

  return (
    // body는 Step 6 전까지 index.css의 예전 --sans 토큰을 상속하므로
    // 페이지 전반에 font-sans를 명시적으로 건다
    <div className="mx-auto flex max-w-(--container-wide) flex-col gap-12 p-8">
      <header>
        {/* div + role="heading"을 쓴다 — <h1> 태그는 index.css의 레거시
            블랭킷 규칙(font-size:56px 등) 대상이라 Tailwind 유틸리티와
            충돌한다. Section 컴포넌트의 주석 참고 */}
        <div
          role="heading"
          aria-level={1}
          className="text-text-strong font-sans text-3xl font-bold"
        >
          Design Playground
        </div>
        <p className="text-text mt-1">
          docs/DESIGN.md와 1:1 대응하는 토큰·컴포넌트 검증 페이지. 개발
          환경에서만 마운트된다.
        </p>
      </header>

      <Section title="색상 토큰">
        <p className="text-text-muted text-sm">
          다크 모드는 OS 설정을 따른다(prefers-color-scheme) — OS에서 전환 후
          새로고침해 확인한다.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {COLOR_TOKENS.map((t) => (
            <div key={t.label} className="flex flex-col gap-1.5">
              <div
                className={`border-border h-14 rounded-md border ${t.className}`}
              />
              <span className="text-text font-mono text-xs">{t.label}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="타입 스케일">
        <div className="flex flex-col gap-2">
          {TEXT_TOKENS.map((t) => (
            <div key={t.label} className="flex items-baseline gap-4">
              <span className="text-text-muted w-24 shrink-0 font-mono text-xs">
                {t.label} ({t.px})
              </span>
              <span className={`text-text-strong ${t.className}`}>
                브랜치 목록에서 매칭 점수를 확인하세요
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Radius / Elevation">
        <div className="flex flex-wrap gap-6">
          {RADIUS_TOKENS.map((t) => (
            <div key={t.label} className="flex flex-col items-center gap-2">
              <div
                className={`bg-surface ring-border h-16 w-16 ring-1 ${t.className}`}
              />
              <span className="text-text-muted font-mono text-xs">
                {t.label}
              </span>
            </div>
          ))}
          {SHADOW_TOKENS.map((t) => (
            <div key={t.label} className="flex flex-col items-center gap-2">
              <div
                className={`bg-surface h-16 w-16 rounded-md ${t.className}`}
              />
              <span className="text-text-muted font-mono text-xs">
                {t.label}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="모션">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={() => setMotionKey((k) => k + 1)}
          >
            다시 재생
          </Button>
          <div
            key={motionKey}
            className="animate-fade-scale bg-accent-soft text-accent rounded-md px-4 py-2 text-sm font-semibold"
          >
            fade-scale (--ease-out-expo)
          </div>
        </div>
      </Section>

      <Section title="Button">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <Button variant="primary" isLoading>
            로딩 중 라벨 유지
          </Button>
          <Button variant="secondary" icon={<GearIcon size={15} />}>
            아이콘 슬롯
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">sm</Button>
          <Button size="md">md</Button>
          <Button size="lg">lg</Button>
        </div>
      </Section>

      <Section title="Badge">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="positive">positive</Badge>
          <Badge tone="warning">warning</Badge>
          <Badge tone="danger">danger</Badge>
          <Badge tone="neutral">neutral</Badge>
          <Badge tone="positive" size="sm">
            sm
          </Badge>
        </div>
      </Section>

      <Section title="Card">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card padding="sm" elevation="flat">
            padding=sm, elevation=flat
          </Card>
          <Card padding="md" elevation="raised">
            padding=md, elevation=raised
          </Card>
          <Card padding="md">
            <CardHeader>헤더 슬롯</CardHeader>
            본문
            <CardFooter>푸터 슬롯</CardFooter>
          </Card>
        </div>
      </Section>

      <Section title="입력 필드">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextField label="기본" placeholder="placeholder" />
          <TextField
            label="에러 상태"
            defaultValue="잘못된 값"
            error="이메일 형식이 아닙니다."
          />
          <TextField label="도움말 텍스트" helperText="빈 값을 허용합니다." />
          <Select label="Select (커스텀 화살표)">
            <option>진행중</option>
            <option>지원완료</option>
          </Select>
          <Textarea
            label="Textarea"
            defaultValue="여러 줄 입력 예시입니다."
            className="md:col-span-2"
          />
        </div>
      </Section>

      <Section title="Modal">
        <Button className="self-start" onClick={() => setIsModalOpen(true)}>
          모달 열기
        </Button>
        {isModalOpen && (
          <Modal title="예시 모달" onClose={() => setIsModalOpen(false)}>
            <p className="text-text text-sm">
              focus trap · Escape 닫기 · 스크롤 락 · fade/scale 애니메이션이
              모두 이 컴포넌트 하나에 있다.
            </p>
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                닫기
              </Button>
            </div>
          </Modal>
        )}
      </Section>

      <Section title="Skeleton / Spinner">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex items-center gap-3">
          <Spinner />
          <Spinner size={24} />
        </div>
      </Section>

      <Section title="EmptyState">
        <EmptyState
          icon={<GapAnalysisIcon size={32} />}
          title="아직 항목이 없습니다"
          description="설명 텍스트가 여기 표시된다."
          action={<Button variant="secondary">액션</Button>}
        />
      </Section>

      <Section title="ScoreDelta">
        <div className="flex flex-wrap gap-4">
          <ScoreDelta before={70} after={92.3} />
          <ScoreDelta before={90} after={81.5} />
          <ScoreDelta before={80} after={80} />
        </div>
      </Section>

      <Section title="DiffView">
        <DiffView
          oldText={"백엔드 개발자\n\n- Python 3년"}
          newText={"백엔드 개발자\n\n- Python/FastAPI 3년\n- pgvector 경험"}
        />
      </Section>

      <Section title="아이콘">
        <div className="text-text-muted flex flex-wrap gap-4">
          <ChevronDownIcon />
          <GearIcon />
          <GapAnalysisIcon />
        </div>
      </Section>
    </div>
  );
}
