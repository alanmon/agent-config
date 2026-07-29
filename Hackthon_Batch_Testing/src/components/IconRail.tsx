import { KsNavItem } from '@byted-keystone/react';
import {
  KsIconAnalysis,
  KsIconBankCard,
  KsIconCatalog,
  KsIconFolder,
  KsIconHome,
  KsIconMoreHorizontal,
  KsIconShoppingBag,
  KsIconUser,
} from '@fe-infra/keystone-icons-react';

const railItems = [
  { value: 'home', label: 'Home', icon: <KsIconHome size="24" /> },
  { value: 'folder', label: 'Assets', icon: <KsIconFolder size="24" /> },
  { value: 'catalog', label: 'Catalog', icon: <KsIconCatalog size="24" /> },
  { value: 'analysis', label: 'Analytics', icon: <KsIconAnalysis size="24" /> },
  { value: 'billing', label: 'Billing', icon: <KsIconBankCard size="24" /> },
  { value: 'audiences', label: 'Audiences', icon: <KsIconUser size="24" /> },
  { value: 'commerce', label: 'Commerce', icon: <KsIconShoppingBag size="24" /> },
  { value: 'more', label: 'More', icon: <KsIconMoreHorizontal size="24" /> },
];

/** Global Ads Manager rail, using Keystone's collapsed navigation-item pattern. */
export default function IconRail() {
  return (
    <nav className="icon-rail" aria-label="Ads Manager">
      {railItems.map((item) => (
        <KsNavItem
          key={item.value}
          value={item.value}
          size="md"
          collapsed
          active={item.value === 'home'}
          prefix={item.icon}
          aria-label={item.label}
          title={item.label}
        />
      ))}
    </nav>
  );
}
