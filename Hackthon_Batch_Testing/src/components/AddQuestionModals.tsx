import { useEffect, useMemo, useRef, useState } from 'react';
import { KsModal, KsCheckbox, KsInput, KsButton } from '@byted-keystone/react';
import { KsIconDelete, KsIconPlus } from '@fe-infra/keystone-icons-react';
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
      title="Generate questions"
      description="Generated from your knowledge base and connected docs. Select the ones you want to add to this test."
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
  onConfirm: (questions: string[]) => void;
}

interface Draft {
  id: number;
  text: string;
}

const emptyDrafts = (): Draft[] => [{ id: 0, text: '' }];

/** Free-text entry that stages several questions before adding them in one go. */
export function AddManuallyModal({ open, onCancel, onConfirm }: AddManuallyProps) {
  const nextId = useRef(1);
  const [drafts, setDrafts] = useState<Draft[]>(emptyDrafts);
  // Row to focus once it has mounted, so Enter flows straight into the new input.
  const [focusId, setFocusId] = useState<number | null>(null);
  const inputs = useRef(new Map<number, HTMLKsInputElement>());

  // KsInput ignores autoFocus after first paint, and its shadow <input> isn't
  // there yet on commit — focus it imperatively on the next frame instead.
  useEffect(() => {
    if (focusId === null) return;
    const el = inputs.current.get(focusId);
    setFocusId(null);
    if (!el) return;
    const frame = requestAnimationFrame(() => el.focusInput?.());
    return () => cancelAnimationFrame(frame);
  }, [focusId]);

  const filled = drafts.map((d) => d.text.trim()).filter(Boolean);

  const reset = () => {
    nextId.current = 1;
    setDrafts(emptyDrafts());
    setFocusId(null);
  };

  const update = (id: number, text: string) =>
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, text } : d)));

  const addRow = () => {
    const id = nextId.current++;
    setDrafts((prev) => [...prev, { id, text: '' }]);
    setFocusId(id);
  };

  // Keep at least one row on screen — clear the last one instead of removing it.
  const removeRow = (id: number) =>
    setDrafts((prev) => (prev.length === 1 ? emptyDrafts() : prev.filter((d) => d.id !== id)));

  const handleConfirm = () => {
    if (filled.length === 0) return false;
    onConfirm(filled);
    reset();
    return undefined;
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <KsModal
      open={open}
      title="Add questions manually"
      description="Write the exact questions you want to test against the agent. Press Enter to start another."
      size="md"
      confirmable
      cancelable
      confirmText={filled.length > 1 ? `Add ${filled.length} questions` : 'Add question'}
      cancelText="Cancel"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      partProps={{ confirmButton: { disabled: filled.length === 0 } }}
      body={
        <div className="manual-modal-body">
          <div className="manual-rows">
            {drafts.map((d, i) => (
              <div className="manual-row" key={d.id}>
                {/* KsInput types an onKeydownEnter event but never emits it, so
                    listen for the native keydown that bubbles out of its shadow root. */}
                <div
                  className="manual-row-field"
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return;
                    e.preventDefault();
                    if (d.text.trim() && i === drafts.length - 1) addRow();
                  }}
                >
                  <KsInput
                    ref={(el: HTMLKsInputElement | null) => {
                      if (el) inputs.current.set(d.id, el);
                      else inputs.current.delete(d.id);
                    }}
                    placeholder={
                      i === 0
                        ? "e.g. Can I get filler if I'm currently breastfeeding?"
                        : 'Add another question'
                    }
                    value={d.text}
                    onChange={(value: string) => update(d.id, value)}
                  />
                </div>
                <button
                  type="button"
                  className="manual-row-remove"
                  aria-label="Remove question"
                  disabled={drafts.length === 1 && d.text.length === 0}
                  onClick={() => removeRow(d.id)}
                >
                  <KsIconDelete size="16" />
                </button>
              </div>
            ))}
          </div>
          <div className="manual-modal-footer-row">
            <KsButton variant="text" size="sm" onClick={addRow}>
              <span className="chip-inner">
                <KsIconPlus size="14" /> Add another question
              </span>
            </KsButton>
            <span className="manual-modal-count">
              {filled.length} ready to add
            </span>
          </div>
        </div>
      }
    />
  );
}

interface ComingSoonProps {
  open: boolean;
  title: string;
  description: string;
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
