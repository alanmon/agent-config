import { KsButton, KsCheckbox, KsAvatar, KsDropdownButton, KsTag, KsEmptyState } from '@byted-keystone/react';
import {
  KsIconNotes,
  KsIconChevronDown,
  KsIconEdit,
  KsIconPlus,
  KsIconChangeUser,
  KsIconHelp,
  KsIconWand,
  KsIconColoredExcel,
  KsIconFilledCheck,
  KsIconFilledClose,
  KsIconFilledWarning,
  KsIconPlayCircle,
} from '@fe-infra/keystone-icons-react';
import type { EvalStatus, TestGroup, TestQuestion } from '../data';

const testingAsOptions = [
  { value: 'preview', label: 'Preview user' },
  { value: 'new', label: 'New user' },
  { value: 'existing', label: 'Existing user' },
];

type AddAction = 'manual' | 'generate' | 'csv' | 'inbox';

const addQuestionsOptions = (onSelect: (action: AddAction) => void) => [
  { value: 'manual', label: 'Add manually', onClick: () => onSelect('manual') },
  { value: 'generate', label: 'Generate questions', onClick: () => onSelect('generate') },
  { value: 'csv', label: 'Import from a .csv', onClick: () => onSelect('csv') },
  { value: 'inbox', label: 'Import from inbox', onClick: () => onSelect('inbox') },
];

const statusTag: Record<EvalStatus, { variant: 'success' | 'warning' | 'error'; label: string }> = {
  pass: { variant: 'success', label: 'Pass' },
  knowledge_gap: { variant: 'warning', label: 'Knowledge gap' },
  failure: { variant: 'error', label: 'Failure' },
};

interface Props {
  group: TestGroup;
  selectedId: string | null;
  onSelect: (q: TestQuestion) => void;
  onAddAction: (action: AddAction) => void;
  evaluated: boolean;
  running: boolean;
  onRunEvaluation: () => void;
}

export default function TestConsole({
  group,
  selectedId,
  onSelect,
  onAddAction,
  evaluated,
  running,
  onRunEvaluation,
}: Props) {
  const counts = group.questions.reduce(
    (acc, q) => {
      if (q.status) acc[q.status] += 1;
      return acc;
    },
    { pass: 0, knowledge_gap: 0, failure: 0 } as Record<EvalStatus, number>
  );

  return (
    <section className="panel console" aria-label="Test console">
      {/* Header */}
      <div className="console-head">
        <div className="console-head-top">
          <div>
            <div className="group-title">
              <span className="title-doc">
                <KsIconNotes size="18" />
              </span>
              {group.title}
              <span className="title-doc">
                <KsIconChevronDown size="18" />
              </span>
            </div>
            <div className="group-sub">
              <span>{group.updatedLabel}</span>
              <KsAvatar size="xs">
                {group.updatedBy
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)}
              </KsAvatar>
              <span>{group.updatedBy}</span>
            </div>
          </div>
          <div className="head-actions">
            <KsButton variant="default" size="md">
              <span className="chip-inner">
                <KsIconEdit size="16" /> Manage <KsIconChevronDown size="14" />
              </span>
            </KsButton>
            <KsDropdownButton variant="default" size="md" options={addQuestionsOptions(onAddAction)}>
              <span className="chip-inner">
                <KsIconPlus size="16" /> Add questions <KsIconChevronDown size="14" />
              </span>
            </KsDropdownButton>
            <KsButton
              variant="primary"
              size="md"
              disabled={group.questions.length === 0}
              loading={running}
              onClick={onRunEvaluation}
            >
              <span className="chip-inner">
                <KsIconPlayCircle size="16" />
                {running ? 'Running…' : 'Run evaluation'}
              </span>
            </KsButton>
          </div>
        </div>
        <hr className="console-divider" />
      </div>

      {group.questions.length === 0 ? (
        <KsEmptyState
          autoCenter
          title="No test questions yet"
          description="Add questions to start testing how your agent responds — write your own, generate them from your knowledge base, or import a list."
          footer={
            <div className="empty-actions">
              <KsButton variant="primary" size="md" onClick={() => onAddAction('manual')}>
                <span className="chip-inner">
                  <KsIconEdit size="16" /> Add manually
                </span>
              </KsButton>
              <KsButton variant="default" size="md" onClick={() => onAddAction('generate')}>
                <span className="chip-inner">
                  <KsIconWand size="16" /> Generate questions
                </span>
              </KsButton>
              <KsButton variant="default" size="md" onClick={() => onAddAction('csv')}>
                <span className="chip-inner">
                  <KsIconColoredExcel size="16" /> Import from a .csv
                </span>
              </KsButton>
            </div>
          }
        />
      ) : (
        <>
          {/* Filters */}
          <div className="filter-row">
            <div className="testing-as">
              <span>Testing as</span>
              <KsDropdownButton variant="tertiary" size="sm" options={testingAsOptions}>
                <span className="chip-inner">
                  <KsIconChangeUser size="16" /> Preview user
                </span>
              </KsDropdownButton>
            </div>
          </div>

          {/* Count + summary */}
          <div className="q-count-row">
            <div className="q-count">{group.questions.length} questions</div>
            {evaluated && (
              <div className="summary-strip">
                <span className="summary-chip pass">
                  <KsIconFilledCheck size="14" /> Pass <b>{counts.pass}</b>
                </span>
                <span className="summary-chip kg">
                  <KsIconFilledWarning size="14" /> Knowledge gap <b>{counts.knowledge_gap}</b>
                </span>
                <span className="summary-chip fail">
                  <KsIconFilledClose size="14" /> Failure <b>{counts.failure}</b>
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
            <span className="th">
              Answer status <KsIconHelp size="14" />
            </span>
            <span className="th">
              Result <KsIconHelp size="14" />
            </span>
          </div>

          {/* Rows */}
          <div className="q-list">
            {group.questions.map((q) => {
              const resultKnown = evaluated && q.status;
              const tag = resultKnown ? statusTag[q.status as EvalStatus] : null;
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
                  <span className="q-status">{resultKnown && <KsIconFilledCheck size="18" />}</span>
                  <span>{tag ? <KsTag variant={tag.variant} size="sm">{tag.label}</KsTag> : <span className="q-status-empty">—</span>}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
