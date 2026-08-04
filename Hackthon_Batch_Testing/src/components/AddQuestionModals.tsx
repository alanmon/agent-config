import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { KsModal, KsInput, KsButton, KsRadio, KsRadioGroup, KsSelect } from '@byted-keystone/react';
import { KsIconDelete, KsIconPlus, KsIconWand } from '@fe-infra/keystone-icons-react';
import { CATEGORIES, questionBank, type Category, type RecommendationTarget, type TestQuestion } from '../data';
import type { TestingAs } from './TestConsole';

interface GenerateProps {
  open: boolean;
  existingIds: Set<string>;
  onCancel: () => void;
  onConfirm: (questions: TestQuestion[]) => void;
}

type GenerationSource = 'all' | 'topic';

const lookbackOptions = [
  { value: 30, label: 'Last 30 days' },
  { value: 60, label: 'Last 60 days' },
  { value: 90, label: 'Last 90 days' },
];

const countValues = [5, 10, 25, 50];

/** Mirrors Fin's generation setup while sourcing questions from local mock data. */
export function GenerateQuestionsModal({ open, existingIds, onCancel, onConfirm }: GenerateProps) {
  const [source, setSource] = useState<GenerationSource>('all');
  const [topic, setTopic] = useState<Category>('Price');
  const [lookback, setLookback] = useState(90);
  const [questionCount, setQuestionCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const timer = useRef<number | null>(null);

  const available = useMemo(() => questionBank.filter((q) => !existingIds.has(q.id)), [existingIds]);
  const availableTopics = useMemo(
    () => CATEGORIES.filter((category) => available.some((q) => q.category === category)),
    [available],
  );
  const topicOptions = availableTopics.map((category) => ({ value: category, label: category }));
  const sourcePool = source === 'all' ? available : available.filter((q) => q.category === topic);
  const selectableCounts = countValues.filter((value) => value <= sourcePool.length);
  if (sourcePool.length > 0 && !selectableCounts.includes(sourcePool.length)) {
    selectableCounts.push(Math.min(sourcePool.length, 50));
  }
  const availableCountOptions = selectableCounts
    .sort((a, b) => a - b)
    .map((value) => ({ value, label: `${value} questions` }));
  const generatedTotal = Math.min(questionCount, sourcePool.length, 50);

  useEffect(() => {
    if (!open) return;
    setSource('all');
    setTopic(availableTopics[0] ?? 'Price');
    setLookback(90);
    setQuestionCount(10);
    setGenerating(false);
  }, [open]);

  useEffect(() => {
    if (selectableCounts.length > 0 && sourcePool.length < questionCount) {
      setQuestionCount(selectableCounts[selectableCounts.length - 1]);
    }
  }, [source, topic, sourcePool.length, questionCount]);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const handleConfirm = () => {
    if (generatedTotal === 0 || generating) return false;
    setGenerating(true);
    timer.current = window.setTimeout(() => {
      onConfirm(sourcePool.slice(0, generatedTotal));
      setGenerating(false);
      timer.current = null;
    }, 900);
    return false;
  };

  const handleCancel = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    setGenerating(false);
    onCancel();
  };

  return (
    <KsModal
      open={open}
      title="Generate questions from past conversations"
      description="Create a realistic test set from the questions customers have recently asked."
      size="md"
      width={600}
      confirmable
      cancelable
      confirmText={generating ? 'Generating…' : 'Generate questions'}
      cancelText="Cancel"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      partProps={{ confirmButton: { disabled: generatedTotal === 0 || generating, loading: generating } }}
      body={
        <div className="gen-modal-body">
          <div className="gen-field">
            <div className="gen-field-label">Generate from</div>
            <KsRadioGroup
              value={source}
              orientation="vertical"
              gap={12}
              onChange={(value) => setSource(String(value) as GenerationSource)}
            >
              <KsRadio value="all">All conversations</KsRadio>
              <KsRadio value="topic" disabled={availableTopics.length === 0}>Specific topics</KsRadio>
            </KsRadioGroup>
          </div>

          {source === 'topic' && (
            <div className="gen-field gen-topic-field">
              <label className="gen-field-label">Topic</label>
              <KsSelect
                value={topic}
                options={topicOptions}
                search
                placeholder="Select a topic"
                onChange={(value) => setTopic(String(value) as Category)}
              />
            </div>
          )}

          <div className="gen-config-grid">
            <div className="gen-field">
              <label className="gen-field-label">Conversation period</label>
              <KsSelect
                value={lookback}
                options={lookbackOptions}
                onChange={(value) => setLookback(Number(value))}
              />
            </div>
            <div className="gen-field">
              <label className="gen-field-label">Number of questions</label>
              <KsSelect
                value={questionCount}
                options={availableCountOptions}
                onChange={(value) => setQuestionCount(Number(value))}
              />
            </div>
          </div>

          <div className={`gen-summary${generatedTotal === 0 ? ' is-empty' : ''}`}>
            {generatedTotal > 0 ? (
              <>
                <b>{generatedTotal} questions</b> will be generated from conversations in the last {lookback} days
                {source === 'topic' ? ` about ${topic}` : ''}.
              </>
            ) : (
              'No more matching conversations are available for this test group.'
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
      description="Enter customer questions to see how your agent responds. Press Enter to start another."
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

export type CreateGroupMethod = 'generate' | 'manual' | 'csv';

interface CreateGroupProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (name: string, method: CreateGroupMethod) => void;
}

/** Creates a saved group and routes directly into the chosen question source. */
export function CreateGroupModal({ open, onCancel, onConfirm }: CreateGroupProps) {
  const [name, setName] = useState('');
  const [method, setMethod] = useState<CreateGroupMethod>('generate');

  useEffect(() => {
    if (!open) return;
    setName('');
    setMethod('generate');
  }, [open]);

  return (
    <KsModal
      open={open}
      title="Create new group"
      description="Save related questions, answers, and test settings together so you can revisit and rerun them later."
      size="md"
      width={600}
      confirmable
      cancelable
      confirmText="Create group"
      cancelText="Cancel"
      onConfirm={() => {
        onConfirm(name.trim(), method);
        return undefined;
      }}
      onCancel={onCancel}
      body={
        <div className="create-group-body">
          <div className="gen-field">
            <label className="gen-field-label">Name <span className="optional-label">(optional)</span></label>
            <KsInput
              placeholder="e.g. Medication safety questions"
              value={name}
              onChange={(value: string) => setName(value)}
            />
          </div>
          <div className="gen-field">
            <div className="gen-field-label">How do you want to add questions?</div>
            <KsRadioGroup
              value={method}
              orientation="vertical"
              gap={12}
              onChange={(value) => setMethod(String(value) as CreateGroupMethod)}
            >
              <KsRadio value="generate">
                Generate from conversations
                <span slot="description">Recommended · Create up to 50 questions from recent customer conversations.</span>
              </KsRadio>
              <KsRadio value="manual">
                Add manually
                <span slot="description">Enter exact edge cases, policies, or compliance questions.</span>
              </KsRadio>
              <KsRadio value="csv">
                Upload CSV file
                <span slot="description">Import a prepared single-column list of up to 50 questions.</span>
              </KsRadio>
            </KsRadioGroup>
          </div>
        </div>
      }
    />
  );
}

interface ApplyRecommendationProps {
  open: boolean;
  target: RecommendationTarget | null;
  action: string;
  detail: string;
  onCancel: () => void;
  onConfirm: (title: string, content?: string) => void;
}

const recommendationModalCopy: Record<RecommendationTarget, { title: string; description: string; label: string; placeholder: string; confirmText: string }> = {
  knowledge: {
    title: 'Create Knowledge article',
    description: 'Create a mock knowledge article that this test can use when you re-run it.',
    label: 'Article title',
    placeholder: 'e.g. Medication contraindications for cosmetic procedures',
    confirmText: 'Create article',
  },
  rules: {
    title: 'Update Rules',
    description: 'Save a mock rules update that this test can use when you re-run it.',
    label: 'Rules update',
    placeholder: 'e.g. Require consultation before procedure booking',
    confirmText: 'Save rules update',
  },
  automation: {
    title: 'Review automation configuration',
    description: 'Save a mock automation configuration update before re-running this test.',
    label: 'Configuration update',
    placeholder: 'e.g. Add consultation handover fallback',
    confirmText: 'Save configuration',
  },
  follow_up: {
    title: 'Create configuration follow-up',
    description: 'Record a mock follow-up for the configuration owner before re-running this test.',
    label: 'Follow-up title',
    placeholder: 'e.g. Review expected behaviour with the configuration owner',
    confirmText: 'Save follow-up',
  },
};

/** Stages a local configuration change; the question only consumes it when re-run. */
export function ApplyRecommendationModal({
  open,
  target,
  action,
  detail,
  onCancel,
  onConfirm,
}: ApplyRecommendationProps) {
  const copy = target ? recommendationModalCopy[target] : null;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!open || !copy) return;
    setTitle(action);
    setContent(
      target === 'knowledge'
        ? 'Blood thinners and cosmetic procedures\n\nPatients taking anticoagulants may have a higher risk of bleeding and bruising. Do not advise patients to stop medication. Arrange a provider consultation to review medication, eligibility, and safe next steps before any procedure.'
        : '',
    );
  }, [action, copy, open, target]);

  if (!copy) return null;
  const trimmed = title.trim();
  return (
    <KsModal
      open={open}
      title={copy.title}
      description={copy.description}
      size="md"
      confirmable
      cancelable
      confirmText={copy.confirmText}
      cancelText="Cancel"
      onConfirm={() => {
        if (!trimmed) return false;
        onConfirm(trimmed, target === 'knowledge' ? content.trim() : undefined);
        return undefined;
      }}
      onCancel={onCancel}
      partProps={{ confirmButton: { disabled: !trimmed } }}
      body={
        <div className="create-group-body">
          <div className="gen-field">
            <div className="improvement-modal-recommendation">
              <div className="improvement-modal-recommendation-label"><KsIconWand size="15" /> Recommended change</div>
              <div className="improvement-modal-action">{action}</div>
              <p className="improvement-modal-detail">{detail}</p>
            </div>
          </div>
          <div className="gen-field">
            <label className="gen-field-label">{copy.label}</label>
            <KsInput placeholder={copy.placeholder} value={title} onChange={(value: string) => setTitle(value)} />
          </div>
          {target === 'knowledge' && (
            <div className="gen-field">
              <label className="gen-field-label">Article content</label>
              <textarea
                className="improvement-content-input"
                value={content}
                placeholder="Write the information your agent should use for this question."
                onChange={(event) => setContent(event.target.value)}
              />
              <span className="improvement-content-hint">This mock content will be used when you re-run the question.</span>
            </div>
          )}
        </div>
      }
    />
  );
}

interface DeleteGroupProps {
  open: boolean;
  groupName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteGroupModal({ open, groupName, onCancel, onConfirm }: DeleteGroupProps) {
  return (
    <KsModal
      open={open}
      title="Delete group"
      description={`Delete “${groupName}” and its saved questions, responses, and test settings? This can't be undone.`}
      size="sm"
      confirmable
      cancelable
      confirmText="Delete group"
      cancelText="Cancel"
      onConfirm={() => {
        onConfirm();
        return undefined;
      }}
      onCancel={onCancel}
      body={<div className="manual-modal-body" />}
    />
  );
}

interface GroupSettingsProps {
  open: boolean;
  value: TestingAs;
  onCancel: () => void;
  onConfirm: (value: TestingAs) => void;
}

export function GroupSettingsModal({ open, value, onCancel, onConfirm }: GroupSettingsProps) {
  const [draft, setDraft] = useState<TestingAs>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  return (
    <KsModal
      open={open}
      title="Group settings"
      description="These settings are saved with this group and restored whenever you return to it."
      size="sm"
      confirmable
      cancelable
      confirmText="Save settings"
      cancelText="Cancel"
      onConfirm={() => {
        onConfirm(draft);
        return undefined;
      }}
      onCancel={onCancel}
      body={
        <div className="create-group-body">
          <div className="gen-field-label">Testing as</div>
          <KsRadioGroup
            value={draft}
            orientation="vertical"
            gap={12}
            onChange={(next) => setDraft(String(next) as TestingAs)}
          >
            <KsRadio value="preview">Preview user</KsRadio>
            <KsRadio value="new">New user</KsRadio>
            <KsRadio value="existing">Existing user</KsRadio>
          </KsRadioGroup>
        </div>
      }
    />
  );
}

interface RenameListProps {
  open: boolean;
  currentName: string;
  onCancel: () => void;
  onConfirm: (name: string) => void;
}

/** Renames the current test list. */
export function RenameListModal({ open, currentName, onCancel, onConfirm }: RenameListProps) {
  const [name, setName] = useState(currentName);

  // Reopen should always start from the name that is live right now.
  useEffect(() => {
    if (open) setName(currentName);
  }, [open, currentName]);

  const trimmed = name.trim();

  const handleConfirm = () => {
    if (!trimmed) return false;
    onConfirm(trimmed);
    return undefined;
  };

  return (
    <KsModal
      open={open}
      title="Rename group"
      description="Give this test group a name your team will recognise."
      size="sm"
      confirmable
      cancelable
      confirmText="Rename group"
      cancelText="Cancel"
      onConfirm={handleConfirm}
      onCancel={onCancel}
      partProps={{ confirmButton: { disabled: !trimmed } }}
      body={
        <div className="manual-modal-body">
          <KsInput
            placeholder="e.g. Pre-launch consultation checks"
            value={name}
            onChange={(value: string) => setName(value)}
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
