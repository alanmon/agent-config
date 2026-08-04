/**
 * Global Ads Manager navigation, shared by the collapsed rail and the expanded
 * overlay so both stay in sync (Figma nodes 23:24216 → 23:25370).
 */

export interface NavChild {
  value: string;
  label: string;
  /** Route this child navigates to, when it has one. */
  route?: 'dashboard' | 'hub';
}

export interface NavEntry {
  value: string;
  label: string;
  /** Key into the icon map in GlobalNav. */
  icon: string;
  route?: 'dashboard' | 'hub';
  /** Present for expandable groups such as Assets. */
  children?: NavChild[];
  /** Renders a trailing chevron without an inline expansion (More tools). */
  drilldown?: boolean;
}

export const navEntries: NavEntry[] = [
  { value: 'dashboard', label: 'Dashboard', icon: 'home', route: 'dashboard' },
  { value: 'campaigns', label: 'Campaigns', icon: 'campaigns' },
  {
    value: 'assets',
    label: 'Assets',
    icon: 'assets',
    children: [
      { value: 'events-manager', label: 'Events Manager' },
      { value: 'catalog-manager', label: 'Catalog Manager' },
      { value: 'creative-library', label: 'Creative Library' },
      { value: 'lead-agent-hub', label: 'Agent Studio', route: 'hub' },
    ],
  },
  { value: 'custom-reports', label: 'Custom reports', icon: 'reports' },
  { value: 'payment', label: 'Payment', icon: 'payment' },
  { value: 'account-setup', label: 'Account setup', icon: 'account' },
  { value: 'gmv-max', label: 'GMV Max', icon: 'gmv' },
  { value: 'more-tools', label: 'More tools', icon: 'more', drilldown: true },
];
