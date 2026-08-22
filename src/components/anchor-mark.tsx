import Link from "next/link";

type AnchorMarkProps = {
  compact?: boolean;
};

export function AnchorMark({ compact = false }: AnchorMarkProps) {
  return (
    <Link className="anchor-mark" href="/" aria-label="ANCHOR home">
      <span className="anchor-mark__symbol" aria-hidden="true">
        <svg viewBox="0 0 44 44" role="presentation">
          <path d="M22 7v27M13 16h18" />
          <circle cx="22" cy="7" r="3.5" />
          <path d="M10 27c2 8 7 11 12 11s10-3 12-11" />
        </svg>
      </span>
      {!compact && (
        <span className="anchor-mark__word">
          ANCHOR
          <small>Familiar moments, gently guided</small>
        </span>
      )}
    </Link>
  );
}
