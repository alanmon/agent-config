import { KsNavItem, KsSideNavigation } from '@byted-keystone/react';

/** Flat navigation for Agent Studio. */
export type AgentSection = 'dashboard' | 'knowledge' | 'rules' | 'test' | 'deploy' | 'setting';

const navItems: Array<{ value: AgentSection; label: string }> = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'knowledge', label: 'Knowledge' },
  { value: 'rules', label: 'Rules' },
  { value: 'test', label: 'Test' },
  { value: 'deploy', label: 'Deploy' },
  { value: 'setting', label: 'Setting' },
];

interface Props {
  active: AgentSection;
  onNavigate: (section: AgentSection) => void;
}

/** Feature-level navigation shown beside the global Ads Manager rail. */
export default function FinSidebar({ active, onNavigate }: Props) {
  return (
    <KsSideNavigation className="agent-sidebar" title={<span>Agent Studio</span>}>
      {navItems.map((item) => (
        <KsNavItem
          key={item.value}
          value={item.value}
          size="md"
          active={active === item.value}
          onClick={() => onNavigate(item.value)}
        >
          {item.label}
        </KsNavItem>
      ))}
    </KsSideNavigation>
  );
}
