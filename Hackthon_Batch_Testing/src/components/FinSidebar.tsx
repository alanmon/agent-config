import { useState } from 'react';
import { KsNavItem, KsNavItemGroup, KsSideNavigation } from '@byted-keystone/react';

/** Sections of the Lead agent hub, per Figma node 23:7549. */
const navSections = [
  {
    title: 'Build',
    items: [
      { value: 'knowledge', label: 'Knowledge' },
      { value: 'custom-qa', label: 'Custom Q&A' },
      { value: 'test-console', label: 'Test console' },
    ],
  },
  {
    title: 'Deploy',
    items: [{ value: 'connected-campaigns', label: 'Connected campaigns' }],
  },
  {
    title: 'Analyze',
    items: [
      { value: 'dashboard', label: 'Dashboard' },
      { value: 'diagnosis', label: 'Diagnosis' },
    ],
  },
];

/** Feature-level navigation shown beside the global Ads Manager rail. */
export default function FinSidebar() {
  const [active, setActive] = useState('test-console');

  return (
    <KsSideNavigation className="agent-sidebar" title={<span>Lead agent hub</span>}>
      {navSections.map((section) => (
        <KsNavItemGroup key={section.title} title={<span>{section.title}</span>}>
          {section.items.map((item) => (
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
        </KsNavItemGroup>
      ))}
    </KsSideNavigation>
  );
}
