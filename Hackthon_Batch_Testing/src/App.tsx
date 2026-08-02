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
  const [evaluated, setEvaluated] = useState(false);
  const [running, setRunning] = useState(false);
  const [modal, setModal] = useState<AddAction | null>(null);
  // The inspector is dismissable; picking a question brings it back.
  const [inspectorOpen, setInspectorOpen] = useState(true);

  const selected = questions.find((q) => q.id === selectedId) ?? null;

  const handleSelect = (q: TestQuestion) => {
    setSelectedId(q.id);
    setInspectorOpen(true);
  };

  const addQuestions = (newQuestions: TestQuestion[]) => {
    setQuestions((prev) => {
      const next = [...prev, ...newQuestions];
      if (!selectedId && next.length > 0) setSelectedId(next[0].id);
      return next;
    });
    // Newly added questions haven't been run yet — drop any stale results.
    setEvaluated(false);
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

  const handleRunEvaluation = () => {
    if (questions.length === 0 || running) return;
    setRunning(true);
    window.setTimeout(() => {
      setRunning(false);
      setEvaluated(true);
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
                evaluated={evaluated}
                running={running}
                onRunEvaluation={handleRunEvaluation}
              />
              {/* key resets per-question local state (expanded sources) */}
              {inspectorOpen && (
                <EvaluatePanel
                  key={selected?.id ?? 'none'}
                  question={selected}
                  evaluated={evaluated}
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
