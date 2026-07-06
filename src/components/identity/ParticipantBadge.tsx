"use client";

import { useEffect, useState } from "react";
import { useParticipant } from "@/lib/participant-context";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";

export function ParticipantBadge() {
  const { participant, clearParticipant } = useParticipant();
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(
    participant?.avatarUrl
  );

  useEffect(() => {
    if (!participant) return;
    // Refresca el avatar por si se subió después de haber elegido el nombre.
    const supabase = createClient();
    supabase
      .from("participants")
      .select("avatar_url")
      .eq("id", participant.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setAvatarUrl(data.avatar_url);
      });
  }, [participant]);

  if (!participant) return null;

  return (
    <button
      onClick={() => {
        if (confirm("¿Cambiar de usuario?")) clearParticipant();
      }}
      className="flex items-center gap-1.5 rounded-full bg-white/60 py-1 pl-1 pr-3 text-xs font-medium text-cyan-900 shadow-sm transition hover:bg-white/80 dark:bg-white/10 dark:text-cyan-50 dark:hover:bg-white/20"
      title="Cambiar de usuario"
    >
      <Avatar name={participant.name} avatarUrl={avatarUrl} size={20} />
      {participant.name}
    </button>
  );
}
