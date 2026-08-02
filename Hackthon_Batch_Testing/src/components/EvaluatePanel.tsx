import { useState, useEffect, Fragment, type ReactNode } from 'react';
import { KsIconButton, KsInput, KsEmptyState, KsTag } from '@byted-keystone/react';
import {
  KsIconArrowLeft,
  KsIconRefresh,
  KsIconClose,
  KsIconWand,
  KsIconChevronRight,
  KsIconNotes,
  KsIconBookmark,
  KsIconPlayCircle,
  KsIconFilledCheck,
  KsIconFilledClose,
  KsIconFilledLightbulb,
} from '@fe-infra/keystone-icons-react';
import {
  ANSWER_RATING_LABELS,
  IMPROVEMENT_REASON_LABELS,
  isHumanReviewComplete,
  ratingFromStatus,
  type AnswerRating,
  type AnswerSource,
  type ImprovementReason,
  type InstructionTrace,
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

const fallbackRecommendations: Record<ImprovementReason, { action: string; detail: string }> = {
  content_gap: {
    action: 'Update the relevant knowledge content',
    detail: 'Add or revise a focused knowledge article so the agent can retrieve complete, current facts for this question.',
  },
  needs_clarification: {
    action: 'Add clarification guidance',
    detail: 'Tell the agent which customer details it must collect before answering ambiguous or context-dependent questions.',
  },
  instruction_conflict: {
    action: 'Resolve conflicting guidance',
    detail: 'Consolidate the competing rules into one ordered instruction that makes prerequisites, risk disclosure, and escalation explicit.',
  },
  tone: {
    action: 'Adjust tone guidance',
    detail: 'Add an example response and describe the level of empathy, confidence, and formality expected for this situation.',
  },
  length: {
    action: 'Define answer-length guidance',
    detail: 'Specify which details are required and when the agent should use a concise answer versus a structured explanation.',
  },
  language: {
    action: 'Review language support',
    detail: 'Confirm language detection and translation settings, then add localized guidance where the response should differ by region.',
  },
  tool_error: {
    action: 'Review the automation configuration',
    detail: 'Check the tool trigger, required inputs, permissions, and fallback behavior, then rerun this question.',
  },
  other: {
    action: 'Review this answer with the configuration owner',
    detail: 'Use the internal note to capture the expected behavior, then update the most relevant content, guidance, or automation.',
  },
};

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
}

/** Matches the console's run animation so a re-run feels like the same operation. */
const REGEN_DELAY_MS = 1100;

export default function EvaluatePanel({
  question,
  evaluated,
  evaluating = false,
  onClose,
  onReviewChange,
}: Props) {
  // Prototype re-run: there is no backend, so the panel just plays the working
  // state and lands back on the same stored diagnosis.
  const [regenerating, setRegenerating] = useState(false);
  const [view, setView] = useState<'answer' | 'improve'>('answer');

  useEffect(() => {
    if (!regenerating) return;
    const timer = window.setTimeout(() => setRegenerating(false), REGEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [regenerating]);

  useEffect(() => setView('answer'), [question?.id]);

  const showResult = evaluated && !!question?.status;
  const aiRating = ratingFromStatus(question?.status ?? null);
  const reviewComplete = !!question && isHumanReviewComplete(question);
  const failing = question?.status === 'failure' || question?.status === 'knowledge_gap';
  const causeVariant = question?.rootCause
    ? rootCauseVariant[question.rootCause.label] ?? 'warning'
    : 'warning';
  // The review bar keeps the automated assessment distinct from the human
  // decision, so a suggested rating is never mistaken for an approved one.
  const verdictLabel = question?.rootCause?.label ?? 'Pass';
  const verdictVariant: 'success' | 'warning' | 'error' = question?.rootCause ? causeVariant : 'success';
  const suggestedReason = question ? suggestedReasonFor(question) : 'other';
  const recommendationReason = question?.ratingReason ?? suggestedReason;
  const recommendation = question?.fixSuggestion ?? fallbackRecommendations[recommendationReason];
  const canImprove = !!question && reviewComplete && question.humanRating !== 'good';
  const reviewStatusLabel = !question?.humanRating
    ? 'Needs human review'
    : !reviewComplete
      ? 'Incomplete · choose a reason'
      : question.humanRating === aiRating
        ? 'AI rating confirmed'
        : 'AI rating overridden';

  return (
    <section className="panel evaluate" aria-label="Root cause inspector">
      <div className="eval-head">
        {view === 'improve' ? (
          <button type="button" className="improve-back" onClick={() => setView('answer')}>
            <KsIconArrowLeft size="16" /> Back to answer
          </button>
        ) : (
          <span className="eval-title">Inspector</span>
        )}
        <div className="eval-head-actions">
          {view === 'answer' && (
            <KsIconButton
              variant="text"
              size="sm"
              aria-label="Re-run evaluation"
              disabled={!question || !showResult || regenerating}
              onClick={() => setRegenerating(true)}
            >
              <span className={regenerating ? 'is-spinning' : undefined}>
                <KsIconRefresh size="18" />
              </span>
            </KsIconButton>
          )}
          <KsIconButton variant="text" size="sm" aria-label="Close" onClick={onClose}>
            <KsIconClose size="18" />
          </KsIconButton>
        </div>
      </div>

      {view === 'improve' && question && showResult && question.humanRating ? (
        <div className="improve-view">
          <div className="improve-view-heading">
            <span className="improve-view-icon"><KsIconFilledLightbulb size="20" /></span>
            <div>
              <h2>Improve this answer</h2>
              <p>Recommendation tailored to the reviewed answer and attributed root cause.</p>
            </div>
          </div>

          <div className="improve-question">{question.question}</div>

          <div className="improve-facts">
            <div>
              <span>Human rating</span>
              <KsTag variant={ratingVariant[question.humanRating]} size="sm">
                {ANSWER_RATING_LABELS[question.humanRating]}
              </KsTag>
            </div>
            <div>
              <span>AI diagnosis</span>
              <KsTag variant={verdictVariant} size="sm">{verdictLabel}</KsTag>
            </div>
            {question.ratingReason && (
              <div className="is-full">
                <span>Review reason</span>
                <strong>{IMPROVEMENT_REASON_LABELS[question.ratingReason]}</strong>
              </div>
            )}
          </div>

          {question.rootCause && (
            <div className={`improve-diagnosis improve-diagnosis-${causeVariant}`}>
              <span>Why the AI attributed this root cause</span>
              <p>{question.rootCause.detail}</p>
            </div>
          )}

          <div className="improve-recommendation">
            <div className="improve-recommendation-label">
              <KsIconWand size="16" /> Recommended change
            </div>
            <h3>{recommendation.action}</h3>
            <p>{recommendation.detail}</p>
          </div>

          {question.reviewNote && (
            <div className="improve-note">
              <span>Internal note</span>
              <p>{question.reviewNote}</p>
            </div>
          )}
        </div>
      ) : !question ? (
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

            {/* The AI diagnosis remains visible; the fix is revealed only from Improve. */}
            {question.rootCause && (
              <div className={`root-cause root-cause-${causeVariant}`}>
                <div className="root-cause-head">
                  <span className="root-cause-label">AI diagnosis</span>
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
              label="Knowledge"
              items={question.content}
              defaultOpen={failing}
              emptyText={question.searchEvidence}
            />
            <UsesRow label="Rules" items={question.guidance} defaultOpen={failing} />
          </div>

          <div className="review-section">
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
                <label>Reason for Poor rating <span>Required</span></label>
                <select
                  className="review-reason-select"
                  value={question.ratingReason ?? ''}
                  aria-label="Reason for Poor rating"
                  onChange={(event) => onReviewChange?.(question.id, {
                    ratingReason: event.target.value as ImprovementReason,
                  })}
                >
                  <option value="" disabled>
                    Select a reason · AI suggests {IMPROVEMENT_REASON_LABELS[suggestedReason]}
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

            {question.humanRating && question.humanRating !== 'good' && (
              <button
                type="button"
                className="improve-answer-button"
                disabled={!canImprove}
                onClick={() => setView('improve')}
              >
                <KsIconFilledLightbulb size="16" /> Improve this answer
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
