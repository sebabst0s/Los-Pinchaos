"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity";
import { splitEqually } from "@/lib/expenses";
import { formatCurrency } from "@/lib/format";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { useParticipant } from "@/lib/participant-context";
import { Avatar } from "@/components/ui/Avatar";
import type { Database, ExpenseCategory } from "@/lib/database.types";

type Participant = Database["public"]["Tables"]["participants"]["Row"];

export function ExpenseForm({
  participants,
  onSaved,
  onCancel,
}: {
  participants: Participant[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { participant: me } = useParticipant();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("comida");
  const [paidBy, setPaidBy] = useState(me?.id ?? "");
  const [involved, setInvolved] = useState<Set<string>>(
    new Set(participants.map((p) => p.id))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleInvolved(id: string) {
    setInvolved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const numericAmount = Math.round(Number(amount));
    if (!description.trim() || !numericAmount || numericAmount <= 0 || !paidBy) {
      setError("Completa descripción, monto y quién pagó.");
      return;
    }
    if (involved.size === 0) {
      setError("Selecciona al menos una persona para dividir el gasto.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    const { data: expense, error: expenseError } = await supabase
      .from("expenses")
      .insert({
        description: description.trim(),
        amount: numericAmount,
        category,
        paid_by: paidBy,
      })
      .select()
      .single();

    if (expenseError || !expense) {
      setError("No se pudo guardar el gasto.");
      setSubmitting(false);
      return;
    }

    const involvedIds = Array.from(involved);
    const shares = splitEqually(numericAmount, involvedIds.length);
    const { error: splitsError } = await supabase.from("expense_splits").insert(
      involvedIds.map((participantId, i) => ({
        expense_id: expense.id,
        participant_id: participantId,
        amount: shares[i],
      }))
    );

    if (splitsError) {
      setError("El gasto se guardó pero no se pudo dividir. Intenta de nuevo.");
      setSubmitting(false);
      return;
    }

    const payerName = participants.find((p) => p.id === paidBy)?.name ?? "Alguien";
    await logActivity(supabase, {
      participantId: me?.id ?? null,
      actionType: "expense_added",
      description: `${payerName} agregó un gasto: ${description.trim()} (${formatCurrency(
        numericAmount
      )})`,
    });

    setSubmitting(false);
    onSaved();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl bg-white/60 p-4 shadow-sm dark:bg-white/10"
    >
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Descripción (ej: Asado)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={80}
          className="col-span-2 rounded-xl border border-cyan-900/15 bg-transparent px-3 py-2 text-sm text-cyan-900 outline-none placeholder:text-cyan-800/40 focus:border-orange-400 dark:text-cyan-50"
        />
        <input
          type="number"
          inputMode="numeric"
          placeholder="Monto (CLP)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={0}
          className="rounded-xl border border-cyan-900/15 bg-transparent px-3 py-2 text-sm text-cyan-900 outline-none placeholder:text-cyan-800/40 focus:border-orange-400 dark:text-cyan-50"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          className="rounded-xl border border-cyan-900/15 bg-transparent px-3 py-2 text-sm text-cyan-900 outline-none focus:border-orange-400 dark:text-cyan-50 dark:[&>option]:text-cyan-950"
        >
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-cyan-800/70 dark:text-cyan-200/70">
          ¿Quién pagó?
        </label>
        <select
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          className="w-full rounded-xl border border-cyan-900/15 bg-transparent px-3 py-2 text-sm text-cyan-900 outline-none focus:border-orange-400 dark:text-cyan-50 dark:[&>option]:text-cyan-950"
        >
          <option value="">Seleccionar...</option>
          {participants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-cyan-800/70 dark:text-cyan-200/70">
          Dividir entre
        </label>
        <div className="flex flex-wrap gap-2">
          {participants.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => toggleInvolved(p.id)}
              className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-xs font-medium transition ${
                involved.has(p.id)
                  ? "bg-cyan-600 text-white"
                  : "bg-cyan-900/10 text-cyan-800/60 dark:bg-white/10 dark:text-cyan-200/60"
              }`}
            >
              <Avatar name={p.name} avatarUrl={p.avatar_url} size={18} />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2 text-sm font-medium text-cyan-800/70 hover:bg-cyan-900/5 dark:text-cyan-200/70"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-40"
        >
          {submitting ? "Guardando..." : "Guardar gasto"}
        </button>
      </div>
    </form>
  );
}
