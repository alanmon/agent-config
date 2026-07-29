import { useState } from 'react';
import { KsNavItem, KsSideNavigation } from '@byted-keystone/react';

const brandItems = [
  { value: 'showcase', label: 'Brand showcase', isNew: true },
  { value: 'tentpole', label: 'Tentpole package', isNew: true },
  { value: 'pulse', label: 'Pulse lineup', isNew: true },
  { value: 'search', label: 'Branded search hub' },
  { value: 'planner', label: 'Planner' },
  { value: 'missions', label: 'Mission manager' },
];

/** Feature-level navigation shown beside the global Ads Manager rail. */
export default function FinSidebar() {
  const [active, setActive] = useState('showcase');

  return (
    <KsSideNavigation className="brand-sidebar" title={<span>Brand hub</span>}>
      {brandItems.map((item) => (
        <KsNavItem
          key={item.value}
          value={item.value}
          size="sm"
          active={active === item.value}
          onClick={() => setActive(item.value)}
        >
          <span className="brand-nav-label">
            <span>{item.label}</span>
            {item.isNew && <span className="new-badge">New</span>}
          </span>
        </KsNavItem>
      ))}
    </KsSideNavigation>
  );
}
