import { useState, useEffect, Fragment, type ReactNode } from 'react';
import { KsIconButton, KsInput, KsEmptyState, KsTag } from '@byted-keystone/react';
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
import {
  ANSWER_RATING_LABELS,
  IMPROVEMENT_REASON_LABELS,
  ratingFromStatus,
  type AnswerRating,
  type AnswerSource,
  type ImprovementReason,
  type InstructionTrace,
  type RecommendationTarget,
  type TestQuestion,
} from '../data';

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

const ratingOptions: AnswerRating[] = ['good', 'acceptable', 'poor'];

const ratingVariant: Record<AnswerRating, 'success' | 'warning' | 'error'> = {
  good: 'success',
  acceptable: 'warning',
  poor: 'error',
};

const reasonOptions = Object.entries(IMPROVEMENT_REASON_LABELS).map(([value, label]) => ({
  value,
  label,
}));

// Keeps the original demo group useful after hot updates: earlier in-memory
// groups stored this scenario before its supporting Rules were authored.
const bloodThinnerRules: AnswerSource[] = [
  { kind: 'guidance', title: 'Procedure safety standard', meta: 'Active rule · Do not advise medication changes' },
  { kind: 'guidance', title: 'Pre-consultation eligibility policy', meta: 'Active rule · Provider review required before surgical procedures' },
  { kind: 'guidance', title: 'Medication escalation guidance', meta: 'Active rule · Escalate anticoagulant questions to a provider' },
];

const suggestedReasonFor = (question: TestQuestion): ImprovementReason => {
  if (question.rootCause?.label === 'Knowledge gap') return 'content_gap';
  if (question.rootCause?.label === 'Instruction conflict') return 'instruction_conflict';
  return 'other';
};

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
  /** True while this question is being graded, so the panel shows it working. */
  evaluating?: boolean;
  onClose?: () => void;
  onReviewChange?: (
    id: string,
    changes: Partial<Pick<TestQuestion, 'humanRating' | 'ratingReason' | 'reviewNote'>>,
  ) => void;
  onRecommendationAction?: (question: TestQuestion, target: RecommendationTarget, action: string, detail: string) => void;
  onRerun?: (id: string) => void;
  showReviewOnboarding?: boolean;
}

/** Matches the console's run animation so a re-run feels like the same operation. */
const REGEN_DELAY_MS = 1100;

export default function EvaluatePanel({
  question,
  evaluated,
  evaluating = false,
  onClose,
  onReviewChange,
  onRecommendationAction,
  onRerun,
  showReviewOnboarding = false,
}: Props) {
  // Prototype re-run: there is no backend, so the panel just plays the working
  // state and lands back on the same stored diagnosis.
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (!regenerating) return;
    const rerunId = question?.id;
    const timer = window.setTimeout(() => {
      setRegenerating(false);
      if (rerunId) onRerun?.(rerunId);
    }, REGEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [regenerating]);

  const showResult = evaluated && !!question?.status;
  const aiRating = ratingFromStatus(question?.status ?? null);
  const failing = question?.status === 'failure' || question?.status === 'knowledge_gap';
  const causeVariant = question?.rootCause
    ? rootCauseVariant[question.rootCause.label] ?? 'warning'
    : 'warning';
  // The review bar keeps the automated assessment distinct from the human
  // decision, so a suggested rating is never mistaken for an approved one.
  const suggestedReason = question ? suggestedReasonFor(question) : 'other';
  const tracedRules: AnswerSource[] = question?.instructions?.map((instruction) => ({
    kind: 'guidance',
    title: instruction.rule,
    meta: `Configured rule · ${instruction.status === 'violated' ? 'Violated in this answer' : 'Followed in this answer'}`,
  })) ?? [];
  const rules = question?.guidance.length
    ? question.guidance
    : question?.id === 'g3'
      ? bloodThinnerRules
      : tracedRules;
  const knowledge = question?.appliedRecommendation?.target === 'knowledge'
    && !question.content.some((source) => source.title === question.appliedRecommendation?.title)
    ? [...question.content, {
        kind: 'content' as const,
        title: question.appliedRecommendation.title,
        meta: 'Newly added · Available to the AI Agent',
      }]
    : question?.content ?? [];
  const reviewStatusLabel = !question?.humanRating
    ? 'Needs human review'
    : question.humanRating === aiRating
      ? 'AI rating confirmed'
      : 'AI rating overridden';
  const startRerun = () => setRegenerating(true);

  return (
    <section className="panel evaluate" aria-label="Root cause inspector">
      <div className="eval-head">
        <span className="eval-title">Inspector</span>
        <div className="eval-head-actions">
          <KsIconButton
            variant="text"
            size="sm"
            aria-label="Re-run question"
            disabled={!question || !showResult || regenerating}
            onClick={startRerun}
          >
            <span className={regenerating ? 'is-spinning' : undefined}>
              <KsIconRefresh size="18" />
            </span>
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
      ) : regenerating || evaluating ? (
        <div className="eval-body">
          <div className="chat-question">{question.question}</div>
          <div className="eval-waiting">
            <KsEmptyState
              size="sm"
              title={regenerating ? 'Re-running evaluation' : 'Running evaluation'}
              description="Sending this question to the agent and grading the answer."
              footer={
                <span className="eval-waiting-hint">
                  <span className="is-spinning">
                    <KsIconRefresh size="16" />
                  </span>{' '}
                  Working…
                </span>
              }
            />
          </div>
        </div>
      ) : !showResult ? (
        <div className="eval-body">
          <div className="chat-question">{question.question}</div>
          <div className="eval-waiting">
            <KsEmptyState
              size="sm"
              title="Not yet evaluated"
              description="This question is queued. The AI will answer it automatically in top-to-bottom order."
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
                AI Agent
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

            {/* Diagnosis and its most relevant configuration action stay together. */}
            {question.rootCause && (
              <div className={`root-cause root-cause-${causeVariant}`}>
                <div className="root-cause-head">
                  <span className="root-cause-label">AI diagnosis</span>
                  <KsTag variant={causeVariant} size="sm">
                    {question.rootCause.label}
                  </KsTag>
                </div>
                <div className="root-cause-detail">{question.rootCause.detail}</div>
                {question.fixSuggestion && !question.appliedRecommendation && (
                  <button
                    type="button"
                    className="root-cause-action"
                    onClick={() => onRecommendationAction?.(
                      question,
                      question.fixSuggestion!.target,
                      question.fixSuggestion!.action,
                      question.fixSuggestion!.detail,
                    )}
                  >
                    {question.fixSuggestion.target === 'knowledge' ? 'Create Knowledge article' : question.fixSuggestion.action}
                  </button>
                )}
              </div>
            )}

            {/* 3 — Sources. */}
            <div className="section-label">This answer uses:</div>
            <UsesRow
              label="Knowledge"
              items={knowledge}
              defaultOpen={failing}
              emptyText={question.searchEvidence}
            />
            <UsesRow label="Rules" items={rules} defaultOpen={failing} />
          </div>

          <div className="review-section">
            {showReviewOnboarding && (
              <div className="review-onboarding-callout" role="status">
                <strong>Your turn: review this answer</strong>
                <span>Choose your rating below. You can optionally add a reason or internal note for context.</span>
              </div>
            )}
            <div className="review-heading">
              <div>
                <strong>Rate the AI response</strong>
                <span>{reviewStatusLabel}</span>
              </div>
              {aiRating && (
                <span className="ai-suggested-rating">
                  AI suggested
                  <KsTag variant={ratingVariant[aiRating]} size="sm">
                    {ANSWER_RATING_LABELS[aiRating]}
                  </KsTag>
                </span>
              )}
            </div>

            <div className="rating-options" role="group" aria-label="Human answer rating">
              {ratingOptions.map((rating) => (
                <button
                  type="button"
                  key={rating}
                  className={`rating-option rating-${rating}${question.humanRating === rating ? ' is-selected' : ''}`}
                  aria-pressed={question.humanRating === rating}
                  onClick={() => onReviewChange?.(question.id, {
                    humanRating: rating,
                    ratingReason: rating === 'poor' ? question.ratingReason : null,
                    reviewNote: rating === 'good' ? '' : question.reviewNote,
                  })}
                >
                  <span className="rating-dot" />
                  {ANSWER_RATING_LABELS[rating]}
                </button>
              ))}
            </div>

            {question.humanRating === 'poor' && (
              <div className="review-field">
                <label>Reason for Poor rating <span>Optional</span></label>
                <select
                  className="review-reason-select"
                  value={question.ratingReason ?? ''}
                  aria-label="Reason for Poor rating"
                  onChange={(event) => onReviewChange?.(question.id, {
                    ratingReason: event.target.value ? event.target.value as ImprovementReason : null,
                  })}
                >
                  <option value="">
                    Select a reason (optional) · AI suggests {IMPROVEMENT_REASON_LABELS[suggestedReason]}
                  </option>
                  {reasonOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            )}

            {(question.humanRating === 'acceptable' || question.humanRating === 'poor') && (
              <div className="review-field">
                <label>Internal note <span>Optional</span></label>
                <KsInput
                  value={question.reviewNote}
                  placeholder="Add context for your team or CSV report"
                  onChange={(value) => onReviewChange?.(question.id, { reviewNote: String(value) })}
                />
              </div>
            )}

          </div>
        </>
      )}
    </section>
  );
}
