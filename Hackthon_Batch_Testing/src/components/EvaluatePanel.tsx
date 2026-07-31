import { useState, Fragment, type ReactNode } from 'react';
import { KsIconButton, KsButton, KsInput, KsEmptyState, KsTag } from '@byted-keystone/react';
import {
  KsIconRefresh,
  KsIconClose,
  KsIconWand,
  KsIconChevronRight,
  KsIconNotes,
  KsIconBookmark,
  KsIconPlayCircle,
  KsIconFilledCheck,
  KsIconFilledClose,
} from '@fe-infra/keystone-icons-react';
import type { AnswerSource, InstructionTrace, ReviewVerdict, TestQuestion } from '../data';

/** Render **bold** segments and paragraph breaks as React nodes. */
function renderRich(text: string): ReactNode {
  return text.split('\n\n').map((para, pi) => (
    <p key={pi}>
      {para.split('**').map((seg, i) =>
        i % 2 === 1 ? <b key={i}>{seg}</b> : <Fragment key={i}>{seg}</Fragment>
      )}
    </p>
  ));
}

const reviewButtons: { key: ReviewVerdict; label: string }[] = [
  { key: 'agree', label: 'Agree' },
  { key: 'disagree', label: 'Disagree' },
];

const rootCauseVariant: Record<string, 'warning' | 'error'> = {
  'Knowledge gap': 'warning',
  'Instruction conflict': 'error',
};

function UsesRow({
  label,
  items,
  defaultOpen = false,
  emptyText,
}: {
  label: string;
  items: AnswerSource[];
  defaultOpen?: boolean;
  /** Retrieval evidence to show instead of a bare "nothing found". */
  emptyText?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className={`uses-row ${open ? 'is-open' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => setOpen((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') setOpen((v) => !v);
      }}
    >
      <div className="uses-row-head">
        <span className="uses-row-title">
          {label} ({items.length})
        </span>
        <span className="uses-chevron">
          <KsIconChevronRight size="18" />
        </span>
      </div>
      {open &&
        (items.length ? (
          <div className="uses-items">
            {items.map((it, i) => (
              <div className="uses-item" key={i}>
                <span className="uses-item-icon">
                  {it.kind === 'content' ? <KsIconNotes size="16" /> : <KsIconBookmark size="16" />}
                </span>
                <span>
                  <div className="uses-item-title">{it.title}</div>
                  <div className="uses-item-meta">{it.meta}</div>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className={emptyText ? 'uses-evidence' : 'uses-empty'}>
            {emptyText ?? 'Nothing found for this answer.'}
          </div>
        ))}
    </div>
  );
}

/** One configured rule, marked as followed or violated. */
function InstructionRow({ trace }: { trace: InstructionTrace }) {
  const violated = trace.status === 'violated';
  return (
    <div className={`instr-row instr-${trace.status}`}>
      <span className="instr-icon">
        {violated ? <KsIconFilledClose size="16" /> : <KsIconFilledCheck size="16" />}
      </span>
      <span className="instr-body">
        <div className="instr-rule">{trace.rule}</div>
        <div className="instr-detail">{trace.detail}</div>
      </span>
    </div>
  );
}

interface Props {
  question: TestQuestion | null;
  evaluated: boolean;
  onClose?: () => void;
  onReview?: (id: string, review: ReviewVerdict) => void;
}

export default function EvaluatePanel({ question, evaluated, onClose, onReview }: Props) {
  const showResult = evaluated && !!question?.status;
  const failing = question?.status === 'failure' || question?.status === 'knowledge_gap';
  const causeVariant = question?.rootCause
    ? rootCauseVariant[question.rootCause.label] ?? 'warning'
    : 'warning';
  // The review bar echoes the verdict the system actually reached, so there is
  // never a blank label sitting next to a decided diagnosis.
  const verdictLabel = question?.rootCause?.label ?? 'Pass';
  const verdictVariant: 'success' | 'warning' | 'error' = question?.rootCause ? causeVariant : 'success';

  return (
    <section className="panel evaluate" aria-label="Root cause inspector">
      <div className="eval-head">
        <span className="eval-title">Root Cause Inspector</span>
        <div className="eval-head-actions">
          <KsIconButton variant="text" size="sm" aria-label="Regenerate" disabled={!question}>
            <KsIconRefresh size="18" />
          </KsIconButton>
          <KsIconButton variant="text" size="sm" aria-label="Close" onClick={onClose}>
            <KsIconClose size="18" />
          </KsIconButton>
        </div>
      </div>

      {!question ? (
        <KsEmptyState
          autoCenter
          size="sm"
          title="No question selected"
          description="Select a question to see how your agent responds, and its diagnosis."
        />
      ) : !showResult ? (
        <div className="eval-body">
          <div className="chat-question">{question.question}</div>
          <div className="eval-waiting">
            <KsEmptyState
              size="sm"
              title="Not yet evaluated"
              description="Click “Run evaluation” to generate this answer and grade it as Pass, Failure, or Knowledge gap."
              footer={
                <span className="eval-waiting-hint">
                  <KsIconPlayCircle size="16" /> Waiting for evaluation
                </span>
              }
            />
          </div>
        </div>
      ) : (
        <>
          <div className="eval-body">
            <div className="chat-question">{question.question}</div>

            {/* 1 — Answer: what the agent actually said, before any verdict. */}
            <div className="fin-answer">
              <div className="fin-label">
                <span className="fin-mark">
                  <KsIconWand size="14" />
                </span>
                Fin • AI Agent
              </div>
              <div className="fin-answer-text">{renderRich(question.answer)}</div>
            </div>

            {/* 2 — Instructions: rule-by-rule traceability. */}
            {question.instructions && question.instructions.length > 0 && (
              <div className="instr-section">
                <div className="section-label">Instructions</div>
                {question.instructions.map((trace, i) => (
                  <InstructionRow key={i} trace={trace} />
                ))}
              </div>
            )}

            {/* Root cause on its own only when there's no fix card to carry it. */}
            {question.rootCause && !question.fixSuggestion && (
              <div className={`root-cause root-cause-${causeVariant}`}>
                <div className="root-cause-head">
                  <KsTag variant={causeVariant} size="sm">
                    {question.rootCause.label}
                  </KsTag>
                </div>
                <div className="root-cause-detail">{question.rootCause.detail}</div>
              </div>
            )}

            {/* 3 — Sources. */}
            <div className="section-label">This answer uses:</div>
            <UsesRow
              label="Content"
              items={question.content}
              defaultOpen={failing}
              emptyText={question.searchEvidence}
            />
            <UsesRow label="Guidance" items={question.guidance} defaultOpen={failing} />

            {/* 4 — Fix Suggestion: the root cause plus what to do about it. */}
            {question.fixSuggestion && (
              <div className={`fix-card fix-card-${causeVariant}`}>
                <div className="fix-head">
                  <span className="fix-head-label">Root cause</span>
                  {question.rootCause && (
                    <KsTag variant={causeVariant} size="sm">
                      {question.rootCause.label}
                    </KsTag>
                  )}
                </div>
                {question.rootCause && <div className="fix-cause">{question.rootCause.detail}</div>}
                <div className="fix-action">
                  <KsIconWand size="14" /> {question.fixSuggestion.action}
                </div>
                <div className="fix-detail">{question.fixSuggestion.detail}</div>
              </div>
            )}
          </div>

          <div className="review-section">
            <div className="review-row">
              <span className="review-label">System verdict</span>
              <KsTag variant={verdictVariant} size="sm">
                {verdictLabel}
              </KsTag>
              <div className="review-buttons">
                {reviewButtons.map((b) => (
                  <KsButton
                    key={b.key}
                    className="review-button"
                    variant="default"
                    size="sm"
                    forceActive={question.review === b.key}
                    onClick={() => onReview?.(question.id, b.key)}
                  >
                    {b.label}
                  </KsButton>
                ))}
              </div>
            </div>
            {/* The note only earns its place once there's a disagreement to explain. */}
            {question.review === 'disagree' && (
              <div className="review-note">
                <KsInput placeholder="What did the system get wrong?" />
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
