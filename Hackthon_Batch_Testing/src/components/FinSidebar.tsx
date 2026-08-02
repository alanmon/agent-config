import { useState } from 'react';
import { KsNavItem, KsSideNavigation } from '@byted-keystone/react';

/** Flat navigation for the Lead agent hub. */
const navItems = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'knowledge', label: 'Knowledge' },
  { value: 'rules', label: 'Rules' },
  { value: 'test', label: 'Test' },
  { value: 'deploy', label: 'Deploy' },
  { value: 'setting', label: 'Setting' },
];

/** Feature-level navigation shown beside the global Ads Manager rail. */
export default function FinSidebar() {
  const [active, setActive] = useState('test');

  return (
    <KsSideNavigation className="agent-sidebar" title={<span>Lead agent hub</span>}>
      {navItems.map((item) => (
        <KsNavItem
          key={item.value}
          value={item.value}
          size="md"
          active={active === item.value}
          onClick={() => setActive(item.value)}
        >
          {item.label}
        </KsNavItem>
      ))}
    </KsSideNavigation>
  );
}
