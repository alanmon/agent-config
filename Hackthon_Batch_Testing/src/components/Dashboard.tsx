import { useState } from 'react';
import {
  KsButton,
  KsCheckbox,
  KsLink,
  KsProgress,
  KsSegmentedControl,
  KsSegmentedControlItem,
  KsSwitch,
  KsTag,
} from '@byted-keystone/react';
import {
  KsIconArrowDownSmall,
  KsIconArrowUpSmall,
  KsIconCalendar,
  KsIconChevronRight,
  KsIconHelp,
  KsIconNewWindow,
  KsIconNotes,
  KsIconPlus,
} from '@fe-infra/keystone-icons-react';
import RecommendationArt from './RecommendationArt';
import TrendChart from './TrendChart';
import {
  accountOverview,
  adGroupStatuses,
  chartTicks,
  dateRangeLabel,
  metrics,
  recommendations,
  timezoneLabel,
} from '../data';

export default function Dashboard() {
  const [view, setView] = useState<string | number>('graph');
  const [selected, setSelected] = useState<string[]>(
    metrics.filter((m) => m.defaultSelected).map((m) => m.id)
  );
  const [topFive, setTopFive] = useState(false);

  const toggleMetric = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));

  const plotted = metrics.filter((m) => selected.includes(m.id));

  return (
    <div className="dashboard">
      <div className="dash-title-row">
        <h1 className="dash-title">Welcome to Ads Manager</h1>
        <div className="dash-title-actions">
          <KsButton variant="default" size="md">
            <span className="chip-inner">
              <KsIconNotes size="16" /> Log
            </span>
          </KsButton>
          <KsButton variant="primary" size="md">
            <span className="chip-inner">
              <KsIconPlus size="16" /> Create ad
            </span>
          </KsButton>
        </div>
      </div>

      {/* ---------- Recommendations ---------- */}
      <div className="section-head">
        <h2 className="section-title">Recommendations</h2>
        <KsLink size="md" href="#recommendations">
          <span className="chip-inner">
            View all recommendations <KsIconNewWindow size="16" />
          </span>
        </KsLink>
      </div>

      <div className="rec-grid">
        {recommendations.map((rec) => (
          <div className="surface rec-card" key={rec.id}>
            {rec.kind === 'score' ? (
              <div className="rec-score">
                <div className="rec-score-value">{rec.percent}%</div>
                <KsProgress
                  variant="bar"
                  size="sm"
                  percent={rec.percent}
                  status="warning"
                  showPercentAndStatus={false}
                />
              </div>
            ) : (
              <RecommendationArt art={rec.art ?? 'plane'} />
            )}
            <div className="rec-body">
              <div className="rec-title">{rec.title}</div>
              <p className="rec-desc">{rec.description}</p>
              <KsButton variant="default" size="md">
                {rec.cta}
              </KsButton>
            </div>
          </div>
        ))}
      </div>

      {/* ---------- Account overview + performance ---------- */}
      <div className="dash-columns">
        <div className="dash-col-left">
          <h2 className="section-title">Account overview</h2>
          <div className="surface balance-card">
            <div className="balance-row">
              <span className="balance-label">
                Available balance <KsIconHelp size="16" />
              </span>
              <button className="inline-link" type="button">
                Manage <KsIconChevronRight size="16" />
              </button>
            </div>
            <div className="balance-value">
              {accountOverview.availableBalance} <span className="unit">{accountOverview.currency}</span>
            </div>
            <hr className="soft-divider" />
            <div className="balance-label">Today&rsquo;s spend</div>
            <div className="balance-value">
              {accountOverview.todaySpend} <span className="unit">{accountOverview.currency}</span>
            </div>
          </div>

          <h2 className="section-title">Ad group status</h2>
          <div className="surface status-card">
            {adGroupStatuses.map((s, i) => (
              <div className="status-row" key={s.id}>
                <span className="status-left">
                  <KsTag variant={s.variant} size="sm">
                    {s.count}
                  </KsTag>
                  {s.label}
                </span>
                <button className="inline-link" type="button">
                  View details <KsIconChevronRight size="16" />
                </button>
                {i < adGroupStatuses.length - 1 && <hr className="soft-divider row-divider" />}
              </div>
            ))}
          </div>
        </div>

        <div className="dash-col-right">
          <h2 className="section-title">Performance</h2>
          <div className="surface perf-card">
            <div className="perf-head">
              <KsSegmentedControl value={view} onChange={(value) => setView(value)}>
                <KsSegmentedControlItem value="graph">Graph</KsSegmentedControlItem>
                <KsSegmentedControlItem value="data">Data</KsSegmentedControlItem>
              </KsSegmentedControl>
              <button className="date-field" type="button">
                <span>
                  {dateRangeLabel} <span className="tz">{timezoneLabel}</span>
                </span>
                <KsIconCalendar size="18" />
              </button>
            </div>

            <div className="perf-body">
              <div className="metric-column">
                {metrics.map((m) => {
                  const on = selected.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      className={`metric-tile ${on ? 'is-on' : ''}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleMetric(m.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') toggleMetric(m.id);
                      }}
                    >
                      <div className="metric-top">
                        <span className="metric-label">
                          <b>{m.label}</b> <span className="optional">&middot; Optional</span>
                        </span>
                        <span onClick={(e) => e.stopPropagation()}>
                          <KsCheckbox size="sm" checked={on} onChange={() => toggleMetric(m.id)} />
                        </span>
                      </div>
                      <div className="metric-value">
                        {m.value}
                        {m.unit && <span className="unit"> {m.unit}</span>}
                        <span className={`delta ${m.deltaDirection}`}>
                          {m.deltaDirection === 'up' ? (
                            <KsIconArrowUpSmall size="14" />
                          ) : (
                            <KsIconArrowDownSmall size="14" />
                          )}
                          {m.deltaLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="chart-column">
                <div className="chart-head">
                  <span className="chart-title">Trend</span>
                  <span className="chart-toggle">
                    <span>View top 5 campaigns</span>
                    <KsSwitch
                      size="sm"
                      checked={topFive}
                      onChange={(checked) => setTopFive(checked)}
                      aria-label="View top 5 campaigns"
                    />
                  </span>
                </div>
                {view === 'graph' ? (
                  <TrendChart metrics={plotted} ticks={chartTicks} />
                ) : (
                  <table className="perf-table">
                    <thead>
                      <tr>
                        <th>Metric</th>
                        {chartTicks.map((t) => (
                          <th key={t}>{t}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {plotted.map((m) => (
                        <tr key={m.id}>
                          <td>{m.label}</td>
                          {m.series.map((v, i) => (
                            <td key={i}>{Math.round(v * 1000)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
