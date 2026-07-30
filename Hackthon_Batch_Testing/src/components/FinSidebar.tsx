import { useState } from 'react';
import { KsNavItem, KsSideNavigation } from '@byted-keystone/react';

const brandItems = [
  { value: 'showcase', label: 'Dashboard', isNew: true },
  { value: 'tentpole', label: 'Sources', isNew: true },
  { value: 'pulse', label: 'Knowledge base', isNew: true },
  { value: 'search', label: 'Rules' },
  { value: 'planner', label: 'Chat history' },
  { value: 'missions', label: 'Agent settings' },
];

/** Feature-level navigation shown beside the global Ads Manager rail. */
export default function FinSidebar() {
  const [active, setActive] = useState('showcase');

  return (
    <KsSideNavigation className="brand-sidebar" title={<span>Agent Studio</span>}>
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
