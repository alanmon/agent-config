import { useMemo, useState, type ReactNode } from 'react';
import { KsModal, KsCheckbox, KsInput } from '@byted-keystone/react';
import { CATEGORIES, questionBank, type TestQuestion } from '../data';

interface GenerateProps {
  open: boolean;
  existingIds: Set<string>;
  onCancel: () => void;
  onConfirm: (questions: TestQuestion[]) => void;
}

/** Lets users multi-select from the generated candidate pool, grouped by category. */
export function GenerateQuestionsModal({ open, existingIds, onCancel, onConfirm }: GenerateProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const available = useMemo(() => questionBank.filter((q) => !existingIds.has(q.id)), [existingIds]);
  const byCategory = useMemo(() => {
    return CATEGORIES.map((category) => ({
      category,
      items: available.filter((q) => q.category === category),
    })).filter((g) => g.items.length > 0);
  }, [available]);

  const allSelected = available.length > 0 && selected.size === available.length;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(available.map((q) => q.id)));
  };

  const handleConfirm = () => {
    if (selected.size === 0) return false;
    const chosen = available.filter((q) => selected.has(q.id));
    onConfirm(chosen);
    setSelected(new Set());
    return undefined;
  };

  const handleCancel = () => {
    setSelected(new Set());
    onCancel();
  };

  return (
    <KsModal
      open={open}
      title="Auto-generate questions"
      description="These questions are generated from your sources and knowledge base. Select the ones you want to test."
      size="lg"
      width={640}
      confirmable
      cancelable
      confirmText={selected.size > 0 ? `Add ${selected.size} question${selected.size === 1 ? '' : 's'}` : 'Add questions'}
      cancelText="Cancel"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      partProps={{ confirmButton: { disabled: selected.size === 0 } }}
      body={
        <div className="gen-modal-body">
          <div
            className="gen-modal-toolbar"
            role="button"
            tabIndex={0}
            onClick={toggleAll}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') toggleAll();
            }}
          >
            <KsCheckbox size="sm" checked={allSelected} />
            <span>Select all ({available.length})</span>
            <span className="gen-modal-count">{selected.size} selected</span>
          </div>
          <div className="gen-modal-list">
            {byCategory.map(({ category, items }) => (
              <div className="gen-modal-group" key={category}>
                <div className="gen-modal-group-title">{category}</div>
                {items.map((q) => (
                  <div
                    className="gen-modal-row"
                    key={q.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggle(q.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') toggle(q.id);
                    }}
                  >
                    <KsCheckbox size="sm" checked={selected.has(q.id)} />
                    <span className="gen-modal-row-text">{q.question}</span>
                  </div>
                ))}
              </div>
            ))}
            {byCategory.length === 0 && (
              <div className="gen-modal-empty">All generated questions have already been added.</div>
            )}
          </div>
        </div>
      }
    />
  );
}

interface AddManuallyProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (question: string) => void;
}

/** Single free-text question entry. */
export function AddManuallyModal({ open, onCancel, onConfirm }: AddManuallyProps) {
  const [text, setText] = useState('');

  const handleConfirm = () => {
    const trimmed = text.trim();
    if (!trimmed) return false;
    onConfirm(trimmed);
    setText('');
    return undefined;
  };

  const handleCancel = () => {
    setText('');
    onCancel();
  };

  return (
    <KsModal
      open={open}
      title="Add questions manually"
      description="Enter customer questions to see how your agent responds."
      size="md"
      confirmable
      cancelable
      confirmText="Add"
      cancelText="Cancel"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      partProps={{ confirmButton: { disabled: text.trim().length === 0 } }}
      body={
        <div className="manual-modal-body">
          <KsInput
            placeholder="e.g. How long do lip filler results usually last?"
            value={text}
            onChange={(value: string) => setText(value)}
          />
        </div>
      }
    />
  );
}

interface ComingSoonProps {
  open: boolean;
  title: string;
  description: ReactNode;
  onCancel: () => void;
}

/** Placeholder for import paths not wired up in this prototype. */
export function ComingSoonModal({ open, title, description, onCancel }: ComingSoonProps) {
  return (
    <KsModal
      open={open}
      title={title}
      description={description}
      size="sm"
      confirmable
      cancelable={false}
      confirmText="Got it"
      onConfirm={() => undefined}
      onCancel={onCancel}
      body={<div className="manual-modal-body" />}
    />
  );
}
