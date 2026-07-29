import { KsBadge } from '@byted-keystone/react';
import {
  KsIconChevronDown,
  KsIconCoupon,
  KsIconHelp,
  KsIconRemind,
  KsIconSearch,
} from '@fe-infra/keystone-icons-react';
import tiktokLogoIcon from '../assets/tiktok-logo-icon.svg';
import tiktokWordmark from '../assets/tiktok-wordmark.svg';

/** Ads Manager application header from the updated Figma shell. */
export default function TopBar() {
  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <button className="workspace-switch" type="button" aria-label="Switch workspace">
          <span className="waffle" aria-hidden="true">
            {Array.from({ length: 9 }, (_, index) => (
              <span key={index} />
            ))}
          </span>
          <span className="workspace-avatar">Y</span>
        </button>

        <div className="ads-manager-brand" aria-label="TikTok Ads Manager">
          <span className="tiktok-lockup">
            <img src={tiktokLogoIcon} alt="" className="tiktok-logo-icon" />
            <img src={tiktokWordmark} alt="TikTok" className="tiktok-wordmark" />
          </span>
          <span>Ads Manager</span>
        </div>
      </div>

      <div className="top-bar-right">
        <button className="top-utility" type="button" aria-label="Search">
          <KsIconSearch size="24" />
        </button>
        <KsBadge variant="error" count={2}>
          <button className="top-utility" type="button" aria-label="Notifications">
            <KsIconRemind size="24" />
          </button>
        </KsBadge>
        <button className="top-utility" type="button" aria-label="Help">
          <KsIconHelp size="24" />
        </button>
        <button className="account-switcher" type="button">
          <span>upstream.land</span>
          <KsIconChevronDown size="16" />
        </button>
        <button className="top-coupon" type="button" aria-label="Coupons">
          <KsIconCoupon size="24" />
        </button>
      </div>
    </header>
  );
}
