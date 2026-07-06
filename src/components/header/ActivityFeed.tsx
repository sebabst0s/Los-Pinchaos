"use client";

import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import type { Database } from "@/lib/database.types";

type ActivityRow = Database["public"]["Tables"]["activity_log"]["Row"];
type Participant = Database["public"]["Tables"]["participants"]["Row"];

export function ActivityFeed() {
  const [latest, setLatest] = useState<ActivityRow | null>(null);
  const [participantsById, setParticipantsById] = useState<
    Map<string, Participant>
  >(new Map());

  const fetchLatest = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) setLatest(data);
  }, []);

  useEffect(() => {
    fetchLatest();

    const supabase = createClient();
    supabase
      .from("participants")
      .select("*")
      .then(({ data }) => {
        if (data) setParticipantsById(new Map(data.map((p) => [p.id, p])));
      });

    const channel = supabase
      .channel("activity_log_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_log" },
        (payload) => setLatest(payload.new as ActivityRow)
      )
      .subscribe();

    // Red de seguridad por si el realtime se corta (wifi de playa, etc).
    const interval = setInterval(fetchLatest, 30_000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchLatest]);

  if (!latest) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-white/60 px-4 py-2.5 text-sm text-cyan-800/60 shadow-sm dark:bg-white/10 dark:text-cyan-200/60">
        <span>💬</span>
        <span>Todavía no hay actividad</span>
      </div>
    );
  }

  const author = latest.participant_id
    ? participantsById.get(latest.participant_id)
    : undefined;

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/60 px-4 py-2.5 text-sm shadow-sm dark:bg-white/10">
      {author ? (
        <Avatar name={author.name} avatarUrl={author.avatar_url} size={20} />
      ) : (
        <span>💬</span>
      )}
      <span className="text-cyan-900 dark:text-cyan-50">{latest.description}</span>
      <span className="text-cyan-800/50 dark:text-cyan-200/50">
        ·{" "}
        {formatDistanceToNow(new Date(latest.created_at), {
          locale: es,
          addSuffix: true,
        })}
      </span>
    </div>
  );
}
