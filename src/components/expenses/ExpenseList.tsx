"use client";

import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/format";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { Avatar } from "@/components/ui/Avatar";
import type { Database } from "@/lib/database.types";

type Expense = Database["public"]["Tables"]["expenses"]["Row"];
type Participant = Database["public"]["Tables"]["participants"]["Row"];

const CATEGORY_ICON: Record<string, string> = {
  comida: "🍔",
  alojamiento: "🏠",
  transporte: "🚗",
  actividades: "🎉",
  otros: "🧾",
};

export function ExpenseList({
  expenses,
  participants,
  onDeleted,
}: {
  expenses: Expense[];
  participants: Participant[];
  onDeleted: () => void;
}) {
  const participantById = new Map(participants.map((p) => [p.id, p]));

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este gasto?")) return;
    const supabase = createClient();
    await supabase.from("expenses").delete().eq("id", id);
    onDeleted();
  }

  if (expenses.length === 0) {
    return (
      <p className="text-center text-sm text-cyan-800/60 dark:text-cyan-200/60">
        Todavía no hay gastos registrados.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {expenses.map((e) => {
        const payer = participantById.get(e.paid_by);
        return (
        <li
          key={e.id}
          className="flex items-center justify-between rounded-2xl bg-white/60 px-4 py-3 shadow-sm dark:bg-white/10"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{CATEGORY_ICON[e.category] ?? "🧾"}</span>
            {payer && <Avatar name={payer.name} avatarUrl={payer.avatar_url} size={28} />}
            <div>
              <p className="text-sm font-medium text-cyan-900 dark:text-cyan-50">
                {e.description}
              </p>
              <p className="text-xs text-cyan-800/60 dark:text-cyan-200/60">
                Pagó {payer?.name ?? "?"} ·{" "}
                {EXPENSE_CATEGORIES.find((c) => c.value === e.category)?.label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-cyan-900 dark:text-cyan-50">
              {formatCurrency(Number(e.amount))}
            </span>
            <button
              onClick={() => handleDelete(e.id)}
              className="text-cyan-800/40 hover:text-red-500 dark:text-cyan-200/40"
              title="Eliminar gasto"
            >
              ✕
            </button>
          </div>
        </li>
        );
      })}
    </ul>
  );
}
