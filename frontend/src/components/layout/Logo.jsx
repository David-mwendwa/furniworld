import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn.js';

// The mark is a filled square with the glyph knocked out of it, so the glyph has
// to carry the surrounding background colour — cream on a light page, near-black
// on the dark footer. Hardcoding one of them makes the mark vanish on the other.
const Mark = ({ tone }) => {
  const square = tone === 'dark' ? '#4A3224' : '#FAF7F2';
  const glyph = tone === 'dark' ? '#FAF7F2' : '#2A1B13';

  return (
    <svg viewBox="0 0 64 64" className="h-8 w-8 shrink-0" fill="none" aria-hidden>
      <rect x="2" y="2" width="60" height="60" rx="14" fill={square} />
      {/* A plain F. An earlier version added a base rail below the stem, which
          closed the letter into an E. */}
      <path d="M22 16h22v7H29v8h13v7H29v10h-7z" fill={glyph} />
    </svg>
  );
};

const Logo = ({ className, tone = 'dark', showWordmark = true }) => (
  <Link
    to="/"
    className={cn('group inline-flex items-center gap-3', className)}
    aria-label="Furniworld home">
    <Mark tone={tone} />
    {showWordmark && (
      <span
        className={cn(
          'text-sm font-medium uppercase tracking-[0.28em]',
          tone === 'dark' ? 'text-primary-950' : 'text-cream'
        )}>
        Furniworld
      </span>
    )}
  </Link>
);

export default Logo;
