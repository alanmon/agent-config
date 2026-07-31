import { useState, useEffect, Fragment, type ReactNode } from 'react';
import { KsIconButton, KsButton, KsInput, KsStatusDot } from '@byted-keystone/react';
import {
  KsIconRefresh,
  KsIconClose,
  KsIconWand,
  KsIconChevronRight,
  KsIconNotes,
  KsIconBookmark,
} from '@fe-infra/keystone-icons-react';
import type { AnswerSource, Rating, TestQuestion } from '../data';

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

const ratingButtons: { key: Rating; label: string; kbd: string; dot: 'success' | 'warning' | 'error' }[] = [
  { key: 'good', label: 'Good', kbd: 'G', dot: 'success' },
  { key: 'acceptable', label: 'Acceptable', kbd: 'A', dot: 'warning' },
  { key: 'poor', label: 'Poor', kbd: 'P', dot: 'error' },
];

function UsesRow({ label, items }: { label: string; items: AnswerSource[] }) {
  const [open, setOpen] = useState(false);
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
          <div className="uses-empty">Nothing found for this answer.</div>
        ))}
    </div>
  );
}

interface Props {
  question: TestQuestion;
  onClose?: () => void;
  /** Lifts the rating so the console table chip updates too. */
  onRate?: (rating: Rating) => void;
}

export default function EvaluatePanel({ question, onClose, onRate }: Props) {
  const [rating, setRating] = useState<Rating>(question.rating);

  const rate = (next: Rating) => {
    setRating(next);
    onRate?.(next);
  };

  /** G / A / P shortcuts, as advertised by the kbd hints on the rating buttons. */
  useEffect(() => {
    const keys: Record<string, Rating> = { g: 'good', a: 'acceptable', p: 'poor' };
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el?.closest('input, textarea, ks-input, [contenteditable="true"]');
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      const next = keys[e.key.toLowerCase()];
      if (next) {
        e.preventDefault();
        rate(next);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <section className="panel evaluate" aria-label="Evaluate answer">
      <div className="eval-head">
        <span className="eval-title">Evaluate answer</span>
        <div className="eval-head-actions">
          <KsIconButton variant="text" size="sm" aria-label="Regenerate">
            <KsIconRefresh size="18" />
          </KsIconButton>
          <KsIconButton variant="text" size="sm" aria-label="Close" onClick={onClose}>
            <KsIconClose size="18" />
          </KsIconButton>
        </div>
      </div>

      <div className="eval-body">
        <div className="chat-question">{question.question}</div>

        <div className="fin-answer">
          <div className="fin-label">
            <span className="fin-mark">
              <KsIconWand size="14" />
            </span>
            AI Agent
          </div>
          <div className="fin-answer-text">{renderRich(question.answer)}</div>
        </div>

        <div className="uses-label">This answer uses:</div>
        <UsesRow label="Content" items={question.content} />
        <UsesRow label="Guidance" items={question.guidance} />
      </div>

      <div className="rate-section">
        <div className="rate-title">Rate Fin&rsquo;s response</div>
        <div className="rate-desc">
          Your rating will be saved in the report download. You can also add a note for yourself or
          your team.
        </div>
        <div className="rate-buttons">
          {ratingButtons.map((b) => (
            <KsButton
              key={b.key}
              className="rate-button"
              variant="default"
              size="md"
              forceActive={rating === b.key}
              aria-pressed={rating === b.key}
              onClick={() => rate(b.key)}
            >
              <span className="rate-btn-inner">
                <KsStatusDot variant={b.dot} size="sm" />
                {b.label}
                <span className="kbd">{b.kbd}</span>
              </span>
            </KsButton>
          ))}
        </div>
        <div className="rate-note">
          <KsInput placeholder="Add internal note" />
        </div>
      </div>
    </section>
  );
}
