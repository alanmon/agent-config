import {
  KsButton,
  KsCheckbox,
  KsAvatar,
  KsDivider,
  KsDropdownButton,
  KsTag,
} from '@byted-keystone/react';
import {
  KsIconNotes,
  KsIconChevronDown,
  KsIconEdit,
  KsIconPlus,
  KsIconChangeUser,
  KsIconHelp,
  KsIconStar,
  KsIconCheckMark,
} from '@fe-infra/keystone-icons-react';
import type { Rating, TestGroup, TestQuestion } from '../data';

const ratingTag: Record<Rating, { variant: 'success' | 'warning' | 'error'; label: string }> = {
  good: { variant: 'success', label: 'Good' },
  acceptable: { variant: 'warning', label: 'Acceptable' },
  poor: { variant: 'error', label: 'Poor' },
};

const testingAsOptions = [
  { value: 'preview', label: 'Preview user' },
  { value: 'new', label: 'New user' },
  { value: 'existing', label: 'Existing user' },
];
const statusOptions = [
  { value: 'any', label: 'Any' },
  { value: 'answered', label: 'Answered' },
  { value: 'unanswered', label: 'Unanswered' },
];
const ratingOptions = [
  { value: 'any', label: 'Any' },
  { value: 'good', label: 'Good' },
  { value: 'acceptable', label: 'Acceptable' },
  { value: 'poor', label: 'Poor' },
];

interface Props {
  group: TestGroup;
  selectedId: string;
  onSelect: (q: TestQuestion) => void;
}

export default function TestConsole({ group, selectedId, onSelect }: Props) {
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
            <KsButton variant="primary" size="md">
              <span className="chip-inner">
                <KsIconPlus size="16" /> Add questions <KsIconChevronDown size="14" />
              </span>
            </KsButton>
          </div>
        </div>
        <hr className="console-divider" />
      </div>

      {/* Filters */}
      <div className="filter-row">
        <div className="testing-as">
          <span>Testing as</span>
          <KsDropdownButton variant="text" size="sm" options={testingAsOptions}>
            <span className="chip-inner">
              <KsIconChangeUser size="16" /> Preview user
            </span>
          </KsDropdownButton>
        </div>
        <KsDivider className="filter-sep" orientation="vertical" />
        <KsDropdownButton variant="default" size="sm" options={statusOptions}>
          <span className="chip-inner">
            <KsIconHelp size="16" /> Answer status is Any
          </span>
        </KsDropdownButton>
        <KsDropdownButton variant="default" size="sm" options={ratingOptions}>
          <span className="chip-inner">
            <KsIconStar size="16" /> Answer rating is Any
          </span>
        </KsDropdownButton>
      </div>

      {/* Count */}
      <div className="q-count">{group.questions.length} questions</div>

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
          Answer rating <KsIconHelp size="14" />
        </span>
      </div>

      {/* Rows */}
      <div className="q-list">
        {group.questions.map((q) => {
          const tag = ratingTag[q.rating];
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
              <span className="q-status">
                {q.answered && <KsIconCheckMark size="18" />}
              </span>
              <span>
                <KsTag variant={tag.variant} size="sm">
                  {tag.label}
                </KsTag>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
