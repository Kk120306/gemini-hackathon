"use client";

import { useRouter } from "next/navigation";

import { ArrowRightIcon } from "@/components/icons";
import { useAnchorState } from "@/components/anchor-state-provider";

export function CaregiverStartAction() {
  const router = useRouter();
  const { beginCaregiverReview } = useAnchorState();

  function startReview() {
    beginCaregiverReview();
    router.push("/caregiver/profile");
  }

  return (
    <button className="primary-button" type="button" onClick={startReview}>
      Begin caregiver setup
      <ArrowRightIcon />
    </button>
  );
}
