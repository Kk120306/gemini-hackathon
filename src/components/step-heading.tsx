import type { ReactNode } from "react";

type StepHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
};

export function StepHeading({
  eyebrow,
  title,
  description,
  aside,
}: StepHeadingProps) {
  return (
    <div className="step-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="step-heading__description">{description}</p>
      </div>
      {aside}
    </div>
  );
}
