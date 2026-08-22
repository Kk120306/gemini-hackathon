import { AnchorMark } from "@/components/anchor-mark";

type SiteHeaderProps = {
  mode?: "caregiver" | "patient";
};

export function SiteHeader({ mode }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <AnchorMark />
      <div className="site-header__aside">
        {mode && (
          <span className={`mode-chip mode-chip--${mode}`}>{mode} mode</span>
        )}
        <span className="fixture-chip">
          <span aria-hidden="true" />
          Fixture ready
        </span>
      </div>
    </header>
  );
}
