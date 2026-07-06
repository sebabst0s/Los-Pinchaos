"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity";
import { SHOPPING_CATEGORIES } from "@/lib/constants";
import { useParticipant } from "@/lib/participant-context";
import type { ShoppingCategory } from "@/lib/database.types";

export function AddItemForm({ onAdded }: { onAdded: () => void }) {
  const { participant: me } = useParticipant();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ShoppingCategory>("comida");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !me) return;

    setSubmitting(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("shopping_items")
      .insert({ name: name.trim(), category, added_by: me.id })
      .select()
      .single();

    if (!error && data) {
      await logActivity(supabase, {
        participantId: me.id,
        actionType: "shopping_item_added",
        description: `${me.name} agregó "${data.name}" a la lista de compras`,
      });
      setName("");
      onAdded();
    }

    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Agregar algo a la lista..."
        maxLength={60}
        className="flex-1 rounded-xl border border-cyan-900/15 bg-transparent px-3 py-2 text-sm text-cyan-900 outline-none placeholder:text-cyan-800/40 focus:border-orange-400 dark:text-cyan-50"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as ShoppingCategory)}
        className="rounded-xl border border-cyan-900/15 bg-transparent px-2 py-2 text-sm text-cyan-900 outline-none focus:border-orange-400 dark:text-cyan-50 dark:[&>option]:text-cyan-950"
      >
        {SHOPPING_CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={submitting || !name.trim()}
        className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-40"
      >
        +
      </button>
    </form>
  );
}
