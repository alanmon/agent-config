import { useState, type ReactNode } from 'react';
import { KsNavItem, KsSideNavigation, KsSubNavigation } from '@byted-keystone/react';
import {
  KsIconCampaignList,
  KsIconCatalog,
  KsIconChevronRight,
  KsIconCustomReport,
  KsIconHome,
  KsIconMoreHorizontal,
  KsIconPayment,
  KsIconShoppingBag,
  KsIconUser,
} from '@fe-infra/keystone-icons-react';
import { navEntries } from '../nav';
import type { Route } from '../routes';

const icons: Record<string, ReactNode> = {
  home: <KsIconHome size="24" />,
  campaigns: <KsIconCampaignList size="24" />,
  assets: <KsIconCatalog size="24" />,
  reports: <KsIconCustomReport size="24" />,
  payment: <KsIconPayment size="24" />,
  account: <KsIconUser size="24" />,
  gmv: <KsIconShoppingBag size="24" />,
  more: <KsIconMoreHorizontal size="24" />,
};

interface Props {
  route: Route;
  onNavigate: (route: Route) => void;
}

/**
 * Collapsed 60px rail that expands into a full menu on hover — the bridge between
 * the dashboard (screen 1) and Agent Studio (screen 3).
 */
export default function GlobalNav({ route, onNavigate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(true);

  /** Top-level entry that is highlighted for the current route. */
  const activeTop = route === 'dashboard' ? 'dashboard' : 'assets';
  const activeChild = route === 'hub' ? 'lead-agent-hub' : undefined;

  return (
    <div
      className="global-nav"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Collapsed rail — always in the layout so content never shifts. */}
      <nav className="icon-rail" aria-label="Ads Manager">
        {navEntries.map((entry) => (
          <KsNavItem
            key={entry.value}
            value={entry.value}
            size="md"
            collapsed
            active={entry.value === activeTop}
            prefix={icons[entry.icon]}
            aria-label={entry.label}
            title={entry.label}
            onClick={() => {
              if (entry.route) onNavigate(entry.route);
              else setExpanded(true);
            }}
          />
        ))}
      </nav>

      {/* Expanded overlay — screen 2. */}
      <div className={`nav-flyout ${expanded ? 'is-open' : ''}`} aria-hidden={!expanded}>
        <KsSideNavigation className="nav-flyout-panel">
          {navEntries.map((entry) =>
            entry.children ? (
              <KsSubNavigation
                key={entry.value}
                size="md"
                expanded={assetsOpen}
                title={<span>{entry.label}</span>}
                prefix={icons[entry.icon]}
                onExpand={(open) => setAssetsOpen(open)}
              >
                {entry.children.map((child) => (
                  <KsNavItem
                    key={child.value}
                    value={child.value}
                    size="md"
                    level={1}
                    active={child.value === activeChild}
                    onClick={() => {
                      if (child.route) {
                        onNavigate(child.route);
                        setExpanded(false);
                      }
                    }}
                  >
                    {child.label}
                  </KsNavItem>
                ))}
              </KsSubNavigation>
            ) : (
              <KsNavItem
                key={entry.value}
                value={entry.value}
                size="md"
                active={entry.value === activeTop && !activeChild}
                prefix={icons[entry.icon]}
                suffix={entry.drilldown ? <KsIconChevronRight size="18" /> : undefined}
                onClick={() => {
                  if (entry.route) {
                    onNavigate(entry.route);
                    setExpanded(false);
                  }
                }}
              >
                {entry.label}
              </KsNavItem>
            )
          )}
        </KsSideNavigation>
      </div>
    </div>
  );
}
