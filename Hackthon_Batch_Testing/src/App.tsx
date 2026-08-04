import { useEffect, useState } from 'react';
import TopBar from './components/TopBar';
import GlobalNav from './components/GlobalNav';
import FinSidebar from './components/FinSidebar';
import type { AgentSection } from './components/FinSidebar';
import Dashboard from './components/Dashboard';
import AgentDashboard from './components/AgentDashboard';
import TestConsole, { type ManageAction, type TestingAs, type TestOnboardingStep } from './components/TestConsole';
import EvaluatePanel from './components/EvaluatePanel';
import {
  GenerateQuestionsModal,
  AddManuallyModal,
  ComingSoonModal,
  RenameListModal,
  CreateGroupModal,
  DeleteGroupModal,
  GroupSettingsModal,
  ApplyRecommendationModal,
  type CreateGroupMethod,
} from './components/AddQuestionModals';
import {
  ANSWER_RATING_LABELS,
  IMPROVEMENT_REASON_LABELS,
  isHumanReviewComplete,
  ratingFromStatus,
  testGroup as initialGroup,
  type TestQuestion,
  type RecommendationTarget,
} from './data';
import type { Route } from './routes';

type AddAction = 'manual' | 'generate' | 'csv';
type ModalName = AddAction | 'create' | 'rename' | 'delete' | 'settings' | 'improvement';
type TestOnboardingStatus = 'inactive' | 'active' | 'completed' | 'dismissed';

interface SavedGroup {
  id: string;
  title: string;
  questions: TestQuestion[];
  selectedId: string | null;
  evaluatedIds: Set<string>;
  testingAs: TestingAs;
}

const RUN_DELAY_MS = 1100;
const INITIAL_GROUP_ID = 'group-aura-med-spa';

const createEmptyGroup = (id: string, title: string): SavedGroup => ({
  id,
  title,
  questions: [],
  selectedId: null,
  evaluatedIds: new Set(),
  testingAs: 'preview',
});

const csvCell = (value: string) => {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
};

export default function App() {
  // Start on the homepage dashboard; the Test console remains available from
  // Assets → Agent Studio in the global navigation.
  const [route, setRoute] = useState<Route>('dashboard');
  const [agentSection, setAgentSection] = useState<AgentSection>('dashboard');
  const [groups, setGroups] = useState<SavedGroup[]>([
    {
      ...createEmptyGroup(INITIAL_GROUP_ID, initialGroup.title),
      questions: initialGroup.questions,
    },
  ]);
  const [activeGroupId, setActiveGroupId] = useState(INITIAL_GROUP_ID);
  const [running, setRunning] = useState(false);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalName | null>(null);
  const [recommendationDraft, setRecommendationDraft] = useState<{
    questionId: string;
    target: RecommendationTarget;
    action: string;
    detail: string;
  } | null>(null);
  const [rerunToast, setRerunToast] = useState<string | null>(null);
  const [creationToast, setCreationToast] = useState<string | null>(null);
  const [testOnboardingStatus, setTestOnboardingStatus] = useState<TestOnboardingStatus>('inactive');
  const [showOnboardingToast, setShowOnboardingToast] = useState(false);
  // The inspector is dismissable; picking a question brings it back.
  const [inspectorOpen, setInspectorOpen] = useState(true);

  const activeGroup = groups.find((group) => group.id === activeGroupId) ?? groups[0];
  const { questions, selectedId, evaluatedIds } = activeGroup;
  const selected = questions.find((q) => q.id === selectedId) ?? null;
  const onboardingStep: TestOnboardingStep | null = questions.length === 0
    ? 'add_questions'
    : evaluatedIds.size > 0
      ? 'review_answer'
      : null;

  useEffect(() => {
    if (route === 'hub' && agentSection === 'test' && testOnboardingStatus === 'inactive') {
      setTestOnboardingStatus('active');
    }
  }, [agentSection, route, testOnboardingStatus]);

  useEffect(() => {
    if (testOnboardingStatus !== 'active' || onboardingStep !== 'review_answer') return;
    const hasCompletedReview = questions.some((question) => (
      evaluatedIds.has(question.id) && isHumanReviewComplete(question)
    ));
    if (!hasCompletedReview) return;
    setTestOnboardingStatus('completed');
    setShowOnboardingToast(true);
  }, [evaluatedIds, onboardingStep, questions, testOnboardingStatus]);

  useEffect(() => {
    if (!showOnboardingToast) return;
    const timer = window.setTimeout(() => setShowOnboardingToast(false), 4200);
    return () => window.clearTimeout(timer);
  }, [showOnboardingToast]);

  const updateGroup = (groupId: string, update: (group: SavedGroup) => SavedGroup) => {
    setGroups((previous) => previous.map((group) => (group.id === groupId ? update(group) : group)));
  };

  const updateActiveGroup = (update: (group: SavedGroup) => SavedGroup) => {
    updateGroup(activeGroupId, update);
  };

  // Automatically work through the active group's unanswered questions in the
  // same top-to-bottom order shown in the table.
  useEffect(() => {
    if (route !== 'hub' || agentSection !== 'test' || questions.length === 0) {
      setRunning(false);
      setEvaluatingId(null);
      return;
    }

    const nextQuestion = questions.find((question) => !evaluatedIds.has(question.id));
    if (!nextQuestion) {
      setRunning(false);
      setEvaluatingId(null);
      return;
    }

    const groupId = activeGroupId;
    setRunning(true);
    setEvaluatingId(nextQuestion.id);
    setInspectorOpen(true);

    const timer = window.setTimeout(() => {
      updateGroup(groupId, (group) => ({
        ...group,
        evaluatedIds: new Set(group.evaluatedIds).add(nextQuestion.id),
      }));
      setEvaluatingId(null);
    }, RUN_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [activeGroupId, agentSection, evaluatedIds, questions, route]);

  // Selection changes what the Inspector shows; answering is automatic.
  const handleSelect = (q: TestQuestion) => {
    updateActiveGroup((group) => ({ ...group, selectedId: q.id }));
    setInspectorOpen(true);
  };

  const addQuestions = (newQuestions: TestQuestion[]) => {
    const accepted = newQuestions.slice(0, Math.max(0, 50 - questions.length));
    if (accepted.length === 0) {
      setModal(null);
      return;
    }

    const firstArrival = !selectedId ? accepted[0] : null;
    updateActiveGroup((group) => ({
      ...group,
      questions: [...group.questions, ...accepted],
      selectedId: group.selectedId ?? firstArrival?.id ?? null,
    }));

    setModal(null);
  };

  const handleAddManual = (texts: string[]) => {
    const stamp = Date.now();
    addQuestions(
      texts.map((text, i) => ({
        id: `manual-${stamp}-${i}`,
        category: 'General',
        question: text,
        status: 'pass',
        humanRating: null,
        ratingReason: null,
        reviewNote: '',
        answer: 'Thanks for your question. Based on the clinic guidance available, our team can help with the next appropriate step.',
        content: [],
        guidance: [],
      })),
    );
  };

  const switchGroup = (id: string) => {
    if (id === activeGroupId) return;
    setActiveGroupId(id);
    setRunning(false);
    setEvaluatingId(null);
    setInspectorOpen(true);
  };

  const handleCreateGroup = (name: string, method: CreateGroupMethod) => {
    const id = `group-${Date.now()}`;
    const title = name || `Untitled test group ${groups.length + 1}`;
    setGroups((previous) => [...previous, createEmptyGroup(id, title)]);
    setActiveGroupId(id);
    setRunning(false);
    setEvaluatingId(null);
    setInspectorOpen(true);
    setModal(method);
  };

  const deleteActiveGroup = () => {
    const currentIndex = groups.findIndex((group) => group.id === activeGroupId);
    let remaining = groups.filter((group) => group.id !== activeGroupId);

    if (remaining.length === 0) {
      const replacement = createEmptyGroup(`group-${Date.now()}`, 'Untitled test group');
      remaining = [replacement];
    }

    const nextGroup = remaining[Math.max(0, currentIndex - 1)] ?? remaining[0];
    setGroups(remaining);
    setActiveGroupId(nextGroup.id);
    setRunning(false);
    setEvaluatingId(null);
    setInspectorOpen(true);
    setModal(null);
  };

  const exportActiveGroup = () => {
    const header = [
      'Question',
      'Answer',
      'Final rating',
      'AI rating',
      'Human rating',
      'Review status',
      'Poor reason',
      'Internal note',
      'Content sources',
      'Guidance sources',
    ];
    const rows = questions.map((question) => {
      const evaluated = evaluatedIds.has(question.id);
      const aiRating = evaluated ? ratingFromStatus(question.status) : null;
      const reviewComplete = isHumanReviewComplete(question);
      const finalRating = reviewComplete ? question.humanRating : aiRating;
      const reviewStatus = !question.humanRating
        ? 'Needs review'
        : question.humanRating === aiRating
          ? 'Reviewed'
          : 'Overridden';
      return [
        question.question,
        evaluated ? question.answer : '',
        finalRating ? ANSWER_RATING_LABELS[finalRating] : '',
        aiRating ? ANSWER_RATING_LABELS[aiRating] : '',
        question.humanRating ? ANSWER_RATING_LABELS[question.humanRating] : '',
        evaluated ? reviewStatus : '',
        question.ratingReason ? IMPROVEMENT_REASON_LABELS[question.ratingReason] : '',
        question.reviewNote,
        question.content.map((source) => source.title).join('; '),
        question.guidance.map((source) => source.title).join('; '),
      ];
    });
    const csv = [header, ...rows].map((row) => row.map((value) => csvCell(String(value))).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeGroup.title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'test-group'}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const handleManageAction = (action: ManageAction) => {
    if (action === 'export') {
      exportActiveGroup();
      return;
    }
    setModal(action);
  };

  /** Human ratings live with their group, so they survive switching groups. */
  const handleReviewChange = (
    id: string,
    changes: Partial<Pick<TestQuestion, 'humanRating' | 'ratingReason' | 'reviewNote'>>,
  ) => {
    updateActiveGroup((group) => ({
      ...group,
      questions: group.questions.map((question) => {
        if (question.id !== id) return question;
        const updated = { ...question, ...changes };
        if (changes.humanRating && changes.humanRating !== 'poor') updated.ratingReason = null;
        if (changes.humanRating === 'good') updated.reviewNote = '';
        return updated;
      }),
    }));
  };

  const handleRecommendationAction = (
    question: TestQuestion,
    target: RecommendationTarget,
    action: string,
    detail: string,
  ) => {
    setRecommendationDraft({ questionId: question.id, target, action, detail });
    setModal('improvement');
  };

  const applyRecommendation = (title: string, content?: string) => {
    if (!recommendationDraft) return;
    updateActiveGroup((group) => ({
      ...group,
      questions: group.questions.map((question) => (
        question.id === recommendationDraft.questionId
          ? {
              ...question,
              appliedRecommendation: { target: recommendationDraft.target, title, content },
              content: recommendationDraft.target === 'knowledge'
                ? [
                    ...question.content.filter((source) => source.title !== title),
                    { kind: 'content', title, meta: 'Newly added · Available to the AI Agent' },
                  ]
                : question.content,
            }
          : question
      )),
    }));
    setModal(null);
    setRecommendationDraft(null);
    const label = recommendationDraft.target === 'knowledge' ? 'Knowledge article created' : 'Configuration change saved';
    setCreationToast(`${label} — ready to use when you re-run this question.`);
    window.setTimeout(() => setCreationToast(null), 4200);
  };

  const handleRerun = (id: string) => {
    let appliedTitle = '';
    setCreationToast(null);
    updateActiveGroup((group) => ({
      ...group,
      questions: group.questions.map((question) => {
        if (question.id !== id || !question.appliedRecommendation) return question;
        const { target, title } = question.appliedRecommendation;
        appliedTitle = title;
        if (target === 'knowledge') {
          const updatedKnowledge = question.content.some((source) => source.title === title)
            ? question.content.map((source) => source.title === title
                ? { ...source, meta: 'Newly added · Used in this re-run' }
                : source)
            : [...question.content, { kind: 'content' as const, title, meta: 'Newly added · Used in this re-run' }];
          return {
            ...question,
            status: 'pass',
            answer: 'Blood thinners can affect eligibility and bleeding risk for liposuction. Please do not stop or change medication on your own — your provider will review your medication and arrange a consultation before any procedure.',
            content: updatedKnowledge,
            searchEvidence: undefined,
            rootCause: undefined,
            fixSuggestion: undefined,
          };
        }
        if (target === 'rules') {
          return {
            ...question,
            status: 'pass',
            answer: 'I can help arrange a consultation first so your provider can confirm eligibility and discuss potential risks. They can then help you plan the next appropriate appointment.',
            guidance: [...question.guidance, { kind: 'guidance', title, meta: 'Updated rule · Used in this re-run' }],
            rootCause: undefined,
            fixSuggestion: undefined,
            instructions: question.instructions?.map((instruction) => ({ ...instruction, status: 'followed', detail: 'Updated guidance was followed in this re-run.' })),
          };
        }
        return {
          ...question,
          status: 'pass',
          answer: 'Thanks for your question. The updated configuration guided the next appropriate step for your request.',
          rootCause: undefined,
          fixSuggestion: undefined,
        };
      }),
    }));
    if (appliedTitle) {
      setRerunToast(`Re-run complete — now using ${appliedTitle}`);
      window.setTimeout(() => setRerunToast(null), 4200);
    }
  };

  const handleRouteChange = (nextRoute: Route) => {
    if (nextRoute === 'hub') setAgentSection('dashboard');
    setRoute(nextRoute);
  };

  return (
    <div className="app">
      <TopBar />
      <div className="app-body">
        <GlobalNav route={route} onNavigate={handleRouteChange} />

        {route === 'dashboard' ? (
          <main className="shell-content is-dashboard">
            <Dashboard />
          </main>
        ) : (
          <main className="shell-content">
            <FinSidebar active={agentSection} onNavigate={setAgentSection} />
            {agentSection === 'dashboard' ? (
              <AgentDashboard />
            ) : agentSection === 'test' ? (
            <div className="workspace">
              <TestConsole
                group={{ ...initialGroup, title: activeGroup.title, questions }}
                savedGroups={groups.map(({ id, title }) => ({ id, title }))}
                activeGroupId={activeGroupId}
                selectedId={selectedId}
                onSelect={handleSelect}
                onAddAction={setModal}
                evaluatedIds={evaluatedIds}
                evaluatingId={evaluatingId}
                running={running}
                testingAs={activeGroup.testingAs}
                onTestingAsChange={(testingAs) => updateActiveGroup((group) => ({ ...group, testingAs }))}
                onSwitchGroup={switchGroup}
                onCreateGroup={() => setModal('create')}
                onManageAction={handleManageAction}
                onboardingStep={testOnboardingStatus === 'active' ? onboardingStep : null}
                onSkipOnboarding={() => setTestOnboardingStatus('dismissed')}
              />
              {inspectorOpen && questions.length > 0 && (
                <EvaluatePanel
                  key={`${activeGroup.id}:${selected?.id ?? 'none'}`}
                  question={selected}
                  evaluated={!!selected && evaluatedIds.has(selected.id)}
                  evaluating={!!selected && evaluatingId === selected.id}
                  onReviewChange={handleReviewChange}
                  onRecommendationAction={handleRecommendationAction}
                  onRerun={handleRerun}
                  showReviewOnboarding={
                    testOnboardingStatus === 'active'
                    && onboardingStep === 'review_answer'
                    && !!selected
                    && evaluatedIds.has(selected.id)
                  }
                  onClose={() => setInspectorOpen(false)}
                />
              )}
            </div>
            ) : (
              <section className="agent-section-placeholder">
                <h1>{agentSection === 'setting' ? 'Setting' : `${agentSection[0].toUpperCase()}${agentSection.slice(1)}`}</h1>
                <p>This area is ready for the next prototype workflow.</p>
              </section>
            )}
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
      <CreateGroupModal open={modal === 'create'} onCancel={() => setModal(null)} onConfirm={handleCreateGroup} />
      <RenameListModal
        open={modal === 'rename'}
        currentName={activeGroup.title}
        onCancel={() => setModal(null)}
        onConfirm={(title) => {
          updateActiveGroup((group) => ({ ...group, title }));
          setModal(null);
        }}
      />
      <DeleteGroupModal
        open={modal === 'delete'}
        groupName={activeGroup.title}
        onCancel={() => setModal(null)}
        onConfirm={deleteActiveGroup}
      />
      <GroupSettingsModal
        open={modal === 'settings'}
        value={activeGroup.testingAs}
        onCancel={() => setModal(null)}
        onConfirm={(testingAs) => {
          updateActiveGroup((group) => ({ ...group, testingAs }));
          setModal(null);
        }}
      />
      <ComingSoonModal
        open={modal === 'csv'}
        title="Import questions from CSV file"
        description={<span>CSV upload isn't available in this demo. Use <b>Add manually</b> or <b>Generate from conversations</b> instead.</span>}
        onCancel={() => setModal(null)}
      />
      <ApplyRecommendationModal
        open={modal === 'improvement'}
        target={recommendationDraft?.target ?? null}
        action={recommendationDraft?.action ?? ''}
        detail={recommendationDraft?.detail ?? ''}
        onCancel={() => {
          setModal(null);
          setRecommendationDraft(null);
        }}
        onConfirm={applyRecommendation}
      />
      {rerunToast && (
        <div className="test-complete-toast" role="status" aria-live="polite">
          <span className="test-complete-toast-icon">✓</span>
          <div><b>Question re-run complete</b><small>{rerunToast}</small></div>
        </div>
      )}
      {creationToast && (
        <div className="test-complete-toast" role="status" aria-live="polite">
          <span className="test-complete-toast-icon">✓</span>
          <div><b>Change created successfully</b><small>{creationToast}</small></div>
        </div>
      )}
      {showOnboardingToast && (
        <div className="test-complete-toast onboarding-complete-toast" role="status" aria-live="polite">
          <span className="test-complete-toast-icon">✓</span>
          <div><b>Test onboarding complete</b><small>You’re ready to test and review AI Agent answers.</small></div>
          <button
            type="button"
            className="test-complete-toast-close"
            aria-label="Close onboarding completion message"
            onClick={() => setShowOnboardingToast(false)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
