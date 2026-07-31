import { useState } from 'react';
import TopBar from './components/TopBar';
import GlobalNav from './components/GlobalNav';
import FinSidebar from './components/FinSidebar';
import Dashboard from './components/Dashboard';
import TestConsole from './components/TestConsole';
import EvaluatePanel from './components/EvaluatePanel';
import { testGroup, type Rating, type TestQuestion } from './data';
import type { Route } from './routes';

export default function App() {
  const [route, setRoute] = useState<Route>('dashboard');

  /** Ratings live here so the evaluate panel can write back into the table chip. */
  const [ratings, setRatings] = useState<Record<string, Rating>>(() =>
    Object.fromEntries(testGroup.questions.map((q) => [q.id, q.rating]))
  );
  const [selectedId, setSelectedId] = useState<string | null>(testGroup.questions[0].id);

  const questions = testGroup.questions.map((q) => ({ ...q, rating: ratings[q.id] }));
  const selected = questions.find((q) => q.id === selectedId) ?? null;

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
                group={{ ...testGroup, questions }}
                selectedId={selected?.id ?? ''}
                onSelect={(q: TestQuestion) => setSelectedId(q.id)}
              />
              {selected && (
                /* key resets per-question local state (expanded sources) */
                <EvaluatePanel
                  key={selected.id}
                  question={selected}
                  onRate={(rating) => setRatings((prev) => ({ ...prev, [selected.id]: rating }))}
                  onClose={() => setSelectedId(null)}
                />
              )}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
