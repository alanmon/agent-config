import { useState } from 'react';
import TopBar from './components/TopBar';
import GlobalNav from './components/GlobalNav';
import FinSidebar from './components/FinSidebar';
import Dashboard from './components/Dashboard';
import TestConsole from './components/TestConsole';
import EvaluatePanel from './components/EvaluatePanel';
import { GenerateQuestionsModal, AddManuallyModal, ComingSoonModal } from './components/AddQuestionModals';
import { testGroup as initialGroup, type ReviewVerdict, type TestQuestion } from './data';
import type { Route } from './routes';

type AddAction = 'manual' | 'generate' | 'csv' | 'inbox';

const RUN_DELAY_MS = 1100;

export default function App() {
  // Boots into the hub so the demo opens on the test console; the dashboard
  // stays one click away in the global nav.
  const [route, setRoute] = useState<Route>('hub');
  const [questions, setQuestions] = useState<TestQuestion[]>(initialGroup.questions);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Evaluation is tracked per question: "Run test" grades the whole batch, and
  // selecting a single unevaluated question grades just that one.
  const [evaluatedIds, setEvaluatedIds] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [modal, setModal] = useState<AddAction | null>(null);
  // The inspector is dismissable; picking a question brings it back.
  const [inspectorOpen, setInspectorOpen] = useState(true);

  const selected = questions.find((q) => q.id === selectedId) ?? null;

  /** Grades one question after a short beat, so the panel shows it working. */
  const evaluateOne = (id: string) => {
    setEvaluatingId(id);
    window.setTimeout(() => {
      setEvaluatedIds((prev) => new Set(prev).add(id));
      setEvaluatingId((current) => (current === id ? null : current));
    }, RUN_DELAY_MS);
  };

  // Selecting a question runs it on the spot rather than waiting for "Run test".
  const handleSelect = (q: TestQuestion) => {
    setSelectedId(q.id);
    setInspectorOpen(true);
    if (!evaluatedIds.has(q.id) && evaluatingId !== q.id && !running) evaluateOne(q.id);
  };

  const addQuestions = (newQuestions: TestQuestion[]) => {
    setQuestions((prev) => [...prev, ...newQuestions]);
    // Nothing selected yet — land on the first arrival and grade it, so the
    // panel never sits on an unevaluated question.
    if (!selectedId && newQuestions.length > 0) {
      const first = questions.length > 0 ? questions[0] : newQuestions[0];
      setSelectedId(first.id);
      if (!evaluatedIds.has(first.id)) evaluateOne(first.id);
    }
    setModal(null);
  };

  const handleAddManual = (texts: string[]) => {
    const stamp = Date.now();
    addQuestions(
      texts.map((text, i) => ({
        // index keeps ids unique when several are added in the same millisecond
        id: `manual-${stamp}-${i}`,
        category: 'General',
        question: text,
        status: null,
        review: null,
        answer: '',
        content: [],
        guidance: [],
      })),
    );
  };

  /** Reviews live here, not in the panel, so they survive switching questions. */
  const handleReview = (id: string, review: ReviewVerdict) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, review } : q)));
  };

  /** Bulk run: grades every question in the batch at once. */
  const handleRunEvaluation = () => {
    if (questions.length === 0 || running) return;
    setRunning(true);
    setEvaluatingId(null);
    window.setTimeout(() => {
      setRunning(false);
      setEvaluatedIds(new Set(questions.map((q) => q.id)));
    }, RUN_DELAY_MS);
  };

  return (
    <div className="app">
      <TopBar />
      <div className="app-body">
        <GlobalNav route={route} onNavigate={setRoute} />

        {route === 'dashboard' ? (
          <main className="shell-content is-dashboard">
            <Dashboard />
          </main>
        ) : (
          <main className="shell-content">
            <FinSidebar />
            <div className="workspace">
              <TestConsole
                group={{ ...initialGroup, questions }}
                selectedId={selectedId}
                onSelect={handleSelect}
                onAddAction={setModal}
                evaluatedIds={evaluatedIds}
                evaluatingId={evaluatingId}
                running={running}
                onRunEvaluation={handleRunEvaluation}
              />
              {/* Nothing to inspect until the batch has questions in it. */}
              {/* key resets per-question local state (expanded sources) */}
              {inspectorOpen && questions.length > 0 && (
                <EvaluatePanel
                  key={selected?.id ?? 'none'}
                  question={selected}
                  evaluated={!!selected && evaluatedIds.has(selected.id)}
                  evaluating={!!selected && (running || evaluatingId === selected.id)}
                  onReview={handleReview}
                  onClose={() => setInspectorOpen(false)}
                />
              )}
            </div>
          </main>
        )}
      </div>

      <GenerateQuestionsModal
        open={modal === 'generate'}
        existingIds={new Set(questions.map((q) => q.id))}
        onCancel={() => setModal(null)}
        onConfirm={addQuestions}
      />
      <AddManuallyModal open={modal === 'manual'} onCancel={() => setModal(null)} onConfirm={handleAddManual} />
      <ComingSoonModal
        open={modal === 'csv'}
        title="Import questions from CSV file"
        description={<span>CSV upload isn't available in this demo. Use <b>Add manually</b> or <b>Auto-generate</b> to test your agent instead.</span>}
        onCancel={() => setModal(null)}
      />
      <ComingSoonModal
        open={modal === 'inbox'}
        title="Import from inbox"
        description="Inbox import isn't wired up in this prototype yet — use Generate questions or Add manually for now."
        onCancel={() => setModal(null)}
      />
    </div>
  );
}
