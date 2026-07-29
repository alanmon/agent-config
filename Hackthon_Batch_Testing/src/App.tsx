import { useState } from 'react';
import TopBar from './components/TopBar';
import IconRail from './components/IconRail';
import FinSidebar from './components/FinSidebar';
import TestConsole from './components/TestConsole';
import EvaluatePanel from './components/EvaluatePanel';
import { testGroup, type TestQuestion } from './data';

export default function App() {
  const [selected, setSelected] = useState<TestQuestion>(testGroup.questions[0]);

  return (
    <div className="app">
      <TopBar />
      <div className="app-body">
        <IconRail />
        <main className="shell-content">
          <FinSidebar />
          <div className="workspace">
            <TestConsole group={testGroup} selectedId={selected.id} onSelect={setSelected} />
            {/* key resets per-question local state (rating, expanded sources) */}
            <EvaluatePanel key={selected.id} question={selected} />
          </div>
        </main>
      </div>
    </div>
  );
}
