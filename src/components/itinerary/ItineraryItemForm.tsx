"use client";

import { useState } from "react";
import type { Database } from "@/lib/database.types";

type ItineraryItem = Database["public"]["Tables"]["itinerary_items"]["Row"];

export function ItineraryItemForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: {
  initial?: Pick<ItineraryItem, "time" | "title" | "description">;
  submitting: boolean;
  onSubmit: (values: { time: string | null; title: string; description: string | null }) => void;
  onCancel: () => void;
}) {
  const [time, setTime] = useState(initial?.time?.slice(0, 5) ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      time: time || null,
      title: title.trim(),
      description: description.trim() || null,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl bg-white/60 p-4 shadow-sm dark:bg-white/10"
    >
      <div className="grid grid-cols-[auto_1fr] gap-3">
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="rounded-xl border border-cyan-900/15 bg-transparent px-3 py-2 text-sm text-cyan-900 outline-none focus:border-orange-400 dark:text-cyan-50"
        />
        <input
          type="text"
          autoFocus
          placeholder="¿Qué vamos a hacer?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          className="rounded-xl border border-cyan-900/15 bg-transparent px-3 py-2 text-sm text-cyan-900 outline-none placeholder:text-cyan-800/40 focus:border-orange-400 dark:text-cyan-50"
        />
      </div>
      <textarea
        placeholder="Detalles (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={280}
        rows={2}
        className="resize-none rounded-xl border border-cyan-900/15 bg-transparent px-3 py-2 text-sm text-cyan-900 outline-none placeholder:text-cyan-800/40 focus:border-orange-400 dark:text-cyan-50"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2 text-sm font-medium text-cyan-800/70 hover:bg-cyan-900/5 dark:text-cyan-200/70"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-40"
        >
          {submitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
