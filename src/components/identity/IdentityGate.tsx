"use client";

import { useParticipant } from "@/lib/participant-context";
import { NameGate } from "@/components/identity/NameGate";

export function IdentityGate() {
  const { isLoaded, participant } = useParticipant();

  if (!isLoaded || participant) return null;

  return <NameGate />;
}
