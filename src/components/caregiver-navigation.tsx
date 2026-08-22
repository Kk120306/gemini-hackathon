import Link from "next/link";

import { CheckIcon } from "@/components/icons";

const steps = [
  { label: "Profile", href: "/caregiver/profile" },
  { label: "Room", href: "/caregiver/room" },
  { label: "Verify", href: "/caregiver/world-model" },
  { label: "Guide", href: "/caregiver/guide" },
  { label: "Lesson", href: "/caregiver/lesson" },
] as const;

export function CaregiverNavigation() {
  return (
    <nav className="caregiver-nav" aria-label="Caregiver setup steps">
      <ol>
        {steps.map((step, index) => (
          <li key={step.href}>
            <Link href={step.href}>
              <span className="caregiver-nav__number">
                {index === 0 ? <CheckIcon /> : index + 1}
              </span>
              <span>{step.label}</span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
