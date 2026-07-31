import { useState } from 'react';
import TopBar from './components/TopBar';
import IconRail from './components/IconRail';
import FinSidebar from './components/FinSidebar';
import TestConsole from './components/TestConsole';
import EvaluatePanel from './components/EvaluatePanel';
import { GenerateQuestionsModal, AddManuallyModal, ComingSoonModal } from './components/AddQuestionModals';
import { testGroup as initialGroup, type ReviewVerdict, type TestQuestion } from './data';

type AddAction = 'manual' | 'generate' | 'csv' | 'inbox';

const RUN_DELAY_MS = 1100;

export default function App() {
  const [questions, setQuestions] = useState<TestQuestion[]>(initialGroup.questions);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [evaluated, setEvaluated] = useState(false);
  const [running, setRunning] = useState(false);
  const [modal, setModal] = useState<AddAction | null>(null);

  const selected = questions.find((q) => q.id === selectedId) ?? null;

  const handleSelect = (q: TestQuestion) => setSelectedId(q.id);

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

  const handleAddManual = (text: string) => {
    addQuestions([
      {
        id: `manual-${Date.now()}`,
        category: 'General',
        question: text,
        status: null,
        review: null,
        answer: '',
        content: [],
        guidance: [],
      },
    ]);
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
        <IconRail />
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
            <EvaluatePanel
              key={selected?.id ?? 'none'}
              question={selected}
              evaluated={evaluated}
              onReview={handleReview}
            />
          </div>
        </main>
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
        title="Import from a .csv"
        description="CSV import isn't wired up in this prototype yet — use Generate questions or Add manually for now."
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
