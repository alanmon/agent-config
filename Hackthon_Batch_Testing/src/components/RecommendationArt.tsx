/** Decorative spot illustrations for the recommendation cards. */
export default function RecommendationArt({ art }: { art: 'plane' | 'clock' }) {
  if (art === 'plane') {
    return (
      <svg className="rec-art" viewBox="0 0 56 56" aria-hidden="true">
        <circle cx="7" cy="6" r="2.5" fill="#2DC9C4" />
        <circle cx="16" cy="12" r="1.8" fill="#FF6B8A" />
        <path d="M50 8 L20 24 L31 30 Z" fill="#2DC9C4" />
        <path d="M50 8 L31 30 L34 46 Z" fill="#FF6B8A" opacity="0.85" />
        <path d="M50 8 L31 30 L20 24 Z" fill="#1B6B6B" opacity="0.25" />
      </svg>
    );
  }

  return (
    <svg className="rec-art" viewBox="0 0 56 56" aria-hidden="true">
      <circle cx="6" cy="7" r="2.5" fill="#FF6B8A" />
      <circle cx="15" cy="13" r="1.8" fill="#2DC9C4" />
      <circle cx="32" cy="32" r="17" fill="none" stroke="#1B6B6B" strokeWidth="4" />
      <path
        d="M32 15 a17 17 0 0 1 12 29"
        fill="none"
        stroke="#2DC9C4"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="5" fill="#FF6B8A" />
    </svg>
  );
}
