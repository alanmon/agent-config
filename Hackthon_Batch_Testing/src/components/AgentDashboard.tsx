import type { CSSProperties } from 'react';
import { KsIconCalendar, KsIconHelp, KsIconPlus } from '@fe-infra/keystone-icons-react';

const metrics = [
  {
    label: 'AI agent deflection rate',
    value: '68.4%',
    detail: '3,421 of 5,002 conversations',
    change: '+8.2% vs previous period',
  },
  {
    label: 'AI agent resolution rate',
    value: '76.1%',
    detail: '2,846 of 3,740 conversations',
    change: '+5.4% vs previous period',
  },
  {
    label: 'AI agent CSAT score',
    value: '4.7 / 5',
    detail: 'Based on 1,284 ratings',
    change: '+0.3 vs previous period',
  },
];

const conversationBars = [58, 66, 61, 74, 72, 81, 78, 86, 84, 92, 88, 96];

export default function AgentDashboard() {
  return (
    <section className="agent-hub-dashboard" aria-label="Agent Studio dashboard">
      <header className="agent-dashboard-head">
        <div>
          <h1>Performance</h1>
          <p>Track how your AI agent is helping customers and improving support outcomes.</p>
        </div>
      </header>

      <div className="agent-dashboard-filters" aria-label="Performance filters">
        <button className="agent-filter-button" type="button">
          <KsIconCalendar size="18" /> May 1, 2026 – May 31, 2026
        </button>
        <button className="agent-filter-button is-plain" type="button">
          <KsIconPlus size="18" /> Add filter
        </button>
        <div className="agent-timezone">Los Angeles time (GMT-7)⌄</div>
      </div>

      <div className="agent-kpi-grid">
        {metrics.map((metric) => (
          <article className="agent-metric-card" key={metric.label}>
            <div className="agent-metric-label">
              <KsIconHelp size="16" /> {metric.label}
            </div>
            <div className="agent-metric-value">{metric.value}</div>
            <div className="agent-metric-detail">{metric.detail}</div>
            <div className="agent-metric-change">↗ {metric.change}</div>
          </article>
        ))}
      </div>

      <article className="agent-chart-card agent-impact-card">
        <div className="agent-card-heading">
          <div>
            <h2><KsIconHelp size="16" /> AI agent impact over time</h2>
            <p>Conversations resolved without teammate involvement</p>
          </div>
          <div className="agent-chart-legend"><span /> Resolution rate</div>
        </div>

        <div className="agent-impact-chart">
          <div className="agent-y-axis" aria-hidden="true">
            <span>80%</span><span>60%</span><span>40%</span><span>20%</span><span>0%</span>
          </div>
          <div className="agent-chart-plot">
            <svg viewBox="0 0 900 260" preserveAspectRatio="none" role="img" aria-label="Resolution rate increased from 48 to 76 percent during May">
              <line className="agent-chart-grid" x1="0" y1="20" x2="900" y2="20" />
              <line className="agent-chart-grid" x1="0" y1="75" x2="900" y2="75" />
              <line className="agent-chart-grid" x1="0" y1="130" x2="900" y2="130" />
              <line className="agent-chart-grid" x1="0" y1="185" x2="900" y2="185" />
              <line className="agent-chart-grid" x1="0" y1="240" x2="900" y2="240" />
              <path className="agent-chart-area" d="M0 155 C75 149 95 132 170 137 S270 117 340 121 S445 91 515 101 S615 70 685 82 S800 53 900 58 L900 240 L0 240 Z" />
              <path className="agent-chart-line" d="M0 155 C75 149 95 132 170 137 S270 117 340 121 S445 91 515 101 S615 70 685 82 S800 53 900 58" />
              <circle className="agent-chart-point" cx="900" cy="58" r="5" />
            </svg>
            <div className="agent-x-axis" aria-hidden="true">
              <span>May 1</span><span>May 8</span><span>May 15</span><span>May 22</span><span>May 31</span>
            </div>
          </div>
        </div>
      </article>

      <div className="agent-dashboard-lower-grid">
        <article className="agent-chart-card agent-involvement-card">
          <div className="agent-card-heading">
            <div>
              <h2><KsIconHelp size="16" /> AI agent involvement rate</h2>
              <p>Share of support conversations where the agent participated</p>
            </div>
          </div>
          <div className="agent-donut-row">
            <div className="agent-donut" role="img" aria-label="82 percent involvement rate">
              <div><b>82%</b><span>Involved</span></div>
            </div>
            <div className="agent-donut-stats">
              <b>4,980</b><span>Agent-involved conversations</span>
              <b>1,094</b><span>Teammate-only conversations</span>
            </div>
          </div>
        </article>

        <article className="agent-chart-card agent-conversations-card">
          <div className="agent-card-heading">
            <div>
              <h2><KsIconHelp size="16" /> Involved conversations over time</h2>
              <p>Weekly volume increased 14% this month</p>
            </div>
          </div>
          <div className="agent-mini-bars" aria-label="Conversation volume trend">
            {conversationBars.map((height, index) => (
              <span
                key={index}
                style={{ '--bar-height': `${height}%` } as CSSProperties}
                title={`${Math.round(height * 7.2)} conversations`}
              />
            ))}
          </div>
          <div className="agent-mini-axis"><span>May 1</span><span>May 31</span></div>
        </article>
      </div>
    </section>
  );
}
