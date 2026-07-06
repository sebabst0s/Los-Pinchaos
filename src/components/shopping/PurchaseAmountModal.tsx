"use client";

import { useState } from "react";
import type { Database } from "@/lib/database.types";

type ShoppingItem = Database["public"]["Tables"]["shopping_items"]["Row"];

export function PurchaseAmountModal({
  item,
  submitting,
  onConfirm,
  onCancel,
}: {
  item: ShoppingItem;
  submitting: boolean;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = Math.round(Number(amount));
    if (!numericAmount || numericAmount <= 0) return;
    onConfirm(numericAmount);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyan-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-[var(--background)] p-6 shadow-2xl ring-1 ring-black/5">
        <h2 className="text-lg font-bold text-cyan-900 dark:text-cyan-50">
          ¿Cuánto gastaste?
        </h2>
        <p className="mt-1 text-sm text-cyan-800/60 dark:text-cyan-200/60">
          {item.name} — esto va a crear un gasto dividido entre todos.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <input
            type="number"
            inputMode="numeric"
            autoFocus
            placeholder="Monto (CLP)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={0}
            className="rounded-xl border border-cyan-900/15 bg-transparent px-3 py-2 text-sm text-cyan-900 outline-none placeholder:text-cyan-800/40 focus:border-orange-400 dark:text-cyan-50"
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
              disabled={submitting || !amount}
              className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-40"
            >
              {submitting ? "Guardando..." : "Confirmar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
