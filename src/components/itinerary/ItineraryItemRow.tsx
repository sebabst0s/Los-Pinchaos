"use client";

import { useState } from "react";
import { ItineraryItemForm } from "@/components/itinerary/ItineraryItemForm";
import type { Database } from "@/lib/database.types";

type ItineraryItem = Database["public"]["Tables"]["itinerary_items"]["Row"];
type Participant = Database["public"]["Tables"]["participants"]["Row"];

export function ItineraryItemRow({
  item,
  createdBy,
  onSave,
  onDelete,
}: {
  item: ItineraryItem;
  createdBy?: Participant;
  onSave: (values: { time: string | null; title: string; description: string | null }) => Promise<void>;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (editing) {
    return (
      <ItineraryItemForm
        initial={item}
        submitting={submitting}
        onCancel={() => setEditing(false)}
        onSubmit={async (values) => {
          setSubmitting(true);
          await onSave(values);
          setSubmitting(false);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white/60 px-4 py-3 shadow-sm dark:bg-white/10">
      <div className="w-14 shrink-0 pt-0.5 text-sm font-semibold text-orange-600 dark:text-orange-400">
        {item.time ? item.time.slice(0, 5) : "—"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-cyan-900 dark:text-cyan-50">{item.title}</p>
        {item.description && (
          <p className="mt-0.5 text-sm text-cyan-800/70 dark:text-cyan-200/70">
            {item.description}
          </p>
        )}
        {createdBy && (
          <p className="mt-1 text-xs text-cyan-800/50 dark:text-cyan-200/50">
            Agregado por {createdBy.name}
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          onClick={() => setEditing(true)}
          className="rounded-lg px-2 py-1 text-xs text-cyan-800/50 hover:bg-cyan-900/5 hover:text-cyan-900 dark:text-cyan-200/50 dark:hover:text-cyan-50"
          title="Editar"
        >
          ✏️
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg px-2 py-1 text-xs text-cyan-800/50 hover:bg-red-500/10 hover:text-red-500 dark:text-cyan-200/50"
          title="Eliminar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
