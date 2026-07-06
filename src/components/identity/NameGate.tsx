"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParticipant } from "@/lib/participant-context";
import { logActivity } from "@/lib/activity";
import { Avatar } from "@/components/ui/Avatar";
import type { Database } from "@/lib/database.types";

type Participant = Database["public"]["Tables"]["participants"]["Row"];

export function NameGate() {
  const { setParticipant } = useParticipant();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("participants")
      .select("*")
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setParticipants(data ?? []);
        setLoading(false);
      });
  }, []);

  async function handleSelect(p: Participant) {
    setParticipant({ id: p.id, name: p.name, avatarUrl: p.avatar_url });
  }

  async function handleAddNew(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("participants")
      .insert({ name })
      .select()
      .single();

    if (error) {
      // Si ya existe alguien con ese nombre, lo tratamos como selección.
      if (error.code === "23505") {
        const existing = participants.find(
          (p) => p.name.toLowerCase() === name.toLowerCase()
        );
        if (existing) {
          setParticipant({
            id: existing.id,
            name: existing.name,
            avatarUrl: existing.avatar_url,
          });
          setSubmitting(false);
          return;
        }
      }
      setError("No se pudo agregar el nombre. Intenta de nuevo.");
      setSubmitting(false);
      return;
    }

    await logActivity(supabase, {
      participantId: data.id,
      actionType: "participant_joined",
      description: `${data.name} se unió al viaje`,
    });

    setParticipant({ id: data.id, name: data.name, avatarUrl: data.avatar_url });
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyan-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-[var(--background)] p-6 shadow-2xl ring-1 ring-black/5 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mb-2 text-4xl">🏖️</div>
          <h1 className="text-xl font-bold text-cyan-900 dark:text-cyan-100">
            ¿Quién sos?
          </h1>
          <p className="mt-1 text-sm text-cyan-800/70 dark:text-cyan-200/70">
            Elegí tu nombre para entrar al viaje
          </p>
        </div>

        {loading ? (
          <p className="text-center text-sm text-cyan-800/60">Cargando...</p>
        ) : (
          <div className="mb-6 flex max-h-56 flex-col gap-2 overflow-y-auto">
            {participants.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelect(p)}
                className="flex items-center gap-3 rounded-xl border border-cyan-900/10 bg-cyan-50 px-4 py-3 text-left font-medium text-cyan-900 transition hover:bg-cyan-100 active:scale-[0.99] dark:bg-cyan-900/30 dark:text-cyan-50 dark:hover:bg-cyan-900/50"
              >
                <Avatar name={p.name} avatarUrl={p.avatar_url} size={32} />
                {p.name}
              </button>
            ))}
            {participants.length === 0 && (
              <p className="text-center text-sm text-cyan-800/60">
                Todavía no hay nadie. ¡Sé el primero!
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleAddNew} className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="No estoy en la lista..."
            maxLength={40}
            className="flex-1 rounded-xl border border-cyan-900/15 bg-transparent px-4 py-3 text-sm text-cyan-900 outline-none placeholder:text-cyan-800/40 focus:border-orange-400 dark:text-cyan-50"
          />
          <button
            type="submit"
            disabled={submitting || !newName.trim()}
            className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-40"
          >
            Unirme
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
