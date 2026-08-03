import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { KsCheckbox, KsTag } from '@byted-keystone/react';
import {
  KsIconEdit,
  KsIconPlus,
  KsIconChangeUser,
  KsIconHelp,
  KsIconWand,
  KsIconUpload,
  KsIconFilledCheck,
  KsIconFilledClose,
  KsIconFilledWarning,
} from '@fe-infra/keystone-icons-react';
import {
  ANSWER_RATING_LABELS,
  isHumanReviewComplete,
  ratingFromStatus,
  type AnswerRating,
  type TestGroup,
  type TestQuestion,
} from '../data';

export type TestingAs = 'preview' | 'new' | 'existing';
export type TestOnboardingStep = 'add_questions' | 'auto_test' | 'review_answer';

const testingAsLabels: Record<TestingAs, string> = {
  preview: 'Preview user',
  new: 'New user',
  existing: 'Existing user',
};

type AddAction = 'manual' | 'generate' | 'csv';

export interface SavedGroupOption {
  id: string;
  title: string;
}

export type ManageAction = 'settings' | 'rename' | 'export' | 'delete' | 'create';

const closeMenu = (event: MouseEvent<HTMLButtonElement>) => {
  event.currentTarget.closest('details')?.removeAttribute('open');
};

const ratingTag: Record<AnswerRating, { variant: 'success' | 'warning' | 'error'; label: string }> = {
  good: { variant: 'success', label: 'Good' },
  acceptable: { variant: 'warning', label: 'Acceptable' },
  poor: { variant: 'error', label: 'Poor' },
};

const reviewState = (question: TestQuestion, aiRating: AnswerRating | null) => {
  if (!question.humanRating) return { label: 'Needs review', className: 'is-pending' };
  const humanLabel = ANSWER_RATING_LABELS[question.humanRating];
  return {
    label: `${question.humanRating === aiRating ? 'Reviewed' : 'Overridden'} · ${humanLabel}`,
    className: `is-rating-${question.humanRating}`,
  };
};

interface Props {
  group: TestGroup;
  savedGroups: SavedGroupOption[];
  activeGroupId: string;
  selectedId: string | null;
  onSelect: (q: TestQuestion) => void;
  onAddAction: (action: AddAction) => void;
  /** Questions for which the agent produced an answer or follow-up action. */
  evaluatedIds: Set<string>;
  /** Question currently being answered in the automatic queue, if any. */
  evaluatingId: string | null;
  running: boolean;
  testingAs: TestingAs;
  onTestingAsChange: (value: TestingAs) => void;
  onSwitchGroup: (id: string) => void;
  onCreateGroup: () => void;
  onManageAction: (action: ManageAction) => void;
  onboardingStep?: TestOnboardingStep | null;
  onSkipOnboarding?: () => void;
}

export default function TestConsole({
  group,
  savedGroups,
  activeGroupId,
  selectedId,
  onSelect,
  onAddAction,
  evaluatedIds,
  evaluatingId,
  running,
  testingAs,
  onTestingAsChange,
  onSwitchGroup,
  onCreateGroup,
  onManageAction,
  onboardingStep = null,
  onSkipOnboarding,
}: Props) {
  const consoleRef = useRef<HTMLElement>(null);
  const wasRunningRef = useRef(false);
  const [showCompleteToast, setShowCompleteToast] = useState(false);

  useEffect(() => {
    const closeMenusOutside = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      consoleRef.current
        ?.querySelectorAll<HTMLDetailsElement>('details.action-menu[open]')
        .forEach((menu) => {
          if (!menu.contains(event.target as Node)) menu.removeAttribute('open');
        });
    };

    document.addEventListener('pointerdown', closeMenusOutside);
    return () => document.removeEventListener('pointerdown', closeMenusOutside);
  }, []);

  useEffect(() => {
    const justCompleted =
      wasRunningRef.current &&
      !running &&
      group.questions.length > 0 &&
      evaluatedIds.size === group.questions.length;

    wasRunningRef.current = running;
    if (!justCompleted) return;

    setShowCompleteToast(true);
    const timer = window.setTimeout(() => setShowCompleteToast(false), 3600);
    return () => window.clearTimeout(timer);
  }, [evaluatedIds.size, group.questions.length, running]);

  // The summary represents human decisions only. AI-proposed ratings remain
  // visible in their own table column and do not inflate these counts.
  const counts = group.questions.reduce(
    (acc, q) => {
      if (!evaluatedIds.has(q.id)) return acc;
      if (isHumanReviewComplete(q) && q.humanRating) acc[q.humanRating] += 1;
      return acc;
    },
    { good: 0, acceptable: 0, poor: 0 } as Record<AnswerRating, number>
  );
  const onboardingStepNumber = onboardingStep === 'add_questions' ? 1 : onboardingStep === 'auto_test' ? 2 : 3;
  const completedOnboardingSteps = onboardingStepNumber - 1;
  const onboardingCopy = onboardingStep === 'add_questions'
    ? {
        title: 'Start with questions your customers really ask',
        detail: 'Choose a source below. Generating from recent conversations is the quickest way to build a representative test.',
      }
    : onboardingStep === 'auto_test'
      ? {
          title: 'Testing runs automatically',
          detail: `${evaluatedIds.size} of ${group.questions.length} answered. Questions run top-to-bottom while the first question stays selected.`,
        }
      : {
          title: 'Review the first answer',
          detail: 'The AI rating is a suggestion. Use the Inspector to record your human rating while remaining questions continue in the background.',
        };

  return (
    <section ref={consoleRef} className="panel console" aria-label="Test console">
      {/* List tools only become relevant once a question exists. */}
      {group.questions.length > 0 && (
        <div className="console-head">
          <div className="console-head-top">
            <div>
              {/* The list name doubles as the list-management menu. */}
              <div className="group-title">
                <details className="action-menu group-switcher">
                  <summary className="group-switcher-trigger">
                    <span className="group-title-text" role="heading" aria-level={1}>{group.title}</span>
                  </summary>
                  <div className="action-menu-popover group-switcher-menu">
                    {savedGroups.map((savedGroup) => (
                      <button
                        type="button"
                        className={savedGroup.id === activeGroupId ? 'is-selected' : ''}
                        key={savedGroup.id}
                        onClick={(event) => {
                          closeMenu(event);
                          onSwitchGroup(savedGroup.id);
                        }}
                      >
                        <span>{savedGroup.title}</span>
                        {savedGroup.id === activeGroupId && <span className="menu-check">✓</span>}
                      </button>
                    ))}
                    <div className="action-menu-divider" />
                    <button
                      type="button"
                      onClick={(event) => {
                        closeMenu(event);
                        onCreateGroup();
                      }}
                    >
                      + Create new group
                    </button>
                  </div>
                </details>
              </div>
            </div>
            <div className="head-actions">
              <details className="action-menu manage-menu">
                <summary className="toolbar-menu-trigger">
                  <span className="chip-inner"><KsIconEdit size="16" /> Manage</span>
                </summary>
                <div className="action-menu-popover">
                  {([
                    ['settings', 'Settings'],
                    ['rename', 'Rename group'],
                    ['export', 'Get CSV report'],
                    ['delete', 'Delete group'],
                    ['create', '+ Create new group'],
                  ] as Array<[ManageAction, string]>).map(([action, label]) => (
                    <button
                      type="button"
                      className={action === 'delete' ? 'is-danger' : ''}
                      key={action}
                      onClick={(event) => {
                        closeMenu(event);
                        onManageAction(action);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </details>
              <details className={`action-menu${group.questions.length >= 50 ? ' is-disabled' : ''}`}>
                <summary className="toolbar-menu-trigger is-primary">
                  <span className="chip-inner"><KsIconPlus size="16" /> Add questions</span>
                </summary>
                <div className="action-menu-popover">
                  {([
                    ['generate', 'Generate from past conversations'],
                    ['manual', 'Add questions manually'],
                    ['csv', 'Upload a CSV file'],
                  ] as Array<[AddAction, string]>).map(([action, label]) => (
                    <button
                      type="button"
                      key={action}
                      onClick={(event) => {
                        closeMenu(event);
                        onAddAction(action);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </details>
            </div>
          </div>
          <hr className="console-divider" />
        </div>
      )}

      {onboardingStep && (
        <div className={`test-onboarding is-step-${onboardingStepNumber}`} role="status" aria-live="polite">
          <div className="test-onboarding-progress" aria-label={`${completedOnboardingSteps} of 3 onboarding steps complete`}>
            {[1, 2, 3].map((step) => (
              <span
                key={step}
                className={`${step === onboardingStepNumber ? 'is-current' : ''}${step < onboardingStepNumber ? ' is-complete' : ''}`}
                aria-current={step === onboardingStepNumber ? 'step' : undefined}
                aria-label={step < onboardingStepNumber ? `Step ${step} complete` : step === onboardingStepNumber ? `Step ${step} current` : `Step ${step}`}
              >
                {step < onboardingStepNumber ? '✓' : step}
              </span>
            ))}
          </div>
          <div className="test-onboarding-copy">
            <small>{completedOnboardingSteps} of 3 complete</small>
            <strong>{onboardingCopy.title}</strong>
            <p>{onboardingCopy.detail}</p>
          </div>
          <button type="button" className="test-onboarding-skip" onClick={onSkipOnboarding}>Skip onboarding</button>
        </div>
      )}

      {group.questions.length === 0 ? (
        <div className="question-start">
          <div className="question-start-heading">
            <h2>Let’s start by adding questions</h2>
            <p>Choose the method that best matches what you want to test.</p>
          </div>

          <div className="question-start-options">
            <article className="question-option is-recommended">
              <div className="question-option-topline">
                <span className="question-option-icon"><KsIconWand size="22" /></span>
                <span className="question-option-badge">Recommended</span>
              </div>
              <h3>Generate from conversations</h3>
              <p><b>Best for most teams.</b> Create up to 50 representative questions from recent customer conversations.</p>
              <div className="question-option-action">
                <button type="button" className="question-option-button is-primary" onClick={() => onAddAction('generate')}>
                  Generate questions
                </button>
              </div>
            </article>

            <article className="question-option">
              <div className="question-option-topline">
                <span className="question-option-icon"><KsIconEdit size="22" /></span>
              </div>
              <h3>Add manually</h3>
              <p><b>Best for edge cases.</b> Add exact questions for new policies, compliance checks, or scenarios without history.</p>
              <div className="question-option-action">
                <button type="button" className="question-option-button" onClick={() => onAddAction('manual')}>
                  Add manually
                </button>
              </div>
            </article>

            <article className="question-option">
              <div className="question-option-topline">
                <span className="question-option-icon"><KsIconUpload size="22" /></span>
              </div>
              <h3>Upload CSV file</h3>
              <p><b>Best for repeatable tests.</b> Import a prepared, single-column CSV containing up to 50 questions.</p>
              <div className="question-option-action">
                <button type="button" className="question-option-button" onClick={() => onAddAction('csv')}>
                  Upload CSV
                </button>
              </div>
            </article>
          </div>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="filter-row">
            <div className="testing-as">
              <span>Testing as</span>
              <details className="action-menu testing-menu">
                <summary className="testing-menu-trigger">
                  <span className="chip-inner"><KsIconChangeUser size="16" /> {testingAsLabels[testingAs]}</span>
                </summary>
                <div className="action-menu-popover testing-menu-popover">
                  {(Object.entries(testingAsLabels) as Array<[TestingAs, string]>).map(([value, label]) => (
                    <button
                      type="button"
                      className={value === testingAs ? 'is-selected' : ''}
                      key={value}
                      onClick={(event) => {
                        closeMenu(event);
                        onTestingAsChange(value);
                      }}
                    >
                      <span>{label}</span>
                      {value === testingAs && <span className="menu-check">✓</span>}
                    </button>
                  ))}
                </div>
              </details>
            </div>
          </div>

          {/* Count + summary */}
          <div className="q-count-row">
            <div className="q-count">{group.questions.length} questions</div>
            {evaluatedIds.size > 0 && (
              <div className="summary-strip">
                <span className="summary-chip pass">
                  <KsIconFilledCheck size="14" /> Good <b>{counts.good}</b>
                </span>
                <span className="summary-chip kg">
                  <KsIconFilledWarning size="14" /> Acceptable <b>{counts.acceptable}</b>
                </span>
                <span className="summary-chip fail">
                  <KsIconFilledClose size="14" /> Poor <b>{counts.poor}</b>
                </span>
              </div>
            )}
          </div>

          {/* Table header */}
          <div className="q-head">
            <span className="q-check">
              <KsCheckbox size="sm" />
            </span>
            <span>Question</span>
            <span
              className="th"
              title="Answered means the AI provided a direct answer, follow-up, or automation. It does not indicate answer quality."
            >
              Answer status <KsIconHelp size="14" />
            </span>
            <span
              className="th"
              title="This rating is proposed by AI. It becomes reviewable separately by a human."
            >
              AI rating <KsIconHelp size="14" />
            </span>
            <span>Human review</span>
          </div>

          {/* Rows */}
          <div className="q-list">
            {group.questions.map((q) => {
              const answered = evaluatedIds.has(q.id);
              const aiRating = answered ? ratingFromStatus(q.status) : null;
              const tag = aiRating ? ratingTag[aiRating] : null;
              const review = reviewState(q, aiRating);
              const answering = !answered && evaluatingId === q.id;
              const queued = !answered && running && !answering;
              return (
                <div
                  key={q.id}
                  className={`q-row ${selectedId === q.id ? 'is-selected' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(q)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onSelect(q);
                  }}
                >
                  <span className="q-check" onClick={(e) => e.stopPropagation()}>
                    <KsCheckbox size="sm" />
                  </span>
                  <span className="q-question">{q.question}</span>
                  <span
                    className="q-status"
                    aria-label={answered ? 'Answered' : answering ? 'Answering' : 'Not answered'}
                    title={answered ? 'The AI produced an answer or follow-up action.' : undefined}
                  >
                    {answered && <KsIconFilledCheck size="18" />}
                    {answering && <span className="auto-run-indicator" />}
                  </span>
                  <span>
                    {tag ? (
                      <span className="ai-rating">
                        <KsTag variant={tag.variant} size="sm">{tag.label}</KsTag>
                        <small>AI</small>
                      </span>
                    ) : (
                      <span className="q-status-empty">{answering ? 'Answering…' : queued ? 'Queued' : '—'}</span>
                    )}
                  </span>
                  <span>
                    {answered ? (
                      <span className={`human-review ${review.className}`} title={review.label}>
                        {review.label}
                      </span>
                    ) : (
                      <span className="q-status-empty">—</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {showCompleteToast && (
        <div className="test-complete-toast" role="status" aria-live="polite">
          <span className="test-complete-toast-icon"><KsIconFilledCheck size="16" /></span>
          <span>
            <b>Test complete</b>
            <small>{group.questions.length} questions answered and rated</small>
          </span>
        </div>
      )}
    </section>
  );
}
