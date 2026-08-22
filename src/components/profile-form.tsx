"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useAnchorState } from "@/components/anchor-state-provider";
import { ArrowRightIcon, ShieldIcon } from "@/components/icons";

export function ProfileForm() {
  const router = useRouter();
  const { state, saveProfile } = useAnchorState();
  const [firstName, setFirstName] = useState(state.patient.firstName);
  const [roomName, setRoomName] = useState(state.room.name);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveProfile(firstName, roomName);
    router.push("/caregiver/room");
  }

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div className="panel__header">
        <h2>Patient and room</h2>
        <span className="status-chip">Fixture filled</span>
      </div>
      <div className="panel__body">
        <div className="field-grid">
          <div className="field">
            <label htmlFor="patient-name">Preferred first name</label>
            <input
              id="patient-name"
              name="patient-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              autoComplete="off"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="room-name">Room name</label>
            <input
              id="room-name"
              name="room-name"
              value={roomName}
              onChange={(event) => setRoomName(event.target.value)}
              autoComplete="off"
              required
            />
          </div>
        </div>

        <div className="privacy-callout">
          <ShieldIcon />
          <p>
            ANCHOR stores fixture data on this device and does not need an
            address, diagnosis, medication list, or health record.
          </p>
        </div>

        <div className="form-actions">
          <Link className="quiet-button" href="/caregiver">
            Back
          </Link>
          <button className="primary-button" type="submit">
            Save and continue
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </form>
  );
}
